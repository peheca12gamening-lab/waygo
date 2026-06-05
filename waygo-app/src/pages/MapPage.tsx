import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
// Direct-path navigation (no external routing API required per spec)
function walkingTime(distanceM: number): string {
  const mins = Math.round(distanceM / (5000 / 60));
  if (mins < 60) return `~${mins} min`;
  return `~${Math.floor(mins/60)}h ${mins%60}m`;
}
function fmtDist(m: number): string {
  return m < 1000 ? `${Math.round(m)} m` : `${(m/1000).toFixed(1)} km`;
}
import { motion, AnimatePresence } from 'framer-motion';
import { Crosshair, Navigation } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import type { Business, CategoryFilter, ExploredTile } from '../types';
import { getBusinesses, getOnlineUsers, getQuestStopsByBusinessIds } from '../lib/db';
import { haversine, formatDistance } from '../utils/geo';
import { SearchBar, CategoryChips, ExploreCarousel, PlaceCard } from '../components/ui';
import { useFogOfWarCanvas } from '../components/map/FogOfWarOverlay';
import { NavigationModal } from '../components/map/NavigationModal';
import { ExplorerProfile } from '../components/map/ExplorerProfile';
import { useWatchPosition } from '../hooks/useWatchPosition';
import { useUI } from '../context/UIContext';
import { useApp } from '../context/AppContext';
import { useQuest } from '../hooks/useQuest';

const LIGHT_MAP_TILES = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
const DARK_MAP_TILES  = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const PLOVDIV_CENTER: [number, number] = [42.1354, 24.7453];
const DEFAULT_ZOOM = 14;

const CATEGORY_SVG: Record<string, string> = {
  cafe: '<svg viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M2 21v-2h18v2zm1.5-4q-.625 0-1.062-.438T2 15.5V5h18q.825 0 1.413.588T22 7v3q0 .825-.587 1.413T20 12h-2v3.5q0 .625-.437 1.063T16.5 17zm.5-2h11V7H4zM18 12h2V7h-2z"/></svg>',
  museum: '<svg viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M12 2L2 7v1h20V7zm-1 4h2v2h-2zm-3 0h2v2H8zm9 0h2v2h-2zM4 10v8H2v2h20v-2h-2v-8h-2v8h-3v-8h-2v8H8v-8H6v8H4v-8z"/></svg>',
  cultural: '<svg viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93s3.05-7.44 7-7.93v15.86zm2 0V4.07c3.95.49 7 3.85 7 7.93s-3.05 7.44-7 7.93z"/></svg>',
  bar: '<svg viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M7 2l1 6h2L7 2M11 2l1 6h2l-3-6M15 2l1 6h2l-3-6M5 10v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V10H5zm12 10H7v-6h10v6z"/></svg>',
  shop: '<svg viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM5.07 5l1.34 5H19.6l1.26-5H5.07zM4.16 3h16.68c.75 0 1.24.78.94 1.46l-2.1 7.98c-.15.56-.66.96-1.24.96H6.56c-.58 0-1.09-.4-1.24-.96L2.22 4.46C1.92 3.78 2.41 3 3.16 3z"/></svg>',
};

function createCustomIcon(category: string, isSelected: boolean, isFeatured: boolean, isQuestStop = false, isSight = false) {
  const colorMeta: Record<string, string> = {
    cafe: '#FF90B5', museum: '#7AC8FF', cultural: '#78E8C8', bar: '#FFB878', shop: '#B090FF',
  };
  const color = colorMeta[category] || '#B090FF';
  const svg = CATEGORY_SVG[category] || CATEGORY_SVG.shop;
  const size = isSelected ? 46 : 38;
  const shadow = isSelected ? `0 6px 20px ${color}88` : '0 4px 14px rgba(0,0,0,0.18)';
  const border = isSelected ? '3px solid white' : isQuestStop ? '2.5px solid #FFD700' : '2.5px solid white';
  const badge = isFeatured ? `<span style="position:absolute;top:-7px;left:50%;transform:translateX(-50%);font-size:13px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.2))">⭐</span>` : '';
  const sightBadge = !isFeatured && isSight ? `<span style="position:absolute;top:-7px;right:-7px;font-size:11px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))">⭐</span>` : '';
  const bizBadge = !isFeatured && !isSight && !isQuestStop ? `<span style="position:absolute;top:-7px;right:-7px;font-size:10px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))">🏢</span>` : '';
  const questBadge = isQuestStop ? `<span style="position:absolute;bottom:-2px;right:-2px;font-size:11px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3))">⚔️</span>` : '';
  const html = `
    <div style="width:${size}px;height:${size}px;background:${color};
      border:${border};border-radius:50%;display:flex;align-items:center;
      justify-content:center;box-shadow:${shadow};position:relative;">
      ${svg}
      ${badge}${sightBadge}${bizBadge}${questBadge}
    </div>`;
  return L.divIcon({ html, className: 'custom-marker', iconSize: [size, size], iconAnchor: [size/2, size/2] });
}

