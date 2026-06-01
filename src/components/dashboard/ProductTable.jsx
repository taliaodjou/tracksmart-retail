import React, { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { getProductStatus, getDisplayStatus, getDaysRemaining, statusConfig, categoryKeys, rayonKeys, calculateTotalLoss } from '@/lib/productUtils';

const ACTION_KEYS = {
  jeter: 'action_jeter',
  a_recommander: 'action_a_recommander',
  commande: 'action_commande',
  en_transition: 'action_en_transition',
  recu: 'action_recu',
};

function InlineEditRow({ product, onSave, onCancel }) {
  const { t } = useLanguage();
  const actionOptions = Object.entries(ACTION_KEYS).map(([value, key]) => ({ value, key }));
  const [form, setForm] = useState({
    name: product.name || '',
    marque: product.marque || '',
    category: product.category || '',
    rayon: product.rayon || '',
    expiration_date: product.expiration_date || '',
    reception_date: product.reception_date || '',
    action: product.action || '',
    quantity_thrown: product.quantity_thrown ?? '',
    price_chf: product.price_chf ?? '',
  });

  const status = getProductStatus(form.expiration_date);
  const isExpired = status === 'expired';

  return (
    <tr className="bg-amber-50/60 border-t border-amber-200">
      {/* Produit */}
      <td className="px-3 py-2">
        <Input
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          className="h-7 text-xs min-w-[120px]"
        />
      </td>
      {/* Marque */}
      <td className="px-3 py-2">
        <Input
          value={form.marque}
          onChange={e => setForm(f => ({ ...f, marque: e.target.value }))}
          className="h-7 text-xs min-w-[90px]"
        />
      </td>
      {/* Catégorie */}
      <td className="px-3 py-2">
        <Select value={form.category || '__none__'} onValueChange={v => setForm(f => ({ ...f, category: v === '__none__' ? '' : v }))}>
          <SelectTrigger className="h-7 text-xs min-w-[120px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">—</SelectItem>
            {Object.entries(categoryKeys).map(([v, k]) => (
              <SelectItem key={v} value={v}>{t(k)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      {/* Rayon */}
      <td className="px-3 py-2">
        <Select value={form.rayon || '__none__'} onValueChange={v => setForm(f => ({ ...f, rayon: v === '__none__' ? '' : v }))}>
          <SelectTrigger className="h-7 text-xs w-20"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">—</SelectItem>
            {Object.keys(rayonKeys).map(r => (
              <SelectItem key={r} value={r}>R{r}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </td>
      {/* DLC */}
      <td className="px-3 py-2">
        <Input
          type="date"
          value={form.expiration_date}
          onChange={e => setForm(f => ({ ...f, expiration_date: e.target.value }))}
          className="h-7 text-xs w-32"
        />
      </td>
      {/* Jours */}
      <td className="px-3 py-2 text-xs text-muted-foreground">
        {form.expiration_date ? `${getDaysRemaining(form.expiration_date)}j` : '—'}
      </td>
      {/* Statut */}
      <td className="px-3 py-2">
        {form.expiration_date ? (
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${statusConfig[status]?.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[status]?.dot}`} />
            {t('status_' + status)}
          </span>
        ) : '—'}
      </td>
      {/* Action */}
      <td className="px-3 py-2">
        {isExpired ? (
          <Select value={form.action || '__none__'} onValueChange={v => setForm(f => ({ ...f, action: v === '__none__' ? '' : v, quantity_thrown: '', price_chf: '' }))}>
            <SelectTrigger className="h-7 text-xs min-w-[100px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">—</SelectItem>
              {actionOptions.map(o => <SelectItem key={o.value} value={o.value}>{t(o.key)}</SelectItem>)}
            </SelectContent>
          </Select>
        ) : <span className="text-xs text-muted-foreground">—</span>}
      </td>
      {/* Qté */}
      <td className="px-3 py-2">
        {isExpired && form.action === 'jeter' ? (
          <Input
            type="number"
            min="0"
            value={form.quantity_thrown}
            onChange={e => setForm(f => ({ ...f, quantity_thrown: e.target.value }))}
            className="h-7 text-xs w-16"
            placeholder="0"
          />
        ) : <span className="text-xs text-muted-foreground">—</span>}
      </td>
      {/* Prix / Total CHF */}
      <td className="px-3 py-2">
        {isExpired && form.action === 'jeter' ? (
          <div className="space-y-1">
            <Input
              type="number"
              min="0"
              step="0.01"
              value={form.price_chf}
              onChange={e => setForm(f => ({ ...f, price_chf: e.target.value }))}
              className="h-7 text-xs w-20"
              placeholder="CHF"
            />
            {form.quantity_thrown && form.price_chf && (
              <p className="text-xs font-semibold text-red-600">
                = CHF {((parseFloat(form.quantity_thrown) || 0) * (parseFloat(form.price_chf) || 0)).toFixed(2)}
              </p>
            )}
          </div>
        ) : <span className="text-xs text-muted-foreground">—</span>}
      </td>
      {/* Save/Cancel */}
      <td className="px-3 py-2">
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            className="h-7 w-7 bg-green-600 hover:bg-green-700"
            onClick={() => {
              const isJeter = form.action === 'jeter';
              onSave({
                name: form.name,
                marque: form.marque || undefined,
                category: form.category || undefined,
                rayon: form.rayon || undefined,
                expiration_date: form.expiration_date,
                reception_date: form.reception_date || undefined,
                action: form.action || undefined,
                quantity_thrown: isJeter && form.quantity_thrown !== '' ? Number(form.quantity_thrown) : undefined,
                price_chf: isJeter && form.price_chf !== '' ? Number(form.price_chf) : undefined,
              });
            }}
          >
            <Check className="w-3.5 h-3.5" />
          </Button>
          <Button size="icon" variant="outline" className="h-7 w-7" onClick={onCancel}>
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </td>
    </tr>
  );
}

export default function ProductTable({ products, onEdit, onDelete, onInlineSave }) {
  const { t } = useLanguage();
  const [editingId, setEditingId] = useState(null);

  const handleSave = (product, data) => {
    if (onInlineSave) {
      onInlineSave(product.id, data);
    } else {
      onEdit({ ...product, ...data });
    }
    setEditingId(null);
  };

  const handleMobileEdit = (p) => {
    if (onEdit) onEdit(p);
  };

  if (products.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 shadow-sm border border-border/40 text-center">
        <p className="text-muted-foreground text-sm">{t('dash_no_products')}</p>
      </div>
    );
  }

  // Mobile card list
  const MobileCards = () => (
    <div className="space-y-2 sm:hidden">
      {products.map(p => {
        const status = getDisplayStatus(p);
        const days = getDaysRemaining(p.expiration_date);
        const cfg = statusConfig[status];
        const total = (p.quantity_thrown || 0) * (p.price_chf || 0);
        const isExpired = getProductStatus(p.expiration_date) === 'expired';

        return (
          <div key={p.id} className={`bg-white rounded-xl border px-3 py-2.5 shadow-sm ${status === 'archived' ? 'border-blue-200 bg-blue-50/20' : isExpired ? 'border-red-200 bg-red-50/30' : status === 'urgent' ? 'border-orange-200 bg-orange-50/20' : 'border-border/40'}`}>
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="font-semibold text-sm text-foreground">{p.name}</span>
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0 rounded-full text-[10px] font-medium border ${cfg.color}`}>
                    <span className={`w-1 h-1 rounded-full ${cfg.dot}`} />
                    {status === 'archived' ? 'Archivé' : t('status_' + status)}
                  </span>
                </div>
                <div className="flex gap-2 mt-0.5 text-[11px] text-muted-foreground flex-wrap">
                  {p.marque && <span>{p.marque}</span>}
                  {p.expiration_date && (
                    <span className={`font-medium ${isExpired ? 'text-red-600' : days < 3 ? 'text-orange-600' : days < 14 ? 'text-yellow-600' : 'text-green-600'}`}>
                      {format(new Date(p.expiration_date), 'dd/MM/yy')} ({days}j)
                    </span>
                  )}
                  {p.rayon && <span>R{p.rayon}</span>}
                  {isExpired && total > 0 && <span className="text-red-600 font-semibold">CHF {total.toFixed(2)}</span>}
                </div>
              </div>
              <div className="flex items-center gap-0.5 flex-shrink-0">
                <button onClick={() => handleMobileEdit(p)} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-secondary transition-colors">
                  <Pencil className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
                <button onClick={() => onDelete(p)} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-red-50 transition-colors">
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <>
      <MobileCards />
      <div className="hidden sm:block bg-white rounded-2xl shadow-sm border border-border/40 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/40">
            <tr>
              {[t('col_product'), t('col_brand'), t('col_category'), t('col_rayon'), t('col_dlc'), t('col_days'), t('col_status'), t('col_action'), t('col_qty_thrown'), t('col_price_chf'), 'Ajouté par', ''].map((h, i) => (
                <th key={i} className="text-left px-4 py-3 font-semibold text-foreground whitespace-nowrap text-xs">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map(p => {
              if (editingId === p.id) {
                return (
                  <InlineEditRow
                    key={p.id}
                    product={p}
                    onSave={(data) => handleSave(p, data)}
                    onCancel={() => setEditingId(null)}
                  />
                );
              }

              const status = getDisplayStatus(p);
              const days = getDaysRemaining(p.expiration_date);
              const cfg = statusConfig[status];
              const total = (p.quantity_thrown || 0) * (p.price_chf || 0);
              const isExpired = getProductStatus(p.expiration_date) === 'expired';

              return (
                <tr key={p.id} className={`border-t border-border/30 hover:bg-secondary/20 ${status === 'archived' ? 'bg-blue-50/30' : isExpired ? 'bg-red-50/40' : status === 'urgent' ? 'bg-orange-50/40' : status === 'soon' ? 'bg-yellow-50/20' : ''}`}>
                  <td className="px-4 py-3 font-medium text-foreground max-w-[160px] truncate">{p.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.marque || '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground whitespace-nowrap text-xs">
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
                      {status === 'archived' ? 'Archivé' : t('status_' + status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {isExpired && p.action ? t(ACTION_KEYS[p.action] || p.action) : '—'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {isExpired && p.quantity_thrown != null ? p.quantity_thrown : '—'}
                  </td>
                  <td className="px-4 py-3 font-medium text-red-700">
                    {isExpired && total > 0 ? `${total.toFixed(2)}` : '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                    {p.added_by_name || '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setEditingId(p.id)}
                        className="h-7 w-7"
                        title="Modifier en ligne"
                      >
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
          {/* Total losses footer */}
          {(() => {
            const totalLoss = calculateTotalLoss(products);
            if (totalLoss <= 0) return null;
            return (
              <tfoot>
                <tr className="border-t-2 border-red-200 bg-red-50/60">
                  <td colSpan={9} className="px-4 py-3 text-xs font-semibold text-red-700 text-right">
                    Total pertes enregistrées
                  </td>
                  <td className="px-4 py-3 font-bold text-red-700 text-base whitespace-nowrap">
                    CHF {totalLoss.toFixed(2)}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            );
          })()}
        </table>
        </div>
      </div>
    </>
  );
}