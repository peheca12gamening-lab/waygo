import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Trophy, Crown, Search, Medal } from 'lucide-react';
import type { LeaderboardEntry } from '../types';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { Avatar } from '../components/shared';
import { Skeleton, SkeletonLine, SkeletonCard } from '../components/shared/Skeleton';
import { getLeaderboard } from '../lib/db';

type Period = 'week' | 'month' | 'all';

const podiumColors = [
  'linear-gradient(135deg, #FFD700, #FFA500)',
  'linear-gradient(135deg, #C0C0C0, #A8A8A8)',
  'linear-gradient(135deg, #CD7F32, #B87333)',
];
const podiumHeights = [200, 160, 140];

const periodLabels: Record<Period, string> = { week: 'xp_week', month: 'xp_month', all: 'xp_total' };

export function LeaderboardPage() {
  const { user } = useAuth();
  const { t } = useApp();
  const [period, setPeriod] = useState<Period>('week');
  const [searchQuery, setSearchQuery] = useState('');

  const periodLabel = periodLabels[period];
  const periodKey = periodLabel as keyof LeaderboardEntry;

  const { data: leaderboard = [], isLoading } = useQuery({
    queryKey: ['leaderboard', period],
    queryFn: () => getLeaderboard(period),
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 30,
  });

  const sorted = useMemo(() => {
    return [...leaderboard].sort((a, b) => {
      const aVal = (a as any)[periodKey] ?? a.xp_total ?? 0;
      const bVal = (b as any)[periodKey] ?? b.xp_total ?? 0;
      return bVal - aVal;
    });
  }, [leaderboard, periodKey]);

  const filtered = sorted.filter(u =>
    u.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const top3 = filtered.slice(0, 3);
  const rest = filtered.slice(3);
  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;
  const podiumRankIdx = [1, 0, 2];

  if (isLoading) {
    return (
      <div className="min-h-screen pb-24 pt-safe" style={{ background: 'var(--rainbow-bg)' }}>
        <div className="p-4 space-y-4">
          <SkeletonLine width="40%" height={24} />
          <div className="flex gap-2">
            {[1,2,3].map(i => <Skeleton key={i} className="flex-1 h-10" />)}
          </div>
          {[1,2,3,4,5].map(i => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 pt-safe" style={{ background: 'var(--rainbow-bg)' }}>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-6">
          <Trophy style={{ color: '#FFB878' }} size={24} />
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{t.leaderboard}</h1>
        </div>

        <div className="flex gap-2 mb-5 p-1 rounded-2xl" style={{ background: 'var(--bg-secondary)' }}>
          {(['week', 'month', 'all'] as Period[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={period === p
                ? { background: 'linear-gradient(135deg, #FF90B5, #B090FF, #7AC8FF)', color: 'white', boxShadow: '0 4px 12px rgba(176,144,255,0.4)' }
                : { color: 'var(--text-soft)' }}>
              {p === 'week' ? t.thisWeek : p === 'month' ? t.thisMonth : t.allTime}
            </button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Medal size={48} className="mx-auto mb-3" style={{ color: 'var(--text-soft)' }} />
            <p className="text-sm" style={{ color: 'var(--text-soft)' }}>{t.noLeaderboardData}</p>
          </div>
        )}

        {podiumOrder.length >= 3 && (
          <div className="relative h-64 flex items-end justify-center gap-3 mb-8">
            {podiumOrder.map((u, i) => {
              const ri = podiumRankIdx[i];
              const isMe = u.id === user?.id;
              const xpValue = (u as any)[periodKey] ?? u.xp_total ?? 0;
              return (
                <motion.div key={u.id} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ri * 0.1 }} className="flex flex-col items-center">
                  <div className={`rounded-full mb-2 ${isMe ? 'ring-2 ring-offset-1' : ''}`} style={isMe ? { '--tw-ring-color': '#B090FF' } as any : {}} >
                    <Avatar user={{ name: u.name, avatar: u.avatar_url } as any} size="md" />
                  </div>
                  {ri === 0 && <Crown size={20} className="mb-1" style={{ color: '#FFB878' }} />}
                  <div className="w-20 rounded-t-2xl flex flex-col items-center justify-center pb-3 pt-4"
                    style={{ height: podiumHeights[ri], background: podiumColors[ri] }}>
                    <span className="text-white font-black text-lg">{ri === 0 ? '1st' : ri === 1 ? '2nd' : '3rd'}</span>
                    <span className="text-white/80 text-xs mt-0.5 truncate max-w-[70px]">{u.name?.split(' ')[0]}</span>
                    <span className="text-white/70 text-xs">{xpValue.toLocaleString()}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="mb-5 flex items-center gap-2 px-4 py-3 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)' }}>
          <Search size={17} style={{ color: '#B090FF' }} />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={t.searchPlayers}
            className="flex-1 bg-transparent outline-none text-sm font-medium" style={{color:'var(--text-primary)'}} />
        </div>

        <div className="space-y-2">
          {rest.map((u, i) => {
            const rank = i + 4;
            const isMe = u.id === user?.id;
            const xpValue = (u as any)[periodKey] ?? u.xp_total ?? 0;
            return (
              <motion.div key={u.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3 p-3 rounded-2xl"
                style={{ background: isMe ? 'linear-gradient(135deg, #F8F0FF, #F0F5FF)' : 'var(--bg-card)', border: isMe ? '2px solid #D0B8FF' : '1.5px solid var(--border)', boxShadow: '0 2px 8px rgba(176,144,255,0.06)' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black"
                  style={{ background: isMe ? 'linear-gradient(135deg, #B090FF, #7AC8FF)' : 'var(--bg-chip)', color: isMe ? 'white' : 'var(--text-soft)' }}>#{rank}</div>
                <Avatar user={{ name: u.name, avatar: u.avatar_url } as any} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate" style={{ color: isMe ? '#B090FF' : 'var(--text-primary)' }}>{u.name}</p>
                  <p className="text-xs" style={{ color: 'var(--text-soft)' }}>{t.level}.{u.level} · {u.streak_current} {t.dayStreak}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black" style={{ background: 'linear-gradient(135deg, #B090FF, #7AC8FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {xpValue.toLocaleString()}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--text-soft)' }}>{t.xp}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
