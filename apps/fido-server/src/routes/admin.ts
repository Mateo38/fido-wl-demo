import { Router, Request, Response } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { userRepository } from '../repositories/userRepository';
import { passkeyRepository } from '../repositories/passkeyRepository';
import { activityRepository } from '../repositories/activityRepository';

const router = Router();

router.use(authenticateToken, requireAdmin);

// Dashboard metrics
router.get('/dashboard', async (_req: Request, res: Response) => {
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

// Users list
router.get('/users', async (_req: Request, res: Response) => {
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

// Activity logs
router.get('/logs', async (req: Request, res: Response) => {
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

export default router;
