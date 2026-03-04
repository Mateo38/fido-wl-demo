import { useState, useEffect } from 'react';
import { api } from '../api';
import { Activity, Database, HardDrive, Clock, RefreshCw } from 'lucide-react';

export function HealthPage() {
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
        <h1 className="text-2xl font-bold text-gray-900">Santé du serveur</h1>
        <button onClick={loadHealth} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Rafraîchir
        </button>
      </div>

      {!health ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Status */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Activity className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">Statut général</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${health.status === 'healthy' ? 'bg-green-500' : health.status === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'}`} />
              <span className="text-lg font-medium text-gray-900 capitalize">{health.status}</span>
            </div>
          </div>

          {/* Uptime */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">Uptime</h2>
            </div>
            <p className="text-lg font-medium text-gray-900">{formatUptime(health.uptime)}</p>
          </div>

          {/* Database */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">Base de données</h2>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Connexion</span>
                <span className={`text-sm font-medium ${health.database.connected ? 'text-green-600' : 'text-red-600'}`}>
                  {health.database.connected ? 'Connectée' : 'Déconnectée'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Latence</span>
                <span className="text-sm font-medium text-gray-900">{health.database.latency} ms</span>
              </div>
            </div>
          </div>

          {/* Memory */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <HardDrive className="w-5 h-5 text-gray-400" />
              <h2 className="text-lg font-semibold text-gray-900">Mémoire</h2>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Utilisée</span>
                <span className="font-medium text-gray-900">{health.memory.used} MB / {health.memory.total} MB</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className={`h-2 rounded-full transition-all ${health.memory.percentage > 80 ? 'bg-red-500' : health.memory.percentage > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}
                  style={{ width: `${health.memory.percentage}%` }} />
              </div>
              <p className="text-right text-xs text-gray-400">{health.memory.percentage}%</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
