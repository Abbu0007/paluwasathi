import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, AlertTriangle } from 'lucide-react';
import { NAV_LINKS } from '../../constants/routes';
import Button from '../ui/Button';

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="PaluwaSathi" className="h-9 w-auto" />
          <span className="text-xl font-black text-ink">PaluwaSathi</span>
        </Link>

        {/* Desktop nav */}
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

        {/* Desktop right */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            to="/emergency"
            className="flex items-center gap-1.5 bg-danger text-white px-4 py-2 rounded-full text-sm font-bold hover:opacity-90 transition-opacity"
          >
            <AlertTriangle size={16} />
            Emergency
          </Link>
          <Link to="/login">
            <Button variant="ghost" size="sm">Login</Button>
          </Link>
          <Link to="/signup">
            <Button variant="primary" size="sm">Register</Button>
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="lg:hidden text-ink"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 px-6 py-4">
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className={`px-3 py-3 rounded-xl text-sm font-bold ${
                  isActive(link.path)
                    ? 'bg-primary-50 text-primary-dark'
                    : 'text-gray-600'
                }`}
              >
                {link.label}
              </Link>
            ))}
            <div className="flex flex-col gap-2 mt-3 pt-3 border-t border-gray-100">
              <Link to="/login"><Button variant="outline" size="sm" className="w-full">Login</Button></Link>
              <Link to="/signup"><Button variant="primary" size="sm" className="w-full">Register</Button></Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}