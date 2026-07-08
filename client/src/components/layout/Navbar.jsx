import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, AlertTriangle, LayoutDashboard, LogOut, ChevronDown } from 'lucide-react';
import { NAV_LINKS } from '../../constants/routes';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    setMobileOpen(false);
    navigate('/');
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-[72px] flex items-center justify-between">
        {/* Logo — links to dashboard if logged in */}
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2 shrink-0">
          <img src="/logo.png" alt="PaluwaSathi" className="h-9 w-auto" />
          <span className="text-lg sm:text-xl font-black text-ink">PaluwaSathi</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-3 py-2 rounded-full text-sm font-bold transition-colors ${
                isActive(link.path)
                  ? 'bg-primary-50 text-primary-dark'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop right side */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            to="/emergency"
            className="flex items-center gap-1.5 bg-danger text-white px-4 py-2 rounded-full text-sm font-bold hover:opacity-90 transition-opacity"
          >
            <AlertTriangle size={16} />
            Emergency
          </Link>

          {isAuthenticated ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <span className="w-8 h-8 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center">
                  {initials}
                </span>
                <span className="text-sm font-bold text-ink max-w-[100px] truncate">
                  {user?.name?.split(' ')[0]}
                </span>
                <ChevronDown size={16} className="text-gray-400" />
              </button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-gray-100 shadow-lg py-2 z-20">
                    <Link
                      to="/dashboard"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-gray-700 hover:bg-gray-50"
                    >
                      <LayoutDashboard size={16} />
                      Dashboard
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-bold text-danger hover:bg-red-50"
                    >
                      <LogOut size={16} />
                      Log Out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link to="/login">
                <Button variant="ghost" size="sm">Login</Button>
              </Link>
              <Link to="/signup">
                <Button variant="primary" size="sm">Register</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="lg:hidden text-ink p-1"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-4 sm:px-6 py-4 max-h-[calc(100vh-72px)] overflow-y-auto">
          {/* User info if logged in */}
          {isAuthenticated && (
            <div className="flex items-center gap-3 px-3 py-3 mb-3 bg-gray-50 rounded-xl">
              <span className="w-10 h-10 rounded-full bg-primary text-white font-bold flex items-center justify-center">
                {initials}
              </span>
              <div className="min-w-0">
                <p className="font-bold text-ink text-sm truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1">
            {isAuthenticated && (
              <Link
                to="/dashboard"
                onClick={closeMobile}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50"
              >
                <LayoutDashboard size={18} />
                Dashboard
              </Link>
            )}

            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={closeMobile}
                className={`px-3 py-3 rounded-xl text-sm font-bold ${
                  isActive(link.path)
                    ? 'bg-primary-50 text-primary-dark'
                    : 'text-gray-600'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Emergency always visible */}
            <Link
              to="/emergency"
              onClick={closeMobile}
              className="flex items-center gap-2 px-3 py-3 mt-2 rounded-xl text-sm font-bold text-danger bg-red-50"
            >
              <AlertTriangle size={18} />
              Emergency
            </Link>

            {/* Auth buttons */}
            <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-gray-100">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 px-3 py-3 rounded-full text-sm font-bold text-danger border-2 border-red-100"
                >
                  <LogOut size={18} />
                  Log Out
                </button>
              ) : (
                <>
                  <Link to="/login" onClick={closeMobile}>
                    <Button variant="outline" size="sm" className="w-full">Login</Button>
                  </Link>
                  <Link to="/signup" onClick={closeMobile}>
                    <Button variant="primary" size="sm" className="w-full">Register</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}