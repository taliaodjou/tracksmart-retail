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
import { ArrowRight, PackageX, AlertTriangle, TrendingDown, Clock, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const floatingOrbs = [
  { size: 300, x: '10%', y: '15%', color: '#C9A646', delay: 0, duration: 8 },
  { size: 200, x: '75%', y: '10%', color: '#C9A646', delay: 2, duration: 10 },
  { size: 150, x: '60%', y: '70%', color: '#f5d47b', delay: 1, duration: 9 },
  { size: 100, x: '20%', y: '65%', color: '#fde68a', delay: 3, duration: 7 },
];

export default function Welcome() {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const canAccess = hasActiveSubscription(user);
  const userIsAdmin = isAdmin(user);

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list('-created_date'),
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

  const hour = today.getHours();
  const greeting = lang === 'fr'
    ? (hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir')
    : (hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening');

  const statCards = [
    {
      icon: PackageX,
      value: stats.expired,
      label: lang === 'fr' ? 'Produits expirés' : 'Expired products',
      bg: 'bg-red-50',
      iconColor: 'text-red-500',
      delay: 0.4,
    },
    {
      icon: AlertTriangle,
      value: stats.urgent,
      label: lang === 'fr' ? 'Produits urgents' : 'Urgent products',
      bg: 'bg-orange-50',
      iconColor: 'text-orange-500',
      delay: 0.5,
    },
    {
      icon: TrendingDown,
      value: `CHF ${stats.monthlyLoss.toFixed(0)}`,
      label: lang === 'fr' ? 'Pertes estimées' : 'Estimated losses',
      bg: 'bg-primary/10',
      iconColor: 'text-primary',
      delay: 0.6,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fafaf8] via-white to-[#f5f0e8] flex flex-col overflow-hidden relative">

      {/* Floating background orbs */}
      {floatingOrbs.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            background: `radial-gradient(circle, ${orb.color}18 0%, transparent 70%)`,
          }}
          animate={{ y: [0, -20, 0], scale: [1, 1.05, 1] }}
          transition={{ duration: orb.duration, delay: orb.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}

      {/* Top bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between px-6 sm:px-10 py-5 relative z-10"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg text-foreground tracking-tight">TrackSmart</span>
        </div>
        <div className="text-xs text-muted-foreground">{capitalizedDate}</div>
      </motion.div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12 text-center relative z-10">

        {/* Avatar / icon */}
        <motion.div
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.1 }}
          className="w-24 h-24 rounded-3xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center mb-6 shadow-lg shadow-primary/10 relative"
        >
          {user?.shop_name ? (
            <span className="text-4xl font-extrabold text-primary">
              {user.shop_name.charAt(0).toUpperCase()}
            </span>
          ) : (
            <Clock className="w-12 h-12 text-primary" />
          )}
          {/* Sparkle badge */}
          <motion.div
            className="absolute -top-2 -right-2 w-7 h-7 bg-primary rounded-full flex items-center justify-center shadow-md"
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </motion.div>
        </motion.div>

        {/* Welcome title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <p className="text-sm font-medium text-muted-foreground mb-1">{greeting} 👋</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground mb-2 leading-tight">
            {user?.shop_name ? (
              <span className="text-primary">{user.shop_name}</span>
            ) : (
              <span className="text-primary">TrackSmart</span>
            )}
          </h1>
          <p className="text-muted-foreground text-sm sm:text-base max-w-md mb-8">
            {lang === 'fr'
              ? 'Votre espace intelligent de suivi des produits et des pertes.'
              : 'Your smart product expiration and loss tracking space.'}
          </p>
        </motion.div>

        {/* Summary cards */}
        {canAccess && !userIsAdmin && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl mb-10">
            {statCards.map((card, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: card.delay }}
                whileHover={{ scale: 1.04, y: -4 }}
                className="bg-white rounded-2xl border border-border/50 shadow-sm p-5 flex flex-col items-center gap-3 cursor-default"
              >
                <motion.div
                  className={`w-11 h-11 rounded-xl ${card.bg} flex items-center justify-center`}
                  whileHover={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 0.4 }}
                >
                  <card.icon className={`w-5 h-5 ${card.iconColor}`} />
                </motion.div>
                <p className="text-3xl font-extrabold text-foreground">{card.value}</p>
                <p className="text-xs text-muted-foreground text-center font-medium">{card.label}</p>
              </motion.div>
            ))}
          </div>
        )}

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.7 }}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          <Button
            onClick={() => navigate('/dashboard')}
            size="lg"
            className="rounded-full px-12 py-6 text-base font-semibold shadow-lg shadow-primary/25 gap-2 group"
          >
            {lang === 'fr' ? 'Commencer' : 'Get Started'}
            <motion.span
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <ArrowRight className="w-5 h-5" />
            </motion.span>
          </Button>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center py-5 px-4 text-xs text-muted-foreground/50 relative z-10"
      >
        TrackSmart · TNO Studio · support@tracksmart.com · +41 77 222 97 64
      </motion.footer>
    </div>
  );
}