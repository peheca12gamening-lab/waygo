import { supabase } from '../supabase';
import type { CheckIn } from '../../types';
import { calculateXP, calculateLevel } from '../../utils/geo';

function todaysDateUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

function yesterdaysDateUTC(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export const createCheckin = async (
  userId: string,
  businessId: string,
  options: {
    photoUrl?: string;
    questId?: string;
    validationMethod?: string;
    gpsLat?: number;
    gpsLng?: number;
    distanceMeters?: number;
  }
): Promise<CheckIn> => {
  // Fetch the business to check if it's a sight (scenic/cultural)
  const { data: biz } = await supabase
    .from('businesses')
    .select('is_sight, name')
    .eq('id', businessId)
    .single();

  const isSight = biz?.is_sight ?? false;
  const bizName = biz?.name ?? '';
  const { data: profile } = await supabase
    .from('profiles')
    .select('streak_current, streak_longest, streak_last_date, xp_total, points, checkins_total')
    .eq('id', userId)
    .single();

  const currentStreak = profile?.streak_current ?? 0;
  const currentLongest = profile?.streak_longest ?? 0;
  const lastDate = profile?.streak_last_date ?? null;
  const today = todaysDateUTC();

  // Streak logic: detect gaps and prevent double-increment
  let newStreak: number;
  if (lastDate === today) {
    // Already checked in today — no streak change
    newStreak = currentStreak;
  } else if (lastDate === yesterdaysDateUTC()) {
    // Consecutive day — increment
    newStreak = currentStreak + 1;
  } else {
    // Gap detected — reset to 1
    newStreak = 1;
  }

  // XP only awarded for scenic/cultural/historic locations (isSight = true)
  const { total: rawXp } = isSight
    ? calculateXP(options.distanceMeters ?? 50, newStreak, false)
    : { total: 0 };
  const total = rawXp;
  const newLevel = calculateLevel((profile?.xp_total ?? 0) + total);
  const newLongest = Math.max(currentLongest, newStreak);

  const { data: checkin, error: checkinError } = await supabase
    .from('checkins')
    .insert({
      user_id: userId,
      business_id: businessId,
      photo_url: options.photoUrl ?? null,
      xp_awarded: total,
      points_earned: 0,
      quest_id: options.questId ?? null,
      validation_method: options.validationMethod ?? 'gps',
      gps_lat: options.gpsLat ?? null,
      gps_lng: options.gpsLng ?? null,
      distance_meters: options.distanceMeters ?? null,
    })
    .select()
    .single();

  if (checkinError) throw new Error(checkinError.message);

  await supabase
    .from('profiles')
    .update({
      streak_current: newStreak,
      streak_longest: newLongest,
      streak_last_date: today,
      checkins_total: (profile?.checkins_total ?? 0) + 1,
      xp_total: (profile?.xp_total ?? 0) + total,
      current_level: newLevel,
    })
    .eq('id', userId);

  await supabase.from('points_ledger').insert({
    user_id: userId,
    amount: total,
    reason: isSight ? `checkin_${bizName}` : 'checkin_noxp',
    reference_id: checkin.id,
    balance_after: (profile?.points ?? 0) + total,
  });

  if (options.gpsLat && options.gpsLng) {
    await supabase.rpc('add_explored_tile', {
      p_user_id: userId,
      p_lng: options.gpsLng,
      p_lat: options.gpsLat,
    });
  }

  await supabase
    .from('businesses')
    .update({ total_checkins: supabase.rpc('increment', { x: 1 }) })
    .eq('id', businessId);

  // Check and award any newly-unlocked badges
  try {
    const { checkAndAwardBadges } = await import('./checkBadges');
    checkAndAwardBadges(userId).catch(() => {});
  } catch {
    // silent
  }

  return checkin as unknown as CheckIn;
};

export const getUserCheckins = async (userId: string): Promise<CheckIn[]> => {
  const { data } = await supabase
    .from('checkins')
    .select('*, businesses!inner(name, categories!inner(slug, emoji))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  return data ?? [];
};
