import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Landmark as LandmarkIcon, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getLandmarks } from '../lib/db';
import { LandmarkCard, LandmarkDetail } from '../components/landmarks';
import { SkeletonCard } from '../components/shared/Skeleton';
import type { Landmark } from '../types';

export function LandmarksPage() {
  const { t, language } = useApp();
  const [selected, setSelected] = useState<Landmark | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: landmarks = [], isLoading } = useQuery({
    queryKey: ['landmarks'],
    queryFn: getLandmarks,
    staleTime: 1000 * 60 * 5,
  });

  const filtered = landmarks.filter(lm => {
    const name = language === 'bg' && lm.name_bg ? lm.name_bg : lm.name;
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className="min-h-screen pb-28 pt-safe" style={{ background: 'var(--rainbow-bg)' }}>
      <div className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <LandmarkIcon size={24} style={{ color: '#B090FF' }} />
          <div>
            <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{t.landmarksTitle}</h1>
            <p className="text-xs" style={{ color: 'var(--text-soft)' }}>{t.landmarksSubtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 px-4 py-3 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)' }}>
          <Search size={17} style={{ color: '#B090FF' }} />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={t.searchPlaces}
            className="flex-1 bg-transparent outline-none text-sm font-medium" style={{ color: 'var(--text-primary)' }} />
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-3">
            {[1,2,3,4].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((lm) => (
              <motion.div key={lm.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <LandmarkCard landmark={lm} onClick={() => setSelected(lm)} />
              </motion.div>
            ))}
          </div>
        )}

        {!isLoading && filtered.length === 0 && (
          <div className="text-center py-12">
            <LandmarkIcon size={48} className="mx-auto mb-3" style={{ color: 'var(--text-soft)' }} />
            <p className="text-sm" style={{ color: 'var(--text-soft)' }}>{t.noCheckins}</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && <LandmarkDetail landmark={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </div>
  );
}
