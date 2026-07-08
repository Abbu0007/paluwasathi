import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Siren, Heart, HandCoins,
  Users, Calendar, MessageCircle, Settings, LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { label: 'Overview', path: '/dashboard', Icon: LayoutDashboard },
  { label: 'My Rescues', path: '/dashboard/rescues', Icon: Siren },
  { label: 'Saved Pets', path: '/dashboard/saved-pets', Icon: Heart },
  { label: 'Donations', path: '/dashboard/donations', Icon: HandCoins },
  { label: 'Volunteer Tasks', path: '/dashboard/volunteer', Icon: Users },
  { label: 'Events', path: '/dashboard/events', Icon: Calendar },
  { label: 'Community', path: '/community', Icon: MessageCircle },
];

export default function DashboardSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="w-[260px] bg-white border-r border-gray-100 min-h-screen flex flex-col fixed left-0 top-0">
      <Link to="/" className="flex items-center gap-2 px-6 h-[72px] border-b border-gray-100">
        <img src="/logo.png" alt="PaluwaSathi" className="h-8 w-auto" />
        <span className="text-lg font-black text-ink">PaluwaSathi</span>
      </Link>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ label, path, Icon }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                active
                  ? 'bg-primary-50 text-primary-dark border-l-4 border-primary'
                  : 'text-gray-600 hover:bg-gray-50 border-l-4 border-transparent'
              }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-gray-100 space-y-1">
        <Link
          to="/dashboard/settings"
          className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50"
        >
          <Settings size={18} />
          Settings
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-danger hover:bg-red-50"
        >
          <LogOut size={18} />
          Log Out
        </button>
      </div>

      <div className="m-3 p-4 rounded-2xl bg-primary text-white">
        <p className="text-xs font-bold uppercase tracking-wide text-white/70 mb-3">Your Impact</p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-white/80">Rescues</span><span className="font-bold">0</span></div>
          <div className="flex justify-between"><span className="text-white/80">Animals helped</span><span className="font-bold">0</span></div>
          <div className="flex justify-between"><span className="text-white/80">Donated</span><span className="font-bold">NPR 0</span></div>
          <div className="flex justify-between"><span className="text-white/80">Volunteer hrs</span><span className="font-bold">0</span></div>
        </div>
      </div>
    </aside>
  );
}