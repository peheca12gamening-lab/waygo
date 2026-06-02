import { motion } from 'framer-motion';
import { Crosshair, Layers, Eye, EyeOff } from 'lucide-react';

interface FABsProps {
  onRecenter: () => void;
  onToggleFog: () => void;
  onToggleExplorers: () => void;
  isFogEnabled: boolean;
  isExplorersEnabled: boolean;
}

const fabStyle = {
  background: 'rgba(255,255,255,0.92)',
  backdropFilter: 'blur(16px)',
  boxShadow: '0 4px 16px rgba(176,144,255,0.2)',
  border: '1.5px solid #E8E8F8',
};

export function FABs({ onRecenter, onToggleFog, onToggleExplorers, isFogEnabled, isExplorersEnabled }: FABsProps) {
  return (
    <div className="absolute bottom-36 right-4 z-10 flex flex-col gap-3">
      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onRecenter}
        className="w-12 h-12 rounded-full flex items-center justify-center" style={fabStyle}>
        <Crosshair size={22} style={{ color: '#B090FF' }} />
      </motion.button>

      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onToggleFog}
        className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
        style={isFogEnabled
          ? { background: 'linear-gradient(135deg, #7AC8FF, #78E8C8)', boxShadow: '0 4px 16px rgba(120,200,255,0.4)', border: 'none' }
          : fabStyle
        }>
        <Layers size={22} style={{ color: isFogEnabled ? 'white' : '#B090FF' }} />
      </motion.button>

      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onToggleExplorers}
        className="w-12 h-12 rounded-full flex items-center justify-center transition-all"
        style={isExplorersEnabled
          ? { background: 'linear-gradient(135deg, #FF90B5, #FFB878)', boxShadow: '0 4px 16px rgba(255,144,181,0.4)', border: 'none' }
          : fabStyle
        }>
        {isExplorersEnabled
          ? <Eye size={22} style={{ color: 'white' }} />
          : <EyeOff size={22} style={{ color: '#B090FF' }} />
        }
      </motion.button>
    </div>
  );
}
