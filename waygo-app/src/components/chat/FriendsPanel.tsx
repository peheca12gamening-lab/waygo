import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { X, Check, ChevronRight, UserPlus, MessageCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getFriends, getOnlineUsers, getConversations, getUnreadCount, subscribeToMessages } from '../../lib/db';
import { stringToColor } from '../../lib/utils';
import { ChatPanel } from './ChatPanel';
import type { ChatFriend } from './ChatPanel';

// ── Helpers ──────────────────────────────────────────────────────────────────
function relativeTime(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  const diffM = Math.floor((Date.now() - d.getTime()) / 60000);
  if (diffM < 1)  return 'just now';
  if (diffM < 60) return `${diffM}m`;
  const diffH = Math.floor(diffM / 60);
  if (diffH < 24) return `${diffH}h`;
  const diffD = Math.floor(diffH / 24);
  if (diffD < 7)  return `${diffD}d`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

// ── FriendsPanel ─────────────────────────────────────────────────────────────
interface FriendsPanelProps {
  onClose: () => void;
}

interface FriendItem extends ChatFriend {
  level: number;
  points: number;
  checkins: number;
}

interface ConvPreview {
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export function FriendsPanel({ onClose }: FriendsPanelProps) {
  const { user, acceptFriendRequest, declineFriendRequest } = useAuth();
  const [chatWith, setChatWith]     = useState<ChatFriend | null>(null);
  const [totalUnread, setTotalUnread] = useState(0);
  const [convPreviews, setConvPreviews] = useState<Map<string, ConvPreview>>(new Map());

  // ── Friends list from Supabase ─────────────────────────────────────────────
  const { data: friendsList = [] } = useQuery<FriendItem[]>({
    queryKey: ['friends', user?.id],
    queryFn: async () => {
      const [friendsData, onlineUsers] = await Promise.all([
        getFriends(user!.id),
        getOnlineUsers().catch(() => []),
      ]);
      const onlineIds = new Set(onlineUsers.map(u => u.user_id));
      return friendsData.map(f => {
        const isMe = f.friend_id === user!.id;
        const profile = isMe ? f.user_profile! : f.friend!;
        return {
          id: profile.id,
          name: profile.full_name ?? 'Explorer',
          color: stringToColor(profile.full_name ?? 'Explorer'),
          avatar: profile.profile_image_url ?? '',
          isOnline: onlineIds.has(profile.id),
          level: profile.current_level,
          points: profile.points,
          checkins: profile.checkins_total,
        };
      });
    },
    enabled: !!user,
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 30,
  });

  // ── Conversation previews ─────────────────────────────────────────────────
  const loadPreviews = useCallback(async () => {
    if (!user) return;
    const [convs, unread] = await Promise.all([
      getConversations(user.id).catch(() => []),
      getUnreadCount(user.id).catch(() => 0),
    ]);
    setTotalUnread(unread);
    const map = new Map<string, ConvPreview>();
    for (const c of convs) {
      map.set(c.userId, {
        lastMessage: c.lastMessage,
        lastMessageAt: c.lastMessageTime,
        unreadCount: c.unreadCount,
      });
    }
    setConvPreviews(map);
  }, [user]);

  useEffect(() => {
    loadPreviews();
  }, [loadPreviews]);

  // Re-fetch previews when a new message arrives
  useEffect(() => {
    if (!user) return;
    const sub = subscribeToMessages(user.id, () => {
      loadPreviews();
    }, `friends-panel-${user.id}`);
    return () => { sub.unsubscribe(); };
  }, [user, loadPreviews]);

  const requests = user?.friendRequests?.filter(r => r.status === 'pending') ?? [];

  // Sort: online + unread first, then by last message
  const sortedFriends = useMemo(() => {
    return [...friendsList].sort((a, b) => {
      const pa = convPreviews.get(a.id);
      const pb = convPreviews.get(b.id);
      if (a.isOnline !== b.isOnline) return a.isOnline ? -1 : 1;
      const ua = pa?.unreadCount ?? 0;
      const ub = pb?.unreadCount ?? 0;
      if (ua !== ub) return ub - ua;
      const ta = pa?.lastMessageAt ?? '';
      const tb = pb?.lastMessageAt ?? '';
      return tb.localeCompare(ta);
    });
  }, [friendsList, convPreviews]);

  if (!user) return null;

  return (
    <>
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', stiffness: 350, damping: 32 }}
        className="fixed inset-0 z-50 flex flex-col overflow-hidden"
        style={{ background: 'var(--rainbow-bg)', maxWidth: 430, margin: '0 auto' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-6 pb-4 flex-shrink-0"
          style={{ background: 'var(--bg-card)', backdropFilter: 'blur(16px)', borderBottom: '1.5px solid var(--border)' }}>
          <h2 className="text-xl font-black flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            Friends
            {totalUnread > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-black text-white"
                style={{ background: 'linear-gradient(135deg,#FF90B5,#B090FF)' }}>
                {totalUnread}
              </span>
            )}
          </h2>
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{ background: '#EAEAF8', border: '1.5px solid #E0E0F0' }}>
            <X size={18} style={{ color: '#9090C0' }} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 pb-10 space-y-4" style={{ minHeight: 0 }}>

          {/* Friend requests */}
          {requests.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider mb-2"
                style={{ color: 'var(--text-soft)' }}>
                Friend Requests ({requests.length})
              </p>
              <div className="space-y-2">
                {requests.map(req => (
                  <div key={req.id} className="flex items-center gap-3 p-3 rounded-2xl"
                    style={{ background: 'var(--bg-card)', border: '1.5px solid var(--border)' }}>
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                      style={{ background: req.fromUserColor }}>
                      {req.fromUserName.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary)' }}>{req.fromUserName}</p>
                      <p className="text-xs" style={{ color: 'var(--text-soft)' }}>Wants to be your friend</p>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => acceptFriendRequest(req.id)}
                        className="w-9 h-9 rounded-full flex items-center justify-center"
                        style={{ background: '#E8FFF5', border: '1.5px solid #78E8C8' }}>
                        <Check size={16} style={{ color: '#00A090' }} />
                      </button>
                      <button onClick={() => declineFriendRequest(req.id)}
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

          {/* Friends list */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-2"
              style={{ color: 'var(--text-soft)' }}>
              My Friends ({sortedFriends.length})
            </p>

            {sortedFriends.length === 0 && (
              <div className="text-center py-10">
                <UserPlus size={40} className="mx-auto mb-3" style={{ color: 'var(--text-soft)' }} />
                <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>No friends yet</p>
                <p className="text-xs mt-1" style={{ color: 'var(--text-soft)' }}>Search for people to add from the map!</p>
              </div>
            )}

            <div className="space-y-2">
              {sortedFriends.map(friend => {
                const preview = convPreviews.get(friend.id);
                const unread  = preview?.unreadCount ?? 0;

                return (
                  <motion.button
                    key={friend.id}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setChatWith(friend)}
                    className="w-full flex items-center gap-3 p-3 rounded-2xl text-left"
                    style={{
                      background: unread > 0 ? 'rgba(176,144,255,0.07)' : 'var(--bg-card)',
                      border: `1.5px solid ${unread > 0 ? '#D8C8FF' : 'var(--border)'}`,
                    }}
                  >
                    {/* Avatar + online dot */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center text-white font-bold text-lg"
                        style={{ background: friend.color }}>
                        {friend.avatar
                          ? <img src={friend.avatar} className="w-full h-full object-cover" alt="" />
                          : friend.name.charAt(0).toUpperCase()}
                      </div>
                      {friend.isOnline && (
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white"
                          style={{ background: '#4ADE80' }} />
                      )}
                    </div>

                    {/* Name + preview */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm truncate"
                          style={{ color: unread > 0 ? '#B090FF' : 'var(--text-primary)' }}>
                          {friend.name}
                        </p>
                        {friend.isOnline && (
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0"
                            style={{ background: 'rgba(74,222,128,0.15)', color: '#16a34a' }}>
                            Online
                          </span>
                        )}
                      </div>
                      {preview?.lastMessage ? (
                        <p className="text-xs truncate mt-0.5"
                          style={{
                            color: unread > 0 ? 'var(--text-primary)' : 'var(--text-soft)',
                            fontWeight: unread > 0 ? 600 : 400,
                          }}>
                          {preview.lastMessage}
                        </p>
                      ) : (
                        <p className="text-xs mt-0.5 flex items-center gap-1" style={{ color: 'var(--text-soft)' }}>
                          <MessageCircle size={11} /> Tap to chat
                        </p>
                      )}
                    </div>

                    {/* Time + badge */}
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      {preview?.lastMessageAt && (
                        <span className="text-[10px]" style={{ color: 'var(--text-soft)' }}>
                          {relativeTime(preview.lastMessageAt)}
                        </span>
                      )}
                      {unread > 0 ? (
                        <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white"
                          style={{ background: 'linear-gradient(135deg,#FF90B5,#B090FF)' }}>
                          {unread > 9 ? '9+' : unread}
                        </span>
                      ) : (
                        <ChevronRight size={16} style={{ color: 'var(--text-soft)' }} />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Chat thread */}
      <AnimatePresence>
        {chatWith && (
          <ChatPanel
            key={chatWith.id}
            currentUserId={user.id}
            friend={chatWith}
            onClose={() => { setChatWith(null); loadPreviews(); }}
          />
        )}
      </AnimatePresence>
    </>
  );
}
