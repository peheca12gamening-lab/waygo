import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap } from 'react-leaflet';
import L from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { Crosshair } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import type { PartnerBusiness, CategoryFilter, ExploredTile } from '../types';
import { fetchBusinesses } from '../data/mockApi';
import { DEMO_EXPLORERS } from '../data/seed';
import { formatDistance } from '../utils/geo';
import { SearchBar, CategoryChips, ExploreCarousel, PlaceCard } from '../components/ui';
import { useFogOfWarCanvas } from '../components/map/FogOfWarOverlay';
import { NavigationModal } from '../components/map/NavigationModal';
import { useUI } from '../context/UIContext';
import { useApp } from '../context/AppContext';

// ── White (light) map tiles ──────────────────────────────────────────────────
const LIGHT_MAP_TILES = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
const DARK_MAP_TILES  = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const PLOVDIV_CENTER: [number, number] = [42.1354, 24.7453];
const DEFAULT_ZOOM = 14;

// ── Category config ──────────────────────────────────────────────────────────
const categoryMeta: Record<string, { emoji: string; color: string }> = {
  cafe:     { emoji: '☕', color: '#FF90B5' },
  museum:   { emoji: '🏛️', color: '#7AC8FF' },
  cultural: { emoji: '🕌', color: '#78E8C8' },
  bar:      { emoji: '🍺', color: '#FFB878' },
  shop:     { emoji: '🛍️', color: '#B090FF' },
};

function createCustomIcon(category: string, isSelected: boolean, isFeatured: boolean) {
  const meta = categoryMeta[category] || { emoji: '📍', color: '#B090FF' };
  const size = isSelected ? 46 : 38;
  const shadow = isSelected ? `0 6px 20px ${meta.color}88` : '0 4px 14px rgba(0,0,0,0.18)';
  const border = isSelected ? '3px solid white' : '2.5px solid white';
  const html = `
    <div style="width:${size}px;height:${size}px;background:${meta.color};
      border:${border};border-radius:50%;display:flex;align-items:center;
      justify-content:center;font-size:${size*0.42}px;box-shadow:${shadow};position:relative;">
      ${meta.emoji}
      ${isFeatured ? `<span style="position:absolute;top:-7px;right:-7px;font-size:13px;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.2))">⭐</span>` : ''}
    </div>`;
  return L.divIcon({ html, className: 'custom-marker', iconSize: [size, size], iconAnchor: [size/2, size/2] });
}

