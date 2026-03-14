import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '../hooks/useLocale';
import { api } from '../api';
import { ArrowUpRight, ArrowDownLeft, Search, Filter } from 'lucide-react';

const categoryKeys = [
  { value: '', key: 'transactions.all' },
  { value: 'salary', key: 'transactions.salary' },
  { value: 'rent', key: 'transactions.rent' },
  { value: 'groceries', key: 'transactions.groceries' },
  { value: 'utilities', key: 'transactions.utilities' },
  { value: 'transport', key: 'transactions.transport' },
  { value: 'entertainment', key: 'transactions.entertainment' },
  { value: 'restaurant', key: 'transactions.restaurant' },
  { value: 'shopping', key: 'transactions.shopping' },
  { value: 'health', key: 'transactions.health' },
  { value: 'insurance', key: 'transactions.insurance' },
  { value: 'subscription', key: 'transactions.subscription' },
  { value: 'transfer', key: 'transactions.transfer' },
];

const categoryKeyMap: Record<string, string> = Object.fromEntries(
  categoryKeys.filter(c => c.value).map(c => [c.value, c.key])
);

export function TransactionsPage() {
  const { t } = useTranslation();
  const { formatCurrency, formatDate } = useLocale();
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
      <h1 className="text-2xl font-bold text-white mb-6">{t('transactions.title')}</h1>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <select
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white appearance-none focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            {categoryKeys.map((c) => (
              <option key={c.value} value={c.value}>{t(c.key)}</option>
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
          <p className="text-center text-slate-500 py-12">{t('transactions.no_transactions')}</p>
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
              <div className="flex items-center gap-2 sm:gap-4">
                <span className="hidden sm:inline-block text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                  {categoryKeyMap[txn.category] ? t(categoryKeyMap[txn.category]) : txn.category}
                </span>
                <div className="text-right min-w-[80px] sm:min-w-[100px]">
                  <p className={`text-sm font-semibold ${txn.type === 'credit' ? 'text-emerald-400' : 'text-white'}`}>
                    {txn.type === 'credit' ? '+' : '-'}{formatCurrency(parseFloat(txn.amount))}
                  </p>
                  <p className="text-xs text-slate-500">{formatDate(txn.date)}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-4">
          <p className="text-sm text-slate-500">{total > 1 ? t('transactions.count_plural', { count: total }) : t('transactions.count', { count: total })}</p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm bg-slate-800 text-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-700 transition-colors"
            >
              {t('transactions.previous')}
            </button>
            <span className="px-3 py-1.5 text-sm text-slate-400">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 text-sm bg-slate-800 text-slate-300 rounded-lg disabled:opacity-50 hover:bg-slate-700 transition-colors"
            >
              {t('transactions.next')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
