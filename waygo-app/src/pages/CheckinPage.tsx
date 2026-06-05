import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Keyboard, MapPin, AlertTriangle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { QRScanner, CodeInput, Celebration } from '../components/checkin';
import { getBusinessById } from '../lib/db';
import { formatDistance, haversine } from '../utils/geo';

type CheckinMode = 'qr' | 'code';

export function CheckinPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { businessId } = useParams<{ businessId?: string }>();
  const { user } = useAuth();
  const { t } = useApp();

  const [mode, setMode] = useState<CheckinMode>('qr');
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null);
  const [_code, setCode] = useState('');
  const [distance, setDistance] = useState<number | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ valid: boolean; reason?: string; xp?: number } | null>(null);

  useEffect(() => {
    if (location.state?.business) {
      setSelectedBusiness(location.state.business);
    } else if (businessId) {
      getBusinessById(businessId).then(b => {
        if (b) setSelectedBusiness(b);
      });
    }
  }, [location.state, businessId]);

  useEffect(() => {
    if (selectedBusiness && user) {
      const dist = haversine(
        42.1420, 24.7490,
        selectedBusiness.lat ?? selectedBusiness.categories?.slug === 'museum' ? 42.1441 : 42.1428,
        selectedBusiness.lng ?? 24.7501
      );
      setDistance(dist);
    }
  }, [selectedBusiness, user]);

  const handleCodeComplete = useCallback((enteredCode: string) => {
    if (!selectedBusiness || isProcessing) return;
    setIsProcessing(true);
    const valid = enteredCode.toUpperCase() === (selectedBusiness.checkin_code ?? '').toUpperCase();
    if (valid) {
      setCode(enteredCode);
      setResult({ valid: true, xp: 50 });
      setTimeout(() => {
        setShowCelebration(true);
        setIsProcessing(false);
      }, 500);
    } else {
      setResult({ valid: false, reason: t.incorrectCode });
      setIsProcessing(false);
    }
  }, [selectedBusiness, isProcessing, t]);

  const handleQRDetected = useCallback((qrCode: string) => {
    handleCodeComplete(qrCode);
  }, [handleCodeComplete]);

  const handleDismissCelebration = () => {
    setShowCelebration(false);
    setCode('');
    navigate('/');
  };

  return (
    <div className="min-h-screen pb-24 pt-safe" style={{ background: 'var(--rainbow-bg)' }}>
      <div className="p-4">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full" style={{ background: 'var(--bg-chip)' }}>
            <ArrowLeft size={24} style={{ color: 'var(--text-primary)' }} />
          </button>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{t.checkInPage}</h1>
        </div>

        {selectedBusiness ? (
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl p-4" style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)' }}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ background: 'linear-gradient(135deg,#F0E8FF,#E8F0FF)' }}>
                  {selectedBusiness.categories?.emoji ?? '📍'}
                </div>
                <div>
                  <h2 className="font-semibold" style={{ color: 'var(--text-primary)' }}>{selectedBusiness.name}</h2>
                  <p className="text-sm" style={{ color: 'var(--text-soft)' }}>{selectedBusiness.address}</p>
                </div>
              </div>

              {distance !== null && (
                <div className={`mt-4 flex items-center gap-2 p-3 rounded-xl ${
                  distance <= (selectedBusiness.geofence_radius ?? 150)
                    ? 'text-green-600' : 'text-amber-600'
                }`}
                  style={{ background: distance <= (selectedBusiness.geofence_radius ?? 150) ? '#E8FFF5' : '#FFF3E0' }}>
                  <MapPin size={18} />
                  <span className="text-sm font-medium">
                    {formatDistance(distance)} {t.away}
                    {distance > (selectedBusiness.geofence_radius ?? 150) && (
                      <span className="ml-2">({selectedBusiness.geofence_radius ?? 150}m {t.required})</span>
                    )}
                  </span>
                </div>
              )}
            </motion.div>

            {result && !result.valid && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="rounded-xl p-4 flex items-center gap-3"
                style={{ background: '#FFF0F3', border: '1.5px solid #FFD0DC' }}>
                <AlertTriangle className="text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{result.reason}</p>
              </motion.div>
            )}

            <div className="flex gap-2 p-1 rounded-xl" style={{ background: 'var(--bg-chip)' }}>
              <button onClick={() => setMode('qr')}
                className="flex-1 py-3 rounded-lg text-sm font-medium transition-colors"
                style={{ background: mode === 'qr' ? 'var(--bg-card)' : 'transparent', color: mode === 'qr' ? 'var(--text-primary)' : 'var(--text-soft)' }}>
                <QrCode size={18} className="inline mr-2" />{t.qrScanner}
              </button>
              <button onClick={() => setMode('code')}
                className="flex-1 py-3 rounded-lg text-sm font-medium transition-colors"
                style={{ background: mode === 'code' ? 'var(--bg-card)' : 'transparent', color: mode === 'code' ? 'var(--text-primary)' : 'var(--text-soft)' }}>
                <Keyboard size={18} className="inline mr-2" />{t.manualCode}
              </button>
            </div>

            <AnimatePresence mode="wait">
              {mode === 'qr' ? (
                <motion.div key="qr" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                  <QRScanner onCodeDetected={handleQRDetected} isActive={!isProcessing} />
                </motion.div>
              ) : (
                <motion.div key="code" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                  className="rounded-2xl p-6" style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)' }}>
                  <CodeInput onComplete={handleCodeComplete} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-4" style={{ background: 'var(--bg-chip)' }}>
              📍
            </div>
            <h2 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{t.noLocationSelected}</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--text-soft)' }}>{t.selectPlace}</p>
            <button onClick={() => navigate('/')} className="px-6 py-3 rounded-xl text-white font-semibold"
              style={{ background: 'linear-gradient(135deg,#B090FF,#7AC8FF)' }}>{t.goToMap}</button>
          </div>
        )}
      </div>

      <Celebration
        xpEarned={result?.xp || 75}
        streak={(user?.streak_current ?? 0) + 1}
        questProgress={{ current: 2, total: 5 }}
        isVisible={showCelebration}
        onDismiss={handleDismissCelebration}
      />
    </div>
  );
}
