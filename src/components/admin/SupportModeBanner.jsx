import React from 'react';
import { useSupportMode } from '@/lib/SupportModeContext';
import { Shield, X, ArrowLeft } from 'lucide-react';

export default function SupportModeBanner() {
  const { supportClient, exitSupportMode } = useSupportMode();
  if (!supportClient) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-amber-500 text-black flex items-center justify-between px-4 py-2 shadow-lg">
      <div className="flex items-center gap-3">
        <Shield className="w-4 h-4 flex-shrink-0" />
        <span className="font-bold text-sm tracking-wide">MODE SUPPORT ADMIN</span>
        <span className="text-black/60 text-sm hidden sm:inline">
          — Vous consultez la boutique de <strong>{supportClient.shop_name || supportClient.email}</strong>
        </span>
      </div>
      <button
        onClick={exitSupportMode}
        className="flex items-center gap-2 bg-black/15 hover:bg-black/25 px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Quitter le mode support
      </button>
    </div>
  );
}