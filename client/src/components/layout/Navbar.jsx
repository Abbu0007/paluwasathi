import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Menu, X, ChevronDown, LogOut, LayoutDashboard,
  Siren, MessageCircle, Calendar, Info,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const PRIMARY_NAV = [
  { label: 'Rescue', path: '/rescue' },
  { label: 'Adopt', path: '/adopt' },
  { label: 'Lost & Found', path: '/lost-found' },
  { label: 'Volunteer', path: '/volunteer' },
  { label: 'Donate', path: '/donate' },
];

const MORE_NAV = [
  {
    label: 'Community',
    path: '/community',
    Icon: MessageCircle,
    desc: 'Stories, tips and questions',
  },
  {
    label: 'Events',
    path: '/events',
    Icon: Calendar,
    desc: 'Adoption fairs and camps',
  },
  {
    label: 'About',
    path: '/about',
    Icon: Info,
    desc: 'Our mission and welfare guides',
  },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [mobileMoreOpen, setMobileMoreOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const moreRef = useRef(null);
  const userRef = useRef(null);
  const closeTimer = useRef(null);

  useEffect(() => {
    setMobileOpen(false);
    setMoreOpen(false);
    setUserMenuOpen(false);
    setMobileMoreOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : 'auto';
    return function () { document.body.style.overflow = 'auto'; };
  }, [mobileOpen]);

  useEffect(() => {
    const handleClickOutside = function (e) {
      if (moreRef.current && !moreRef.current.contains(e.target)) setMoreOpen(false);
      if (userRef.current && !userRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return function () { document.removeEventListener('mousedown', handleClickOutside); };
  }, []);

  useEffect(() => {
    const handleEsc = function (e) {
      if (e.key === 'Escape') {
        setMoreOpen(false);
        setUserMenuOpen(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener('keydown', handleEsc);
    return function () { document.removeEventListener('keydown', handleEsc); };
  }, []);

  const openMore = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setMoreOpen(true);
  };

  const scheduleCloseMore = () => {
    closeTimer.current = setTimeout(function () { setMoreOpen(false); }, 140);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');
  const isMoreActive = MORE_NAV.some(function (item) { return isActive(item.path); });

  const initials = user && user.name
    ? user.name.split(' ').map(function (n) { return n[0]; }).slice(0, 2).join('').toUpperCase()
    : 'U';

  const moreBtnClass = (moreOpen || isMoreActive)
    ? 'flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-bold text-primary-dark bg-primary-50 transition-colors'
    : 'flex items-center gap-1 px-3 py-2 rounded-xl text-sm font-bold text-gray-600 hover:text-ink hover:bg-gray-50 transition-colors';

  const chevronClass = moreOpen
    ? 'transition-transform duration-200 rotate-180'
    : 'transition-transform duration-200';

  const dropdownClass = moreOpen
    ? 'absolute top-full right-0 mt-2 w-[300px] bg-white rounded-2xl border border-gray-100 shadow-xl p-2 opacity-100 translate-y-0 transition-all duration-150 pointer-events-auto'
    : 'absolute top-full right-0 mt-2 w-[300px] bg-white rounded-2xl border border-gray-100 shadow-xl p-2 opacity-0 -translate-y-1 transition-all duration-150 pointer-events-none';

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 h-[72px] flex items-center justify-between gap-4">

          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src="/logo.png" alt="PaluwaSathi" className="h-9 w-auto" />
            <span className="text-lg font-black text-ink hidden sm:block">PaluwaSathi</span>
          </Link>

          <div className="hidden lg:flex items-center gap-0.5">
            {PRIMARY_NAV.map(function (item) {
              const active = isActive(item.path);
              const linkClass = active
                ? 'px-3 py-2 rounded-xl text-sm font-bold text-primary-dark bg-primary-50 transition-colors'
                : 'px-3 py-2 rounded-xl text-sm font-bold text-gray-600 hover:text-ink hover:bg-gray-50 transition-colors';
              return (
                <Link key={item.path} to={item.path} className={linkClass}>
                  {item.label}
                </Link>
              );
            })}

            <div
              ref={moreRef}
              className="relative"
              onMouseEnter={openMore}
              onMouseLeave={scheduleCloseMore}
            >
              <button
                onClick={function () { setMoreOpen(!moreOpen); }}
                className={moreBtnClass}
                aria-expanded={moreOpen}
                aria-haspopup="true"
              >
                More
                <ChevronDown size={15} className={chevronClass} />
              </button>

              <div className={dropdownClass}>
                {MORE_NAV.map(function (item) {
                  const Icon = item.Icon;
                  const active = isActive(item.path);
                  const itemClass = active
                    ? 'flex items-start gap-3 p-3 rounded-xl bg-primary-50 transition-colors'
                    : 'flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors';

                  return (
                    <Link key={item.path} to={item.path} className={itemClass}>
                      <span className="w-9 h-9 rounded-lg bg-primary-50 flex items-center justify-center shrink-0">
                        <Icon size={17} className="text-primary" />
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-ink text-sm">{item.label}</p>
                        <p className="text-xs text-gray-500 leading-snug">{item.desc}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/rescue/report"
              className="hidden sm:flex items-center gap-1.5 px-4 py-2.5 rounded-full bg-danger text-white text-sm font-bold hover:bg-red-700 transition-colors"
            >
              <Siren size={15} />
              <span className="hidden md:inline">Report Rescue</span>
              <span className="md:hidden">Report</span>
            </Link>

            {user ? (
              <div ref={userRef} className="relative hidden lg:block">
                <button
                  onClick={function () { setUserMenuOpen(!userMenuOpen); }}
                  className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full hover:bg-gray-50 transition-colors"
                >
                  <span className="w-9 h-9 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center">
                    {initials}
                  </span>
                  <ChevronDown size={15} className="text-gray-400" />
                </button>

                {userMenuOpen && (
                  <div className="absolute top-full right-0 mt-2 w-[220px] bg-white rounded-2xl border border-gray-100 shadow-xl p-2">
                    <div className="px-3 py-2.5 border-b border-gray-50 mb-1">
                      <p className="font-bold text-ink text-sm truncate">{user.name}</p>
                      <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                    </div>
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50"
                    >
                      <LayoutDashboard size={16} />
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-danger hover:bg-red-50"
                    >
                      <LogOut size={16} />
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden lg:flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2.5 rounded-full text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2.5 rounded-full bg-primary text-white text-sm font-bold hover:bg-primary-dark transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}

            <button
              onClick={function () { setMobileOpen(true); }}
              className="lg:hidden text-ink p-1"
              aria-label="Open menu"
            >
              <Menu size={26} />
            </button>
          </div>
        </nav>
      </header>

      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-50"
          onClick={function () { setMobileOpen(false); }}
        />
      )}

      <div
        className={mobileOpen
          ? 'lg:hidden fixed right-0 top-0 bottom-0 w-[300px] bg-white z-50 flex flex-col transition-transform duration-300 translate-x-0'
          : 'lg:hidden fixed right-0 top-0 bottom-0 w-[300px] bg-white z-50 flex flex-col transition-transform duration-300 translate-x-full'}
      >
        <div className="flex items-center justify-between px-5 h-[72px] border-b border-gray-100 shrink-0">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="PaluwaSathi" className="h-8 w-auto" />
            <span className="font-black text-ink">PaluwaSathi</span>
          </Link>
          <button onClick={function () { setMobileOpen(false); }} className="text-gray-400" aria-label="Close menu">
            <X size={22} />
          </button>
        </div>

        {user && (
          <Link
            to="/dashboard"
            className="flex items-center gap-3 mx-3 mt-3 p-3 bg-gray-50 rounded-xl shrink-0"
          >
            <span className="w-10 h-10 rounded-full bg-primary text-white font-bold flex items-center justify-center shrink-0">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="font-bold text-ink text-sm truncate">{user.name}</p>
              <p className="text-xs text-gray-500">View dashboard</p>
            </div>
          </Link>
        )}

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {PRIMARY_NAV.map(function (item) {
            const active = isActive(item.path);
            const linkClass = active
              ? 'block px-4 py-3 rounded-xl text-sm font-bold bg-primary-50 text-primary-dark'
              : 'block px-4 py-3 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50';
            return (
              <Link key={item.path} to={item.path} className={linkClass}>
                {item.label}
              </Link>
            );
          })}

          <div className="pt-2">
            <button
              onClick={function () { setMobileMoreOpen(!mobileMoreOpen); }}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50"
            >
              More
              <ChevronDown
                size={16}
                className={mobileMoreOpen ? 'transition-transform rotate-180' : 'transition-transform'}
              />
            </button>

            {mobileMoreOpen && (
              <div className="mt-1 ml-2 pl-3 border-l-2 border-gray-100 space-y-1">
                {MORE_NAV.map(function (item) {
                  const Icon = item.Icon;
                  const active = isActive(item.path);
                  const linkClass = active
                    ? 'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold bg-primary-50 text-primary-dark'
                    : 'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50';
                  return (
                    <Link key={item.path} to={item.path} className={linkClass}>
                      <Icon size={16} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        <div className="px-3 py-4 border-t border-gray-100 space-y-2 shrink-0">
          <Link
            to="/rescue/report"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-full bg-danger text-white text-sm font-bold"
          >
            <Siren size={16} /> Report a Rescue
          </Link>

          {user ? (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-full border-2 border-gray-200 text-danger text-sm font-bold"
            >
              <LogOut size={16} /> Log Out
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Link to="/login">
                <button className="w-full py-3 rounded-full border-2 border-gray-200 text-gray-600 text-sm font-bold">
                  Log In
                </button>
              </Link>
              <Link to="/signup">
                <button className="w-full py-3 rounded-full bg-primary text-white text-sm font-bold">
                  Sign Up
                </button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  );
}