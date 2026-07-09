import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Siren, Heart, HandCoins,
  Users, Calendar, MessageCircle, Settings, LogOut, Menu, X,
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
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Close drawer on route change
  useEffect(() => { setOpen(false); }, [location.pathname]);

  // Lock body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [open]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  const sidebarContent = (
    <>
      <div className="flex items-center justify-between px-6 h-[72px] border-b border-gray-100">
        <Link to="/dashboard" className="flex items-center gap-2">
          <img src="/logo.png" alt="PaluwaSathi" className="h-8 w-auto" />
          <span className="text-lg font-black text-ink">PaluwaSathi</span>
        </Link>
        <button
          onClick={() => setOpen(false)}
          className="lg:hidden text-gray-400"
          aria-label="Close menu"
        >
          <X size={22} />
        </button>
      </div>

      {/* User card — mobile only */}
      <div className="lg:hidden flex items-center gap-3 mx-3 mt-3 p-3 bg-gray-50 rounded-xl">
        <span className="w-10 h-10 rounded-full bg-primary text-white font-bold flex items-center justify-center shrink-0">
          {initials}
        </span>
        <div className="min-w-0">
          <p className="font-bold text-ink text-sm truncate">{user?.name}</p>
          <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
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
              <Icon size={18} className="shrink-0" />
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

      <div className="m-3 p-4 rounded-2xl bg-primary text-white shrink-0">
        <p className="text-xs font-bold uppercase tracking-wide text-white/70 mb-3">Your Impact</p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between"><span className="text-white/80">Rescues</span><span className="font-bold">0</span></div>
          <div className="flex justify-between"><span className="text-white/80">Animals helped</span><span className="font-bold">0</span></div>
          <div className="flex justify-between"><span className="text-white/80">Donated</span><span className="font-bold">NPR 0</span></div>
          <div className="flex justify-between"><span className="text-white/80">Volunteer hrs</span><span className="font-bold">0</span></div>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 h-[64px] flex items-center justify-between px-4">
        <button onClick={() => setOpen(true)} className="text-ink" aria-label="Open menu">
          <Menu size={26} />
        </button>
        <Link to="/dashboard" className="flex items-center gap-2">
          <img src="/logo.png" alt="PaluwaSathi" className="h-8 w-auto" />
          <span className="text-base font-black text-ink">PaluwaSathi</span>
        </Link>
        <span className="w-9 h-9 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center">
          {initials}
        </span>
      </div>

      {/* Overlay */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar — drawer on mobile, fixed on desktop */}
      <aside
        className={`w-[280px] lg:w-[260px] bg-white border-r border-gray-100 h-screen flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}