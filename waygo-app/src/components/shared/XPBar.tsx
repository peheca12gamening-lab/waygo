import { motion } from 'framer-motion';
import { xpProgressInLevel } from '../../utils/geo';

interface XPBarProps {
  currentXP: number;
  level: number;
  compact?: boolean;
}

export function XPBar({ currentXP, level, compact = false }: XPBarProps) {
  const progress = xpProgressInLevel(currentXP);

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-waygo-teal">Lv.{level}</span>
        <div className="flex-1 h-1.5 bg-waygo-darkLight rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress.percentage}%` }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-waygo-teal to-waygo-tealDark rounded-full"
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-waygo-teal to-waygo-tealDark flex items-center justify-center">
            <span className="text-sm font-bold text-white">{level}</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-white">Level {level}</p>
            <p className="text-xs text-gray-400">{progress.current} / {progress.total} XP</p>
          </div>
        </div>
        <span className="text-sm font-bold text-waygo-teal">
          {Math.round(progress.percentage)}%
        </span>
      </div>

      <div className="h-3 bg-waygo-darkLight rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress.percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full bg-gradient-to-r from-waygo-teal via-waygo-teal to-waygo-amber rounded-full relative"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
        </motion.div>
      </div>

      <p className="text-xs text-gray-500 text-right">
        {progress.total - progress.current} XP to Level {level + 1}
      </p>
    </div>
  );
}