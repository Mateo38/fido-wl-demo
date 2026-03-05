import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '../hooks/useLocale';
import { api } from '../api';
import { Key, Shield } from 'lucide-react';

export function UsersPage() {
  const { t } = useTranslation();
  const { formatDate } = useLocale();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getUsers().then(res => setUsers(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-6 h-6 border-2 border-wl-teal border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-wl-dark mb-6">{t('users.title')}</h1>

      <div className="bg-white border border-gray-200 rounded-wl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-5 py-3 font-medium text-wl-gray">{t('users.col_user')}</th>
              <th className="text-left px-5 py-3 font-medium text-wl-gray">{t('users.col_email')}</th>
              <th className="text-left px-5 py-3 font-medium text-wl-gray">{t('users.col_role')}</th>
              <th className="text-center px-5 py-3 font-medium text-wl-gray">{t('users.col_passkeys')}</th>
              <th className="text-left px-5 py-3 font-medium text-wl-gray">{t('users.col_registration')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u: any) => (
              <tr key={u.id} className="hover:bg-wl-teal-light/30 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-wl-teal-light text-wl-teal rounded-full flex items-center justify-center text-xs font-bold">
                      {u.first_name[0]}{u.last_name[0]}
                    </div>
                    <span className="font-medium text-wl-dark">{u.first_name} {u.last_name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-wl-gray">{u.email}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                    u.role === 'admin' ? 'bg-amber-50 text-amber-700' : 'bg-wl-teal-light text-wl-teal'
                  }`}>
                    {u.role === 'admin' && <Shield className="w-3 h-3" />}
                    {u.role}
                  </span>
                </td>
                <td className="px-5 py-3 text-center">
                  <span className="inline-flex items-center gap-1 text-wl-dark">
                    <Key className="w-3.5 h-3.5 text-wl-gray" />
                    {u.passkey_count}
                  </span>
                </td>
                <td className="px-5 py-3 text-wl-gray">
                  {formatDate(u.created_at)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
