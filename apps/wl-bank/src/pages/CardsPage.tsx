import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocale } from '../hooks/useLocale';
import { api } from '../api';
import { CreditCard, Wifi, Globe, Shield, Lock, ChevronLeft, ChevronRight } from 'lucide-react';

export function CardsPage() {
  const { t } = useTranslation();
  const { formatCurrency } = useLocale();
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);
  const [animating, setAnimating] = useState(false);

  // Local toggle state per card (keyed by card id)
  const [toggles, setToggles] = useState<Record<string, { contactless: boolean; online: boolean; locked: boolean }>>({});

  useEffect(() => {
    api.getCards().then((res) => {
      setCards(res.data);
      const initial: Record<string, any> = {};
      res.data.forEach((c: any) => {
        initial[c.id] = {
          contactless: c.contactless_enabled,
          online: c.online_payments_enabled,
          locked: c.status !== 'active',
        };
      });
      setToggles(initial);
    }).finally(() => setLoading(false));
  }, []);

  const goTo = (dir: 'left' | 'right') => {
    if (animating || cards.length <= 1) return;
    setDirection(dir);
    setAnimating(true);
    setTimeout(() => {
      setActiveIndex((prev) =>
        dir === 'right'
          ? (prev + 1) % cards.length
          : (prev - 1 + cards.length) % cards.length
      );
      setDirection(null);
      setAnimating(false);
    }, 300);
  };

  const toggle = (field: 'contactless' | 'online' | 'locked') => {
    const card = cards[activeIndex];
    if (!card) return;
    setToggles((prev) => ({
      ...prev,
      [card.id]: { ...prev[card.id], [field]: !prev[card.id][field] },
    }));
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full" /></div>;

  const card = cards[activeIndex];
  const tgl = card ? toggles[card.id] : null;

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">{t('cards.title')}</h1>

      <div className="max-w-md mx-auto px-0 sm:px-12">
        {/* Carousel */}
        <div className="relative">
          {/* Navigation arrows */}
          {cards.length > 1 && (
            <>
              <button
                onClick={() => goTo('left')}
                className="absolute -left-2 sm:-left-12 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => goTo('right')}
                className="absolute -right-2 sm:-right-12 top-1/2 -translate-y-1/2 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Card visual */}
          <div className="overflow-hidden rounded-2xl">
            <div
              className={`transition-all duration-300 ease-in-out ${
                direction === 'right' ? '-translate-x-full opacity-0' :
                direction === 'left' ? 'translate-x-full opacity-0' :
                'translate-x-0 opacity-100'
              }`}
            >
              {card && (
                <div className={`rounded-2xl p-6 h-52 flex flex-col justify-between ${
                  card.card_tier === 'metal' ? 'bg-gradient-to-br from-slate-700 to-slate-900' :
                  card.card_tier === 'premium' ? 'bg-gradient-to-br from-violet-700 to-violet-900' :
                  'bg-gradient-to-br from-slate-800 to-slate-900'
                } border border-slate-700 ${tgl?.locked ? 'opacity-60' : ''}`}>
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
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        tgl?.locked ? 'bg-red-500/20 text-red-300' :
                        card.status === 'active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-red-500/20 text-red-300'
                      }`}>
                        {tgl?.locked ? t('cards.locked') : card.status === 'active' ? t('cards.active') : card.status}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Dots indicator */}
          {cards.length > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {cards.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { if (!animating) setActiveIndex(i); }}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === activeIndex ? 'bg-violet-500 w-6' : 'bg-slate-600 hover:bg-slate-500'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Card settings */}
        {card && tgl && (
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mt-6 space-y-4">
            <h3 className="text-sm font-semibold text-white mb-4">{t('cards.settings')}</h3>

            {/* Sans contact toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                  <Wifi className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm text-white">{t('cards.contactless')}</p>
                  <p className="text-xs text-slate-500">{t('cards.nfc_payments')}</p>
                </div>
              </div>
              <button
                onClick={() => toggle('contactless')}
                className={`relative w-11 h-6 rounded-full transition-colors ${tgl.contactless ? 'bg-violet-600' : 'bg-slate-700'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${tgl.contactless ? 'translate-x-5' : ''}`} />
              </button>
            </div>

            {/* Paiement en ligne toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center">
                  <Globe className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm text-white">{t('cards.online_payments')}</p>
                  <p className="text-xs text-slate-500">{t('cards.online_purchases')}</p>
                </div>
              </div>
              <button
                onClick={() => toggle('online')}
                className={`relative w-11 h-6 rounded-full transition-colors ${tgl.online ? 'bg-violet-600' : 'bg-slate-700'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${tgl.online ? 'translate-x-5' : ''}`} />
              </button>
            </div>

            {/* Separator */}
            <div className="border-t border-slate-800" />

            {/* Verrouiller la carte toggle */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tgl.locked ? 'bg-red-500/20' : 'bg-slate-800'}`}>
                  <Lock className={`w-4 h-4 ${tgl.locked ? 'text-red-400' : 'text-slate-400'}`} />
                </div>
                <div>
                  <p className={`text-sm ${tgl.locked ? 'text-red-400' : 'text-white'}`}>{t('cards.lock_card')}</p>
                  <p className="text-xs text-slate-500">{t('cards.lock_temporarily')}</p>
                </div>
              </div>
              <button
                onClick={() => toggle('locked')}
                className={`relative w-11 h-6 rounded-full transition-colors ${tgl.locked ? 'bg-red-500' : 'bg-slate-700'}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${tgl.locked ? 'translate-x-5' : ''}`} />
              </button>
            </div>

            {/* Limits */}
            <div className="border-t border-slate-800 pt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">{t('cards.daily_limit')}</span>
                <span className="text-white">{formatCurrency(parseFloat(card.daily_limit))}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">{t('cards.monthly_limit')}</span>
                <span className="text-white">{formatCurrency(parseFloat(card.monthly_limit))}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
