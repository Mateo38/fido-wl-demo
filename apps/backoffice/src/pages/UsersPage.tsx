import { useState, useEffect } from 'react';
import { api } from '../api';
import { Key, Shield } from 'lucide-react';

export function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getUsers().then(res => setUsers(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Utilisateurs</h1>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left px-5 py-3 font-medium text-gray-500">Utilisateur</th>
              <th className="text-left px-5 py-3 font-medium text-gray-500">Email</th>
              <th className="text-left px-5 py-3 font-medium text-gray-500">Rôle</th>
              <th className="text-center px-5 py-3 font-medium text-gray-500">Passkeys</th>
              <th className="text-left px-5 py-3 font-medium text-gray-500">Inscription</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u: any) => (
              <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">
                      {u.first_name[0]}{u.last_name[0]}
                    </div>
                    <span className="font-medium text-gray-900">{u.first_name} {u.last_name}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-gray-500">{u.email}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                    u.role === 'admin' ? 'bg-amber-50 text-amber-700' : 'bg-blue-50 text-blue-700'
                  }`}>
                    {u.role === 'admin' && <Shield className="w-3 h-3" />}
                    {u.role}
                  </span>
                </td>
                <td className="px-5 py-3 text-center">
                  <span className="inline-flex items-center gap-1 text-gray-700">
                    <Key className="w-3.5 h-3.5 text-gray-400" />
                    {u.passkey_count}
                  </span>
                </td>
                <td className="px-5 py-3 text-gray-500">
                  {new Date(u.created_at).toLocaleDateString('fr-FR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
