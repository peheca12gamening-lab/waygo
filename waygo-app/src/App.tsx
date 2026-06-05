import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BottomNav } from './components/ui';
import {
  MapPage, QuestsPage, ForYouPage, ProfilePage,
  LeaderboardPage, VouchersPage, PartnerDashboard, BusinessRegister, AdminPanel,
  LandmarksPage,
} from './pages';
import { AuthProvider } from './context/AuthContext';
import { AuthGate } from './context/AuthGate';
import { UIProvider } from './context/UIContext';
import { AppProvider, useApp } from './context/AppContext';
import { ToastProvider } from './components/shared/Toast';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppContent() {
  useApp();
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', transition: 'background 0.3s, color 0.3s' }}>
      <div className="max-w-[430px] mx-auto relative">
        <Routes>
          <Route path="/" element={<MapPage />} />
          <Route path="/quests" element={<QuestsPage />} />
          <Route path="/foryou" element={<ForYouPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/landmarks" element={<LandmarksPage />} />
          <Route path="/vouchers" element={<VouchersPage />} />
          <Route path="/partner" element={<PartnerDashboard />} />
          <Route path="/business" element={<BusinessRegister />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <BottomNav />
      </div>
    </div>
  );
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg-primary)' }}>
          <div className="text-center p-8">
            <div className="text-6xl mb-4">🫠</div>
            <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--text-primary)' }}>Something went wrong</h2>
            <button onClick={() => { this.setState({ hasError: false }); window.location.reload(); }}
              className="px-6 py-3 rounded-xl text-white font-bold"
              style={{ background: 'linear-gradient(135deg,#FF90B5,#B090FF,#7AC8FF)' }}>
              Try Again
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppProvider>
          <ToastProvider>
            <AuthProvider>
              <UIProvider>
                <AuthGate>
                  <AppContent />
                </AuthGate>
              </UIProvider>
            </AuthProvider>
          </ToastProvider>
        </AppProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
