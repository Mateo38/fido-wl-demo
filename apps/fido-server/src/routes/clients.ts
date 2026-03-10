import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { userRepository } from '../repositories/userRepository';
import { activityRepository } from '../repositories/activityRepository';

const router = Router();

router.use(authenticateToken, requireAdmin);

const DEFAULT_PASSWORD = 'azerty123';

// List clients
router.get('/', async (_req: Request, res: Response) => {
  try {
    const clients = await userRepository.findAllClients();
    res.json({
      success: true,
      data: clients.map((c: any) => ({
        id: c.id,
        email: c.email,
        first_name: c.first_name,
        last_name: c.last_name,
        phone: c.phone,
        status: c.status,
        passkey_count: c.passkey_count,
        created_at: c.created_at,
      })),
    });
  } catch (err) {
    console.error('List clients error:', err);
    res.status(500).json({ success: false, error: 'Failed to list clients' });
  }
});

// Create client
router.post('/', async (req: Request, res: Response) => {
  try {
    const { email, first_name, last_name, phone } = req.body;

    if (!email || !first_name || !last_name) {
      return res.status(400).json({ success: false, error: 'Email, first_name and last_name are required' });
    }

    const existing = await userRepository.findByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, error: 'Email already exists' });
    }

    const password_hash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    const user = await userRepository.create({
      email,
      password_hash,
      first_name,
      last_name,
      role: 'customer',
      status: 'active',
      phone,
      must_change_password: true,
    });

    await activityRepository.create({
      user_id: req.user!.userId,
      action: 'client.created',
      status: 'success',
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      details: { client_id: user.id, client_email: email },
    });

    res.status(201).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        status: user.status,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error('Create client error:', err);
    res.status(500).json({ success: false, error: 'Failed to create client' });
  }
});

// Update client status (block/activate)
router.patch('/:id/status', async (req: Request, res: Response) => {
  try {
    const { status } = req.body;

    if (!status || !['active', 'blocked'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Status must be active or blocked' });
    }

    const user = await userRepository.findById(req.params.id);
    if (!user || user.role !== 'customer') {
      return res.status(404).json({ success: false, error: 'Client not found' });
    }

    const updated = await userRepository.updateStatus(req.params.id, status);

    await activityRepository.create({
      user_id: req.user!.userId,
      action: status === 'blocked' ? 'client.blocked' : 'client.activated',
      status: 'success',
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      details: { client_id: req.params.id },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Update client status error:', err);
    res.status(500).json({ success: false, error: 'Failed to update client status' });
  }
});

// Reset client password
router.patch('/:id/reset-password', async (req: Request, res: Response) => {
  try {
    const user = await userRepository.findById(req.params.id);
    if (!user || user.role !== 'customer') {
      return res.status(404).json({ success: false, error: 'Client not found' });
    }

    const password_hash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    await userRepository.updatePassword(req.params.id, password_hash, true);

    await activityRepository.create({
      user_id: req.user!.userId,
      action: 'client.password_reset',
      status: 'success',
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      details: { client_id: req.params.id, client_email: user.email },
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Reset client password error:', err);
    res.status(500).json({ success: false, error: 'Failed to reset password' });
  }
});

// Delete client
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const user = await userRepository.findById(req.params.id);
    if (!user || user.role !== 'customer') {
      return res.status(404).json({ success: false, error: 'Client not found' });
    }

    const deleted = await userRepository.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Client not found' });
    }

    await activityRepository.create({
      user_id: req.user!.userId,
      action: 'client.deleted',
      status: 'success',
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      details: { client_id: req.params.id, client_email: user.email },
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Delete client error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete client' });
  }
});

export default router;
