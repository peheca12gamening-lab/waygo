// ── WayGo API client ─────────────────────────────────────────
// Смени BASE_URL ако използваш ngrok

const BASE_URL = 'http://localhost:3001/api';

function getToken(): string | null {
  return localStorage.getItem('waygo_token');
}

function setToken(token: string) {
  localStorage.setItem('waygo_token', token);
}

function clearToken() {
  localStorage.removeItem('waygo_token');
}

async function request<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const res = await fetch(BASE_URL + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }

  return data;
}

// ── AUTH ──────────────────────────────────────────────────────
export const apiRegister = async (payload: {
  name: string;
  email: string;
  password: string;
  avatar_url?: string;
}) => {
  const data = await request<{ token: string; user: any }>('/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  setToken(data.token);
  return data;
};

export const apiLogin = async (payload: { email: string; password: string }) => {
  const data = await request<{ token: string; user: any }>('/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  setToken(data.token);
  return data;
};

export const apiLogout = () => {
  clearToken();
};

// ── PROFILE ───────────────────────────────────────────────────
export const apiGetProfile = () => request('/profile');

export const apiUpdateProfile = (payload: {
  avatar_url?: string;
  dark_mode?: boolean;
  language?: string;
  email?: string;
}) =>
  request('/profile', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

// ── BUSINESSES / MAP ──────────────────────────────────────────
export const apiGetBusinesses = () => request('/businesses');

// ── CHECK-INS ─────────────────────────────────────────────────
export const apiCheckin = (payload: {
  business_id: string;
  photo_url?: string;
  upload_to_feed?: boolean;
}) =>
  request('/checkin', {
    method: 'POST',
    body: JSON.stringify(payload),
  });

export const apiGetCheckins = () => request('/checkins');

// ── FEED ──────────────────────────────────────────────────────
export const apiGetFeed = () => request('/feed');

export const apiLikePost = (postId: string) =>
  request(`/feed/${postId}/like`, { method: 'POST' });

// ── LEADERBOARD ───────────────────────────────────────────────
export const apiGetLeaderboard = (period: 'all' | 'week' | 'month') =>
  request(`/leaderboard/${period}`);

// ── FRIENDS ───────────────────────────────────────────────────
export const apiGetFriends = () => request('/friends');

export const apiGetFriendRequests = () => request('/friends/requests');

export const apiSendFriendRequest = (friend_id: string) =>
  request('/friends/request', {
    method: 'POST',
    body: JSON.stringify({ friend_id }),
  });

export const apiAcceptFriendRequest = (friendshipId: string) =>
  request(`/friends/${friendshipId}/accept`, { method: 'PATCH' });

export const apiDeclineFriendRequest = (friendshipId: string) =>
  request(`/friends/${friendshipId}/decline`, { method: 'PATCH' });

// ── BADGES ────────────────────────────────────────────────────
export const apiGetBadges = () => request('/badges');

// ── QUESTS ────────────────────────────────────────────────────
export const apiGetQuests = () => request('/quests');

export const apiAcceptQuest = (questId: string) =>
  request(`/quests/${questId}/accept`, { method: 'POST' });

// ── VOUCHERS ──────────────────────────────────────────────────
export const apiGetVouchers = () => request('/vouchers');

export const apiRedeemVoucher = (voucherId: string) =>
  request(`/vouchers/${voucherId}/redeem`, { method: 'PATCH' });

// ── NOTIFICATIONS ─────────────────────────────────────────────
export const apiGetNotifications = () => request('/notifications');

export const apiMarkNotificationsRead = () =>
  request('/notifications/read', { method: 'PATCH' });

// ── HEALTH CHECK ──────────────────────────────────────────────
export const apiHealthCheck = () => request('/health');