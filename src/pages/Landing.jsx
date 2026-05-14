import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { isAdmin } from '@/lib/productUtils';
import { Hourglass, Store, Shield, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function Landing() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleBoutique = () => {
    if (isAuthenticated && user) {
      navigate('/dashboard');
    } else {
      base44.auth.redirectToLogin('/dashboard');
    }
  };

  const handleAdmin = () => {
    if (isAuthenticated && user && isAdmin(user)) {
      navigate('/admin-portal');
    } else {
      base44.auth.redirectToLogin('/admin-portal');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      {/* Logo */}
      <div className="flex flex-col items-center mb-12 relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/30 flex items-center justify-center mb-4">
          <Hourglass className="w-8 h-8 text-primary" />
        </div>
        <div className="text-white font-bold text-2xl tracking-tight">TrackSmart</div>
        <div className="text-white/30 text-xs tracking-widest uppercase mt-1">by TNO Studio</div>
      </div>

      {/* Heading */}
      <div className="text-center mb-10 relative z-10">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
          Bienvenue sur TrackSmart
        </h1>
        <p className="text-white/40 text-base max-w-sm mx-auto">
          Sélectionnez votre type d'accès pour continuer
        </p>
      </div>

      {/* Entry cards */}
      <div className="flex flex-col sm:flex-row gap-4 w-full max-w-2xl relative z-10">
        {/* Boutique */}
        <button
          onClick={handleBoutique}
          className="group flex-1 bg-[#141414] hover:bg-[#1c1c1c] border border-white/8 hover:border-primary/40 rounded-2xl p-8 text-left transition-all duration-300 flex flex-col gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-primary/15 border border-primary/20 flex items-center justify-center group-hover:bg-primary/25 transition-colors">
            <Store className="w-6 h-6 text-primary" />
          </div>
          <div>
            <div className="text-white font-bold text-lg mb-1">Je suis une boutique</div>
            <div className="text-white/40 text-sm leading-relaxed">
              Accédez à votre espace de gestion des produits et des dates de péremption.
            </div>
          </div>
          <div className="flex items-center gap-2 text-primary text-sm font-medium mt-auto">
            Accéder au tableau de bord
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>

        {/* Admin */}
        <button
          onClick={handleAdmin}
          className="group flex-1 bg-[#141414] hover:bg-[#1c1c1c] border border-white/8 hover:border-white/20 rounded-2xl p-8 text-left transition-all duration-300 flex flex-col gap-4"
        >
          <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
            <Shield className="w-6 h-6 text-white/50" />
          </div>
          <div>
            <div className="text-white font-bold text-lg mb-1">Je suis administrateur</div>
            <div className="text-white/40 text-sm leading-relaxed">
              Accédez au portail de gestion des clients et des abonnements TNO Studio.
            </div>
          </div>
          <div className="flex items-center gap-2 text-white/40 text-sm font-medium mt-auto group-hover:text-white/60 transition-colors">
            Portail administrateur
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </button>
      </div>

      {/* Footer */}
      <div className="mt-12 text-white/20 text-xs text-center relative z-10">
        TrackSmart · TNO Studio · support@tno-studio.com
      </div>
    </div>
  );
}