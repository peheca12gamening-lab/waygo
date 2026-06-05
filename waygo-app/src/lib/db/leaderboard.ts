import { supabase } from '../supabase';
import type { LeaderboardEntry } from '../../types';

function mapRpcRow(row: any): LeaderboardEntry {
  return {
    id: row.user_id ?? row.id,
    name: row.name ?? 'Explorer',
    avatar_url: row.avatar_url ?? null,
    level: row.level ?? Math.floor((row.xp_total ?? 0) / 500) + 1,
    xp_total: row.xp_total ?? 0,
    xp_week: row.xp_week ?? row.xp_weekly ?? 0,
    xp_month: row.xp_month ?? row.xp_monthly ?? 0,
    streak_current: row.streak_current ?? 0,
    checkins_total: row.checkins_total ?? row.checkin_count ?? 0,
    badges_count: row.badges_count ?? 0,
  };
}

export const getLeaderboard = async (period: 'all' | 'week' | 'month'): Promise<LeaderboardEntry[]> => {
  const rpcPeriod = period === 'week' ? 'weekly' : period === 'month' ? 'monthly' : 'all';
  const { data, error } = await supabase.rpc('get_leaderboard', { period: rpcPeriod });
  if (!error && data) {
    return (data as any[]).map(mapRpcRow);
  }
  const viewName = period === 'all' ? 'v_leaderboard_all'
    : period === 'week' ? 'v_leaderboard_week'
    : 'v_leaderboard_month';
  const { data: fallback } = await supabase
    .from(viewName)
    .select('*')
    .limit(100);
  return (fallback ?? []).map(mapRpcRow);
};
