import { supabase } from '../supabase';
import { awardBadge } from './badges';

const BADGE_RULES: Record<string, (profile: any, checkins: any[]) => boolean> = {
  'first-steps': (profile) => profile.checkins_total >= 1,
  'coffee-lover': (_profile, checkins) =>
    checkins.filter(c => c.businesses?.categories?.slug === 'cafe').length >= 3,
  'week-warrior': (profile) => profile.streak_current >= 7,
  'culture-vulture': (_profile, checkins) =>
    checkins.filter(c => c.businesses?.categories?.slug === 'museum' || c.businesses?.categories?.slug === 'cultural').length >= 3,
  'night-owl': (_profile, checkins) =>
    checkins.some(c => {
      const h = new Date(c.created_at).getHours();
      return h >= 22 || h < 2;
    }),
  'early-bird': (_profile, checkins) =>
    checkins.some(c => {
      const h = new Date(c.created_at).getHours();
      return h >= 5 && h < 8;
    }),
  'quest-master': (profile) => profile.quests_completed >= 5,
  'explorer': (profile) => (profile.explored_pct ?? profile.explored_percentage ?? 0) >= 50,
};

export async function checkAndAwardBadges(userId: string): Promise<string[]> {
  const [profileResult, earnedResult] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', userId).single(),
    supabase.from('user_badges').select('badge_id').eq('user_id', userId),
  ]);

  const profile = profileResult.data;
  if (!profile) return [];

  const alreadyEarned = new Set((earnedResult.data ?? []).map((b: any) => b.badge_id));
  const newlyEarned: string[] = [];

  let checkins: any[] = [];
  if (Object.values(BADGE_RULES).some(fn => fn.toString().includes('checkins'))) {
    const { data } = await supabase
      .from('checkins')
      .select('*, businesses!inner(name, categories!inner(slug))')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    checkins = data ?? [];
  }

  for (const [badgeId, rule] of Object.entries(BADGE_RULES)) {
    if (alreadyEarned.has(badgeId)) continue;
    if (rule(profile, checkins)) {
      try {
        await awardBadge(userId, badgeId);
        newlyEarned.push(badgeId);
      } catch {
        // ignore duplicate errors
      }
    }
  }

  return newlyEarned;
}
