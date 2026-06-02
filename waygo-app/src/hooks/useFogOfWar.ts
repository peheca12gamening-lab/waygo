import { useState, useCallback, useMemo } from 'react';
import type { ExploredTile } from '../types';
import { DEMO_USER } from '../data/seed';

interface FogOfWarState {
  tiles: ExploredTile[];
  isEnabled: boolean;
  exploredPercentage: number;
}

const EXPLORED_RADIUS_METERS = 150;

const INITIAL_TILES: ExploredTile[] = [
  { id: 'init-1', user_id: DEMO_USER.id, center_lat: 42.1430, center_lng: 24.7490, radius_meters: EXPLORED_RADIUS_METERS, revealed_date: '2024-01-15' },
  { id: 'init-2', user_id: DEMO_USER.id, center_lat: 42.1420, center_lng: 24.7500, radius_meters: EXPLORED_RADIUS_METERS, revealed_date: '2024-01-16' },
  { id: 'init-3', user_id: DEMO_USER.id, center_lat: 42.1415, center_lng: 24.7480, radius_meters: EXPLORED_RADIUS_METERS, revealed_date: '2024-01-17' },
  { id: 'init-4', user_id: DEMO_USER.id, center_lat: 42.1440, center_lng: 24.7510, radius_meters: EXPLORED_RADIUS_METERS, revealed_date: '2024-01-18' },
  { id: 'init-5', user_id: DEMO_USER.id, center_lat: 42.1405, center_lng: 24.7465, radius_meters: EXPLORED_RADIUS_METERS, revealed_date: '2024-01-19' },
];

export function useFogOfWar(userId: string = DEMO_USER.id) {
  const [state, setState] = useState<FogOfWarState>({
    tiles: INITIAL_TILES,
    isEnabled: true,
    exploredPercentage: 34,
  });

  const revealTile = useCallback((lat: number, lng: number) => {
    setState(prev => {
      const exists = prev.tiles.some(
        t => Math.abs(t.center_lat - lat) < 0.001 && Math.abs(t.center_lng - lng) < 0.001
      );
      if (exists) return prev;

      const newTile: ExploredTile = {
        id: `tile-${Date.now()}`,
        user_id: userId,
        center_lat: lat,
        center_lng: lng,
        radius_meters: EXPLORED_RADIUS_METERS,
        revealed_date: new Date().toISOString(),
      };

      const newTiles = [...prev.tiles, newTile];
      const exploredPercentage = Math.min(100, Math.round((newTiles.length / 20) * 100));

      return {
        ...prev,
        tiles: newTiles,
        exploredPercentage,
      };
    });
  }, [userId]);

  const toggleFog = useCallback(() => {
    setState(prev => ({ ...prev, isEnabled: !prev.isEnabled }));
  }, []);

  const resetFog = useCallback(() => {
    setState(prev => ({ ...prev, tiles: INITIAL_TILES, exploredPercentage: 34 }));
  }, []);

  const fogTiles = useMemo(() => {
    return state.tiles;
  }, [state.tiles]);

  return {
    tiles: fogTiles,
    isEnabled: state.isEnabled,
    exploredPercentage: state.exploredPercentage,
    revealTile,
    toggleFog,
    resetFog,
  };
}