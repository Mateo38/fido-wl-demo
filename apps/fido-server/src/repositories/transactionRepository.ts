import pool from '../db/pool';

export const transactionRepository = {
  async findByAccountIds(accountIds: string[], options?: {
    category?: string;
    from?: string;
    to?: string;
    page?: number;
    limit?: number;
  }) {
    if (accountIds.length === 0) return { rows: [], total: 0 };

    const params: unknown[] = [accountIds];
    let where = 'WHERE account_id = ANY($1)';
    let paramIndex = 2;

    if (options?.category) {
      where += ` AND category = $${paramIndex++}`;
      params.push(options.category);
    }
    if (options?.from) {
      where += ` AND date >= $${paramIndex++}`;
      params.push(options.from);
    }
    if (options?.to) {
      where += ` AND date <= $${paramIndex++}`;
      params.push(options.to);
    }

    const limit = options?.limit || 20;
    const page = options?.page || 1;
    const offset = (page - 1) * limit;

    const countResult = await pool.query(
      `SELECT COUNT(*)::int as total FROM transactions ${where}`,
      params
    );

    params.push(limit, offset);
    const { rows } = await pool.query(
      `SELECT * FROM transactions ${where} ORDER BY date DESC LIMIT $${paramIndex++} OFFSET $${paramIndex}`,
      params
    );

    return { rows, total: countResult.rows[0].total };
  },

  async create(data: {
    account_id: string;
    type: string;
    amount: number;
    description: string;
    category: string;
    counterparty: string;
    reference?: string;
    date?: Date;
  }) {
    const { rows } = await pool.query(
      `INSERT INTO transactions (account_id, type, amount, description, category, counterparty, reference, date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [data.account_id, data.type, data.amount, data.description, data.category, data.counterparty, data.reference || null, data.date || new Date()]
    );
    return rows[0];
  },
};
