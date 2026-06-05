import { useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { upsertUserLocation } from '../lib/db';
import { useAuth } from '../context/AuthContext';

export function useRealtimeLocation() {
  const { user } = useAuth();
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!user?.is_visible_on_map) return;

    // Watch position and upsert every 30s
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, heading, speed } = position.coords;
        upsertUserLocation(user.id, longitude, latitude, heading ?? undefined, speed ?? undefined);
      },
      (err) => console.warn('Geolocation error:', err.message),
      { enableHighAccuracy: true, maximumAge: 30000, timeout: 30000 }
    );

    watchIdRef.current = watchId;

    // Subscribe to Supabase realtime for other users' locations
    const channel = supabase
      .channel('user-locations')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'user_locations',
      }, (payload) => {
        // This will trigger React components to re-query
        window.dispatchEvent(new CustomEvent('user-location-update', { detail: payload }));
      })
      .subscribe();

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      supabase.removeChannel(channel);
    };
  }, [user?.id, user?.is_visible_on_map]);
}
