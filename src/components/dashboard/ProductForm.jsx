import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, ScanLine, Loader2 } from 'lucide-react';
import { categoryKeys, getProductStatus } from '@/lib/productUtils';
import BarcodeScanner from './BarcodeScanner';
import ProductHistorySection from './ProductHistorySection';
import RayonInput from './RayonInput';
import { base44 } from '@/api/base44Client';

const ACTION_KEYS = {
  jeter: 'action_jeter',
  a_recommander: 'action_a_recommander',
  commande: 'action_commande',
  en_transition: 'action_en_transition',
  recu: 'action_recu',
};

const empty = {
  name: '', marque: '', barcode: '', etagere: '', category: '', rayon: '',
  reception_date: '', expiration_date: '', quantity_received: '',
  price_chf: '',
  action: '', order_date: '', quantity_thrown: '',
};

export default function ProductForm({ onSave, onCancel, editProduct, initialProduct }) {
  const { t, lang } = useLanguage();
  const actionOptions = Object.entries(ACTION_KEYS).map(([value, key]) => ({ value, key }));
  const [form, setForm] = useState(empty);
  const [showScanner, setShowScanner] = useState(false);
  const [lookingUp, setLookingUp] = useState(false);

  useEffect(() => {
    if (editProduct) {
      setForm({
        name: editProduct.name || '',
        marque: editProduct.marque || '',
        barcode: editProduct.barcode || '',
        etagere: editProduct.etagere || '',
        category: editProduct.category || '',
        rayon: editProduct.rayon || '',
        reception_date: editProduct.reception_date || '',
        expiration_date: editProduct.expiration_date || '',
        quantity_received: '',
        action: editProduct.action || '',
        order_date: editProduct.order_date || '',
        quantity_thrown: editProduct.quantity_thrown ?? '',
        price_chf: editProduct.price_chf ?? '',
      });
    } else if (initialProduct) {
      setForm({ ...empty, ...initialProduct });
    } else {
      setForm(empty);
    }
  }, [editProduct, initialProduct]);

  const isExpired = form.expiration_date
    ? getProductStatus(form.expiration_date) === 'expired'
    : false;

  const totalChf = (parseFloat(form.quantity_thrown) || 0) * (parseFloat(form.price_chf) || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editProduct && ((Number(form.quantity_received) || 0) <= 0)) {
      window.alert('Merci de renseigner une quantité supérieure à 0.');
      return;
    }
    if (isExpired && form.action === 'jeter' && ((Number(form.quantity_thrown) || 0) <= 0 || (Number(form.price_chf) || 0) <= 0)) {
      window.alert('Merci de renseigner une quantité jetée et un prix supérieurs à 0.');
      return;
    }
    const data = {
      name: form.name,
      expiration_date: form.expiration_date,
    };
    if (!editProduct) data.quantity_received = Number(form.quantity_received);
    if (form.marque) data.marque = form.marque;
    if (form.barcode) data.barcode = form.barcode;
    if (form.etagere) data.etagere = form.etagere;
    if (form.category) data.category = form.category;
    if (form.rayon) data.rayon = form.rayon;
    if (form.reception_date) data.reception_date = form.reception_date;
    if (form.price_chf !== '') data.price_chf = Number(form.price_chf);
    if (isExpired) {
      if (form.action) data.action = form.action;
      if (form.order_date) data.order_date = form.order_date;
      if (form.action === 'jeter') {
        if (form.quantity_thrown !== '') data.quantity_thrown = Number(form.quantity_thrown);
        if (form.price_chf !== '') data.price_chf = Number(form.price_chf);
      }
    }

    // Save history entry if editing an existing product with an action
    if (editProduct?.id && isExpired && form.action) {
      const prevAction = editProduct.action;
      const historyEntry = {
        product_id: editProduct.id,
        action: form.action,
        action_date: form.order_date || new Date().toISOString().split('T')[0],
      };
      if (form.action === 'jeter') {
        if (form.quantity_thrown !== '') historyEntry.quantity = Number(form.quantity_thrown);
        if (form.price_chf !== '') historyEntry.price_chf = Number(form.price_chf);
      }
      // Only log if action changed or it's a new action assignment
      if (form.action !== prevAction || form.action === 'jeter') {
        base44.entities.ProductHistory.create(historyEntry).catch(() => {});
      }
    }

    onSave(data);
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target?.value ?? e });

  const handleBarcodeScan = async (barcode) => {
    setShowScanner(false);
    setLookingUp(true);
    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${barcode}.json`);
      const data = await res.json();
      if (data.status === 1 && data.product) {
        const p = data.product;
        setForm(prev => ({
          ...prev,
          barcode: prev.barcode || barcode,
          name: prev.name || p.product_name_fr || p.product_name || p.generic_name || '',
          marque: prev.marque || p.brands || '',
        }));
      }
    } catch (_) {}
    setLookingUp(false);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-border/40">
      {showScanner && (
        <BarcodeScanner
          lang={lang}
          onDetected={handleBarcodeScan}
          onClose={() => setShowScanner(false)}
        />
      )}

      <div className="flex items-center justify-between mb-5">
        <h3 className="font-semibold text-foreground">{editProduct ? t('edit') : t('dash_add_product')}</h3>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="rounded-full gap-1.5 text-xs border-primary/40 text-primary hover:bg-primary/5"
            onClick={() => setShowScanner(true)}
            disabled={lookingUp}
          >
            {lookingUp
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <ScanLine className="w-3.5 h-3.5" />
            }
            {lookingUp
              ? (lang === 'fr' ? 'Recherche…' : 'Looking up…')
              : (lang === 'fr' ? 'Scanner' : 'Scan')
            }
          </Button>
          <Button variant="ghost" size="icon" onClick={onCancel}><X className="w-4 h-4" /></Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
        {/* Produit */}
        <div className="space-y-1.5">
          <Label className="text-xs">{t('form_product')}</Label>
          <Input required value={form.name} onChange={set('name')} placeholder={t('dash_product_name')} className="h-8 text-sm" />
        </div>

        {/* Marque */}
        <div className="space-y-1">
          <Label className="text-xs">{t('form_brand')}</Label>
          <Input value={form.marque} onChange={set('marque')} placeholder="Ex: Nestlé" className="h-8 text-sm" />
        </div>

        {/* Code-barres */}
        <div className="space-y-1">
          <Label className="text-xs">Code-barres</Label>
          <Input value={form.barcode} onChange={set('barcode')} placeholder="EAN si disponible" className="h-8 text-sm" />
        </div>

        {/* Étagère */}
        <div className="space-y-1">
          <Label className="text-xs">{lang === 'fr' ? 'Étagère' : 'Shelf'} <span className="text-muted-foreground font-normal">({lang === 'fr' ? 'optionnel' : 'optional'})</span></Label>
          <Input value={form.etagere} onChange={set('etagere')} placeholder={lang === 'fr' ? 'Ex: Étagère du haut' : 'Ex: Top shelf'} className="h-8 text-sm" />
        </div>

        {/* Catégorie */}
        <div className="space-y-1">
          <Label className="text-xs">{t('form_category')}</Label>
          <Select value={form.category} onValueChange={v => setForm({ ...form, category: v })}>
            <SelectTrigger className="h-8 text-sm"><SelectValue placeholder={t('form_category')} /></SelectTrigger>
            <SelectContent>
              {Object.entries(categoryKeys).map(([value, key]) => (
                <SelectItem key={value} value={value}>{t(key)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Rayon */}
        <div className="space-y-1">
          <Label className="text-xs">{t('form_rayon')}</Label>
          <RayonInput value={form.rayon} onChangeValue={(value) => setForm({ ...form, rayon: value })} listId="product-form-rayons" placeholder={lang === 'fr' ? 'Choisir un rayon ou écrire un nom personnalisé' : 'Choose a section or type a custom name'} className="h-8 text-sm" />
        </div>

        {/* Date réception */}
        <div className="space-y-1">
          <Label className="text-xs">{t('form_reception_date')}</Label>
          <Input type="date" value={form.reception_date} onChange={set('reception_date')} className="h-8 text-sm" />
        </div>

        {!editProduct && (
          <div className="space-y-1">
            <Label className="text-xs">Quantité reçue *</Label>
            <Input required type="number" min="1" value={form.quantity_received} onChange={set('quantity_received')} placeholder="0" className="h-8 text-sm" />
          </div>
        )}

        {/* DLC */}
        <div className="space-y-1">
          <Label className="text-xs">{t('form_dlc')}</Label>
          <Input required type="date" value={form.expiration_date} onChange={set('expiration_date')} className="h-8 text-sm" />
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Prix de vente CHF</Label>
          <Input type="number" min="0" step="0.05" value={form.price_chf} onChange={set('price_chf')} placeholder="0.00" className="h-8 text-sm" />
        </div>

        {/* Conditional: expired fields */}
        {isExpired && (
          <>
            <div className="sm:col-span-2 border-t border-border/30 pt-3">
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wide mb-3">{t('form_expired_section')}</p>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">{t('form_action')}</Label>
              <Select value={form.action} onValueChange={v => setForm({ ...form, action: v, quantity_thrown: '' })}>
                <SelectTrigger className="h-8 text-sm"><SelectValue placeholder={t('form_action')} /></SelectTrigger>
                <SelectContent>
                  {actionOptions.map(o => <SelectItem key={o.value} value={o.value}>{t(o.key)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">{t('form_order_date')}</Label>
              <Input type="date" value={form.order_date} onChange={set('order_date')} className="h-8 text-sm" />
            </div>

            {form.action === 'jeter' && (
              <>
                <div className="space-y-1">
                  <Label className="text-xs">{t('form_qty_thrown')}</Label>
                  <Input type="number" min="1" value={form.quantity_thrown} onChange={set('quantity_thrown')} placeholder="0" className="h-8 text-sm" />
                </div>

                {(form.quantity_thrown || form.price_chf) && (
                  <div className="sm:col-span-2 bg-red-50 rounded-xl px-4 py-3">
                    <p className="text-sm text-red-700 font-medium">
                      {t('form_total_chf')} : <span className="font-bold">CHF {totalChf.toFixed(2)}</span>
                    </p>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {editProduct?.id && (
          <ProductHistorySection productId={editProduct.id} />
        )}

        <div className="sm:col-span-2 flex justify-end gap-3 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} className="rounded-full px-5">{t('dash_cancel')}</Button>
          <Button type="submit" className="rounded-full px-5">{t('dash_save')}</Button>
        </div>
      </form>
    </div>
  );
}