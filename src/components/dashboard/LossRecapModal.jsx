import React from 'react';
import { X, TrendingDown, Package } from 'lucide-react';
import { format } from 'date-fns';
import { buildLossRecords, categoryKeys } from '@/lib/productUtils';
import { useLanguage } from '@/lib/LanguageContext';

export default function LossRecapModal({ products, movements = [], onClose }) {
  const { t } = useLanguage();
  const lossRecords = buildLossRecords(products, movements);
  const grandTotal = lossRecords.reduce((sum, record) => sum + record.loss, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[85vh] flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle mobile */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-border" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/40 flex-shrink-0">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-4 h-4 text-red-600" />
            <h2 className="font-semibold text-foreground text-sm">Récapitulatif des pertes</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Total banner */}
        <div className="flex items-center justify-between bg-red-50 border-b border-red-200 px-5 py-3 flex-shrink-0">
          <span className="text-sm font-semibold text-red-800">Total des pertes enregistrées</span>
          <span className="text-xl font-bold text-red-700">CHF {grandTotal.toFixed(2)}</span>
        </div>

        {/* Product list */}
        <div className="overflow-y-auto flex-1 px-4 py-3">
          {lossRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center gap-2">
              <Package className="w-8 h-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">Aucun produit jeté enregistré</p>
            </div>
          ) : (
            <div className="space-y-2">
              {lossRecords.map(p => {
                const total = p.loss;
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between bg-red-50/60 border border-red-100 rounded-xl px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm text-foreground truncate">{p.name}</p>
                      <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5 text-xs text-muted-foreground">
                        {p.marque && <span>{p.marque}</span>}
                        {p.category && <span>· {t(categoryKeys[p.category] || p.category)}</span>}
                        {p.rayon && <span>· Rayon {p.rayon}</span>}
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-muted-foreground">
                        <span>{p.quantity} unité{p.quantity > 1 ? 's' : ''} × CHF {Number(p.unit_price).toFixed(2)}</span>
                        {p.loss_date && (
                        <span className="text-red-500 font-medium">
                          Jeté le {format(new Date(p.loss_date), 'dd/MM/yyyy')}
                        </span>
                        )}
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0 text-right">
                      <span className="text-sm font-bold text-red-700">CHF {total.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}