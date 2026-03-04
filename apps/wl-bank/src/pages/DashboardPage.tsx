import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';
import { TrendingUp, TrendingDown, Wallet, CreditCard, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

export function DashboardPage() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getAccounts(),
      api.getTransactions({ limit: '5' }),
      api.getCards(),
    ]).then(([acc, txn, crd]) => {
      setAccounts(acc.data);
      setTransactions(txn.data);
      setCards(crd.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full" /></div>;

  const totalBalance = accounts.reduce((sum: number, a: any) => sum + parseFloat(a.balance), 0);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-1">Bonjour, {user?.first_name}</h1>
      <p className="text-slate-400 mb-8">Voici un aperçu de vos finances</p>

      {/* Total Balance */}
      <div className="bg-gradient-to-br from-violet-600 to-violet-800 rounded-2xl p-6 mb-6">
        <p className="text-violet-200 text-sm mb-1">Solde total</p>
        <p className="text-3xl font-bold text-white">{totalBalance.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</p>
      </div>

      {/* Accounts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {accounts.map((account: any) => (
          <div key={account.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-violet-400" />
                <span className="text-sm text-slate-400">{account.label}</span>
              </div>
              <span className="text-xs text-slate-500 font-mono">{account.iban.slice(-8)}</span>
            </div>
            <p className="text-xl font-bold text-white">
              {parseFloat(account.balance).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
            </p>
            <p className="text-xs text-slate-500 mt-1 capitalize">{account.account_type === 'checking' ? 'Compte courant' : 'Épargne'}</p>
          </div>
        ))}
      </div>

      {/* Cards */}
      {cards.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-violet-400" />
            Vos cartes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cards.map((card: any) => (
              <div key={card.id} className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 rounded-xl p-5">
                <div className="flex justify-between items-start mb-8">
                  <span className="text-xs text-slate-400 uppercase">{card.card_network} {card.card_tier}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${card.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                    {card.status === 'active' ? 'Active' : card.status}
                  </span>
                </div>
                <p className="text-lg font-mono text-white mb-2">•••• •••• •••• {card.card_number_last4}</p>
                <p className="text-xs text-slate-500">Expire {card.expiry_date}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Transactions */}
      <h2 className="text-lg font-semibold text-white mb-4">Dernières transactions</h2>
      <div className="bg-slate-900 border border-slate-800 rounded-xl divide-y divide-slate-800">
        {transactions.map((txn: any) => (
          <div key={txn.id} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${txn.type === 'credit' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                {txn.type === 'credit'
                  ? <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
                  : <ArrowUpRight className="w-5 h-5 text-red-400" />}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{txn.counterparty}</p>
                <p className="text-xs text-slate-500">{txn.description}</p>
              </div>
            </div>
            <div className="text-right">
              <p className={`text-sm font-semibold ${txn.type === 'credit' ? 'text-emerald-400' : 'text-white'}`}>
                {txn.type === 'credit' ? '+' : '-'}{parseFloat(txn.amount).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
              </p>
              <p className="text-xs text-slate-500">{new Date(txn.date).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
        ))}
        {transactions.length === 0 && (
          <p className="text-center text-slate-500 py-8">Aucune transaction</p>
        )}
      </div>
    </div>
  );
}
