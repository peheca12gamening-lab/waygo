import { motion } from 'framer-motion';
import { MapPin, Zap } from 'lucide-react';
import type { Landmark } from '../../types';

const SCENIC = new Set(['historic', 'nature', 'culture', 'museum', 'cultural', 'park', 'gallery']);

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

export function LandmarkCard({ landmark, onClick }: { landmark: Landmark; onClick: () => void }) {
  const meta = CATEGORY_META[landmark.category] ?? { emoji: '📍', color: '#B090FF', label: landmark.category };
  const isScenic = SCENIC.has(landmark.category);
  const points = landmark.points ?? 50;

  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className="rounded-2xl overflow-hidden text-left w-full"
      style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', boxShadow: '0 2px 12px var(--shadow)' }}
    >
      <div className="aspect-[16/9] relative overflow-hidden flex items-center justify-center"
        style={{ background: `linear-gradient(135deg,${meta.color}22,${meta.color}44)` }}>
        {landmark.image_url ? (
          <img src={landmark.image_url} alt={landmark.name}
            className="w-full h-full object-cover absolute inset-0"
            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
        ) : (
          <span className="text-5xl opacity-60">{meta.emoji}</span>
        )}
        {/* Category badge */}
        <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-xs font-bold"
          style={{ background: `${meta.color}dd`, color: 'white', backdropFilter: 'blur(4px)' }}>
          {meta.emoji} {meta.label}
        </div>
        {/* Scenic gold star OR business grey icon */}
        <div className="absolute top-2 right-2">
          {isScenic
            ? <span className="text-sm" title="Scenic sight — earns XP">⭐</span>
            : <span className="text-sm opacity-60" title="Business — no XP on check-in">🏢</span>}
        </div>
        {/* XP points badge */}
        <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-0.5"
          style={{ background: 'rgba(0,0,0,0.55)', color: '#FFE08A', backdropFilter: 'blur(4px)' }}>
          <Zap size={10} fill="#FFE08A" stroke="#FFE08A" /> {points}
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-bold text-sm line-clamp-1" style={{ color: 'var(--text-primary)' }}>{landmark.name}</h3>
        <p className="text-xs mt-1 line-clamp-2" style={{ color: 'var(--text-soft)' }}>{landmark.description}</p>
        <div className="flex items-center gap-1 mt-2">
          <MapPin size={12} style={{ color: meta.color }} />
          <span className="text-xs line-clamp-1" style={{ color: 'var(--text-soft)' }}>
            {(landmark as any).address ?? `${landmark.lat.toFixed(4)}, ${landmark.lng.toFixed(4)}`}
          </span>
        </div>
      </div>
    </motion.button>
  );
}
