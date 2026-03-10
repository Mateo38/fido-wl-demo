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

  async create(data: { user_id: string; iban: string; bic: string; account_type: string; balance: number; label: string }) {
    const { rows } = await pool.query(
      `INSERT INTO accounts (user_id, iban, bic, account_type, balance, label)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [data.user_id, data.iban, data.bic, data.account_type, data.balance, data.label]
    );
    return rows[0];
  },

  async updateBalance(id: string, amount: number) {
    const { rows } = await pool.query(
      'UPDATE accounts SET balance = balance + $1 WHERE id = $2 RETURNING *',
      [amount, id]
    );
    return rows[0];
  },

  async deleteByUserId(userId: string) {
    await pool.query('DELETE FROM transactions WHERE account_id IN (SELECT id FROM accounts WHERE user_id = $1)', [userId]);
    await pool.query('DELETE FROM cards WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM accounts WHERE user_id = $1', [userId]);
  },
};
