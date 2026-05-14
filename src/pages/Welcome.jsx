import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { getProductStatus, hasActiveSubscription, isAdmin } from '@/lib/productUtils';
import { getSupportMode } from '@/lib/supportMode';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowRight, PackageX, AlertTriangle, TrendingDown, AlertCircle } from 'lucide-react';

export default function Welcome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const supportMode = getSupportMode();

  // If admin and NOT in support mode → go to admin portal
  // If in support mode, show client welcome as normal
  const effectiveUser = user;
  const canAccess = isAdmin(user) ? true : hasActiveSubscription(user);
  const isSubscriptionInactive = !isAdmin(user) && !hasActiveSubscription(user);

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list('-created_date'),
    enabled: canAccess,
  });

  const stats = useMemo(() => {
    const expired = products.filter(p => getProductStatus(p.expiration_date) === 'expired');
    const urgent = products.filter(p => getProductStatus(p.expiration_date) === 'urgent');
    const monthlyLoss = expired.reduce((sum, p) => sum + ((p.quantity_thrown || 0) * (p.price_chf || 0)), 0);
    return { expired: expired.length, urgent: urgent.length, monthlyLoss };
  }, [products]);

  const handleStart = () => {
    if (isAdmin(user) && !supportMode) {
      navigate('/admin-portal');
    } else {
      navigate('/dashboard');
    }
  };

  const today = new Date();
  const dateStr = format(today, 'EEEE d MMMM yyyy', { locale: fr });
  const capitalizedDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

  const storeName = user?.shop_name || user?.full_name || '';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fafaf8] via-white to-[#f5f0e8] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
            <span className="text-primary-foreground font-bold text-sm">⌛</span>
          </div>
          <div>
            <span className="font-bold text-foreground tracking-tight text-sm">TrackSmart</span>
            <span className="text-xs text-muted-foreground ml-1.5">by TNO Studio</span>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">{capitalizedDate}</div>
      </div>

      {/* Inactive subscription warning */}
      {isSubscriptionInactive && (
        <div className="bg-red-50 border-b border-red-200 px-5 py-3 flex items-center gap-2 text-sm text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          Votre abonnement est inactif. Contactez <a href="mailto:support@tracksmart.com" className="underline font-semibold">support@tracksmart.com</a>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 text-center">
        {/* Logo mark */}
        <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-7 shadow-sm">
          <span className="text-4xl">⌛</span>
        </div>

        {/* Greeting */}
        <p className="text-sm font-medium text-primary mb-2 uppercase tracking-widest">
          {isAdmin(user) && !supportMode ? 'Admin Portal' : 'Bienvenue'}
        </p>

        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-3 leading-tight max-w-lg">
          {isAdmin(user) && !supportMode
            ? 'Tableau de bord Admin'
            : storeName
              ? `Bienvenue sur TrackSmart, ${storeName}`
              : 'Bienvenue sur TrackSmart'
          }
        </h1>

        {(!isAdmin(user) || supportMode) && (
          <p className="text-muted-foreground text-base sm:text-lg max-w-md mb-10">
            Votre espace intelligent de suivi des produits et des pertes.
          </p>
        )}

        {/* Summary cards — client only */}
        {canAccess && (!isAdmin(user) || supportMode) && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl mb-10">
            <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-5 flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <PackageX className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.expired}</p>
              <p className="text-xs text-muted-foreground text-center">Produits expirés</p>
            </div>
            <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-5 flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.urgent}</p>
              <p className="text-xs text-muted-foreground text-center">Produits urgents</p>
            </div>
            <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-5 flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">CHF {stats.monthlyLoss.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground text-center">Pertes estimées CHF</p>
            </div>
          </div>
        )}

        {/* CTA */}
        <Button
          onClick={handleStart}
          size="lg"
          className="rounded-full px-10 py-6 text-base font-semibold shadow-lg shadow-primary/20 gap-2"
        >
          {isAdmin(user) && !supportMode ? 'Accéder au portail admin' : 'Commencer'}
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>

      <footer className="text-center py-4 px-4 text-xs text-muted-foreground/60">
        TrackSmart by <span className="font-semibold text-primary/70">TNO Studio</span> · support@tracksmart.com
      </footer>
    </div>
  );
}