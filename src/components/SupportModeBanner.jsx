import React from 'react';
import { useNavigate } from 'react-router-dom';
import { getSupportMode, exitSupportMode } from '@/lib/supportMode';
import { Shield, X } from 'lucide-react';

export default function SupportModeBanner() {
  const navigate = useNavigate();
  const support = getSupportMode();
  if (!support) return null;

  const handleExit = () => {
    exitSupportMode();
    navigate('/admin-portal/clients');
    window.location.reload(); // force full refresh so queries reset
  };

  return (
    <div className="bg-amber-500 text-white px-4 py-2.5 flex items-center justify-between gap-3 z-50 sticky top-0">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <Shield className="w-4 h-4" />
        MODE SUPPORT ADMIN — Vous consultez l'espace de : <span className="font-bold">{support.clientName}</span>
      </div>
      <button
        onClick={handleExit}
        className="flex items-center gap-1.5 text-sm font-medium bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full transition-colors"
      >
        <X className="w-3.5 h-3.5" />
        Quitter le mode support
      </button>
    </div>
  );
}