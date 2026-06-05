import { supabase } from '../supabase';
import type { Landmark } from '../../types';
import { PLOVDIV_LOCATIONS } from '../../data/plovdivLocations';

/** Convert bundled PlovdivLocation → Landmark shape */
function locationToLandmark(loc: typeof PLOVDIV_LOCATIONS[0]): Landmark {
  return {
    id: loc.id,
    name: loc.name,
    name_bg: null,
    description: loc.description,
    description_bg: null,
    category: loc.category,
    lat: loc.lat,
    lng: loc.lng,
    image_url: loc.image_url,
    is_active: true,
    created_at: new Date().toISOString(),
    address: loc.address,
    points: loc.points,
  };
}

/**
 * Returns landmarks from Supabase merged with the bundled local dataset.
 * Bundled data ensures the page is always populated even without a DB sync.
 * DB rows override bundled entries on matching id; new DB rows are appended.
 */
export const getLandmarks = async (): Promise<Landmark[]> => {
  const byId = new Map<string, Landmark>();

  // 1. Seed from bundled local data
  for (const loc of PLOVDIV_LOCATIONS) byId.set(loc.id, locationToLandmark(loc));

  // 2. Overlay with Supabase rows (best-effort)
  try {
    const { data } = await supabase
      .from('landmarks')
      .select('*')
      .eq('is_active', true)
      .order('name');

    for (const row of (data ?? []) as Landmark[]) {
      const existing = byId.get(row.id);
      const bundledMatch = PLOVDIV_LOCATIONS.find(l => l.id === row.id);
      byId.set(row.id, {
        ...locationToLandmark(
          bundledMatch ?? ({
            id: row.id, name: row.name, lat: row.lat, lng: row.lng,
            category: row.category, isSight: true,
            description: row.description ?? '', points: (row as any).points ?? 50,
            xp_reward: (row as any).points ?? 50,
            image_url: row.image_url ?? '',
            address: (row as any).address ?? '',
          } as any)
        ),
        ...row,
        address: (row as any).address ?? existing?.address ?? null,
        points: (row as any).points ?? existing?.points ?? 50,
      });
    }
  } catch {
    // offline / no DB — bundled data serves the UI
  }

  return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name));
};

export const getLandmarkById = async (id: string): Promise<Landmark | null> => {
  const bundled = PLOVDIV_LOCATIONS.find(l => l.id === id);
  try {
    const { data } = await supabase.from('landmarks').select('*').eq('id', id).single();
    if (data) return { ...locationToLandmark(bundled ?? {} as any), ...data };
  } catch { /* offline */ }
  return bundled ? locationToLandmark(bundled) : null;
};
