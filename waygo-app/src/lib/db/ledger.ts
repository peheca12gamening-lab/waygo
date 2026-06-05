import { supabase } from '../supabase';
import type { PointsLedgerEntry, Notification } from '../../types';

export const getPointsLedger = async (userId: string): Promise<PointsLedgerEntry[]> => {
  const { data } = await supabase
    .from('points_ledger')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);
  return data ?? [];
};

export const getNotifications = async (userId: string): Promise<Notification[]> => {
  const { data } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(30);
  return data ?? [];
};

export const markNotificationsRead = async (userId: string) => {
  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);
};
