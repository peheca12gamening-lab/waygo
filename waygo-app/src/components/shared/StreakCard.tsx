import { motion } from 'framer-motion';
import { Flame, Gift, Target } from 'lucide-react';
import { StreakCalendar } from './StreakCalendar';

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
  checkinDates: string[];
  isLoading?: boolean;
}

const MILESTONES = [3, 7, 14, 30, 100];
const STREAK_MESSAGES: Record<string, string> = {
  '1': 'Started your journey! Keep going! 🌱',
  '3': 'Nice consistency! 🔥',
  '7': 'One week strong! You\'re on fire! 🔥🔥',
  '14': 'Two weeks! Halfway to a month! 🎯',
  '30': 'One month! You\'re unstoppable! 💪',
  '100': '100 days! Legendary! 👑',
};

export function StreakCard({ currentStreak, longestStreak, checkinDates, isLoading }: StreakCardProps) {
  const nextMilestone = MILESTONES.find(m => m > currentStreak) ?? MILESTONES[MILESTONES.length - 1];
  const prevMilestone = [...MILESTONES].reverse().find(m => m <= currentStreak) ?? 0;
  const progress = nextMilestone > prevMilestone
    ? Math.round(((currentStreak - prevMilestone) / (nextMilestone - prevMilestone)) * 100)
    : 100;

  const milestoneMessage = [...MILESTONES].reverse().find(m => m <= currentStreak && STREAK_MESSAGES[String(m)]);
  const message = milestoneMessage ? STREAK_MESSAGES[String(milestoneMessage)] : STREAK_MESSAGES['1'];

  if (isLoading) {
    return (
      <div className="rounded-2xl p-5 animate-pulse" style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)' }}>
        <div className="h-16 w-24 rounded-lg" style={{ background: 'var(--bg-chip)' }} />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-5 space-y-4"
      style={{
        background: 'linear-gradient(135deg, rgba(255,144,181,0.08), rgba(176,144,255,0.12), rgba(122,200,255,0.08))',
        border: '1.5px solid rgba(176,144,255,0.2)',
        boxShadow: '0 4px 20px rgba(176,144,255,0.1)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <motion.div
            animate={currentStreak > 0 ? { scale: [1, 1.15, 1], rotate: [0, -3, 3, 0] } : {}}
            transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 3 }}
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #FF90B5, #FFB878)' }}
          >
            <Flame size={24} className="text-white" />
          </motion.div>
          <div>
            <motion.p
              key={currentStreak}
              initial={{ scale: 1.4 }}
              animate={{ scale: 1 }}
              className="text-3xl font-black"
              style={{ color: 'var(--text-primary)' }}
            >
              {currentStreak}
            </motion.p>
            <p className="text-xs" style={{ color: 'var(--text-soft)' }}>Day Streak</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs" style={{ color: 'var(--text-soft)' }}>Longest</p>
          <p className="text-lg font-bold" style={{ color: '#FFB878' }}>{longestStreak} days</p>
        </div>
      </div>

      {/* Milestone progress bar */}
      {currentStreak > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1" style={{ color: 'var(--text-soft)' }}>
              <Target size={12} /> Next: {nextMilestone} days
            </span>
            <span style={{ color: 'var(--text-soft)' }}>{progress}%</span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--bg-chip)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, #FF90B5, #B090FF, #7AC8FF)' }}
            />
          </div>
        </div>
      )}

      {/* Calendar */}
      <StreakCalendar checkinDates={checkinDates} currentStreak={currentStreak} />

      {/* Milestone indicators */}
      <div className="flex gap-2 flex-wrap">
        {MILESTONES.map(m => {
          const reached = currentStreak >= m;
          return (
            <motion.div
              key={m}
              whileHover={{ scale: 1.05 }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                reached ? '' : 'opacity-40'
              }`}
              style={{
                background: reached ? 'rgba(176,144,255,0.15)' : 'var(--bg-chip)',
                border: `1px solid ${reached ? '#B090FF' : 'var(--border)'}`,
                color: reached ? '#B090FF' : 'var(--text-soft)',
              }}
            >
              {reached ? <Gift size={10} /> : <span className="w-2" />}
              {m}d
              {reached && ' ✅'}
            </motion.div>
          );
        })}
      </div>

      {/* Motivational message */}
      <motion.p
        key={currentStreak}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-sm font-medium text-center"
        style={{ color: 'var(--text-mid)' }}
      >
        {message}
      </motion.p>
    </motion.div>
  );
}
