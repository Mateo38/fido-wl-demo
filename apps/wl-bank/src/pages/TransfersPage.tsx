import { useState, useEffect } from 'react';
import { api } from '../api';
import { Send, UserPlus, Trash2, AlertCircle, CheckCircle } from 'lucide-react';

export function TransfersPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [beneficiaries, setBeneficiaries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'transfer' | 'beneficiaries'>('transfer');

  // Transfer form
  const [fromAccount, setFromAccount] = useState('');
  const [beneficiaryId, setBeneficiaryId] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [transferLoading, setTransferLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Add beneficiary form
  const [showAddBeneficiary, setShowAddBeneficiary] = useState(false);
  const [newBenName, setNewBenName] = useState('');
  const [newBenIban, setNewBenIban] = useState('');
  const [newBenBic, setNewBenBic] = useState('');

  const loadData = () => {
    Promise.all([api.getAccounts(), api.getBeneficiaries()]).then(([acc, ben]) => {
      setAccounts(acc.data);
      setBeneficiaries(ben.data);
      if (acc.data.length > 0 && !fromAccount) setFromAccount(acc.data[0].id);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, []);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setTransferLoading(true);
    try {
      await api.createTransfer({
        from_account_id: fromAccount,
        beneficiary_id: beneficiaryId,
        amount: parseFloat(amount),
        description,
      });
      setMessage({ type: 'success', text: 'Virement effectué avec succès' });
      setAmount('');
      setDescription('');
      setBeneficiaryId('');
      loadData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setTransferLoading(false);
    }
  };

  const handleAddBeneficiary = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createBeneficiary({ name: newBenName, iban: newBenIban, bic: newBenBic });
      setShowAddBeneficiary(false);
      setNewBenName(''); setNewBenIban(''); setNewBenBic('');
      loadData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleDeleteBeneficiary = async (id: string) => {
    try {
      await api.deleteBeneficiary(id);
      loadData();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Virements</h1>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-900 p-1 rounded-xl mb-6 w-fit">
        <button onClick={() => setTab('transfer')} className={`px-4 py-2 text-sm rounded-lg transition-colors ${tab === 'transfer' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'}`}>
          Nouveau virement
        </button>
        <button onClick={() => setTab('beneficiaries')} className={`px-4 py-2 text-sm rounded-lg transition-colors ${tab === 'beneficiaries' ? 'bg-violet-600 text-white' : 'text-slate-400 hover:text-white'}`}>
          Bénéficiaires
        </button>
      </div>

      {message && (
        <div className={`flex items-center gap-2 p-3 rounded-lg mb-4 text-sm ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
          {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {message.text}
        </div>
      )}

      {tab === 'transfer' ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-lg">
          <form onSubmit={handleTransfer} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Compte débiteur</label>
              <select value={fromAccount} onChange={e => setFromAccount(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-violet-500">
                {accounts.map((a: any) => (
                  <option key={a.id} value={a.id}>{a.label} - {parseFloat(a.balance).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Bénéficiaire</label>
              <select value={beneficiaryId} onChange={e => setBeneficiaryId(e.target.value)} required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-violet-500">
                <option value="">Sélectionner un bénéficiaire</option>
                {beneficiaries.map((b: any) => (
                  <option key={b.id} value={b.id}>{b.name} - {b.iban}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Montant (EUR)</label>
              <input type="number" step="0.01" min="0.01" value={amount} onChange={e => setAmount(e.target.value)} required
                placeholder="0.00"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Motif</label>
              <input type="text" value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Motif du virement"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
            <button type="submit" disabled={transferLoading}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium py-3 px-4 rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              <Send className="w-4 h-4" />
              {transferLoading ? 'Envoi...' : 'Effectuer le virement'}
            </button>
          </form>
        </div>
      ) : (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Bénéficiaires enregistrés</h2>
            <button onClick={() => setShowAddBeneficiary(!showAddBeneficiary)}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm rounded-xl transition-colors">
              <UserPlus className="w-4 h-4" />
              Ajouter
            </button>
          </div>

          {showAddBeneficiary && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-4">
              <form onSubmit={handleAddBeneficiary} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <input type="text" value={newBenName} onChange={e => setNewBenName(e.target.value)} required placeholder="Nom"
                  className="bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500" />
                <input type="text" value={newBenIban} onChange={e => setNewBenIban(e.target.value)} required placeholder="IBAN"
                  className="bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500" />
                <div className="flex gap-2">
                  <input type="text" value={newBenBic} onChange={e => setNewBenBic(e.target.value)} required placeholder="BIC"
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl py-2.5 px-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500" />
                  <button type="submit" className="px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm rounded-xl transition-colors">Ajouter</button>
                </div>
              </form>
            </div>
          )}

          <div className="bg-slate-900 border border-slate-800 rounded-xl divide-y divide-slate-800">
            {beneficiaries.length === 0 ? (
              <p className="text-center text-slate-500 py-8">Aucun bénéficiaire</p>
            ) : beneficiaries.map((b: any) => (
              <div key={b.id} className="flex items-center justify-between p-4">
                <div>
                  <p className="text-sm font-medium text-white">{b.name}</p>
                  <p className="text-xs text-slate-500 font-mono">{b.iban}</p>
                </div>
                <button onClick={() => handleDeleteBeneficiary(b.id)} className="p-2 text-slate-400 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
