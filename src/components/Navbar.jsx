import { useState, useEffect } from 'react';
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
    <header className={`fixed top-0 left-0 right-0 z-50 h-16 transition-colors ${scrolled ? 'bg-[#0B1120]/95 backdrop-blur-md border-b border-[#1E293B]' : 'bg-transparent'}`}>
      <div className="h-full px-4 md:px-8 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <RadarPing size={22} color="#22D3EE" rings={2} duration={3} glow={false} />
          <h1 className="text-xl font-bold tracking-tight text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Geo<span className="text-[#22D3EE]">-Notas</span>
          </h1>
        </div>

        <div className="flex items-center gap-3" data-menu>
          {session ? (
            <>
              <span className="hidden md:block font-mono text-xs text-[#94A3B8] truncate max-w-[200px]">
                {session.user.email}
              </span>
              <button
                onClick={onLogout}
                className="px-4 py-2 text-sm text-[#CBD5E1] hover:text-white border border-[#334155] hover:border-[#64748B] rounded-lg transition-colors"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <button
              onClick={onLoginClick}
              className="px-4 py-2 text-sm font-semibold text-[#0B1120] bg-[#22D3EE] hover:bg-[#06B6D4] rounded-lg transition-colors"
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
