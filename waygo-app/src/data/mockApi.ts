import type { User, PartnerBusiness, Quest, CheckIn, Voucher, ExploredTile } from '../types';
import { PARTNER_BUSINESSES, QUESTS, DEMO_USER, BADGES } from './seed';
import { generateVoucherCode } from '../utils/geo';

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function randomDelay(): Promise<void> {
  return delay(300 + Math.random() * 500);
}

export async function fetchBusinesses(): Promise<PartnerBusiness[]> {
  await randomDelay();
  return PARTNER_BUSINESSES.filter(b => b.is_approved && b.is_active);
}

export async function fetchBusinessById(id: string): Promise<PartnerBusiness | null> {
  await randomDelay();
  return PARTNER_BUSINESSES.find(b => b.id === id) || null;
}

export async function fetchQuests(): Promise<Quest[]> {
  await randomDelay();
  return QUESTS.filter(q => q.is_active);
}

export async function fetchQuestById(id: string): Promise<Quest | null> {
  await randomDelay();
  return QUESTS.find(q => q.id === id) || null;
}

export async function fetchUser(): Promise<User> {
  await randomDelay();
  return { ...DEMO_USER };
}

export async function updateUser(updates: Partial<User>): Promise<User> {
  await randomDelay();
  Object.assign(DEMO_USER, updates);
  return { ...DEMO_USER };
}

export async function createCheckIn(
  userId: string,
  businessId: string,
  questId: string | undefined,
  xpAwarded: number
): Promise<CheckIn> {
  await randomDelay();
  return {
    id: `checkin-${Date.now()}`,
    user_id: userId,
    business_id: businessId,
    quest_id: questId,
    validation_method: 'qr',
    gps_lat: 42.1420,
    gps_lng: 24.7490,
    distance_from_business: 50,
    xp_awarded: xpAwarded,
    created_date: new Date().toISOString(),
  };
}

export async function fetchExploredTiles(userId: string): Promise<ExploredTile[]> {
  await randomDelay();
  return [
    { id: 'tile-1', user_id: userId, center_lat: 42.1430, center_lng: 24.7490, radius_meters: 150, revealed_date: '2024-01-15' },
    { id: 'tile-2', user_id: userId, center_lat: 42.1420, center_lng: 24.7500, radius_meters: 150, revealed_date: '2024-01-16' },
    { id: 'tile-3', user_id: userId, center_lat: 42.1415, center_lng: 24.7480, radius_meters: 150, revealed_date: '2024-01-17' },
    { id: 'tile-4', user_id: userId, center_lat: 42.1440, center_lng: 24.7510, radius_meters: 150, revealed_date: '2024-01-18' },
    { id: 'tile-5', user_id: userId, center_lat: 42.1405, center_lng: 24.7465, radius_meters: 150, revealed_date: '2024-01-19' },
  ];
}

export async function addExploredTile(tile: Omit<ExploredTile, 'id'>): Promise<ExploredTile> {
  await randomDelay();
  return {
    ...tile,
    id: `tile-${Date.now()}`,
  };
}

export async function fetchVouchers(userId: string): Promise<Voucher[]> {
  await randomDelay();
  return [
    {
      id: 'voucher-1',
      user_id: userId,
      business_id: 'kapana-craft',
      discount_description: '20% off your next craft beer',
      code: generateVoucherCode(),
      is_redeemed: false,
      expires_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      created_date: new Date().toISOString(),
    },
    {
      id: 'voucher-2',
      user_id: userId,
      business_id: 'coffee-trail',
      discount_description: 'Free upgrade to large coffee',
      code: generateVoucherCode(),
      is_redeemed: false,
      expires_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      created_date: new Date().toISOString(),
    },
    {
      id: 'voucher-3',
      user_id: userId,
      business_id: 'old-town-bistro',
      discount_description: '10% off dinner',
      code: generateVoucherCode(),
      is_redeemed: true,
      redeemed_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      expires_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      created_date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
}

export async function redeemVoucher(voucherId: string): Promise<Voucher | null> {
  await randomDelay();
  return {
    id: voucherId,
    user_id: 'demo-user',
    business_id: 'kapana-craft',
    discount_description: '20% off your next craft beer',
    code: 'WAYGO2024',
    is_redeemed: true,
    redeemed_date: new Date().toISOString(),
    expires_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_date: new Date().toISOString(),
  };
}

export async function fetchLeaderboard(_period: 'week' | 'month' | 'all'): Promise<User[]> {
  await randomDelay();
  const users: User[] = [
    { ...DEMO_USER, name: 'Maria S.', level: 8, xp_total: 4200, streak_current: 14, checkins_total: 67, quests_completed: 8, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maria' },
    { ...DEMO_USER, name: 'Petar K.', level: 7, xp_total: 3600, streak_current: 10, checkins_total: 52, quests_completed: 6, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Petar' },
    { ...DEMO_USER, name: 'Elena V.', level: 6, xp_total: 2900, streak_current: 8, checkins_total: 41, quests_completed: 5, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elena' },
    { ...DEMO_USER, name: 'Alex Explorer', level: 5, xp_total: 2100, streak_current: 7, checkins_total: 23, quests_completed: 3, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
    { ...DEMO_USER, name: 'Nikolay D.', level: 4, xp_total: 1800, streak_current: 5, checkins_total: 18, quests_completed: 2, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nikolay' },
    { ...DEMO_USER, name: 'Ivana R.', level: 4, xp_total: 1500, streak_current: 4, checkins_total: 15, quests_completed: 2, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ivana' },
    { ...DEMO_USER, name: 'Stoyan M.', level: 3, xp_total: 1200, streak_current: 3, checkins_total: 12, quests_completed: 1, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Stoyan' },
    { ...DEMO_USER, name: 'Veronica B.', level: 3, xp_total: 900, streak_current: 2, checkins_total: 9, quests_completed: 1, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Veronica' },
  ];
  return users;
}

export async function fetchBadges(): Promise<typeof BADGES> {
  await randomDelay();
  return BADGES;
}