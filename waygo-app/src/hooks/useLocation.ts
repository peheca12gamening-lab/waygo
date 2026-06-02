import { useState, useEffect, useCallback } from 'react';
import { DEMO_USER } from '../data/seed';

interface LocationState {
  lat: number;
  lng: number;
  accuracy: number | null;
  isLoading: boolean;
  error: string | null;
  isDemoMode: boolean;
}

export function useLocation() {
  const [location, setLocation] = useState<LocationState>({
    lat: DEMO_USER.last_location_lat || 42.1420,
    lng: DEMO_USER.last_location_lng || 24.7490,
    accuracy: null,
    isLoading: true,
    error: null,
    isDemoMode: true,
  });

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocation(prev => ({
        ...prev,
        isLoading: false,
        error: 'Geolocation not supported',
        isDemoMode: true,
      }));
      return;
    }

    setLocation(prev => ({ ...prev, isLoading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          isLoading: false,
          error: null,
          isDemoMode: false,
        });
      },
      (error) => {
        setLocation(prev => ({
          ...prev,
          isLoading: false,
          error: error.message,
          isDemoMode: true,
        }));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return { ...location, requestLocation };
}

export function useWatchLocation() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      () => {},
      { enableHighAccuracy: true, timeout: 10000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return location || { lat: 42.1420, lng: 24.7490 };
}