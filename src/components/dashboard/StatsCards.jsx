import React, { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { Package, AlertTriangle, XCircle, TrendingDown } from 'lucide-react';
import { getProductStatus, getDisplayStatus, calculateTotalLoss } from '@/lib/productUtils';
import LossRecapModal from './LossRecapModal';

export default function StatsCards({ products }) {
  const { t } = useLanguage();
  const [showLossRecap, setShowLossRecap] = useState(false);
  const activeProducts = products.filter(p => getDisplayStatus(p) !== 'archived');
  const total = activeProducts.length;
  const expired = activeProducts.filter(p => p.expiration_date && getProductStatus(p.expiration_date) === 'expired').length;
  const urgent = activeProducts.filter(p => p.expiration_date && getProductStatus(p.expiration_date) === 'urgent').length;
  const totalLoss = calculateTotalLoss(products);

  const cards = [
    { label: t('dash_total_products'), value: total, icon: Package, bg: 'bg-primary/10', iconColor: 'text-primary' },
    { label: t('dash_expired_products'), value: expired, icon: XCircle, bg: 'bg-red-50', iconColor: 'text-red-500' },
    { label: t('dash_urgent_products'), value: urgent, icon: AlertTriangle, bg: 'bg-orange-50', iconColor: 'text-orange-500' },
    { label: 'Total pertes', value: `CHF ${totalLoss.toFixed(2)}`, icon: TrendingDown, bg: 'bg-red-50', iconColor: 'text-red-600', clickable: true },
  ];

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4">
        {cards.map((card, i) => {
          const content = (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex flex-col justify-between h-full min-w-0">
                <p className="text-xs sm:text-sm text-muted-foreground leading-tight min-h-[2.5em]">{card.label}</p>
                <p className={`text-xl sm:text-3xl font-bold mt-0.5 sm:mt-1 ${card.clickable ? 'text-red-700' : 'text-foreground'}`}>{card.value}</p>
              </div>
              <div className={`hidden sm:flex w-12 h-12 rounded-xl ${card.bg} items-center justify-center`}>
                <card.icon className={`w-6 h-6 ${card.iconColor}`} />
              </div>
            </div>
          );

          return card.clickable ? (
            <button
              key={i}
              type="button"
              onClick={() => setShowLossRecap(true)}
              className="text-left bg-red-50 rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-sm border border-red-200 hover:bg-red-100 transition-colors"
              title="Voir le détail des pertes"
            >
              {content}
            </button>
          ) : (
            <div key={i} className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-sm border border-border/40">
              {content}
            </div>
          );
        })}
      </div>

      {showLossRecap && (
        <LossRecapModal products={products} onClose={() => setShowLossRecap(false)} />
      )}
    </>
  );
}