import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Keyboard, MapPin, AlertTriangle, ArrowLeft } from 'lucide-react';
import type { PartnerBusiness } from '../types';
import { DEMO_USER } from '../data/seed';
import { QRScanner, CodeInput, Celebration } from '../components/checkin';
import { useCheckin } from '../hooks/useCheckin';
import { fetchBusinessById } from '../data/mockApi';
import { formatDistance } from '../utils/geo';
import { haversine } from '../utils/geo';

type CheckinMode = 'qr' | 'code';

export function CheckinPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { businessId } = useParams<{ businessId?: string }>();

  const [mode, setMode] = useState<CheckinMode>('qr');
  const [selectedBusiness, setSelectedBusiness] = useState<PartnerBusiness | null>(null);
  const [_code, setCode] = useState('');
  const [distance, setDistance] = useState<number | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const { result, performCheckin, resetCheckin } = useCheckin();

  useEffect(() => {
    if (location.state?.business) {
      setSelectedBusiness(location.state.business as PartnerBusiness);
    } else if (businessId) {
      fetchBusinessById(businessId).then(b => {
        if (b) setSelectedBusiness(b);
      });
    }
  }, [location.state, businessId]);

  useEffect(() => {
    if (selectedBusiness) {
      const dist = haversine(
        DEMO_USER.last_location_lat || 42.1420,
        DEMO_USER.last_location_lng || 24.7490,
        selectedBusiness.lat,
        selectedBusiness.lng
      );
      setDistance(dist);
    }
  }, [selectedBusiness]);

  const handleCodeComplete = useCallback((enteredCode: string) => {
    if (!selectedBusiness || isProcessing) return;

    setIsProcessing(true);
    const validationResult = performCheckin(
      DEMO_USER.last_location_lat || 42.1420,
      DEMO_USER.last_location_lng || 24.7490,
      selectedBusiness,
      enteredCode,
      DEMO_USER.streak_current
    );

    if (validationResult.valid) {
      setCode(enteredCode);
      setTimeout(() => {
        setShowCelebration(true);
        setIsProcessing(false);
      }, 500);
    } else {
      setIsProcessing(false);
    }
  }, [selectedBusiness, isProcessing, performCheckin]);

  const handleQRDetected = useCallback((qrCode: string) => {
    if (!selectedBusiness || isProcessing) return;

    setIsProcessing(true);
    const validationResult = performCheckin(
      DEMO_USER.last_location_lat || 42.1420,
      DEMO_USER.last_location_lng || 24.7490,
      selectedBusiness,
      qrCode,
      DEMO_USER.streak_current
    );

    if (validationResult.valid) {
      setCode(qrCode);
      setTimeout(() => {
        setShowCelebration(true);
        setIsProcessing(false);
      }, 500);
    } else {
      setIsProcessing(false);
    }
  }, [selectedBusiness, isProcessing, performCheckin]);

  const handleDismissCelebration = () => {
    setShowCelebration(false);
    resetCheckin();
    setCode('');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-waygo-dark pb-24 pt-safe">
      <div className="p-4">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-waygo-darkLight rounded-full text-gray-400"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-2xl font-bold text-white">Check In</h1>
        </div>

        {selectedBusiness ? (
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-waygo-darkMid rounded-2xl p-4 border border-white/10"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-waygo-teal/20 flex items-center justify-center text-2xl">
                  {selectedBusiness.category === 'cafe' ? '☕' :
                   selectedBusiness.category === 'museum' ? '🏛️' :
                   selectedBusiness.category === 'cultural' ? '🕌' : '📍'}
                </div>
                <div>
                  <h2 className="font-semibold text-white">{selectedBusiness.name}</h2>
                  <p className="text-sm text-gray-400">{selectedBusiness.address}</p>
                </div>
              </div>

              {distance !== null && (
                <div className={`mt-4 flex items-center gap-2 p-3 rounded-xl ${
                  distance <= selectedBusiness.geofence_radius_meters
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-amber-500/20 text-amber-400'
                }`}>
                  <MapPin size={18} />
                  <span className="text-sm font-medium">
                    {formatDistance(distance)} away
                    {distance > selectedBusiness.geofence_radius_meters && (
                      <span className="ml-2">({selectedBusiness.geofence_radius_meters}m required)</span>
                    )}
                  </span>
                </div>
              )}
            </motion.div>

            {result && !result.valid && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 flex items-center gap-3"
              >
                <AlertTriangle className="text-red-400 flex-shrink-0" />
                <p className="text-red-400 text-sm">{result.reason}</p>
              </motion.div>
            )}

            <div className="flex gap-2 p-1 bg-waygo-darkLight rounded-xl">
              <button
                onClick={() => setMode('qr')}
                className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${
                  mode === 'qr' ? 'bg-waygo-teal text-white' : 'text-gray-400'
                }`}
              >
                <QrCode size={18} className="inline mr-2" />
                QR Scanner
              </button>
              <button
                onClick={() => setMode('code')}
                className={`flex-1 py-3 rounded-lg text-sm font-medium transition-colors ${
                  mode === 'code' ? 'bg-waygo-teal text-white' : 'text-gray-400'
                }`}
              >
                <Keyboard size={18} className="inline mr-2" />
                Manual Code
              </button>
            </div>

            <AnimatePresence mode="wait">
              {mode === 'qr' ? (
                <motion.div
                  key="qr"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <QRScanner
                    onCodeDetected={handleQRDetected}
                    isActive={!isProcessing}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="code"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-waygo-darkMid rounded-2xl p-6 border border-white/10"
                >
                  <CodeInput onComplete={handleCodeComplete} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 rounded-full bg-waygo-darkLight flex items-center justify-center text-4xl mb-4">
              📍
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">No Location Selected</h2>
            <p className="text-gray-400 text-center mb-6">
              Select a place from the map to check in
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-waygo-teal text-white font-semibold rounded-xl"
            >
              Go to Map
            </button>
          </div>
        )}
      </div>

      <Celebration
        xpEarned={result?.xp || 75}
        streak={DEMO_USER.streak_current + 1}
        questProgress={{ current: 2, total: 5 }}
        isVisible={showCelebration}
        onDismiss={handleDismissCelebration}
      />
    </div>
  );
}