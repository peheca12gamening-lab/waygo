import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, UserPlus, MapPin, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { getFeed } from '../lib/db';
import { SkeletonCard } from '../components/shared/Skeleton';
import type { FeedPost } from '../types';

function timeAgo(date: string, t: any): string {
  const diff = (Date.now() - new Date(date).getTime()) / 60000;
  if (diff < 1) return t.justNow;
  if (diff < 60) return `${Math.round(diff)} ${t.minutesAgo}`;
  if (diff < 1440) return `${Math.round(diff / 60)} ${t.hoursAgo}`;
  return `${Math.round(diff / 1440)} ${t.daysAgo}`;
}

function GradientPhoto({ emoji, place }: { emoji: string; place: string }) {
  return (
    <div className="w-full aspect-[4/3] rounded-2xl flex flex-col items-center justify-center gap-3 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg,#E8D8FF,#D8E8FF)' }}>
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: 'repeating-linear-gradient(0deg,transparent,transparent 28px,rgba(100,80,200,0.3) 28px,rgba(100,80,200,0.3) 29px),repeating-linear-gradient(90deg,transparent,transparent 40px,rgba(100,80,200,0.2) 40px,rgba(100,80,200,0.2) 41px)',
      }} />
      <span className="text-5xl drop-shadow-lg relative z-10">{emoji}</span>
      <p className="text-xs font-semibold text-center px-4 relative z-10" style={{ color: 'rgba(60,40,100,0.75)' }}>📍 {place}</p>
    </div>
  );
}

function PostCard({ post, onLike, onAddFriend, isAdded, isMe, t }: {
  post: FeedPost; onLike: (id: string) => void;
  onAddFriend: (userId: string) => void;
  isAdded: boolean; isMe: boolean; t: any;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl overflow-hidden"
      style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)', boxShadow: '0 2px 16px var(--shadow)' }}>

      <div className="flex items-center gap-3 px-4 pt-4 pb-3">
        <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 flex items-center justify-center font-bold text-white text-base"
          style={{ background: post.avatar_url ? 'transparent' : '#B090FF', border: '2.5px solid #B090FF' }}>
          {post.avatar_url
            ? <img src={post.avatar_url} alt="" className="w-full h-full object-contain" />
            : <span style={{ color: 'white', fontWeight: 700 }}>{post.user_name.charAt(0)}</span>
          }
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{post.user_name}</p>
          <p className="text-xs" style={{ color: 'var(--text-soft)' }}>{timeAgo(post.created_at, t)}</p>
        </div>
        {!isMe && (
          <motion.button whileTap={{ scale: 0.88 }} onClick={() => onAddFriend(post.user_id)}
            className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: isAdded ? 'linear-gradient(135deg,#C0FFE8,#C0F0FF)' : 'linear-gradient(135deg,#F0E8FF,#E8F0FF)', border: isAdded ? '1.5px solid #78E8C8' : '1.5px solid #D8D0FF' }}>
            {isAdded ? <Check size={14} style={{ color: '#00A090' }} /> : <UserPlus size={14} style={{ color: '#B090FF' }} />}
          </motion.button>
        )}
      </div>

      <div className="flex pl-4 pr-4 pb-1">
        <div className="w-0.5 rounded-full mr-3 flex-shrink-0 self-stretch"
          style={{ background: 'linear-gradient(to bottom,#B090FF,transparent)' }} />
        <div className="flex-1">
          {post.photo_url
            ? <img src={post.photo_url} alt="" className="w-full aspect-[4/3] object-cover rounded-2xl" />
            : <GradientPhoto emoji={post.category_emoji} place={post.business_name} />
          }
        </div>
      </div>

      <div className="flex items-center gap-2 px-5 pb-4 pt-3">
        <motion.button whileTap={{ scale: 0.75 }} onClick={() => onLike(post.id)} className="flex items-center gap-1.5">
          <Heart size={20} strokeWidth={2}
            style={{ color: 'var(--text-soft)', fill: 'none', transition: 'all 0.2s' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--text-soft)' }}>{post.likes_count}</span>
        </motion.button>
        <div className="flex items-center gap-1 ml-auto">
          <MapPin size={12} style={{ color: 'var(--text-soft)' }} />
          <span className="text-xs truncate max-w-[140px]" style={{ color: 'var(--text-soft)' }}>{post.business_name}</span>
        </div>
      </div>
    </motion.div>
  );
}

export function ForYouPage() {
  const { user, likePost } = useAuth();
  const { t } = useApp();
  const queryClient = useQueryClient();
  const [addedUsers, setAddedUsers] = useState<Set<string>>(new Set());
  const [, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick(n => n + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  const { data: feedPosts = [], isLoading } = useQuery({
    queryKey: ['feed'],
    queryFn: getFeed,
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 60,
  });

  const likeMutation = useMutation({
    mutationFn: likePost,
    onMutate: async (postId: string) => {
      await queryClient.cancelQueries({ queryKey: ['feed'] });
      const previous = queryClient.getQueryData<FeedPost[]>(['feed']);
      queryClient.setQueryData<FeedPost[]>(['feed'], old =>
        old?.map(p => p.id === postId ? { ...p, likes_count: p.likes_count + 1 } : p)
      );
      return { previous };
    },
    onError: (_err, _postId, context) => {
      queryClient.setQueryData(['feed'], context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['feed'] });
    },
  });

  const handleAddFriend = (userId: string) => {
    if (addedUsers.has(userId)) return;
    setAddedUsers(prev => new Set([...prev, userId]));
  };

  const handleLike = (postId: string) => {
    likeMutation.mutate(postId);
  };

  return (
    <div className="flex flex-col min-h-screen pb-28" style={{ background: 'var(--rainbow-bg)' }}>

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

      <div className="px-4 pt-4 space-y-4 flex-1">
        {isLoading ? (
          <div className="space-y-4">
            {[1,2,3].map(i => <SkeletonCard key={i} />)}
          </div>
        ) : (
        <AnimatePresence>
          {feedPosts.map((post, i) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 28 }}>
              <PostCard post={post} onLike={handleLike} onAddFriend={handleAddFriend}
                isAdded={addedUsers.has(post.user_id)} isMe={post.user_id === user?.id} t={t} />
            </motion.div>
          ))}
        </AnimatePresence>
        )}
        {!isLoading && feedPosts.length === 0 && (
          <div className="text-center py-8">
            <p className="text-3xl mb-2">📸</p>
            <p className="text-sm" style={{ color: 'var(--text-soft)' }}>{t.checkInSight}</p>
          </div>
        )}
      </div>
    </div>
  );
}
