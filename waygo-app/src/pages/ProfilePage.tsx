import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Settings, X, UserPlus, ChevronRight, Camera, Heart, Check } from 'lucide-react';
import { useAuth, FriendRequest } from '../context/AuthContext';
import { useApp, LangCode } from '../context/AppContext';
import { useUI } from '../context/UIContext';
import { BADGES } from '../data/seed';
import { XPBar, StreakCard } from '../components/shared';

const PARROT_AVATARS = [
  { src: '/avatars/parrot-holo.png',   label: 'Holographic', color: '#78E8C8' },
  { src: '/avatars/parrot-fire.png',   label: 'Fire',        color: '#FFB878' },
  { src: '/avatars/parrot-pink.png',   label: 'Rose',        color: '#FF90B5' },
  { src: '/avatars/parrot-blue.png',   label: 'Ocean',       color: '#7AC8FF' },
  { src: '/avatars/parrot-dark.png',   label: 'Shadow',      color: '#8090A0' },
  { src: '/avatars/parrot-purple.png', label: 'Cosmic',      color: '#B090FF' },
];

const rainbowGrad = 'linear-gradient(135deg,#FF90B5,#B090FF,#7AC8FF,#78E8C8)';

// Demo friend data
const DEMO_FRIENDS = [
  { id: 'u1', name: 'Maria S.', color: '#FF90B5', level: 8, points: 420, checkins: 67, avatar: '', visitHistory: [{placeName:'Regional History Museum',date:'2024-01-10',pointsEarned:50}], badges: ['first-steps','coffee-lover'] },
  { id: 'u2', name: 'Petar K.', color: '#7AC8FF', level: 7, points: 360, checkins: 52, avatar: '/avatars/parrot-blue.png', visitHistory: [{placeName:'Ancient Theatre',date:'2024-01-09',pointsEarned:50}], badges: ['first-steps'] },
  { id: 'u3', name: 'Elena V.', color: '#78E8C8', level: 6, points: 290, checkins: 41, avatar: '', visitHistory: [{placeName:'Kapana Creative District',date:'2024-01-08',pointsEarned:0}], badges: ['first-steps','week-warrior'] },
];

const DEMO_INCOMING_REQUESTS: FriendRequest[] = [
  { id: 'req1', fromUserId: 'u4', fromUserName: 'Nikolay D.', fromUserAvatar: '', fromUserColor: '#FFB878', date: new Date(Date.now() - 3600000).toISOString(), status: 'pending' },
];

// ── BottomModal wrapper ──────────────────────────────────────────────────────
function BottomModal({ children, onClose, tall = false }: { children: React.ReactNode; onClose: () => void; tall?: boolean }) {
  const { openModal, closeModal } = useUI();
  useEffect(() => { openModal(); return () => closeModal(); }, [openModal, closeModal]);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col justify-end"
      style={{ background: 'rgba(0,0,0,0.25)', backdropFilter: 'blur(6px)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 400, damping: 35 }}
        className={`w-full max-w-[430px] mx-auto rounded-t-3xl overflow-y-auto ${tall ? 'max-h-[90vh]' : 'max-h-[80vh]'}`}
        style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', boxShadow: '0 -8px 40px rgba(176,144,255,0.2)' }}>
        {children}
      </motion.div>
    </motion.div>
  );
}

// ── Full-screen slide panel ──────────────────────────────────────────────────
function SlidePanel({ children }: { children: React.ReactNode; onClose?: () => void }) {
  const { openModal, closeModal } = useUI();
  useEffect(() => { openModal(); return () => closeModal(); }, [openModal, closeModal]);
  return (
    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 350, damping: 32 }}
      className="fixed inset-0 z-50 flex flex-col overflow-y-auto"
      style={{ background: 'var(--rainbow-bg)' }}>
      {children}
    </motion.div>
  );
}

// ── Panel header ─────────────────────────────────────────────────────────────
function PanelHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-center justify-between px-5 pt-6 pb-4 sticky top-0 z-10"
      style={{ background: 'var(--bg-card)', backdropFilter: 'blur(16px)', borderBottom: '1.5px solid var(--border)' }}>
      <h2 className="text-xl font-black text-waygo-text">{title}</h2>
      <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center"
        style={{ background: '#EAEAF8', border: '1.5px solid #E0E0F0' }}>
        <X size={18} style={{ color: '#9090C0' }} />
      </button>
    </div>
  );
}

// ── BADGE DETAIL PANEL ───────────────────────────────────────────────────────
const BADGE_DETAILS: Record<string, { difficulty: string; color: string; maxValue: number; unit: string; category: string }> = {
  'first-steps':    { difficulty: 'Easy',   color: '#78E8C8', maxValue: 1,  unit: 'check-in',  category: 'Explorer' },
  'coffee-lover':   { difficulty: 'Easy',   color: '#FFB878', maxValue: 3,  unit: 'café visit', category: 'Foodie' },
  'week-warrior':   { difficulty: 'Medium', color: '#FF90B5', maxValue: 7,  unit: 'day streak', category: 'Dedication' },
  'culture-vulture':{ difficulty: 'Medium', color: '#7AC8FF', maxValue: 3,  unit: 'museum',    category: 'Culture' },
  'night-owl':      { difficulty: 'Hard',   color: '#B090FF', maxValue: 1,  unit: 'late check-in', category: 'Night Life' },
  'early-bird':     { difficulty: 'Hard',   color: '#FFD878', maxValue: 1,  unit: 'early check-in', category: 'Morning' },
  'quest-master':   { difficulty: 'Hard',   color: '#FF90B5', maxValue: 5,  unit: 'quest',     category: 'Quests' },
  'explorer':       { difficulty: 'Legendary', color: '#B090FF', maxValue: 50, unit: '% explored', category: 'Explorer' },
};

