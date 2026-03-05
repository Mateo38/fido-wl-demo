import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api';
import { Activity, Database, HardDrive, Clock, RefreshCw } from 'lucide-react';

export function HealthPage() {
  const { t } = useTranslation();
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadHealth = () => {
    setLoading(true);
    api.getHealth().then(res => setHealth(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { loadHealth(); }, []);

  const formatUptime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h ${m}m ${s}s`;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-wl-dark">{t('health.title')}</h1>
        <button onClick={loadHealth} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-wl-gray-dark hover:bg-gray-50 transition-colors disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {t('health.refresh')}
        </button>
      </div>

      {!health ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-wl-teal border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Status */}
          <div className="bg-white border border-gray-200 rounded-wl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-5 h-5 text-wl-gray" />
              <h2 className="text-lg font-semibold text-wl-dark">{t('health.general_status')}</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${health.status === 'healthy' ? 'bg-green-500' : health.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'}`} />
              <span className="text-lg font-medium text-wl-dark capitalize">{health.status}</span>
            </div>
          </div>

          {/* Uptime */}
          <div className="bg-white border border-gray-200 rounded-wl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-5 h-5 text-wl-gray" />
              <h2 className="text-lg font-semibold text-wl-dark">{t('health.uptime')}</h2>
            </div>
            <p className="text-lg font-medium text-wl-dark">{formatUptime(health.uptime)}</p>
          </div>

          {/* Database */}
          <div className="bg-white border border-gray-200 rounded-wl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-5 h-5 text-wl-gray" />
              <h2 className="text-lg font-semibold text-wl-dark">{t('health.database')}</h2>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-wl-gray">{t('health.connection')}</span>
                <span className={`text-sm font-medium ${health.database.connected ? 'text-green-600' : 'text-red-600'}`}>
                  {health.database.connected ? t('health.connected') : t('health.disconnected')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-wl-gray">{t('health.latency')}</span>
                <span className="text-sm font-medium text-wl-dark">{health.database.latency} ms</span>
              </div>
            </div>
          </div>

          {/* Memory */}
          <div className="bg-white border border-gray-200 rounded-wl p-6">
            <div className="flex items-center gap-3 mb-4">
              <HardDrive className="w-5 h-5 text-wl-gray" />
              <h2 className="text-lg font-semibold text-wl-dark">{t('health.memory')}</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-wl-gray">{t('health.used')}</span>
                <span className="font-medium text-wl-dark">{health.memory.used} MB / {health.memory.total} MB</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className={`h-2 rounded-full transition-all ${health.memory.percentage > 80 ? 'bg-red-500' : health.memory.percentage > 60 ? 'bg-yellow-500' : 'bg-wl-teal'}`}
                  style={{ width: `${health.memory.percentage}%` }} />
              </div>
              <p className="text-right text-xs text-wl-gray">{health.memory.percentage}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
