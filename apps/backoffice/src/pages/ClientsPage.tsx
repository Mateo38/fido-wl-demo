import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '../hooks/useLocale';
import { api } from '../api';
import { Key, Plus, Ban, CheckCircle, Trash2, X, Phone } from 'lucide-react';

interface Client {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  status: string;
  passkey_count: number;
  created_at: string;
}

export function ClientsPage() {
  const { t } = useTranslation();
  const { formatDate } = useLocale();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'blocked'>('all');
  const [form, setForm] = useState({ email: '', first_name: '', last_name: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadClients = () => {
    api.getClients().then(res => setClients(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { loadClients(); }, []);

  const filtered = filter === 'all' ? clients : clients.filter(c => c.status === filter);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.createClient({
        email: form.email,
        first_name: form.first_name,
        last_name: form.last_name,
        phone: form.phone || undefined,
      });
      setShowModal(false);
      setForm({ email: '', first_name: '', last_name: '', phone: '' });
      loadClients();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (client: Client) => {
    const newStatus = client.status === 'active' ? 'blocked' : 'active';
    await api.updateClientStatus(client.id, newStatus);
    loadClients();
  };

  const handleDelete = async (client: Client) => {
    if (!confirm(t('clients.confirm_delete', { name: `${client.first_name} ${client.last_name}` }))) return;
    await api.deleteClient(client.id);
    loadClients();
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-6 h-6 border-2 border-wl-teal border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">{t('clients.title')}</h1>
        <button onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-wl-teal hover:bg-wl-teal-hover text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          {t('clients.new_client')}
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {(['all', 'active', 'blocked'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filter === f ? 'bg-wl-teal text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}>
            {t(`clients.filter_${f}`)}
          </button>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-wl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-800/50 border-b border-gray-800">
              <th className="text-left px-5 py-3 font-medium text-gray-400">{t('clients.col_name')}</th>
              <th className="text-left px-5 py-3 font-medium text-gray-400">{t('clients.col_email')}</th>
              <th className="text-left px-5 py-3 font-medium text-gray-400">{t('clients.col_phone')}</th>
              <th className="text-center px-5 py-3 font-medium text-gray-400">{t('clients.col_status')}</th>
              <th className="text-center px-5 py-3 font-medium text-gray-400">{t('clients.col_passkeys')}</th>
              <th className="text-left px-5 py-3 font-medium text-gray-400">{t('clients.col_created')}</th>
              <th className="text-center px-5 py-3 font-medium text-gray-400">{t('clients.col_actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {filtered.map(c => (
              <tr key={c.id} className="hover:bg-gray-800/50 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-wl-teal-light text-wl-teal rounded-full flex items-center justify-center text-xs font-bold">
                      {c.first_name[0]}{c.last_name[0]}
                    </div>
                    <span className="font-medium text-white">{c.first_name} {c.last_name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-gray-400">{c.email}</td>
                <td className="px-5 py-3 text-gray-400">
                  {c.phone ? (
                    <span className="inline-flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</span>
                  ) : '—'}
                </td>
                <td className="px-5 py-3 text-center">
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                    c.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                  }`}>
                    {c.status === 'active' ? <CheckCircle className="w-3 h-3" /> : <Ban className="w-3 h-3" />}
                    {t(`clients.status_${c.status}`)}
                  </span>
                </td>
                <td className="px-5 py-3 text-center">
                  <span className="inline-flex items-center gap-1 text-white">
                    <Key className="w-3.5 h-3.5 text-gray-500" />
                    {c.passkey_count}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-400">{formatDate(c.created_at)}</td>
                <td className="px-5 py-3 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => handleToggleStatus(c)} title={c.status === 'active' ? t('clients.block') : t('clients.activate')}
                      className={`p-1.5 rounded-lg transition-colors ${
                        c.status === 'active' ? 'text-gray-400 hover:text-amber-400 hover:bg-amber-500/10' : 'text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10'
                      }`}>
                      {c.status === 'active' ? <Ban className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                    </button>
                    <button onClick={() => handleDelete(c)} title={t('clients.delete')}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-gray-500">{t('clients.no_clients')}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-wl p-6 w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">{t('clients.new_client')}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg mb-4">{error}</div>}
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">{t('clients.first_name')}</label>
                  <input type="text" required value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-wl-teal" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">{t('clients.last_name')}</label>
                  <input type="text" required value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-wl-teal" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">{t('clients.col_email')}</label>
                <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-wl-teal" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">{t('clients.col_phone')} ({t('clients.optional')})</label>
                <input type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-wl-teal" />
              </div>
              <button type="submit" disabled={submitting}
                className="w-full bg-wl-teal hover:bg-wl-teal-hover text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 mt-2">
                {submitting ? t('clients.creating') : t('clients.create')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