function BadgeDetailPanel({ badgeId, onClose }: { badgeId: string; onClose: () => void }) {
  const { user } = useAuth();
  const badge = BADGES.find(b => b.id === badgeId);
  const detail = BADGE_DETAILS[badgeId] || { difficulty: 'Medium', color: '#B090FF', maxValue: 1, unit: '', category: 'General' };
  if (!badge) return null;

  const earned = user?.badges.includes(badgeId) ?? false;
  // Compute current progress from user stats
  const getProgress = (): number => {
    if (!user) return 0;
    if (badgeId === 'first-steps') return Math.min(user.checkins_total, 1);
    if (badgeId === 'coffee-lover') return Math.min(user.visitHistory.filter(v => v.placeCategory === 'cafe').length, 3);
    if (badgeId === 'week-warrior') return Math.min(user.streak_current, 7);
    if (badgeId === 'culture-vulture') return Math.min(user.visitHistory.filter(v => v.placeCategory === 'museum').length, 3);
    if (badgeId === 'quest-master') return Math.min(user.quests_completed, 5);
    if (badgeId === 'explorer') return Math.min(user.explored_percentage, 50);
    return earned ? detail.maxValue : 0;
  };

  const current = getProgress();
  const pct = Math.round((current / detail.maxValue) * 100);

  const difficultyColors: Record<string, string> = { Easy: '#78E8C8', Medium: '#FFB878', Hard: '#FF90B5', Legendary: '#B090FF' };
  const diffColor = difficultyColors[detail.difficulty] || '#B090FF';

  return (
    <SlidePanel onClose={onClose}>
      <PanelHeader title="Badge Details" onClose={onClose} />
      <div className="p-5 pb-10 space-y-5">
        {/* Badge card */}
        <div className="rounded-3xl p-8 flex flex-col items-center text-center"
          style={{ background: earned ? `linear-gradient(135deg,${detail.color}15,${detail.color}08)` : '#F5F5FF', border: `2px solid ${earned ? detail.color : '#E8E8F8'}` }}>
          <div className="text-7xl mb-4 filter" style={{ filter: earned ? 'none' : 'grayscale(100%) opacity(0.4)' }}>{badge.icon}</div>
          <h3 className="text-2xl font-black text-waygo-text mb-1">{badge.name}</h3>
          <p className="text-waygo-textSoft text-sm mb-3">{badge.description}</p>
          <div className="flex gap-2 flex-wrap justify-center">
            <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: `${diffColor}20`, color: diffColor }}>
              {detail.difficulty}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: '#F0F0FF', color: '#9090C0' }}>
              {detail.category}
            </span>
            {earned && <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ background: '#E8FFF5', color: '#00A090' }}>✅ Earned</span>}
          </div>
        </div>

        {/* Progress */}
        <div className="rounded-2xl p-5 bg-white" style={{ border: '1.5px solid #E8E8F8' }}>
          <div className="flex justify-between items-center mb-3">
            <p className="font-bold text-waygo-text">Progress</p>
            <p className="font-black text-lg" style={{ color: detail.color }}>{pct}%</p>
          </div>
          <div className="h-4 rounded-full overflow-hidden mb-2" style={{ background: '#EAEAF8' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ delay: 0.3, duration: 0.8, ease: 'easeOut' }}
              className="h-full rounded-full" style={{ background: `linear-gradient(90deg,${detail.color},${detail.color}88)` }} />
          </div>
          <p className="text-xs text-waygo-textSoft text-right">{current} / {detail.maxValue} {detail.unit}{current !== 1 ? 's' : ''}</p>
        </div>

        {/* How to earn */}
        <div className="rounded-2xl p-5 bg-white" style={{ border: '1.5px solid #E8E8F8' }}>
          <p className="font-bold text-waygo-text mb-2">How to earn</p>
          <p className="text-sm text-waygo-textSoft">{badge.description}. Keep exploring Plovdiv and checking in at places to unlock this badge!</p>
        </div>
      </div>
    </SlidePanel>
  );
}

