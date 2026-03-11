import bcrypt from 'bcrypt';
import pool from './pool';

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Clear existing data
    await client.query('DELETE FROM activity_logs');
    await client.query('DELETE FROM beneficiaries');
    await client.query('DELETE FROM cards');
    await client.query('DELETE FROM transactions');
    await client.query('DELETE FROM accounts');
    await client.query('DELETE FROM challenges');
    await client.query('DELETE FROM passkeys');
    await client.query('DELETE FROM users');

    const customerPasswordHash = await bcrypt.hash('Demo1234!', 10);
    const adminPasswordHash = await bcrypt.hash('Admin1234!', 10);
    const superAdminPasswordHash = await bcrypt.hash('adminWL26', 10);

    // Users
    const { rows: users } = await client.query(`
      INSERT INTO users (id, email, password_hash, first_name, last_name, role, status) VALUES
        ('11111111-1111-1111-1111-111111111111', 'marie.dupont@email.fr', $1, 'Marie', 'Dupont', 'customer', 'active'),
        ('22222222-2222-2222-2222-222222222222', 'jean.martin@email.fr', $1, 'Jean', 'Martin', 'customer', 'active'),
        ('33333333-3333-3333-3333-333333333333', 'sophie.bernard@wlbank.fr', $2, 'Sophie', 'Bernard', 'admin', 'active'),
        ('44444444-4444-4444-4444-444444444444', 'mathieu.barthelemy@wlbank.fr', $3, 'Mathieu', 'BARTHELEMY', 'super_admin', 'active'),
        ('55555555-5555-5555-5555-555555555555', 'paul.lefevre@wlbank.fr', $2, 'Paul', 'Lefevre', 'supervisor', 'active'),
        ('66666666-6666-6666-6666-666666666666', 'claire.moreau@wlbank.fr', $2, 'Claire', 'Moreau', 'operator', 'active')
      RETURNING id, first_name, last_name
    `, [customerPasswordHash, adminPasswordHash, superAdminPasswordHash]);

    console.log(`Created ${users.length} users`);

    // Accounts
    await client.query(`
      INSERT INTO accounts (id, user_id, iban, bic, account_type, balance, label) VALUES
        ('aaaa1111-0000-0000-0000-000000000001', '11111111-1111-1111-1111-111111111111', 'FR7630001007941234567890185', 'WLBKFRPP', 'checking', 4532.87, 'Compte Courant'),
        ('aaaa1111-0000-0000-0000-000000000002', '11111111-1111-1111-1111-111111111111', 'FR7630001007941234567890186', 'WLBKFRPP', 'savings', 15780.50, 'Livret Épargne'),
        ('aaaa2222-0000-0000-0000-000000000001', '22222222-2222-2222-2222-222222222222', 'FR7630001007949876543210185', 'WLBKFRPP', 'checking', 2891.34, 'Compte Courant'),
        ('aaaa2222-0000-0000-0000-000000000002', '22222222-2222-2222-2222-222222222222', 'FR7630001007949876543210186', 'WLBKFRPP', 'savings', 8450.00, 'Livret Épargne')
    `);
    console.log('Created 4 accounts');

    // Cards
    await client.query(`
      INSERT INTO cards (user_id, account_id, card_number_last4, card_network, card_tier, expiry_date, status, daily_limit, monthly_limit) VALUES
        ('11111111-1111-1111-1111-111111111111', 'aaaa1111-0000-0000-0000-000000000001', '4829', 'visa', 'premium', '12/27', 'active', 2000, 8000),
        ('11111111-1111-1111-1111-111111111111', 'aaaa1111-0000-0000-0000-000000000001', '7631', 'mastercard', 'standard', '09/26', 'active', 1000, 5000),
        ('22222222-2222-2222-2222-222222222222', 'aaaa2222-0000-0000-0000-000000000001', '3156', 'visa', 'standard', '03/27', 'active', 1000, 5000),
        ('22222222-2222-2222-2222-222222222222', 'aaaa2222-0000-0000-0000-000000000001', '8492', 'mastercard', 'metal', '06/28', 'active', 5000, 20000)
    `);
    console.log('Created 4 cards');

    // Beneficiaries
    await client.query(`
      INSERT INTO beneficiaries (user_id, name, iban, bic, label) VALUES
        ('11111111-1111-1111-1111-111111111111', 'Jean Martin', 'FR7630001007949876543210185', 'WLBKFRPP', 'Jean'),
        ('11111111-1111-1111-1111-111111111111', 'EDF Énergie', 'FR7630004000031234567890143', 'BNPAFRPP', 'Électricité'),
        ('11111111-1111-1111-1111-111111111111', 'Propriétaire SCI Habitat', 'FR7610107001011234567890129', 'BREDFRPP', 'Loyer'),
        ('22222222-2222-2222-2222-222222222222', 'Marie Dupont', 'FR7630001007941234567890185', 'WLBKFRPP', 'Marie'),
        ('22222222-2222-2222-2222-222222222222', 'Assurance MMA', 'FR7620041010051234567890154', 'PSSTFRPP', 'Assurance auto')
    `);
    console.log('Created 5 beneficiaries');

    // Transactions for Marie Dupont (checking)
    const marieTransactions = generateTransactions('aaaa1111-0000-0000-0000-000000000001', 180);
    for (const t of marieTransactions) {
      await client.query(
        `INSERT INTO transactions (account_id, type, amount, description, category, counterparty, reference, date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [t.account_id, t.type, t.amount, t.description, t.category, t.counterparty, t.reference, t.date]
      );
    }
    console.log(`Created ${marieTransactions.length} transactions for Marie (checking)`);

    // Transactions for Jean Martin (checking)
    const jeanTransactions = generateTransactions('aaaa2222-0000-0000-0000-000000000001', 150);
    for (const t of jeanTransactions) {
      await client.query(
        `INSERT INTO transactions (account_id, type, amount, description, category, counterparty, reference, date)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [t.account_id, t.type, t.amount, t.description, t.category, t.counterparty, t.reference, t.date]
      );
    }
    console.log(`Created ${jeanTransactions.length} transactions for Jean (checking)`);

    // Activity logs (30 days)
    const activityLogs = generateActivityLogs(30);
    for (const log of activityLogs) {
      await client.query(
        `INSERT INTO activity_logs (user_id, action, status, ip_address, user_agent, details, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [log.user_id, log.action, log.status, log.ip_address, log.user_agent, log.details ? JSON.stringify(log.details) : null, log.created_at]
      );
    }
    console.log(`Created ${activityLogs.length} activity logs`);

    await client.query('COMMIT');
    console.log('\nSeed completed successfully!');
    console.log('---');
    console.log('Customer login: marie.dupont@email.fr / Demo1234!');
    console.log('Customer login: jean.martin@email.fr / Demo1234!');
    console.log('Super Admin login: mathieu.barthelemy@wlbank.fr / adminWL26');
    console.log('Admin login: sophie.bernard@wlbank.fr / Admin1234!');
    console.log('Supervisor login: paul.lefevre@wlbank.fr / Admin1234!');
    console.log('Operator login: claire.moreau@wlbank.fr / Admin1234!');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

function generateTransactions(accountId: string, count: number) {
  const templates = [
    // Salary (monthly credit)
    { type: 'credit', amount: [2800, 3200], description: 'Virement salaire', category: 'salary', counterparty: 'ACME Corp SAS', monthly: true },
    // Rent (monthly debit)
    { type: 'debit', amount: [850, 950], description: 'Loyer mensuel', category: 'rent', counterparty: 'SCI Habitat', monthly: true },
    // Groceries
    { type: 'debit', amount: [15, 120], description: 'Courses alimentaires', category: 'groceries', counterparty: ['Carrefour', 'Leclerc', 'Monoprix', 'Lidl', 'Auchan'] },
    // Utilities
    { type: 'debit', amount: [30, 80], description: 'Facture énergie', category: 'utilities', counterparty: ['EDF', 'Engie', 'Veolia'] },
    // Transport
    { type: 'debit', amount: [1.9, 75], description: 'Transport', category: 'transport', counterparty: ['RATP', 'SNCF', 'Uber', 'Bolt', 'TotalEnergies'] },
    // Entertainment
    { type: 'debit', amount: [5, 50], description: 'Loisirs', category: 'entertainment', counterparty: ['UGC Ciné', 'FNAC', 'Pathé', 'Ticketmaster'] },
    // Restaurant
    { type: 'debit', amount: [12, 65], description: 'Restaurant', category: 'restaurant', counterparty: ['Le Petit Bistrot', 'Sushi Shop', 'McDonald\'s', 'Burger King', 'La Brasserie'] },
    // Shopping
    { type: 'debit', amount: [15, 200], description: 'Achat', category: 'shopping', counterparty: ['Amazon', 'Zara', 'H&M', 'Decathlon', 'IKEA'] },
    // Health
    { type: 'debit', amount: [23, 80], description: 'Santé', category: 'health', counterparty: ['Pharmacie Centrale', 'Dr. Leroy', 'Laboratoire Analyses'] },
    // Insurance
    { type: 'debit', amount: [45, 120], description: 'Assurance', category: 'insurance', counterparty: ['AXA', 'MMA', 'MAIF'], monthly: true },
    // Subscriptions
    { type: 'debit', amount: [5.99, 29.99], description: 'Abonnement', category: 'subscription', counterparty: ['Netflix', 'Spotify', 'Apple', 'Canal+', 'Le Monde'] },
  ];

  const transactions: any[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const template = templates[Math.floor(Math.random() * templates.length)];
    const daysAgo = Math.floor(Math.random() * 180);
    const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    const amount = +(template.amount[0] + Math.random() * (template.amount[1] - template.amount[0])).toFixed(2);
    const counterparty = Array.isArray(template.counterparty)
      ? template.counterparty[Math.floor(Math.random() * template.counterparty.length)]
      : template.counterparty;

    transactions.push({
      account_id: accountId,
      type: template.type,
      amount,
      description: template.description,
      category: template.category,
      counterparty,
      reference: `REF-${Date.now()}-${i}`,
      date,
    });
  }

  return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
}

function generateActivityLogs(days: number) {
  const userIds = [
    '11111111-1111-1111-1111-111111111111',
    '22222222-2222-2222-2222-222222222222',
    '33333333-3333-3333-3333-333333333333',
    '44444444-4444-4444-4444-444444444444',
    '55555555-5555-5555-5555-555555555555',
    '66666666-6666-6666-6666-666666666666',
  ];

  const actions = [
    { action: 'auth.login.success', status: 'success', weight: 5 },
    { action: 'auth.login.failure', status: 'failure', weight: 1 },
    { action: 'fido.registration.success', status: 'success', weight: 2 },
    { action: 'fido.registration.failure', status: 'failure', weight: 0.5 },
    { action: 'fido.authentication.success', status: 'success', weight: 4 },
    { action: 'fido.authentication.failure', status: 'failure', weight: 0.5 },
    { action: 'fido.passkey.deleted', status: 'success', weight: 0.3 },
  ];

  const totalWeight = actions.reduce((s, a) => s + a.weight, 0);
  const logs: any[] = [];
  const now = new Date();

  for (let d = 0; d < days; d++) {
    const logsPerDay = 3 + Math.floor(Math.random() * 8);
    for (let i = 0; i < logsPerDay; i++) {
      let rand = Math.random() * totalWeight;
      let selectedAction = actions[0];
      for (const a of actions) {
        rand -= a.weight;
        if (rand <= 0) { selectedAction = a; break; }
      }

      const date = new Date(now.getTime() - d * 24 * 60 * 60 * 1000 - Math.random() * 24 * 60 * 60 * 1000);
      const userId = userIds[Math.floor(Math.random() * userIds.length)];

      logs.push({
        user_id: userId,
        action: selectedAction.action,
        status: selectedAction.status,
        ip_address: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
        user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        details: selectedAction.action.includes('failure') ? { reason: 'demo_data' } : null,
        created_at: date,
      });
    }
  }

  return logs.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
