import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { Package, XCircle, TrendingDown } from 'lucide-react';
import { getProductStatus } from '@/lib/productUtils';

export default function StatsCards({ products }) {
  const { t } = useLanguage();
  const total = products.length;
  const expired = products.filter(p => p.expiration_date && getProductStatus(p.expiration_date) === 'expired').length;
  const totalLoss = products
    .filter(p => p.action === 'jeter' && p.quantity_thrown && p.price_chf)
    .reduce((sum, p) => sum + (p.quantity_thrown * p.price_chf), 0);

  const cards = [
    { label: t('dash_total_products'),   value: total,   icon: Package,       bg: 'bg-primary/10',  iconColor: 'text-primary' },
    { label: t('dash_expired_products'), value: expired, icon: XCircle,       bg: 'bg-red-50',      iconColor: 'text-red-500' },
    { label: 'Pertes totales', value: `CHF ${totalLoss.toFixed(2)}`, icon: TrendingDown, bg: 'bg-orange-50', iconColor: 'text-orange-500' },
  ];

  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4">
      {cards.map((card, i) => (
        <div key={i} className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-sm border border-border/40">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex flex-col justify-between h-full">
              <p className="text-xs sm:text-sm text-muted-foreground leading-tight min-h-[2.5em]">{card.label}</p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground mt-0.5 sm:mt-1">{card.value}</p>
            </div>
            <div className={`hidden sm:flex w-12 h-12 rounded-xl ${card.bg} items-center justify-center`}>
              <card.icon className={`w-6 h-6 ${card.iconColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}