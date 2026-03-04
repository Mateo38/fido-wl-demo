import pool from '../db/pool';

export const activityRepository = {
  async create(data: {
    user_id: string | null;
    action: string;
    status: 'success' | 'failure';
    ip_address?: string;
    user_agent?: string;
    details?: Record<string, unknown>;
  }) {
    const { rows } = await pool.query(
      `INSERT INTO activity_logs (user_id, action, status, ip_address, user_agent, details)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [data.user_id, data.action, data.status, data.ip_address || null, data.user_agent || null, data.details ? JSON.stringify(data.details) : null]
    );
    return rows[0];
  },

  async findAll(options?: {
    action?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const params: (string | number)[] = [];
    let where = '';
    let paramIndex = 1;

    const conditions: string[] = [];
    if (options?.action) {
      conditions.push(`al.action = $${paramIndex++}`);
      params.push(options.action);
    }
    if (options?.status) {
      conditions.push(`al.status = $${paramIndex++}`);
      params.push(options.status);
    }
    if (conditions.length > 0) {
      where = 'WHERE ' + conditions.join(' AND ');
    }

    const limit = options?.limit || 50;
    const page = options?.page || 1;
    const offset = (page - 1) * limit;

    const countResult = await pool.query(
      `SELECT COUNT(*)::int as total FROM activity_logs al ${where}`,
      params
    );

    params.push(limit, offset);
    const { rows } = await pool.query(
      `SELECT al.*, u.email as user_email, u.first_name as user_first_name, u.last_name as user_last_name
       FROM activity_logs al
       LEFT JOIN users u ON u.id = al.user_id
       ${where}
       ORDER BY al.created_at DESC
       LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      params
    );

    return { rows, total: countResult.rows[0].total };
  },

  async countByAction() {
    const { rows } = await pool.query(
      `SELECT action, status, COUNT(*)::int as count
       FROM activity_logs
       GROUP BY action, status
       ORDER BY count DESC`
    );
    return rows;
  },

  async recentDailyStats(days: number = 30) {
    const { rows } = await pool.query(
      `SELECT
         DATE(created_at) as date,
         COUNT(*) FILTER (WHERE action = 'fido.registration.success')::int as registrations,
         COUNT(*) FILTER (WHERE action LIKE 'fido.authentication%')::int as authentications
       FROM activity_logs
       WHERE created_at >= NOW() - INTERVAL '${days} days'
       GROUP BY DATE(created_at)
       ORDER BY date`
    );
    return rows;
  },

  async totalAuthentications(): Promise<number> {
    const { rows } = await pool.query(
      `SELECT COUNT(*)::int as count FROM activity_logs WHERE action LIKE 'fido.authentication%'`
    );
    return rows[0].count;
  },

  async successRate(): Promise<number> {
    const { rows } = await pool.query(
      `SELECT
         COUNT(*) FILTER (WHERE status = 'success')::float / NULLIF(COUNT(*)::float, 0) * 100 as rate
       FROM activity_logs
       WHERE action LIKE 'fido.%'`
    );
    return rows[0].rate || 0;
  },
};
