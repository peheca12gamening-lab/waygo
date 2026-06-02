import { motion } from 'framer-motion';
import type { CategoryFilter } from '../../types';

interface CategoryChipsProps {
  selected: CategoryFilter;
  onSelect: (category: CategoryFilter) => void;
}

const categories: { id: CategoryFilter; label: string; emoji: string; color: string }[] = [
  { id: 'all',      label: 'All',      emoji: '🌍', color: '#B090FF' },
  { id: 'cafe',     label: 'Cafes',    emoji: '☕', color: '#FF90B5' },
  { id: 'museum',   label: 'Museums',  emoji: '🏛️', color: '#7AC8FF' },
  { id: 'cultural', label: 'Cultural', emoji: '🕌', color: '#78E8C8' },
  { id: 'featured', label: 'Featured', emoji: '⭐', color: '#FFB878' },
];

export function CategoryChips({ selected, onSelect }: CategoryChipsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="absolute top-20 left-4 right-4 z-10"
    >
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onSelect(cat.id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all"
            style={selected === cat.id
              ? { background: cat.color, color: 'white', boxShadow: `0 4px 12px ${cat.color}55` }
              : { background: 'rgba(255,255,255,0.92)', color: '#5858A0', backdropFilter: 'blur(12px)', border: '1px solid #E8E8F8' }
            }
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
