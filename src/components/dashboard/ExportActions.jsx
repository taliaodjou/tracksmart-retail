import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { Button } from '@/components/ui/button';
import { Printer, Download } from 'lucide-react';
import { format } from 'date-fns';
import { getProductStatus, getDaysRemaining, categoryKeys, rayonKeys, orderStatusKeys } from '@/lib/productUtils';

export default function ExportActions({ products }) {
  const { t } = useLanguage();

  // Print only expired + soon products
  const handlePrint = () => {
    const printable = products.filter(p => {
      const s = getProductStatus(p.expiration_date);
      return s === 'expired' || s === 'urgent' || s === 'soon';
    });

    const rows = printable.map(p => {
      const s = getProductStatus(p.expiration_date);
      const days = getDaysRemaining(p.expiration_date);
      return `<tr>
        <td>${p.name}</td>
        <td>${t(categoryKeys[p.category] || p.category)}</td>
        <td>${p.rayon ? 'Rayon ' + p.rayon : '—'}</td>
        <td>${format(new Date(p.expiration_date), 'dd/MM/yyyy')}</td>
        <td>${days}j</td>
        <td>${t('status_' + s)}</td>
        <td>${p.order_status ? t(orderStatusKeys[p.order_status]) : '—'}</td>
      </tr>`;
    }).join('');

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<title>TrackSmart — ${t('dash_print')}</title>
<style>
body { font-family: Arial, sans-serif; font-size: 12px; }
h1 { font-size: 16px; margin-bottom: 8px; }
table { width: 100%; border-collapse: collapse; }
th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
th { background: #f5f5f5; font-weight: bold; }
</style>
</head><body>
<h1>TrackSmart — Produits expirés / bientôt expirés (${format(new Date(), 'dd/MM/yyyy')})</h1>
<table>
<thead><tr>
<th>Produit</th><th>Catégorie</th><th>Rayon</th><th>Expiration</th><th>Jours</th><th>Statut</th><th>Commande</th>
</tr></thead>
<tbody>${rows}</tbody>
</table>
</body></html>`;

    const w = window.open('', '_blank');
    w.document.write(html);
    w.document.close();
    w.print();
  };

  const handleExportCSV = () => {
    const headers = [
      'Produit', 'Marque', 'Catégorie', 'Rayon', 'Date réception', 'DLC',
      'Jours restants', 'Statut', 'Action', 'Date commande',
      'Quantité jetée', 'Prix CHF', 'Total CHF',
    ];

    const rows = products.map(p => {
      const status = getProductStatus(p.expiration_date);
      const days = getDaysRemaining(p.expiration_date);
      const total = (p.quantity_thrown || 0) * (p.price_chf || 0);
      const actionLabels = { jeter: 'Jeter', a_recommander: 'À recommander', commande: 'Commandé', en_transition: 'En transition', recu: 'Reçu' };
      return [
        p.name,
        p.marque || '',
        p.category ? t(categoryKeys[p.category] || p.category) : '',
        p.rayon ? `Rayon ${p.rayon}` : '',
        p.reception_date || '',
        p.expiration_date ? format(new Date(p.expiration_date), 'dd/MM/yyyy') : '',
        days,
        t(`status_${status}`),
        p.action ? (actionLabels[p.action] || p.action) : '',
        p.order_date || '',
        p.quantity_thrown ?? '',
        p.price_chf ?? '',
        total > 0 ? total.toFixed(2) : '',
      ];
    });

    const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tracksmart_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" className="rounded-full gap-2" onClick={handlePrint}>
        <Printer className="w-4 h-4" />
        {t('dash_print')}
      </Button>
      <Button variant="outline" size="sm" className="rounded-full gap-2" onClick={handleExportCSV}>
        <Download className="w-4 h-4" />
        {t('dash_export_csv')}
      </Button>
    </div>
  );
}