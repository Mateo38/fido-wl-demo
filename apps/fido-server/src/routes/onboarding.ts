import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { userRepository } from '../repositories/userRepository';
import { activityRepository } from '../repositories/activityRepository';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { email, first_name, last_name } = req.body;

    if (!email || !first_name || !last_name) {
      return res.status(400).json({ success: false, error: 'Email, first_name and last_name are required' });
    }

    const existing = await userRepository.findByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, error: 'Email already exists' });
    }

    const tempPassword = crypto.randomUUID();
    const password_hash = await bcrypt.hash(tempPassword, 10);

    const user = await userRepository.create({
      email,
      password_hash,
      first_name,
      last_name,
      role: 'customer',
      status: 'onboarding-tovalidate',
      must_change_password: true,
    });

    await activityRepository.create({
      user_id: user.id,
      action: 'onboarding.created',
      status: 'success',
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      details: { email },
    });

    res.status(201).json({ success: true });
  } catch (err) {
    console.error('Onboarding error:', err);
    res.status(500).json({ success: false, error: 'Failed to create onboarding request' });
  }
});

export default router;
