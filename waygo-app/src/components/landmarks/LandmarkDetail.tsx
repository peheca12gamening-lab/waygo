import { motion } from 'framer-motion';
import { X, MapPin, Compass } from 'lucide-react';
import type { Landmark } from '../../types';
import { useApp } from '../../context/AppContext';

const categoryMeta: Record<string, { emoji: string; color: string }> = {
  cultural: { emoji: '🏛️', color: '#B090FF' },
  museum: { emoji: '🏛️', color: '#7AC8FF' },
  park: { emoji: '🌳', color: '#78E8C8' },
};

export function LandmarkDetail({ landmark, onClose }: { landmark: Landmark; onClose: () => void }) {
  const { t, language } = useApp();
  const meta = categoryMeta[landmark.category] || { emoji: '📍', color: '#B090FF' };
  const name = language === 'bg' && landmark.name_bg ? landmark.name_bg : landmark.name;
  const desc = language === 'bg' && landmark.description_bg ? landmark.description_bg : landmark.description;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col justify-end"
      style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(8px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        className="w-full max-w-[430px] mx-auto rounded-t-3xl overflow-y-auto max-h-[85vh]"
        style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)' }}
      >
        <div className="relative">
          <div
            className="aspect-[16/9] flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${meta.color}33, ${meta.color}55)` }}
          >
            {landmark.image_url ? (
              <img src={landmark.image_url} alt={name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-8xl opacity-50">{meta.emoji}</span>
            )}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}
            >
              <X size={18} className="text-white" />
            </button>
          </div>
        </div>

        <div className="p-5 pb-8 space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold" style={{ background: `${meta.color}20`, color: meta.color }}>
                {meta.emoji} {landmark.category}
              </span>
            </div>
            <h2 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{name}</h2>
          </div>

          {desc && (
            <p className="text-sm leading-relaxed" style={{ color: 'var(--text-mid)' }}>{desc}</p>
          )}

          <div className="rounded-2xl p-4" style={{ background: 'var(--bg-secondary)', border: '1.5px solid var(--border)' }}>
            <div className="flex items-center gap-2 mb-2">
              <MapPin size={16} style={{ color: meta.color }} />
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Location</span>
            </div>
            <p className="text-xs" style={{ color: 'var(--text-soft)' }}>
              {landmark.lat.toFixed(6)}, {landmark.lng.toFixed(6)}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                window.open(`https://www.google.com/maps?q=${landmark.lat},${landmark.lng}`, '_blank');
              }}
              className="flex-1 py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2"
              style={{ background: `linear-gradient(135deg, ${meta.color}, ${meta.color}88)` }}
            >
              <Compass size={16} />
              {t.navigate}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
