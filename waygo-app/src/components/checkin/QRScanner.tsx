import { useRef, useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Camera, AlertCircle } from 'lucide-react';
import jsQR from 'jsqr';

interface QRScannerProps {
  onCodeDetected: (code: string) => void;
  isActive: boolean;
}

export function QRScanner({ onCodeDetected, isActive }: QRScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play();
          setIsScanning(true);
          setError(null);
        };
      }
    } catch {
      setError('Camera access denied. Use manual code entry.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  }, []);

  useEffect(() => {
    if (isActive) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isActive, startCamera, stopCamera]);

  useEffect(() => {
    if (!isScanning || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let lastScanTime = 0;
    const scanInterval = 100;

    const scan = (timestamp: number) => {
      if (!isScanning) return;

      if (timestamp - lastScanTime >= scanInterval) {
        lastScanTime = timestamp;

        if (video.readyState === video.HAVE_ENOUGH_DATA) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code) {
            onCodeDetected(code.data);
            setIsScanning(false);
            return;
          }
        }
      }

      animationId = requestAnimationFrame(scan);
    };

    animationId = requestAnimationFrame(scan);

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [isScanning, onCodeDetected]);

  return (
    <div className="relative w-full aspect-square bg-black rounded-2xl overflow-hidden">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
        muted
      />
      <canvas ref={canvasRef} className="hidden" />

      {!isScanning && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-center">
            <Camera size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-400">Camera starting...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
          <div className="text-center p-6">
            <AlertCircle size={48} className="mx-auto text-red-400 mb-4" />
            <p className="text-gray-300">{error}</p>
          </div>
        </div>
      )}

      {isScanning && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-64 h-64">
            <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-waygo-teal rounded-tl-lg" />
            <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-waygo-teal rounded-tr-lg" />
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-waygo-teal rounded-bl-lg" />
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-waygo-teal rounded-br-lg" />

            <motion.div
              animate={{ y: [-100, 100, -100] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="absolute left-4 right-4 h-0.5 bg-waygo-teal/50"
            />
          </div>
        </div>
      )}

      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-white/80 text-sm">
          {isScanning ? 'Scanning for Waygo QR code...' : 'Position QR code in frame'}
        </p>
      </div>
    </div>
  );
}