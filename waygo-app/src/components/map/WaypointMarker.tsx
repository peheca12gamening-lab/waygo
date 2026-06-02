import { AdvancedMarker } from '@vis.gl/react-google-maps';
import type { PartnerBusiness } from '../../types';
import { CATEGORY_COLORS } from '../../utils/mapStyles';

interface WaypointMarkerProps {
  business: PartnerBusiness;
  isSelected: boolean;
  onClick: () => void;
  isFeatured?: boolean;
}

const categoryEmoji: Record<string, string> = {
  cafe: '☕',
  museum: '🏛️',
  cultural: '🕌',
  bar: '🍺',
  shop: '🛍️',
};

export function WaypointMarker({
  business,
  isSelected,
  onClick,
  isFeatured = false,
}: WaypointMarkerProps) {
  const color = CATEGORY_COLORS[business.category] || '#00D4C8';
  const emoji = categoryEmoji[business.category] || '📍';

  return (
    <AdvancedMarker
      position={{ lat: business.lat, lng: business.lng }}
      onClick={onClick}
      title={business.name}
    >
      <div className={`relative ${isFeatured ? 'animate-pulse-ring' : ''}`}>
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-lg transition-transform ${
            isSelected ? 'scale-125' : 'hover:scale-110'
          }`}
          style={{
            backgroundColor: color,
            boxShadow: isSelected
              ? `0 0 0 3px rgba(0, 212, 200, 0.4), 0 4px 12px rgba(0, 212, 200, 0.3)`
              : '0 4px 12px rgba(0, 0, 0, 0.3)',
          }}
        >
          <span>{emoji}</span>
        </div>
        {isFeatured && (
          <div
            className="absolute inset-0 rounded-full animate-ping"
            style={{
              backgroundColor: color,
              opacity: 0.3,
            }}
          />
        )}
        {isFeatured && (
          <div
            className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center text-[8px]"
          >
            ⭐
          </div>
        )}
      </div>
    </AdvancedMarker>
  );
}