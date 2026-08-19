import React, { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { Package, AlertTriangle, XCircle, TrendingDown, Banknote } from 'lucide-react';
import { getCoreProductMetrics } from '@/lib/productUtils';
import LossRecapModal from './LossRecapModal';

export default function StatsCards({ products, movements = [] }) {
  const { t } = useLanguage();
  const [showLossRecap, setShowLossRecap] = useState(false);
  const { totalProducts: total, expiredProducts: expired, urgentProducts: urgent, totalLoss, stockValue } = getCoreProductMetrics(products);
  const productPrices = new Map((products || []).map((product) => [product.id, Number(product.price_chf) || 0]));
  const movementLoss = (movements || [])
    .filter((movement) => movement.type === 'perte')
    .reduce((sum, movement) => sum + (Number(movement.quantity) || 0) * (productPrices.get(movement.product_id) || 0), 0);
  const syncedTotalLoss = totalLoss + movementLoss;

  const cards = [
    { label: t('dash_total_products'), value: total, icon: Package, bg: 'bg-primary/10', iconColor: 'text-primary' },
    { label: t('dash_expired_products'), value: expired, icon: XCircle, bg: 'bg-red-50', iconColor: 'text-red-500' },
    { label: t('dash_urgent_products'), value: urgent, icon: AlertTriangle, bg: 'bg-orange-50', iconColor: 'text-orange-500' },
    { label: 'Total pertes', value: `CHF ${syncedTotalLoss.toFixed(2)}`, icon: TrendingDown, bg: 'bg-red-50', iconColor: 'text-red-600', clickable: true },
    { label: 'Valeur du stock', value: `CHF ${stockValue.toFixed(2)}`, icon: Banknote, bg: 'bg-green-100', iconColor: 'text-green-700', cardBg: 'bg-green-50 border-green-200' },
  ];

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-4">
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
            <div key={i} className={`${card.cardBg || 'bg-white border-border/40'} rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-sm border`}>
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