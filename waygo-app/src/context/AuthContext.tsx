import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  xp_total: number;
  points: number;
  level: number;
  streak_current: number;
  streak_longest: number;
  checkins_total: number;
  quests_completed: number;
  explored_percentage: number;
  badges: string[];
  friends: string[];
  friendRequests: FriendRequest[];
  visitHistory: VisitRecord[];
  redeemedRewards: RedeemedReward[];
  is_visible_on_map: boolean;
  created_date: string;
  darkMode: boolean;
  language: string;
}

export interface VisitRecord {
  id: string;
  placeId: string;
  placeName: string;
  placeCategory: string;
  date: string;
  pointsEarned: number;
  photoUrl?: string;
  likes: number;
  uploadedToFeed: boolean;
}

export interface RedeemedReward {
  id: string;
  businessName: string;
  description: string;
  date: string;
  pointsSpent: number;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromUserName: string;
  fromUserAvatar: string;
  fromUserColor: string;
  date: string;
  status: 'pending' | 'accepted' | 'declined';
}

export interface FeedPost {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  userAvatarColor: string;
  placeName: string;
  placeEmoji: string;
  photoUrl: string | null;
  gradientColors: [string, string];
  likes: number;
  likedBy: string[];
  timeAgo: string;
  date: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoggedIn: boolean;
  feedPosts: FeedPost[];
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string, avatar?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (updates: Partial<AuthUser>) => void;
  addVisit: (visit: Omit<VisitRecord, 'id' | 'likes' | 'uploadedToFeed'>) => string;
  addRedeemedReward: (reward: Omit<RedeemedReward, 'id'>) => void;
  addFriend: (friendId: string) => void;
  sendFriendRequest: (toUserId: string, toUserName: string) => void;
  acceptFriendRequest: (requestId: string) => void;
  declineFriendRequest: (requestId: string) => void;
  uploadToFeed: (visitId: string) => void;
  likePost: (postId: string) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

const STORAGE_KEY = 'waygo_auth';
const USERS_KEY = 'waygo_users';
const FEED_KEY = 'waygo_feed';

function loadStoredUsers(): Record<string, { password: string; user: AuthUser }> {
  try { const s = localStorage.getItem(USERS_KEY); if (s) return JSON.parse(s); } catch {}
  return {};
}
function saveUsers(users: Record<string, { password: string; user: AuthUser }>) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}
function loadCurrentUser(): AuthUser | null {
  try { const s = localStorage.getItem(STORAGE_KEY); if (s) return JSON.parse(s); } catch {}
  return null;
}
function saveCurrentUser(user: AuthUser | null) {
  if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  else localStorage.removeItem(STORAGE_KEY);
}
function loadFeed(): FeedPost[] {
  try { const s = localStorage.getItem(FEED_KEY); if (s) return JSON.parse(s); } catch {}
  return DEMO_FEED_POSTS;
}
function saveFeed(posts: FeedPost[]) {
  localStorage.setItem(FEED_KEY, JSON.stringify(posts));
}

