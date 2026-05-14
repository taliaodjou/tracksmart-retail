import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/LanguageContext';
import { Button } from '@/components/ui/button';
import { getProductStatus, hasActiveSubscription } from '@/lib/productUtils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowRight, PackageX, AlertTriangle, TrendingDown, Sparkles } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { base44 as b44 } from '@/api/base44Client';

export default function Welcome() {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const navigate = useNavigate();
  const canAccess = hasActiveSubscription(user);

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list('-created_date'),
    enabled: canAccess,
  });

  const stats = useMemo(() => {
    const expired = products.filter(p => getProductStatus(p.expiration_date) === 'expired');
    const urgent = products.filter(p => getProductStatus(p.expiration_date) === 'urgent');
    const thisMonth = new Date();
    const monthlyLoss = products
      .filter(p => {
        const s = getProductStatus(p.expiration_date);
        return s === 'expired';
      })
      .reduce((sum, p) => sum + ((p.quantity_thrown || 0) * (p.price_chf || 0)), 0);
    return { expired: expired.length, urgent: urgent.length, monthlyLoss };
  }, [products]);

  const handleStart = () => navigate('/dashboard');

  const today = new Date();
  const dateStr = lang === 'fr'
    ? format(today, 'EEEE d MMMM yyyy', { locale: fr })
    : format(today, 'EEEE, MMMM d yyyy');
  const capitalizedDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fafaf8] via-white to-[#f5f0e8] flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
            <span className="text-primary-foreground font-bold text-sm">TS</span>
          </div>
          <span className="font-bold text-foreground tracking-tight">TrackSmart</span>
        </div>
        <LanguageSwitcher />
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 text-center">
        {/* Gold sparkle icon */}
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-6 shadow-sm">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>

        {/* Welcome title */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-2 leading-tight">
          {lang === 'fr' ? 'Bienvenue sur TrackSmart' : 'Welcome to TrackSmart'}
          {user?.shop_name && (
            <span className="block text-primary mt-1">{user.shop_name}</span>
          )}
        </h1>

        <p className="text-muted-foreground text-base sm:text-lg max-w-md mb-2">
          {lang === 'fr'
            ? 'Votre espace intelligent de suivi des produits et des pertes.'
            : 'Your smart product expiration and loss tracking space.'}
        </p>

        <p className="text-sm text-muted-foreground/70 mb-10">{capitalizedDate}</p>

        {/* Summary cards */}
        {canAccess && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl mb-10">
            <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-5 flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <PackageX className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.expired}</p>
              <p className="text-xs text-muted-foreground text-center">
                {lang === 'fr' ? 'Produits expirés' : 'Expired products'}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-5 flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.urgent}</p>
              <p className="text-xs text-muted-foreground text-center">
                {lang === 'fr' ? 'Produits urgents' : 'Urgent products'}
              </p>
            </div>
            <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-5 flex flex-col items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-primary" />
              </div>
              <p className="text-2xl font-bold text-foreground">CHF {stats.monthlyLoss.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground text-center">
                {lang === 'fr' ? 'Pertes estimées du mois' : 'Estimated monthly losses'}
              </p>
            </div>
          </div>
        )}

        {/* CTA */}
        <Button
          onClick={handleStart}
          size="lg"
          className="rounded-full px-10 py-6 text-base font-semibold shadow-lg shadow-primary/20 gap-2 hover:gap-3 transition-all"
        >
          {lang === 'fr' ? 'Commencer' : 'Get Started'}
          <ArrowRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Footer */}
      <footer className="text-center py-4 px-4 text-xs text-muted-foreground/60">
        Powered by TrackSmart · support@tracksmart.com · +41 77 222 97 64
      </footer>
    </div>
  );
}