function createUserArrowIcon(heading?: number) {
  const rotate = heading !== undefined ? `transform:rotate(${heading}deg)` : '';
  const html = `<div style="width:44px;height:44px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 4px 14px rgba(80,100,255,0.5));${rotate}">
    <img src="/arrow.png" style="width:44px;height:44px;object-fit:contain;" />
  </div>`;
  return L.divIcon({ html, className: 'user-arrow-marker', iconSize: [44, 44], iconAnchor: [22, 22] });
}

function createExplorerIcon(name: string, index: number) {
  const colors = ['#FF90B5', '#B090FF', '#7AC8FF', '#78E8C8', '#FFB878'];
  const color = colors[index % colors.length];
  const html = `<div style="width:30px;height:30px;background:${color};border:2.5px solid white;
    border-radius:50%;display:flex;align-items:center;justify-content:center;
    font-size:12px;font-weight:bold;color:white;box-shadow:0 3px 10px ${color}66;cursor:pointer;">
    ${name.charAt(0)}</div>`;
  return L.divIcon({ html, className: 'explorer-marker', iconSize: [30, 30], iconAnchor: [15, 15] });
}

function MapController({ onReady }: { onReady: (map: L.Map) => void }) {
  const map = useMap();
  useEffect(() => { onReady(map); }, [map, onReady]);
  return null;
}

function MapEvents() {
  useMapEvents({ moveend: () => {}, zoomend: () => {} });
  return null;
}

