import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFido } from '../hooks/useFido';
import { api } from '../api';
import { Fingerprint, Trash2, Plus, Smartphone, Monitor, AlertCircle } from 'lucide-react';

export function SettingsPage() {
  const { user } = useAuth();
  const { registerPasskey, loading: fidoLoading, error: fidoError } = useFido();
  const [passkeys, setPasskeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const loadPasskeys = () => {
    api.getPasskeys().then((res) => setPasskeys(res.data)).finally(() => setLoading(false));
  };

  useEffect(() => { loadPasskeys(); }, []);

  const handleRegister = async () => {
    const name = prompt('Nom de la passkey (ex: MacBook Pro, iPhone)') || 'Ma passkey';
    const success = await registerPasskey(name);
    if (success) {
      setMessage('Passkey enregistrée avec succès');
      loadPasskeys();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette passkey ?')) return;
    try {
      await api.deletePasskey(id);
      loadPasskeys();
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Paramètres</h1>

      {/* Profile */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">Profil</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-400">Prénom</span>
            <p className="text-white mt-1">{user?.first_name}</p>
          </div>
          <div>
            <span className="text-slate-400">Nom</span>
            <p className="text-white mt-1">{user?.last_name}</p>
          </div>
          <div className="col-span-2">
            <span className="text-slate-400">Email</span>
            <p className="text-white mt-1">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Passkeys */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Fingerprint className="w-5 h-5 text-violet-400" />
            Passkeys
          </h2>
          <button onClick={handleRegister} disabled={fidoLoading}
            className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm rounded-xl transition-colors disabled:opacity-50">
            <Plus className="w-4 h-4" />
            {fidoLoading ? 'Enregistrement...' : 'Ajouter une passkey'}
          </button>
        </div>

        {fidoError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 text-sm text-red-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {fidoError}
          </div>
        )}

        {message && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-3 mb-4 text-sm text-emerald-400">
            {message}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full" />
          </div>
        ) : passkeys.length === 0 ? (
          <div className="text-center py-8">
            <Fingerprint className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400 mb-1">Aucune passkey enregistrée</p>
            <p className="text-sm text-slate-500">Ajoutez une passkey pour une connexion plus rapide et sécurisée</p>
          </div>
        ) : (
          <div className="space-y-3">
            {passkeys.map((pk: any) => (
              <div key={pk.id} className="flex items-center justify-between bg-slate-800/50 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  {pk.device_type === 'multiDevice' ? (
                    <Smartphone className="w-5 h-5 text-violet-400" />
                  ) : (
                    <Monitor className="w-5 h-5 text-violet-400" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-white">{pk.friendly_name || 'Passkey'}</p>
                    <p className="text-xs text-slate-500">
                      Créée le {new Date(pk.created_at).toLocaleDateString('fr-FR')}
                      {pk.last_used_at && ` · Dernière utilisation ${new Date(pk.last_used_at).toLocaleDateString('fr-FR')}`}
                    </p>
                  </div>
                </div>
                <button onClick={() => handleDelete(pk.id)} className="p-2 text-slate-400 hover:text-red-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
