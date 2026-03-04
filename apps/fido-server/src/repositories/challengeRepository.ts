import pool from '../db/pool';

export const challengeRepository = {
  async create(data: {
    user_id: string | null;
    challenge: string;
    type: 'registration' | 'authentication';
  }) {
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min
    const { rows } = await pool.query(
      `INSERT INTO challenges (user_id, challenge, type, expires_at)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [data.user_id, data.challenge, data.type, expiresAt]
    );
    return rows[0];
  },

  async findValidChallenge(challenge: string, type: string) {
    const { rows } = await pool.query(
      `SELECT * FROM challenges WHERE challenge = $1 AND type = $2 AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [challenge, type]
    );
    return rows[0] || null;
  },

  async delete(id: string) {
    await pool.query('DELETE FROM challenges WHERE id = $1', [id]);
  },

  async cleanup() {
    await pool.query('DELETE FROM challenges WHERE expires_at < NOW()');
  },
};
