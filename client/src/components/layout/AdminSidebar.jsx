import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Siren, PawPrint, FileText, HandCoins,
  Receipt, Calendar, MessageCircle, Search, Menu, X, LogOut,
  Home, ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { label: 'Overview', path: '/admin', Icon: LayoutDashboard },
  { label: 'Users', path: '/admin/users', Icon: Users },
];

const COLLECTIONS = [
  { label: 'Rescues', path: '/admin/rescues', Icon: Siren },
  { label: 'Pets', path: '/admin/pets', Icon: PawPrint },
  { label: 'Adoptions', path: '/admin/adoptions', Icon: FileText },
  { label: 'Campaigns', path: '/admin/campaigns', Icon: HandCoins },
  { label: 'Donations', path: '/admin/donations', Icon: Receipt },
  { label: 'Tasks', path: '/admin/tasks', Icon: Users },
  { label: 'Lost & Found', path: '/admin/lostfound', Icon: Search },
  { label: 'Posts', path: '/admin/posts', Icon: MessageCircle },
  { label: 'Events', path: '/admin/events', Icon: Calendar },
];

export default function AdminSidebar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  useEffect(() => { setOpen(false); }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : 'auto';
    return function () { document.body.style.overflow = 'auto'; };
  }, [open]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const initials = user && user.name
    ? user.name.split(' ').map(function (n) { return n[0]; }).slice(0, 2).join('').toUpperCase()
    : 'A';

  const photoUrl = user && user.profilePhoto ? user.profilePhoto.url : null;

  const asideClass = open
    ? 'w-[260px] bg-ink h-screen flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 translate-x-0'
    : 'w-[260px] bg-ink h-screen flex flex-col fixed left-0 top-0 z-50 transition-transform duration-300 -translate-x-full lg:translate-x-0';

  const linkClass = (active) => active
    ? 'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold bg-white/10 text-white'
    : 'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-white/50 hover:text-white hover:bg-white/5 transition-colors';

  return (
    <>
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-ink h-[64px] flex items-center justify-between px-4">
        <button onClick={function () { setOpen(true); }} className="text-white" aria-label="Open menu">
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-2">
          <ShieldCheck size={18} className="text-white" />
          <span className="text-sm font-black text-white">Admin</span>
        </div>
        <span className="w-8 h-8 rounded-full bg-white/15 text-white text-xs font-bold flex items-center justify-center">
          {initials}
        </span>
      </div>

      {open && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={function () { setOpen(false); }} />
      )}

      <aside className={asideClass}>
        <div className="flex items-center justify-between px-5 h-[72px] border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
              <ShieldCheck size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-black text-white leading-tight">Admin Panel</p>
              <p className="text-[11px] text-white/40">PaluwaSathi</p>
            </div>
          </div>
          <button onClick={function () { setOpen(false); }} className="lg:hidden text-white/40" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        <div className="flex items-center gap-3 mx-3 mt-3 p-3 bg-white/5 rounded-xl shrink-0">
          {photoUrl ? (
            <img src={photoUrl} alt="" className="w-9 h-9 rounded-full object-cover shrink-0" />
          ) : (
            <span className="w-9 h-9 rounded-full bg-white/15 text-white text-xs font-bold flex items-center justify-center shrink-0">
              {initials}
            </span>
          )}
          <div className="min-w-0">
            <p className="font-bold text-white text-sm truncate">{user && user.name}</p>
            <p className="text-[11px] text-accent font-bold uppercase tracking-wide">Administrator</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <div className="space-y-1 mb-6">
            {NAV.map(function (item) {
              const Icon = item.Icon;
              const active = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path} className={linkClass(active)}>
                  <Icon size={17} className="shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <p className="px-4 mb-2 text-[11px] font-bold uppercase tracking-wider text-white/30">
            Collections
          </p>
          <div className="space-y-1">
            {COLLECTIONS.map(function (item) {
              const Icon = item.Icon;
              const active = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path} className={linkClass(active)}>
                  <Icon size={17} className="shrink-0" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="px-3 py-4 border-t border-white/10 space-y-1 shrink-0">
          <Link to="/" className={linkClass(false)}>
            <Home size={17} />
            Back to Site
          </Link>
          <Link to="/dashboard" className={linkClass(false)}>
            <LayoutDashboard size={17} />
            My Dashboard
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={17} />
            Log Out
          </button>
        </div>
      </aside>
    </>
  );
}