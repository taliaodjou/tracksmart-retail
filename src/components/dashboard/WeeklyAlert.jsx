import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { getProductStatus, getDaysRemaining, statusConfig, categoryKeys } from '@/lib/productUtils';
import { AlertTriangle } from 'lucide-react';

export default function WeeklyAlert({ products }) {
  const { t } = useLanguage();

  const watchProducts = products.filter(p => {
    const status = getProductStatus(p.expiration_date);
    return status === 'expired' || status === 'urgent' || status === 'soon';
  });

  if (watchProducts.length === 0) return null;

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-5 h-5 text-orange-600" />
        <h3 className="font-semibold text-orange-900">{t('dash_weekly_summary')}</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {watchProducts.slice(0, 8).map(p => {
          const days = getDaysRemaining(p.expiration_date);
          const status = getProductStatus(p.expiration_date);
          return (
            <span
              key={p.id}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${statusConfig[status].color}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[status].dot}`} />
              {p.name} ({days}j)
            </span>
          );
        })}
        {watchProducts.length > 8 && (
          <span className="text-xs text-orange-600 self-center">+{watchProducts.length - 8}</span>
        )}
      </div>
    </div>
  );
}