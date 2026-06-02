import { useState, useCallback } from 'react';
import type { ValidationResult, PartnerBusiness } from '../types';
import { validateCheckin, calculateXP } from '../utils/geo';
import { DEMO_USER } from '../data/seed';

interface CheckinState {
  isValidating: boolean;
  result: ValidationResult | null;
  xpEarned: number;
  streakUpdated: number;
}

export function useCheckin() {
  const [state, setState] = useState<CheckinState>({
    isValidating: false,
    result: null,
    xpEarned: 0,
    streakUpdated: 0,
  });

  const performCheckin = useCallback((
    userLat: number,
    userLng: number,
    business: PartnerBusiness,
    enteredCode: string,
    currentStreak: number = DEMO_USER.streak_current
  ): ValidationResult => {
    setState(prev => ({ ...prev, isValidating: true }));

    const result = validateCheckin(userLat, userLng, business, enteredCode);

    if (result.valid) {
      const { total } = calculateXP(50, currentStreak, false);
      const newStreak = currentStreak + 1;

      setState({
        isValidating: false,
        result: { ...result, xp: total },
        xpEarned: total,
        streakUpdated: newStreak,
      });
    } else {
      setState({
        isValidating: false,
        result,
        xpEarned: 0,
        streakUpdated: currentStreak,
      });
    }

    return result;
  }, []);

  const resetCheckin = useCallback(() => {
    setState({
      isValidating: false,
      result: null,
      xpEarned: 0,
      streakUpdated: 0,
    });
  }, []);

  return {
    ...state,
    performCheckin,
    resetCheckin,
  };
}