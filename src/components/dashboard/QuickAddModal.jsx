import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, CheckCircle2, Loader2, Package, Tag, Layers } from 'lucide-react';
import { categoryKeys } from '@/lib/productUtils';
import { useLanguage } from '@/lib/LanguageContext';
import RayonInput from './RayonInput';

export default function QuickAddModal({ prefill, barcode, existingProduct, onSave, onUpdate, onClose, saving }) {
  const { t, lang } = useLanguage();
  const isFr = lang === 'fr';
  const today = new Date().toISOString().split('T')[0];
  const productSource = existingProduct || prefill || {};

  const [form, setForm] = useState({
    name: productSource.name || '',
    marque: productSource.brand || productSource.marque || '',
    etagere: productSource.etagere || '',
    category: productSource.category || '',
    rayon: productSource.rayon || productSource.default_rayon || '',
    expiration_date: '',
    reception_date: today,
    quantity_received: '',
    price_chf: productSource.default_price_chf || productSource.price_chf || '',
  });

  const imageUrl = prefill?.image_url || existingProduct?.image_url || null;
  const isExisting = !!existingProduct;
  const isManual = !productSource.name;
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const canSave = form.name && form.expiration_date && (Number(form.quantity_received) || 0) > 0;

  const handleSave = () => {
    const data = {
      name: form.name,
      marque: form.marque || undefined,
      barcode: barcode || existingProduct?.barcode || undefined,
      image_url: imageUrl || undefined,
      etagere: form.etagere || undefined,
      category: form.category || undefined,
      rayon: form.rayon || undefined,
      expiration_date: form.expiration_date,
      reception_date: form.reception_date,
      quantity_received: Number(form.quantity_received),
      price_chf: form.price_chf ? Number(form.price_chf) : undefined,
    };

    if (existingProduct) {
      onUpdate(existingProduct.id, data);
    } else {
      onSave(data);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md overflow-hidden max-h-[95vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/30 flex-shrink-0">
          <div>
            <p className="font-bold text-foreground text-base">
              {isExisting ? (isFr ? '⚡ Produit existant' : '⚡ Existing product') : isManual ? (isFr ? '✏️ Ajouter manuellement' : '✏️ Add manually') : (isFr ? '⚡ Produit reconnu' : '⚡ Product recognized')}
            </p>
            {barcode && <p className="text-xs text-muted-foreground font-mono mt-0.5">EAN: {barcode}</p>}
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-secondary transition-colors">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {!isManual && (
          <div className="mx-5 mt-4 bg-primary/8 border border-primary/20 rounded-xl px-4 py-3 flex items-start gap-3 flex-shrink-0">
            {imageUrl ? (
              <img src={imageUrl} alt={form.name} className="w-12 h-12 object-contain rounded-lg bg-white border border-border/30 flex-shrink-0" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
            ) : (
              <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Package className="w-5 h-5 text-primary" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-foreground text-sm truncate">{form.name}</p>
              {form.marque && <p className="text-xs text-muted-foreground">{form.marque}</p>}
              {form.category && (
                <span className="inline-block mt-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                  {t(categoryKeys[form.category] || form.category)}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="px-5 py-4 space-y-4 overflow-y-auto flex-1">
          {isManual && (
            <>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">{isFr ? 'Nom du produit *' : 'Product name *'}</label>
                <Input value={form.name} onChange={(event) => set('name', event.target.value)} placeholder={isFr ? 'Ex: Yaourt nature' : 'Ex: Plain yogurt'} className="h-12 text-base rounded-xl" autoFocus />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">{isFr ? 'Marque' : 'Brand'}</label>
                <Input value={form.marque} onChange={(event) => set('marque', event.target.value)} placeholder="Ex: Danone" className="h-12 text-base rounded-xl" />
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">{isFr ? 'Quantité *' : 'Quantity *'}</label>
              <Input type="number" min="1" value={form.quantity_received} onChange={(event) => set('quantity_received', event.target.value)} placeholder="0" className="h-14 text-lg font-medium rounded-xl border-2 border-primary/30 focus:border-primary" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">DLC *</label>
              <Input type="date" value={form.expiration_date} onChange={(event) => set('expiration_date', event.target.value)} className="h-14 text-base font-medium rounded-xl border-2 border-primary/30 focus:border-primary" />
            </div>
          </div>

          {!isExisting && (
            <>
              <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
                <span>📦</span>
                <span>{isFr ? 'Date de réception' : 'Reception date'}: <strong>{today}</strong></span>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">{isFr ? 'Étagère' : 'Shelf'} <span className="text-muted-foreground font-normal text-xs">({isFr ? 'optionnel' : 'optional'})</span></label>
                <Input value={form.etagere} onChange={(event) => set('etagere', event.target.value)} placeholder={isFr ? 'Ex: Étagère du haut' : 'Ex: Top shelf'} className="h-11 text-sm rounded-xl" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5"><Layers className="w-4 h-4 text-primary" />{isFr ? 'Rayon' : 'Section'}</label>
                <RayonInput value={form.rayon} onChangeValue={(value) => set('rayon', value)} listId="quick-add-rayons" placeholder={isFr ? 'Choisir un rayon ou écrire un nom personnalisé' : 'Choose a section or type a custom name'} className="h-12 text-base rounded-xl" />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5"><Tag className="w-4 h-4 text-primary" />{isFr ? 'Catégorie' : 'Category'}</label>
                <Select value={form.category || '__none__'} onValueChange={(value) => set('category', value === '__none__' ? '' : value)}>
                  <SelectTrigger className="h-12 text-base rounded-xl"><SelectValue placeholder={isFr ? 'Choisir une catégorie…' : 'Choose a category…'} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">— {isFr ? 'Non défini' : 'Not set'} —</SelectItem>
                    {Object.entries(categoryKeys).map(([value, key]) => <SelectItem key={value} value={value}>{t(key)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">{isFr ? 'Prix unitaire CHF' : 'Unit price CHF'}</label>
                <Input type="number" min="0" step="0.05" value={form.price_chf} onChange={(event) => set('price_chf', event.target.value)} placeholder="0.00" className="h-12 text-base rounded-xl" />
              </div>
            </>
          )}
        </div>

        <div className="px-5 py-4 border-t border-border/30 bg-white flex-shrink-0">
          <Button className="w-full h-14 text-base font-bold rounded-xl gap-2" disabled={!canSave || saving} onClick={handleSave}>
            {saving ? <><Loader2 className="w-5 h-5 animate-spin" /> {isFr ? 'Enregistrement…' : 'Saving…'}</> : <><CheckCircle2 className="w-5 h-5" /> {isFr ? 'Enregistrer le stock' : 'Save stock'}</>}
          </Button>
        </div>
      </div>
    </div>
  );
}