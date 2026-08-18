import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, CheckCircle2, Loader2, Package, Tag, Layers, AlertTriangle, RefreshCw } from 'lucide-react';
import { categoryKeys } from '@/lib/productUtils';
import { useLanguage } from '@/lib/LanguageContext';
import RayonInput from './RayonInput';

/**
 * QuickAddModal — shown after barcode scan + product lookup
 * Pre-filled with product info. User adds DLC + rayon then saves.
 * If existingProduct is passed, offers to update DLC instead of creating a duplicate.
 */
export default function QuickAddModal({ prefill, barcode, existingProduct, onSave, onUpdate, onClose, saving }) {
  const { t, lang } = useLanguage();
  const isFr = lang === 'fr';
  // If there's an existing product, default to update mode
  const [mode, setMode] = useState(existingProduct ? 'update' : 'create');

  const today = new Date().toISOString().split('T')[0];

  const [form, setForm] = useState({
    name: prefill?.name || '',
    marque: prefill?.brand || prefill?.marque || '',
    etagere: '',
    category: prefill?.category || '',
    rayon: prefill?.default_rayon || '',
    expiration_date: '',
    reception_date: today,
    price_chf: prefill?.default_price_chf || '',
  });

  const imageUrl = prefill?.image_url || null;
  const isManual = !prefill?.name;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const canSave = form.name && form.expiration_date;

  return (
    <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md overflow-hidden max-h-[95vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/30 flex-shrink-0">
          <div>
            <p className="font-bold text-foreground text-base">
              {isManual
                ? (isFr ? '✏️ Ajouter manuellement' : '✏️ Add manually')
                : (isFr ? '⚡ Ajout rapide' : '⚡ Quick add')}
            </p>
            {barcode && (
              <p className="text-xs text-muted-foreground font-mono mt-0.5">EAN: {barcode}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-secondary transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Product info banner (if found) */}
        {!isManual && (
          <div className="mx-5 mt-4 bg-primary/8 border border-primary/20 rounded-xl px-4 py-3 flex items-start gap-3 flex-shrink-0">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={form.name}
                className="w-12 h-12 object-contain rounded-lg bg-white border border-border/30 flex-shrink-0"
                onError={e => { e.target.style.display = 'none'; }}
              />
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

        {/* Form */}
        <div className="px-5 py-4 space-y-4 overflow-y-auto flex-1">

          {/* Manual: name + brand */}
          {isManual && (
            <>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  {isFr ? 'Nom du produit *' : 'Product name *'}
                </label>
                <Input
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder={isFr ? 'Ex: Yaourt nature' : 'Ex: Plain yogurt'}
                  className="h-12 text-base rounded-xl"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  {isFr ? 'Marque' : 'Brand'}
                </label>
                <Input
                  value={form.marque}
                  onChange={e => set('marque', e.target.value)}
                  placeholder="Ex: Danone"
                  className="h-12 text-base rounded-xl"
                />
              </div>
            </>
          )}

          {/* If found but name is editable */}
          {!isManual && (
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">
                {isFr ? 'Nom du produit' : 'Product name'}
              </label>
              <Input
                value={form.name}
                onChange={e => set('name', e.target.value)}
                className="h-11 text-sm rounded-xl"
              />
            </div>
          )}

          {/* DLC — primary, large */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              📅 {isFr ? "Date d'expiration (DLC) *" : 'Expiration date *'}
            </label>
            <Input
              type="date"
              value={form.expiration_date}
              onChange={e => set('expiration_date', e.target.value)}
              className="h-14 text-lg font-medium rounded-xl border-2 border-primary/30 focus:border-primary"
            />
          </div>

          {/* Date réception — auto today, read-only display */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground px-1">
            <span>📦</span>
            <span>{isFr ? 'Date de réception' : 'Reception date'}: <strong>{today}</strong></span>
          </div>

          {/* Étagère */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              {isFr ? 'Étagère' : 'Shelf'} <span className="text-muted-foreground font-normal text-xs">({isFr ? 'optionnel' : 'optional'})</span>
            </label>
            <Input
              value={form.etagere}
              onChange={e => set('etagere', e.target.value)}
              placeholder={isFr ? 'Ex: Étagère du haut' : 'Ex: Top shelf'}
              className="h-11 text-sm rounded-xl"
            />
          </div>

          {/* Rayon */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-primary" />
              {isFr ? 'Rayon *' : 'Section *'}
            </label>
            <RayonInput
              value={form.rayon}
              onChangeValue={(value) => set('rayon', value)}
              listId="quick-add-rayons"
              placeholder={isFr ? 'Choisir un rayon ou écrire un nom personnalisé' : 'Choose a section or type a custom name'}
              className="h-12 text-base rounded-xl"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-primary" />
              {isFr ? 'Catégorie' : 'Category'}
            </label>
            <Select value={form.category || '__none__'} onValueChange={v => set('category', v === '__none__' ? '' : v)}>
              <SelectTrigger className="h-12 text-base rounded-xl">
                <SelectValue placeholder={isFr ? 'Choisir une catégorie…' : 'Choose a category…'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">— {isFr ? 'Non défini' : 'Not set'} —</SelectItem>
                {Object.entries(categoryKeys).map(([v, k]) => (
                  <SelectItem key={v} value={v}>{t(k)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price CHF */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              {isFr ? 'Prix unitaire CHF' : 'Unit price CHF'}
            </label>
            <Input
              type="number"
              min="0"
              step="0.05"
              value={form.price_chf}
              onChange={e => set('price_chf', e.target.value)}
              placeholder="0.00"
              className="h-12 text-base rounded-xl"
            />
          </div>
        </div>

        {/* Duplicate warning banner */}
        {existingProduct && (
          <div className="mx-5 mt-3 flex-shrink-0">
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 space-y-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-amber-800">
                    {isFr ? 'Ce produit existe déjà dans votre stock' : 'This product already exists in your stock'}
                  </p>
                  <p className="text-xs text-amber-600 mt-0.5">
                    {isFr ? 'Ancienne DLC :' : 'Current expiry:'}{' '}
                    <strong>{existingProduct.expiration_date || (isFr ? 'non définie' : 'not set')}</strong>
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setMode('update')}
                  className={`flex-1 text-xs py-1.5 px-3 rounded-lg font-semibold transition-colors border ${mode === 'update' ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-amber-700 border-amber-300 hover:bg-amber-50'}`}
                >
                  <RefreshCw className="w-3 h-3 inline mr-1" />
                  {isFr ? 'Mettre à jour la DLC' : 'Update expiry'}
                </button>
                <button
                  onClick={() => setMode('create')}
                  className={`flex-1 text-xs py-1.5 px-3 rounded-lg font-semibold transition-colors border ${mode === 'create' ? 'bg-foreground text-white border-foreground' : 'bg-white text-muted-foreground border-border hover:bg-secondary'}`}
                >
                  {isFr ? 'Ajouter quand même' : 'Add anyway'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Save */}
        <div className="px-5 py-4 border-t border-border/30 bg-white flex-shrink-0">
          <Button
            className={`w-full h-14 text-base font-bold rounded-xl gap-2 ${mode === 'update' ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}`}
            disabled={!canSave || saving}
            onClick={() => {
              const data = {
                name: form.name,
                marque: form.marque || undefined,
                barcode: barcode || undefined,
                image_url: imageUrl || undefined,
                etagere: form.etagere || undefined,
                category: form.category || undefined,
                rayon: form.rayon || undefined,
                expiration_date: form.expiration_date,
                reception_date: form.reception_date,
                price_chf: form.price_chf ? Number(form.price_chf) : undefined,
              };
              if (mode === 'update' && existingProduct) {
                onUpdate(existingProduct.id, data);
              } else {
                onSave(data);
              }
            }}
          >
            {saving
              ? <><Loader2 className="w-5 h-5 animate-spin" /> {isFr ? 'Enregistrement…' : 'Saving…'}</>
              : mode === 'update'
                ? <><RefreshCw className="w-5 h-5" /> {isFr ? 'Mettre à jour la DLC' : 'Update expiry date'}</>
                : <><CheckCircle2 className="w-5 h-5" /> {isFr ? 'Enregistrer le produit' : 'Save product'}</>
            }
          </Button>
        </div>
      </div>
    </div>
  );
}