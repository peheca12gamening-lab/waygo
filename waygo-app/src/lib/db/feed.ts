import { supabase } from '../supabase';
import type { FeedPost } from '../../types';

export const getFeed = async (): Promise<FeedPost[]> => {
  const { data } = await supabase
    .from('v_active_feed')
    .select('*')
    .limit(50);
  return (data ?? []) as unknown as FeedPost[];
};

export const likePost = async (postId: string, userId: string) => {
  const { error } = await supabase
    .from('feed_likes')
    .insert({ post_id: postId, user_id: userId });
  if (error && error.code === '23505') {
    await supabase
      .from('feed_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);
    return false;
  }
  return true;
};

export const createFeedPost = async (checkinId: string, userId: string, businessId: string, photoUrl?: string, caption?: string) => {
  const { data } = await supabase
    .from('feed_posts')
    .insert({
      checkin_id: checkinId,
      user_id: userId,
      business_id: businessId,
      photo_url: photoUrl ?? null,
      caption: caption ?? null,
    })
    .select()
    .single();
  return data;
};
