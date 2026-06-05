import { useState, useEffect, useRef } from 'react';

interface WatchPositionState {
  position: [number, number];
  error: string | null;
  isWatching: boolean;
}

export function useWatchPosition(): WatchPositionState {
  const [state, setState] = useState<WatchPositionState>({
    position: [42.1420, 24.7490],
    error: null,
    isWatching: false,
  });
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setState(s => ({ ...s, error: 'Geolocation not supported' }));
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      ({ coords: { latitude, longitude } }) => {
        setState({ position: [latitude, longitude], error: null, isWatching: true });
      },
      (err) => {
        setState(s => ({ ...s, error: err.message, isWatching: false }));
      },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 15000 }
    );

    watchIdRef.current = watchId;

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return state;
}
