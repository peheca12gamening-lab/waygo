import { motion } from 'framer-motion';
import type { Quest } from '../../types';
import { MapPin, Star } from 'lucide-react';

interface QuestCardProps {
  quest: Quest;
  progress: { checked: number; total: number; percentage: number };
  isAccepted: boolean;
  onClick: () => void;
  onAccept: () => void;
}

const difficultyColors = {
  easy: { bg: 'bg-green-500/20', text: 'text-green-400', border: 'border-green-500/30' },
  medium: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
  hard: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
};

const categoryGradients: Record<string, string> = {
  coffee: 'from-amber-900/80 to-amber-950/90',
  history: 'from-orange-900/80 to-orange-950/90',
  exploration: 'from-teal-900/80 to-teal-950/90',
  culture: 'from-purple-900/80 to-purple-950/90',
};

const categoryIcons: Record<string, string> = {
  coffee: '☕',
  history: '🏛️',
  exploration: '🗺️',
  culture: '🎭',
};

export function QuestCard({ quest, progress, isAccepted, onClick, onAccept }: QuestCardProps) {
  const colors = difficultyColors[quest.difficulty];
  const gradient = categoryGradients[quest.category] || categoryGradients.exploration;
  const icon = categoryIcons[quest.category] || '📍';

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full text-left bg-gradient-to-br ${gradient} rounded-2xl overflow-hidden shadow-lg border border-white/10`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center text-2xl">
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${colors.bg} ${colors.text} ${colors.border}`}>
                {quest.difficulty.charAt(0).toUpperCase() + quest.difficulty.slice(1)}
              </span>
            </div>
            <h3 className="font-bold text-white text-lg leading-tight">{quest.title}</h3>
          </div>
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1 text-waygo-teal">
              <Star size={14} fill="currentColor" />
              <span className="font-bold text-sm">{quest.xp_reward} XP</span>
            </div>
          </div>
        </div>

        <p className="text-gray-300 text-sm mb-4 line-clamp-2">{quest.description}</p>

        <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
          <div className="flex items-center gap-1">
            <MapPin size={14} />
            <span>{quest.waypoint_business_ids.length} stops</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Progress</span>
            <span className="text-white font-medium">{progress.checked}/{quest.required_checkins_count}</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (progress.checked / quest.required_checkins_count) * 100)}%` }}
              className="h-full bg-waygo-teal rounded-full"
            />
          </div>
        </div>

        {!isAccepted && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={(e) => {
              e.stopPropagation();
              onAccept();
            }}
            className="mt-4 w-full py-2.5 bg-waygo-teal hover:bg-waygo-tealDark text-white font-semibold rounded-xl transition-colors"
          >
            Accept Quest
          </motion.button>
        )}
      </div>
    </motion.button>
  );
}