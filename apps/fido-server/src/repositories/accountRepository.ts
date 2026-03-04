import pool from '../db/pool';

export const accountRepository = {
  async findByUserId(userId: string) {
    const { rows } = await pool.query('SELECT * FROM accounts WHERE user_id = $1 ORDER BY account_type', [userId]);
    return rows;
  },

  async findById(id: string) {
    const { rows } = await pool.query('SELECT * FROM accounts WHERE id = $1', [id]);
    return rows[0] || null;
  },

  async updateBalance(id: string, amount: number) {
    const { rows } = await pool.query(
      'UPDATE accounts SET balance = balance + $1 WHERE id = $2 RETURNING *',
      [amount, id]
    );
    return rows[0];
  },
};
