import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';

const CATEGORIAS = ['Observación', 'Alerta', 'Idea', 'Registro', 'Marcador'];

export default function NotaForm({ lng, lat, session, onClose, onSaved }) {
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState(CATEGORIAS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!titulo.trim()) return;
    setError('');
    setLoading(true);

    try {
      const { error: insertError } = await supabase
        .from('notas')
        .insert({
          titulo: titulo.trim(),
          categoria,
          lat,
          lng,
          user_id: session.user.id,
        });

      if (insertError) {
        setError(insertError.message);
        return;
      }

      setSaved(true);
      setTimeout(() => {
        onSaved?.();
        onClose();
      }, 800);
    } catch (err) {
      setError(err.message || 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const formatCoord = (val) => val.toFixed(5);

  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 40 }}
      transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="absolute top-4 right-4 z-30 w-80 bg-[#0F1629] border border-[#1E293B] rounded-xl shadow-2xl overflow-hidden"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
      role="dialog"
      aria-modal="false"
      aria-label="Nueva nota"
    >
      <div className="px-5 py-4 border-b border-[#1E293B] flex items-center justify-between">
        <h3 className="text-sm font-semibold text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
          Nueva nota
        </h3>
        <button
          onClick={onClose}
          className="p-1 text-[#64748B] hover:text-[#E5E7EB] transition-colors"
          aria-label="Cerrar"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>

      <div className="px-5 py-2.5 font-mono text-xs text-[#64748B] tabular-nums flex items-center gap-3 border-b border-[#1E293B]/50">
        <div className="flex items-center gap-1">
          <span className="text-[#475569]">lat</span>
          <span className="text-[#CBD5E1]">{formatCoord(lat)}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="text-[#475569]">lng</span>
          <span className="text-[#CBD5E1]">{formatCoord(lng)}</span>
        </div>
      </div>

      <div className="px-5 py-4">
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0, y: -4 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="mb-3 p-2 rounded-md bg-[#F87171]/10 border border-[#F87171]/30 overflow-hidden"
              role="alert"
            >
              <p className="font-mono text-[11px] text-[#F87171]">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {saved && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-3 p-2 rounded-md bg-[#22D3EE]/10 border border-[#22D3EE]/30"
            >
              <p className="font-mono text-[11px] text-[#22D3EE]">Nota guardada</p>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label htmlFor="nota-titulo" className="block mb-1.5 text-[11px] font-mono text-[#64748B] uppercase tracking-wider">
              Título
            </label>
            <input
              id="nota-titulo"
              type="text"
              required
              maxLength={200}
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              disabled={loading || saved}
              placeholder="¿Qué hay acá?"
              className="w-full px-3 py-2.5 bg-[#0B1120] border border-[#334155] rounded-lg text-[#E5E7EB] placeholder-[#475569] focus:outline-none focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE]/30 transition-all text-sm disabled:opacity-50"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            />
          </div>

          <div>
            <label htmlFor="nota-categoria" className="block mb-1.5 text-[11px] font-mono text-[#64748B] uppercase tracking-wider">
              Categoría
            </label>
            <select
              id="nota-categoria"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              disabled={loading || saved}
              className="w-full px-3 py-2.5 bg-[#0B1120] border border-[#334155] rounded-lg text-[#E5E7EB] focus:outline-none focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE]/30 transition-all text-sm appearance-none disabled:opacity-50"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              {CATEGORIAS.map((cat) => (
                <option key={cat} value={cat} className="bg-[#0B1120]">
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <motion.button
            type="submit"
            disabled={loading || saved || !titulo.trim()}
            whileHover={{ scale: loading || saved ? 1 : 1.01 }}
            whileTap={{ scale: loading || saved ? 1 : 0.99 }}
            className="w-full py-2.5 bg-[#22D3EE] hover:bg-[#06B6D4] disabled:opacity-50 disabled:cursor-not-allowed text-[#0B1120] font-semibold rounded-lg transition-colors text-sm flex items-center justify-center gap-2 mt-1"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            {loading && (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
              </svg>
            )}
            {saved ? 'Guardado' : loading ? 'Guardando...' : 'Guardar nota'}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
}
