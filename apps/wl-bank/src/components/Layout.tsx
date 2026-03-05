import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { LanguageSelector } from './LanguageSelector';
import {
  LayoutDashboard,
  ArrowLeftRight,
  CreditCard,
  Send,
  Settings,
  LogOut,
  Shield,
} from 'lucide-react';

const navKeys = [
  { to: '/', icon: LayoutDashboard, key: 'nav.dashboard' },
  { to: '/transactions', icon: ArrowLeftRight, key: 'nav.transactions' },
  { to: '/cards', icon: CreditCard, key: 'nav.cards' },
  { to: '/transfers', icon: Send, key: 'nav.transfers' },
  { to: '/settings', icon: Settings, key: 'nav.settings' },
];

export function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-slate-950">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Shield className="w-8 h-8 text-violet-500" />
            <span className="text-xl font-bold text-white">WL Bank</span>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navKeys.map(({ to, icon: Icon, key }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-violet-500/10 text-violet-400'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {t(key)}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 px-4 py-2 mb-2">
            <div className="w-8 h-8 bg-violet-500 rounded-full flex items-center justify-center text-sm font-bold">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.first_name} {user?.last_name}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
            </div>
          </div>
          <div className="px-4 mb-2">
            <LanguageSelector />
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-2 text-sm text-slate-400 hover:text-red-400 transition-colors w-full rounded-lg hover:bg-slate-800"
          >
            <LogOut className="w-4 h-4" />
            {t('nav.logout')}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto p-8">
        <Outlet />
      </main>
    </div>
  );
}
