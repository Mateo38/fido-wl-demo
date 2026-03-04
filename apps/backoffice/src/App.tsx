import { BrowserRouter, Routes, Route, Navigate, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect, createContext, useContext } from 'react';
import { api } from './api';
import { DashboardPage } from './pages/DashboardPage';
import { UsersPage } from './pages/UsersPage';
import { LogsPage } from './pages/LogsPage';
import { HealthPage } from './pages/HealthPage';
import { LayoutDashboard, Users, ScrollText, Activity, LogOut, Shield, Lock, Mail } from 'lucide-react';

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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white border border-gray-200 rounded-xl p-8 w-full max-w-md shadow-sm">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Shield className="w-8 h-8 text-indigo-600" />
            <span className="text-xl font-bold text-gray-900">FIDO Backoffice</span>
          </div>
          <p className="text-sm text-gray-500">Administration du serveur FIDO</p>
        </div>
        {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@wlbank.fr" required
              className="w-full border border-gray-300 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
              className="w-full border border-gray-300 rounded-lg py-2.5 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50">
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        <p className="text-center text-xs text-gray-400 mt-4">sophie.bernard@wlbank.fr / Admin1234!</p>
      </div>
    </div>
  );
}

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/users', icon: Users, label: 'Utilisateurs' },
  { to: '/logs', icon: ScrollText, label: 'Logs' },
  { to: '/health', icon: Activity, label: 'Santé' },
];

function AdminLayout() {
  const { user, logout } = useAdminAuth();
  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-56 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-indigo-600" />
            <span className="text-lg font-bold text-gray-900">Backoffice</span>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 px-3 mb-2">{user?.first_name} {user?.last_name}</p>
          <button onClick={logout} className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-red-600 transition-colors w-full rounded-lg hover:bg-gray-50">
            <LogOut className="w-4 h-4" /> Déconnexion
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-6">
        <Routes>
          <Route index element={<DashboardPage />} />
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

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    if (res.data.user.role !== 'admin') throw new Error('Accès admin requis');
    localStorage.setItem('admin_token', res.data.token);
    setUser(res.data.user);
  };

  const logout = () => { localStorage.removeItem('admin_token'); setUser(null); };

  if (loading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full" /></div>;

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      <BrowserRouter>
        {user ? <AdminLayout /> : <AdminLogin />}
      </BrowserRouter>
    </AuthContext.Provider>
  );
}
