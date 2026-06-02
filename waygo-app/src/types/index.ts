export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  xp_total: number;
  level: number;
  streak_current: number;
  streak_longest: number;
  is_visible_on_map: boolean;
  last_location_lat?: number;
  last_location_lng?: number;
  last_active: string;
  created_date: string;
  badges: string[];
  checkins_total: number;
  quests_completed: number;
  explored_percentage: number;
}

export interface PartnerBusiness {
  id: string;
  name: string;
  description: string;
  category: 'cafe' | 'museum' | 'bar' | 'shop' | 'cultural';
  address: string;
  lat: number;
  lng: number;
  geofence_radius_meters: number;
  checkin_code: string;
  subscription_tier: 'free' | 'basic' | 'featured';
  is_approved: boolean;
  is_active: boolean;
  owner_user_id: string;
  total_checkins: number;
  created_date: string;
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  category: 'coffee' | 'history' | 'exploration' | 'culture';
  difficulty: 'easy' | 'medium' | 'hard';
  xp_reward: number;
  waypoint_business_ids: string[];
  required_checkins_count: number;
  is_active: boolean;
  created_date: string;
}

export interface CheckIn {
  id: string;
  user_id: string;
  business_id: string;
  quest_id?: string;
  validation_method: 'qr' | 'staff_code' | 'gps_only';
  gps_lat: number;
  gps_lng: number;
  distance_from_business: number;
  xp_awarded: number;
  created_date: string;
}

export interface Voucher {
  id: string;
  user_id: string;
  business_id: string;
  quest_id?: string;
  discount_description: string;
  code: string;
  is_redeemed: boolean;
  redeemed_date?: string;
  expires_date: string;
  created_date: string;
}

export interface ExploredTile {
  id: string;
  user_id: string;
  center_lat: number;
  center_lng: number;
  radius_meters: number;
  revealed_date: string;
}

export interface ValidationResult {
  valid: boolean;
  reason?: string;
  xp?: number;
  bonus_xp?: number;
}

export type CategoryFilter = 'all' | 'cafe' | 'museum' | 'cultural' | 'featured';

export type BottomSheetState = 'closed' | 'compact' | 'expanded';