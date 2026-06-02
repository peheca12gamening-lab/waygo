import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Crown, Search } from 'lucide-react';
import type { User } from '../types';
import { useAuth } from '../context/AuthContext';
import { Avatar } from '../components/shared';
import { DEMO_USER } from '../data/seed';

type Period = 'week' | 'month' | 'all';

const ALL_USERS: Partial<User>[] = [
  { id: 'u1', name: 'Maria S.',    level: 8, xp_total: 4200, streak_current: 14, checkins_total: 67, quests_completed: 8, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria',    badges: [] },
  { id: 'u2', name: 'Petar K.',    level: 7, xp_total: 3600, streak_current: 10, checkins_total: 52, quests_completed: 6, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Petar',    badges: [] },
  { id: 'u3', name: 'Elena V.',    level: 6, xp_total: 2900, streak_current: 8,  checkins_total: 41, quests_completed: 5, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena',    badges: [] },
  { id: 'u4', name: 'Nikolay D.', level: 4, xp_total: 1800, streak_current: 5,  checkins_total: 18, quests_completed: 2, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nikolay',  badges: [] },
  { id: 'u5', name: 'Ivana R.',    level: 4, xp_total: 1500, streak_current: 4,  checkins_total: 15, quests_completed: 2, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ivana',    badges: [] },
  { id: 'u6', name: 'Stoyan M.',   level: 3, xp_total: 1200, streak_current: 3,  checkins_total: 12, quests_completed: 1, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Stoyan',   badges: [] },
  { id: 'u7', name: 'Veronica B.', level: 3, xp_total: 900,  streak_current: 2,  checkins_total: 9,  quests_completed: 1, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Veronica', badges: [] },
];
const WEEK_M: Record<string, number> = { u1: 0.4, u2: 0.6, u3: 0.5, u4: 0.9, u5: 0.8, u6: 0.7, u7: 0.3 };
const MONTH_M: Record<string, number> = { u1: 0.7, u2: 0.8, u3: 0.75, u4: 0.6, u5: 0.5, u6: 0.4, u7: 0.45 };

function buildLeaderboard(period: Period, currentUser: any): User[] {
  const base = ALL_USERS.map(u => ({
    ...DEMO_USER, ...u,
    xp_total: period === 'week' ? Math.round((u.xp_total??0) * (WEEK_M[u.id!]??0.5))
      : period === 'month' ? Math.round((u.xp_total??0) * (MONTH_M[u.id!]??0.6))
      : u.xp_total ?? 0,
  })) as User[];
  if (currentUser) {
    const myXp = period === 'week' ? Math.round(currentUser.xp_total * 0.3) : period === 'month' ? Math.round(currentUser.xp_total * 0.65) : currentUser.xp_total;
    base.push({ ...DEMO_USER, id: currentUser.id, name: currentUser.name + ' (You)', xp_total: myXp, level: currentUser.level, streak_current: currentUser.streak_current, avatar: currentUser.avatar });
  }
  return base.sort((a, b) => b.xp_total - a.xp_total);
}

const podiumColors = [
  'linear-gradient(135deg, #FFD700, #FFA500)',
  'linear-gradient(135deg, #C0C0C0, #A8A8A8)',
  'linear-gradient(135deg, #CD7F32, #B87333)',
];

export function LeaderboardPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<Period>('week');
  const [leaderboard, setLeaderboard] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => { setLeaderboard(buildLeaderboard(period, user)); }, [period, user]);

  const filtered = leaderboard.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const top3 = filtered.slice(0, 3);
  const rest = filtered.slice(3);
  // myRank unused
  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;
  const podiumHeights = [160, 200, 140];
  const podiumRankIdx = [1, 0, 2];

  return (
    <div className="min-h-screen pb-24 pt-safe" style={{ background: 'linear-gradient(160deg, #FFF8FB 0%, #F8F8FF 50%, #F0F8FF 100%)' }}>
      <div className="p-4">
        <div className="flex items-center gap-2 mb-6">
          <Trophy style={{ color: '#FFB878' }} size={24} />
          <h1 className="text-2xl font-black text-waygo-text">Leaderboard</h1>
        </div>

        {/* Period tabs */}
        <div className="flex gap-2 mb-5 p-1 rounded-2xl" style={{ background: 'var(--bg-secondary)' }}>
          {(['week', 'month', 'all'] as Period[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all"
              style={period === p
                ? { background: 'linear-gradient(135deg, #FF90B5, #B090FF, #7AC8FF)', color: 'white', boxShadow: '0 4px 12px rgba(176,144,255,0.4)' }
                : { color: '#9090C0' }}>
              {p === 'week' ? 'This Week' : p === 'month' ? 'This Month' : 'All Time'}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="mb-5 flex items-center gap-2 px-4 py-3 rounded-2xl" style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)' }}>
          <Search size={17} style={{ color: '#B090FF' }} />
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search players…"
            className="flex-1 bg-transparent outline-none text-sm font-medium" style={{color:'var(--text-primary)'}} />
        </div>

        {/* Podium */}
        {podiumOrder.length >= 3 && (
          <div className="relative h-64 flex items-end justify-center gap-3 mb-8">
            {podiumOrder.map((u, i) => {
              const ri = podiumRankIdx[i];
              const isMe = u.id === user?.id;
              return (
                <motion.div key={u.id} initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ri * 0.1 }} className="flex flex-col items-center">
                  <div className={`rounded-full mb-2 ${isMe ? 'ring-2 ring-offset-1' : ''}`} >
                    <Avatar user={u} size="md" />
                  </div>
                  {ri === 0 && <Crown size={20} className="mb-1" style={{ color: '#FFB878' }} />}
                  <div className="w-20 rounded-t-2xl flex flex-col items-center justify-center pb-3 pt-4"
                    style={{ height: podiumHeights[ri], background: podiumColors[ri] }}>
                    <span className="text-white font-black text-lg">{ri === 0 ? '1st' : ri === 1 ? '2nd' : '3rd'}</span>
                    <span className="text-white/80 text-xs mt-0.5 truncate max-w-[70px]">{u.name.split(' ')[0]}</span>
                    <span className="text-white/70 text-xs">{u.xp_total.toLocaleString()}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Rest */}
        <div className="space-y-2">
          {rest.map((u, i) => {
            const rank = i + 4;
            const isMe = u.id === user?.id;
            return (
              <motion.div key={u.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                className="flex items-center gap-3 p-3 rounded-2xl"
                style={{ background: isMe ? 'linear-gradient(135deg, #F8F0FF, #F0F5FF)' : 'var(--bg-card)', border: isMe ? '2px solid #D0B8FF' : '1.5px solid #E8E8F8', boxShadow: '0 2px 8px rgba(176,144,255,0.06)' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black"
                  style={{ background: isMe ? 'linear-gradient(135deg, #B090FF, #7AC8FF)' : '#F0F0FF', color: isMe ? 'white' : '#9090C0' }}>{rank}</div>
                <Avatar user={u} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm truncate" style={{ color: isMe ? '#B090FF' : '#1A1A3E' }}>{u.name}</p>
                  <p className="text-xs text-waygo-textSoft">Lv.{u.level} · {u.streak_current} day streak</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black" style={{ background: 'linear-gradient(135deg, #B090FF, #7AC8FF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {u.xp_total.toLocaleString()}
                  </p>
                  <p className="text-xs text-waygo-textSoft">XP</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
