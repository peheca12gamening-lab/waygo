import { motion } from 'framer-motion';
import { MapPin, Star, Lock, CheckCircle } from 'lucide-react';
import type { QuestWithStatus } from '../../hooks/useQuest';

interface QuestCardProps {
  quest: QuestWithStatus;
  onClick: () => void;
  onAccept: () => void;
}

const tierConfig: Record<string, { label: string; bg: string; text: string; border: string }> = {
  bronze:  { label: 'Bronze', bg: 'bg-amber-700/30', text: 'text-amber-400', border: 'border-amber-600/30' },
  silver:  { label: 'Silver', bg: 'bg-gray-400/20', text: 'text-gray-300', border: 'border-gray-400/30' },
  gold:    { label: 'Gold', bg: 'bg-yellow-500/20', text: 'text-yellow-400', border: 'border-yellow-500/30' },
  platinum:{ label: 'Platinum', bg: 'bg-cyan-500/20', text: 'text-cyan-300', border: 'border-cyan-500/30' },
};

const categoryGradients: Record<string, string> = {
  coffee: 'from-amber-900/80 to-amber-950/90',
  history: 'from-orange-900/80 to-orange-950/90',
  exploration: 'from-teal-900/80 to-teal-950/90',
  culture: 'from-purple-900/80 to-purple-950/90',
  nature: 'from-green-900/80 to-green-950/90',
  food: 'from-rose-900/80 to-rose-950/90',
  nightlife: 'from-indigo-900/80 to-indigo-950/90',
  shopping: 'from-pink-900/80 to-pink-950/90',
};

export function QuestCard({ quest, onClick, onAccept }: QuestCardProps) {
  const { progress, isLocked, locksAtLevel, requirementProgress } = quest;
  const tier = tierConfig[quest.tier] ?? tierConfig.bronze;
  const gradient = categoryGradients[quest.category ?? 'exploration'] ?? categoryGradients.exploration;
  const isCompleted = progress.completed;

  return (
    <motion.button
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileTap={{ scale: isLocked ? 1 : 0.98 }}
      onClick={onClick}
      className={`w-full text-left bg-gradient-to-br ${gradient} rounded-2xl overflow-hidden shadow-lg border border-white/10 ${isLocked ? 'opacity-60' : ''}`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center text-2xl">
            {isCompleted ? '✅' : isLocked ? '🔒' : '⚔️'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${tier.bg} ${tier.text} ${tier.border}`}>
                {tier.label}
              </span>
              {isLocked && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-600/30 text-gray-400 border border-gray-500/30">
                  Lvl {locksAtLevel}
                </span>
              )}
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

        {!isLocked && (
          <>
            <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
              <div className="flex items-center gap-1">
                <MapPin size={14} />
                <span>{progress.total} stops</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Progress</span>
                <span className="text-white font-medium">{progress.checked}/{progress.total}</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, progress.percentage)}%` }}
                  className="h-full bg-waygo-teal rounded-full"
                />
              </div>
            </div>

            {requirementProgress.length > 0 && (
              <div className="mt-3 space-y-1.5">
                {requirementProgress.map((rp, i) => {
                  const done = rp.done >= (rp.req.count ?? 1);
                  return (
                    <div key={i} className="flex items-center gap-2 text-xs">
                      {done ? (
                        <CheckCircle size={12} className="text-green-400" />
                      ) : (
                        <div className="w-3 h-3 rounded-full border border-gray-500" />
                      )}
                      <span className={done ? 'text-green-300' : 'text-gray-400'}>{rp.req.description}</span>
                      {rp.req.count && (
                        <span className="text-gray-500 ml-auto">{rp.done}/{rp.req.count}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {!progress.isAccepted && !isCompleted && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={(e) => { e.stopPropagation(); onAccept(); }}
                className="mt-4 w-full py-2.5 bg-waygo-teal hover:bg-waygo-tealDark text-white font-semibold rounded-xl transition-colors"
              >
                Accept Quest
              </motion.button>
            )}
          </>
        )}

        {isLocked && (
          <div className="mt-3 flex items-center gap-2 text-sm text-gray-400">
            <Lock size={14} />
            <span>Unlocks at level {locksAtLevel}</span>
          </div>
        )}
      </div>
    </motion.button>
  );
}