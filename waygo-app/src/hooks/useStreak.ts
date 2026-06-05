import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
  checkinDates: string[];
  nextMilestone: number;
  milestoneProgress: number;
  isLoading: boolean;
}

const MILESTONES = [3, 7, 14, 30, 100];

export function useStreak(): StreakData {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [checkinDates, setCheckinDates] = useState<string[]>([]);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const fetchCheckins = async () => {
      try {
        const { getUserCheckins } = await import('../lib/db/checkins');
        const data = await getUserCheckins(user.id);
        const dates = data
          .map(c => new Date(c.created_at).toISOString().slice(0, 10))
          .filter((d, i, arr) => arr.indexOf(d) === i);
        setCheckinDates(dates);
      } catch {
        setCheckinDates([]);
      }
      setIsLoading(false);
    };
    fetchCheckins();
  }, [user]);

  const currentStreak = user?.streak_current ?? 0;
  const longestStreak = user?.streak_longest ?? 0;

  const nextMilestone = useMemo(() => {
    return MILESTONES.find(m => m > currentStreak) ?? MILESTONES[MILESTONES.length - 1];
  }, [currentStreak]);

  const milestoneProgress = useMemo(() => {
    const prev = MILESTONES.filter(m => m <= currentStreak).pop() ?? 0;
    const next = nextMilestone;
    if (next <= prev) return 100;
    return Math.round(((currentStreak - prev) / (next - prev)) * 100);
  }, [currentStreak, nextMilestone]);

  return { currentStreak, longestStreak, checkinDates, nextMilestone, milestoneProgress, isLoading };
}
