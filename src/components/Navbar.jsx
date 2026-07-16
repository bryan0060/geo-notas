import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import RadarPing from './RadarPing';

export default function Navbar({ session, onLoginClick, onLogout }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e) => { if (!e.target.closest('[data-menu]')) setMenuOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [menuOpen]);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 h-16 transition-colors ${scrolled ? 'bg-[#0B1120]/95 backdrop-blur-md border-b border-slate-800' : 'bg-transparent'}`}>
      <div className="h-full px-4 md:px-8 flex items-center justify-between max-w-7xl mx-auto">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <RadarPing size={22} color="#22D3EE" rings={2} duration={3} glow={false} />
          <h1 className="text-xl font-bold tracking-tight text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Geo<span className="text-cyan-400">-Notas</span>
          </h1>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3" data-menu>
          {session ? (
            <>
              <span className="hidden md:block font-mono text-xs text-slate-400 truncate max-w-[200px]">
                {session.user.email}
              </span>
              <button
                onClick={onLogout}
                className="px-4 py-2 text-sm text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 rounded-lg transition-colors"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <button
              onClick={onLoginClick}
              className="px-4 py-2 text-sm font-semibold text-[#0B1120] bg-cyan-400 hover:bg-cyan-500 rounded-lg transition-colors"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              Iniciar sesión
            </button>
          )}
        </div>
      </div>
    </header>
  );
}