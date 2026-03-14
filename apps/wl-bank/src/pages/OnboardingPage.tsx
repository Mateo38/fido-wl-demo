import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Shield, Mail, User, AlertCircle, CheckCircle2, Smartphone } from 'lucide-react';
import { LanguageSelector } from '../components/LanguageSelector';
import { api } from '../api';

export function OnboardingPage() {
  const [step, setStep] = useState<1 | 2>(1);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await api.register({ first_name: firstName, last_name: lastName, email });
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-10 h-10 text-violet-500" />
            <span className="text-2xl font-bold text-white">WL Bank</span>
          </div>
        </div>

        {step === 1 ? (
          <>
            <h2 className="text-xl font-bold text-white text-center mb-2">{t('onboarding.title')}</h2>
            <p className="text-slate-400 text-center mb-6">{t('onboarding.subtitle')}</p>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 flex items-center gap-2 text-sm text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('onboarding.first_name')}</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Marie"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('onboarding.last_name')}</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Dupont"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('onboarding.email')}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="marie.dupont@email.fr"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium py-3 px-4 rounded-xl transition-colors disabled:opacity-50"
              >
                {loading ? '...' : t('onboarding.continue')}
              </button>
            </form>

            <div className="text-center">
              <button
                onClick={() => navigate('/login')}
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                {t('onboarding.back_to_login')}
              </button>
            </div>

            <div className="mt-6">
              <LanguageSelector variant="login" />
            </div>
          </>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{t('onboarding.success_title')}</h2>
            <p className="text-slate-400 mb-8">{t('onboarding.success_message')}</p>

            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 mb-8 flex items-center gap-3">
              <Smartphone className="w-8 h-8 text-violet-400 flex-shrink-0" />
              <p className="text-sm text-slate-300 text-left">
                {t('onboarding.download_app')}
              </p>
            </div>

            <button
              onClick={() => navigate('/login')}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium py-3 px-4 rounded-xl transition-colors"
            >
              {t('onboarding.back_to_login')}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
