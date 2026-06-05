import { useRef, useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { X, Send, Trash2, Minus, Plus } from 'lucide-react';

interface DrawingModalProps {
  onClose: () => void;
  onSend: (dataUrl: string) => void;
}

const PALETTE = [
  { color: '#1A1A2E', label: 'Black' },
  { color: '#EF4444', label: 'Red' },
  { color: '#3B82F6', label: 'Blue' },
  { color: '#22C55E', label: 'Green' },
  { color: '#F59E0B', label: 'Orange' },
  { color: '#B090FF', label: 'Purple' },
  { color: '#FFFFFF', label: 'Eraser', isEraser: true },
] as const;

function getXY(
  e: React.MouseEvent | React.TouchEvent,
  canvas: HTMLCanvasElement
): { x: number; y: number } {
  const rect = canvas.getBoundingClientRect();
  const clientX = 'touches' in e ? e.touches[0]?.clientX ?? 0 : e.clientX;
  const clientY = 'touches' in e ? e.touches[0]?.clientY ?? 0 : e.clientY;
  // Scale from CSS pixels to canvas buffer pixels
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY,
  };
}

export function DrawingModal({ onClose, onSend }: DrawingModalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const isDrawing    = useRef(false);
  const dprRef       = useRef(window.devicePixelRatio || 1);

  const [color,      setColor]      = useState<string>(PALETTE[0].color);
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [hasStrokes, setHasStrokes] = useState(false);
  const [sending,    setSending]    = useState(false);

  // ── DPI-correct canvas initialisation ────────────────────────────
  const initCanvas = useCallback(() => {
    const canvas    = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr  = window.devicePixelRatio || 1;
    dprRef.current = dpr;
    const cssW = container.offsetWidth;
    const cssH = container.offsetHeight;

    // Save existing drawing before resize
    let saved: ImageData | null = null;
    const ctx = canvas.getContext('2d');
    if (ctx && canvas.width > 0 && canvas.height > 0) {
      try { saved = ctx.getImageData(0, 0, canvas.width, canvas.height); } catch { /* noop */ }
    }

    // Set physical pixel dimensions
    canvas.width  = Math.round(cssW * dpr);
    canvas.height = Math.round(cssH * dpr);

    const newCtx = canvas.getContext('2d');
    if (!newCtx) return;

    // White background
    newCtx.fillStyle = '#FFFFFF';
    newCtx.fillRect(0, 0, canvas.width, canvas.height);

    // Restore previous strokes
    if (saved) {
      const tmp = document.createElement('canvas');
      tmp.width  = saved.width;
      tmp.height = saved.height;
      tmp.getContext('2d')?.putImageData(saved, 0, 0);
      newCtx.drawImage(tmp, 0, 0, canvas.width, canvas.height);
    }
  }, []);

  useEffect(() => {
    initCanvas();
    const ro = new ResizeObserver(() => initCanvas());
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [initCanvas]);

  // ── Drawing handlers ──────────────────────────────────────────────
  const getCtx = () => canvasRef.current?.getContext('2d') ?? null;

  const applyStyle = (ctx: CanvasRenderingContext2D, isEraser: boolean) => {
    const dpr = dprRef.current;
    ctx.strokeStyle = isEraser ? '#FFFFFF' : color;
    ctx.lineWidth   = (isEraser ? strokeWidth * 2.5 : strokeWidth) * dpr;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx    = getCtx();
    if (!canvas || !ctx) return;

    const isEraser = PALETTE.find(p => p.color === color && (p as any).isEraser) !== undefined;
    applyStyle(ctx, isEraser);

    const { x, y } = getXY(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
    isDrawing.current = true;
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing.current) return;
    const canvas = canvasRef.current;
    const ctx    = getCtx();
    if (!canvas || !ctx) return;

    const { x, y } = getXY(e, canvas);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasStrokes(true);
  };

  const handlePointerUp = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    isDrawing.current = false;
    getCtx()?.beginPath();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx    = getCtx();
    if (!canvas || !ctx) return;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setHasStrokes(false);
  };

  const sendDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas || sending) return;
    setSending(true);
    const dataUrl = canvas.toDataURL('image/png');
    onSend(dataUrl);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[60] flex flex-col"
      style={{ background: '#F8F8FF', touchAction: 'none' }}
    >
      {/* ── Toolbar ─────────────────────────────────────────────── */}
      <div
        className="flex-shrink-0 flex items-center gap-2 px-3 py-2.5"
        style={{
          background: 'rgba(255,255,255,0.97)',
          backdropFilter: 'blur(16px)',
          borderBottom: '1px solid #E8E0FF',
          boxShadow: '0 2px 12px rgba(176,144,255,0.1)',
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: '#F0E8FF', border: '1.5px solid #D8C8FF' }}
        >
          <X size={17} style={{ color: '#9070C0' }} />
        </button>

        {/* Colour swatches */}
        <div className="flex gap-1.5 flex-1 overflow-x-auto no-scrollbar">
          {PALETTE.map(p => (
            <button
              key={p.color}
              onClick={() => setColor(p.color)}
              title={p.label}
              className="flex-shrink-0 w-8 h-8 rounded-full transition-all flex items-center justify-center"
              style={{
                background: p.color,
                border: color === p.color ? '3px solid #B090FF' : p.color === '#FFFFFF' ? '2px solid #CCC' : '2px solid transparent',
                boxShadow: color === p.color ? '0 0 0 2px white, 0 0 0 4px #B090FF' : p.color === '#FFFFFF' ? 'inset 0 0 0 1px #DDD' : 'none',
                transform: color === p.color ? 'scale(1.2)' : 'scale(1)',
              }}
            >
              {(p as any).isEraser && <span style={{ fontSize: 10 }}>✏️</span>}
            </button>
          ))}
        </div>

        {/* Stroke width */}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => setStrokeWidth(w => Math.max(1, w - 1))}
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: '#F0E8FF' }}>
            <Minus size={12} style={{ color: '#9070C0' }} />
          </button>
          <span className="w-6 text-center text-xs font-bold" style={{ color: '#6040A0' }}>{strokeWidth}</span>
          <button onClick={() => setStrokeWidth(w => Math.min(12, w + 1))}
            className="w-7 h-7 rounded-full flex items-center justify-center"
            style={{ background: '#F0E8FF' }}>
            <Plus size={12} style={{ color: '#9070C0' }} />
          </button>
        </div>

        {/* Clear */}
        <button onClick={clearCanvas}
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: '#FFF0F5', border: '1.5px solid #FFD0DC' }}>
          <Trash2 size={14} style={{ color: '#FF6080' }} />
        </button>
      </div>

      {/* ── Canvas ──────────────────────────────────────────────── */}
      <div
        ref={containerRef}
        className="flex-1 relative"
        style={{ overflow: 'hidden', cursor: 'crosshair' }}
      >
        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            touchAction: 'none',
            userSelect: 'none',
          }}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
          onTouchCancel={handlePointerUp}
        />
        {!hasStrokes && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ opacity: 0.25 }}>
            <div className="text-center">
              <div className="text-5xl mb-2">✏️</div>
              <p className="text-sm font-medium" style={{ color: '#6040A0' }}>Draw something…</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Send bar ─────────────────────────────────────────────── */}
      <div
        className="flex-shrink-0 px-4 py-3"
        style={{ background: 'rgba(255,255,255,0.97)', borderTop: '1px solid #E8E0FF' }}
      >
        <button
          onClick={sendDrawing}
          disabled={sending || !hasStrokes}
          className="w-full py-3.5 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-40"
          style={{
            background: 'linear-gradient(135deg,#B090FF,#7AC8FF)',
            boxShadow: hasStrokes ? '0 4px 16px rgba(176,144,255,0.45)' : 'none',
          }}
        >
          <Send size={17} />
          {sending ? 'Sending…' : 'Send Drawing'}
        </button>
      </div>
    </motion.div>
  );
}
