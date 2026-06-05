const ORS_API_KEY = import.meta.env.VITE_ORS_API_KEY ?? '';
const ORS_BASE = 'https://api.openrouteservice.org/v2/directions/foot-walking';

export interface RouteResult {
  coordinates: [number, number][]; // [lat, lng] pairs
  distance: number; // meters
  duration: number; // seconds
}

export async function fetchRoute(
  origin: [number, number],
  destination: [number, number]
): Promise<RouteResult | null> {
  if (!ORS_API_KEY) return null;

  try {
    const url = `${ORS_BASE}?api_key=${ORS_API_KEY}&start=${origin[1]},${origin[0]}&end=${destination[1]},${destination[0]}`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = await res.json();
    const feature = data?.features?.[0];
    if (!feature) return null;

    const coords = feature.geometry?.coordinates as [number, number][] | undefined;
    if (!coords) return null;

    // ORS returns [lng, lat] — flip to [lat, lng] for Leaflet
    const latLngCoords: [number, number][] = coords.map((c: [number, number]) => [c[1], c[0]]);

    const summary = feature.properties?.summary ?? {};
    return {
      coordinates: latLngCoords,
      distance: summary.distance ?? 0,
      duration: summary.duration ?? 0,
    };
  } catch {
    return null;
  }
}

export function formatDuration(seconds: number): string {
  const mins = Math.round(seconds / 60);
  if (mins < 60) return `~${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m > 0 ? `~${h}h ${m}min` : `~${h}h`;
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)} m`;
  return `${(meters / 1000).toFixed(1)} km`;
}
