import { Router, Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth';
import { accountRepository } from '../repositories/accountRepository';
import { transactionRepository } from '../repositories/transactionRepository';
import pool from '../db/pool';

const router = Router();

// Accounts
router.get('/accounts', authenticateToken, async (req: Request, res: Response) => {
  try {
    const accounts = await accountRepository.findByUserId(req.user!.userId);
    res.json({ success: true, data: accounts });
  } catch (err) {
    console.error('Get accounts error:', err);
    res.status(500).json({ success: false, error: 'Failed to get accounts' });
  }
});

// Transactions
router.get('/transactions', authenticateToken, async (req: Request, res: Response) => {
  try {
    const accounts = await accountRepository.findByUserId(req.user!.userId);
    const accountIds = accounts.map((a: any) => a.id);

    const { category, from, to, page, limit } = req.query;
    const result = await transactionRepository.findByAccountIds(accountIds, {
      category: category as string,
      from: from as string,
      to: to as string,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
    });

    res.json({
      success: true,
      data: result.rows,
      total: result.total,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
      totalPages: Math.ceil(result.total / (limit ? parseInt(limit as string) : 20)),
    });
  } catch (err) {
    console.error('Get transactions error:', err);
    res.status(500).json({ success: false, error: 'Failed to get transactions' });
  }
});

// Cards
router.get('/cards', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query('SELECT * FROM cards WHERE user_id = $1 ORDER BY created_at', [req.user!.userId]);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Get cards error:', err);
    res.status(500).json({ success: false, error: 'Failed to get cards' });
  }
});

// Beneficiaries
router.get('/beneficiaries', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query('SELECT * FROM beneficiaries WHERE user_id = $1 ORDER BY name', [req.user!.userId]);
    res.json({ success: true, data: rows });
  } catch (err) {
    console.error('Get beneficiaries error:', err);
    res.status(500).json({ success: false, error: 'Failed to get beneficiaries' });
  }
});

router.post('/beneficiaries', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { name, iban, bic, label } = req.body;
    if (!name || !iban || !bic) {
      return res.status(400).json({ success: false, error: 'Name, IBAN and BIC required' });
    }
    const { rows } = await pool.query(
      'INSERT INTO beneficiaries (user_id, name, iban, bic, label) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [req.user!.userId, name, iban, bic, label || null]
    );
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('Create beneficiary error:', err);
    res.status(500).json({ success: false, error: 'Failed to create beneficiary' });
  }
});

router.delete('/beneficiaries/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM beneficiaries WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user!.userId]
    );
    if (!rowCount) return res.status(404).json({ success: false, error: 'Beneficiary not found' });
    res.json({ success: true, message: 'Beneficiary deleted' });
  } catch (err) {
    console.error('Delete beneficiary error:', err);
    res.status(500).json({ success: false, error: 'Failed to delete beneficiary' });
  }
});

// Transfers
router.post('/transfers', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { from_account_id, beneficiary_id, amount, description } = req.body;

    if (!from_account_id || !beneficiary_id || !amount || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid transfer data' });
    }

    const account = await accountRepository.findById(from_account_id);
    if (!account || account.user_id !== req.user!.userId) {
      return res.status(403).json({ success: false, error: 'Account not found or access denied' });
    }

    if (parseFloat(account.balance) < amount) {
      return res.status(400).json({ success: false, error: 'Insufficient funds' });
    }

    const { rows: benRows } = await pool.query(
      'SELECT * FROM beneficiaries WHERE id = $1 AND user_id = $2',
      [beneficiary_id, req.user!.userId]
    );
    if (benRows.length === 0) {
      return res.status(404).json({ success: false, error: 'Beneficiary not found' });
    }
    const beneficiary = benRows[0];

    // Debit the account
    await accountRepository.updateBalance(from_account_id, -amount);

    // Create transaction
    const transaction = await transactionRepository.create({
      account_id: from_account_id,
      type: 'debit',
      amount,
      description: description || `Virement à ${beneficiary.name}`,
      category: 'transfer',
      counterparty: beneficiary.name,
      reference: `VIR-${Date.now()}`,
    });

    res.json({ success: true, data: transaction });
  } catch (err) {
    console.error('Transfer error:', err);
    res.status(500).json({ success: false, error: 'Failed to process transfer' });
  }
});

export default router;
