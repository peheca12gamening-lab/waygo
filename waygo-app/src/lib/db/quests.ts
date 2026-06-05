import { supabase } from '../supabase';
import type { Quest, QuestStop } from '../../types';

export const getQuestStopsByBusinessIds = async (): Promise<Record<string, { questId: string; questTitle: string }[]>> => {
  const { data } = await supabase
    .from('quest_stops')
    .select('business_id, quest_id, quests!inner(title)');
  if (!data) return {};
  const map: Record<string, { questId: string; questTitle: string }[]> = {};
  for (const row of data as any[]) {
    const bid = row.business_id;
    if (!map[bid]) map[bid] = [];
    map[bid].push({ questId: row.quest_id, questTitle: row.quests?.title ?? 'Quest' });
  }
  return map;
};

export const getQuests = async (): Promise<Quest[]> => {
  const { data } = await supabase
    .from('quests')
    .select('*')
    .eq('is_active', true);
  return (data ?? []).map(q => ({
    ...q,
    tier: (q as any).tier ?? 'bronze',
    requirements: (q as any).requirements ?? [],
    icon: (q as any).icon ?? 'Sword',
    unlocks_at_level: (q as any).unlocks_at_level ?? 1,
  })) as unknown as Quest[];
};

export const getQuestStops = async (questId: string): Promise<QuestStop[]> => {
  const { data } = await supabase
    .from('quest_stops')
    .select('*, businesses!inner(id, name, lat, lng)')
    .eq('quest_id', questId)
    .order('sort_order');
  return data ?? [];
};

export const acceptQuest = async (userId: string, questId: string) => {
  const { error } = await supabase
    .from('user_quests')
    .insert({ user_id: userId, quest_id: questId });
  if (error && error.code !== '23505') throw error;
};

export const getUserQuests = async (userId: string) => {
  const { data } = await supabase
    .from('user_quests')
    .select('*')
    .eq('user_id', userId);
  return data ?? [];
};

export const updateQuestProgress = async (userId: string, questId: string, progress: number) => {
  const { data } = await supabase
    .from('user_quests')
    .update({ progress })
    .eq('user_id', userId)
    .eq('quest_id', questId)
    .select()
    .single();
  return data;
};

export const completeQuest = async (userId: string, questId: string, xpReward: number) => {
  const { data: profile } = await supabase
    .from('profiles')
    .select('xp_total, points, quests_completed')
    .eq('id', userId)
    .single();

  await supabase
    .from('user_quests')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      progress: supabase.rpc('increment', { x: 1 }),
    })
    .eq('user_id', userId)
    .eq('quest_id', questId);

  await supabase
    .from('profiles')
    .update({
      xp_total: (profile?.xp_total ?? 0) + xpReward,
      points: (profile?.points ?? 0) + xpReward,
      quests_completed: (profile?.quests_completed ?? 0) + 1,
    })
    .eq('id', userId);

  await supabase.from('points_ledger').insert({
    user_id: userId,
    amount: xpReward,
    reason: 'quest_complete',
    reference_id: questId as any,
    balance_after: (profile?.points ?? 0) + xpReward,
  });

  // Check and award any newly-unlocked badges
  try {
    const { checkAndAwardBadges } = await import('./checkBadges');
    checkAndAwardBadges(userId).catch(() => {});
  } catch {
    // silent
  }
};
