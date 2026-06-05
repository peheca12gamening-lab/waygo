import { motion } from 'framer-motion';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className = '', style }: SkeletonProps) {
  return (
    <motion.div
      className={`rounded-xl ${className}`}
      style={{
        background: 'var(--bg-chip)',
        ...style,
      }}
      animate={{ opacity: [0.5, 1, 0.5] }}
      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

export function SkeletonLine({ width = '100%', height = 14 }: { width?: string; height?: number }) {
  return <Skeleton style={{ width, height }} />;
}

export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`p-4 rounded-2xl space-y-3 ${className}`} style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)' }}>
      <div className="flex items-center gap-3">
        <Skeleton style={{ width: 48, height: 48, borderRadius: 16 }} />
        <div className="flex-1 space-y-2">
          <Skeleton style={{ width: '60%', height: 14 }} />
          <Skeleton style={{ width: '40%', height: 12 }} />
        </div>
      </div>
      <Skeleton style={{ width: '100%', height: 12 }} />
      <Skeleton style={{ width: '80%', height: 12 }} />
    </div>
  );
}
