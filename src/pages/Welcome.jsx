import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/LanguageContext';
import { Button } from '@/components/ui/button';
import { getProductStatus, hasActiveSubscription, isAdmin } from '@/lib/productUtils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowRight, PackageX, AlertTriangle, TrendingDown, Clock } from 'lucide-react';

export default function Welcome() {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const canAccess = hasActiveSubscription(user);
  const userIsAdmin = isAdmin(user);

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list('-created_date'),
    // Admin ne charge pas les produits sur la page Welcome
    enabled: canAccess && !userIsAdmin,
  });

  const stats = useMemo(() => {
    const expired = products.filter(p => getProductStatus(p.expiration_date) === 'expired');
    const urgent = products.filter(p => getProductStatus(p.expiration_date) === 'urgent');
    const monthlyLoss = products
      .filter(p => getProductStatus(p.expiration_date) === 'expired')
      .reduce((sum, p) => sum + ((p.quantity_thrown || 0) * (p.price_chf || 0)), 0);
    return { expired: expired.length, urgent: urgent.length, monthlyLoss };
  }, [products]);

  const today = new Date();
  const dateStr = lang === 'fr'
    ? format(today, 'EEEE d MMMM yyyy', { locale: fr })
    : format(today, 'EEEE, MMMM d yyyy');
  const capitalizedDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

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
        <div className="text-xs text-muted-foreground">{capitalizedDate}</div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 text-center">
        {/* Avatar / icon */}
        <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-8 shadow-sm">
          {user?.shop_name ? (
            <span className="text-3xl font-extrabold text-primary">
              {user.shop_name.charAt(0).toUpperCase()}
            </span>
          ) : (
            <Clock className="w-10 h-10 text-primary" />
          )}
        </div>

        {/* Welcome title */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-2 leading-tight">
          {lang === 'fr' ? 'Bienvenue,' : 'Welcome,'}
          {user?.shop_name ? (
            <span className="block text-primary mt-1">{user.shop_name}</span>
          ) : (
            <span className="block text-primary mt-1">TrackSmart</span>
          )}
        </h1>

        <p className="text-muted-foreground text-base sm:text-lg max-w-md mb-2">
          {lang === 'fr'
            ? 'Votre espace intelligent de suivi des produits et des pertes.'
            : 'Your smart product expiration and loss tracking space.'}
        </p>

        <p className="text-xs text-muted-foreground/50 mb-10">{capitalizedDate}</p>

        {/* Summary cards */}
        {canAccess && !userIsAdmin && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl mb-10">
            <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-5 flex flex-col items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
                <PackageX className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-3xl font-extrabold text-foreground">{stats.expired}</p>
              <p className="text-xs text-muted-foreground text-center font-medium">
                {lang === 'fr' ? 'Produits expirés' : 'Expired products'}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-5 flex flex-col items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-orange-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-3xl font-extrabold text-foreground">{stats.urgent}</p>
              <p className="text-xs text-muted-foreground text-center font-medium">
                {lang === 'fr' ? 'Produits urgents' : 'Urgent products'}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-5 flex flex-col items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-primary" />
              </div>
              <p className="text-3xl font-extrabold text-foreground">CHF {stats.monthlyLoss.toFixed(0)}</p>
              <p className="text-xs text-muted-foreground text-center font-medium">
                {lang === 'fr' ? 'Pertes estimées' : 'Estimated losses'}
              </p>
            </div>
          </div>
        )}

        {/* CTA */}
        <Button
          onClick={() => navigate('/dashboard')}
          size="lg"
          className="rounded-full px-12 py-6 text-base font-semibold shadow-lg shadow-primary/20 gap-2 hover:gap-3 transition-all"
        >
          {lang === 'fr' ? 'Commencer' : 'Get Started'}
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Footer */}
      <footer className="text-center py-5 px-4 text-xs text-muted-foreground/50">
        TrackSmart · TNO Studio · support@tracksmart.com · +41 77 222 97 64
      </footer>
    </div>
  );
}