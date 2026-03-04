import pool from './pool';

async function reset() {
  const client = await pool.connect();
  try {
    await client.query(`
      DROP TABLE IF EXISTS activity_logs CASCADE;
      DROP TABLE IF EXISTS beneficiaries CASCADE;
      DROP TABLE IF EXISTS cards CASCADE;
      DROP TABLE IF EXISTS transactions CASCADE;
      DROP TABLE IF EXISTS accounts CASCADE;
      DROP TABLE IF EXISTS challenges CASCADE;
      DROP TABLE IF EXISTS passkeys CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
      DROP TABLE IF EXISTS migrations CASCADE;
    `);
    console.log('All tables dropped successfully.');
  } finally {
    client.release();
    await pool.end();
  }
}

reset().catch((err) => {
  console.error('Reset failed:', err);
  process.exit(1);
});
