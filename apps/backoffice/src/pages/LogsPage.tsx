import { useState, useEffect } from 'react';
import { api } from '../api';
import { CheckCircle, XCircle, Filter } from 'lucide-react';

export function LogsPage() {
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
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Journal d'activité</h1>

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <select value={actionFilter} onChange={e => { setActionFilter(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">Toutes les actions</option>
          <option value="auth.login.success">Login réussi</option>
          <option value="auth.login.failure">Login échoué</option>
          <option value="fido.registration.success">Enregistrement passkey</option>
          <option value="fido.authentication.success">Auth passkey réussie</option>
          <option value="fido.authentication.failure">Auth passkey échouée</option>
        </select>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
          <option value="">Tous les statuts</option>
          <option value="success">Succès</option>
          <option value="failure">Échec</option>
        </select>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-5 py-3 font-medium text-gray-500">Date</th>
              <th className="text-left px-5 py-3 font-medium text-gray-500">Action</th>
              <th className="text-left px-5 py-3 font-medium text-gray-500">Utilisateur</th>
              <th className="text-center px-5 py-3 font-medium text-gray-500">Statut</th>
              <th className="text-left px-5 py-3 font-medium text-gray-500">IP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8">
                <div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto" />
              </td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">Aucun log</td></tr>
            ) : logs.map((log: any) => (
              <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3 text-gray-500 text-xs whitespace-nowrap">
                  {new Date(log.created_at).toLocaleString('fr-FR')}
                </td>
                <td className="px-5 py-3">
                  <span className="font-mono text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{log.action}</span>
                </td>
                <td className="px-5 py-3 text-gray-600">
                  {log.user_email ? `${log.user_first_name} ${log.user_last_name}` : '—'}
                </td>
                <td className="px-5 py-3 text-center">
                  {log.status === 'success'
                    ? <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                    : <XCircle className="w-4 h-4 text-red-500 mx-auto" />}
                </td>
                <td className="px-5 py-3 text-gray-400 text-xs font-mono">{log.ip_address || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-500">{total} entrée{total > 1 ? 's' : ''}</p>
          <div className="flex gap-2">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-3 py-1.5 text-sm border border-gray-300 text-gray-600 rounded-lg disabled:opacity-50 hover:bg-gray-50">
              Précédent
            </button>
            <span className="px-3 py-1.5 text-sm text-gray-500">{page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="px-3 py-1.5 text-sm border border-gray-300 text-gray-600 rounded-lg disabled:opacity-50 hover:bg-gray-50">
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
