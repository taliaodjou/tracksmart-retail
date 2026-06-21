import React, { useState, useMemo } from 'react';
import { ChevronDown, TrendingDown, Trash2 } from 'lucide-react';
import { categoryKeys } from '@/lib/productUtils';

export default function LossRecapByMonth({ products, lang = 'fr' }) {
  const [expandedMonth, setExpandedMonth] = useState(null);

  const monthlyGroups = React.useMemo(() => {
    const map = {};
    const thrown = products.filter(p =>
      p.discarded && p.action === 'jeter' && p.quantity_thrown > 0 && p.price_chf > 0
    );
    thrown.forEach(p => {
      if (!p.discarded_at) return;
      const key = p.discarded_at.substring(0, 7); // "YYYY-MM"
      if (!map[key]) map[key] = { products: [], totalLoss: 0 };
      const loss = (p.quantity_thrown || 0) * (p.price_chf || 0);
      map[key].products.push({ ...p, loss });
      map[key].totalLoss += loss;
    });
    // Sort by month descending
    return Object.entries(map)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([month, data]) => ({
        month,
        label: formatMonthLabel(month, lang),
        ...data,
      }));
  }, [products, lang]);

  if (monthlyGroups.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border">
        <h3 className="font-semibold mb-4 flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-red-500" />
          {lang === 'fr' ? 'Récapitulatif des pertes' : 'Loss Recap'}
        </h3>
        <p className="text-sm text-muted-foreground text-center py-6">
          {lang === 'fr' ? 'Aucun produit jeté enregistré.' : 'No thrown products recorded.'}
        </p>
      </div>
    );
  }

  const grandTotal = monthlyGroups.reduce((s, g) => s + g.totalLoss, 0);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-red-500" />
          {lang === 'fr' ? 'Récapitulatif des pertes' : 'Loss Recap'}
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {monthlyGroups.length} mois
          </span>
          <span className="text-sm font-bold text-red-700">
            CHF {grandTotal.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {monthlyGroups.map(group => {
          const isOpen = expandedMonth === group.month;
          return (
            <div key={group.month} className="border rounded-xl overflow-hidden">
              <button
                onClick={() => setExpandedMonth(isOpen ? null : group.month)}
                className={`w-full flex items-center justify-between px-4 py-3 transition-colors text-left ${
                  isOpen ? 'bg-red-50 border-b border-red-100' : 'hover:bg-secondary/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  <span className="font-semibold text-sm">{group.label}</span>
                  <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full font-medium border border-red-200">
                    {group.products.length} produit{group.products.length > 1 ? 's' : ''}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-3.5 h-3.5 text-red-500" />
                  <span className="text-sm font-bold text-red-700">CHF {group.totalLoss.toFixed(2)}</span>
                </div>
              </button>

              {isOpen && (
                <div className="divide-y">
                  {group.products.map(p => (
                    <div key={p._id || p.id} className="flex items-center justify-between px-4 py-3 bg-red-50/30">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{p.name}</p>
                        <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5 text-xs text-muted-foreground">
                          {p.marque && <span>{p.marque}</span>}
                          {p.category && <span>· {categoryKeys[p.category] || p.category}</span>}
                          {p.rayon && <span>· Rayon {p.rayon}</span>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {p.quantity_thrown} unité{p.quantity_thrown > 1 ? 's' : ''} × CHF {Number(p.price_chf).toFixed(2)}
                          {' '}🗑 {lang === 'fr' ? 'Jeté le' : 'Thrown'} {p.discarded_at || '—'}
                        </p>
                      </div>
                      <div className="ml-4 flex-shrink-0 text-right">
                        <span className="text-sm font-bold text-red-700">CHF {p.loss.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatMonthLabel(monthKey, lang) {
  const [y, m] = monthKey.split('-');
  const monthsFr = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];
  const monthsEn = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  const names = lang === 'fr' ? monthsFr : monthsEn;
  return `${names[parseInt(m) - 1]} ${y}`;
}