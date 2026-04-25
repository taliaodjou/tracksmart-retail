import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { Package, AlertTriangle, XCircle } from 'lucide-react';
import { getProductStatus } from '@/lib/productUtils';

export default function StatsCards({ products }) {
  const { t } = useLanguage();

  const total = products.length;
  const expired = products.filter(p => getProductStatus(p.expiration_date) === 'expired').length;
  const urgent = products.filter(p => getProductStatus(p.expiration_date) === 'urgent').length;

  const cards = [
    { label: t('dash_total_products'), value: total, icon: Package, bg: 'bg-primary/10', iconColor: 'text-primary' },
    { label: t('dash_expired_products'), value: expired, icon: XCircle, bg: 'bg-red-50', iconColor: 'text-red-500' },
    { label: t('dash_urgent_products'), value: urgent, icon: AlertTriangle, bg: 'bg-orange-50', iconColor: 'text-orange-500' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {cards.map((card, i) => (
        <div key={i} className="bg-white rounded-2xl p-6 shadow-sm border border-border/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <p className="text-3xl font-bold text-foreground mt-1">{card.value}</p>
            </div>
            <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center`}>
              <card.icon className={`w-6 h-6 ${card.iconColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}