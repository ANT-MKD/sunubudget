import React, { useEffect, useRef, useState } from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ToastContainer } from './components/ui/feedback/Toast';
import Landing from './components/Landing';
import AuthPage from './components/AuthPage';
import { AppMain } from './AppMain';

type GateView = { type: 'landing' } | { type: 'auth'; mode: 'login' | 'register' };

function AppGate() {
  const { user, ready } = useAuth();
  const [gateView, setGateView] = useState<GateView>({ type: 'landing' });
  const hadUser = useRef(false);

  useEffect(() => {
    if (user) hadUser.current = true;
    else if (hadUser.current) {
      hadUser.current = false;
      setGateView({ type: 'landing' });
    }
  }, [user]);

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    if (gateView.type === 'landing') {
      return (
        <Landing
          onLogin={() => setGateView({ type: 'auth', mode: 'login' })}
          onRegister={() => setGateView({ type: 'auth', mode: 'register' })}
        />
      );
    }
    return (
      <AuthPage
        initialMode={gateView.mode}
        onBack={() => setGateView({ type: 'landing' })}
      />
    );
  }

  return <AppMain />;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ToastContainer>
          <AppGate />
        </ToastContainer>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
