import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { X, CheckCircle, Lock } from 'lucide-react';
import type { Quest, Business } from '../types';
import { useQuest } from '../hooks/useQuest';
import type { QuestWithStatus } from '../hooks/useQuest';
import { QuestCard, WaypointList } from '../components/quest';
import { useApp } from '../context/AppContext';

type ViewMode = 'all' | 'active' | 'completed' | 'locked';

const tierColors: Record<string, string> = {
  bronze: '#CD7F32',
  silver: '#A8A8A8',
  gold: '#FFD700',
  platinum: '#00E5FF',
};

export function QuestsPage() {
  const navigate = useNavigate();
  const { questsWithStatus, acceptQuest } = useQuest();
  const { t } = useApp();
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [selectedQuest, setSelectedQuest] = useState<QuestWithStatus | null>(null);
  const [waypoints, setWaypoints] = useState<Business[]>([]);

  const handleQuestClick = async (quest: QuestWithStatus) => {
    setSelectedQuest(quest);
    const businesses = await getBusinessesForQuest(quest);
    setWaypoints(businesses);
  };

  const handleCloseDetail = () => {
    setSelectedQuest(null);
    setWaypoints([]);
  };

  const filteredQuests = useMemo(() => {
    return questsWithStatus.filter(q => {
      switch (viewMode) {
        case 'active':
          return q.progress.isAccepted && !q.progress.completed && q.progress.checked < q.progress.total;
        case 'completed':
          return q.progress.completed;
        case 'locked':
          return q.isLocked;
        default:
          return true;
      }
    });
  }, [questsWithStatus, viewMode]);

  const views: { key: ViewMode; label: string; count?: number }[] = [
    { key: 'all', label: 'All' },
    { key: 'active', label: 'Active', count: questsWithStatus.filter(q => q.progress.isAccepted && !q.progress.completed).length },
    { key: 'completed', label: 'Completed', count: questsWithStatus.filter(q => q.progress.completed).length },
    { key: 'locked', label: 'Locked', count: questsWithStatus.filter(q => q.isLocked).length },
  ];

  return (
    <div className="min-h-screen pb-24 pt-safe" style={{ background: 'var(--rainbow-bg)' }}>
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{t.quests}</h1>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
          {views.map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setViewMode(key)}
              className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-1.5"
              style={{
                background: viewMode === key ? '#B090FF' : 'var(--bg-chip)',
                color: viewMode === key ? 'white' : 'var(--text-soft)',
              }}
            >
              {label}
              {count !== undefined && count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${viewMode === key ? 'bg-white/20' : 'bg-gray-200/30'}`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredQuests.length === 0 && (
            <p className="text-center text-sm" style={{ color: 'var(--text-soft)' }}>
              {viewMode === 'active' ? 'No active quests. Browse and accept one!' :
               viewMode === 'completed' ? 'No completed quests yet.' :
               viewMode === 'locked' ? 'All quests unlocked! Great job!' :
               'No quests available.'}
            </p>
          )}
          {filteredQuests.map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              onClick={() => handleQuestClick(quest)}
              onAccept={() => acceptQuest(quest.id)}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {selectedQuest && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
            onClick={handleCloseDetail}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="absolute bottom-0 left-0 right-0 max-h-[85vh] rounded-t-3xl overflow-y-auto"
              style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-1 rounded-full" style={{ background: 'var(--text-soft)' }} />
                </div>

                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span style={{ color: tierColors[selectedQuest.tier] ?? '#CD7F32' }} className="text-xs font-semibold uppercase tracking-wider">
                        {selectedQuest.tier}
                      </span>
                      {selectedQuest.isLocked && (
                        <span className="flex items-center gap-1 text-xs text-gray-500"><Lock size={10} /> Lvl {selectedQuest.locksAtLevel}</span>
                      )}
                    </div>
                    <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{selectedQuest.title}</h2>
                    <p className="text-sm mt-1" style={{ color: 'var(--text-soft)' }}>
                      {selectedQuest.xp_reward} XP
                    </p>
                  </div>
                  <button onClick={handleCloseDetail} className="p-2 rounded-full" style={{ background: 'var(--bg-chip)' }}>
                    <X size={20} style={{ color: 'var(--text-soft)' }} />
                  </button>
                </div>

                <p className="text-sm mb-4" style={{ color: 'var(--text-mid)' }}>{selectedQuest.description}</p>

                {/* Requirements checklist */}
                {selectedQuest.requirementProgress.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2 text-sm" style={{ color: 'var(--text-primary)' }}>Requirements</h3>
                    <div className="space-y-2">
                      {selectedQuest.requirementProgress.map((rp, i) => {
                        const done = rp.done >= (rp.req.count ?? 1);
                        return (
                          <div key={i} className="flex items-center gap-2 text-sm px-3 py-2 rounded-xl"
                            style={{ background: done ? 'rgba(34,197,94,0.08)' : 'var(--bg-chip)' }}>
                            {done ? (
                              <CheckCircle size={16} className="text-green-500 shrink-0" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border-2 shrink-0" style={{ borderColor: 'var(--text-soft)' }} />
                            )}
                            <span className={done ? 'text-green-600' : ''} style={{ color: done ? undefined : 'var(--text-mid)' }}>
                              {rp.req.description}
                            </span>
                            {rp.req.count && (
                              <span className="ml-auto text-xs font-medium" style={{ color: 'var(--text-soft)' }}>
                                {rp.done}/{rp.req.count}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Waypoints */}
                <h3 className="font-semibold mb-3" style={{ color: 'var(--text-primary)' }}>{t.waypoints}</h3>
                <WaypointList
                  waypoints={waypoints as any}
                  checkedWaypoints={[]}
                  onWaypointClick={() => navigate('/')}
                />

                {!selectedQuest.progress.isAccepted && !selectedQuest.isLocked && (
                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { acceptQuest(selectedQuest.id); handleCloseDetail(); }}
                    className="mt-4 w-full py-3 rounded-xl font-bold text-white"
                    style={{ background: 'linear-gradient(135deg, #FF90B5, #B090FF)' }}
                  >
                    Accept Quest
                  </motion.button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

async function getBusinessesForQuest(quest: Quest): Promise<Business[]> {
  const { getQuestStops } = await import('../lib/db');
  const stops = await getQuestStops(quest.id);
  return stops.map(s => ({
    id: s.business_id,
    name: s.businesses?.name ?? 'Unknown',
    description: '',
    category_slug: 'cultural',
    category_emoji: '📍',
    category_color: '#B090FF',
    lng: s.businesses?.lng ?? 0,
    lat: s.businesses?.lat ?? 0,
    distance_m: 0,
    subscription_tier: 'free' as const,
    total_checkins: 0,
    avg_rating: 0,
    is_sight: false,
    cover_image_url: null,
  }));
}