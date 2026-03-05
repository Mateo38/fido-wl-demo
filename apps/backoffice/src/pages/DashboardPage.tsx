import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '../hooks/useLocale';
import { api } from '../api';
import { Users, Key, ShieldCheck, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const COLORS = ['#277777', '#1F5F5F', '#3A9A9A', '#4DB8B8'];

export function DashboardPage() {
  const { t } = useTranslation();
  const { formatDate } = useLocale();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboard().then(res => setData(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading || !data) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-wl-teal border-t-transparent rounded-full" /></div>;

  const stats = [
    { label: t('dashboard.users'), value: data.totalUsers, icon: Users, color: 'bg-wl-teal-light text-wl-teal' },
    { label: t('dashboard.passkeys'), value: data.totalPasskeys, icon: Key, color: 'bg-purple-500/10 text-purple-400' },
    { label: t('dashboard.authentications'), value: data.totalAuthentications, icon: ShieldCheck, color: 'bg-green-500/10 text-green-400' },
    { label: t('dashboard.success_rate'), value: `${data.successRate}%`, icon: TrendingUp, color: 'bg-amber-500/10 text-amber-400' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">{t('dashboard.title')}</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-gray-900 border border-gray-800 rounded-wl p-5">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-sm text-gray-400">{label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activity chart */}
        <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-wl p-5">
          <h2 className="text-lg font-semibold text-white mb-4">{t('dashboard.activity_title')}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.recentActivity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#9CA3AF' }} tickFormatter={(v: string) => formatDate(v, { day: '2-digit', month: '2-digit' })} />
              <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} labelFormatter={(v: string) => formatDate(v)} />
              <Bar dataKey="registrations" name={t('dashboard.registrations')} fill="#277777" radius={[4, 4, 0, 0]} />
              <Bar dataKey="authentications" name={t('dashboard.chart_authentications')} fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Device types */}
        <div className="bg-gray-900 border border-gray-800 rounded-wl p-5">
          <h2 className="text-lg font-semibold text-white mb-4">{t('dashboard.device_types')}</h2>
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
                <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500 text-center py-12">{t('dashboard.no_data')}</p>
          )}
        </div>
      </div>
    </div>
  );
}
