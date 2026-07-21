import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../supabaseClient';
import RadarPing from './RadarPing';

export default function Login({ onLogin, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setError('');
    setLoading(true);

    try {
      const result = isSignUp
        ? await supabase.auth.signUp({ email, password })
        : await supabase.auth.signInWithPassword({ email, password });

      const { data, error: supabaseError } = result;

      if (supabaseError) {
        setError(supabaseError.message);
        return;
      }

      if (isSignUp && !data.session) {
        setError('Revisa tu correo para confirmar el registro.');
        return;
      }

      if (data.session) onLogin(data.session);
    } catch (err) {
      setError(err.message || 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full bg-[#0B1120] text-[#E5E7EB]" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 text-[#64748B] hover:text-[#E5E7EB] transition-colors"
        aria-label="Cerrar"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-0 max-w-4xl mx-auto">
        <div className="relative flex flex-col justify-center p-8 lg:p-16 min-h-[280px] lg:min-h-[520px] bg-[#0F1629] border-b lg:border-b-0 lg:border-r border-[#1E293B]">
          <div className="flex items-center gap-2.5 mb-4">
            <RadarPing size={22} color="#22D3EE" rings={2} duration={3} glow={false} />
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Geo<span className="text-[#22D3EE]">-Notas</span>
            </h1>
          </div>

          <p className="text-[#94A3B8] text-sm mb-8 max-w-xs leading-relaxed">
            Geolocaliza tus pensamientos. Cada nota anclada al mundo real.
          </p>

          <div className="font-mono text-xs text-[#64748B] space-y-1">
            <div>lat: -34.6037</div>
            <div>lng: -58.3816</div>
            <div className="text-[#F59E0B]/80">acc: ±3m</div>
          </div>

          <div className="mt-8 hidden lg:block">
            <RadarPing size={100} color="#22D3EE" rings={3} duration={2.5} glow={false} />
          </div>

          <p className="mt-4 font-mono text-[10px] text-[#475569] tracking-wider hidden lg:block">
            FIELD NOTES · v1.0.0
          </p>
        </div>

        <div className="p-8 lg:p-12">
          <div className="max-w-sm mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={isSignUp ? 'signup' : 'signin'}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-lg font-semibold text-white mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  {isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}
                </h2>
                <p className="text-[#64748B] text-sm mb-6">
                  {isSignUp ? 'Registra una nueva bitácora' : 'Accede a tu expedición'}
                </p>
              </motion.div>
            </AnimatePresence>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -4 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="mb-4 p-3 rounded-md bg-[#F87171]/10 border border-[#F87171]/30 overflow-hidden"
                  role="alert"
                >
                  <p className="font-mono text-xs text-[#F87171]">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block mb-1.5 text-xs font-mono text-[#64748B] uppercase tracking-wider">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 bg-[#0B1120] border border-[#334155] rounded-lg text-[#E5E7EB] placeholder-[#475569] focus:outline-none focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE]/30 transition-all text-sm disabled:opacity-50"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                />
              </div>

              <div>
                <label htmlFor="password" className="block mb-1.5 text-xs font-mono text-[#64748B] uppercase tracking-wider">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    autoComplete={isSignUp ? 'new-password' : 'current-password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full px-4 py-3 pr-11 bg-[#0B1120] border border-[#334155] rounded-lg text-[#E5E7EB] placeholder-[#475569] focus:outline-none focus:border-[#22D3EE] focus:ring-1 focus:ring-[#22D3EE]/30 transition-all text-sm disabled:opacity-50"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#CBD5E1] transition-colors"
                    aria-label={showPassword ? 'Ocultar' : 'Mostrar'}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: loading ? 1 : 0.99 }}
                className="w-full py-3 bg-[#22D3EE] hover:bg-[#06B6D4] disabled:opacity-50 disabled:cursor-not-allowed text-[#0B1120] font-semibold rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
                style={{ fontFamily: "'DM Sans', sans-serif" }}
              >
                {loading && (
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.3" />
                    <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
                  </svg>
                )}
                {loading ? 'Cargando...' : isSignUp ? 'Registrarme' : 'Iniciar sesión'}
              </motion.button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
                disabled={loading}
                className="font-mono text-xs text-[#F59E0B] hover:text-[#FBBF24] transition-colors"
              >
                {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
