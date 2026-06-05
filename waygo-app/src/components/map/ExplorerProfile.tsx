import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, MessageCircle, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getProfileById, getFriendshipStatus } from '../../lib/db';

interface ExplorerData {
  user_id: string;
  full_name: string;
  lat: number;
  lng: number;
}

interface ExplorerProfileProps {
  explorer: ExplorerData;
  index: number;
  onClose: () => void;
  onStartChat?: (userId: string, userName: string) => void;
}

const COLORS = ['#FF90B5', '#B090FF', '#7AC8FF', '#78E8C8', '#FFB878'];

export function ExplorerProfile({ explorer, index, onClose, onStartChat }: ExplorerProfileProps) {
  const { user, addFriend } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [friendship, setFriendship] = useState<'none' | 'pending' | 'accepted'>('none');
  const [adding, setAdding] = useState(false);
  const color = COLORS[index % COLORS.length];

  useEffect(() => {
    if (!user) return;
    getProfileById(explorer.user_id).then(setProfile);
    getFriendshipStatus(user.id, explorer.user_id).then(setFriendship);
  }, [user, explorer.user_id]);

  const handleAddFriend = async () => {
    if (!user || adding) return;
    setAdding(true);
    try {
      await addFriend(explorer.user_id);
      setFriendship('pending');
    } catch {
      // silent
    }
    setAdding(false);
  };

  const isMe = user?.id === explorer.user_id;
  const name = explorer.full_name || profile?.full_name || 'Explorer';
  const avatarUrl = profile?.profile_image_url;
  const level = profile?.current_level ?? 0;
  const streak = profile?.streak_current ?? 0;
  const checkins = profile?.checkins_total ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      className="absolute top-32 left-4 right-4 z-40 rounded-2xl p-4"
      style={{
        background: 'rgba(255,255,255,0.97)',
        backdropFilter: 'blur(20px)',
        border: '1.5px solid #E8E8F8',
        boxShadow: '0 8px 32px rgba(176,144,255,0.2)',
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg overflow-hidden"
            style={{ background: color }}
          >
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              name.charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <p className="text-waygo-text font-bold">{name}</p>
            <p className="text-waygo-textSoft text-xs flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-green-400" />
              Active now
            </p>
          </div>
        </div>
        <button onClick={onClose} className="text-waygo-textSoft text-lg leading-none w-7 h-7 flex items-center justify-center rounded-full" style={{ background: '#EAEAF8' }}>
          ✕
        </button>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-3">
        {[
          [String(checkins ?? 0), 'Check-ins'],
          [`Lv.${level}`, 'Level'],
          [`🔥${streak}`, 'Streak'],
        ].map(([val, label]) => (
          <div key={label} className="rounded-xl p-2 text-center" style={{ background: '#F5F5FF' }}>
            <p className="font-bold text-base" style={{ color }}>{val}</p>
            <p className="text-waygo-textSoft text-xs">{label}</p>
          </div>
        ))}
      </div>

      {!isMe && (
        <>
          {friendship === 'accepted' && onStartChat && (
            <button
              onClick={() => onStartChat(explorer.user_id, name)}
              className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 mb-2 text-white"
              style={{ background: 'linear-gradient(135deg,#B090FF,#7AC8FF)' }}
            >
              <MessageCircle size={16} /> Open Chat
            </button>
          )}
          {friendship === 'pending' && (
            <div className="w-full py-2.5 rounded-xl text-sm font-bold text-center flex items-center justify-center gap-2"
              style={{ background: '#FFF3E0', color: '#FFB878', border: '1.5px solid #FFE0B0' }}>
              <Clock size={16} /> Pending Request
            </div>
          )}
          {friendship === 'none' && (
            <button
              onClick={handleAddFriend}
              disabled={adding}
              className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              style={{ background: `${color}18`, color, border: `1.5px solid ${color}44` }}
            >
              <UserPlus size={16} /> {adding ? 'Sending...' : '+ Add Friend'}
            </button>
          )}
        </>
      )}
    </motion.div>
  );
}
