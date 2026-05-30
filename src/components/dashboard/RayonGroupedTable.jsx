import React, { useState, useMemo } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { ChevronDown, ChevronRight, TrendingDown } from 'lucide-react';
import ProductTable from './ProductTable';
import { getProductStatus } from '@/lib/productUtils';

// Rayon display labels
function rayonLabel(rayon) {
  if (!rayon) return 'Sans rayon';
  if (rayon.startsWith('Frigo') || rayon.startsWith('Cong')) return rayon;
  return `Rayon ${rayon}`;
}

// Status dot colors for the summary pill
function statusSummary(products) {
  const expired = products.filter(p => getProductStatus(p.expiration_date) === 'expired').length;
  const urgent = products.filter(p => getProductStatus(p.expiration_date) === 'urgent').length;
  const soon = products.filter(p => getProductStatus(p.expiration_date) === 'soon').length;
  return { expired, urgent, soon, total: products.length };
}

function RayonHeader({ rayon, products, open, onClick }) {
  const { expired, urgent, soon, total } = statusSummary(products);
  const hasAlert = expired > 0 || urgent > 0;

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors text-left
        ${open ? 'bg-primary/10 border border-primary/30' : 'bg-white border border-border/40 hover:border-primary/30 hover:bg-secondary/40'}`}
    >
      <div className="flex items-center gap-3">
        {open
          ? <ChevronDown className="w-4 h-4 text-primary flex-shrink-0" />
          : <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        }
        <span className={`font-semibold text-sm ${open ? 'text-primary' : 'text-foreground'}`}>
          {rayonLabel(rayon)}
        </span>
        <span className="text-xs text-muted-foreground font-normal">
          {total} produit{total > 1 ? 's' : ''}
        </span>
      </div>
      <div className="flex items-center gap-1.5">
        {expired > 0 && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
            {expired} expiré{expired > 1 ? 's' : ''}
          </span>
        )}
        {urgent > 0 && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block" />
            {urgent} urgent{urgent > 1 ? 's' : ''}
          </span>
        )}
        {soon > 0 && expired === 0 && urgent === 0 && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 inline-block" />
            {soon} bientôt
          </span>
        )}
        {!hasAlert && expired === 0 && urgent === 0 && soon === 0 && (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
            OK
          </span>
        )}
      </div>
    </button>
  );
}

export default function RayonGroupedTable({ products, onEdit, onDelete, onInlineSave }) {
  // Group products by rayon — only include rayons that actually exist in the data
  const groups = useMemo(() => {
    const map = {};
    for (const p of products) {
      const key = p.rayon || '__none__';
      if (!map[key]) map[key] = [];
      map[key].push(p);
    }
    // Sort: numbered rayons first, then Frigo, then Congélateur, then sans rayon
    const sortKey = (r) => {
      if (r === '__none__') return 'zzz';
      if (/^\d+$/.test(r)) return r.padStart(3, '0');
      if (r.startsWith('Frigo')) return 'a' + r;
      if (r.startsWith('Cong')) return 'b' + r;
      return r;
    };
    return Object.entries(map).sort((a, b) => sortKey(a[0]).localeCompare(sortKey(b[0])));
  }, [products]);

  // Auto-open sections that have alerts, collapse OK ones by default
  const [openRayons, setOpenRayons] = useState(() => {
    const initial = {};
    // Will be populated on first render — we open all by default
    return initial;
  });

  const isOpen = (rayon) => {
    if (rayon in openRayons) return openRayons[rayon];
    // Default: open if has expired/urgent products, closed otherwise
    const prods = groups.find(([r]) => r === rayon)?.[1] || [];
    return prods.some(p => ['expired', 'urgent'].includes(getProductStatus(p.expiration_date)));
  };

  const toggle = (rayon) => setOpenRayons(prev => ({ ...prev, [rayon]: !isOpen(rayon) }));

  const toggleAll = (forceOpen) => {
    const newState = {};
    groups.forEach(([r]) => { newState[r] = forceOpen; });
    setOpenRayons(newState);
  };

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 shadow-sm border border-border/40 text-center">
        <p className="text-muted-foreground text-sm">Aucun produit trouvé</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Toggle all controls */}
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-muted-foreground">{groups.length} rayon{groups.length > 1 ? 's' : ''}</p>
        <div className="flex gap-2">
          <button onClick={() => toggleAll(true)} className="text-xs text-primary hover:underline">Tout ouvrir</button>
          <span className="text-xs text-muted-foreground">·</span>
          <button onClick={() => toggleAll(false)} className="text-xs text-muted-foreground hover:underline">Tout fermer</button>
        </div>
      </div>

      {groups.map(([rayon, rayonProducts]) => (
        <div key={rayon} className="space-y-1">
          <RayonHeader
            rayon={rayon === '__none__' ? null : rayon}
            products={rayonProducts}
            open={isOpen(rayon)}
            onClick={() => toggle(rayon)}
          />
          {isOpen(rayon) && (
            <div className="ml-0 animate-in slide-in-from-top-1 duration-150">
              <ProductTable
                products={rayonProducts}
                onEdit={onEdit}
                onDelete={onDelete}
                onInlineSave={onInlineSave}
              />
            </div>
          )}
        </div>
      ))}

      {/* Grand total losses across all rayons */}
      {(() => {
        const grandTotal = products.reduce((sum, p) => {
          if (p.action === 'jeter' && p.quantity_thrown && p.price_chf) {
            return sum + (p.quantity_thrown * p.price_chf);
          }
          return sum;
        }, 0);
        if (grandTotal <= 0) return null;
        return (
          <div className="mt-4 flex items-center justify-between bg-red-50 border-2 border-red-200 rounded-2xl px-4 py-3">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-600 flex-shrink-0" />
              <span className="font-semibold text-red-800 text-xs">Pertes totales (CHF)</span>
            </div>
            <span className="text-base font-bold text-red-700">CHF {grandTotal.toFixed(2)}</span>
          </div>
        );
      })()}
    </div>
  );
}