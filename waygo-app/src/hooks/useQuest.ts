import { useState, useEffect, useCallback } from 'react';
import type { Quest } from '../types';
import { fetchQuests } from '../data/mockApi';

interface QuestProgress {
  questId: string;
  checkedInWaypoints: string[];
  isAccepted: boolean;
}

export function useQuest() {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState<QuestProgress[]>([
    { questId: 'quest-coffee-trail', checkedInWaypoints: ['coffee-trail'], isAccepted: true },
    { questId: 'quest-history-hunter', checkedInWaypoints: ['history-museum'], isAccepted: true },
  ]);

  useEffect(() => {
    fetchQuests().then(data => {
      setQuests(data);
      setIsLoading(false);
    });
  }, []);

  const acceptQuest = useCallback((questId: string) => {
    setProgress(prev => {
      const exists = prev.find(p => p.questId === questId);
      if (exists) return prev;
      return [...prev, { questId, checkedInWaypoints: [], isAccepted: true }];
    });
  }, []);

  const abandonQuest = useCallback((questId: string) => {
    setProgress(prev => prev.filter(p => p.questId !== questId));
  }, []);

  const checkinWaypoint = useCallback((questId: string, businessId: string) => {
    setProgress(prev => prev.map(p => {
      if (p.questId !== questId) return p;
      if (p.checkedInWaypoints.includes(businessId)) return p;
      return { ...p, checkedInWaypoints: [...p.checkedInWaypoints, businessId] };
    }));
  }, []);

  const getQuestProgress = useCallback((questId: string) => {
    const p = progress.find(pr => pr.questId === questId);
    const quest = quests.find(q => q.id === questId);
    if (!p || !quest) return { checked: 0, total: quest?.required_checkins_count || 0, percentage: 0, isAccepted: false };

    return {
      checked: p.checkedInWaypoints.length,
      total: quest.required_checkins_count,
      percentage: (p.checkedInWaypoints.length / quest.required_checkins_count) * 100,
      isAccepted: p.isAccepted,
    };
  }, [progress, quests]);

  const isQuestComplete = useCallback((questId: string) => {
    const quest = quests.find(q => q.id === questId);
    const p = progress.find(pr => pr.questId === questId);
    return quest ? (p?.checkedInWaypoints.length || 0) >= quest.required_checkins_count : false;
  }, [progress, quests]);

  const getNextWaypoint = useCallback((questId: string) => {
    const quest = quests.find(q => q.id === questId);
    const p = progress.find(pr => pr.questId === questId);
    if (!quest || !p) return null;

    return quest.waypoint_business_ids.find(id => !p.checkedInWaypoints.includes(id));
  }, [progress, quests]);

  return {
    quests,
    isLoading,
    progress,
    acceptQuest,
    abandonQuest,
    checkinWaypoint,
    getQuestProgress,
    isQuestComplete,
    getNextWaypoint,
  };
}