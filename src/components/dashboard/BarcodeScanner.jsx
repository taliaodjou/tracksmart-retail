import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Camera, Loader2, CheckCircle2, Keyboard } from 'lucide-react';
import { BrowserMultiFormatReader } from '@zxing/browser';

/**
 * BarcodeScanner — uses manual frame-by-frame decoding via canvas
 * Much more reliable than decodeFromVideoDevice on mobile browsers.
 */
export default function BarcodeScanner({ onDetected, onClose, lang }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const readerRef = useRef(null);
  const detectedRef = useRef(false);

  const [mode, setMode] = useState('init'); // init | camera | detected | manual
  const [lastBarcode, setLastBarcode] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [manualLoading, setManualLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isFr = lang === 'fr';

  const stopCamera = useCallback(() => {
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    readerRef.current = new BrowserMultiFormatReader();
    const timer = setTimeout(initScanner, 200);
    return () => {
      clearTimeout(timer);
      stopCamera();
    };
  }, []);

  const initScanner = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setMode('manual');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      streamRef.current = stream;

      const video = videoRef.current;
      video.srcObject = stream;
      await video.play();

      setMode('camera');
      startDecoding();
    } catch (err) {
      console.error('Camera error:', err);
      if (err?.name === 'NotAllowedError') {
        setErrorMsg(isFr ? 'Permission caméra refusée.' : 'Camera permission denied.');
      }
      setMode('manual');
    }
  };

  const startDecoding = () => {
    const tick = async () => {
      if (detectedRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || video.readyState < 2) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const w = video.videoWidth;
      const h = video.videoHeight;
      if (!w || !h) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, w, h);

      try {
        const result = await readerRef.current.decodeFromCanvas(canvas);
        if (result && !detectedRef.current) {
          detectedRef.current = true;
          handleDetected(result.getText());
          return;
        }
      } catch (_) {
        // No barcode found in this frame — keep scanning
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  };

  const handleDetected = (code) => {
    stopCamera();
    if (navigator.vibrate) navigator.vibrate([100, 50, 100]);
    setLastBarcode(code);
    setMode('detected');
    setTimeout(() => onDetected(code), 900);
  };

  const handleManualSearch = async () => {
    const code = manualCode.trim();
    if (!code) return;
    setManualLoading(true);
    await new Promise(r => setTimeout(r, 200));
    setManualLoading(false);
    onDetected(code);
  };

  const handleRetry = () => {
    detectedRef.current = false;
    setMode('init');
    setErrorMsg('');
    setTimeout(initScanner, 100);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 bg-black/80 z-10 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-white/80" />
          <span className="font-semibold text-sm text-white">
            {isFr ? 'Scanner un code-barres' : 'Scan Barcode'}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => { stopCamera(); onClose(); }}
          className="text-white hover:bg-white/10 rounded-full w-10 h-10"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Hidden canvas for decoding */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Video — always in DOM */}
      <video
        ref={videoRef}
        className={`absolute inset-0 w-full h-full object-cover ${mode === 'camera' ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        muted
        playsInline
        autoPlay
      />

      {/* Viewfinder — shown over video in camera mode */}
      {mode === 'camera' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 w-72 h-44">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-white rounded-tl-md" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-white rounded-tr-md" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] border-white rounded-bl-md" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-white rounded-br-md" />
            <div
              className="absolute left-0 right-0 h-0.5 bg-primary/90 shadow-[0_0_8px_3px_hsl(var(--primary)/0.5)]"
              style={{ animation: 'scanline 2s ease-in-out infinite' }}
            />
          </div>
          <p className="relative z-10 mt-6 text-white/80 text-sm text-center px-6 drop-shadow-lg">
            {isFr ? 'Centrez le code-barres dans le cadre' : 'Center the barcode in the frame'}
          </p>
        </div>
      )}

      {/* Centered overlays */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">

        {mode === 'init' && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
            <p className="text-white/70 text-sm">{isFr ? 'Démarrage de la caméra…' : 'Starting camera…'}</p>
          </div>
        )}

        {mode === 'detected' && (
          <div className="flex flex-col items-center gap-4 px-8">
            <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/40">
              <CheckCircle2 className="w-9 h-9 text-white" />
            </div>
            <p className="font-bold text-white text-lg">{isFr ? 'Code détecté !' : 'Barcode detected!'}</p>
            <p className="text-xs font-mono bg-white/10 text-white/80 px-4 py-2 rounded-full">{lastBarcode}</p>
            <div className="flex items-center gap-2 text-white/60 text-xs">
              <Loader2 className="w-3 h-3 animate-spin" />
              {isFr ? 'Recherche du produit…' : 'Looking up product…'}
            </div>
          </div>
        )}
      </div>

      {/* Manual input mode */}
      {mode === 'manual' && (
        <div className="flex-1 flex flex-col items-center justify-center gap-5 px-8 w-full">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
            <Keyboard className="w-8 h-8 text-white/80" />
          </div>
          <div className="text-center space-y-1">
            <p className="font-semibold text-white text-base">
              {errorMsg || (isFr ? 'Caméra non disponible' : 'Camera unavailable')}
            </p>
            <p className="text-white/60 text-sm">
              {isFr ? 'Saisissez le code-barres ci-dessous' : 'Type the barcode below'}
            </p>
          </div>
          <div className="w-full max-w-sm flex gap-2">
            <Input
              value={manualCode}
              onChange={e => setManualCode(e.target.value)}
              placeholder="Ex: 3017620422003"
              className="flex-1 h-12 text-base rounded-xl bg-white/10 border-white/20 text-white placeholder:text-white/40"
              onKeyDown={e => e.key === 'Enter' && handleManualSearch()}
              autoFocus
              inputMode="numeric"
            />
            <Button
              className="h-12 px-4 rounded-xl pointer-events-auto"
              onClick={handleManualSearch}
              disabled={!manualCode.trim() || manualLoading}
            >
              {manualLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isFr ? 'OK' : 'Go')}
            </Button>
          </div>
          <button
            className="text-white/50 text-xs underline underline-offset-2 hover:text-white/80 transition-colors pointer-events-auto"
            onClick={handleRetry}
          >
            {isFr ? 'Réessayer avec la caméra' : 'Try camera again'}
          </button>
        </div>
      )}

      {/* Bottom — switch to manual */}
      {mode === 'camera' && (
        <div className="absolute bottom-0 left-0 right-0 px-6 py-5 bg-black/60 flex justify-center z-10">
          <button
            className="text-white/50 text-xs underline underline-offset-2 hover:text-white/70 transition-colors"
            onClick={() => { stopCamera(); setMode('manual'); }}
          >
            {isFr ? 'Saisir le code manuellement' : 'Enter code manually'}
          </button>
        </div>
      )}

      <style>{`
        @keyframes scanline {
          0%   { top: 0; }
          50%  { top: calc(100% - 2px); }
          100% { top: 0; }
        }
      `}</style>
    </div>
  );
}