import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { categoryKeys, getProductStatus, defaultRayons } from '@/lib/productUtils';

export default function ProductForm({ onSave, onCancel, editProduct }) {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    name: '',
    category: '',
    rayon: '',
    expiration_date: '',
    quantity: '',
    order_status: '',
    order_date: '',
  });

  useEffect(() => {
    if (editProduct) {
      setForm({
        name: editProduct.name || '',
        category: editProduct.category || '',
        rayon: editProduct.rayon || '',
        expiration_date: editProduct.expiration_date || '',
        quantity: editProduct.quantity || '',
        order_status: editProduct.order_status || '',
        order_date: editProduct.order_date || '',
      });
    }
  }, [editProduct]);

  const isExpired = form.expiration_date
    ? getProductStatus(form.expiration_date) === 'expired'
    : false;

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      name: form.name,
      category: form.category,
      rayon: form.rayon,
      expiration_date: form.expiration_date,
    };
    if (form.quantity) data.quantity = Number(form.quantity);
    if (isExpired && form.order_status) data.order_status = form.order_status;
    if (isExpired && form.order_date) data.order_date = form.order_date;
    onSave(data);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-border/40">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-foreground">
          {editProduct ? t('edit') : t('dash_add_product')}
        </h3>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Product name */}
        <div className="space-y-1.5">
          <Label className="text-sm">{t('dash_product_name')}</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            placeholder={t('dash_product_name')}
          />
        </div>

        {/* Category */}
        <div className="space-y-1.5">
          <Label className="text-sm">{t('dash_category')}</Label>
          <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })} required>
            <SelectTrigger>
              <SelectValue placeholder={t('dash_category')} />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(categoryKeys).map(([value, labelKey]) => (
                <SelectItem key={value} value={value}>
                  {t(labelKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Rayon */}
        <div className="space-y-1.5">
          <Label className="text-sm">{t('dash_rayon')}</Label>
          <Input
            value={form.rayon}
            onChange={(e) => setForm({ ...form, rayon: e.target.value })}
            placeholder={t('dash_rayon_placeholder')}
            list="rayon-suggestions"
          />
          <datalist id="rayon-suggestions">
            {defaultRayons.map((r) => (
              <option key={r} value={r} />
            ))}
          </datalist>
        </div>

        {/* Expiration date */}
        <div className="space-y-1.5">
          <Label className="text-sm">{t('dash_expiration_date')}</Label>
          <Input
            type="date"
            value={form.expiration_date}
            onChange={(e) => setForm({ ...form, expiration_date: e.target.value })}
            required
          />
        </div>

        {/* Quantity */}
        <div className="space-y-1.5">
          <Label className="text-sm">{t('dash_quantity')}</Label>
          <Input
            type="number"
            min="0"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
            placeholder="—"
          />
        </div>

        {/* Restocking fields — only when expired */}
        {isExpired && (
          <>
            <div className="sm:col-span-2">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-red-700 mb-3">{t('dash_restocking')}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm">{t('dash_order_status')}</Label>
                    <Select value={form.order_status} onValueChange={(v) => setForm({ ...form, order_status: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder={t('dash_order_status')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="to_order">{t('order_to_order')}</SelectItem>
                        <SelectItem value="ordered">{t('order_ordered')}</SelectItem>
                        <SelectItem value="received">{t('order_received')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">{t('dash_order_date')}</Label>
                    <Input
                      type="date"
                      value={form.order_date}
                      onChange={(e) => setForm({ ...form, order_date: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} className="rounded-full px-5">
            {t('dash_cancel')}
          </Button>
          <Button type="submit" className="rounded-full px-5">
            {t('dash_save')}
          </Button>
        </div>
      </form>
    </div>
  );
}