import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { getProductStatus, getDaysRemaining, statusConfig, categoryKeys, orderStatusConfig } from '@/lib/productUtils';

export default function ProductTable({ products, onEdit, onDelete }) {
  const { t } = useLanguage();

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 shadow-sm border border-border/40 text-center">
        <p className="text-muted-foreground">{t('dash_no_products')}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-border/40 overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/50">
              <TableHead className="font-semibold">{t('dash_product_name')}</TableHead>
              <TableHead className="font-semibold">{t('dash_category')}</TableHead>
              <TableHead className="font-semibold">{t('dash_rayon')}</TableHead>
              <TableHead className="font-semibold">{t('dash_expiration_date')}</TableHead>
              <TableHead className="font-semibold">{t('dash_days_remaining')}</TableHead>
              <TableHead className="font-semibold">{t('dash_status')}</TableHead>
              <TableHead className="font-semibold">{t('dash_order_status')}</TableHead>
              <TableHead className="font-semibold text-right">{t('dash_actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const status = getProductStatus(product.expiration_date);
              const days = getDaysRemaining(product.expiration_date);
              const cfg = statusConfig[status];
              const statusKey = `status_${status}`;
              const isExpired = status === 'expired';

              return (
                <TableRow
                  key={product.id}
                  className={`hover:bg-secondary/30 transition-colors ${isExpired ? 'bg-red-50/40' : ''}`}
                >
                  <TableCell className="font-medium">
                    {product.name}
                    {product.quantity && (
                      <span className="ml-2 text-xs text-muted-foreground">×{product.quantity}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {t(categoryKeys[product.category] || product.category)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {product.rayon ? (
                      <span className="bg-secondary px-2 py-0.5 rounded-full text-xs">{product.rayon}</span>
                    ) : (
                      <span className="text-muted-foreground/50">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {format(new Date(product.expiration_date), 'dd/MM/yyyy')}
                  </TableCell>
                  <TableCell>
                    <span className={`font-medium text-sm ${days < 0 ? 'text-red-600' : days < 3 ? 'text-orange-600' : 'text-foreground'}`}>
                      {days < 0 ? `${days}` : `${days}j`}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className={`${cfg.color} border text-xs font-medium`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} mr-1.5`} />
                      {t(statusKey)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {isExpired && product.order_status ? (
                      <div>
                        <Badge variant="secondary" className={`${orderStatusConfig[product.order_status]?.color} border text-xs font-medium`}>
                          {t(`order_${product.order_status}`)}
                        </Badge>
                        {product.order_date && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(product.order_date), 'dd/MM/yyyy')}
                          </p>
                        )}
                      </div>
                    ) : isExpired ? (
                      <span className="text-xs text-red-400 italic">{t('order_to_order')}</span>
                    ) : (
                      <span className="text-muted-foreground/40 text-xs">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(product)}>
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => onDelete(product)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}