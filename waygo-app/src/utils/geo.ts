import type { PartnerBusiness, ValidationResult } from '../types';

export const R = 6371e3;

export function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δφ = toRadians(lat2 - lat1);
  const Δλ = toRadians(lng2 - lng1);

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export function calculateXP(
  distance: number,
  streak: number,
  isQuestCompletion: boolean = false
): { base: number; bonus: number; multiplier: number; total: number } {
  let base = 50;
  let bonus = 0;
  let multiplier = 1;

  if (distance > 500) {
    bonus += 25;
  }

  if (streak >= 7) {
    multiplier = 1.5;
  } else if (streak >= 3) {
    multiplier = 1.2;
  }

  if (isQuestCompletion) {
    bonus += Math.floor(base * 0.5);
  }

  const total = Math.floor((base + bonus) * multiplier);

  return { base, bonus, multiplier, total };
}

export function validateCheckin(
  userLat: number,
  userLng: number,
  business: PartnerBusiness,
  enteredCode: string
): ValidationResult {
  const distance = haversine(userLat, userLng, business.lat, business.lng);

  if (distance > business.geofence_radius_meters) {
    return {
      valid: false,
      reason: `You are ${Math.round(distance)}m away. Must be within ${business.geofence_radius_meters}m`,
    };
  }

  if (enteredCode.toUpperCase() !== business.checkin_code.toUpperCase()) {
    return {
      valid: false,
      reason: 'Incorrect check-in code',
    };
  }

  return { valid: true };
}

export function calculateLevel(xp: number): number {
  return Math.floor(xp / 500) + 1;
}

export function xpForNextLevel(currentLevel: number): number {
  return currentLevel * 500;
}

export function xpProgressInLevel(xp: number): { current: number; total: number; percentage: number } {
  const currentLevelXP = Math.floor(xp / 500) * 500;
  const progress = xp - currentLevelXP;
  return {
    current: progress,
    total: 500,
    percentage: (progress / 500) * 100,
  };
}

export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

export function generateVoucherCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}