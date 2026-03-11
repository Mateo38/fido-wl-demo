import pool from '../db/pool';

export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  role: string;
  status: string;
  phone: string | null;
  must_change_password: boolean;
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

  async findAllClients() {
    const { rows } = await pool.query(`
      SELECT u.*, COUNT(p.id)::int as passkey_count
      FROM users u
      LEFT JOIN passkeys p ON p.user_id = u.id
      WHERE u.role = 'customer'
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);
    return rows;
  },

  async findAllAdmins() {
    const { rows } = await pool.query(`
      SELECT u.*, COUNT(p.id)::int as passkey_count
      FROM users u
      LEFT JOIN passkeys p ON p.user_id = u.id
      WHERE u.role IN ('super_admin', 'admin', 'supervisor', 'operator')
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `);
    return rows;
  },

  async updateRole(id: string, role: string) {
    const { rows } = await pool.query(
      'UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [role, id]
    );
    return rows[0] as UserRow | undefined;
  },

  async deleteAdmin(id: string) {
    const { rowCount } = await pool.query(
      "DELETE FROM users WHERE id = $1 AND role IN ('admin', 'supervisor', 'operator')",
      [id]
    );
    return (rowCount ?? 0) > 0;
  },

  async create(data: { email: string; password_hash: string; first_name: string; last_name: string; role: string; status: string; phone?: string; must_change_password?: boolean }) {
    const { rows } = await pool.query(
      `INSERT INTO users (email, password_hash, first_name, last_name, role, status, phone, must_change_password)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [data.email, data.password_hash, data.first_name, data.last_name, data.role, data.status, data.phone || null, data.must_change_password ?? false]
    );
    return rows[0] as UserRow;
  },

  async updatePassword(id: string, password_hash: string, must_change_password = false) {
    const { rows } = await pool.query(
      'UPDATE users SET password_hash = $1, must_change_password = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
      [password_hash, must_change_password, id]
    );
    return rows[0] as UserRow | undefined;
  },

  async updateStatus(id: string, status: string) {
    const { rows } = await pool.query(
      'UPDATE users SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
      [status, id]
    );
    return rows[0] as UserRow | undefined;
  },

  async delete(id: string) {
    const { rowCount } = await pool.query(
      "DELETE FROM users WHERE id = $1 AND role = 'customer'",
      [id]
    );
    return (rowCount ?? 0) > 0;
  },

  async count(): Promise<number> {
    const { rows } = await pool.query('SELECT COUNT(*)::int as count FROM users');
    return rows[0].count;
  },
};
