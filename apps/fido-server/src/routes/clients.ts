import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { authenticateToken, requirePermission } from '../middleware/auth';
import { userRepository } from '../repositories/userRepository';
import { accountRepository } from '../repositories/accountRepository';
import { transactionRepository } from '../repositories/transactionRepository';
import { activityRepository } from '../repositories/activityRepository';
import { passkeyRepository } from '../repositories/passkeyRepository';

const router = Router();

router.use(authenticateToken);

const DEFAULT_PASSWORD = 'azerty123';

function generateIban(): string {
  const bankCode = '30001';
  const branchCode = '00794';
  const accountNum = Array.from(crypto.randomBytes(11)).map(b => (b % 10).toString()).join('');
  const key = (97 - (parseInt(bankCode + branchCode + accountNum + '00') % 97)).toString().padStart(2, '0');
  return `FR76${bankCode}${branchCode}${accountNum}${key}`;
}

function generateDemoTransactions(accountId: string) {
  const templates = [
    { type: 'credit', amount: [2800, 3500], description: 'Virement salaire', category: 'salary', counterparty: 'Employeur SAS', monthly: true },
    { type: 'debit', amount: [750, 950], description: 'Loyer mensuel', category: 'rent', counterparty: 'SCI Habitat', monthly: true },
    { type: 'debit', amount: [15, 120], description: 'Courses alimentaires', category: 'groceries', counterparty: ['Carrefour', 'Leclerc', 'Monoprix', 'Lidl', 'Auchan'] },
    { type: 'debit', amount: [30, 80], description: 'Facture énergie', category: 'utilities', counterparty: ['EDF', 'Engie', 'Veolia'] },
    { type: 'debit', amount: [1.9, 60], description: 'Transport', category: 'transport', counterparty: ['RATP', 'SNCF', 'Uber', 'Bolt', 'TotalEnergies'] },
    { type: 'debit', amount: [5, 45], description: 'Loisirs', category: 'entertainment', counterparty: ['UGC Ciné', 'FNAC', 'Pathé', 'Ticketmaster'] },
    { type: 'debit', amount: [12, 55], description: 'Restaurant', category: 'restaurant', counterparty: ['Le Petit Bistrot', 'Sushi Shop', "McDonald's", 'Burger King', 'La Brasserie'] },
    { type: 'debit', amount: [15, 180], description: 'Achat', category: 'shopping', counterparty: ['Amazon', 'Zara', 'H&M', 'Decathlon', 'IKEA'] },
    { type: 'debit', amount: [23, 70], description: 'Santé', category: 'health', counterparty: ['Pharmacie Centrale', 'Dr. Leroy'] },
    { type: 'debit', amount: [45, 120], description: 'Assurance', category: 'insurance', counterparty: ['AXA', 'MMA', 'MAIF'], monthly: true },
    { type: 'debit', amount: [5.99, 19.99], description: 'Abonnement', category: 'subscription', counterparty: ['Netflix', 'Spotify', 'Apple', 'Canal+'] },
  ];

  const transactions: any[] = [];
  const now = new Date();
  const count = 80 + Math.floor(Math.random() * 40); // 80-120 transactions

  for (let i = 0; i < count; i++) {
    const template = templates[Math.floor(Math.random() * templates.length)];
    const daysAgo = Math.floor(Math.random() * 90); // last 3 months
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

// List clients
router.get('/', requirePermission('clients:read'), async (_req: Request, res: Response) => {
  try {
    const clients = await userRepository.findAllClients();
    res.json({
      success: true,
      data: clients.map((c: any) => ({
        id: c.id,
        email: c.email,
        first_name: c.first_name,
        last_name: c.last_name,
        phone: c.phone,
        status: c.status,
        passkey_count: c.passkey_count,
        created_at: c.created_at,
      })),
    });
  } catch (err) {
    console.error('List clients error:', err);
    res.status(500).json({ success: false, error: 'Failed to list clients' });
  }
});

// Create client
router.post('/', requirePermission('clients:write'), async (req: Request, res: Response) => {
  try {
    const { email, first_name, last_name, phone } = req.body;

    if (!email || !first_name || !last_name) {
      return res.status(400).json({ success: false, error: 'Email, first_name and last_name are required' });
    }

    const existing = await userRepository.findByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, error: 'Email already exists' });
    }

    const password_hash = await bcrypt.hash(DEFAULT_PASSWORD, 10);

    const user = await userRepository.create({
      email,
      password_hash,
      first_name,
      last_name,
      role: 'customer',
      status: 'active',
      phone,
      must_change_password: true,
    });

    // Generate demo banking data
    const balance = +(2000 + Math.random() * 6000).toFixed(2); // 2000-8000 EUR
    const account = await accountRepository.create({
      user_id: user.id,
      iban: generateIban(),
      bic: 'WLBKFRPP',
      account_type: 'checking',
      balance,
      label: 'Compte Courant',
    });

    const savingsBalance = +(5000 + Math.random() * 15000).toFixed(2); // 5000-20000 EUR
    await accountRepository.create({
      user_id: user.id,
      iban: generateIban(),
      bic: 'WLBKFRPP',
      account_type: 'savings',
      balance: savingsBalance,
      label: 'Livret Épargne',
    });

    // Generate demo transactions on checking account
    const transactions = generateDemoTransactions(account.id);
    for (const t of transactions) {
      await transactionRepository.create(t);
    }

    await activityRepository.create({
      user_id: req.user!.userId,
      action: 'client.created',
      status: 'success',
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      details: { client_id: user.id, client_email: email },
    });

    res.status(201).json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        phone: user.phone,
        status: user.status,
        created_at: user.created_at,
      },
    });
  } catch (err) {
    console.error('Create client error:', err);
    res.status(500).json({ success: false, error: 'Failed to create client' });
  }
});

