import { supabase } from '../supabase';
import type { Profile } from '../../types';

export const getProfile = async (userId: string) => {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return data as Profile | null;
};

export const updateProfile = async (userId: string, updates: Record<string, any>) => {
  const { data } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  return data as Profile | null;
};

export const getProfileById = async (userId: string): Promise<Profile | null> => {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  return data as Profile | null;
};

export const searchProfiles = async (query: string, currentUserId: string): Promise<Profile[]> => {
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .or(`full_name.ilike.%${query}%,username.ilike.%${query}%`)
    .neq('id', currentUserId)
    .limit(20);
  return (data ?? []) as Profile[];
};
