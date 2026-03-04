import pool from '../db/pool';

export interface PasskeyRow {
  id: string;
  user_id: string;
  credential_id: string;
  public_key: string;
  counter: number;
  device_type: string;
  backed_up: boolean;
  transports: string[];
  friendly_name: string | null;
  created_at: Date;
  last_used_at: Date | null;
}

export const passkeyRepository = {
  async findByCredentialId(credentialId: string): Promise<PasskeyRow | null> {
    const { rows } = await pool.query('SELECT * FROM passkeys WHERE credential_id = $1', [credentialId]);
    return rows[0] || null;
  },

  async findByUserId(userId: string): Promise<PasskeyRow[]> {
    const { rows } = await pool.query('SELECT * FROM passkeys WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    return rows;
  },

  async create(data: {
    user_id: string;
    credential_id: string;
    public_key: string;
    counter: number;
    device_type: string;
    backed_up: boolean;
    transports: string[];
    friendly_name?: string;
  }): Promise<PasskeyRow> {
    const { rows } = await pool.query(
      `INSERT INTO passkeys (user_id, credential_id, public_key, counter, device_type, backed_up, transports, friendly_name)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [data.user_id, data.credential_id, data.public_key, data.counter, data.device_type, data.backed_up, data.transports, data.friendly_name || null]
    );
    return rows[0];
  },

  async updateCounter(credentialId: string, counter: number): Promise<void> {
    await pool.query(
      'UPDATE passkeys SET counter = $1, last_used_at = NOW() WHERE credential_id = $2',
      [counter, credentialId]
    );
  },

  async delete(id: string, userId: string): Promise<boolean> {
    const { rowCount } = await pool.query('DELETE FROM passkeys WHERE id = $1 AND user_id = $2', [id, userId]);
    return (rowCount ?? 0) > 0;
  },

  async count(): Promise<number> {
    const { rows } = await pool.query('SELECT COUNT(*)::int as count FROM passkeys');
    return rows[0].count;
  },

  async countByDevice() {
    const { rows } = await pool.query(
      'SELECT device_type, COUNT(*)::int as count FROM passkeys GROUP BY device_type'
    );
    return rows;
  },
};
