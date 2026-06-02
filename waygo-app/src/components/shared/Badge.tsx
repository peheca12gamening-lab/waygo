import { motion } from 'framer-motion';

interface BadgeProps {
  name: string;
  icon: string;
  isEarned: boolean;
  description?: string;
  onClick?: () => void;
}

export function Badge({ name, icon, isEarned, onClick }: BadgeProps) {
  return (
    <motion.button
      whileHover={isEarned ? { scale: 1.1 } : undefined}
      whileTap={isEarned ? { scale: 0.95 } : undefined}
      onClick={onClick}
      className={`flex flex-col items-center p-3 rounded-xl transition-all ${
        isEarned
          ? 'bg-gradient-to-br from-waygo-teal/20 to-waygo-amber/20 border border-waygo-teal/30'
          : 'bg-waygo-darkLight border border-gray-700 opacity-50'
      }`}
    >
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
          isEarned ? 'bg-waygo-teal/20' : 'bg-gray-700 grayscale'
        }`}
      >
        {icon}
      </div>
      <span className={`text-xs font-medium mt-2 ${isEarned ? 'text-white' : 'text-gray-500'}`}>
        {name}
      </span>
    </motion.button>
  );
}

interface BadgeGridProps {
  earned: string[];
  allBadges: { id: string; name: string; icon: string; description: string }[];
  onBadgeClick?: (badge: { id: string; name: string; icon: string; description: string }) => void;
}

export function BadgeGrid({ earned, allBadges, onBadgeClick }: BadgeGridProps) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {allBadges.map((badge) => (
        <Badge
          key={badge.id}
          name={badge.name}
          icon={badge.icon}
          isEarned={earned.includes(badge.name)}
          description={badge.description}
          onClick={() => onBadgeClick?.(badge)}
        />
      ))}
    </div>
  );
}