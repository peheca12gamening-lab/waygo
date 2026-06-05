import { supabase } from '../supabase';
import type { Friendship } from '../../types';

export const getFriends = async (userId: string): Promise<Friendship[]> => {
  const { data } = await supabase
    .from('friendships')
    .select(`
      *,
      friend:profiles!friend_id(id, full_name, profile_image_url, current_level, points, checkins_total),
      user_profile:profiles!user_id(id, full_name, profile_image_url, current_level, points, checkins_total)
    `)
    .or(`user_id.eq.${userId},friend_id.eq.${userId}`)
    .eq('status', 'accepted');
  return data ?? [];
};

export const getFriendRequests = async (userId: string): Promise<Friendship[]> => {
  const { data } = await supabase
    .from('friendships')
    .select('*, user:profiles!user_id(id, full_name, profile_image_url)')
    .eq('friend_id', userId)
    .eq('status', 'pending');
  return data ?? [];
};

export const sendFriendRequest = async (userId: string, friendId: string) => {
  const { error } = await supabase
    .from('friendships')
    .insert({ user_id: userId, friend_id: friendId });
  if (error && error.code !== '23505') throw error;
};

export const acceptFriendRequest = async (friendshipId: string) => {
  await supabase
    .from('friendships')
    .update({ status: 'accepted', updated_at: new Date().toISOString() })
    .eq('id', friendshipId);
};

export const declineFriendRequest = async (friendshipId: string) => {
  await supabase
    .from('friendships')
    .update({ status: 'declined', updated_at: new Date().toISOString() })
    .eq('id', friendshipId);
};

export const removeFriend = async (userId: string, friendId: string) => {
  await supabase
    .from('friendships')
    .delete()
    .or(`and(user_id.eq.${userId},friend_id.eq.${friendId}),and(user_id.eq.${friendId},friend_id.eq.${userId})`)
    .eq('status', 'accepted');
};

export const getFriendshipStatus = async (userId: string, otherUserId: string): Promise<'none' | 'pending' | 'accepted'> => {
  const { data } = await supabase
    .from('friendships')
    .select('status')
    .or(`and(user_id.eq.${userId},friend_id.eq.${otherUserId}),and(user_id.eq.${otherUserId},friend_id.eq.${userId})`)
    .maybeSingle();
  if (!data) return 'none';
  return data.status as 'pending' | 'accepted';
};

// ── Messages (real-time chat) ──
export function conversationId(a: string, b: string): string {
  return [a, b].sort().join('_');
}

export const sendMessage = async (
  senderId: string, receiverId: string, content: string,
  options?: { type?: string; imageData?: string }
) => {
  const convId = conversationId(senderId, receiverId);
  const { data, error } = await supabase
    .from('messages')
    .insert({
      sender_id: senderId,
      receiver_id: receiverId,
      conversation_id: convId,
      content,
      type: options?.type ?? 'text',
      image_data: options?.imageData ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const getMessages = async (userId: string, otherUserId: string) => {
  const convId = conversationId(userId, otherUserId);
  const { data } = await supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', convId)
    .order('created_at', { ascending: true });
  return data ?? [];
};

export const markMessagesRead = async (userId: string, otherUserId: string) => {
  const convId = conversationId(userId, otherUserId);
  await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('conversation_id', convId)
    .eq('receiver_id', userId)
    .eq('is_read', false);
};

export const getUnreadCount = async (userId: string): Promise<number> => {
  const { count } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('receiver_id', userId)
    .eq('is_read', false);
  return count ?? 0;
};

export const getConversations = async (userId: string): Promise<{
  userId: string; userName: string; userAvatar: string | null;
  lastMessage: string; lastMessageTime: string; unreadCount: number;
}[]> => {
  // Get all unique conversation partners
  const { data: sent } = await supabase
    .from('messages')
    .select('receiver_id')
    .eq('sender_id', userId)
    .order('created_at', { ascending: false });
  const { data: received } = await supabase
    .from('messages')
    .select('sender_id')
    .eq('receiver_id', userId)
    .order('created_at', { ascending: false });

  const partnerIds = new Set<string>();
  (sent ?? []).forEach((m: any) => partnerIds.add(m.receiver_id));
  (received ?? []).forEach((m: any) => partnerIds.add(m.sender_id));

  const results: any[] = [];
  for (const pid of partnerIds) {
    const convId = conversationId(userId, pid);
    const { data: msgs } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: false })
      .limit(1);
    const last = msgs?.[0];
    if (!last) continue;

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, profile_image_url')
      .eq('id', pid)
      .single();

    const { count: unread } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', convId)
      .eq('receiver_id', userId)
      .eq('is_read', false);

    results.push({
      userId: pid,
      userName: (profile as any)?.full_name ?? 'Unknown',
      userAvatar: (profile as any)?.profile_image_url ?? null,
      lastMessage: last.content.length > 40 ? last.content.slice(0, 40) + '...' : last.content,
      lastMessageTime: last.created_at,
      unreadCount: unread ?? 0,
    });
  }

  // Sort by most recent message
  results.sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());
  return results;
};

export const subscribeToMessages = (userId: string, callback: (message: any) => void, channelKey?: string) => {
  const channelName = channelKey ? `messages-${channelKey}` : `messages-${userId}`;
  return supabase
    .channel(channelName)
    .on('postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'messages', filter: `receiver_id=eq.${userId}` },
      (payload) => callback(payload.new)
    )
    .on('postgres_changes',
      { event: 'UPDATE', schema: 'public', table: 'typing_indicators' },
      () => {}
    )
    .subscribe((status: string) => {
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.error('Realtime messages subscription error:', status);
      }
    });
};

export const setTyping = async (conversationId: string, userId: string, isTyping: boolean) => {
  await supabase
    .from('typing_indicators')
    .upsert({
      conversation_id: conversationId,
      user_id: userId,
      is_typing: isTyping,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'conversation_id' });
};

export const subscribeToTyping = (
  conversationId: string,
  userId: string,
  callback: (isTyping: boolean) => void
) => {
  return supabase
    .channel(`typing-${conversationId}`)
    .on('postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'typing_indicators',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        const row = payload.new as any;
        if (row && row.user_id !== userId) {
          callback(!!row.is_typing);
        }
      }
    )
    .subscribe((status: string) => {
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.error('Realtime typing subscription error:', status);
      }
    });
};
