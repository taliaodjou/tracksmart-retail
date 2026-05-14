import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Camera, Loader2, AlertCircle, CheckCircle2, Keyboard } from 'lucide-react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { NotFoundException } from '@zxing/library';

/**
 * BarcodeScanner — full-screen modal
 * 1. Tries live camera + @zxing/browser real-time decoding (rear camera preferred)
 * 2. On detection: green border flash + haptic + calls onDetected(code)
 * 3. Fallback: manual barcode input if camera unavailable or permission denied
 */
export default function BarcodeScanner({ onDetected, onClose, lang }) {
  const videoRef = useRef(null);
  const readerRef = useRef(null);
  const fileInputRef = useRef(null);

  const [mode, setMode] = useState('init'); // init | camera | detected | error | manual
  const [errorMsg, setErrorMsg] = useState('');
  const [lastBarcode, setLastBarcode] = useState('');
  const [detected, setDetected] = useState(false); // green flash
  const [manualCode, setManualCode] = useState('');
  const [manualLoading, setManualLoading] = useState(false);

  const isFr = lang === 'fr';

  const stopReader = useCallback(() => {
    if (readerRef.current) {
      try { BrowserMultiFormatReader.releaseAllStreams(); } catch (_) {}
      readerRef.current = null;
    }
  }, []);

  useEffect(() => {
    initScanner();
    return () => stopReader();
  }, []);

  const initScanner = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setMode('manual');
      return;
    }

    try {
      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;

      // Get available devices, prefer back camera
      const devices = await BrowserMultiFormatReader.listVideoInputDevices();
      const backCamera = devices.find(d =>
        /back|rear|environment/i.test(d.label)
      ) || devices[devices.length - 1];

      const deviceId = backCamera?.deviceId || undefined;

      setMode('camera');

      await reader.decodeFromVideoDevice(deviceId, videoRef.current, (result, err) => {
        if (result) {
          handleDetected(result.getText());
        }
        // NotFoundException is normal when no barcode in frame — ignore
        if (err && !(err instanceof NotFoundException)) {
          console.warn('ZXing error:', err);
        }
      });
    } catch (err) {
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        setMode('manual');
        setErrorMsg(isFr
          ? 'Permission caméra refusée. Saisissez le code-barres manuellement.'
          : 'Camera permission denied. Enter the barcode manually.');
      } else {
        setMode('manual');
      }
    }
  };

  const handleDetected = (code) => {
    if (detected) return; // prevent double-fire
    stopReader();

    // Haptic feedback
    if (navigator.vibrate) navigator.vibrate(200);

    setDetected(true);
    setLastBarcode(code);
    setMode('detected');

    setTimeout(() => onDetected(code), 800);
  };

  const handleManualSearch = async () => {
    const code = manualCode.trim();
    if (!code) return;
    setManualLoading(true);
    // Small delay for UX then call onDetected — lookup happens in Dashboard
    await new Promise(r => setTimeout(r, 300));
    setManualLoading(false);
    onDetected(code);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 bg-black/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-2">
          <Camera className="w-5 h-5 text-white/80" />
          <span className="font-semibold text-sm text-white">
            {isFr ? 'Scanner un code-barres' : 'Scan Barcode'}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => { stopReader(); onClose(); }}
          className="text-white hover:bg-white/10 rounded-full w-10 h-10"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col items-center justify-center">

        {/* === INIT === */}
        {mode === 'init' && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
            <p className="text-white/70 text-sm">{isFr ? 'Démarrage de la caméra…' : 'Starting camera…'}</p>
          </div>
        )}

        {/* === CAMERA MODE === */}
        {mode === 'camera' && (
          <div className="w-full h-full relative">
            {/* Live video — full screen */}
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              muted
              playsInline
              autoPlay
            />

            {/* Green border flash on detect */}
            {detected && (
              <div className="absolute inset-0 border-4 border-green-400 rounded-none animate-pulse pointer-events-none z-10" />
            )}

            {/* Viewfinder overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              {/* Dark mask with transparent center */}
              <div className="absolute inset-0 bg-black/40" />

              {/* Scan box */}
              <div className="relative z-10 w-72 h-44">
                {/* Corners */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-3 border-l-3 border-white rounded-tl-md" style={{ borderWidth: '3px' }} />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-3 border-r-3 border-white rounded-tr-md" style={{ borderWidth: '3px' }} />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-3 border-l-3 border-white rounded-bl-md" style={{ borderWidth: '3px' }} />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-3 border-r-3 border-white rounded-br-md" style={{ borderWidth: '3px' }} />

                {/* Animated scan line */}
                <div
                  className="absolute left-1 right-1 h-0.5 bg-primary/90 shadow-[0_0_8px_3px_hsl(var(--primary)/0.6)]"
                  style={{ animation: 'scanline 2s ease-in-out infinite' }}
                />
              </div>

              <p className="relative z-10 mt-6 text-white/80 text-sm text-center px-6">
                {isFr
                  ? 'Pointez vers le code-barres — détection automatique'
                  : 'Point at the barcode — automatic detection'}
              </p>
            </div>
          </div>
        )}

        {/* === DETECTED === */}
        {mode === 'detected' && (
          <div className="flex flex-col items-center gap-4 px-8">
            <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center shadow-lg shadow-green-500/40">
              <CheckCircle2 className="w-9 h-9 text-white" />
            </div>
            <p className="font-bold text-white text-lg">
              {isFr ? 'Code détecté !' : 'Barcode detected!'}
            </p>
            <p className="text-xs font-mono bg-white/10 text-white/80 px-4 py-2 rounded-full">
              {lastBarcode}
            </p>
            <div className="flex items-center gap-2 text-white/60 text-xs">
              <Loader2 className="w-3 h-3 animate-spin" />
              {isFr ? 'Recherche du produit…' : 'Looking up product…'}
            </div>
          </div>
        )}

        {/* === ERROR === */}
        {mode === 'error' && (
          <div className="flex flex-col items-center gap-4 px-8">
            <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
              <AlertCircle className="w-9 h-9 text-red-400" />
            </div>
            <p className="text-white/80 text-sm text-center">{errorMsg}</p>
            <Button
              className="rounded-full"
              onClick={() => { setMode('manual'); }}
            >
              {isFr ? 'Saisir manuellement' : 'Enter manually'}
            </Button>
          </div>
        )}

        {/* === MANUAL INPUT === */}
        {mode === 'manual' && (
          <div className="flex flex-col items-center gap-5 px-8 w-full max-w-sm">
            <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
              <Keyboard className="w-8 h-8 text-white/80" />
            </div>
            <div className="text-center space-y-1">
              <p className="font-semibold text-white text-base">
                {errorMsg || (isFr ? 'Caméra non disponible' : 'Camera unavailable')}
              </p>
              <p className="text-white/60 text-sm">
                {isFr
                  ? 'Saisissez ou collez le code-barres ci-dessous'
                  : 'Type or paste the barcode below'}
              </p>
            </div>

            <div className="w-full flex gap-2">
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
                className="h-12 px-4 rounded-xl"
                onClick={handleManualSearch}
                disabled={!manualCode.trim() || manualLoading}
              >
                {manualLoading
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : (isFr ? 'Rechercher' : 'Search')
                }
              </Button>
            </div>

            {/* Try camera again */}
            <button
              className="text-white/50 text-xs underline underline-offset-2 hover:text-white/80 transition-colors"
              onClick={() => { setMode('init'); setErrorMsg(''); initScanner(); }}
            >
              {isFr ? 'Réessayer avec la caméra' : 'Try camera again'}
            </button>
          </div>
        )}
      </div>

      {/* Bottom: switch to manual (only in camera mode) */}
      {mode === 'camera' && (
        <div className="px-6 py-5 bg-black/70 backdrop-blur-sm flex justify-center">
          <button
            className="text-white/50 text-xs underline underline-offset-2 hover:text-white/70 transition-colors"
            onClick={() => { stopReader(); setMode('manual'); }}
          >
            {isFr ? 'Saisir le code manuellement' : 'Enter code manually'}
          </button>
        </div>
      )}

      <style>{`
        @keyframes scanline {
          0%   { top: 0; opacity: 1; }
          50%  { top: calc(100% - 2px); opacity: 1; }
          100% { top: 0; opacity: 1; }
        }
      `}</style>
    </div>
  );
}