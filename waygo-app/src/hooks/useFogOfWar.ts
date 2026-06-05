import { useState, useCallback, useMemo, useEffect } from 'react';
import type { ExploredTile } from '../types';
import { getExploredTiles, addExploredTile } from '../lib/db';
import { useAuth } from '../context/AuthContext';

const EXPLORED_RADIUS_METERS = 150;

interface FogOfWarState {
  tiles: ExploredTile[];
  isEnabled: boolean;
  exploredPercentage: number;
}

export function useFogOfWar() {
  const { user } = useAuth();
  const [state, setState] = useState<FogOfWarState>({
    tiles: [],
    isEnabled: true,
    exploredPercentage: 0,
  });

  useEffect(() => {
    if (user) {
      getExploredTiles(user.id).then(tiles => {
        const pct = Math.min(100, Math.round((tiles.length / 20) * 100));
        setState(prev => ({ ...prev, tiles, exploredPercentage: pct }));
      });
    }
  }, [user]);

  const revealTile = useCallback(async (lat: number, lng: number) => {
    if (!user) return;
    const exists = state.tiles.some(
      t => Math.abs(t.center_lat - lat) < 0.001 && Math.abs(t.center_lng - lng) < 0.001
    );
    if (exists) return;

    await addExploredTile(user.id, lng, lat, EXPLORED_RADIUS_METERS);

    const newTile: ExploredTile = {
      id: `tile-${Date.now()}`,
      user_id: user.id,
      center_lat: lat,
      center_lng: lng,
      radius_meters: EXPLORED_RADIUS_METERS,
      revealed_date: new Date().toISOString(),
    };

    setState(prev => {
      const newTiles = [...prev.tiles, newTile];
      const exploredPercentage = Math.min(100, Math.round((newTiles.length / 20) * 100));
      return { ...prev, tiles: newTiles, exploredPercentage };
    });
  }, [user, state.tiles]);

  const toggleFog = useCallback(() => {
    setState(prev => ({ ...prev, isEnabled: !prev.isEnabled }));
  }, []);

  const resetFog = useCallback(() => {
    setState({ tiles: [], isEnabled: true, exploredPercentage: 0 });
  }, []);

  const fogTiles = useMemo(() => state.tiles, [state.tiles]);

  return {
    tiles: fogTiles,
    isEnabled: state.isEnabled,
    exploredPercentage: state.exploredPercentage,
    revealTile,
    toggleFog,
    resetFog,
  };
}
