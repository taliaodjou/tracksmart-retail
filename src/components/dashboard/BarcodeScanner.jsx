import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Camera, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

/**
 * BarcodeScanner
 * Uses the browser's BarcodeDetector API (native, no extra package).
 * Falls back gracefully if unsupported.
 * onDetected(barcode: string) is called once a barcode is found.
 */
export default function BarcodeScanner({ onDetected, onClose, lang }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const detectorRef = useRef(null);
  const rafRef = useRef(null);

  const [status, setStatus] = useState('init'); // init | scanning | detected | error | unsupported
  const [errorMsg, setErrorMsg] = useState('');
  const [lastBarcode, setLastBarcode] = useState('');

  useEffect(() => {
    if (!('BarcodeDetector' in window)) {
      setStatus('unsupported');
      return;
    }
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      detectorRef.current = new window.BarcodeDetector({
        formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code'],
      });
      setStatus('scanning');
      scanLoop();
    } catch (err) {
      setErrorMsg(lang === 'fr' ? 'Impossible d\'accéder à la caméra.' : 'Cannot access camera.');
      setStatus('error');
    }
  };

  const stopCamera = () => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
  };

  const scanLoop = () => {
    rafRef.current = requestAnimationFrame(async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) {
        scanLoop();
        return;
      }
      try {
        const barcodes = await detectorRef.current.detect(videoRef.current);
        if (barcodes.length > 0) {
          const code = barcodes[0].rawValue;
          setLastBarcode(code);
          setStatus('detected');
          stopCamera();
          setTimeout(() => onDetected(code), 600);
          return;
        }
      } catch (_) {}
      scanLoop();
    });
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            <span className="font-semibold text-sm">
              {lang === 'fr' ? 'Scanner un code-barres' : 'Scan Barcode'}
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => { stopCamera(); onClose(); }}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Video preview */}
          {(status === 'scanning' || status === 'init') && (
            <div className="relative rounded-xl overflow-hidden bg-black aspect-[4/3]">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                muted
                playsInline
              />
              {/* Scanning overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="border-2 border-primary/80 rounded-lg w-3/4 h-1/2 relative">
                  {/* Corner accents */}
                  <div className="absolute -top-0.5 -left-0.5 w-4 h-4 border-t-2 border-l-2 border-primary rounded-tl-lg" />
                  <div className="absolute -top-0.5 -right-0.5 w-4 h-4 border-t-2 border-r-2 border-primary rounded-tr-lg" />
                  <div className="absolute -bottom-0.5 -left-0.5 w-4 h-4 border-b-2 border-l-2 border-primary rounded-bl-lg" />
                  <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 border-b-2 border-r-2 border-primary rounded-br-lg" />
                  {/* Scan line animation */}
                  <div className="absolute left-0 right-0 h-0.5 bg-primary/70 animate-scan-line" />
                </div>
              </div>
              {status === 'init' && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                </div>
              )}
            </div>
          )}

          {/* Detected */}
          {status === 'detected' && (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <p className="font-semibold text-foreground">
                {lang === 'fr' ? 'Code détecté !' : 'Code detected!'}
              </p>
              <p className="text-xs font-mono bg-secondary px-3 py-1 rounded-full text-muted-foreground">
                {lastBarcode}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin" />
                {lang === 'fr' ? 'Recherche du produit…' : 'Looking up product…'}
              </div>
            </div>
          )}

          {/* Error */}
          {status === 'error' && (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-sm text-red-700 text-center">{errorMsg}</p>
              <Button className="rounded-full" onClick={startCamera}>
                {lang === 'fr' ? 'Réessayer' : 'Retry'}
              </Button>
            </div>
          )}

          {/* Unsupported */}
          {status === 'unsupported' && (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-orange-500" />
              </div>
              <p className="text-sm text-center text-muted-foreground">
                {lang === 'fr'
                  ? 'Le scan de codes-barres n\'est pas supporté par votre navigateur. Utilisez Chrome sur Android ou Safari 17+.'
                  : 'Barcode scanning is not supported by your browser. Use Chrome on Android or Safari 17+.'}
              </p>
            </div>
          )}

          {status === 'scanning' && (
            <p className="text-xs text-center text-muted-foreground">
              {lang === 'fr'
                ? 'Pointez votre caméra vers le code-barres du produit'
                : 'Point your camera at the product barcode'}
            </p>
          )}
        </div>
      </div>

      <style>{`
        @keyframes scan-line {
          0% { top: 0; }
          50% { top: calc(100% - 2px); }
          100% { top: 0; }
        }
        .animate-scan-line {
          animation: scan-line 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}