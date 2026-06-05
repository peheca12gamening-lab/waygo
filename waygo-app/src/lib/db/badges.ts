import { supabase } from '../supabase';
import type { Badge, UserBadge } from '../../types';

export const getBadges = async (): Promise<Badge[]> => {
  const { data } = await supabase.from('badges').select('*');
  return data ?? [];
};

export const getUserBadges = async (userId: string): Promise<UserBadge[]> => {
  const { data } = await supabase
    .from('user_badges')
    .select('*')
    .eq('user_id', userId);
  return data ?? [];
};

export const awardBadge = async (userId: string, badgeId: string) => {
  const { error } = await supabase
    .from('user_badges')
    .insert({ user_id: userId, badge_id: badgeId });
  if (error && error.code !== '23505') throw error;
};
