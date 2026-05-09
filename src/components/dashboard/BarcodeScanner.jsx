import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { X, Camera, Loader2, AlertCircle, CheckCircle2, Image } from 'lucide-react';

/**
 * Universal BarcodeScanner
 * Strategy:
 *  1. Try BarcodeDetector API with live camera (Chrome Android, Safari 17+ desktop)
 *  2. If BarcodeDetector unavailable → show live camera + canvas polling via InvokeLLM fallback
 *  3. "Photo mode" fallback: <input type="file" capture="environment"> for all devices (iPhone, older Android)
 *     → sends image to Open Food Facts after user picks photo
 */
export default function BarcodeScanner({ onDetected, onClose, lang }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const detectorRef = useRef(null);
  const rafRef = useRef(null);
  const fileInputRef = useRef(null);

  const [mode, setMode] = useState('init'); // init | camera | detected | error | photo_mode
  const [errorMsg, setErrorMsg] = useState('');
  const [lastBarcode, setLastBarcode] = useState('');
  const [photoLooking, setPhotoLooking] = useState(false);

  const isFr = lang === 'fr';

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    initScanner();
    return () => stopCamera();
  }, []);

  const initScanner = async () => {
    // Check camera support
    if (!navigator.mediaDevices?.getUserMedia) {
      setMode('photo_mode');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }

      // Try native BarcodeDetector
      if ('BarcodeDetector' in window) {
        detectorRef.current = new window.BarcodeDetector({
          formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code'],
        });
        setMode('camera');
        startNativeScanLoop();
      } else {
        // No native detector → show camera + offer photo capture
        setMode('camera');
        // We'll rely on the photo button for actual detection
      }
    } catch (err) {
      // Camera permission denied or not available → photo mode
      setMode('photo_mode');
    }
  };

  // Native BarcodeDetector scan loop
  const startNativeScanLoop = () => {
    const loop = async () => {
      if (!videoRef.current || videoRef.current.readyState < 2) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }
      try {
        const barcodes = await detectorRef.current.detect(videoRef.current);
        if (barcodes.length > 0) {
          const code = barcodes[0].rawValue;
          handleDetected(code);
          return;
        }
      } catch (_) {}
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
  };

  const handleDetected = (code) => {
    stopCamera();
    setLastBarcode(code);
    setMode('detected');
    setTimeout(() => onDetected(code), 700);
  };

  // Capture current video frame and detect via BarcodeDetector on canvas
  const captureFrame = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    if ('BarcodeDetector' in window && detectorRef.current) {
      try {
        const barcodes = await detectorRef.current.detect(canvas);
        if (barcodes.length > 0) {
          handleDetected(barcodes[0].rawValue);
          return;
        }
      } catch (_) {}
    }

    // Fallback: convert to blob and try lookup by image analysis
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      setPhotoLooking(true);
      stopCamera();
      await lookupByImageBlob(blob);
      setPhotoLooking(false);
    }, 'image/jpeg', 0.85);
  };

  // Handle <input type="file" capture> photo
  const handleFileCapture = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoLooking(true);

    // Try to extract barcode via BarcodeDetector on an Image element
    if ('BarcodeDetector' in window) {
      const img = document.createElement('img');
      const url = URL.createObjectURL(file);
      img.src = url;
      await new Promise(res => { img.onload = res; img.onerror = res; });
      try {
        const detector = new window.BarcodeDetector({
          formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code'],
        });
        const barcodes = await detector.detect(img);
        URL.revokeObjectURL(url);
        if (barcodes.length > 0) {
          setPhotoLooking(false);
          handleDetected(barcodes[0].rawValue);
          return;
        }
      } catch (_) {
        URL.revokeObjectURL(url);
      }
    }

    await lookupByImageBlob(file);
    setPhotoLooking(false);
  };

  // Use Open Food Facts image search — actually we extract barcode via LLM vision
  const lookupByImageBlob = async (blob) => {
    try {
      const { base44 } = await import('@/api/base44Client');
      // Upload the image
      const { file_url } = await base44.integrations.Core.UploadFile({ file: blob });
      // Ask LLM to extract barcode from image
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `Look at this product image. Extract the barcode or EAN number visible on the product packaging. Return only the numeric barcode, nothing else. If no barcode is visible, return "NONE".`,
        file_urls: [file_url],
        response_json_schema: {
          type: 'object',
          properties: {
            barcode: { type: 'string' },
          },
        },
      });
      const code = result?.barcode?.trim();
      if (code && code !== 'NONE' && /^\d{6,14}$/.test(code)) {
        handleDetected(code);
      } else {
        setErrorMsg(isFr
          ? 'Aucun code-barres détecté. Réessayez en vous rapprochant du code-barres.'
          : 'No barcode detected. Try getting closer to the barcode.');
        setMode('error');
      }
    } catch (err) {
      setErrorMsg(isFr ? 'Erreur lors de la lecture de l\'image.' : 'Error reading the image.');
      setMode('error');
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-sm flex items-end sm:items-center justify-center">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/30">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-primary" />
            <span className="font-semibold text-sm">
              {isFr ? 'Scanner un code-barres' : 'Scan Barcode'}
            </span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => { stopCamera(); onClose(); }}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-4 space-y-3">
          {/* === CAMERA MODE === */}
          {mode === 'camera' && (
            <>
              <div className="relative rounded-xl overflow-hidden bg-black aspect-[4/3]">
                <video ref={videoRef} className="w-full h-full object-cover" muted playsInline autoPlay />
                {/* Viewfinder overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="relative w-3/4 h-1/2">
                    {/* Corner brackets */}
                    <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-primary rounded-tl" />
                    <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-primary rounded-tr" />
                    <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-primary rounded-bl" />
                    <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-primary rounded-br" />
                    {/* Animated scan line */}
                    <div className="absolute left-2 right-2 h-px bg-primary/80 shadow-[0_0_6px_2px_hsl(var(--primary)/0.5)]"
                      style={{ animation: 'scanline 2s ease-in-out infinite' }} />
                  </div>
                </div>
              </div>
              {/* Hidden canvas for frame capture */}
              <canvas ref={canvasRef} className="hidden" />

              <p className="text-xs text-center text-muted-foreground">
                {isFr
                  ? 'Pointez vers le code-barres — il sera détecté automatiquement'
                  : 'Point at the barcode — it will be detected automatically'}
              </p>

              {/* Manual capture button — works even without native BarcodeDetector */}
              {!detectorRef.current && (
                <Button
                  className="w-full rounded-full gap-2"
                  onClick={captureFrame}
                  disabled={photoLooking}
                >
                  {photoLooking
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> {isFr ? 'Analyse en cours…' : 'Analysing…'}</>
                    : <><Camera className="w-4 h-4" /> {isFr ? 'Prendre une photo' : 'Take photo'}</>
                  }
                </Button>
              )}

              {/* Photo fallback button */}
              <button
                className="w-full text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground transition-colors"
                onClick={() => { stopCamera(); setMode('photo_mode'); }}
              >
                {isFr ? 'Problème ? Utiliser la galerie / photo' : 'Issue? Use gallery / photo'}
              </button>
            </>
          )}

          {/* === INIT === */}
          {mode === 'init' && (
            <div className="flex flex-col items-center gap-3 py-8">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <p className="text-sm text-muted-foreground">{isFr ? 'Démarrage de la caméra…' : 'Starting camera…'}</p>
            </div>
          )}

          {/* === PHOTO MODE (universal fallback for iPhone etc.) === */}
          {mode === 'photo_mode' && (
            <div className="flex flex-col items-center gap-4 py-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Camera className="w-8 h-8 text-primary" />
              </div>
              <div className="text-center space-y-1">
                <p className="font-semibold text-foreground text-sm">
                  {isFr ? 'Prendre une photo du code-barres' : 'Take a photo of the barcode'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {isFr
                    ? 'Cadrez bien le code-barres — l\'IA extraira les informations du produit.'
                    : 'Frame the barcode clearly — AI will extract the product info.'}
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleFileCapture}
              />

              {photoLooking ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-6 h-6 text-primary animate-spin" />
                  <p className="text-xs text-muted-foreground">
                    {isFr ? 'Analyse de l\'image en cours…' : 'Analysing image…'}
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-2 w-full">
                  <Button className="rounded-full gap-2 w-full" onClick={() => fileInputRef.current?.click()}>
                    <Camera className="w-4 h-4" />
                    {isFr ? 'Ouvrir la caméra' : 'Open Camera'}
                  </Button>
                  <Button variant="outline" className="rounded-full gap-2 w-full" onClick={() => {
                    if (fileInputRef.current) {
                      fileInputRef.current.removeAttribute('capture');
                      fileInputRef.current.click();
                      // restore capture after a tick
                      setTimeout(() => fileInputRef.current?.setAttribute('capture', 'environment'), 500);
                    }
                  }}>
                    <Image className="w-4 h-4" />
                    {isFr ? 'Choisir dans la galerie' : 'Choose from gallery'}
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* === DETECTED === */}
          {mode === 'detected' && (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <p className="font-semibold text-foreground">
                {isFr ? 'Code détecté !' : 'Code detected!'}
              </p>
              <p className="text-xs font-mono bg-secondary px-3 py-1 rounded-full text-muted-foreground">
                {lastBarcode}
              </p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="w-3 h-3 animate-spin" />
                {isFr ? 'Recherche du produit…' : 'Looking up product…'}
              </div>
            </div>
          )}

          {/* === ERROR === */}
          {mode === 'error' && (
            <div className="flex flex-col items-center gap-3 py-6">
              <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-sm text-red-700 text-center">{errorMsg}</p>
              <div className="flex gap-2">
                <Button variant="outline" className="rounded-full" onClick={() => { setMode('photo_mode'); }}>
                  {isFr ? 'Réessayer' : 'Retry'}
                </Button>
                <Button variant="ghost" className="rounded-full" onClick={() => { stopCamera(); onClose(); }}>
                  {isFr ? 'Fermer' : 'Close'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes scanline {
          0%   { top: 0; opacity: 1; }
          50%  { top: calc(100% - 1px); opacity: 1; }
          100% { top: 0; opacity: 1; }
        }
      `}</style>
    </div>
  );
}