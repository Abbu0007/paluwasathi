import { Link } from 'react-router-dom';
import { Phone } from 'lucide-react';
import { NAV_LINKS } from '../../constants/routes';

export default function Footer() {
  return (
    <footer className="bg-ink text-white mt-20">
      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src="/logo.png" alt="PaluwaSathi" className="h-9 w-auto" />
              <span className="text-xl font-black">PaluwaSathi</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed">
              Connecting people, rescuers and animals in need across Nepal.
            </p>
            <div className="flex gap-3 mt-5">
              <a href="#" aria-label="Facebook" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                </svg>
              </a>
              <a href="#" aria-label="Instagram" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5zm0 2a3 3 0 00-3 3v10a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H7zm5 3a5 5 0 110 10 5 5 0 010-10zm0 2a3 3 0 100 6 3 3 0 000-6zm5.5-.5a1 1 0 110 2 1 1 0 010-2z" />
                </svg>
              </a>
              <a href="#" aria-label="YouTube" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23 12s0-3.5-.4-5.2c-.3-.9-1-1.6-1.9-1.9C19 4.5 12 4.5 12 4.5s-7 0-8.7.4c-.9.3-1.6 1-1.9 1.9C1 8.5 1 12 1 12s0 3.5.4 5.2c.3.9 1 1.6 1.9 1.9 1.7.4 8.7.4 8.7.4s7 0 8.7-.4c.9-.3 1.6-1 1.9-1.9.4-1.7.4-5.2.4-5.2zM9.8 15.3V8.7l5.7 3.3z" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2.5">
              {NAV_LINKS.slice(1).map((link) => (
                <li key={link.path}>
                  <Link to={link.path} className="text-white/60 text-sm hover:text-white transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Emergency Contacts</h4>
            <ul className="space-y-3">
              <li>
                <a href="tel:014469601" className="flex items-center gap-2 text-white/60 text-sm hover:text-white transition-colors">
                  <Phone size={14} /> Animal Nepal - 01-4469601
                </a>
              </li>
              <li>
                <a href="tel:9800000000" className="flex items-center gap-2 text-white/60 text-sm hover:text-white transition-colors">
                  <Phone size={14} /> Paws Nepal - 9800000000
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Stay Updated</h4>
            <p className="text-white/60 text-sm mb-3">
              Get rescue updates in your area.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 px-4 py-2.5 rounded-full bg-white/10 text-white placeholder:text-white/40 text-sm outline-none border border-white/10 focus:border-white/30"
              />
              <button className="bg-accent text-white px-4 py-2.5 rounded-full text-sm font-bold hover:bg-accent-dark transition-colors">
                Subscribe
              </button>
            </div>
          </div>

        </div>

        <div className="border-t border-white/10 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center gap-3">
          <p className="text-white/50 text-sm">
            © 2025 PaluwaSathi Nepal. All rights reserved.
          </p>
          <div className="flex gap-6 text-white/50 text-sm">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>

      </div>
    </footer>
  );
}