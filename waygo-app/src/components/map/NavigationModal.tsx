import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, Camera, RotateCcw, Navigation, MapPin, Upload } from 'lucide-react';
import type { PartnerBusiness } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3;
  const φ1 = lat1 * Math.PI / 180, φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180, Δλ = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(Δφ/2)**2 + Math.cos(φ1)*Math.cos(φ2)*Math.sin(Δλ/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

interface NavigationModalProps {
  business: PartnerBusiness;
  onClose: () => void;
  onCheckedIn: () => void;
}

type Stage = 'navigating' | 'arrived' | 'camera' | 'review' | 'success';
const SIGHT_CATEGORIES = ['museum', 'cultural'];
const rainbowGrad = 'linear-gradient(135deg,#FF90B5,#B090FF,#7AC8FF,#78E8C8)';

export function NavigationModal({ business, onClose, onCheckedIn }: NavigationModalProps) {
  const { addVisit, uploadToFeed } = useAuth();
  const { t } = useApp();
  const [stage, setStage] = useState<Stage>('navigating');
  const [distance, setDistance] = useState<number | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [photo, setPhoto] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState('');
  const [uploaded, setUploaded] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const isSight = SIGHT_CATEGORIES.includes(business.category ?? '');
  const pointsEarned = isSight ? 50 : 0;

  useEffect(() => {
    if (!navigator.geolocation) return;
    watchIdRef.current = navigator.geolocation.watchPosition(
      ({ coords: { latitude: lat, longitude: lng } }) => {
        setDistance(haversine(lat, lng, business.lat, business.lng));
        if (haversine(lat, lng, business.lat, business.lng) < 50 && stage === 'navigating') setStage('arrived');
      },
      () => setDistance(80),
      { enableHighAccuracy: true, maximumAge: 3000 }
    );
    return () => { if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current); };
  }, [business, stage]);

  // No more fake timer — arrival is purely GPS-based (50m threshold)

  const startCamera = useCallback(async () => {
    setCameraError('');
    streamRef.current?.getTracks().forEach(tk => tk.stop());
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch { setCameraError(t.cameraError); }
  }, [facingMode, t.cameraError]);

  useEffect(() => {
    if (stage === 'camera') { startCamera(); }
    return () => {
      if (stage !== 'camera') {
        streamRef.current?.getTracks().forEach(tk => tk.stop());
        streamRef.current = null;
      }
    };
  }, [stage, startCamera]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const v = videoRef.current, c = canvasRef.current;
    c.width = v.videoWidth || 640; c.height = v.videoHeight || 480;
    c.getContext('2d')?.drawImage(v, 0, 0);
    setPhoto(c.toDataURL('image/jpeg', 0.85));
    streamRef.current?.getTracks().forEach(tk => tk.stop());
    streamRef.current = null;
    setStage('review');
  };

  const handleConfirmAndUpload = (shouldUpload: boolean) => {
    const id = addVisit({
      placeId: business.id, placeName: business.name, placeCategory: business.category ?? 'cultural',
      date: new Date().toISOString(), pointsEarned: shouldUpload ? pointsEarned : 0,
      photoUrl: photo || undefined,
    });
    if (shouldUpload && id) {
      setTimeout(() => { uploadToFeed(id); setUploaded(true); }, 100);
    }
    setStage('success');
    setTimeout(onCheckedIn, 2800);
  };

  const formatDist = (m: number) => m < 1000 ? `${Math.round(m)}m` : `${(m/1000).toFixed(1)}km`;

  return (
    /* Full screen shell */
    <div className="fixed inset-0 z-50 flex flex-col" style={{ background: 'var(--bg-primary)' }}>

      {/* ── Header ── */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 pt-6 pb-4"
        style={{ borderBottom: '1.5px solid var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#E8F0FF,#F0E8FF)' }}>
            <Navigation size={20} style={{ color: '#B090FF' }} />
          </div>
          <div>
            <h2 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{business.name}</h2>
            <p className="text-xs" style={{ color: 'var(--text-soft)' }}>{business.address}</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-full" style={{ background: 'var(--bg-chip)' }}>
          <X size={18} style={{ color: 'var(--text-soft)' }} />
        </button>
      </div>

      {/* ── Navigating ── */}
      {stage === 'navigating' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <motion.div animate={{ rotate: [0,360] }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            className="w-32 h-32 rounded-full flex items-center justify-center mb-6"
            style={{ background: 'linear-gradient(135deg,#E8F0FF,#F0E8FF)', border: '3px solid #B090FF22' }}>
            <img src="/arrow.png" style={{ width: 56, height: 56, objectFit: 'contain', filter: 'drop-shadow(0 4px 12px rgba(100,100,255,0.4))' }} alt="arrow" />
          </motion.div>
          <h3 className="text-2xl font-black mb-2" style={{ color: 'var(--text-primary)' }}>{t.navigating}</h3>
          {distance !== null && (
            <p className="text-lg font-bold mb-1" style={{ background: rainbowGrad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {formatDist(distance)} away
            </p>
          )}
          <p className="text-sm text-center" style={{ color: 'var(--text-soft)' }}>Head towards {business.name}.</p>
          <div className="mt-8 flex gap-1.5">
            {[0,1,2].map(i => (
              <motion.div key={i} animate={{ opacity: [0.3,1,0.3] }} transition={{ duration: 1.5, delay: i*0.5, repeat: Infinity }}
                className="w-2 h-2 rounded-full" style={{ background: '#B090FF' }} />
            ))}
          </div>
        </div>
      )}

      {/* ── Arrived ── */}
      {stage === 'arrived' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="w-32 h-32 rounded-full flex items-center justify-center mb-6"
            style={{ background: 'linear-gradient(135deg,#E8FFF5,#E8F8FF)', border: '3px solid #78E8C8' }}>
            <MapPin size={48} style={{ color: '#78E8C8' }} />
          </motion.div>
          <h3 className="text-2xl font-black mb-2 text-center" style={{ color: 'var(--text-primary)' }}>{t.youveArrived} 🎉</h3>
          <p className="text-sm text-center mb-4" style={{ color: 'var(--text-mid)' }}>
            You're at <span className="font-bold" style={{ color: 'var(--text-primary)' }}>{business.name}</span>
          </p>
          {isSight ? (
            <div className="rounded-2xl px-4 py-3 mb-8 text-center"
              style={{ background: 'linear-gradient(135deg,#F0FFF8,#F0F8FF)', border: '1.5px solid #C0EEE8' }}>
              <p className="font-bold text-sm" style={{ color: '#00A090' }}>📸 Take a photo & upload to earn {pointsEarned} points!</p>
            </div>
          ) : (
            <div className="rounded-2xl px-4 py-3 mb-8 text-center"
              style={{ background: 'linear-gradient(135deg,#FFF8F0,#FFF0F5)', border: '1.5px solid #FFD4B0' }}>
              <p className="font-bold text-sm" style={{ color: '#FF8C42' }}>📸 Check in to redeem your rewards here!</p>
            </div>
          )}
          <motion.button whileTap={{ scale: 0.96 }} onClick={() => setStage('camera')}
            className="w-full py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2"
            style={{ background: rainbowGrad, boxShadow: '0 6px 24px rgba(176,144,255,0.4)' }}>
            <Camera size={20} /> {t.takePhoto}
          </motion.button>
        </div>
      )}

      {/* ── Camera ── */}
      {stage === 'camera' && (
        <>
          {cameraError ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6">
              <div className="text-5xl mb-4">📷</div>
              <p className="text-center mb-4" style={{ color: '#FF6080' }}>{cameraError}</p>
              <button onClick={startCamera} className="px-6 py-3 rounded-xl text-white font-bold"
                style={{ background: rainbowGrad }}>{t.tryAgain}</button>
            </div>
          ) : (
            <>
              {/* Video — takes all available space */}
              <div className="flex-1 relative min-h-0 overflow-hidden bg-black">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {/* Viewfinder */}
                <div style={{ position: 'absolute', inset: 32, borderRadius: 16, border: '2px solid rgba(255,255,255,0.55)', pointerEvents: 'none' }} />
                {/* Bottom label */}
                <div style={{ position: 'absolute', bottom: 12, left: 16, right: 16, display: 'flex', justifyContent: 'center', pointerEvents: 'none' }}>
                  <div style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', borderRadius: 10, padding: '6px 14px' }}>
                    <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: 500 }}>{t.livePhotoOnly}</p>
                  </div>
                </div>
              </div>

              {/* Controls — fixed height, never hidden */}
              <div style={{
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 24px',
                background: 'var(--bg-primary)',
                borderTop: '1.5px solid var(--border)',
                minHeight: 110,
              }}>
                {/* Flip camera */}
                <button
                  onClick={() => setFacingMode(f => f === 'environment' ? 'user' : 'environment')}
                  style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--bg-chip)', border: '1.5px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <RotateCcw size={22} style={{ color: 'var(--text-soft)' }} />
                </button>

                {/* Shutter */}
                <button
                  onClick={handleCapture}
                  style={{ width: 80, height: 80, borderRadius: '50%', background: 'white', boxShadow: '0 0 0 5px rgba(176,144,255,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none' }}
                >
                  <div style={{ width: 60, height: 60, borderRadius: '50%', background: rainbowGrad }} />
                </button>

                {/* Spacer */}
                <div style={{ width: 52 }} />
              </div>
              <canvas ref={canvasRef} style={{ display: 'none' }} />
            </>
          )}
        </>
      )}

      {/* ── Review ── */}
      {stage === 'review' && photo && (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 relative min-h-0 overflow-hidden">
            <img src={photo} alt="review" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            <div style={{ position: 'absolute', top: 16, left: 16, right: 16, display: 'flex', justifyContent: 'center' }}>
              <div style={{ background: 'rgba(255,255,255,0.9)', backdropFilter: 'blur(12px)', borderRadius: 14, padding: '8px 16px' }}>
                <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{t.reviewPhoto}</p>
              </div>
            </div>
          </div>
          <div style={{ flexShrink: 0, padding: 16, background: 'var(--bg-primary)', borderTop: '1.5px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button onClick={() => { setPhoto(null); setStage('camera'); }}
              style={{ width: '100%', padding: '14px 0', borderRadius: 14, background: 'var(--bg-chip)', color: 'var(--text-mid)', border: '1.5px solid var(--border)', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              <RotateCcw size={18} /> {t.retakePhoto}
            </button>
            <button onClick={() => handleConfirmAndUpload(true)}
              style={{ width: '100%', padding: '14px 0', borderRadius: 14, background: rainbowGrad, color: 'white', fontWeight: 700, border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 4px 16px rgba(176,144,255,0.4)' }}>
              <Upload size={18} />
              {isSight ? `${t.uploadAndEarn} ${pointsEarned} pts` : t.uploadAndEarn}
            </button>
            <button onClick={() => handleConfirmAndUpload(false)}
              style={{ width: '100%', padding: '8px 0', textAlign: 'center', fontSize: 13, fontWeight: 500, color: 'var(--text-soft)', background: 'none', border: 'none' }}>
              {t.saveWithout}
            </button>
          </div>
        </div>
      )}

      {/* ── Success ── */}
      {stage === 'success' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }} className="text-8xl mb-6">🏆</motion.div>
          <motion.h3 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="text-2xl font-black mb-4 text-center" style={{ color: 'var(--text-primary)' }}>
            {t.checkInComplete}
          </motion.h3>
          {uploaded && isSight && (
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 }}
              className="rounded-2xl px-8 py-5 text-center"
              style={{ background: 'linear-gradient(135deg,#F5F0FF,#F0F8FF)', border: '2px solid #D0B8FF' }}>
              <p className="text-4xl font-black mb-1" style={{ background: rainbowGrad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                +{pointsEarned} pts
              </p>
              <p className="text-sm" style={{ color: 'var(--text-mid)' }}>Added to your For You feed!</p>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
