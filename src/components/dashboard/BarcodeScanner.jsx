import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X, Camera, Loader2, AlertCircle, CheckCircle2, Keyboard } from 'lucide-react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { NotFoundException } from '@zxing/library';

export default function BarcodeScanner({ onDetected, onClose, lang }) {
  const videoRef = useRef(null);
  const readerRef = useRef(null);

  const [mode, setMode] = useState('init'); // init | camera | detected | error | manual
  const [errorMsg, setErrorMsg] = useState('');
  const [lastBarcode, setLastBarcode] = useState('');
  const [manualCode, setManualCode] = useState('');
  const [manualLoading, setManualLoading] = useState(false);

  const isFr = lang === 'fr';

  const stopReader = useCallback(() => {
    try { BrowserMultiFormatReader.releaseAllStreams(); } catch (_) {}
    readerRef.current = null;
  }, []);

  // Start scanner after component mounts so videoRef.current is ready
  useEffect(() => {
    const timer = setTimeout(initScanner, 150);
    return () => {
      clearTimeout(timer);
      stopReader();
    };
  }, []);

  const initScanner = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setMode('manual');
      return;
    }
    try {
      const reader = new BrowserMultiFormatReader();
      readerRef.current = reader;

      const devices = await BrowserMultiFormatReader.listVideoInputDevices();
      const backCamera = devices.find(d => /back|rear|environment/i.test(d.label))
        || devices[devices.length - 1];

      setMode('camera');

      // decodeFromVideoDevice manages the stream internally — video element must be in DOM
      await reader.decodeFromVideoDevice(
        backCamera?.deviceId || undefined,
        videoRef.current,
        (result, err) => {
          if (result) handleDetected(result.getText());
          if (err && !(err instanceof NotFoundException)) {
            console.warn('ZXing decode error:', err);
          }
        }
      );
    } catch (err) {
      console.error('Camera init error:', err);
      if (err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError') {
        setErrorMsg(isFr
          ? 'Permission caméra refusée.'
          : 'Camera permission denied.');
      }
      setMode('manual');
    }
  };

  const handleDetected = (code) => {
    stopReader();
    if (navigator.vibrate) navigator.vibrate(200);
    setLastBarcode(code);
    setMode('detected');
    setTimeout(() => onDetected(code), 800);
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
          onClick={() => { stopReader(); onClose(); }}
          className="text-white hover:bg-white/10 rounded-full w-10 h-10"
        >
          <X className="w-5 h-5" />
        </Button>
      </div>

      {/* Video — always in DOM so ref exists when ZXing starts */}
      <div className={`absolute inset-0 top-14 ${mode === 'camera' ? 'block' : 'hidden'}`}>
        <video
          ref={videoRef}
          className="w-full h-full object-cover"
          muted
          playsInline
          autoPlay
        />
        {/* Viewfinder overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative z-10 w-72 h-44">
            {/* Corner brackets */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-white rounded-tl-md" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-white rounded-tr-md" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] border-white rounded-bl-md" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-white rounded-br-md" />
            {/* Scan line */}
            <div
              className="absolute left-1 right-1 h-0.5 bg-primary/90"
              style={{ animation: 'scanline 2s ease-in-out infinite' }}
            />
          </div>
          <p className="relative z-10 mt-6 text-white/80 text-sm text-center px-6">
            {isFr ? 'Pointez vers le code-barres — détection auto' : 'Point at the barcode — auto detect'}
          </p>
        </div>
      </div>

      {/* Body — overlaid states */}
      <div className="flex-1 flex flex-col items-center justify-center">

        {mode === 'init' && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 text-white animate-spin" />
            <p className="text-white/70 text-sm">{isFr ? 'Démarrage de la caméra…' : 'Starting camera…'}</p>
          </div>
        )}

        {mode === 'detected' && (
          <div className="flex flex-col items-center gap-4 px-8 z-20">
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

        {mode === 'manual' && (
          <div className="flex flex-col items-center gap-5 px-8 w-full max-w-sm z-20">
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
                {manualLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (isFr ? 'OK' : 'Go')}
              </Button>
            </div>
            <button
              className="text-white/50 text-xs underline underline-offset-2 hover:text-white/80 transition-colors"
              onClick={handleRetry}
            >
              {isFr ? 'Réessayer avec la caméra' : 'Try camera again'}
            </button>
          </div>
        )}
      </div>

      {/* Bottom switcher — only in camera mode */}
      {mode === 'camera' && (
        <div className="px-6 py-5 bg-black/70 flex justify-center flex-shrink-0 z-10">
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
          0%   { top: 0; }
          50%  { top: calc(100% - 2px); }
          100% { top: 0; }
        }
      `}</style>
    </div>
  );
}