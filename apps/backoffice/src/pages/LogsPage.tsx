import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '../hooks/useLocale';
import { api } from '../api';
import { CheckCircle, XCircle } from 'lucide-react';

export function LogsPage() {
  const { t } = useTranslation();
  const { formatDateTime } = useLocale();
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [actionFilter, setActionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const limit = 20;

  useEffect(() => {
    setLoading(true);
    const params: Record<string, string> = { page: String(page), limit: String(limit) };
    if (actionFilter) params.action = actionFilter;
    if (statusFilter) params.status = statusFilter;
    api.getLogs(params).then(res => {
      setLogs(res.data);
      setTotal(res.total);
    }).finally(() => setLoading(false));
  }, [page, actionFilter, statusFilter]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">{t('logs.title')}</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <select value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(1); }}
          className="bg-gray-900 border border-gray-700 text-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-wl-teal">
          <option value="">{t('logs.all_actions')}</option>
          <option value="auth.login.success">{t('logs.login_success')}</option>
          <option value="auth.login.failure">{t('logs.login_failure')}</option>
          <option value="fido.registration.success">{t('logs.passkey_registration')}</option>
          <option value="fido.authentication.success">{t('logs.passkey_auth_success')}</option>
          <option value="fido.authentication.failure">{t('logs.passkey_auth_failure')}</option>
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-gray-900 border border-gray-700 text-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-wl-teal">
          <option value="">{t('logs.all_statuses')}</option>
          <option value="success">{t('logs.success')}</option>
          <option value="failure">{t('logs.failure')}</option>
        </select>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-wl overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="bg-gray-800/50 border-b border-gray-800">
              <th className="text-left px-5 py-3 font-medium text-gray-400">{t('logs.col_date')}</th>
              <th className="text-left px-5 py-3 font-medium text-gray-400">{t('logs.col_action')}</th>
              <th className="text-left px-5 py-3 font-medium text-gray-400">{t('logs.col_user')}</th>
              <th className="text-center px-5 py-3 font-medium text-gray-400">{t('logs.col_status')}</th>
              <th className="text-left px-5 py-3 font-medium text-gray-400">{t('logs.col_ip')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-wl-teal border-t-transparent rounded-full mx-auto" />
              </td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-500">{t('logs.no_logs')}</td></tr>
            ) : logs.map((log: any) => (
              <tr key={log.id} className="hover:bg-gray-800/50 transition-colors">
                <td className="px-5 py-3 text-gray-400 text-xs whitespace-nowrap">
                  {formatDateTime(log.created_at)}
                </td>
                <td className="px-5 py-3">
                  <span className="font-mono text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded">{log.action}</span>
                </td>
                <td className="px-5 py-3 text-gray-300">
                  {log.user_email ? `${log.user_first_name} ${log.user_last_name}` : '—'}
                </td>
                <td className="px-5 py-3 text-center">
                  {log.status === 'success'
                    ? <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                    : <XCircle className="w-4 h-4 text-red-500 mx-auto" />}
                </td>
                <td className="px-5 py-3 text-gray-500 text-xs font-mono">{log.ip_address || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mt-4">
          <p className="text-sm text-gray-400">{total > 1 ? t('logs.entry_count_plural', { count: total }) : t('logs.entry_count', { count: total })}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 text-sm border border-gray-700 text-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-800 transition-colors">
              {t('logs.previous')}
            </button>
            <span className="px-3 py-1.5 text-sm text-gray-500">{page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3 py-1.5 text-sm border border-gray-700 text-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-800 transition-colors">
              {t('logs.next')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
