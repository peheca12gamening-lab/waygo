import { supabase } from '../supabase';
import type { Business, BusinessDetail, Category, NearbyBusiness } from '../../types';

export const getCategories = async (): Promise<Category[]> => {
  const { data } = await supabase.from('categories').select('*').order('id');
  return data ?? [];
};

export const getBusinesses = async (): Promise<Business[]> => {
  const { data } = await supabase.rpc('nearby_businesses', {
    ref_lng: 24.7453,
    ref_lat: 42.1354,
    radius_meters: 10000,
  });
  return (data ?? []) as unknown as Business[];
};

export const getNearbyBusinesses = async (
  lng: number, lat: number, radius: number = 500
): Promise<NearbyBusiness[]> => {
  const { data } = await supabase.rpc('nearby_businesses', {
    ref_lng: lng,
    ref_lat: lat,
    radius_meters: radius,
  });
  return (data ?? []) as unknown as NearbyBusiness[];
};

export const getBusinessById = async (id: string): Promise<BusinessDetail | null> => {
  const { data } = await supabase
    .from('businesses')
    .select(`
      *,
      categories!inner(slug, label_en, label_bg, emoji, color_hex, is_sight),
      business_hours(*),
      business_photos(*)
    `)
    .eq('id', id)
    .single();
  return data as unknown as BusinessDetail | null;
};
