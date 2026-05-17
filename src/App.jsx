import { useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import UpdatePassword from './components/UpdatePassword';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    // Check initial URL for recovery token (HashRouter puts tokens in the hash)
    if (window.location.hash.includes('type=recovery')) {
      setIsRecovery(true);
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovery(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen bg-beige-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-terracotta-200 border-t-terracotta-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="h-screen w-full bg-beige-50">
        <main className="h-full w-full">
          <Routes>
            <Route 
              path="/" 
              element={
                isRecovery ? <UpdatePassword onPasswordUpdated={() => setIsRecovery(false)} /> :
                !session ? <Auth /> : <Navigate to="/dashboard" />
              } 
            />
            <Route 
              path="/dashboard" 
              element={
                isRecovery ? <Navigate to="/" /> :
                session ? <Dashboard session={session} /> : <Navigate to="/" />
              } 
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
