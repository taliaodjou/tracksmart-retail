import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { Button } from '@/components/ui/button';
import { Printer, Download } from 'lucide-react';
import { format } from 'date-fns';
import { getProductStatus, getDaysRemaining, categoryKeys, rayonKeys, orderStatusKeys } from '@/lib/productUtils';

export default function ExportActions({ products }) {
  const { t } = useLanguage();

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = [
      t('dash_product_name'),
      t('dash_category'),
      t('dash_rayon'),
      t('dash_expiration_date'),
      t('dash_days_remaining'),
      t('dash_status'),
      t('dash_quantity'),
      t('dash_order_status'),
      t('dash_order_date'),
    ];

    const rows = products.map(p => {
      const status = getProductStatus(p.expiration_date);
      const days = getDaysRemaining(p.expiration_date);
      return [
        p.name,
        t(categoryKeys[p.category] || p.category),
        p.rayon ? t(rayonKeys[p.rayon] || p.rayon) : '',
        format(new Date(p.expiration_date), 'dd/MM/yyyy'),
        days,
        t(`status_${status}`),
        p.quantity || '',
        p.order_status ? t(orderStatusKeys[p.order_status]) : '',
        p.order_date || '',
      ];
    });

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tracksmart_export_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
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