import { motion } from 'framer-motion';
import type { PartnerBusiness } from '../../types';
import { formatDistance } from '../../utils/geo';

interface ExploreCarouselProps {
  businesses: PartnerBusiness[];
  userLocation: { lat: number; lng: number };
  onSelect: (business: PartnerBusiness) => void;
}

const categoryEmoji: Record<string, string> = {
  cafe: '☕',
  museum: '🏛️',
  cultural: '🕌',
  bar: '🍺',
  shop: '🛍️',
};

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3;
  const φ1 = lat1 * (Math.PI / 180);
  const φ2 = lat2 * (Math.PI / 180);
  const Δφ = (lat2 - lat1) * (Math.PI / 180);
  const Δλ = (lng2 - lng1) * (Math.PI / 180);
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function ExploreCarousel({ businesses, userLocation, onSelect }: ExploreCarouselProps) {
  const sortedBusinesses = [...businesses].sort((a, b) => {
    const distA = haversineDistance(userLocation.lat, userLocation.lng, a.lat, a.lng);
    const distB = haversineDistance(userLocation.lat, userLocation.lng, b.lat, b.lng);
    return distA - distB;
  }).slice(0, 10);

  return (
    <div className="absolute bottom-36 left-0 right-0 z-10">
      <div className="px-4 mb-2">
        <h3 className="text-sm font-medium text-gray-300">Explore Nearby</h3>
      </div>
      <div className="overflow-x-auto scrollbar-hide px-4 pb-2">
        <div className="flex gap-3">
          {sortedBusinesses.map((business, index) => {
            const distance = haversineDistance(userLocation.lat, userLocation.lng, business.lat, business.lng);

            return (
              <motion.button
                key={business.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onSelect(business)}
                className="flex-shrink-0 w-40 rounded-xl shadow-lg overflow-hidden text-left" style={{background:"var(--bg-card)"}}
              >
                <div className="h-20 bg-gradient-to-br from-[#F0F0FF] to-[#E8E8FF] flex items-center justify-center text-3xl">
                  {categoryEmoji[business.category] || '📍'}
                </div>
                <div className="p-3">
                  <h4 className="font-semibold text-sm truncate" style={{color:"var(--text-primary)"}}>{business.name}</h4>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDistance(distance)}
                  </p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}