const DEMO_FEED_POSTS: FeedPost[] = [
  { id: 'demo1', userId: 'u1', userName: 'Maria S.', userAvatar: '', userAvatarColor: '#FF90B5', placeName: 'Regional History Museum', placeEmoji: '🏛️', photoUrl: null, gradientColors: ['#FFD0E0', '#E8C8FF'], likes: 24, likedBy: [], timeAgo: '2 m. ago', date: new Date(Date.now() - 2 * 60000).toISOString() },
  { id: 'demo2', userId: 'u2', userName: 'Petar K.', userAvatar: '/avatars/parrot-blue.png', userAvatarColor: '#7AC8FF', placeName: 'Ancient Theatre', placeEmoji: '🕌', photoUrl: null, gradientColors: ['#C8E8FF', '#C8FFE8'], likes: 11, likedBy: [], timeAgo: '7 m. ago', date: new Date(Date.now() - 7 * 60000).toISOString() },
  { id: 'demo3', userId: 'u3', userName: 'Elena V.', userAvatar: '', userAvatarColor: '#78E8C8', placeName: 'Kapana Creative District', placeEmoji: '🎨', photoUrl: null, gradientColors: ['#D0FFE8', '#C8F0FF'], likes: 37, likedBy: [], timeAgo: '15 m. ago', date: new Date(Date.now() - 15 * 60000).toISOString() },
  { id: 'demo4', userId: 'u4', userName: 'Nikolay D.', userAvatar: '/avatars/parrot-fire.png', userAvatarColor: '#FFB878', placeName: 'Džumaya Mosque', placeEmoji: '🕌', photoUrl: null, gradientColors: ['#FFE8C8', '#FFD0E0'], likes: 8, likedBy: [], timeAgo: '43 m. ago', date: new Date(Date.now() - 43 * 60000).toISOString() },
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(loadCurrentUser);
  const [feedPosts, setFeedPosts] = useState<FeedPost[]>(loadFeed);

  // Apply dark mode class
  useEffect(() => {
    if (user?.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [user?.darkMode]);

  const syncUser = (updated: AuthUser) => {
    setUser(updated);
    saveCurrentUser(updated);
    const users = loadStoredUsers();
    if (users[updated.email]) { users[updated.email].user = updated; saveUsers(users); }
  };

  const login = async (email: string, password: string) => {
    const users = loadStoredUsers();
    const record = users[email.toLowerCase()];
    if (!record) return { success: false, error: 'No account found with this email.' };
    if (record.password !== password) return { success: false, error: 'Incorrect password.' };
    syncUser(record.user);
    return { success: true };
  };

  const register = async (name: string, email: string, password: string, avatar?: string) => {
    const users = loadStoredUsers();
    const key = email.toLowerCase();
    if (users[key]) return { success: false, error: 'An account with this email already exists.' };
    const newUser: AuthUser = {
      id: `user-${Date.now()}`,
      name, email: key,
      avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
      xp_total: 0, points: 0, level: 1,
      streak_current: 0, streak_longest: 0,
      checkins_total: 0, quests_completed: 0, explored_percentage: 0,
      badges: [], friends: [], friendRequests: [],
      visitHistory: [], redeemedRewards: [],
      is_visible_on_map: true,
      created_date: new Date().toISOString(),
      darkMode: false, language: 'en',
    };
    users[key] = { password, user: newUser };
    saveUsers(users);
    syncUser(newUser);
    return { success: true };
  };

  const logout = () => { setUser(null); saveCurrentUser(null); };

  const updateUser = (updates: Partial<AuthUser>) => {
    if (!user) return;
    syncUser({ ...user, ...updates });
  };

  const addVisit = (visit: Omit<VisitRecord, 'id' | 'likes' | 'uploadedToFeed'>): string => {
    if (!user) return '';
    const id = `visit-${Date.now()}`;
    const record: VisitRecord = { ...visit, id, likes: 0, uploadedToFeed: false };
    syncUser({
      ...user,
      visitHistory: [record, ...user.visitHistory],
      checkins_total: user.checkins_total + 1,
      // Points only added AFTER uploading to feed (for sights)
      xp_total: user.xp_total + 10,
    });
    return id;
  };

  const uploadToFeed = (visitId: string) => {
    if (!user) return;
    const visit = user.visitHistory.find(v => v.id === visitId);
    if (!visit || visit.uploadedToFeed) return;

    const isSight = visit.placeCategory === 'museum' || visit.placeCategory === 'cultural';
    const pointsEarned = isSight ? 50 : 0;

    // Create feed post
    const post: FeedPost = {
      id: `post-${Date.now()}`,
      userId: user.id,
      userName: user.name,
      userAvatar: user.avatar,
      userAvatarColor: '#B090FF',
      placeName: visit.placeName,
      placeEmoji: visit.placeCategory === 'museum' || visit.placeCategory === 'cultural' ? '🏛️' : '☕',
      photoUrl: visit.photoUrl || null,
      gradientColors: ['#E8D8FF', '#D8E8FF'],
      likes: 0,
      likedBy: [],
      timeAgo: 'Just now',
      date: new Date().toISOString(),
    };

    const updatedFeed = [post, ...feedPosts];
    setFeedPosts(updatedFeed);
    saveFeed(updatedFeed);

    // Mark visit as uploaded + award points
    const updatedHistory = user.visitHistory.map(v =>
      v.id === visitId ? { ...v, uploadedToFeed: true, pointsEarned } : v
    );
    syncUser({
      ...user,
      visitHistory: updatedHistory,
      points: user.points + pointsEarned,
      xp_total: user.xp_total + pointsEarned * 2,
    });
  };

  const likePost = (postId: string) => {
    if (!user) return;
    const updated = feedPosts.map(p => {
      if (p.id !== postId) return p;
      const alreadyLiked = p.likedBy.includes(user.id);
      return {
        ...p,
        likes: alreadyLiked ? p.likes - 1 : p.likes + 1,
        likedBy: alreadyLiked ? p.likedBy.filter(id => id !== user.id) : [...p.likedBy, user.id],
      };
    });
    setFeedPosts(updated);
    saveFeed(updated);
  };

  const addFriend = (friendId: string) => {
    if (!user || user.friends.includes(friendId)) return;
    updateUser({ friends: [...user.friends, friendId] });
  };

  const sendFriendRequest = (_toUserId: string, toUserName: string) => {
    // In a real app this would write to the other user's record
    // For demo purposes we just track it locally
    console.log('Friend request sent to', toUserName);
  };

  const acceptFriendRequest = (requestId: string) => {
    if (!user) return;
    const req = user.friendRequests.find(r => r.id === requestId);
    if (!req) return;
    const updated = {
      ...user,
      friends: [...user.friends, req.fromUserId],
      friendRequests: user.friendRequests.map(r => r.id === requestId ? { ...r, status: 'accepted' as const } : r),
    };
    syncUser(updated);
  };

  const declineFriendRequest = (requestId: string) => {
    if (!user) return;
    updateUser({
      friendRequests: user.friendRequests.map(r => r.id === requestId ? { ...r, status: 'declined' as const } : r),
    });
  };

  const addRedeemedReward = (reward: Omit<RedeemedReward, 'id'>) => {
    if (!user) return;
    const record: RedeemedReward = { ...reward, id: `reward-${Date.now()}` };
    syncUser({ ...user, redeemedRewards: [record, ...user.redeemedRewards], points: Math.max(0, user.points - reward.pointsSpent) });
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, feedPosts, login, register, logout, updateUser, addVisit, addRedeemedReward, addFriend, sendFriendRequest, acceptFriendRequest, declineFriendRequest, uploadToFeed, likePost }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
