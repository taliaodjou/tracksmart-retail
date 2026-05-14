import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { isAdmin } from '@/lib/productUtils';
import { Hourglass, Store, Shield, ArrowRight, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function Landing() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleBoutique = () => {
    if (isAuthenticated && user && !isAdmin(user)) {
      navigate('/welcome');
    } else {
      base44.auth.redirectToLogin('/welcome');
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
    <div className="min-h-screen bg-gradient-to-br from-[#fafaf8] via-white to-[#f5f0e8] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 sm:px-10 py-5">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-foreground tracking-tight">TrackSmart</span>
        </div>
        <div className="text-xs text-muted-foreground/60 hidden sm:block">by TNO Studio</div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Logo mark */}
        <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-8 shadow-sm">
          <Clock className="w-10 h-10 text-primary" />
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-3 text-center leading-tight">
          Bienvenue sur TrackSmart
        </h1>
        <p className="text-muted-foreground text-base sm:text-lg max-w-lg text-center mb-12 leading-relaxed">
          Votre plateforme intelligente de gestion des produits et DLC
        </p>

        {/* Entry cards */}
        <div className="flex flex-col sm:flex-row gap-5 w-full max-w-2xl">
          {/* Boutique card */}
          <button
            onClick={handleBoutique}
            className="group flex-1 bg-white hover:bg-white border border-border/50 hover:border-primary/40 rounded-2xl p-8 text-left transition-all duration-300 shadow-sm hover:shadow-lg hover:shadow-primary/10 flex flex-col gap-5"
          >
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
              <Store className="w-7 h-7 text-primary" />
            </div>
            <div>
              <div className="text-xl font-bold text-foreground mb-2">🏪 Je suis une boutique</div>
              <div className="text-muted-foreground text-sm leading-relaxed">
                Accédez à votre espace de gestion des produits et des pertes.
              </div>
            </div>
            <div className="flex items-center gap-2 text-primary text-sm font-semibold mt-auto">
              Accéder à mon espace
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>

          {/* Admin card */}
          <button
            onClick={handleAdmin}
            className="group flex-1 bg-white hover:bg-white border border-border/50 hover:border-foreground/20 rounded-2xl p-8 text-left transition-all duration-300 shadow-sm hover:shadow-lg flex flex-col gap-5"
          >
            <div className="w-14 h-14 rounded-2xl bg-secondary border border-border flex items-center justify-center group-hover:bg-foreground/8 transition-colors">
              <Shield className="w-7 h-7 text-muted-foreground" />
            </div>
            <div>
              <div className="text-xl font-bold text-foreground mb-2">⚙️ Je suis administrateur</div>
              <div className="text-muted-foreground text-sm leading-relaxed">
                Espace privé de gestion TrackSmart.
              </div>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground text-sm font-semibold mt-auto group-hover:text-foreground transition-colors">
              Portail administrateur
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="text-center py-5 px-4 text-xs text-muted-foreground/50">
        TrackSmart · TNO Studio · support@tracksmart.com
      </footer>
    </div>
  );
}