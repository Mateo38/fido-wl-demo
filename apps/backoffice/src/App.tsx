import { BrowserRouter, Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect, createContext, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from './api';
import { DashboardPage } from './pages/DashboardPage';
import { ClientsPage } from './pages/ClientsPage';
import { UsersPage } from './pages/UsersPage';
import { LogsPage } from './pages/LogsPage';
import { HealthPage } from './pages/HealthPage';
import { LanguageSelector } from './components/LanguageSelector';
import { LayoutDashboard, Users, ShieldCheck, ScrollText, Activity, LogOut, Lock, Mail } from 'lucide-react';

interface AdminUser { id: string; email: string; first_name: string; last_name: string; role: string; }

const AuthContext = createContext<{
  user: AdminUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
} | null>(null);

function useAdminAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AuthProvider');
  return ctx;
}

function AdminLogin() {
  const { login } = useAdminAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-wl p-8 w-full max-w-md shadow-lg">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-3 mb-3">
            <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none">
              <rect width="40" height="40" rx="8" fill="#277777" />
              <path d="M12 20 L17 28 L28 13" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-xl font-bold text-white">{t('login.title')}</span>
          </div>
          <p className="text-sm text-gray-400">{t('login.subtitle')}</p>
          <p className="text-xs text-gray-500 mt-1">{t('login.powered_by')}</p>
        </div>
        {error && <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm p-3 rounded-lg mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@wlbank.fr" required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-wl-teal" />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
              className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-wl-teal" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-wl-teal hover:bg-wl-teal-hover text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50">
            {loading ? t('login.logging_in') : t('login.submit')}
          </button>
        </form>
        <div className="mt-4">
          <LanguageSelector variant="login" />
        </div>
      </div>
    </div>
  );
}

const navKeys = [
  { to: '/', icon: LayoutDashboard, key: 'nav.dashboard' },
  { to: '/clients', icon: Users, key: 'nav.clients' },
  { to: '/users', icon: ShieldCheck, key: 'nav.admins' },
  { to: '/logs', icon: ScrollText, key: 'nav.logs' },
  { to: '/health', icon: Activity, key: 'nav.health' },
];

function AdminLayout() {
  const { user, logout } = useAdminAuth();
  const { t } = useTranslation();
  return (
    <div className="flex h-screen bg-gray-950">
      <aside className="w-56 bg-wl-dark flex flex-col">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <svg viewBox="0 0 32 32" className="w-7 h-7" fill="none">
              <rect width="32" height="32" rx="6" fill="#277777" />
              <path d="M10 16 L14 22 L22 11" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div>
              <span className="text-base font-bold text-white">Backoffice</span>
              <p className="text-[10px] text-white/40 -mt-0.5">Worldline</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {navKeys.map(({ to, icon: Icon, key }) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-wl-teal text-white' : 'text-white/60 hover:bg-white/10 hover:text-white'}`}>
              <Icon className="w-4 h-4" />
              {t(key)}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <p className="text-xs text-white/40 px-3 mb-2">{user?.first_name} {user?.last_name}</p>
          <div className="px-3 mb-2">
            <LanguageSelector variant="sidebar" />
          </div>
          <button onClick={logout} className="flex items-center gap-2 px-3 py-2 text-sm text-white/50 hover:text-red-400 transition-colors w-full rounded-lg hover:bg-white/5">
            <LogOut className="w-4 h-4" /> {t('nav.logout')}
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">
        <Routes>
          <Route index element={<DashboardPage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/users" element={<UsersPage />} />
          <Route path="/logs" element={<LogsPage />} />
          <Route path="/health" element={<HealthPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) {
      fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json())
        .then(data => { if (data.success && data.data.role === 'admin') setUser(data.data); else localStorage.removeItem('admin_token'); })
        .catch(() => localStorage.removeItem('admin_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const loginFn = async (email: string, password: string) => {
    const res = await api.login(email, password);
    if (res.data.user.role !== 'admin') throw new Error('Admin access required');
    localStorage.setItem('admin_token', res.data.token);
    setUser(res.data.user);
  };

  const logout = () => { localStorage.removeItem('admin_token'); setUser(null); };

  if (loading) return <div className="flex items-center justify-center h-screen bg-gray-950"><div className="animate-spin w-8 h-8 border-2 border-wl-teal border-t-transparent rounded-full" /></div>;

  return (
    <AuthContext.Provider value={{ user, login: loginFn, logout }}>
      <BrowserRouter>
        {user ? <AdminLayout /> : <AdminLogin />}
      </BrowserRouter>
    </AuthContext.Provider>
  );
}
