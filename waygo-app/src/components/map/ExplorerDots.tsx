import { AdvancedMarker } from '@vis.gl/react-google-maps';

interface ExplorerDot {
  id: string;
  name: string;
  lat: number;
  lng: number;
  avatar: string;
}

interface ExplorerDotsProps {
  explorers: ExplorerDot[];
  onExplorerClick?: (explorer: ExplorerDot) => void;
}

export function ExplorerDots({ explorers, onExplorerClick }: ExplorerDotsProps) {
  return (
    <>
      {explorers.map((explorer) => (
        <AdvancedMarker
          key={explorer.id}
          position={{ lat: explorer.lat, lng: explorer.lng }}
          onClick={() => onExplorerClick?.(explorer)}
        >
          <div className="relative group">
            <div className="w-6 h-6 rounded-full bg-waygo-teal border-2 border-white flex items-center justify-center text-[10px] font-bold text-white shadow-lg animate-bounce-subtle">
              {explorer.avatar.charAt(0)}
            </div>
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-white rounded text-xs text-gray-800 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
              {explorer.name}
            </div>
          </div>
        </AdvancedMarker>
      ))}
    </>
  );
}