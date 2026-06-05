import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { auth as dbAuth, getProfile, updateProfile, getFeed, likePost as dbLikePost,
         upsertUserLocation, getFriends, getFriendRequests,
         sendFriendRequest as dbSendFriendRequest,
         acceptFriendRequest as dbAcceptFriendRequest,
         declineFriendRequest as dbDeclineFriendRequest,
          sendMessage as dbSendMessage,
          getMessages as dbGetMessages } from '../lib/db';
import type { Profile, FeedPost, VisitRecord, RedeemedReward, FriendRequest, Message } from '../types';
import { stringToColor } from '../lib/utils';

type UserProfile = Profile & {
  visitHistory: VisitRecord[];
  redeemedRewards: RedeemedReward[];
  friendRequests: FriendRequest[];
  badges: string[];
  friends: string[];
  explored_percentage: number;
  avatar: string;
  name: string;
  level: number;
  created_date: string;
  darkMode: boolean;
};

interface AuthContextType {
  user: UserProfile | null;
  isLoggedIn: boolean;
  feedPosts: FeedPost[];
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, avatar?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<Profile>) => Promise<void>;
  addVisit: (visit: Omit<VisitRecord, 'id' | 'likes' | 'uploadedToFeed'>) => string;
  addRedeemedReward: (reward: Omit<RedeemedReward, 'id'>) => void;
  addFriend: (friendId: string) => Promise<void>;
  sendFriendRequest: (toUserId: string, toUserName: string) => Promise<void>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  declineFriendRequest: (requestId: string) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
  uploadToFeed: (visitId: string) => Promise<void>;
  likePost: (postId: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  sendMessage: (receiverId: string, content: string, options?: { type?: string; imageData?: string }) => Promise<void>;
  getMessages: (otherUserId: string) => Promise<Message[]>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);

  const [visitHistory, setVisitHistory] = useState<VisitRecord[]>([]);
  const [redeemedRewards, setRedeemedRewards] = useState<RedeemedReward[]>([]);

  const isLoggedIn = !!profile;

  const buildUser = (p: Profile): UserProfile => ({
    ...p,
    visitHistory,
    redeemedRewards,
    friendRequests: [],
    badges: [] as string[],
    friends: [] as string[],
    explored_percentage: p.explored_pct,
    avatar: p.profile_image_url ?? '',
    name: p.full_name ?? p.username,
    level: p.current_level,
    created_date: p.created_at,
    darkMode: p.dark_mode,
  });

  const refreshProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setProfile(null); return; }
    const p = await getProfile(user.id);
    if (p) setProfile(buildUser(p));
  };

  useEffect(() => {
    let cancelled = false;
    // Hard ceiling — never block the UI for more than 5 seconds on startup.
    // If session restore or profile fetch hangs (slow network, stale token,
    // Supabase outage), we drop the loading state and show the AuthGate so the
    // user can still sign in or proceed offline.
    const failsafe = setTimeout(() => { if (!cancelled) setLoading(false); }, 5000);

    const withTimeout = <T,>(p: Promise<T>, ms: number): Promise<T | null> =>
      Promise.race([
        p,
        new Promise<null>(res => setTimeout(() => res(null), ms)),
      ]);

    (async () => {
      try {
        const sessionResult = await withTimeout(supabase.auth.getSession(), 4000);
        const session = sessionResult?.data?.session;
        if (session?.user && !cancelled) {
          const p = await withTimeout(getProfile(session.user.id), 4000);
          if (p && !cancelled) {
            setProfile(buildUser(p));
            // Friend loading is best-effort and never blocks the UI.
            loadAndSetFriends(session.user.id).catch(() => {});
          }
        }
      } catch {
        /* network error — fall through to AuthGate */
      } finally {
        if (!cancelled) {
          clearTimeout(failsafe);
          setLoading(false);
        }
      }
    })();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        try {
          const p = await withTimeout(getProfile(session.user.id), 4000);
          if (p) setProfile(buildUser(p));
        } catch { /* ignore */ }
      } else {
        setProfile(null);
        setVisitHistory([]);
        setRedeemedRewards([]);
      }
    });

    return () => {
      cancelled = true;
      clearTimeout(failsafe);
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    getFeed().then(setFeedPosts);
  }, []);

  const loadAndSetFriends = useCallback(async (userId: string) => {
    const [friendsData, requestsData] = await Promise.all([
      getFriends(userId),
      getFriendRequests(userId),
    ]);
    const friendIds = friendsData.map(f =>
      f.user_id === userId ? f.friend_id : f.user_id
    );
    const mappedRequests: FriendRequest[] = requestsData.map(r => ({
      id: r.id,
      fromUserId: r.user_id,
      fromUserName: r.user?.full_name ?? 'Unknown',
      fromUserAvatar: r.user?.profile_image_url ?? '',
      fromUserColor: stringToColor(r.user?.full_name ?? 'Unknown'),
      date: r.created_at,
      status: r.status as 'pending',
    }));
    setProfile(prev => prev ? {
      ...prev,
      friends: friendIds,
      friendRequests: mappedRequests,
    } : null);
  }, []);

  const withTimeout = <T,>(promise: Promise<T>, ms: number) =>
    Promise.race([
      promise,
      new Promise<never>((_, reject) => setTimeout(() => reject(new Error('Request timed out')), ms)),
    ]);

  const login = async (email: string, password: string) => {
    try {
      const result = await withTimeout(dbAuth.login(email, password), 10000);
      if (result.success) {
        const p = await withTimeout(getProfile(result.user!.id), 10000);
        if (p) {
          setProfile(buildUser(p));
          loadAndSetFriends(result.user!.id);
        }
      }
      return result;
    } catch {
      return { success: false as const, error: 'Connection timed out. Check your network or Supabase auth settings.' };
    }
  };

  const register = async (name: string, email: string, password: string, _avatar?: string) => {
    try {
      const username = name.toLowerCase().replace(/[^a-z0-9]/g, '') + Math.floor(Math.random() * 1000);
      const result = await withTimeout(dbAuth.register(email, password, name, username), 10000);
      if (result.success && result.user) {
        const p = await withTimeout(getProfile(result.user.id), 10000);
        if (p) {
          setProfile(buildUser(p));
          loadAndSetFriends(result.user.id);
        }
      }
      return result;
    } catch {
      return { success: false as const, error: 'Connection timed out. Check your network or Supabase auth settings.' };
    }
  };

  const logout = async () => {
    if (profile) {
      await upsertUserLocation(profile.id, 0, 0).catch(() => {});
    }
    await dbAuth.logout();
    setProfile(null);
    setVisitHistory([]);
    setRedeemedRewards([]);
  };

  const updateUserFn = async (updates: Partial<Profile>) => {
    if (!profile) return;
    const updated = await updateProfile(profile.id, updates);
    if (updated) setProfile(prev => prev ? { ...buildUser(updated), visitHistory: prev.visitHistory, redeemedRewards: prev.redeemedRewards, friendRequests: prev.friendRequests } : null);
  };

  const addVisit = (visit: Omit<VisitRecord, 'id' | 'likes' | 'uploadedToFeed'>): string => {
    const id = `visit-${Date.now()}`;
    const record: VisitRecord = { ...visit, id, likes: 0, uploadedToFeed: false };
    setVisitHistory(prev => [record, ...prev]);
    return id;
  };

  const uploadToFeed = async (visitId: string) => {
    setVisitHistory(prev => prev.map(v =>
      v.id === visitId ? { ...v, uploadedToFeed: true, pointsEarned: 50 } : v
    ));
  };

  const likePost = async (postId: string) => {
    if (!profile) return;
    await dbLikePost(postId, profile.id);
    setFeedPosts(prev => prev.map(p =>
      p.id === postId ? { ...p, likes_count: p.likes_count + 1 } : p
    ));
  };

  const addFriend = async (friendId: string) => {
    if (!profile) return;
    await dbSendFriendRequest(profile.id, friendId);
  };

  const sendFriendRequestFn = async (toUserId: string, _toUserName: string) => {
    if (!profile) return;
    await dbSendFriendRequest(profile.id, toUserId);
  };

  const acceptFriendRequestFn = async (requestId: string) => {
    await dbAcceptFriendRequest(requestId);
    if (profile) loadAndSetFriends(profile.id);
  };

  const declineFriendRequestFn = async (requestId: string) => {
    await dbDeclineFriendRequest(requestId);
    if (profile) loadAndSetFriends(profile.id);
  };

  const removeFriendFn = async (friendId: string) => {
    if (!profile) return;
    const { removeFriend } = await import('../lib/db/friends');
    await removeFriend(profile.id, friendId);
    if (profile) loadAndSetFriends(profile.id);
  };

  const addRedeemedReward = (reward: Omit<RedeemedReward, 'id'>) => {
    const record: RedeemedReward = { ...reward, id: `reward-${Date.now()}` };
    setRedeemedRewards(prev => [record, ...prev]);
  };

  const sendMessageFn = useCallback(async (receiverId: string, content: string, options?: { type?: string; imageData?: string }) => {
    if (!profile) return;
    await dbSendMessage(profile.id, receiverId, content, options?.type ? { type: options.type, imageData: options.imageData } : undefined);
  }, [profile]);

  const getMessagesFn = useCallback(async (otherUserId: string): Promise<Message[]> => {
    if (!profile) return [];
    return await dbGetMessages(profile.id, otherUserId);
  }, [profile]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: 'var(--bg-primary)' }}>
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: '#B090FF' }} />
          <p className="text-xs" style={{ color: 'var(--text-soft)' }}>Connecting…</p>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      user: profile,
      isLoggedIn,
      feedPosts,
      login,
      register,
      logout,
      updateUser: updateUserFn,
      addVisit,
      addRedeemedReward,
      addFriend,
      sendFriendRequest: sendFriendRequestFn,
      acceptFriendRequest: acceptFriendRequestFn,
      declineFriendRequest: declineFriendRequestFn,
      removeFriend: removeFriendFn,
      uploadToFeed,
      likePost,
      refreshProfile,
      sendMessage: sendMessageFn,
      getMessages: getMessagesFn,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
