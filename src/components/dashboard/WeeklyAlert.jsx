import React, { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { getProductStatus, getDaysRemaining, statusConfig } from '@/lib/productUtils';
import { AlertTriangle, X, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

const PREVIEW_COUNT = 10;

export default function WeeklyAlert({ products }) {
  const { t, lang } = useLanguage();
  const [popup, setPopup] = useState(null); // single product popup
  const [showAll, setShowAll] = useState(false); // full list modal

  const watchProducts = products.filter(p => {
    const status = getProductStatus(p.expiration_date);
    return status === 'expired' || status === 'urgent' || status === 'soon';
  });

  if (watchProducts.length === 0) return null;

  const extra = watchProducts.length - PREVIEW_COUNT;
  const visible = watchProducts.slice(0, PREVIEW_COUNT);

  return (
    <>
      <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 relative">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-5 h-5 text-orange-600" />
          <h3 className="font-semibold text-orange-900">{t('dash_weekly_summary')}</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {visible.map(p => {
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
          {extra > 0 && (
            <button
              onClick={() => setShowAll(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold border border-orange-300 bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors"
            >
              +{extra} <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Single product mini popup */}
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
              {popup.expiration_date && <p><span className="font-medium text-foreground">DLC :</span> {format(new Date(popup.expiration_date), 'dd/MM/yyyy')}</p>}
            </div>
          </div>
        )}
      </div>

      {/* Full list bottom sheet modal */}
      {showAll && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center" onClick={() => setShowAll(false)}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-md max-h-[80vh] flex flex-col shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Handle bar (mobile) */}
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                <h2 className="font-semibold text-foreground text-sm">
                  {lang === 'fr' ? 'Produits à surveiller' : 'Products to watch'} ({watchProducts.length})
                </h2>
              </div>
              <button onClick={() => setShowAll(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1 px-4 py-3 space-y-2">
              {watchProducts.map(p => {
                const status = getProductStatus(p.expiration_date);
                const days = getDaysRemaining(p.expiration_date);
                const cfg = statusConfig[status];
                return (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm ${cfg.color}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                      <div className="min-w-0">
                        <p className="font-medium truncate">{p.name}</p>
                        {p.marque && <p className="text-xs opacity-70 truncate">{p.marque}</p>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end flex-shrink-0 ml-3 text-xs">
                      <span className="font-semibold">{days}j</span>
                      {p.rayon && <span className="opacity-60">R{p.rayon}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}