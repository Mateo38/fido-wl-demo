import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '../hooks/useLocale';
import { usePermissions } from '../hooks/usePermissions';
import { useAdminAuth } from '../App';
import { api } from '../api';
import { Key, Shield, Plus, Trash2, RotateCcw, X, UserCog } from 'lucide-react';

const ROLE_BADGE_CLASSES: Record<string, string> = {
  super_admin: 'bg-violet-500/10 text-violet-400',
  admin: 'bg-amber-500/10 text-amber-400',
  supervisor: 'bg-blue-500/10 text-blue-400',
  operator: 'bg-gray-500/10 text-gray-400',
};

export function UsersPage() {
  const { t } = useTranslation();
  const { formatDate } = useLocale();
  const { user } = useAdminAuth();
  const { isSuperAdmin } = usePermissions(user?.role);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [form, setForm] = useState({ email: '', first_name: '', last_name: '', role: 'admin' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const loadUsers = () => {
    api.getUsers().then(res => setUsers(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { loadUsers(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await api.createAdmin(form);
      setShowCreateModal(false);
      setForm({ email: '', first_name: '', last_name: '', role: 'admin' });
      loadUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangeRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setSubmitting(true);
    setError('');
    try {
      await api.updateAdminRole(selectedUser.id, selectedUser.newRole);
      setShowRoleModal(false);
      setSelectedUser(null);
      loadUsers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (u: any) => {
    if (!confirm(t('admins.confirm_reset_password', { name: `${u.first_name} ${u.last_name}` }))) return;
    await api.resetAdminPassword(u.id);
    loadUsers();
  };

  const handleDelete = async (u: any) => {
    if (!confirm(t('admins.confirm_delete', { name: `${u.first_name} ${u.last_name}` }))) return;
    await api.deleteAdmin(u.id);
    loadUsers();
  };

  const openRoleModal = (u: any) => {
    setSelectedUser({ ...u, newRole: u.role });
    setError('');
    setShowRoleModal(true);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-6 h-6 border-2 border-wl-teal border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">{t('admins.title')}</h1>
        {isSuperAdmin && (
          <button onClick={() => { setError(''); setShowCreateModal(true); }}
            className="flex items-center gap-2 bg-wl-teal hover:bg-wl-teal-hover text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            {t('admins.new_admin')}
          </button>
        )}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-wl overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="bg-gray-800/50 border-b border-gray-800">
              <th className="text-left px-5 py-3 font-medium text-gray-400">{t('admins.col_user')}</th>
              <th className="text-left px-5 py-3 font-medium text-gray-400">{t('admins.col_email')}</th>
              <th className="text-left px-5 py-3 font-medium text-gray-400">{t('admins.col_role')}</th>
              <th className="text-center px-5 py-3 font-medium text-gray-400">{t('admins.col_passkeys')}</th>
              <th className="text-left px-5 py-3 font-medium text-gray-400">{t('admins.col_registration')}</th>
              {isSuperAdmin && <th className="text-center px-5 py-3 font-medium text-gray-400">{t('admins.col_actions')}</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {users.map((u: any) => (
              <tr key={u.id} className="hover:bg-gray-800/50 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-wl-teal-light text-wl-teal rounded-full flex items-center justify-center text-xs font-bold">
                      {u.first_name[0]}{u.last_name[0]}
                    </div>
                    <span className="font-medium text-white">{u.first_name} {u.last_name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-gray-400">{u.email}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${ROLE_BADGE_CLASSES[u.role] || 'bg-gray-500/10 text-gray-400'}`}>
                    <Shield className="w-3 h-3" />
                    {t(`roles.${u.role}`, { defaultValue: u.role })}
                  </span>
                </td>
                <td className="px-5 py-3 text-center">
                  <span className="inline-flex items-center gap-1 text-white">
                    <Key className="w-3.5 h-3.5 text-gray-500" />
                    {u.passkey_count}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-400">
                  {formatDate(u.created_at)}
                </td>
                {isSuperAdmin && (
                  <td className="px-5 py-3 text-center">
                    {u.role !== 'super_admin' && (
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openRoleModal(u)} title={t('admins.change_role')}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors">
                          <UserCog className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleResetPassword(u)} title={t('admins.reset_password')}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors">
                          <RotateCcw className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(u)} title={t('admins.delete')}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
            {users.length === 0 && (
              <tr><td colSpan={isSuperAdmin ? 6 : 5} className="px-5 py-8 text-center text-gray-500">{t('admins.no_admins')}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create admin modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-wl p-6 w-full max-w-md mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">{t('admins.new_admin')}</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg mb-4">{error}</div>}
            <form onSubmit={handleCreate} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                <label className="block text-xs text-gray-400 mb-1">{t('admins.col_email')}</label>
                <input type="email" required value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-wl-teal" />
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">{t('admins.select_role')}</label>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-wl-teal">
                  <option value="admin">{t('roles.admin')}</option>
                  <option value="supervisor">{t('roles.supervisor')}</option>
                  <option value="operator">{t('roles.operator')}</option>
                </select>
              </div>
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs p-3 rounded-lg">
                {t('admins.default_password_notice')}
              </div>
              <button type="submit" disabled={submitting}
                className="w-full bg-wl-teal hover:bg-wl-teal-hover text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 mt-2">
                {submitting ? t('admins.creating') : t('admins.create')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Change role modal */}
      {showRoleModal && selectedUser && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 border border-gray-700 rounded-wl p-6 w-full max-w-sm mx-4 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">{t('admins.change_role')}</h2>
              <button onClick={() => setShowRoleModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-gray-400 mb-4">{selectedUser.first_name} {selectedUser.last_name}</p>
            {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg mb-4">{error}</div>}
            <form onSubmit={handleChangeRole} className="space-y-3">
              <select value={selectedUser.newRole} onChange={e => setSelectedUser((s: any) => ({ ...s, newRole: e.target.value }))}
                className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-wl-teal">
                <option value="admin">{t('roles.admin')}</option>
                <option value="supervisor">{t('roles.supervisor')}</option>
                <option value="operator">{t('roles.operator')}</option>
              </select>
              <button type="submit" disabled={submitting}
                className="w-full bg-wl-teal hover:bg-wl-teal-hover text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50">
                {t('admins.change_role')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
