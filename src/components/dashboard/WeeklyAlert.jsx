import React, { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { getProductStatus, getDaysRemaining, statusConfig } from '@/lib/productUtils';
import { AlertTriangle, X } from 'lucide-react';

export default function WeeklyAlert({ products }) {
  const { t, lang } = useLanguage();
  const [popup, setPopup] = useState(null); // product or null

  const watchProducts = products.filter(p => {
    const status = getProductStatus(p.expiration_date);
    return status === 'expired' || status === 'urgent' || status === 'soon';
  });

  if (watchProducts.length === 0) return null;

  return (
    <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 relative">
      <div className="flex items-center gap-2 mb-3">
        <AlertTriangle className="w-5 h-5 text-orange-600" />
        <h3 className="font-semibold text-orange-900">{t('dash_weekly_summary')}</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {watchProducts.slice(0, 10).map(p => {
          const days = getDaysRemaining(p.expiration_date);
          const status = getProductStatus(p.expiration_date);
          return (
            <button
              key={p.id}
              onClick={() => setPopup(p)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border cursor-pointer hover:opacity-80 transition-opacity ${statusConfig[status].color}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[status].dot}`} />
              {p.name} ({days}j)
            </button>
          );
        })}
        {watchProducts.length > 10 && (
          <span className="text-xs text-orange-600 self-center">+{watchProducts.length - 10}</span>
        )}
      </div>

      {/* Mini popup */}
      {popup && (
        <div className="absolute left-4 right-4 top-full mt-2 z-50 bg-white border border-border shadow-lg rounded-xl p-4 text-sm">
          <div className="flex items-center justify-between mb-2">
            <p className="font-semibold text-foreground truncate">{popup.name}</p>
            <button onClick={() => setPopup(null)} className="text-muted-foreground hover:text-foreground ml-2 flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-1 text-xs text-muted-foreground">
            {popup.marque && <p><span className="font-medium text-foreground">{lang === 'fr' ? 'Marque' : 'Brand'} :</span> {popup.marque}</p>}
            {popup.rayon && <p><span className="font-medium text-foreground">{lang === 'fr' ? 'Rayon' : 'Shelf'} :</span> {popup.rayon}</p>}
            {popup.expiration_date && <p><span className="font-medium text-foreground">DLC :</span> {popup.expiration_date}</p>}
          </div>
        </div>
      )}
    </div>
  );
}