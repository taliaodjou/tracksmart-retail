import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { getProductStatus, getDaysRemaining, statusConfig, categoryKeys } from '@/lib/productUtils';

const actionLabels = {
  jeter: 'Jeter',
  a_recommander: 'À recommander',
  commande: 'Commandé',
  en_transition: 'En transition',
  recu: 'Reçu',
};

export default function ProductTable({ products, onEdit, onDelete }) {
  const { t } = useLanguage();

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 shadow-sm border border-border/40 text-center">
        <p className="text-muted-foreground text-sm">{t('dash_no_products')}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-border/40 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/40">
            <tr>
              {['Produit', 'Marque', 'Catégorie', 'Rayon', 'DLC', 'Jours', 'Statut', 'Action', 'Qté jetée', 'Total CHF', ''].map((h, i) => (
                <th key={i} className="text-left px-4 py-3 font-semibold text-foreground whitespace-nowrap text-xs">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map(p => {
              const status = getProductStatus(p.expiration_date);
              const days = getDaysRemaining(p.expiration_date);
              const cfg = statusConfig[status];
              const total = (p.quantity_thrown || 0) * (p.price_chf || 0);
              const isExpired = status === 'expired';

              return (
                <tr key={p.id} className={`border-t border-border/30 hover:bg-secondary/20 ${isExpired ? 'bg-red-50/40' : status === 'urgent' ? 'bg-orange-50/40' : status === 'soon' ? 'bg-yellow-50/20' : ''}`}>
                  <td className="px-4 py-3 font-medium text-foreground max-w-[160px] truncate">{p.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.marque || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {p.category ? t(categoryKeys[p.category] || p.category) : '—'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.rayon ? `R${p.rayon}` : '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                    {p.expiration_date ? format(new Date(p.expiration_date), 'dd/MM/yyyy') : '—'}
                  </td>
                  <td className="px-4 py-3 font-medium" style={{ color: isExpired ? '#dc2626' : days < 3 ? '#ea580c' : days < 14 ? '#ca8a04' : '#16a34a' }}>
                    {days}j
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                      {t('status_' + status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {isExpired && p.action ? actionLabels[p.action] || p.action : '—'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {isExpired && p.quantity_thrown != null ? p.quantity_thrown : '—'}
                  </td>
                  <td className="px-4 py-3 font-medium text-red-700">
                    {isExpired && total > 0 ? `${total.toFixed(2)}` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={() => onEdit(p)} className="h-7 w-7">
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(p)} className="h-7 w-7 text-red-400 hover:text-red-600">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}