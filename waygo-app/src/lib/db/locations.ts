import { supabase } from '../supabase';
import type { ExploredTile, UserLocation } from '../../types';

export const upsertUserLocation = async (userId: string, lng: number, lat: number, heading?: number, speed?: number) => {
  await supabase
    .from('user_locations')
    .upsert({
      user_id: userId,
      location: `POINT(${lng} ${lat})`,
      heading: heading ?? null,
      speed: speed ?? null,
      is_online: true,
      updated_at: new Date().toISOString(),
    });
};

export const getOnlineUsers = async (): Promise<UserLocation[]> => {
  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
  const { data } = await supabase
    .from('user_locations')
    .select('*, profiles!inner(id, full_name, profile_image_url)')
    .eq('is_online', true)
    .gte('updated_at', fiveMinAgo);
  return (data ?? []).map((u: any) => ({
    user_id: u.user_id,
    full_name: u.profiles?.full_name ?? 'Unknown',
    profile_image_url: u.profiles?.profile_image_url,
    lat: u.location?.coordinates?.[1] ?? 0,
    lng: u.location?.coordinates?.[0] ?? 0,
    heading: u.heading,
    is_online: u.is_online,
  }));
};

export const getExploredTiles = async (userId: string): Promise<ExploredTile[]> => {
  const { data } = await supabase
    .from('explored_tiles')
    .select('*')
    .eq('user_id', userId);
  return (data ?? []).map(t => ({
    id: t.id,
    user_id: t.user_id,
    center_lat: (t as any).location?.coordinates?.[1] ?? 0,
    center_lng: (t as any).location?.coordinates?.[0] ?? 0,
    radius_meters: t.radius_meters,
    revealed_date: t.revealed_at,
  }));
};

export const addExploredTile = async (userId: string, lng: number, lat: number, radius: number = 150) => {
  const { error } = await supabase
    .from('explored_tiles')
    .insert({
      user_id: userId,
      location: `POINT(${lng} ${lat})`,
      radius_meters: radius,
    });
  if (error && error.code !== '23505') throw error;
};
