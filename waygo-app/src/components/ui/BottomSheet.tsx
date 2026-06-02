import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useMotionValue, PanInfo } from 'framer-motion';
import { GripHorizontal } from 'lucide-react';
import type { BottomSheetState } from '../../types';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onStateChange?: (state: BottomSheetState) => void;
  children: React.ReactNode;
  snapPoints?: { compact: number; expanded: number };
  className?: string;
}

export function BottomSheet({ isOpen, onClose, onStateChange, children, snapPoints = { compact: 200, expanded: 400 }, className = '' }: BottomSheetProps) {
  const sheetRef = useRef<HTMLDivElement>(null);
  const [currentHeight, setCurrentHeight] = useState(snapPoints.compact);
  const [sheetState, setSheetState] = useState<BottomSheetState>('compact');
  const constraintsRef = useRef<HTMLDivElement>(null);
  const y = useMotionValue(0);

  const updateState = useCallback((height: number) => {
    const state: BottomSheetState = height >= snapPoints.expanded - 20 ? 'expanded' : 'compact';
    if (state !== sheetState) { setSheetState(state); onStateChange?.(state); }
  }, [sheetState, onStateChange, snapPoints.expanded]);

  useEffect(() => {
    if (!isOpen) { setCurrentHeight(0); y.set(400); }
  }, [isOpen, y]);

  const handleDragEnd = useCallback((_: any, info: PanInfo) => {
    const currentY = y.get();
    const velocity = info.velocity.y;
    const dragUp = currentY < snapPoints.expanded / 2;
    const snapTo = dragUp || velocity < -500 ? snapPoints.expanded : snapPoints.compact;
    y.set(snapTo - currentHeight);
    setCurrentHeight(snapTo);
    updateState(snapTo);
  }, [y, currentHeight, snapPoints, updateState]);

  if (!isOpen) return null;

  return (
    <>
      <motion.div ref={constraintsRef} className="fixed inset-0 z-40" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
      <motion.div
        ref={sheetRef}
        className={`fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl shadow-2xl ${className}`}
        style={{ y, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(24px)', borderTop: '1.5px solid #E8E8F8' }}
        drag="y" dragConstraints={constraintsRef} dragElastic={{ top: 0, bottom: 0 }} dragMomentum={false}
        onDragEnd={handleDragEnd} initial={{ y: 400 }} animate={{ y: 0 }} exit={{ y: 400 }} transition={{ type: 'spring', stiffness: 400, damping: 40 }}
      >
        <div className="flex justify-center pt-3 pb-2">
          <GripHorizontal size={32} style={{ color: '#C8C8E8' }} />
        </div>
        <div className="px-4 pb-4">{children}</div>
      </motion.div>
    </>
  );
}

interface PlaceCardProps {
  name: string;
  category: string;
  distance: string;
  rating?: number;
  description?: string;
  address?: string;
  checkinCount?: number;
  onCheckIn: () => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  onClose?: () => void;
}

const categoryMeta: Record<string, { emoji: string; color: string; bg: string }> = {
  cafe:     { emoji: '☕', color: '#FF90B5', bg: '#FFF0F5' },
  museum:   { emoji: '🏛️', color: '#7AC8FF', bg: '#F0F8FF' },
  cultural: { emoji: '🕌', color: '#78E8C8', bg: '#F0FFF8' },
  bar:      { emoji: '🍺', color: '#FFB878', bg: '#FFF8F0' },
  shop:     { emoji: '🛍️', color: '#B090FF', bg: '#F8F0FF' },
};

export function PlaceCard({ name, category, distance, rating, description, address, checkinCount, onCheckIn, isExpanded = false, onToggleExpand, onClose }: PlaceCardProps) {
  const meta = categoryMeta[category] || { emoji: '📍', color: '#B090FF', bg: '#F8F0FF' };
  const isSight = category === 'museum' || category === 'cultural';

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: meta.bg }}>
          {meta.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-waygo-text text-base truncate">{name}</h3>
          <p className="text-sm" style={{ color: meta.color }}>
            <span className="capitalize font-medium">{category}</span>
            <span className="text-waygo-textSoft"> · {distance}</span>
          </p>
        </div>
        {rating && (
          <div className="flex items-center gap-1 text-amber-400 text-sm font-semibold">⭐ {rating.toFixed(1)}</div>
        )}
      </div>

      {isExpanded && description && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-2">
          <p className="text-waygo-textMid text-sm leading-relaxed">{description}</p>
          {address && <p className="text-sm text-waygo-textSoft flex items-center gap-1.5">📍 {address}</p>}
          {checkinCount && <p className="text-xs text-waygo-textSoft">{checkinCount} check-ins</p>}
        </motion.div>
      )}

      {/* Points badge for sights */}
      {isSight && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold"
          style={{ background: 'linear-gradient(135deg, #E8FFFA, #E8F4FF)', color: '#00A090', border: '1px solid #C0EEE8' }}>
          ⭐ Visit to earn 50 points
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onCheckIn}
          className="flex-1 py-3 px-4 rounded-xl font-bold text-white text-sm transition-all active:scale-95"
          style={{ background: 'linear-gradient(135deg, #FF90B5, #B090FF, #7AC8FF)', boxShadow: '0 4px 16px rgba(176, 144, 255, 0.35)' }}
        >
          🧭 Start Route
        </button>
        <button
          onClick={isExpanded ? (onClose || onToggleExpand) : onToggleExpand}
          className="px-4 py-3 rounded-xl font-semibold text-sm transition-colors"
          style={{ background: '#EAEAF8', color: '#9090C0' }}
        >
          {isExpanded ? 'Close' : 'More'}
        </button>
      </div>
    </div>
  );
}
