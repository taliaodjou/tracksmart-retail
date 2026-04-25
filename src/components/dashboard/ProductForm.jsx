import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import { categoryKeys } from '@/lib/productUtils';

export default function ProductForm({ onSave, onCancel, editProduct }) {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    name: '',
    category: '',
    expiration_date: '',
    quantity: '',
  });

  useEffect(() => {
    if (editProduct) {
      setForm({
        name: editProduct.name || '',
        category: editProduct.category || '',
        expiration_date: editProduct.expiration_date || '',
        quantity: editProduct.quantity || '',
      });
    }
  }, [editProduct]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = {
      name: form.name,
      category: form.category,
      expiration_date: form.expiration_date,
    };
    if (form.quantity) data.quantity = Number(form.quantity);
    onSave(data);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-border/40">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-foreground">{t('dash_add_product')}</h3>
        <Button variant="ghost" size="icon" onClick={onCancel}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-sm">{t('dash_product_name')}</Label>
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
            placeholder={t('dash_product_name')}
          />
        </div>

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

        <div className="space-y-1.5">
          <Label className="text-sm">{t('dash_expiration_date')}</Label>
          <Input
            type="date"
            value={form.expiration_date}
            onChange={(e) => setForm({ ...form, expiration_date: e.target.value })}
            required
          />
        </div>

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