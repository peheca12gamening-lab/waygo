import { useState, useEffect, useCallback, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getQuests, getUserQuests, acceptQuest as dbAcceptQuest, getUserCheckins } from '../lib/db';
import { useAuth } from '../context/AuthContext';
import type { Quest, QuestRequirement } from '../types';

export interface QuestProgress {
  questId: string;
  checked: number;
  total: number;
  percentage: number;
  checkedInWaypoints: string[];
  isAccepted: boolean;
  completed: boolean;
}

export interface QuestWithStatus extends Quest {
  progress: QuestProgress;
  isLocked: boolean;
  locksAtLevel: number;
  requirementProgress: { req: QuestRequirement; done: number }[];
}

const emptyProgress = (questId: string): QuestProgress => ({
  questId, checked: 0, total: 0, percentage: 0, checkedInWaypoints: [], isAccepted: false, completed: false,
});

export function useQuest() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [progress, setProgress] = useState<QuestProgress[]>([]);
  const [userLevel, setUserLevel] = useState(1);
  const [totalCheckins, setTotalCheckins] = useState(0);

  const { data: quests = [] } = useQuery({
    queryKey: ['quests'],
    queryFn: getQuests,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
    if (!user) return;
    getUserQuests(user.id).then(data => {
      setProgress(data.map((uq: any) => ({
        questId: uq.quest_id,
        checked: (uq.checked_waypoints ?? []).length,
        total: uq.total_stops ?? uq.stops_count ?? 0,
        percentage: 0,
        checkedInWaypoints: uq.checked_waypoints ?? [],
        isAccepted: !!uq.accepted_at,
        completed: uq.status === 'completed',
      })));
    });
    // Fetch user level and total checkins for requirement checking
    Promise.all([
      import('../lib/db').then(m => m.getProfile(user.id)),
      getUserCheckins(user.id),
    ]).then(([profile, checkins]) => {
      setUserLevel((profile as any)?.current_level ?? 1);
      setTotalCheckins(checkins.length);
    });
  }, [user]);

  const acceptMutation = useMutation({
    mutationFn: (questId: string) => dbAcceptQuest(user!.id, questId),
    onSuccess: (_data, questId) => {
      setProgress(prev => [...prev, { ...emptyProgress(questId), isAccepted: true }]);
      queryClient.invalidateQueries({ queryKey: ['quests'] });
    },
  });

  const getQuestProgress = useCallback((questId: string): QuestProgress => {
    const p = progress.find(p => p.questId === questId);
    if (!p) return emptyProgress(questId);
    const q = quests.find(q => q.id === questId);
    const total = q?.stops_count ?? p.total;
    return { ...p, total, percentage: total > 0 ? Math.round((p.checked / total) * 100) : 0 };
  }, [progress, quests]);

  const isActive = useCallback((questId: string): boolean => {
    return getQuestProgress(questId).isAccepted;
  }, [getQuestProgress]);

  const isCompleted = useCallback((questId: string): boolean => {
    return getQuestProgress(questId).completed;
  }, [getQuestProgress]);

  const isLocked = useCallback((quest: Quest): boolean => {
    return (quest.unlocks_at_level ?? 1) > userLevel;
  }, [userLevel]);

  const getRequirementProgress = useCallback((quest: Quest): { req: QuestRequirement; done: number }[] => {
    const reqs = quest.requirements ?? [];
    return reqs.map(req => {
      let done = 0;
      if (req.type === 'checkin') {
        done = Math.min(totalCheckins, req.count ?? 0);
      } else if (req.type === 'visit' && req.target) {
        // visits are counted from check-ins at specific locations
        done = 0; // simplified — actual checkin tracking would need geo-matching
      } else if (req.type === 'streak') {
        done = 0; // would need streak from profile
      } else if (req.type === 'friends') {
        done = 0; // would need friends count
      } else if (req.type === 'quests_completed') {
        const completed = progress.filter(p => p.completed).length;
        done = Math.min(completed, req.count ?? 0);
      }
      return { req, done };
    });
  }, [totalCheckins, progress]);

  const questsWithStatus = useMemo((): QuestWithStatus[] => {
    return quests.map(q => {
      const p = getQuestProgress(q.id);
      const locked = (q.unlocks_at_level ?? 1) > userLevel;
      const rp = getRequirementProgress(q);
      return { ...q, progress: p, isLocked: locked, locksAtLevel: q.unlocks_at_level ?? 1, requirementProgress: rp };
    });
  }, [quests, getQuestProgress, userLevel, getRequirementProgress]);

  const acceptQuest = useCallback((questId: string) => {
    acceptMutation.mutate(questId);
  }, [acceptMutation]);

  const activateQuestFromMap = useCallback((questId: string) => {
    if (isActive(questId) || isCompleted(questId)) return;
    acceptQuest(questId);
  }, [isActive, isCompleted, acceptQuest]);

  return { quests, questsWithStatus, getQuestProgress, acceptQuest, isActive, isCompleted, isLocked, activateQuestFromMap };
}