// Update client status (block/activate)
router.patch('/:id/status', requirePermission('clients:write'), async (req: Request, res: Response) => {
  try {
    const { status } = req.body;

    if (!status || !['active', 'blocked'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Status must be active or blocked' });
    }

    const user = await userRepository.findById(req.params.id);
    if (!user || user.role !== 'customer') {
      return res.status(404).json({ success: false, error: 'Client not found' });
    }

    const updated = await userRepository.updateStatus(req.params.id, status);

    await activityRepository.create({
      user_id: req.user!.userId,
      action: status === 'blocked' ? 'client.blocked' : 'client.activated',
      status: 'success',
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      details: { client_id: req.params.id },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Update client status error:', err);
    res.status(500).json({ success: false, error: 'Failed to update client status' });
  }
});

// Reset client password
router.patch('/:id/reset-password', requirePermission('clients:write'), async (req: Request, res: Response) => {
  try {
    const user = await userRepository.findById(req.params.id);
    if (!user || user.role !== 'customer') {
      return res.status(404).json({ success: false, error: 'Client not found' });
    }

    const password_hash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
    await userRepository.updatePassword(req.params.id, password_hash, true);

    await activityRepository.create({
      user_id: req.user!.userId,
      action: 'client.password_reset',
      status: 'success',
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      details: { client_id: req.params.id, client_email: user.email },
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Reset client password error:', err);
    res.status(500).json({ success: false, error: 'Failed to reset password' });
  }
});

// Get client passkeys
router.get('/:id/passkeys', requirePermission('clients:read'), async (req: Request, res: Response) => {
  try {
    const user = await userRepository.findById(req.params.id);
    if (!user || user.role !== 'customer') {
      return res.status(404).json({ success: false, error: 'Client not found' });
    }

    const passkeys = await passkeyRepository.findByUserId(req.params.id);
    res.json({
      success: true,
      data: passkeys.map(pk => ({
        id: pk.id,
        friendly_name: pk.friendly_name,
        device_type: pk.device_type,
        authenticator_name: pk.authenticator_name,
        status: pk.status || 'active',
        backed_up: pk.backed_up,
        transports: pk.transports,
        created_at: pk.created_at,
        last_used_at: pk.last_used_at,
      })),
    });
  } catch (err) {
    console.error('Get client passkeys error:', err);
    res.status(500).json({ success: false, error: 'Failed to get passkeys' });
  }
});

// Update passkey status (block/activate)
router.patch('/:id/passkeys/:passkeyId/status', requirePermission('clients:write'), async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    if (!status || !['active', 'blocked'].includes(status)) {
      return res.status(400).json({ success: false, error: 'Status must be active or blocked' });
    }

    const passkey = await passkeyRepository.findById(req.params.passkeyId);
    if (!passkey || passkey.user_id !== req.params.id) {
      return res.status(404).json({ success: false, error: 'Passkey not found' });
    }
    if (passkey.status === 'revoked') {
      return res.status(400).json({ success: false, error: 'Cannot modify a revoked passkey' });
    }

    const updated = await passkeyRepository.updateStatus(req.params.passkeyId, status);

    await activityRepository.create({
      user_id: req.user!.userId,
      action: status === 'blocked' ? 'passkey.blocked' : 'passkey.activated',
      status: 'success',
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      details: { client_id: req.params.id, passkey_id: req.params.passkeyId },
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Update passkey status error:', err);
    res.status(500).json({ success: false, error: 'Failed to update passkey status' });
  }
});

// Revoke passkey (permanent)
router.delete('/:id/passkeys/:passkeyId', requirePermission('clients:write'), async (req: Request, res: Response) => {
  try {
    const passkey = await passkeyRepository.findById(req.params.passkeyId);
    if (!passkey || passkey.user_id !== req.params.id) {
      return res.status(404).json({ success: false, error: 'Passkey not found' });
    }

    await passkeyRepository.revoke(req.params.passkeyId);

    await activityRepository.create({
      user_id: req.user!.userId,
      action: 'passkey.revoked',
      status: 'success',
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      details: { client_id: req.params.id, passkey_id: req.params.passkeyId },
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Revoke passkey error:', err);
    res.status(500).json({ success: false, error: 'Failed to revoke passkey' });
  }
});

// Delete client
router.delete('/:id', requirePermission('clients:write'), async (req: Request, res: Response) => {
  try {
    const user = await userRepository.findById(req.params.id);
    if (!user || user.role !== 'customer') {
      return res.status(404).json({ success: false, error: 'Client not found' });
    }

    // Clean up related data first
    await accountRepository.deleteByUserId(req.params.id);

    const deleted = await userRepository.delete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Client not found' });
    }

    await activityRepository.create({
      user_id: req.user!.userId,
      action: 'client.deleted',
      status: 'success',
      ip_address: req.ip,
      user_agent: req.headers['user-agent'],
      details: { client_id: req.params.id, client_email: user.email },
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Delete client error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete client' });
  }
});

export default router;
