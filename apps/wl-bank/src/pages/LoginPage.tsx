import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFido } from '../hooks/useFido';
import { useTranslation } from 'react-i18next';
import { Shield, Fingerprint, Mail, Lock, AlertCircle } from 'lucide-react';
import { LanguageSelector } from '../components/LanguageSelector';

const HERO_IMAGE = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1920&q=80&auto=format&fit=crop';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPasskeyPrompt, setShowPasskeyPrompt] = useState(false);
  const { login } = useAuth();
  const { authenticateWithPasskey, authenticateConditional, abortConditionalMediation, registerPasskey, loading: fidoLoading, error: fidoError } = useFido();
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    let cancelled = false;

    const initConditionalUI = async () => {
      if (
        !window.PublicKeyCredential ||
        !PublicKeyCredential.isConditionalMediationAvailable
      ) return;

      const available = await PublicKeyCredential.isConditionalMediationAvailable();
      if (!available || cancelled) return;

      const success = await authenticateConditional();
      if (success && !cancelled) {
        navigate('/');
      }
    };

    initConditionalUI();

    return () => {
      cancelled = true;
      abortConditionalMediation();
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    abortConditionalMediation();
    setError('');
    setLoginLoading(true);
    try {
      await login(email, password);
      if (window.PublicKeyCredential) {
        setShowPasskeyPrompt(true);
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setError(err.message || t('login.invalid_credentials'));
    } finally {
      setLoginLoading(false);
    }
  };

  const handlePasskeyLogin = async () => {
    setError('');
    const success = await authenticateWithPasskey();
    if (success) navigate('/');
  };

  const handleRegisterPasskey = async () => {
    const success = await registerPasskey('Mon appareil');
    if (success) navigate('/');
  };

  const skipPasskey = () => navigate('/');

  if (showPasskeyPrompt) {
    return (
      <div className="min-h-screen flex">
        {/* Left: Hero image */}
        <div className="hidden lg:block lg:w-1/2 relative">
          <img src={HERO_IMAGE} alt="" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-black/60" />
          <div className="absolute bottom-12 left-12 right-12">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-8 h-8 text-white" />
              <span className="text-2xl font-bold text-white">WL Bank</span>
            </div>
            <p className="text-white/80 text-lg">{t('login.passkey_hero')}</p>
          </div>
        </div>

        {/* Right: Passkey prompt */}
        <div className="w-full lg:w-1/2 bg-slate-950 flex items-center justify-center p-8">
          <div className="w-full max-w-md text-center">
            <div className="w-16 h-16 bg-violet-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Fingerprint className="w-8 h-8 text-violet-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">{t('login.passkey_title')}</h2>
            <p className="text-slate-400 mb-8">
              {t('login.passkey_description')}
            </p>
            {fidoError && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 text-sm text-red-400">
                {fidoError}
              </div>
            )}
            <button
              onClick={handleRegisterPasskey}
              disabled={fidoLoading}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium py-3 px-4 rounded-xl transition-colors disabled:opacity-50 mb-3"
            >
              {fidoLoading ? t('login.registering') : t('login.register_passkey')}
            </button>
            <button
              onClick={skipPasskey}
              className="w-full text-slate-400 hover:text-white font-medium py-3 px-4 rounded-xl transition-colors"
            >
              {t('login.later')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left: Hero image */}
      <div className="hidden lg:block lg:w-1/2 relative">
        <img src={HERO_IMAGE} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-black/50" />
        <div className="absolute bottom-12 left-12 right-12">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-8 h-8 text-white" />
            <span className="text-2xl font-bold text-white">WL Bank</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 leading-tight" style={{ whiteSpace: 'pre-line' }}>
            {t('login.hero_title')}
          </h1>
          <p className="text-white/70 text-lg max-w-md">
            {t('login.hero_subtitle')}
          </p>
        </div>
      </div>

      {/* Right: Login form */}
      <div className="w-full lg:w-1/2 bg-slate-950 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile-only logo */}
          <div className="text-center mb-8 lg:mb-10">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="w-10 h-10 text-violet-500" />
              <span className="text-2xl font-bold text-white">WL Bank</span>
            </div>
            <p className="text-slate-400">{t('login.connect_to_space')}</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 flex items-center gap-2 text-sm text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}
          {fidoError && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mb-4 text-sm text-red-400">
              {fidoError}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('login.email')}</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="marie.dupont@email.fr"
                  autoComplete="username webauthn"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">{t('login.password')}</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-11 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium py-3 px-4 rounded-xl transition-colors disabled:opacity-50"
            >
              {loginLoading ? t('login.logging_in') : t('login.submit')}
            </button>
          </form>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-950 text-slate-500">{t('login.or')}</span>
            </div>
          </div>

          <button
            onClick={handlePasskeyLogin}
            disabled={fidoLoading}
            className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium py-3 px-4 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Fingerprint className="w-5 h-5 text-violet-400" />
            {fidoLoading ? t('login.verifying') : t('login.passkey_login')}
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-slate-950 text-slate-500">{t('login.no_account')}</span>
            </div>
          </div>

          <button
            onClick={() => navigate('/register')}
            className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium py-3 px-4 rounded-xl transition-colors"
          >
            {t('login.open_account')}
          </button>

          <div className="mt-6">
            <LanguageSelector variant="login" />
          </div>
        </div>
      </div>
    </div>
  );
}
