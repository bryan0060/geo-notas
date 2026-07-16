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
    <div className="relative w-full bg-[#0B1120] text-slate-100" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 text-slate-500 hover:text-slate-200 transition-colors"
        aria-label="Cerrar"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-0 max-w-4xl mx-auto">
        {/* LEFT: Brand panel */}
        <div className="relative flex flex-col justify-center p-8 lg:p-16 min-h-[280px] lg:min-h-[520px] bg-[#0F1629] border-b lg:border-b-0 lg:border-r border-slate-800">
          <div className="flex items-center gap-2.5 mb-4">
            <RadarPing size={22} color="#22D3EE" rings={2} duration={3} glow={false} />
            <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Geo<span className="text-cyan-400">-Notas</span>
            </h1>
          </div>

          <p className="text-slate-400 text-sm mb-8 max-w-xs leading-relaxed">
            Geolocaliza tus pensamientos. Cada nota anclada al mundo real.
          </p>

          <div className="font-mono text-xs text-slate-500 space-y-1">
            <div>lat: -34.6037</div>
            <div>lng: -58.3816</div>
            <div className="text-amber-400/80">acc: ±3m</div>
          </div>

          <div className="mt-8 hidden lg:block">
            <RadarPing size={100} color="#22D3EE" rings={3} duration={2.5} glow={false} />
          </div>

          <p className="mt-4 font-mono text-[10px] text-slate-600 tracking-wider hidden lg:block">
            FIELD NOTES · v1.0.0
          </p>
        </div>

        {/* RIGHT: Form */}
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
                <p className="text-slate-500 text-sm mb-6">
                  {isSignUp ? 'Registra una nueva bitácora' : 'Accede a tu expedición'}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -4 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -4 }}
                  transition={{ duration: 0.2 }}
                  className="mb-4 p-3 rounded-md bg-red-500/10 border border-red-500/30 overflow-hidden"
                  role="alert"
                >
                  <p className="font-mono text-xs text-red-400">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block mb-1.5 text-xs font-mono text-slate-500 uppercase tracking-wider">
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
                  className="w-full px-4 py-3 bg-[#0B1120] border border-slate-700 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all text-sm"
                  style={{ fontFamily: "'DM Sans', sans-serif" }}
                />
              </div>

              <div>
                <label htmlFor="password" className="block mb-1.5 text-xs font-mono text-slate-500 uppercase tracking-wider">
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
                    className="w-full px-4 py-3 pr-11 bg-[#0B1120] border border-slate-700 rounded-lg text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all text-sm"
                    style={{ fontFamily: "'DM Sans', sans-serif" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
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
                className="w-full py-3 bg-cyan-400 hover:bg-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-[#0B1120] font-semibold rounded-lg transition-colors text-sm flex items-center justify-center gap-2"
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
                className="font-mono text-xs text-amber-400 hover:text-amber-300 transition-colors"
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