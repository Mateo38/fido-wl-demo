import { useState, useEffect } from 'react';
import { api } from '../api';
import { Users, Key, ShieldCheck, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd'];

export function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboard().then(res => setData(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading || !data) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" /></div>;

  const stats = [
    { label: 'Utilisateurs', value: data.totalUsers, icon: Users, color: 'bg-blue-50 text-blue-600' },
    { label: 'Passkeys', value: data.totalPasskeys, icon: Key, color: 'bg-purple-50 text-purple-600' },
    { label: 'Authentifications', value: data.totalAuthentications, icon: ShieldCheck, color: 'bg-green-50 text-green-600' },
    { label: 'Taux de succès', value: `${data.successRate}%`, icon: TrendingUp, color: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard FIDO</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white border border-gray-200 rounded-xl p-5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity chart */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Activité FIDO (30 jours)</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.recentActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} tickFormatter={(v: string) => new Date(v).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip labelFormatter={(v: string) => new Date(v).toLocaleDateString('fr-FR')} />
              <Bar dataKey="registrations" name="Enregistrements" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="authentications" name="Authentifications" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Device types */}
        <div className="bg-white border border-gray-200 rounded-xl p-5">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Types d'appareils</h2>
          {data.passkeysByDevice.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.passkeysByDevice}
                  dataKey="count"
                  nameKey="device_type"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ device_type, count }: any) => `${device_type} (${count})`}
                >
                  {data.passkeysByDevice.map((_: any, i: number) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-400 text-center py-12">Aucune donnée</p>
          )}
        </div>
      </div>
    </div>
  );
}
