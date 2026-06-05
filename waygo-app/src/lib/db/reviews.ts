import { supabase } from '../supabase';
import type { Review } from '../../types';

export const createReview = async (userId: string, businessId: string, rating: number, comment?: string) => {
  const { data } = await supabase
    .from('reviews')
    .insert({ user_id: userId, business_id: businessId, rating, comment: comment ?? null })
    .select()
    .single();
  return data;
};

export const getBusinessReviews = async (businessId: string): Promise<Review[]> => {
  const { data } = await supabase
    .from('reviews')
    .select('*, profiles!inner(id, full_name, profile_image_url)')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });
  return data ?? [];
};
