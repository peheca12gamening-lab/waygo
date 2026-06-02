import { useEffect, useRef } from 'react';
import L from 'leaflet';
import type { ExploredTile } from '../../types';

export function useFogOfWarCanvas(
  mapContainerRef: React.RefObject<HTMLDivElement | null>,
  map: L.Map | null,
  tiles: ExploredTile[],
  isEnabled: boolean
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!mapContainerRef.current || !map || !isEnabled) return;

    const canvas = document.createElement('canvas');
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '25';
    canvas.style.opacity = '0.85';
    canvasRef.current = canvas;

    const container = mapContainerRef.current;
    container.style.position = 'relative';
    container.appendChild(canvas);

    const updateCanvas = () => {
      if (!canvasRef.current || !map) return;

      const width = container.offsetWidth;
      const height = container.offsetHeight;
      const dpr = window.devicePixelRatio || 1;

      canvasRef.current.width = width * dpr;
      canvasRef.current.height = height * dpr;
      canvasRef.current.style.width = `${width}px`;
      canvasRef.current.style.height = `${height}px`;

      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      ctx.fillStyle = 'rgba(10, 10, 10, 0.9)';
      ctx.fillRect(0, 0, width, height);

      ctx.globalCompositeOperation = 'destination-out';

      tiles.forEach(tile => {
        const point = map.latLngToContainerPoint([tile.center_lat, tile.center_lng]);

        const metersPerPixel = 156543.03392 * Math.cos(tile.center_lat * Math.PI / 180) / Math.pow(2, map.getZoom());
        const pixelRadius = (tile.radius_meters / metersPerPixel) * 2;

        const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, pixelRadius);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.8)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(point.x, point.y, pixelRadius, 0, 2 * Math.PI);
        ctx.fill();
      });

      ctx.globalCompositeOperation = 'source-over';
    };

    map.on('moveend', updateCanvas);
    map.on('zoomend', updateCanvas);
    map.on('move', updateCanvas);

    updateCanvas();

    return () => {
      map.off('moveend', updateCanvas);
      map.off('zoomend', updateCanvas);
      map.off('move', updateCanvas);
      if (canvasRef.current && container.contains(canvasRef.current)) {
        container.removeChild(canvasRef.current);
      }
    };
  }, [map, tiles, isEnabled, mapContainerRef]);
}

export function FogOfWarCanvas({
  tiles: _tiles,
  isEnabled,
}: {
  tiles: ExploredTile[];
  isEnabled: boolean;
}) {
  if (!isEnabled) return null;
  return null;
}