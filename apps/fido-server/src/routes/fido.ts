import { Router, Request, Response } from 'express';
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server';
import type {
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from '@simplewebauthn/server/script/deps';
import { authenticateToken, generateToken } from '../middleware/auth';
import { passkeyRepository } from '../repositories/passkeyRepository';
import { challengeRepository } from '../repositories/challengeRepository';
import { userRepository } from '../repositories/userRepository';
import { activityRepository } from '../repositories/activityRepository';

const router = Router();

const rpName = process.env.RP_NAME || 'WL Bank';
const rpID = process.env.RP_ID || 'localhost';
const origin = process.env.RP_ORIGIN || 'http://localhost:5173';

// --- Registration ---
router.post('/registration/options', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const user = await userRepository.findById(userId);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const existingPasskeys = await passkeyRepository.findByUserId(userId);

    const options = await generateRegistrationOptions({
      rpName,
      rpID,
      userID: new TextEncoder().encode(userId),
      userName: user.email,
      userDisplayName: `${user.first_name} ${user.last_name}`,
      attestationType: 'none',
      excludeCredentials: existingPasskeys.map((pk) => ({
        id: pk.credential_id,
        transports: pk.transports as any,
      })),
      authenticatorSelection: {
        residentKey: 'required',
        userVerification: 'preferred',
      },
    });

    await challengeRepository.create({
      user_id: userId,
      challenge: options.challenge,
      type: 'registration',
    });

    res.json({ success: true, data: options });
  } catch (err) {
    console.error('Registration options error:', err);
    res.status(500).json({ success: false, error: 'Failed to generate registration options' });
  }
});

router.post('/registration/verify', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const body: RegistrationResponseJSON = req.body.credential;
    const friendlyName: string = req.body.friendlyName || 'My Passkey';

    const challengeRow = await challengeRepository.findValidChallenge(
      req.body.challenge,
      'registration'
    );
    if (!challengeRow) {
      await activityRepository.create({
        user_id: userId,
        action: 'fido.registration.failure',
        status: 'failure',
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
        details: { reason: 'invalid_challenge' },
      });
      return res.status(400).json({ success: false, error: 'Invalid or expired challenge' });
    }

    const verification = await verifyRegistrationResponse({
      response: body,
      expectedChallenge: challengeRow.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
    });

    if (!verification.verified || !verification.registrationInfo) {
      await activityRepository.create({
        user_id: userId,
        action: 'fido.registration.failure',
        status: 'failure',
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
        details: { reason: 'verification_failed' },
      });
      return res.status(400).json({ success: false, error: 'Registration verification failed' });
    }

    const { credentialID, credentialPublicKey, counter, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;

    await passkeyRepository.create({
      user_id: userId,
      credential_id: credentialID,
      public_key: Buffer.from(credentialPublicKey).toString('base64url'),
      counter: counter,
      device_type: credentialDeviceType,
      backed_up: credentialBackedUp,
      transports: (body.response as any).transports || [],
      friendly_name: friendlyName,
    });

    await challengeRepository.delete(challengeRow.id);

    await activityRepository.create({
      user_id: userId,
      action: 'fido.registration.success',
      status: 'success',
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      details: { deviceType: credentialDeviceType, backedUp: credentialBackedUp },
    });

    res.json({ success: true, message: 'Passkey registered successfully' });
  } catch (err) {
    console.error('Registration verify error:', err);
    res.status(500).json({ success: false, error: 'Registration verification failed' });
  }
});

// --- Authentication ---
router.post('/authentication/options', async (req: Request, res: Response) => {
  try {
    const options = await generateAuthenticationOptions({
      rpID,
      userVerification: 'preferred',
    });

    await challengeRepository.create({
      user_id: null,
      challenge: options.challenge,
      type: 'authentication',
    });

    res.json({ success: true, data: options });
  } catch (err) {
    console.error('Authentication options error:', err);
    res.status(500).json({ success: false, error: 'Failed to generate authentication options' });
  }
});

router.post('/authentication/verify', async (req: Request, res: Response) => {
  try {
    const body: AuthenticationResponseJSON = req.body.credential;

    const challengeRow = await challengeRepository.findValidChallenge(
      req.body.challenge,
      'authentication'
    );
    if (!challengeRow) {
      await activityRepository.create({
        user_id: null,
        action: 'fido.authentication.failure',
        status: 'failure',
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
        details: { reason: 'invalid_challenge' },
      });
      return res.status(400).json({ success: false, error: 'Invalid or expired challenge' });
    }

    const passkey = await passkeyRepository.findByCredentialId(body.id);
    if (!passkey) {
      await activityRepository.create({
        user_id: null,
        action: 'fido.authentication.failure',
        status: 'failure',
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
        details: { reason: 'passkey_not_found' },
      });
      return res.status(400).json({ success: false, error: 'Passkey not found' });
    }

    if (passkey.status === 'blocked' || passkey.status === 'revoked') {
      await activityRepository.create({
        user_id: passkey.user_id,
        action: 'fido.authentication.failure',
        status: 'failure',
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
        details: { reason: 'passkey_' + passkey.status },
      });
      return res.status(403).json({ success: false, error: 'passkey_' + passkey.status });
    }

    const verification = await verifyAuthenticationResponse({
      response: body,
      expectedChallenge: challengeRow.challenge,
      expectedOrigin: origin,
      expectedRPID: rpID,
      authenticator: {
        credentialID: passkey.credential_id,
        credentialPublicKey: Buffer.from(passkey.public_key, 'base64url'),
        counter: passkey.counter,
        transports: passkey.transports as any,
      },
    });

    if (!verification.verified) {
      await activityRepository.create({
        user_id: passkey.user_id,
        action: 'fido.authentication.failure',
        status: 'failure',
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
        details: { reason: 'verification_failed' },
      });
      return res.status(400).json({ success: false, error: 'Authentication verification failed' });
    }

    await passkeyRepository.updateCounter(passkey.credential_id, verification.authenticationInfo.newCounter);
    await challengeRepository.delete(challengeRow.id);

    const user = await userRepository.findById(passkey.user_id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    await activityRepository.create({
      user_id: user.id,
      action: 'fido.authentication.success',
      status: 'success',
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      details: { credentialId: passkey.credential_id },
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          created_at: user.created_at,
          updated_at: user.updated_at,
        },
      },
    });
  } catch (err) {
    console.error('Authentication verify error:', err);
    res.status(500).json({ success: false, error: 'Authentication verification failed' });
  }
});

// --- Passkey Management ---
router.get('/passkeys', authenticateToken, async (req: Request, res: Response) => {
  try {
    const passkeys = await passkeyRepository.findByUserId(req.user!.userId);
    res.json({
      success: true,
      data: passkeys.map((pk) => ({
        id: pk.id,
        credential_id: pk.credential_id,
        device_type: pk.device_type,
        backed_up: pk.backed_up,
        transports: pk.transports,
        friendly_name: pk.friendly_name,
        created_at: pk.created_at,
        last_used_at: pk.last_used_at,
      })),
    });
  } catch (err) {
    console.error('Get passkeys error:', err);
    res.status(500).json({ success: false, error: 'Failed to get passkeys' });
  }
});

router.delete('/passkeys/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const deleted = await passkeyRepository.delete(req.params.id, req.user!.userId);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Passkey not found' });
    }

    await activityRepository.create({
      user_id: req.user!.userId,
      action: 'fido.passkey.deleted',
      status: 'success',
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
    });

    res.json({ success: true, message: 'Passkey deleted' });
  } catch (err) {
    console.error('Delete passkey error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete passkey' });
  }
});

export default router;
