import React, { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import { format } from 'date-fns';
import { getProductStatus, getDaysRemaining, statusConfig, categoryKeys, rayonKeys } from '@/lib/productUtils';

const actionOptions = [
  { value: 'jeter', label: 'Jeter' },
  { value: 'a_recommander', label: 'À recommander' },
  { value: 'commande', label: 'Commandé' },
  { value: 'en_transition', label: 'En transition' },
  { value: 'recu', label: 'Reçu' },
];

const actionLabels = {
  jeter: 'Jeter',
  a_recommander: 'À recommander',
  commande: 'Commandé',
  en_transition: 'En transition',
  recu: 'Reçu',
};

function InlineEditRow({ product, onSave, onCancel }) {
  const { t } = useLanguage();
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
          <Select value={form.action || '__none__'} onValueChange={v => setForm(f => ({ ...f, action: v === '__none__' ? '' : v }))}>
            <SelectTrigger className="h-7 text-xs min-w-[100px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">—</SelectItem>
              {actionOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        ) : <span className="text-xs text-muted-foreground">—</span>}
      </td>
      {/* Qté */}
      <td className="px-3 py-2">
        {isExpired ? (
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
      {/* Total CHF */}
      <td className="px-3 py-2">
        {isExpired ? (
          <Input
            type="number"
            min="0"
            step="0.01"
            value={form.price_chf}
            onChange={e => setForm(f => ({ ...f, price_chf: e.target.value }))}
            className="h-7 text-xs w-20"
            placeholder="CHF"
          />
        ) : <span className="text-xs text-muted-foreground">—</span>}
      </td>
      {/* Save/Cancel */}
      <td className="px-3 py-2">
        <div className="flex items-center gap-1">
          <Button
            size="icon"
            className="h-7 w-7 bg-green-600 hover:bg-green-700"
            onClick={() => onSave({
              name: form.name,
              marque: form.marque || undefined,
              category: form.category || undefined,
              rayon: form.rayon || undefined,
              expiration_date: form.expiration_date,
              reception_date: form.reception_date || undefined,
              action: form.action || undefined,
              quantity_thrown: form.quantity_thrown !== '' ? Number(form.quantity_thrown) : undefined,
              price_chf: form.price_chf !== '' ? Number(form.price_chf) : undefined,
            })}
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
              {['Produit', 'Marque', 'Catégorie', 'Rayon', 'DLC', 'Jours', 'Statut', 'Action', 'Qté jetée', 'Prix CHF', ''].map((h, i) => (
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

              const status = getProductStatus(p.expiration_date);
              const days = getDaysRemaining(p.expiration_date);
              const cfg = statusConfig[status];
              const total = (p.quantity_thrown || 0) * (p.price_chf || 0);
              const isExpired = status === 'expired';

              return (
                <tr key={p.id} className={`border-t border-border/30 hover:bg-secondary/20 ${isExpired ? 'bg-red-50/40' : status === 'urgent' ? 'bg-orange-50/40' : status === 'soon' ? 'bg-yellow-50/20' : ''}`}>
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
        </table>
      </div>
    </div>
  );
}