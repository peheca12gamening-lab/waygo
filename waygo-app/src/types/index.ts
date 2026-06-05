export interface PartnerBusiness {
  id: string;
  name: string;
  lat: number;
  lng: number;
  category?: string | null;
  address?: string | null;
  geofence_radius?: number;
  checkin_code?: string;
  description: string | null;
  subscription_tier: 'free' | 'basic' | 'featured';
  total_checkins: number;
  avg_rating: number;
  cover_image_url: string | null;
}

export interface User {
  id: string;
  avatar: string;
  name: string;
  level: number;
}

export interface Profile {
  id: string;
  username: string;
  email: string;
  full_name: string | null;
  bio: string | null;
  profile_image_url: string | null;
  role: 'user' | 'admin' | 'moderator' | 'business';
  points: number;
  xp_total: number;
  current_level: number;
  streak_current: number;
  streak_longest: number;
  streak_last_date: string | null;
  checkins_total: number;
  quests_completed: number;
  explored_pct: number;
  is_visible_on_map: boolean;
  dark_mode: boolean;
  language: string;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: number;
  slug: string;
  label_en: string;
  label_bg: string | null;
  emoji: string;
  color_hex: string;
  is_sight: boolean;
}

export interface Business {
  id: string;
  name: string;
  description: string | null;
  category_slug: string;
  category_emoji: string;
  category_color: string;
  lng: number;
  lat: number;
  distance_m: number;
  subscription_tier: 'free' | 'basic' | 'featured';
  total_checkins: number;
  avg_rating: number;
  is_sight: boolean;
  cover_image_url: string | null;
}

export interface NearbyBusiness {
  id: string;
  name: string;
  description: string | null;
  category_slug: string;
  category_emoji: string;
  category_color: string;
  lng: number;
  lat: number;
  distance_m: number;
  subscription_tier: 'free' | 'basic' | 'featured';
  total_checkins: number;
  avg_rating: number;
  is_sight: boolean;
  cover_image_url: string | null;
}

export interface BusinessDetail {
  id: string;
  owner_id: string | null;
  category_id: number;
  name: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  website: string | null;
  cover_image_url: string | null;
  checkin_code: string;
  geofence_radius: number;
  subscription_tier: 'free' | 'basic' | 'featured';
  total_checkins: number;
  avg_rating: number;
  is_active: boolean;
  is_approved: boolean;
  categories: Category & { slug: string; label_en: string; emoji: string; color_hex: string; is_sight: boolean };
  business_hours: BusinessHour[];
  business_photos: BusinessPhoto[];
  created_at: string;
  updated_at: string;
}

export interface BusinessHour {
  id: string;
  business_id: string;
  day_of_week: number;
  opens_at: string | null;
  closes_at: string | null;
  is_closed: boolean;
}

export interface BusinessPhoto {
  id: string;
  business_id: string;
  url: string;
  sort_order: number;
}

export interface CheckIn {
  id: string;
  user_id: string;
  business_id: string;
  photo_url: string | null;
  points_earned: number;
  xp_awarded: number;
  quest_id: string | null;
  validation_method: 'qr' | 'staff_code' | 'gps';
  gps_lat: number | null;
  gps_lng: number | null;
  distance_meters: number | null;
  uploaded_to_feed: boolean;
  created_at: string;
}

export interface FeedPost {
  id: string;
  photo_url: string | null;
  caption: string | null;
  likes_count: number;
  created_at: string;
  user_id: string;
  user_name: string;
  avatar_url: string | null;
  business_id: string;
  business_name: string;
  category_emoji: string;
  category_slug: string;
}

export interface Badge {
  id: string;
  name: string;
  name_bg: string | null;
  description: string | null;
  description_bg: string | null;
  icon: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Legendary';
  category: string | null;
  max_value: number;
  unit: string | null;
  xp_reward: number;
}

export interface UserBadge {
  user_id: string;
  badge_id: string;
  earned_at: string;
}

export interface QuestRequirement {
  type: 'checkin' | 'visit' | 'streak' | 'friends' | 'quests_completed';
  target?: string[];
  count?: number;
  description: string;
}

export interface Quest {
  id: string;
  title: string;
  title_bg: string | null;
  description: string | null;
  description_bg: string | null;
  category: string | null;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Legendary';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  xp_reward: number;
  stops_count: number;
  requirements: QuestRequirement[];
  icon: string;
  unlocks_at_level: number;
  is_active: boolean;
  created_at: string;
}

export interface QuestStop {
  id: string;
  quest_id: string;
  business_id: string;
  sort_order: number;
  businesses?: { id: string; name: string; lat: number; lng: number };
}

export interface UserQuest {
  id: string;
  user_id: string;
  quest_id: string;
  status: 'active' | 'completed' | 'abandoned';
  progress: number;
  started_at: string;
  completed_at: string | null;
}

export interface Voucher {
  id: string;
  user_id: string;
  voucher_id: string;
  is_redeemed: boolean;
  redeemed_at: string | null;
  issued_at: string;
  expires_at: string | null;
  vouchers?: {
    id: string;
    discount_description: string;
    discount_pct: number | null;
    code: string;
    points_required: number;
    businesses?: { id: string; name: string };
  };
}

export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  friend?: {
    id: string;
    full_name: string;
    profile_image_url: string | null;
    current_level: number;
    points: number;
    checkins_total: number;
  };
  user_profile?: {
    id: string;
    full_name: string;
    profile_image_url: string | null;
    current_level: number;
    points: number;
    checkins_total: number;
  };
  user?: {
    id: string;
    full_name: string;
    profile_image_url: string | null;
  };
}

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string | null;
  body: string | null;
  reference_id: string | null;
  is_read: boolean;
  created_at: string;
}

export interface ExploredTile {
  id: string;
  user_id: string;
  center_lat: number;
  center_lng: number;
  radius_meters: number;
  revealed_date: string;
}

export interface UserLocation {
  user_id: string;
  full_name: string;
  profile_image_url: string | null;
  lat: number;
  lng: number;
  heading: number | null;
  is_online: boolean;
}

export interface Review {
  id: string;
  user_id: string;
  business_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles?: { id: string; full_name: string; profile_image_url: string | null };
}

export interface PointsLedgerEntry {
  id: number;
  user_id: string;
  amount: number;
  reason: string;
  reference_id: string | null;
  balance_after: number;
  created_at: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatar_url: string | null;
  level: number;
  xp_total?: number;
  xp_week?: number;
  xp_month?: number;
  streak_current: number;
  checkins_total: number;
  badges_count: number;
}

// ════════════════════════════════════════════════════════════
//  App-level types (UI state, not DB)
// ════════════════════════════════════════════════════════════

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

export interface ValidationResult {
  valid: boolean;
  reason?: string;
  xp?: number;
  bonus_xp?: number;
}

export interface Landmark {
  id: string;
  name: string;
  name_bg: string | null;
  description: string | null;
  description_bg: string | null;
  category: string;
  lat: number;
  lng: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  // extended fields
  address?: string | null;
  points?: number | null;
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  conversation_id: string;
  content: string;
  type: 'text' | 'image';
  image_data: string | null;
  is_read: boolean;
  created_at: string;
}

export interface Conversation {
  userId: string;
  userName: string;
  userAvatar: string | null;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  online: boolean;
}

export type CategoryFilter = 'all' | 'cafe' | 'museum' | 'cultural' | 'featured' | 'bar' | 'shop' | 'gallery' | 'park' | 'event';

export type BottomSheetState = 'closed' | 'compact' | 'expanded';
