import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { authenticateToken, requireAdmin, requirePermission } from '../middleware/auth';
import { userRepository } from '../repositories/userRepository';
import { passkeyRepository } from '../repositories/passkeyRepository';
import { activityRepository } from '../repositories/activityRepository';

const router = Router();

router.use(authenticateToken);

const DEFAULT_ADMIN_PASSWORD = 'azerty123';

// Dashboard metrics
router.get('/dashboard', requirePermission('dashboard:read'), async (_req: Request, res: Response) => {
  try {
    const [totalUsers, totalPasskeys, totalAuthentications, successRate, recentActivity, passkeysByDevice] =
      await Promise.all([
        userRepository.count(),
        passkeyRepository.count(),
        activityRepository.totalAuthentications(),
        activityRepository.successRate(),
        activityRepository.recentDailyStats(30),
        passkeyRepository.countByDevice(),
      ]);

    res.json({
      success: true,
      data: {
        totalUsers,
        totalPasskeys,
        totalAuthentications,
        successRate: Math.round(successRate * 100) / 100,
        recentActivity,
        passkeysByDevice,
      },
    });
  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ success: false, error: 'Failed to get dashboard data' });
  }
});

// Users list (admins)
router.get('/users', requirePermission('admins:read'), async (_req: Request, res: Response) => {
  try {
    const users = await userRepository.findAllAdmins();
    res.json({
      success: true,
      data: users.map((u: any) => ({
        id: u.id,
        email: u.email,
        first_name: u.first_name,
        last_name: u.last_name,
        role: u.role,
        passkey_count: u.passkey_count,
        created_at: u.created_at,
      })),
    });
  } catch (err) {
    console.error('Users error:', err);
    res.status(500).json({ success: false, error: 'Failed to get users' });
  }
});

// Create admin user
router.post('/users', requirePermission('admins:write'), async (req: Request, res: Response) => {
  try {
    const { email, first_name, last_name, role } = req.body;

    if (!email || !first_name || !last_name || !role) {
      return res.status(400).json({ success: false, error: 'Email, first_name, last_name and role are required' });
    }

    if (!['admin', 'supervisor', 'operator'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Role must be admin, supervisor or operator' });
    }

    const existing = await userRepository.findByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, error: 'Email already exists' });
    }

    const password_hash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
    const user = await userRepository.create({
      email,
      password_hash,
      first_name,
      last_name,
      role,
      status: 'active',
      must_change_password: true,
    });

    res.status(201).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error('Create admin error:', err);
    res.status(500).json({ success: false, error: 'Failed to create admin' });
  }
});

// Change admin role
router.patch('/users/:id/role', requirePermission('admins:write'), async (req: Request, res: Response) => {
  try {
    const { role } = req.body;

    if (!role || !['admin', 'supervisor', 'operator'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Role must be admin, supervisor or operator' });
    }

    const target = await userRepository.findById(req.params.id);
    if (!target) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (target.role === 'super_admin') {
      return res.status(403).json({ success: false, error: 'Cannot modify super admin' });
    }

    if (target.id === req.user!.userId) {
      return res.status(403).json({ success: false, error: 'Cannot change your own role' });
    }

    const updated = await userRepository.updateRole(req.params.id, role);
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Update role error:', err);
    res.status(500).json({ success: false, error: 'Failed to update role' });
  }
});

// Reset admin password
router.patch('/users/:id/reset-password', requirePermission('admins:write'), async (req: Request, res: Response) => {
  try {
    const target = await userRepository.findById(req.params.id);
    if (!target) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (target.role === 'super_admin') {
      return res.status(403).json({ success: false, error: 'Cannot reset super admin password' });
    }

    const password_hash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);
    await userRepository.updatePassword(req.params.id, password_hash, true);
    res.json({ success: true });
  } catch (err) {
    console.error('Reset admin password error:', err);
    res.status(500).json({ success: false, error: 'Failed to reset password' });
  }
});

// Delete admin
router.delete('/users/:id', requirePermission('admins:write'), async (req: Request, res: Response) => {
  try {
    const target = await userRepository.findById(req.params.id);
    if (!target) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    if (target.role === 'super_admin') {
      return res.status(403).json({ success: false, error: 'Cannot delete super admin' });
    }

    const deleted = await userRepository.deleteAdmin(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Admin not found' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Delete admin error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete admin' });
  }
});

// Activity logs
router.get('/logs', requirePermission('logs:read'), async (req: Request, res: Response) => {
  try {
    const { action, status, page, limit } = req.query;
    const result = await activityRepository.findAll({
      action: action as string,
      status: status as string,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 50,
    });

    res.json({
      success: true,
      data: result.rows,
      total: result.total,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 50,
      totalPages: Math.ceil(result.total / (limit ? parseInt(limit as string) : 50)),
    });
  } catch (err) {
    console.error('Logs error:', err);
    res.status(500).json({ success: false, error: 'Failed to get logs' });
  }
});

// Verify admin password (for sensitive actions)
router.post('/verify-password', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ success: false, error: 'Password required' });
    }

    const user = await userRepository.findById(req.user!.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, error: 'Invalid password' });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Verify password error:', err);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
