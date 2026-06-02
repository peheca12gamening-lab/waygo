import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Map, ScrollText, Sparkles, User, Trophy } from 'lucide-react';
import { useUI } from '../../context/UIContext';
import { useApp } from '../../context/AppContext';

export function BottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { isModalOpen } = useUI();
  const { t } = useApp();

  const navItems = [
    { path: '/',            label: t.map,    icon: Map       },
    { path: '/quests',      label: t.quests, icon: ScrollText },
    { path: '/foryou',      label: t.forYou, icon: Sparkles  },
    { path: '/profile',     label: t.profile,icon: User      },
    { path: '/leaderboard', label: t.top,    icon: Trophy    },
  ];

  return (
    <motion.nav
      className="fixed bottom-0 left-0 right-0 z-50 px-2 pb-safe"
      animate={{ y: isModalOpen ? 120 : 0 }}
      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
    >
      <div className="max-w-[430px] mx-auto">
        <div className="backdrop-blur-xl border-t rounded-t-2xl px-2 py-2 flex items-center justify-around"
          style={{
            background: 'var(--bg-card)',
            borderColor: 'var(--border)',
            boxShadow: '0 -4px 24px var(--shadow-nav)',
          }}>
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = pathname === path;
            return (
              <button key={path} onClick={() => navigate(path)}
                className="relative flex flex-col items-center py-1 px-3 min-w-[60px]">
                {isActive && (
                  <motion.div layoutId="navBg" className="absolute inset-0 rounded-xl"
                    style={{ background: 'linear-gradient(135deg,#FFD0E0,#E0D0FF,#C8E8FF)' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }} />
                )}
                <motion.div initial={false} animate={{ scale: isActive ? 1.1 : 1 }}
                  className="relative z-10" style={{ color: isActive ? '#B090FF' : 'var(--text-soft)' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}>
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </motion.div>
                <span className="relative z-10 text-xs mt-1 font-medium"
                  style={{ color: isActive ? '#B090FF' : 'var(--text-soft)' }}>
                  {label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </motion.nav>
  );
}
