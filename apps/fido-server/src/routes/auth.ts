import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { userRepository } from '../repositories/userRepository';
import { generateToken, authenticateToken } from '../middleware/auth';
import { activityRepository } from '../repositories/activityRepository';

const router = Router();

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }

    const user = await userRepository.findByEmail(email);
    if (!user) {
      await activityRepository.create({
        user_id: null,
        action: 'auth.login.failure',
        status: 'failure',
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
        details: { email, reason: 'user_not_found' },
      });
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      await activityRepository.create({
        user_id: user.id,
        action: 'auth.login.failure',
        status: 'failure',
        ip_address: req.ip,
        user_agent: req.headers['user-agent'],
        details: { reason: 'invalid_password' },
      });
      return res.status(401).json({ success: false, error: 'Invalid credentials' });
    }

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    await activityRepository.create({
      user_id: user.id,
      action: 'auth.login.success',
      status: 'success',
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
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
    console.error('Login error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = await userRepository.findById(req.user!.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }
    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
    });
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
