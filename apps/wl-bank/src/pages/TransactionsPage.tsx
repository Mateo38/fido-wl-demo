import { useState, useEffect } from 'react';
import { api } from '../api';
import { ArrowUpRight, ArrowDownLeft, Search, Filter } from 'lucide-react';

const categories = [
  { value: '', label: 'Toutes' },
  { value: 'salary', label: 'Salaire' },
  { value: 'rent', label: 'Loyer' },
  { value: 'groceries', label: 'Courses' },
  { value: 'utilities', label: 'Factures' },
  { value: 'transport', label: 'Transport' },
  { value: 'entertainment', label: 'Loisirs' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'health', label: 'Santé' },
  { value: 'insurance', label: 'Assurance' },
  { value: 'subscription', label: 'Abonnement' },
  { value: 'transfer', label: 'Virement' },
];

const categoryLabels: Record<string, string> = Object.fromEntries(categories.filter(c => c.value).map(c => [c.value, c.label]));

export function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const limit = 15;

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = { page: String(page), limit: String(limit) };
    if (category) params.category = category;
    api.getTransactions(params).then((res) => {
      setTransactions(res.data);
      setTotal(res.total);
    }).finally(() => setLoading(false));
  }, [page, category]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Transactions</h1>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white appearance-none focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            {categories.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Transactions list */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl divide-y divide-slate-800">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full" />
          </div>
        ) : transactions.length === 0 ? (
          <p className="text-center text-slate-500 py-12">Aucune transaction</p>
        ) : (
          transactions.map((txn: any) => (
            <div key={txn.id} className="flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${txn.type === 'credit' ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                  {txn.type === 'credit'
                    ? <ArrowDownLeft className="w-5 h-5 text-emerald-400" />
                    : <ArrowUpRight className="w-5 h-5 text-red-400" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{txn.counterparty}</p>
                  <p className="text-xs text-slate-500">{txn.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                  {categoryLabels[txn.category] || txn.category}
                </span>
                <div className="text-right min-w-[100px]">
                  <p className={`text-sm font-semibold ${txn.type === 'credit' ? 'text-emerald-400' : 'text-white'}`}>
                    {txn.type === 'credit' ? '+' : '-'}{parseFloat(txn.amount).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}
                  </p>
                  <p className="text-xs text-slate-500">{new Date(txn.date).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-slate-500">{total} transaction{total > 1 ? 's' : ''}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm bg-slate-800 text-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-700 transition-colors"
            >
              Précédent
            </button>
            <span className="px-3 py-1.5 text-sm text-slate-400">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-sm bg-slate-800 text-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-700 transition-colors"
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
