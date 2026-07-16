import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function LoginToast({ onDismiss, onLoginClick }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 5000);
    return () => clearTimeout(t);
  }, [onDismiss]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 24, x: '-50%' }}
        animate={{ opacity: 1, y: 0, x: '-50%' }}
        exit={{ opacity: 0, y: 24, x: '-50%' }}
        transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="fixed bottom-6 left-1/2 z-40 bg-[#0F1629] border border-slate-800 rounded-xl px-5 py-3 shadow-2xl flex items-center gap-3"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
        role="status"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22D3EE" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <p className="text-sm text-slate-200">
          <span className="text-slate-400">Inicia sesión</span> para crear una nota.
        </p>
        <button
          onClick={onLoginClick}
          className="ml-2 px-3 py-1.5 text-xs font-semibold text-[#0B1120] bg-cyan-400 hover:bg-cyan-500 rounded-lg transition-colors flex-shrink-0"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          Iniciar sesión
        </button>
        <button
          onClick={onDismiss}
          className="ml-1 p-1 text-slate-500 hover:text-slate-300 transition-colors flex-shrink-0"
          aria-label="Cerrar"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </motion.div>
    </AnimatePresence>
  );
}