
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Map, Grid, X } from 'lucide-react';
import type { Quest } from '../types';
import { useQuest } from '../hooks/useQuest';
import { fetchBusinessById } from '../data/mockApi';
import { QuestCard, WaypointList } from '../components/quest';
import type { PartnerBusiness } from '../types';

type ViewMode = 'all' | 'active' | 'completed' | 'nearby';

export function QuestsPage() {
  const navigate = useNavigate();
  const { quests, getQuestProgress, acceptQuest } = useQuest();
  const [viewMode, setViewMode] = useState<ViewMode>('all');
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [waypoints, setWaypoints] = useState<PartnerBusiness[]>([]);

  const handleQuestClick = async (quest: Quest) => {
    setSelectedQuest(quest);
    const businesses = await Promise.all(
      quest.waypoint_business_ids.map(id => fetchBusinessById(id))
    );
    setWaypoints(businesses.filter(Boolean) as PartnerBusiness[]);
  };

  const handleCloseDetail = () => {
    setSelectedQuest(null);
    setWaypoints([]);
  };

  const filteredQuests = quests.filter(quest => {
    const progress = getQuestProgress(quest.id);
    switch (viewMode) {
      case 'active':
        return progress.isAccepted && progress.checked < progress.total;
      case 'completed':
        return progress.checked >= progress.total;
      default:
        return true;
    }
  });

  return (
    <div className="min-h-screen bg-waygo-dark pb-24 pt-safe">
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white">Quests</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('all')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'all' ? 'bg-waygo-teal text-white' : 'bg-waygo-darkLight text-gray-400'
              }`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('active')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'active' ? 'bg-waygo-teal text-white' : 'bg-waygo-darkLight text-gray-400'
              }`}
            >
              <Map size={20} />
            </button>
          </div>
        </div>

        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {(['all', 'active', 'completed'] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                viewMode === mode
                  ? 'bg-waygo-teal text-white'
                  : 'bg-waygo-darkLight text-gray-400 hover:text-white'
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          {filteredQuests.map((quest) => (
            <QuestCard
              key={quest.id}
              quest={quest}
              progress={getQuestProgress(quest.id)}
              isAccepted={getQuestProgress(quest.id).isAccepted}
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
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            onClick={handleCloseDetail}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="absolute bottom-0 left-0 right-0 max-h-[85vh] bg-waygo-darkMid rounded-t-3xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-1 bg-gray-600 rounded-full" />
                </div>

                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">{selectedQuest.title}</h2>
                    <p className="text-sm text-gray-400 mt-1">
                      {selectedQuest.xp_reward} XP • {selectedQuest.difficulty}
                    </p>
                  </div>
                  <button
                    onClick={handleCloseDetail}
                    className="p-2 bg-waygo-darkLight rounded-full text-gray-400"
                  >
                    <X size={20} />
                  </button>
                </div>

                <p className="text-gray-300 text-sm mb-6">{selectedQuest.description}</p>

                <h3 className="font-semibold text-white mb-3">Waypoints</h3>
                <WaypointList
                  waypoints={waypoints}
                  checkedWaypoints={[]}
                  onWaypointClick={(_wp) => {
                    navigate('/');
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}