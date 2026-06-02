import { motion } from 'framer-motion';
import type { PartnerBusiness } from '../../types';

interface WaypointListProps {
  waypoints: PartnerBusiness[];
  checkedWaypoints: string[];
  onWaypointClick: (waypoint: PartnerBusiness) => void;
  nextWaypointId?: string | null;
}

const categoryEmoji: Record<string, string> = {
  cafe: '☕',
  museum: '🏛️',
  cultural: '🕌',
  bar: '🍺',
  shop: '🛍️',
};

export function WaypointList({
  waypoints,
  checkedWaypoints,
  onWaypointClick,
  nextWaypointId,
}: WaypointListProps) {
  return (
    <div className="space-y-3">
      {waypoints.map((waypoint, index) => {
        const isChecked = checkedWaypoints.includes(waypoint.id);
        const isNext = waypoint.id === nextWaypointId;
        const emoji = categoryEmoji[waypoint.category] || '📍';

        return (
          <motion.div
            key={waypoint.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <button
              onClick={() => onWaypointClick(waypoint)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                isChecked
                  ? 'bg-green-500/20 border border-green-500/30'
                  : isNext
                  ? 'bg-waygo-teal/20 border border-waygo-teal/50'
                  : 'bg-waygo-darkLight border border-gray-700 hover:border-gray-600'
              }`}
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${
                isChecked ? 'bg-green-500' : isNext ? 'bg-waygo-teal' : 'bg-gray-700'
              }`}>
                {isChecked ? '✓' : emoji}
              </div>

              <div className="flex-1 text-left">
                <h4 className={`font-medium ${isChecked ? 'text-green-400' : 'text-white'}`}>
                  {waypoint.name}
                </h4>
                <p className="text-xs text-gray-400">{waypoint.address}</p>
              </div>

              {isNext && !isChecked && (
                <div className="px-2 py-1 bg-waygo-teal rounded-full text-xs text-white font-medium">
                  Next
                </div>
              )}
            </button>
          </motion.div>
        );
      })}
    </div>
  );
}