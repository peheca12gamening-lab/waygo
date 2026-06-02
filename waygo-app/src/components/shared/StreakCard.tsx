import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

interface StreakCardProps {
  currentStreak: number;
  longestStreak: number;
  recentDays?: number[];
}

export function StreakCard({ currentStreak, longestStreak, recentDays = [] }: StreakCardProps) {
  const days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const dayOfWeek = date.getDay();
    const isActive = recentDays.includes(29 - i) || (i >= recentDays.length && i >= recentDays.length + 3);
    return { dayOfWeek, isActive, date: date.getDate() };
  });

  return (
    <div className="bg-gradient-to-br from-waygo-darkLight to-waygo-dark rounded-2xl p-4 border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div
            animate={currentStreak > 0 ? {
              scale: [1, 1.2, 1],
              rotate: [0, -5, 5, 0],
            } : undefined}
            transition={{ duration: 0.5 }}
            className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center"
          >
            <Flame size={28} className="text-white" />
          </motion.div>
          <div>
            <motion.p
              key={currentStreak}
              initial={{ scale: 1.5 }}
              animate={{ scale: 1 }}
              className="text-3xl font-bold text-white"
            >
              {currentStreak}
            </motion.p>
            <p className="text-sm text-gray-400">Day Streak</p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-sm text-gray-400">Longest</p>
          <p className="text-lg font-bold text-waygo-amber">{longestStreak} days</p>
        </div>
      </div>

      <div>
        <p className="text-xs text-gray-500 mb-2">Last 30 days</p>
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => (
            <motion.div
              key={index}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: index * 0.01 }}
              className={`aspect-square rounded-sm flex items-center justify-center text-[8px] ${
                day.isActive
                  ? 'bg-waygo-teal text-white'
                  : day.dayOfWeek === 0 || day.dayOfWeek === 6
                  ? 'bg-gray-800 text-gray-600'
                  : 'bg-waygo-darkMid text-gray-600'
              }`}
            >
              {day.date}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}