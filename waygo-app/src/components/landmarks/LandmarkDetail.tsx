import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { X, MapPin, Zap, CheckCircle2, Compass, Lock } from 'lucide-react';
import type { Landmark } from '../../types';
import { useApp } from '../../context/AppContext';
import { useWatchPosition } from '../../hooks/useWatchPosition';
import { haversine } from '../../utils/geo';

const CATEGORY_META: Record<string, { emoji: string; color: string; label: string }> = {
  historic:  { emoji: '🏛️', color: '#B090FF', label: 'Historic'  },
  nature:    { emoji: '🌳', color: '#78E8C8', label: 'Nature'    },
  culture:   { emoji: '🎭', color: '#7AC8FF', label: 'Culture'   },
  food:      { emoji: '🍽️', color: '#FFB878', label: 'Food'      },
  nightlife: { emoji: '🍸', color: '#FF90B5', label: 'Nightlife' },
  shopping:  { emoji: '🛍️', color: '#F49AC2', label: 'Shopping'  },
  museum:    { emoji: '🏛️', color: '#7AC8FF', label: 'Museum'    },
  park:      { emoji: '🌳', color: '#78E8C8', label: 'Park'      },
  cultural:  { emoji: '🎭', color: '#B090FF', label: 'Cultural'  },
};

function catMeta(cat: string) {
  return CATEGORY_META[cat] ?? { emoji: '📍', color: '#B090FF', label: cat };
}

const CHECK_IN_RADIUS = 100; // metres

interface LandmarkDetailProps {
  landmark: Landmark;
  onClose: () => void;
  onCheckIn?: (lm: Landmark) => void;
}

export function LandmarkDetail({ landmark, onClose, onCheckIn }: LandmarkDetailProps) {
  const { language } = useApp();
  const { position } = useWatchPosition();
  const [checkedIn, setCheckedIn] = useState(false);

  const meta = catMeta(landmark.category);
  const name = language === 'bg' && landmark.name_bg ? landmark.name_bg : landmark.name;
  const desc = language === 'bg' && landmark.description_bg ? landmark.description_bg : landmark.description;
  const points = landmark.points ?? 50;

  const distM = useMemo(() =>
    haversine(position[0], position[1], landmark.lat, landmark.lng),
    [position, landmark.lat, landmark.lng]
  );
  const withinRange = distM <= CHECK_IN_RADIUS;

  const handleCheckIn = () => {
    if (!withinRange || checkedIn) return;
    setCheckedIn(true);
    onCheckIn?.(landmark);
  };

  const handleNavigate = () => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${landmark.lat},${landmark.lng}`, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col justify-end"
      style={{ background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        className="w-full max-w-[430px] mx-auto rounded-t-3xl overflow-y-auto max-h-[88vh]"
        style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Full-width hero image */}
        <div className="relative">
          <div className="w-full aspect-[16/10] overflow-hidden flex items-center justify-center"
            style={{ background: `linear-gradient(135deg,${meta.color}33,${meta.color}55)` }}>
            {landmark.image_url
              ? <img src={landmark.image_url} alt={name} className="w-full h-full object-cover"
                  onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
              : <span className="text-8xl opacity-50">{meta.emoji}</span>}
          </div>
          <div className="absolute inset-x-0 bottom-0 h-24 pointer-events-none"
            style={{ background: 'linear-gradient(to top,rgba(0,0,0,0.5),transparent)' }} />
          <button onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)' }}>
            <X size={18} className="text-white" />
          </button>
          <div className="absolute top-4 left-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold text-white inline-flex items-center gap-1"
              style={{ background: meta.color, boxShadow: '0 2px 10px rgba(0,0,0,0.25)' }}>
              {meta.emoji} {meta.label}
            </span>
          </div>
          <div className="absolute bottom-3 left-4 right-4">
            <h2 className="text-2xl font-black text-white drop-shadow-lg leading-tight">{name}</h2>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 pb-8 space-y-4">
          {/* Address */}
          {landmark.address && (
            <div className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0" style={{ color: meta.color }} />
              <p className="text-sm" style={{ color: 'var(--text-mid)' }}>{landmark.address}</p>
            </div>
          )}

          {/* XP reward */}
          <div className="flex items-center justify-between rounded-2xl px-4 py-3"
            style={{ background: 'linear-gradient(135deg,#FFF4D6,#FFE6A8)', border: '1.5px solid #F5D67A' }}>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#F7B500' }}>
                <Zap size={17} fill="white" stroke="white" />
              </div>
              <span className="text-sm font-bold" style={{ color: '#7A5B00' }}>XP Reward</span>
            </div>
            <span className="text-lg font-black" style={{ color: '#9A6B00' }}>+{points} XP</span>
          </div>

          {/* Description */}
          {desc && (
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-mid)' }}>{desc}</p>
          )}

          {/* Distance indicator */}
          <div className="rounded-2xl p-3 flex items-center gap-2"
            style={{
              background: withinRange ? 'rgba(120,232,200,0.18)' : 'var(--bg-secondary)',
              border: `1.5px solid ${withinRange ? '#78E8C8' : 'var(--border)'}`,
            }}>
            {withinRange
              ? <CheckCircle2 size={16} style={{ color: '#1fae8e' }} />
              : <MapPin size={16} style={{ color: meta.color }} />}
            <span className="text-xs font-medium" style={{ color: 'var(--text-mid)' }}>
              {withinRange
                ? "You're here — ready to check in!"
                : `${distM < 1000 ? Math.round(distM) + ' m' : (distM / 1000).toFixed(1) + ' km'} away · get closer to check in`}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button onClick={handleNavigate}
              className="flex-1 py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2"
              style={{ background: `linear-gradient(135deg,${meta.color},${meta.color}aa)`, boxShadow: `0 4px 16px ${meta.color}55` }}>
              <Compass size={17} /> Navigate
            </button>
            <button onClick={handleCheckIn} disabled={!withinRange || checkedIn}
              className="flex-1 py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
              style={checkedIn
                ? { background: '#78E8C8', color: '#0c5c47' }
                : withinRange
                ? { background: 'linear-gradient(135deg,#FF90B5,#B090FF,#7AC8FF)', color: 'white', boxShadow: '0 4px 16px rgba(176,144,255,0.45)' }
                : { background: 'var(--bg-secondary)', color: 'var(--text-soft)', border: '1.5px solid var(--border)', cursor: 'not-allowed' }}>
              {checkedIn
                ? <><CheckCircle2 size={17} /> Checked In</>
                : withinRange
                ? <><CheckCircle2 size={17} /> Check In</>
                : <><Lock size={15} /> Check In</>}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
