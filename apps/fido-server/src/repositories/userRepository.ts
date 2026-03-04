import pool from '../db/pool';

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: Date;
  updated_at: Date;
}

export const userRepository = {
  async findByEmail(email: string): Promise<UserRow | null> {
    const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return rows[0] || null;
  },

  async findById(id: string): Promise<UserRow | null> {
    const { rows } = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return rows[0] || null;
  },

  async findAll() {
    const { rows } = await pool.query(`
      SELECT u.*, COUNT(p.id)::int as passkey_count
      FROM users u
      LEFT JOIN passkeys p ON p.user_id = u.id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);
    return rows;
  },

  async count(): Promise<number> {
    const { rows } = await pool.query('SELECT COUNT(*)::int as count FROM users');
    return rows[0].count;
  },
};
