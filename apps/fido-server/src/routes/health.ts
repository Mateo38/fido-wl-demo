import { Router, Request, Response } from 'express';
import pool from '../db/pool';

const router = Router();
const startTime = Date.now();

router.get('/health', async (_req: Request, res: Response) => {
  try {
    const dbStart = Date.now();
    await pool.query('SELECT 1');
    const dbLatency = Date.now() - dbStart;

    const memUsage = process.memoryUsage();

    res.json({
      success: true,
      data: {
        status: 'healthy',
        uptime: Math.floor((Date.now() - startTime) / 1000),
        database: {
          connected: true,
          latency: dbLatency,
        },
        memory: {
          used: Math.round(memUsage.heapUsed / 1024 / 1024),
          total: Math.round(memUsage.heapTotal / 1024 / 1024),
          percentage: Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100),
        },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err) {
    res.status(503).json({
      success: true,
      data: {
        status: 'unhealthy',
        uptime: Math.floor((Date.now() - startTime) / 1000),
        database: { connected: false, latency: -1 },
        memory: {
          used: 0,
          total: 0,
          percentage: 0,
        },
        timestamp: new Date().toISOString(),
      },
    });
  }
});

export default router;