function MapPageContent({ businesses, onBusinessSelect, selectedBusiness, onCheckIn, tiles, showExplorers, onMapReady, explorers, livePosition, routeTarget, onClearRoute, onStartChat, questBusinessMap }: {
  businesses: Business[];
  onBusinessSelect: (b: Business | null) => void;
  selectedBusiness: Business | null;
  onCheckIn: (b: Business) => void;
  tiles: ExploredTile[];
  showExplorers: boolean;
  onMapReady: (map: L.Map) => void;
  explorers: { user_id: string; full_name: string; lat: number; lng: number }[];
  livePosition: [number, number];
  routeTarget: Business | null;
  onClearRoute: () => void;
  onStartChat?: (userId: string, userName: string) => void;
  questBusinessMap?: Record<string, { questId: string; questTitle: string }[]>;
}) {
  const { activateQuestFromMap, isActive } = useQuest();
  const [questActivated, setQuestActivated] = useState<string | null>(null);
  const { darkMode, t } = useApp();
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExplorer, setSelectedExplorer] = useState<{ explorer: { user_id: string; full_name: string; lat: number; lng: number }; index: number } | null>(null);
  const [mapInst, setMapInst] = useState<L.Map | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const [routePolyline, setRoutePolyline] = useState<L.Polyline | null>(null);
  const [pulsingDot, setPulsingDot] = useState<L.CircleMarker | null>(null);
  const pulseIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [arrived, setArrived] = useState(false);

  useFogOfWarCanvas(mapRef, mapInst, tiles, false);

  const clearRoute = useCallback(() => {
    if (routePolyline && mapInst) { mapInst.removeLayer(routePolyline); setRoutePolyline(null); }
    if (pulsingDot && mapInst) { mapInst.removeLayer(pulsingDot); setPulsingDot(null); }
    if (pulseIntervalRef.current) { clearInterval(pulseIntervalRef.current); pulseIntervalRef.current = null; }
    setArrived(false);
  }, [routePolyline, pulsingDot, mapInst]);

  // Direct geodesic polyline — redrawn whenever user position or target changes
  useEffect(() => {
    if (!routeTarget || !mapInst) { clearRoute(); return; }

    // Remove previous layers
    if (routePolyline) mapInst.removeLayer(routePolyline);
    if (pulsingDot) mapInst.removeLayer(pulsingDot);
    if (pulseIntervalRef.current) clearInterval(pulseIntervalRef.current);

    const from: [number, number] = livePosition;
    const to: [number, number] = [routeTarget.lat, routeTarget.lng];
    const distToTarget = haversine(from[0], from[1], to[0], to[1]);

    // Blue geodesic line
    const line = L.polyline([from, to], { color: '#3B82F6', weight: 5, opacity: 0.85 }).addTo(mapInst);
    setRoutePolyline(line);
    mapInst.fitBounds(line.getBounds(), { padding: [60, 60], maxZoom: 16, animate: true });

    // Pulsing blue GPS dot
    const dot = L.circleMarker(from, {
      radius: 8, color: '#3B82F6', fillColor: '#3B82F6', fillOpacity: 1, weight: 3,
    }).addTo(mapInst);
    setPulsingDot(dot);

    let grow = true;
    pulseIntervalRef.current = setInterval(() => {
      const r = dot.getRadius();
      dot.setRadius(grow ? Math.min(r + 0.5, 12) : Math.max(r - 0.5, 6));
      if (r >= 12 || r <= 6) grow = !grow;
    }, 80);

    // Check arrival
    if (distToTarget < 50) setArrived(true);

    // Recenter map on user
    mapInst.setView(from, mapInst.getZoom(), { animate: true });

    return () => {
      if (pulseIntervalRef.current) clearInterval(pulseIntervalRef.current);
    };
  }, [mapInst, routeTarget, livePosition]);

  const handleMapReady = useCallback((m: L.Map) => {
    setMapInst(m);
    onMapReady(m);
  }, [onMapReady]);

  const filteredBusinesses = useMemo(() => {
    let result = businesses;
    if (category !== 'all') {
      result = category === 'featured'
        ? result.filter(b => b.subscription_tier === 'featured')
        : result.filter(b => b.category_slug === category);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(b => b.name.toLowerCase().includes(q) || b.category_slug.toLowerCase().includes(q));
    }
    return result;
  }, [businesses, category, searchQuery]);

  const liveDistance = useCallback((business: Business) => {
    const d = haversine(livePosition[0], livePosition[1], business.lat, business.lng);
    return formatDistance(d);
  }, [livePosition]);

  const handleMarkerClick = useCallback((business: Business) => {
    onBusinessSelect(business);
    setSelectedExplorer(null);
    if (mapInst) mapInst.setView([business.lat, business.lng], 16, { animate: true });
  }, [mapInst, onBusinessSelect]);

  const handleBusinessSelect = useCallback((business: Business) => {
    onBusinessSelect(business);
    setSelectedExplorer(null);
    if (mapInst) mapInst.setView([business.lat, business.lng], 16);
  }, [mapInst, onBusinessSelect]);

  return (
    <div className="relative w-full h-screen">
      <div ref={mapRef} className="absolute inset-0 z-0">
        <MapContainer center={PLOVDIV_CENTER} zoom={DEFAULT_ZOOM}
          style={{ width: '100%', height: '100%' }} zoomControl={false} attributionControl={false}>
          <TileLayer url={darkMode ? DARK_MAP_TILES : LIGHT_MAP_TILES} attribution="" />
          <MapController onReady={handleMapReady} />
          <MapEvents />

          <Marker position={livePosition} icon={createUserArrowIcon()} />

          {filteredBusinesses.map((business) => {
            const questsHere = questBusinessMap?.[business.id];
            const isQuestStop = !!questsHere && questsHere.length > 0;
            return <Marker key={business.id} position={[business.lat, business.lng]}
              icon={createCustomIcon(business.category_slug, selectedBusiness?.id === business.id, business.subscription_tier === 'featured', isQuestStop, business.is_sight)}
              eventHandlers={{ click: () => handleMarkerClick(business) }}>
              <Popup className="waygo-popup">
                <div className="p-3 min-w-[150px]">
                  <h3 className="font-bold text-sm text-waygo-text">{business.name}</h3>
                  <p className="text-xs text-waygo-textSoft mt-1">{liveDistance(business)} away</p>
                </div>
              </Popup>
            </Marker>;
          })}

          {showExplorers && explorers.map((explorer, i) => (
            <Marker key={explorer.user_id} position={[explorer.lat, explorer.lng]}
              icon={createExplorerIcon(explorer.full_name, i)}
              eventHandlers={{ click: () => { setSelectedExplorer({ explorer, index: i }); onBusinessSelect(null); } }} />
          ))}
        </MapContainer>

        <div className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: 'radial-gradient(ellipse 70% 50% at 30% 40%, rgba(255,176,200,0.22) 0%, transparent 60%),' +
              'radial-gradient(ellipse 60% 55% at 70% 30%, rgba(200,160,255,0.18) 0%, transparent 60%),' +
              'radial-gradient(ellipse 50% 60% at 50% 70%, rgba(120,232,200,0.16) 0%, transparent 60%),' +
              'radial-gradient(ellipse 55% 45% at 80% 70%, rgba(120,200,255,0.15) 0%, transparent 60%)',
            mixBlendMode: 'multiply',
          }} />
      </div>

      <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder={t.searchPlaces} />
      <CategoryChips selected={category} onSelect={setCategory} />

      {routeTarget && (
        <>
          <button onClick={onClearRoute}
            className="absolute top-20 right-4 z-20 px-4 py-2 rounded-xl text-sm font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#FF6080,#B090FF)', boxShadow: '0 4px 12px rgba(176,144,255,0.3)' }}>
            ✕ {t.close}
          </button>

          {/* Navigation banner */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="absolute bottom-8 left-4 right-4 z-30"
          >
            {(() => {
              const distM = haversine(livePosition[0], livePosition[1], routeTarget.lat, routeTarget.lng);
              return arrived ? (
                <div className="rounded-2xl p-4" style={{
                  background: 'linear-gradient(135deg,#E8FFF5,#E0F8FF)', backdropFilter: 'blur(24px)',
                  border: '1.5px solid #78E8C8', boxShadow: '0 8px 32px rgba(120,232,200,0.3)'
                }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-black text-sm" style={{ color: '#00A090' }}>✅ You've arrived at {routeTarget.name}!</p>
                      <p className="text-xs mt-0.5" style={{ color: '#00A090' }}>Tap Check In below to earn XP</p>
                    </div>
                    <button onClick={() => onCheckIn(routeTarget as any)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white"
                      style={{ background: 'linear-gradient(135deg,#78E8C8,#00C8A0)' }}>
                      Check In
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl p-4" style={{
                  background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(24px)',
                  border: '1.5px solid #BFDBFE', boxShadow: '0 8px 32px rgba(59,130,246,0.18)'
                }}>
                  <div className="h-1 rounded-full mb-3" style={{ background: 'linear-gradient(90deg,#3B82F6,#60A5FA)' }} />
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm" style={{ color: '#1a1a2e' }}>{routeTarget.name}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-base font-black text-blue-600">{fmtDist(distM)}</span>
                        <span className="text-xs text-gray-500">{walkingTime(distM)}</span>
                      </div>
                    </div>
                    <button onClick={onClearRoute}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white"
                      style={{ background: '#EF4444' }}>
                      Stop
                    </button>
                  </div>
                </div>
              );
            })()}
          </motion.div>
        </>
      )}

      <AnimatePresence>
        {selectedExplorer && (
          <ExplorerProfile explorer={selectedExplorer.explorer} index={selectedExplorer.index} onClose={() => setSelectedExplorer(null)} onStartChat={onStartChat} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedBusiness && (
          <motion.div initial={{ y: 400 }} animate={{ y: 0 }} exit={{ y: 400 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="absolute bottom-28 left-4 right-4 z-30">
            <div className="rounded-2xl p-4"
              style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(24px)', border: '1.5px solid #E8E8F8', boxShadow: '0 8px 32px rgba(176,144,255,0.18)' }}>
              <PlaceCard
                name={selectedBusiness.name}
                category={selectedBusiness.category_slug}
                distance={liveDistance(selectedBusiness)}
                description={selectedBusiness.description ?? ''}
                address=""
                checkinCount={selectedBusiness.total_checkins}
                onCheckIn={() => onCheckIn(selectedBusiness)}
                isExpanded={true}
                onToggleExpand={() => {}}
                onClose={() => onBusinessSelect(null)}
                isSight={selectedBusiness.is_sight}
                xpReward={selectedBusiness.is_sight ? 50 : 0}
                imageUrl={selectedBusiness.cover_image_url ?? undefined}
              />
              {questBusinessMap?.[selectedBusiness.id]?.map((q, qi) => {
                const active = isActive(q.questId);
                return (
                <div key={qi} className="mt-2 px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between"
                  style={{ background: 'rgba(255,215,0,0.12)', border: '1px solid rgba(255,215,0,0.3)', color: '#B8960F' }}>
                  <span>⚔️ Quest: {q.questTitle}</span>
                  {!active && (
                    <button onClick={() => { activateQuestFromMap(q.questId); setQuestActivated(q.questId); setTimeout(() => setQuestActivated(null), 2500); }}
                      className="ml-2 px-2 py-1 rounded-lg text-xs font-bold text-white"
                      style={{ background: 'linear-gradient(135deg,#FF90B5,#B090FF)' }}>
                      Accept
                    </button>
                  )}
                  {active && <span className="text-xs text-green-600">Active</span>}
                </div>
              );})}
              {questActivated && (
                <div className="mt-1 text-center text-xs font-semibold text-green-600">
                  ✓ Quest accepted — check your profile to track progress!
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {!selectedBusiness && !routeTarget && (
        <>
          <div className="absolute bottom-72 right-4 z-20">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                if (mapInst) {
                  mapInst.flyTo(livePosition, 16, { animate: true });
                }
              }}
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(16px)',
                boxShadow: '0 4px 16px rgba(176,144,255,0.28)',
                border: '1.5px solid #E0E0F5',
              }}
            >
              <Crosshair size={22} style={{ color: '#B090FF' }} />
            </motion.button>
          </div>
          <ExploreCarousel
            businesses={businesses as any}
            userLocation={{ lat: livePosition[0], lng: livePosition[1] }}
            onSelect={handleBusinessSelect as any}
          />
        </>
      )}

      {routeTarget && !selectedBusiness && (
        <div className="absolute bottom-28 left-4 right-4 z-20">
          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={() => onCheckIn(routeTarget)}
            className="w-full py-4 rounded-2xl text-white font-bold flex items-center justify-center gap-2"
            style={{ background: 'linear-gradient(135deg,#FF90B5,#B090FF,#7AC8FF)', boxShadow: '0 6px 24px rgba(176,144,255,0.4)' }}>
            <Navigation size={20} /> {t.checkIn}
          </motion.button>
        </div>
      )}
    </div>
  );
}

export function MapPage() {
  const navigate = useNavigate();
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [navigationTarget, setNavigationTarget] = useState<Business | null>(null);
  const [routeTarget, setRouteTarget] = useState<Business | null>(null);
  const [explorers, setExplorers] = useState<{ user_id: string; full_name: string; lat: number; lng: number }[]>([]);
  const [questBusinessMap, setQuestBusinessMap] = useState<Record<string, { questId: string; questTitle: string }[]>>({});
  const mapRef = useRef<L.Map | null>(null);
  const { openModal, closeModal } = useUI();
  const { position: livePosition } = useWatchPosition();
  const handleStartChat = useCallback((_userId: string, _userName: string) => {
    navigate('/profile');
  }, [navigate]);

  const { data: businesses = [] } = useQuery({
    queryKey: ['businesses'],
    queryFn: getBusinesses,
    staleTime: 1000 * 60 * 2,
    refetchInterval: 1000 * 60 * 2,
  });

  // Fetch quest stops to show quest indicators on business markers
  useEffect(() => {
    getQuestStopsByBusinessIds().then(setQuestBusinessMap).catch(() => {});
  }, []);

  useEffect(() => {
    getOnlineUsers().then(data => setExplorers(data.map(u => ({ user_id: u.user_id, full_name: u.full_name, lat: u.lat, lng: u.lng }))));
    const interval = setInterval(() => {
      getOnlineUsers().then(data => setExplorers(data.map(u => ({ user_id: u.user_id, full_name: u.full_name, lat: u.lat, lng: u.lng }))));
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const [tiles] = useState<ExploredTile[]>([
    { id: '1', user_id: 'demo', center_lat: 42.1430, center_lng: 24.7490, radius_meters: 150, revealed_date: '2024-01-01' },
    { id: '2', user_id: 'demo', center_lat: 42.1420, center_lng: 24.7500, radius_meters: 150, revealed_date: '2024-01-02' },
    { id: '3', user_id: 'demo', center_lat: 42.1415, center_lng: 24.7480, radius_meters: 150, revealed_date: '2024-01-03' },
  ]);

  const handleCheckIn = useCallback((business: Business) => {
    setRouteTarget(business);
    setNavigationTarget(business);
    setSelectedBusiness(null);
    openModal();
  }, [openModal]);

  const handleNavClose = useCallback(() => {
    setNavigationTarget(null);
    setRouteTarget(null);
    closeModal();
  }, [closeModal]);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[430px] mx-auto relative">
        <MapPageContent
          businesses={businesses}
          onBusinessSelect={setSelectedBusiness}
          selectedBusiness={selectedBusiness}
          onCheckIn={handleCheckIn}
          tiles={tiles}
          showExplorers={true}
          explorers={explorers}
          onMapReady={(m) => { mapRef.current = m; }}
          livePosition={livePosition}
          routeTarget={routeTarget}
          onClearRoute={() => { setRouteTarget(null); setNavigationTarget(null); }}
          onStartChat={handleStartChat}
          questBusinessMap={questBusinessMap}
        />
        <AnimatePresence>
          {navigationTarget && (
            <NavigationModal
              business={navigationTarget}
              onClose={handleNavClose}
              onCheckedIn={handleNavClose}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
