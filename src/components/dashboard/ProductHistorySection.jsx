import React, { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/LanguageContext';
import { format } from 'date-fns';
import { History, Trash2, Package, ShoppingCart, CheckCircle2, ArrowRightLeft, RefreshCw, Edit3 } from 'lucide-react';

const ACTION_CONFIG = {
  jeter:         { label: 'Jeté',         icon: Trash2,        color: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-200' },
  commande:      { label: 'Commandé',     icon: ShoppingCart,  color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200' },
  recu:          { label: 'Reçu',         icon: CheckCircle2,  color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-200' },
  a_recommander: { label: 'À recommander',icon: RefreshCw,     color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  en_transition: { label: 'En transition',icon: ArrowRightLeft,color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  modifie:       { label: 'Modifié',      icon: Edit3,         color: 'text-gray-600',   bg: 'bg-gray-50',   border: 'border-gray-200' },
};

export default function ProductHistorySection({ productId }) {
  const { lang } = useLanguage();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productId) return;
    setLoading(true);
    base44.entities.ProductHistory.filter({ product_id: productId }, '-created_date', 20)
      .then(setHistory)
      .finally(() => setLoading(false));
  }, [productId]);

  if (!productId) return null;

  const title = lang === 'fr' ? 'Historique' : 'History';
  const noHistory = lang === 'fr' ? 'Aucune action enregistrée.' : 'No actions recorded yet.';

  if (loading) {
    return (
      <div className="sm:col-span-2 border-t border-border/30 pt-3">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
          <History className="w-3.5 h-3.5" /> {title}
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-3.5 h-3.5 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin" />
          {lang === 'fr' ? 'Chargement…' : 'Loading…'}
        </div>
      </div>
    );
  }

  return (
    <div className="sm:col-span-2 border-t border-border/30 pt-3">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-1.5">
        <History className="w-3.5 h-3.5" /> {title}
        {history.length > 0 && (
          <span className="bg-muted text-muted-foreground rounded-full px-1.5 py-0.5 text-[10px] font-medium">{history.length}</span>
        )}
      </p>

      {history.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">{noHistory}</p>
      ) : (
        <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
          {history.map(entry => {
            const cfg = ACTION_CONFIG[entry.action] || ACTION_CONFIG.modifie;
            const Icon = cfg.icon;
            const total = entry.quantity && entry.price_chf
              ? (entry.quantity * entry.price_chf).toFixed(2)
              : null;
            const dateStr = entry.action_date
              ? format(new Date(entry.action_date), 'dd/MM/yyyy')
              : entry.created_date
                ? format(new Date(entry.created_date), 'dd/MM/yy')
                : '—';

            return (
              <div key={entry.id} className={`flex items-start gap-2.5 rounded-lg border px-3 py-2 ${cfg.bg} ${cfg.border}`}>
                <Icon className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${cfg.color}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-xs font-semibold ${cfg.color}`}>{cfg.label}</span>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap">{dateStr}</span>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-0.5">
                    {entry.quantity != null && (
                      <span className="text-xs text-muted-foreground">Qté : <strong>{entry.quantity}</strong></span>
                    )}
                    {entry.price_chf != null && (
                      <span className="text-xs text-muted-foreground">Prix : <strong>CHF {entry.price_chf}</strong></span>
                    )}
                    {total && (
                      <span className={`text-xs font-bold ${cfg.color}`}>= CHF {total}</span>
                    )}
                    {entry.note && (
                      <span className="text-xs text-muted-foreground italic">{entry.note}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}