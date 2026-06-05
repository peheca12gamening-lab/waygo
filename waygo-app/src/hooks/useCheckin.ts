import { useState, useCallback } from 'react';
import type { ValidationResult } from '../types';
import { validateCheckin, calculateXP } from '../utils/geo';
import { createCheckin } from '../lib/db';
import { useAuth } from '../context/AuthContext';

interface CheckinState {
  isValidating: boolean;
  result: ValidationResult | null;
  xpEarned: number;
  streakUpdated: number;
}

export function useCheckin() {
  const { user } = useAuth();
  const [state, setState] = useState<CheckinState>({
    isValidating: false,
    result: null,
    xpEarned: 0,
    streakUpdated: 0,
  });

  const performCheckin = useCallback(async (
    userLat: number,
    userLng: number,
    business: any,
    enteredCode: string,
    currentStreak: number = 0
  ): Promise<ValidationResult> => {
    setState(prev => ({ ...prev, isValidating: true }));

    const result = validateCheckin(userLat, userLng, business, enteredCode);

    if (result.valid && user) {
      const { total } = calculateXP(50, currentStreak, false);
      const newStreak = currentStreak + 1;

      try {
        await createCheckin(user.id, business.id, {
          validationMethod: 'qr',
          gpsLat: userLat,
          gpsLng: userLng,
          distanceMeters: Math.round(50),
        });
      } catch (e) {
        console.error('Checkin DB error:', e);
      }

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
  }, [user]);

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
