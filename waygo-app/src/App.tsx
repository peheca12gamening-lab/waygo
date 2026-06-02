import { Routes, Route, Navigate } from 'react-router-dom';
import { BottomNav } from './components/ui';
import {
  MapPage, QuestsPage, ForYouPage, ProfilePage,
  LeaderboardPage, VouchersPage, PartnerDashboard, AdminPanel,
} from './pages';
import { AuthProvider } from './context/AuthContext';
import { AuthGate } from './context/AuthGate';
import { UIProvider } from './context/UIContext';
import { AppProvider, useApp } from './context/AppContext';

function AppContent() {
  useApp(); // subscribes to theme changes
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', transition: 'background 0.3s, color 0.3s' }}>
      <div className="max-w-[430px] mx-auto relative">
        <Routes>
          <Route path="/" element={<MapPage />} />
          <Route path="/quests" element={<QuestsPage />} />
          <Route path="/foryou" element={<ForYouPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
          <Route path="/vouchers" element={<VouchersPage />} />
          <Route path="/partner" element={<PartnerDashboard />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <BottomNav />
      </div>
    </div>
  );
}

function App() {
  return (
    <AppProvider>
      <AuthProvider>
        <UIProvider>
          <AuthGate>
            <AppContent />
          </AuthGate>
        </UIProvider>
      </AuthProvider>
    </AppProvider>
  );
}

export default App;
