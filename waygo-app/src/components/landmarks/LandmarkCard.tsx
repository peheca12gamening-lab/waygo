import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';
import type { Landmark } from '../../types';

const categoryMeta: Record<string, { emoji: string; color: string }> = {
  cultural: { emoji: '🏛️', color: '#B090FF' },
  museum: { emoji: '🏛️', color: '#7AC8FF' },
  park: { emoji: '🌳', color: '#78E8C8' },
};

export function LandmarkCard({ landmark, onClick }: { landmark: Landmark; onClick: () => void }) {
  const meta = categoryMeta[landmark.category] || { emoji: '📍', color: '#B090FF' };
  const gradient = `linear-gradient(135deg, ${meta.color}22, ${meta.color}44)`;

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="rounded-2xl overflow-hidden text-left w-full"
      style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', boxShadow: '0 2px 12px var(--shadow)' }}
    >
      <div
        className="aspect-[16/9] flex flex-col items-center justify-center relative"
        style={{ background: gradient }}
      >
        {landmark.image_url ? (
          <img src={landmark.image_url} alt={landmark.name} className="w-full h-full object-cover absolute inset-0" />
        ) : (
          <span className="text-6xl opacity-60">{meta.emoji}</span>
        )}
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-bold"
          style={{ background: `${meta.color}dd`, color: 'white', backdropFilter: 'blur(4px)' }}>
          {meta.emoji} {landmark.category}
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{landmark.name}</h3>
        <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-soft)' }}>
          {landmark.description}
        </p>
        <div className="flex items-center gap-1 mt-2">
          <MapPin size={12} style={{ color: meta.color }} />
          <span className="text-xs" style={{ color: 'var(--text-soft)' }}>
            {landmark.lat.toFixed(4)}, {landmark.lng.toFixed(4)}
          </span>
        </div>
      </div>
    </motion.button>
  );
}
