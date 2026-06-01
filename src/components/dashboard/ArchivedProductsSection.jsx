import React, { useState } from 'react';
import { Archive, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { categoryKeys } from '@/lib/productUtils';
import { useLanguage } from '@/lib/LanguageContext';
import LossRecapModal from './LossRecapModal';

export default function ArchivedProductsSection({ products, onDelete }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [showLossRecap, setShowLossRecap] = useState(false);

  const archived = products.filter(p => p.discarded === true);
  if (archived.length === 0) return null;

  const totalLoss = archived.reduce(
    (sum, p) => sum + (p.quantity_thrown || 0) * (p.price_chf || 0),
    0
  );

  return (
    <div className="rounded-2xl border-2 border-blue-200 bg-blue-50/40 shadow-sm overflow-hidden">
      {/* Header toggle */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 sm:px-5 py-4 hover:bg-blue-50 transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <Archive className="w-4 h-4 text-blue-600" />
          <span className="font-semibold text-blue-900 text-sm">
            Produits archivés
          </span>
          <span className="bg-blue-200 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full">
            {archived.length}
          </span>
        </div>
        <div className="flex items-center gap-3">
          {totalLoss > 0 && (
            <button
              onClick={e => { e.stopPropagation(); setShowLossRecap(true); }}
              className="text-xs text-red-600 font-semibold bg-red-50 border border-red-200 px-3 py-1 rounded-full hover:bg-red-100 transition-colors"
            >
              Pertes: CHF {totalLoss.toFixed(2)}
            </button>
          )}
          {open ? (
            <ChevronUp className="w-4 h-4 text-blue-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-blue-500" />
          )}
        </div>
      </button>

      {/* Content */}
      {open && (
        <div className="border-t border-blue-200">
          {/* Desktop table */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-blue-100/60">
                <tr>
                  {['Produit', 'Marque', 'Catégorie', 'Rayon', 'DLC', 'Date archivé', 'Qté jetée', 'Perte CHF', ''].map((h, i) => (
                    <th key={i} className="text-left px-4 py-2.5 font-semibold text-blue-800 whitespace-nowrap text-xs">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {archived.map(p => {
                  const loss = (p.quantity_thrown || 0) * (p.price_chf || 0);
                  return (
                    <tr key={p.id} className="border-t border-blue-100 hover:bg-blue-50/60">
                      <td className="px-4 py-3 font-medium text-foreground max-w-[160px] truncate">{p.name}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{p.marque || '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {p.category ? t(categoryKeys[p.category] || p.category) : '—'}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{p.rayon ? `R${p.rayon}` : '—'}</td>
                      <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                        {p.expiration_date ? format(new Date(p.expiration_date), 'dd/MM/yyyy') : '—'}
                      </td>
                      <td className="px-4 py-3 text-blue-700 text-xs font-medium whitespace-nowrap">
                        {p.discarded_at ? format(new Date(p.discarded_at), 'dd/MM/yyyy') : '—'}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {p.quantity_thrown ?? '—'}
                      </td>
                      <td className="px-4 py-3 font-semibold text-xs">
                        {loss > 0 ? <span className="text-red-600">CHF {loss.toFixed(2)}</span> : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDelete(p)}
                          className="h-7 w-7 text-red-400 hover:text-red-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden space-y-2 p-3">
            {archived.map(p => {
              const loss = (p.quantity_thrown || 0) * (p.price_chf || 0);
              return (
                <div key={p.id} className="bg-white rounded-xl border border-blue-200 px-3 py-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">{p.name}</p>
                      <div className="flex flex-wrap gap-x-2 mt-0.5 text-[11px] text-muted-foreground">
                        {p.marque && <span>{p.marque}</span>}
                        {p.rayon && <span>· R{p.rayon}</span>}
                        {p.discarded_at && (
                          <span className="text-blue-600 font-medium">
                            · Archivé le {format(new Date(p.discarded_at), 'dd/MM/yy')}
                          </span>
                        )}
                        {loss > 0 && (
                          <span className="text-red-600 font-semibold">· CHF {loss.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => onDelete(p)}
                      className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {showLossRecap && (
        <LossRecapModal products={archived} onClose={() => setShowLossRecap(false)} />
      )}
    </div>
  );
}