// ── BADGES PANEL ─────────────────────────────────────────────────────────────
function BadgesPanel({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  const [selectedBadge, setSelectedBadge] = useState<string | null>(null);
  if (!user) return null;
  const difficultyColors: Record<string, string> = { Easy: '#78E8C8', Medium: '#FFB878', Hard: '#FF90B5', Legendary: '#B090FF' };

  return (
    <>
      <SlidePanel onClose={onClose}>
        <PanelHeader title={`Badges (${user.badges.length}/${BADGES.length})`} onClose={onClose} />
        <div className="p-4 pb-10 grid grid-cols-2 gap-3">
          {BADGES.map(badge => {
            const earned = user.badges.includes(badge.id);
            const detail = BADGE_DETAILS[badge.id] || { difficulty: 'Medium', color: '#B090FF' };
            const diffColor = difficultyColors[detail.difficulty] || '#B090FF';
            return (
              <motion.button key={badge.id} whileTap={{ scale: 0.95 }} onClick={() => setSelectedBadge(badge.id)}
                className="rounded-2xl p-4 flex flex-col items-center gap-2 text-center"
                style={{ background: earned ? `${detail.color}12` : '#F5F5FF', border: `1.5px solid ${earned ? detail.color : '#E8E8F8'}` }}>
                <span className="text-4xl" style={{ filter: earned ? 'none' : 'grayscale(1) opacity(0.4)' }}>{badge.icon}</span>
                <p className="font-bold text-sm text-waygo-text">{badge.name}</p>
                <span className="text-xs px-2 py-0.5 rounded-full font-semibold" style={{ background: `${diffColor}20`, color: diffColor }}>{detail.difficulty}</span>
                {earned && <span className="text-xs text-green-500 font-bold">✅ Earned</span>}
              </motion.button>
            );
          })}
        </div>
      </SlidePanel>
      <AnimatePresence>
        {selectedBadge && <BadgeDetailPanel badgeId={selectedBadge} onClose={() => setSelectedBadge(null)} />}
      </AnimatePresence>
    </>
  );
}

// ── CHECK-INS PANEL ──────────────────────────────────────────────────────────
function CheckInsPanel({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  if (!user) return null;

  const visits = user.visitHistory;


  const isExpired = (date: string) => {
    return Date.now() - new Date(date).getTime() > 24 * 3600000;
  };

  return (
    <SlidePanel onClose={onClose}>
      <PanelHeader title={`Check-ins (${visits.length})`} onClose={onClose} />
      <div className="p-4 pb-10 space-y-4">
        {visits.length === 0 && (
          <div className="text-center py-12">
            <p className="text-4xl mb-3">📍</p>
            <p className="text-waygo-textSoft text-sm">No check-ins yet. Start exploring!</p>
          </div>
        )}
        {visits.map(v => (
          <div key={v.id} className="rounded-3xl overflow-hidden bg-white" style={{ border: '1.5px solid #F0EEF8', boxShadow: '0 2px 12px rgba(176,144,255,0.08)' }}>
            {/* Photo */}
            {v.photoUrl ? (
              <img src={v.photoUrl} alt="check-in" className="w-full aspect-[4/3] object-cover" />
            ) : (
              <div className="w-full aspect-[4/3] flex flex-col items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg,#F0E8FF,#E8F0FF)' }}>
                <span className="text-5xl">{v.placeCategory === 'museum' || v.placeCategory === 'cultural' ? '🏛️' : '☕'}</span>
                <p className="text-xs text-waygo-textSoft">📍 {v.placeName}</p>
              </div>
            )}
            {/* Info */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="font-bold text-waygo-text text-sm">{v.placeName}</p>
                {v.pointsEarned > 0 && <span className="text-xs font-bold" style={{ color: '#00A090' }}>+{v.pointsEarned} pts</span>}
              </div>
              <p className="text-xs text-waygo-textSoft mb-2">{new Date(v.date).toLocaleDateString()} · {new Date(v.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>

              <div className="flex items-center justify-between">
                {/* Likes */}
                <div className="flex items-center gap-1.5">
                  <Heart size={16} style={{ color: '#FF90B5', fill: '#FF90B5' }} />
                  <span className="text-sm font-semibold text-waygo-textMid">{v.likes}</span>
                  <span className="text-xs text-waygo-textSoft">likes</span>
                </div>
                {/* Status */}
                {isExpired(v.date) ? (
                  <span className="text-xs text-waygo-textSoft bg-gray-100 px-2 py-1 rounded-full">Expired (24h)</span>
                ) : v.uploadedToFeed ? (
                  <span className="text-xs font-semibold px-2 py-1 rounded-full" style={{ background: '#E8FFF5', color: '#00A090' }}>✅ On feed</span>
                ) : (
                  <span className="text-xs text-waygo-textSoft px-2 py-1 rounded-full" style={{ background: '#F5F5FF' }}>Not uploaded</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </SlidePanel>
  );
}

// ── POINTS PANEL ─────────────────────────────────────────────────────────────
function PointsPanel({ onClose }: { onClose: () => void }) {
  const { user } = useAuth();
  if (!user) return null;
  return (
    <SlidePanel onClose={onClose}>
      <PanelHeader title="My Points" onClose={onClose} />
      <div className="p-5 pb-10 space-y-4">
        <div className="rounded-3xl p-8 flex flex-col items-center text-center"
          style={{ background: 'linear-gradient(135deg,#FFF5F8,#F8F5FF,#F0F8FF)', border: '1.5px solid #E8E0FF' }}>
          <p className="text-7xl font-black mb-2" style={{ background: rainbowGrad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {user.points}
          </p>
          <p className="text-waygo-textSoft">points available</p>
          <p className="text-xs text-waygo-textSoft mt-2">Total XP: {user.xp_total.toLocaleString()}</p>
        </div>
        <div className="rounded-2xl p-4 bg-white" style={{ border: '1.5px solid #E8E8F8' }}>
          <p className="font-bold text-waygo-text mb-2">How to earn points</p>
          <p className="text-sm text-waygo-textSoft">Visit museums and cultural sights → take a photo → upload to For You feed → earn <strong>50 pts</strong> per sight.</p>
        </div>
        <div className="rounded-2xl p-4 bg-white" style={{ border: '1.5px solid #E8E8F8' }}>
          <p className="font-bold text-waygo-text mb-3">Recent earnings</p>
          <div className="space-y-2">
            {user.visitHistory.filter(v => v.pointsEarned > 0).slice(0, 5).map(v => (
              <div key={v.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🏛️</span>
                  <div><p className="text-sm text-waygo-text font-medium">{v.placeName}</p><p className="text-xs text-waygo-textSoft">{new Date(v.date).toLocaleDateString()}</p></div>
                </div>
                <span className="font-bold text-sm" style={{ color: '#00A090' }}>+{v.pointsEarned}</span>
              </div>
            ))}
            {user.visitHistory.filter(v => v.pointsEarned > 0).length === 0 && (
              <p className="text-waygo-textSoft text-sm">No points earned yet. Visit a museum!</p>
            )}
          </div>
        </div>
      </div>
    </SlidePanel>
  );
}

// ── FRIEND PROFILE ────────────────────────────────────────────────────────────
function FriendProfile({ friend, onClose }: { friend: typeof DEMO_FRIENDS[0]; onClose: () => void }) {
  return (
    <SlidePanel onClose={onClose}>
      <PanelHeader title={friend.name} onClose={onClose} />
      <div className="p-5 pb-10 space-y-4">
        {/* Avatar + stats */}
        <div className="flex flex-col items-center py-4">
          <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-3xl font-black mb-3 overflow-hidden"
            style={{ background: friend.color, border: `3px solid ${friend.color}` }}>
            {friend.avatar ? <img src={friend.avatar} alt="" className="w-full h-full object-contain" /> : friend.name.charAt(0)}
          </div>
          <h3 className="text-xl font-black text-waygo-text">{friend.name}</h3>
          <p className="text-waygo-textSoft text-sm">Level {friend.level} Explorer</p>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[['⭐', friend.points, 'Points'],['📍', friend.checkins, 'Check-ins'],['🏆', friend.badges.length, 'Badges']].map(([icon, val, label]) => (
            <div key={String(label)} className="rounded-2xl p-3 text-center" style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)' }}>
              <div className="text-xl mb-1">{icon}</div>
              <p className="font-black text-waygo-text">{val}</p>
              <p className="text-xs text-waygo-textSoft">{label}</p>
            </div>
          ))}
        </div>
        {/* Visit history */}
        <div className="rounded-2xl p-4 bg-white" style={{ border: '1.5px solid #E8E8F8' }}>
          <p className="font-bold text-waygo-text mb-3">Recent Visits</p>
          {friend.visitHistory.map((v, i) => (
            <div key={i} className="flex items-center gap-3 py-2 border-b last:border-0" style={{ borderColor: '#F0EEF8' }}>
              <span className="text-xl">🏛️</span>
              <div className="flex-1"><p className="text-sm font-medium text-waygo-text">{v.placeName}</p><p className="text-xs text-waygo-textSoft">{new Date(v.date).toLocaleDateString()}</p></div>
              {v.pointsEarned > 0 && <span className="text-xs font-bold" style={{ color: '#00A090' }}>+{v.pointsEarned}</span>}
            </div>
          ))}
        </div>
        {/* Badges */}
        <div className="rounded-2xl p-4 bg-white" style={{ border: '1.5px solid #E8E8F8' }}>
          <p className="font-bold text-waygo-text mb-3">Badges</p>
          <div className="flex gap-3">
            {friend.badges.map(bid => {
              const b = BADGES.find(b => b.id === bid);
              return b ? <div key={bid} className="text-3xl">{b.icon}</div> : null;
            })}
          </div>
        </div>
      </div>
    </SlidePanel>
  );
}

// ── FRIENDS PANEL ─────────────────────────────────────────────────────────────
function FriendsPanel({ onClose }: { onClose: () => void }) {
  const { user, acceptFriendRequest, declineFriendRequest } = useAuth();
  const [selectedFriend, setSelectedFriend] = useState<typeof DEMO_FRIENDS[0] | null>(null);
  const [requests, setRequests] = useState<FriendRequest[]>(() => {
    const real = user?.friendRequests?.filter(r => r.status === 'pending') ?? [];
    return real.length > 0 ? real : DEMO_INCOMING_REQUESTS;
  });

  if (!user) return null;
  const myFriendIds = user.friends;
  const myFriends = DEMO_FRIENDS.filter(f => myFriendIds.includes(f.id));

  return (
    <>
      <SlidePanel onClose={onClose}>
        <PanelHeader title="Friends" onClose={onClose} />
        <div className="p-4 pb-10 space-y-4">
          {/* Incoming requests */}
          {requests.length > 0 && (
            <div>
              <p className="text-xs font-bold text-waygo-textSoft uppercase tracking-wider mb-2">Friend Requests ({requests.length})</p>
              <div className="space-y-2">
                {requests.map(req => (
                  <div key={req.id} className="flex items-center gap-3 p-3 rounded-2xl bg-white" style={{ border: '1.5px solid #E8E8F8' }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ background: req.fromUserColor }}>{req.fromUserName.charAt(0)}</div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-waygo-text">{req.fromUserName}</p>
                      <p className="text-xs text-waygo-textSoft">Wants to be your friend</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { acceptFriendRequest(req.id); setRequests(r => r.filter(x => x.id !== req.id)); }}
                        className="w-9 h-9 rounded-full flex items-center justify-center"
                        style={{ background: '#E8FFF5', border: '1.5px solid #78E8C8' }}>
                        <Check size={16} style={{ color: '#00A090' }} />
                      </button>
                      <button onClick={() => { declineFriendRequest(req.id); setRequests(r => r.filter(x => x.id !== req.id)); }}
                        className="w-9 h-9 rounded-full flex items-center justify-center"
                        style={{ background: '#FFF0F3', border: '1.5px solid #FFD0DC' }}>
                        <X size={16} style={{ color: '#FF6080' }} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* My friends */}
          <div>
            <p className="text-xs font-bold text-waygo-textSoft uppercase tracking-wider mb-2">My Friends ({myFriends.length})</p>
            {myFriends.length === 0 && (
              <div className="text-center py-8">
                <p className="text-3xl mb-2">👥</p>
                <p className="text-waygo-textSoft text-sm">No friends yet. Add some from the map!</p>
              </div>
            )}
            <div className="space-y-2">
              {myFriends.map(friend => (
                <motion.button key={friend.id} whileTap={{ scale: 0.98 }} onClick={() => setSelectedFriend(friend)}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl bg-white"
                  style={{ border: '1.5px solid #E8E8F8' }}>
                  <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center text-white font-bold text-lg"
                    style={{ background: friend.color }}>
                    {friend.avatar ? <img src={friend.avatar} alt="" className="w-full h-full object-contain" /> : friend.name.charAt(0)}
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-bold text-waygo-text">{friend.name}</p>
                    <p className="text-xs text-waygo-textSoft">Level {friend.level} · {friend.points} pts · {friend.checkins} check-ins</p>
                  </div>
                  <ChevronRight size={18} style={{ color: '#C0C0E0' }} />
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </SlidePanel>
      <AnimatePresence>
        {selectedFriend && <FriendProfile friend={selectedFriend} onClose={() => setSelectedFriend(null)} />}
      </AnimatePresence>
    </>
  );
}

// ── AVATAR PICKER ─────────────────────────────────────────────────────────────
function AvatarPickerModal({ currentAvatar, onClose, onSelect }: { currentAvatar: string; onClose: () => void; onSelect: (src: string) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState(currentAvatar);
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { onSelect(reader.result as string); onClose(); };
    reader.readAsDataURL(file);
  };
  return (
    <BottomModal onClose={onClose} tall>
      <div className="p-6 pb-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-black text-waygo-text">Choose Avatar</h2>
          <button onClick={onClose} className="p-2 rounded-full" style={{ background: '#EAEAF8' }}><X size={18} style={{ color: '#9090C0' }} /></button>
        </div>
        <p className="text-xs font-semibold text-waygo-textSoft mb-3 uppercase tracking-wider">Explorer Parrots</p>
        <div className="grid grid-cols-3 gap-3 mb-5">
          {PARROT_AVATARS.map((p) => (
            <motion.button key={p.src} whileTap={{ scale: 0.92 }} onClick={() => setSelected(p.src)}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl transition-all"
              style={{ background: selected === p.src ? `${p.color}18` : '#F5F5FF', border: selected === p.src ? `2.5px solid ${p.color}` : '2px solid #E8E8F8', boxShadow: selected === p.src ? `0 4px 16px ${p.color}44` : 'none' }}>
              <div className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center">
                <img src={p.src} alt={p.label} className="w-full h-full object-contain" />
              </div>
              <span className="text-xs font-semibold" style={{ color: selected === p.src ? p.color : '#9090C0' }}>{p.label}</span>
            </motion.button>
          ))}
        </div>
        <div className="border-t border-waygo-border pt-4 mb-4">
          <button onClick={() => fileInputRef.current?.click()} className="w-full py-3 rounded-xl flex items-center justify-center gap-2 font-semibold text-waygo-textMid"
            style={{ background: '#EAEAF8', border: '1.5px dashed #C8C8E8' }}>
            <Camera size={18} style={{ color: '#B090FF' }} /> Upload Photo
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        </div>
        <motion.button whileTap={{ scale: 0.97 }} onClick={() => { onSelect(selected); onClose(); }}
          className="w-full py-4 rounded-2xl text-white font-bold"
          style={{ background: rainbowGrad, boxShadow: '0 6px 24px rgba(176,144,255,0.4)' }}>
          Save Avatar
        </motion.button>
      </div>
    </BottomModal>
  );
}

// ── SETTINGS ──────────────────────────────────────────────────────────────────

function SettingsModal({ onClose }: { onClose: () => void }) {
  const { user, logout, updateUser } = useAuth();
  const { darkMode, setDarkMode, language, setLanguage } = useApp();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [newEmail, setNewEmail] = useState(user?.email || '');
  const [emailSaved, setEmailSaved] = useState(false);
  if (!user) return null;

  const LANGUAGES_LIST = [
    { code: 'en' as LangCode, label: 'English', flag: '🇬🇧' },
    { code: 'bg' as LangCode, label: 'Български', flag: '🇧🇬' },
    { code: 'de' as LangCode, label: 'Deutsch', flag: '🇩🇪' },
    { code: 'fr' as LangCode, label: 'Français', flag: '🇫🇷' },
    { code: 'es' as LangCode, label: 'Español', flag: '🇪🇸' },
  ];

  const items = [
    { id: 'points',   emoji: '⭐', label: 'My Points',        sub: `${user.points} pts available` },
    { id: 'rewards',  emoji: '🎁', label: 'Redeemed Rewards',  sub: `${user.redeemedRewards.length} total` },
    { id: 'history',  emoji: '📍', label: 'Visit History',     sub: `${user.visitHistory.length} places visited` },
    { id: 'email',    emoji: '✉️', label: 'Change Email',      sub: user.email },
    { id: 'language', emoji: '🌐', label: 'Language',          sub: LANGUAGES_LIST.find(l => l.code === language)?.label || 'English' },
    { id: 'darkmode', emoji: darkMode ? '☀️' : '🌙', label: darkMode ? 'Light Mode' : 'Dark Mode', sub: darkMode ? 'Currently dark' : 'Currently light', toggle: true },
    { id: 'logout',   emoji: '🚪', label: 'Logout',            sub: '', danger: true },
  ];

  return (
    <BottomModal onClose={onClose} tall>
      <div className="p-6 pb-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-black text-waygo-text flex items-center gap-2">⚙️ Settings</h2>
          <button onClick={onClose} className="p-2 rounded-full" style={{ background: '#EAEAF8' }}><X size={18} style={{ color: '#9090C0' }} /></button>
        </div>
        <div className="space-y-2">
          {items.map(item => (
            <div key={item.id}>
              <button
                onClick={() => {
                  if (item.id === 'logout') { logout(); onClose(); }
                  else if ((item as any).toggle) setDarkMode(!darkMode);
                  else setActiveSection(activeSection === item.id ? null : item.id);
                }}
                className="w-full flex items-center gap-3 p-4 rounded-2xl transition-all"
                style={{ background: (item as any).danger ? '#FFF0F3' : 'var(--bg-secondary)', border: `1.5px solid ${(item as any).danger ? '#FFD0DC' : 'var(--border)'}` }}>
                <span className="text-xl">{item.emoji}</span>
                <div className="flex-1 text-left">
                  <p className="font-semibold text-sm" style={{ color: (item as any).danger ? '#FF6080' : '#1A1A3E' }}>{item.label}</p>
                  {item.sub && <p className="text-xs mt-0.5 text-waygo-textSoft">{item.sub}</p>}
                </div>
                {!(item as any).danger && !(item as any).toggle && <ChevronRight size={16} className={`text-waygo-textSoft transition-transform ${activeSection === item.id ? 'rotate-90' : ''}`} />}
              </button>
              <AnimatePresence>
                {activeSection === item.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="p-4 mt-1 mb-2 rounded-2xl" style={{ background: 'var(--bg-secondary)', border: '1.5px solid var(--border)' }}>
                      {item.id === 'points' && (
                        <div className="text-center">
                          <p className="text-5xl font-black mb-1" style={{ background: rainbowGrad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{user.points}</p>
                          <p className="text-waygo-textSoft text-sm">points available</p>
                          <p className="text-waygo-textSoft text-xs mt-2">Earn from sights. Redeem at cafes & restaurants.</p>
                        </div>
                      )}
                      {item.id === 'rewards' && (
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {user.redeemedRewards.length === 0 ? <p className="text-waygo-textSoft text-sm text-center py-2">No rewards yet</p>
                            : user.redeemedRewards.map(r => (
                              <div key={r.id} className="flex items-center gap-3 p-2 rounded-xl bg-white">
                                <span className="text-xl">🎁</span>
                                <div className="flex-1"><p className="text-waygo-text text-sm font-medium">{r.businessName}</p><p className="text-waygo-textSoft text-xs">{r.description}</p></div>
                              </div>
                            ))}
                        </div>
                      )}
                      {item.id === 'history' && (
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {user.visitHistory.length === 0 ? <p className="text-waygo-textSoft text-sm text-center py-2">No visits yet!</p>
                            : user.visitHistory.map(v => (
                              <div key={v.id} className="flex items-center gap-3 p-2 rounded-xl bg-white">
                                <span className="text-xl">{v.placeCategory === 'museum' || v.placeCategory === 'cultural' ? '🏛️' : '☕'}</span>
                                <div className="flex-1"><p className="text-waygo-text text-sm font-medium">{v.placeName}</p><p className="text-waygo-textSoft text-xs">{new Date(v.date).toLocaleDateString()}</p></div>
                                {v.pointsEarned > 0 && <span className="text-sm font-bold" style={{ color: '#00A090' }}>+{v.pointsEarned}pts</span>}
                              </div>
                            ))}
                        </div>
                      )}
                      {item.id === 'email' && (
                        <div className="space-y-3">
                          <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="w-full py-3 px-4 rounded-xl outline-none"
                            style={{ background: 'white', border: '1.5px solid #E0E0F5', color: '#1A1A3E' }} placeholder="New email address" />
                          <button onClick={() => { if (newEmail.includes('@')) { updateUser({ email: newEmail }); setEmailSaved(true); setTimeout(() => setEmailSaved(false), 2000); } }}
                            className="w-full py-3 rounded-xl text-white font-bold text-sm" style={{ background: rainbowGrad }}>
                            {emailSaved ? '✅ Saved!' : 'Save Email'}
                          </button>
                        </div>
                      )}
                      {item.id === 'language' && (
                        <div className="space-y-2">
                          {LANGUAGES_LIST.map(lang => (
                            <button key={lang.code} onClick={() => setLanguage(lang.code as LangCode)}
                              className="w-full flex items-center gap-3 p-3 rounded-xl transition-all"
                              style={{ background: language === lang.code ? '#F0E8FF' : 'var(--bg-card)', border: `1.5px solid ${language === lang.code ? '#B090FF' : 'var(--border)'}` }}>
                              <span className="text-2xl">{lang.flag}</span>
                              <span className="font-semibold text-sm text-waygo-text">{lang.label}</span>
                              {language === lang.code && <span className="ml-auto text-purple-500">✓</span>}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </BottomModal>
  );
}

function AddFriendModal({ onClose }: { onClose: () => void }) {
  const { addFriend } = useAuth();
  const [username, setUsername] = useState('');
  const [searched, setSearched] = useState(false);
  const [added, setAdded] = useState<string[]>([]);
  const demoUsers = [
    { id: 'u1', name: 'Maria S.',  level: 8, color: '#FF90B5' },
    { id: 'u2', name: 'Petar K.', level: 7, color: '#B090FF' },
    { id: 'u3', name: 'Elena V.', level: 6, color: '#7AC8FF' },
  ];
  const results = searched ? demoUsers.filter(u => u.name.toLowerCase().includes(username.toLowerCase())) : [];
  return (
    <BottomModal onClose={onClose}>
      <div className="p-6 pb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-waygo-text">👥 Add Friend</h2>
          <button onClick={onClose} className="p-2 rounded-full" style={{ background: '#EAEAF8' }}><X size={18} style={{ color: '#9090C0' }} /></button>
        </div>
        <div className="flex gap-2 mb-4">
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} placeholder="Search by name…"
            className="flex-1 py-3 px-4 rounded-xl outline-none" style={{ background: '#F5F5FF', border: '1.5px solid #E0E0F5', color: '#1A1A3E' }} />
          <button onClick={() => setSearched(true)} className="px-4 rounded-xl text-white font-bold" style={{ background: rainbowGrad }}>Search</button>
        </div>
        <div className="space-y-2">
          {results.map(u => (
            <div key={u.id} className="flex items-center gap-3 p-3 rounded-2xl" style={{ background: '#F5F5FF', border: '1.5px solid #E8E8F8' }}>
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold" style={{ background: u.color }}>{u.name.charAt(0)}</div>
              <div className="flex-1"><p className="text-waygo-text font-semibold">{u.name}</p><p className="text-waygo-textSoft text-xs">Level {u.level} Explorer</p></div>
              <button onClick={() => { addFriend(u.id); setAdded(a => [...a, u.id]); }}
                className="px-3 py-2 rounded-xl text-sm font-bold"
                style={{ background: added.includes(u.id) ? '#F0FFF8' : `${u.color}20`, color: added.includes(u.id) ? '#00A090' : u.color, border: `1.5px solid ${added.includes(u.id) ? '#C0EEE8' : `${u.color}50`}` }}>
                {added.includes(u.id) ? '✅ Added' : '+ Add'}
              </button>
            </div>
          ))}
          {searched && results.length === 0 && <p className="text-waygo-textSoft text-sm text-center py-4">No users found.</p>}
        </div>
      </div>
    </BottomModal>
  );
}

// ── MAIN PROFILE PAGE ─────────────────────────────────────────────────────────
type Panel = 'settings' | 'avatar' | 'addFriend' | 'badges' | 'checkins' | 'points' | 'friends' | null;

export function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [panel, setPanel] = useState<Panel>(null);
  const open = (p: Panel) => setPanel(p);
  const close = () => setPanel(null);

  if (!user) return null;

  const stats = [
    { label: 'Check-ins', value: user.checkins_total, icon: '📍', panel: 'checkins' as Panel },
    { label: 'Points',    value: user.points,          icon: '⭐', panel: 'points'   as Panel },
    { label: 'Friends',   value: user.friends.length,  icon: '👥', panel: 'friends'  as Panel },
    { label: 'Badges',    value: user.badges.length,   icon: '🏆', panel: 'badges'   as Panel },
  ];

  return (
    <div className="min-h-screen pb-28 pt-safe" style={{ background: 'var(--rainbow-bg)' }}>
      <div className="p-4 space-y-5 relative z-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative cursor-pointer" onClick={() => open('avatar')}>
              <div className="w-16 h-16 rounded-full overflow-hidden p-0.5"
                style={{ background: rainbowGrad }}>
                <div className="w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
                  <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center border-2 border-white" style={{ background: rainbowGrad }}>
                <Camera size={10} className="text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-xl font-black text-waygo-text">{user.name}</h1>
              <p className="text-sm text-waygo-textSoft">Level {user.level} Explorer ✨</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => open('addFriend')} className="p-2.5 rounded-full" style={{ background: '#F0E8FF', border: '1.5px solid #E0D0FF' }}>
              <UserPlus size={19} style={{ color: '#B090FF' }} />
            </button>
            <button onClick={() => open('settings')} className="p-2.5 rounded-full" style={{ background: '#F0E8FF', border: '1.5px solid #E0D0FF' }}>
              <Settings size={19} style={{ color: '#B090FF' }} />
            </button>
          </div>
        </motion.div>

        <XPBar currentXP={user.xp_total} level={user.level} />

        {/* Clickable stat cards */}
        <div className="grid grid-cols-4 gap-3">
          {stats.map((stat, i) => (
            <motion.button key={stat.label} whileTap={{ scale: 0.93 }} onClick={() => open(stat.panel)}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}
              className="rounded-2xl p-3 text-center bg-white transition-all"
              style={{ border: '1.5px solid #E8E8F8', boxShadow: '0 2px 12px rgba(176,144,255,0.08)' }}>
              <div className="text-xl mb-1">{stat.icon}</div>
              <p className="text-lg font-black text-waygo-text">{stat.value}</p>
              <p className="text-xs text-waygo-textSoft">{stat.label}</p>
            </motion.button>
          ))}
        </div>

        {user.points > 0 && (
          <div className="rounded-2xl p-4 flex items-center gap-3 cursor-pointer" onClick={() => open('points')}
            style={{ background: 'linear-gradient(135deg,#FFF5F8,#F8F5FF,#F0F8FF)', border: '1.5px solid #E8E0FF' }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ background: rainbowGrad }}>⭐</div>
            <div>
              <p className="font-black text-xl text-waygo-text">{user.points} <span className="text-base font-semibold text-waygo-textSoft">points</span></p>
              <p className="text-waygo-textSoft text-xs">Tap to see details →</p>
            </div>
          </div>
        )}

        <StreakCard currentStreak={user.streak_current} longestStreak={user.streak_longest} recentDays={[1,2,3,4,5,6,7]} />

        <div className="rounded-2xl p-4 bg-white" style={{ border: '1.5px solid #E8E8F8' }}>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-waygo-text">Plovdiv Explored</h2>
            <div className="flex items-center gap-1" style={{ color: '#B090FF' }}>
              <MapPin size={15} /><span className="text-sm font-bold">{user.explored_percentage}%</span>
            </div>
          </div>
          <div className="h-3 rounded-full overflow-hidden" style={{ background: '#EAEAF8' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: `${user.explored_percentage}%` }} transition={{ delay: 0.5, duration: 0.8 }}
              className="h-full rounded-full" style={{ background: rainbowGrad }} />
          </div>
        </div>

        {/* Badges section — clickable grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-waygo-text">Badges</h2>
            <button onClick={() => open('badges')} className="text-sm font-semibold" style={{ color: '#B090FF' }}>See all →</button>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {BADGES.slice(0, 8).map(badge => {
              const earned = user.badges.includes(badge.id);
              return (
                <motion.button key={badge.id} whileTap={{ scale: 0.9 }} onClick={() => setPanel('badges')}
                  className="flex flex-col items-center gap-1 p-2 rounded-xl"
                  style={{ background: 'white', border: '1.5px solid #E8E8F8' }}>
                  <span className="text-2xl" style={{ filter: earned ? 'none' : 'grayscale(1) opacity(0.3)' }}>{badge.icon}</span>
                  <p className="text-xs text-waygo-textSoft text-center leading-tight">{badge.name}</p>
                </motion.button>
              );
            })}
          </div>
        </div>

        {user.visitHistory.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-bold text-waygo-text">Recent Visits</h2>
              <button onClick={() => open('checkins')} className="text-sm font-semibold" style={{ color: '#B090FF' }}>See all →</button>
            </div>
            <div className="space-y-2">
              {user.visitHistory.slice(0, 3).map(v => (
                <div key={v.id} className="flex items-center gap-3 p-3 rounded-2xl bg-white" style={{ border: '1.5px solid #E8E8F8' }}>
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg" style={{ background: '#F5F5FF' }}>
                    {v.placeCategory === 'museum' || v.placeCategory === 'cultural' ? '🏛️' : '☕'}
                  </div>
                  <div className="flex-1"><p className="text-sm text-waygo-text font-medium">{v.placeName}</p><p className="text-xs text-waygo-textSoft">{new Date(v.date).toLocaleDateString()}</p></div>
                  {v.pointsEarned > 0 && <span className="text-sm font-bold" style={{ color: '#00A090' }}>+{v.pointsEarned} pts</span>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {panel === 'avatar'     && <AvatarPickerModal key="avatar"    currentAvatar={user.avatar} onClose={close} onSelect={src => updateUser({ avatar: src })} />}
        {panel === 'settings'   && <SettingsModal     key="settings"  onClose={close} />}
        {panel === 'addFriend'  && <AddFriendModal    key="addFriend" onClose={close} />}
        {panel === 'badges'     && <BadgesPanel       key="badges"    onClose={close} />}
        {panel === 'checkins'   && <CheckInsPanel     key="checkins"  onClose={close} />}
        {panel === 'points'     && <PointsPanel       key="points"    onClose={close} />}
        {panel === 'friends'    && <FriendsPanel      key="friends"   onClose={close} />}
      </AnimatePresence>
    </div>
  );
}
