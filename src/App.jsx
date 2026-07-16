import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from './supabaseClient';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Map from './components/Map';
import NotaForm from './components/NotaForm';
import LoginToast from './components/LoginToast';

function App() {
  const [session, setSession] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [clickCoords, setClickCoords] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  const handleMapClick = (coords) => {
    setClickCoords(coords);

    if (session) {
      setShowForm(true);
      setShowToast(false);
    } else {
      setShowToast(true);
      setShowForm(false);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setClickCoords(null);
  };

  const handleDismissToast = () => {
    setShowToast(false);
    setClickCoords(null);
  };

  const handleToastLoginClick = () => {
    setShowToast(false);
    setShowLoginModal(true);
  };

  const handleLoginSuccess = (s) => {
    setSession(s);
    setShowLoginModal(false);
    // Si el usuario estaba intentando crear una nota, abrimos el form con las coords guardadas
    if (clickCoords && s) {
      setShowForm(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1120] text-slate-100">
      <Navbar
        session={session}
        onLoginClick={() => setShowLoginModal(true)}
        onLogout={() => supabase.auth.signOut()}
      />

      <AnimatePresence>
        {showLoginModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setShowLoginModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative w-full max-w-3xl rounded-2xl overflow-hidden border border-slate-800 shadow-2xl"
            >
              <Login onLogin={handleLoginSuccess} onClose={() => setShowLoginModal(false)} />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Map full-screen behind navbar */}
      <main className="fixed inset-0 top-16" style={{ zIndex: 1 }}>
        <Map session={session} onMapClick={handleMapClick} />

        {/* NotaForm panel */}
        <AnimatePresence>
          {showForm && clickCoords && session && (
            <NotaForm
              lng={clickCoords.lng}
              lat={clickCoords.lat}
              session={session}
              onClose={handleCloseForm}
              onSaved={() => setClickCoords(null)}
            />
          )}
        </AnimatePresence>
      </main>

      {/* LoginToast */}
      <AnimatePresence>
        {showToast && !showForm && (
          <LoginToast
            onDismiss={handleDismissToast}
            onLoginClick={handleToastLoginClick}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;