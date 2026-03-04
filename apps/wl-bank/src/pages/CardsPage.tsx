import { useState, useEffect } from 'react';
import { api } from '../api';
import { CreditCard, Wifi, Globe, Shield } from 'lucide-react';

export function CardsPage() {
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCards().then((res) => setCards(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full" /></div>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Mes cartes</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {cards.map((card: any) => (
          <div key={card.id} className="space-y-4">
            {/* Card visual */}
            <div className={`rounded-2xl p-6 h-48 flex flex-col justify-between ${
              card.card_tier === 'metal' ? 'bg-gradient-to-br from-slate-700 to-slate-900' :
              card.card_tier === 'premium' ? 'bg-gradient-to-br from-violet-700 to-violet-900' :
              'bg-gradient-to-br from-slate-800 to-slate-900'
            } border border-slate-700`}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Shield className="w-6 h-6 text-white/80" />
                  <span className="text-white/80 text-sm font-medium">WL Bank</span>
                </div>
                <span className="text-xs uppercase text-white/60 font-medium">{card.card_network} {card.card_tier}</span>
              </div>
              <div>
                <p className="text-xl font-mono text-white tracking-widest mb-2">•••• •••• •••• {card.card_number_last4}</p>
                <div className="flex justify-between items-end">
                  <p className="text-xs text-white/60">EXPIRE {card.expiry_date}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${card.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'}`}>
                    {card.status === 'active' ? 'Active' : card.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Card settings */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white">Paramètres</h3>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Wifi className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-300">Sans contact</span>
                </div>
                <span className={`text-xs ${card.contactless_enabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {card.contactless_enabled ? 'Activé' : 'Désactivé'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-slate-400" />
                  <span className="text-sm text-slate-300">Paiements en ligne</span>
                </div>
                <span className={`text-xs ${card.online_payments_enabled ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {card.online_payments_enabled ? 'Activé' : 'Désactivé'}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-800 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Plafond quotidien</span>
                  <span className="text-white">{parseFloat(card.daily_limit).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Plafond mensuel</span>
                  <span className="text-white">{parseFloat(card.monthly_limit).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
