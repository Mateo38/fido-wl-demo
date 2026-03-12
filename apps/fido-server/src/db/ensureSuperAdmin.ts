import bcrypt from 'bcrypt';
import pool from './pool';

export async function ensureSuperAdmin() {
  const { rows } = await pool.query(
    "SELECT id FROM users WHERE email = 'mathieu.barthelemy@wlbank.fr'"
  );

  if (rows.length > 0) {
    // Ensure role is super_admin
    await pool.query(
      "UPDATE users SET role = 'super_admin' WHERE email = 'mathieu.barthelemy@wlbank.fr'"
    );
    return;
  }

  const password_hash = await bcrypt.hash('adminWL26', 10);
  await pool.query(
    `INSERT INTO users (email, password_hash, first_name, last_name, role, status)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    ['mathieu.barthelemy@wlbank.fr', password_hash, 'Mathieu', 'BARTHELEMY', 'super_admin', 'active']
  );
  console.log('Super admin created: mathieu.barthelemy@wlbank.fr');
}