function createUserArrowIcon() {
  const html = `<div style="width:44px;height:44px;display:flex;align-items:center;justify-content:center;filter:drop-shadow(0 4px 14px rgba(80,100,255,0.5))">
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

// ── Map Controller (gives us the map ref for re-centering) ───────────────────
function MapController({ onReady }: { onReady: (map: L.Map) => void }) {
  const map = useMap();
  useEffect(() => { onReady(map); }, [map, onReady]);
  return null;
}

function MapEvents() {
  useMapEvents({ moveend: () => {}, zoomend: () => {} });
  return null;
}

// ── Explorer profile popup ───────────────────────────────────────────────────
function ExplorerProfile({ explorer, index, onClose }: { explorer: typeof DEMO_EXPLORERS[0]; index: number; onClose: () => void }) {
  const colors = ['#FF90B5', '#B090FF', '#7AC8FF', '#78E8C8', '#FFB878'];
  const color = colors[index % colors.length];
  return (
    <motion.div initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 10 }}
      className="absolute top-32 left-4 right-4 z-40 rounded-2xl p-4"
      style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(20px)', border: '1.5px solid #E8E8F8', boxShadow: '0 8px 32px rgba(176,144,255,0.2)' }}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg" style={{ background: color }}>
            {explorer.name.charAt(0)}
          </div>
          <div>
            <p className="text-waygo-text font-bold">{explorer.name}</p>
            <p className="text-waygo-textSoft text-xs">Explorer · Active now</p>
          </div>
        </div>
        <button onClick={onClose} className="text-waygo-textSoft text-lg leading-none w-7 h-7 flex items-center justify-center rounded-full"
          style={{ background: '#EAEAF8' }}>✕</button>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        {[['12', 'Check-ins'], ['Lv.4', 'Level'], ['🔥5', 'Streak']].map(([val, label]) => (
          <div key={label} className="rounded-xl p-2 text-center" style={{ background: '#F5F5FF' }}>
            <p className="font-bold text-base" style={{ color }}>{val}</p>
            <p className="text-waygo-textSoft text-xs">{label}</p>
          </div>
        ))}
      </div>
      <button className="w-full py-2 rounded-xl text-sm font-bold"
        style={{ background: `${color}18`, color, border: `1.5px solid ${color}44` }}>+ Add Friend</button>
    </motion.div>
  );
}

// ── Main map content ─────────────────────────────────────────────────────────
function MapPageContent({ businesses, onBusinessSelect, selectedBusiness, onCheckIn, tiles, showExplorers, onMapReady }: {
  businesses: PartnerBusiness[];
  onBusinessSelect: (b: PartnerBusiness | null) => void;
  selectedBusiness: PartnerBusiness | null;
  onCheckIn: (b: PartnerBusiness) => void;
  tiles: ExploredTile[];
  showExplorers: boolean;
  onMapReady: (map: L.Map) => void;
}) {
  const { darkMode } = useApp();
  const [category, setCategory] = useState<CategoryFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExplorer, setSelectedExplorer] = useState<{ explorer: typeof DEMO_EXPLORERS[0]; index: number } | null>(null);
  const [mapInst, setMapInst] = useState<L.Map | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const userPos: [number, number] = [42.1420, 24.7490];

  // Unused tiles arg kept for FogOfWar hook signature
  useFogOfWarCanvas(mapRef, mapInst, tiles, false); // fog disabled for light map

  const handleMapReady = useCallback((m: L.Map) => {
    setMapInst(m);
    onMapReady(m);
  }, [onMapReady]);

  const filteredBusinesses = useMemo(() => {
    let result = businesses;
    if (category !== 'all') {
      result = category === 'featured'
        ? result.filter(b => b.subscription_tier === 'featured')
        : result.filter(b => b.category === category);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(b => b.name.toLowerCase().includes(q) || b.category.toLowerCase().includes(q));
    }
    return result;
  }, [businesses, category, searchQuery]);

  const distanceToBusiness = useCallback((business: PartnerBusiness) => {
    const R = 6371e3;
    const lat1 = userPos[0] * Math.PI / 180;
    const lat2 = business.lat * Math.PI / 180;
    const dLat = (business.lat - userPos[0]) * Math.PI / 180;
    const dLng = (business.lng - userPos[1]) * Math.PI / 180;
    const a = Math.sin(dLat/2)**2 + Math.cos(lat1)*Math.cos(lat2)*Math.sin(dLng/2)**2;
    return formatDistance(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  }, [userPos]);

  const handleMarkerClick = useCallback((business: PartnerBusiness) => {
    onBusinessSelect(business);
    setSelectedExplorer(null);
    if (mapInst) mapInst.setView([business.lat, business.lng], 16, { animate: true });
  }, [mapInst, onBusinessSelect]);

  const handleBusinessSelect = useCallback((business: PartnerBusiness) => {
    onBusinessSelect(business);
    setSelectedExplorer(null);
    if (mapInst) mapInst.setView([business.lat, business.lng], 16);
  }, [mapInst, onBusinessSelect]);

  return (
    <div className="relative w-full h-screen">
      {/* Map + rainbow overlay */}
      <div ref={mapRef} className="absolute inset-0 z-0">
        <MapContainer center={PLOVDIV_CENTER} zoom={DEFAULT_ZOOM}
          style={{ width: '100%', height: '100%' }} zoomControl={false} attributionControl={false}>
          <TileLayer url={darkMode ? DARK_MAP_TILES : LIGHT_MAP_TILES} attribution="" />
          <MapController onReady={handleMapReady} />
          <MapEvents />

          {/* User location 3D arrow */}
          <Marker position={userPos} icon={createUserArrowIcon()} />

          {filteredBusinesses.map((business) => (
            <Marker key={business.id} position={[business.lat, business.lng]}
              icon={createCustomIcon(business.category, selectedBusiness?.id === business.id, business.subscription_tier === 'featured')}
              eventHandlers={{ click: () => handleMarkerClick(business) }}>
              <Popup className="waygo-popup">
                <div className="p-3 min-w-[150px]">
                  <h3 className="font-bold text-sm text-waygo-text">{business.name}</h3>
                  <p className="text-xs text-waygo-textSoft mt-1">{distanceToBusiness(business)} away</p>
                </div>
              </Popup>
            </Marker>
          ))}

          {showExplorers && DEMO_EXPLORERS.map((explorer, i) => (
            <Marker key={explorer.id} position={[explorer.lat, explorer.lng]}
              icon={createExplorerIcon(explorer.name, i)}
              eventHandlers={{ click: () => { setSelectedExplorer({ explorer, index: i }); onBusinessSelect(null); } }} />
          ))}
        </MapContainer>

        {/* Rainbow gradient overlay on the map (like the reference image) */}
        <div className="absolute inset-0 pointer-events-none z-10"
          style={{
            background: 'radial-gradient(ellipse 70% 50% at 30% 40%, rgba(255,176,200,0.22) 0%, transparent 60%),' +
              'radial-gradient(ellipse 60% 55% at 70% 30%, rgba(200,160,255,0.18) 0%, transparent 60%),' +
              'radial-gradient(ellipse 50% 60% at 50% 70%, rgba(120,232,200,0.16) 0%, transparent 60%),' +
              'radial-gradient(ellipse 55% 45% at 80% 70%, rgba(120,200,255,0.15) 0%, transparent 60%)',
            mixBlendMode: 'multiply',
          }} />
      </div>

      {/* Search bar */}
      <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search places in Plovdiv..." />
      {/* Category chips */}
      <CategoryChips selected={category} onSelect={setCategory} />

      {/* Explorer profile popup */}
      <AnimatePresence>
        {selectedExplorer && (
          <ExplorerProfile explorer={selectedExplorer.explorer} index={selectedExplorer.index} onClose={() => setSelectedExplorer(null)} />
        )}
      </AnimatePresence>

      {/* Place card popup from bottom */}
      <AnimatePresence>
        {selectedBusiness && (
          <motion.div initial={{ y: 400 }} animate={{ y: 0 }} exit={{ y: 400 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="absolute bottom-36 left-4 right-4 z-30">
            <div className="rounded-2xl p-4"
              style={{ background: 'rgba(255,255,255,0.97)', backdropFilter: 'blur(24px)', border: '1.5px solid #E8E8F8', boxShadow: '0 8px 32px rgba(176,144,255,0.18)' }}>
              <PlaceCard
                name={selectedBusiness.name}
                category={selectedBusiness.category}
                distance={distanceToBusiness(selectedBusiness)}
                description={selectedBusiness.description}
                address={selectedBusiness.address}
                checkinCount={selectedBusiness.total_checkins}
                onCheckIn={() => onCheckIn(selectedBusiness)}
                isExpanded={true}
                onToggleExpand={() => {}}
                onClose={() => onBusinessSelect(null)}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Explore Nearby carousel + re-centre button above it */}
      {!selectedBusiness && (
        <>
          {/* Re-centre button – sits just above the carousel */}
          <div className="absolute bottom-52 right-4 z-20">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => {
                if (mapInst) {
                  mapInst.setView(userPos, 16, { animate: true });
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
            businesses={businesses}
            userLocation={{ lat: userPos[0], lng: userPos[1] }}
            onSelect={handleBusinessSelect}
          />
        </>
      )}
    </div>
  );
}

// ── Page wrapper ─────────────────────────────────────────────────────────────
export function MapPage() {
  const [businesses, setBusinesses] = useState<PartnerBusiness[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<PartnerBusiness | null>(null);
  const [navigationTarget, setNavigationTarget] = useState<PartnerBusiness | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const { openModal, closeModal } = useUI();

  const [tiles] = useState<ExploredTile[]>([
    { id: '1', user_id: 'demo', center_lat: 42.1430, center_lng: 24.7490, radius_meters: 150, revealed_date: '2024-01-01' },
    { id: '2', user_id: 'demo', center_lat: 42.1420, center_lng: 24.7500, radius_meters: 150, revealed_date: '2024-01-02' },
    { id: '3', user_id: 'demo', center_lat: 42.1415, center_lng: 24.7480, radius_meters: 150, revealed_date: '2024-01-03' },
  ]);

  useEffect(() => { fetchBusinesses().then(setBusinesses); }, []);

  const handleCheckIn = useCallback((business: PartnerBusiness) => {
    setNavigationTarget(business);
    setSelectedBusiness(null);
    openModal(); // hide bottom nav while navigating
  }, [openModal]);

  const handleNavClose = useCallback(() => {
    setNavigationTarget(null);
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
          onMapReady={(m) => { mapRef.current = m; }}
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
