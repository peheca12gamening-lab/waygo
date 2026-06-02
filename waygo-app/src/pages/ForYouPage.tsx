import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, UserPlus, MapPin, Check } from 'lucide-react';
import { useAuth, FeedPost } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

function timeAgo(date: string): string {
  const diff = (Date.now() - new Date(date).getTime()) / 60000;
  if (diff < 1) return 'Just now';
  if (diff < 60) return `${Math.round(diff)} m. ago`;
  if (diff < 1440) return `${Math.round(diff / 60)} h. ago`;
  return `${Math.round(diff / 1440)} d. ago`;
}

function GradientPhoto({ colors, emoji, place }: { colors: [string,string]; emoji: string; place: string }) {
  return (
    <div className="w-full aspect-[4/3] rounded-2xl flex flex-col items-center justify-center gap-3 relative overflow-hidden"
      style={{ background: `linear-gradient(135deg,${colors[0]},${colors[1]})` }}>
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 28px,rgba(100,80,200,0.3) 28px,rgba(100,80,200,0.3) 29px),repeating-linear-gradient(90deg,transparent,transparent 40px,rgba(100,80,200,0.2) 40px,rgba(100,80,200,0.2) 41px)',
      }} />
      <span className="text-5xl drop-shadow-lg relative z-10">{emoji}</span>
      <p className="text-xs font-semibold text-center px-4 relative z-10" style={{ color: 'rgba(60,40,100,0.75)' }}>📍 {place}</p>
    </div>
  );
}

function PostCard({ post, onLike, onAddFriend, isAdded, isMe }: {
  post: FeedPost; onLike: (id: string) => void;
  onAddFriend: (userId: string) => void;
  isAdded: boolean; isMe: boolean;
}) {
  const { user } = useAuth();
  const isLiked = user ? post.likedBy.includes(user.id) : false;

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl overflow-hidden"
      style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', boxShadow: '0 2px 16px var(--shadow)' }}>

      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-white text-base"
          style={{ background: post.userAvatar ? 'transparent' : post.userAvatarColor, border: `2.5px solid ${post.userAvatarColor}` }}>
          {post.userAvatar
            ? <img src={post.userAvatar} alt="" className="w-full h-full object-contain" />
            : <span style={{ color: 'white', fontWeight: 700 }}>{post.userName.charAt(0)}</span>
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{post.userName}</p>
          <p className="text-xs" style={{ color: 'var(--text-soft)' }}>{timeAgo(post.date)}</p>
        </div>
        {!isMe && (
          <motion.button whileTap={{ scale: 0.88 }} onClick={() => onAddFriend(post.userId)}
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: isAdded ? 'linear-gradient(135deg,#C0FFE8,#C0F0FF)' : 'linear-gradient(135deg,#F0E8FF,#E8F0FF)', border: isAdded ? '1.5px solid #78E8C8' : '1.5px solid #D8D0FF' }}>
            {isAdded ? <Check size={14} style={{ color: '#00A090' }} /> : <UserPlus size={14} style={{ color: '#B090FF' }} />}
          </motion.button>
        )}
      </div>

      {/* Photo with vertical accent line */}
      <div className="flex pl-4 pr-4 pb-1">
        <div className="w-0.5 rounded-full mr-3 flex-shrink-0 self-stretch"
          style={{ background: `linear-gradient(to bottom,${post.userAvatarColor},transparent)` }} />
        <div className="flex-1">
          {post.photoUrl
            ? <img src={post.photoUrl} alt="check-in" className="w-full aspect-[4/3] object-cover rounded-2xl" />
            : <GradientPhoto colors={post.gradientColors} emoji={post.placeEmoji} place={post.placeName} />
          }
        </div>
      </div>

      {/* Like + place */}
      <div className="flex items-center gap-2 px-5 pb-4 pt-3">
        <motion.button whileTap={{ scale: 0.75 }} onClick={() => onLike(post.id)} className="flex items-center gap-1.5">
          <motion.div animate={isLiked ? { scale: [1, 1.4, 1] } : { scale: 1 }} transition={{ duration: 0.3 }}>
            <Heart size={20} strokeWidth={2}
              style={{ color: isLiked ? '#FF90B5' : 'var(--text-soft)', fill: isLiked ? '#FF90B5' : 'none', transition: 'all 0.2s' }} />
          </motion.div>
          <span className="text-sm font-semibold" style={{ color: isLiked ? '#FF90B5' : 'var(--text-soft)' }}>{post.likes}</span>
        </motion.button>
        <div className="flex items-center gap-1 ml-auto">
          <MapPin size={12} style={{ color: 'var(--text-soft)' }} />
          <span className="text-xs truncate max-w-[140px]" style={{ color: 'var(--text-soft)' }}>{post.placeName}</span>
        </div>
      </div>
    </motion.div>
  );
}

export function ForYouPage() {
  const { user, feedPosts, likePost, addFriend } = useAuth();
  const { t } = useApp();
  const [addedUsers, setAddedUsers] = useState<Set<string>>(new Set());
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick(n => n + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  const handleAddFriend = (userId: string) => {
    if (addedUsers.has(userId)) return;
    setAddedUsers(prev => new Set([...prev, userId]));
    addFriend(userId);
  };

  return (
    <div className="flex flex-col min-h-screen pb-28" style={{ background: 'var(--rainbow-bg)' }}>

      {/* Sticky header — truly fixed to top, doesn't scroll */}
      <div className="sticky top-0 z-20 px-4 pt-6 pb-3 flex items-center justify-between"
        style={{ background: 'var(--bg-card)', backdropFilter: 'blur(16px)', borderBottom: '1.5px solid var(--border)' }}>
        <div>
          <h1 className="text-2xl font-black" style={{ color: 'var(--text-primary)' }}>{t.forYouTitle}</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--text-soft)' }}>{t.explorers}</p>
        </div>
        <div className="flex gap-1">
          {['#FF90B5','#B090FF','#7AC8FF','#78E8C8'].map(c => (
            <div key={c} className="w-2 h-2 rounded-full animate-bounce-subtle" style={{ background: c }} />
          ))}
        </div>
      </div>

      {/* Feed */}
      <div className="px-4 pt-4 space-y-4 flex-1">
        <AnimatePresence>
          {feedPosts.map((post, i) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 28 }}>
              <PostCard post={post} onLike={likePost} onAddFriend={handleAddFriend}
                isAdded={addedUsers.has(post.userId)} isMe={post.userId === user?.id} />
            </motion.div>
          ))}
        </AnimatePresence>
        <div className="text-center py-8">
          <p className="text-3xl mb-2">📸</p>
          <p className="text-sm" style={{ color: 'var(--text-soft)' }}>Check in at a sight, take a photo & upload to appear here!</p>
        </div>
      </div>
    </div>
  );
}
