import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { RegisterPage } from '../pages/RegisterPage';
import { LoginPage } from '../pages/LoginPage';

interface AuthGateProps {
  children: React.ReactNode;
}

export function AuthGate({ children }: AuthGateProps) {
  const { isLoggedIn } = useAuth();
  const [view, setView] = useState<'register' | 'login'>('register');

  if (isLoggedIn) {
    return <>{children}</>;
  }

  if (view === 'login') {
    return <LoginPage onSwitchToRegister={() => setView('register')} />;
  }

  return <RegisterPage onSwitchToLogin={() => setView('login')} />;
}
