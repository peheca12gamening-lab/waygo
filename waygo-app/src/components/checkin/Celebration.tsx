import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Sparkles, Flame, TrendingUp } from 'lucide-react';

interface CelebrationProps {
  xpEarned: number;
  streak: number;
  questProgress?: { current: number; total: number } | null;
  isVisible: boolean;
  onDismiss: () => void;
}

export function Celebration({
  xpEarned,
  streak,
  questProgress,
  isVisible,
  onDismiss,
}: CelebrationProps) {
  const hasTriggered = useRef(false);

  useEffect(() => {
    if (isVisible && !hasTriggered.current) {
      hasTriggered.current = true;

      const duration = 2000;
      const end = Date.now() + duration;

      const colors = ['#00D4C8', '#FF8C42', '#FBBF24', '#A855F7'];

      (function frame() {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors,
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      }());

      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { x: 0.5, y: 0.6 },
          colors,
        });
      }, 500);
    }

    if (!isVisible) {
      hasTriggered.current = false;
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onDismiss}
    >
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
        className="bg-gradient-to-br from-waygo-darkMid to-waygo-dark rounded-3xl p-8 text-center max-w-sm mx-4 shadow-2xl border border-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 500, damping: 25, delay: 0.3 }}
          className="w-20 h-20 mx-auto mb-4 bg-waygo-teal/20 rounded-full flex items-center justify-center"
        >
          <Sparkles size={40} className="text-waygo-teal" />
        </motion.div>

        <h2 className="text-2xl font-bold text-white mb-2">Check-in Complete!</h2>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-center gap-2 text-4xl font-bold text-waygo-teal">
            <TrendingUp size={32} />
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25, delay: 0.5 }}
            >
              +{xpEarned} XP
            </motion.span>
          </div>

          <div className="flex items-center justify-center gap-2 text-2xl font-bold text-waygo-amber">
            <Flame size={28} />
            <span>{streak} Day Streak</span>
          </div>

          {questProgress && (
            <div className="pt-2">
              <p className="text-sm text-gray-400 mb-2">Quest Progress</p>
              <div className="h-2 bg-waygo-darkLight rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(questProgress.current / questProgress.total) * 100}%` }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="h-full bg-gradient-to-r from-waygo-teal to-waygo-tealDark rounded-full"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {questProgress.current}/{questProgress.total} waypoints
              </p>
            </div>
          )}

          <button
            onClick={onDismiss}
            className="mt-4 w-full py-3 bg-waygo-teal hover:bg-waygo-tealDark text-white font-semibold rounded-xl transition-colors"
          >
            Continue Exploring
          </button>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}