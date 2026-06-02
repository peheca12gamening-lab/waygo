import { motion } from 'framer-motion';
import type { User } from '../../types';

interface AvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg';
  showLevel?: boolean;
}

const sizeClasses = {
  sm: 'w-10 h-10',
  md: 'w-14 h-14',
  lg: 'w-20 h-20',
};

const ringSizes = {
  sm: 'w-12 h-12',
  md: 'w-16 h-16',
  lg: 'w-24 h-24',
};

const levelSizes = {
  sm: 'w-4 h-4 text-[8px]',
  md: 'w-5 h-5 text-[10px]',
  lg: 'w-7 h-7 text-xs',
};

export function Avatar({ user, size = 'md', showLevel = true }: AvatarProps) {
  const levelColor = `hsl(${user.level * 20}, 70%, 50%)`;

  return (
    <div className="relative inline-block">
      <motion.div
        whileHover={{ scale: 1.05 }}
        className={`${ringSizes[size]} rounded-full p-0.5 bg-gradient-to-br from-waygo-teal via-waygo-amber to-waygo-tealDark`}
      >
        <div className="w-full h-full rounded-full bg-waygo-darkMid flex items-center justify-center overflow-hidden">
          <img
            src={user.avatar}
            alt={user.name}
            className={`${sizeClasses[size]} object-cover`}
          />
        </div>
      </motion.div>

      {showLevel && (
        <div
          className={`absolute -bottom-1 -right-1 ${levelSizes[size]} rounded-full flex items-center justify-center text-white font-bold shadow-lg`}
          style={{ backgroundColor: levelColor }}
        >
          {user.level}
        </div>
      )}
    </div>
  );
}