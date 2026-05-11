import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, CheckCircle2, Loader2, Package, Tag, Layers } from 'lucide-react';
import { rayonKeys, categoryKeys } from '@/lib/productUtils';
import { useLanguage } from '@/lib/LanguageContext';

/**
 * QuickAddModal — shown after barcode scan
 * Pre-filled with product info from DB or Open Food Facts.
 * Only asks for: expiry date, quantity, rayon
 * Large mobile-friendly touch targets.
 */
export default function QuickAddModal({ prefill, barcode, onSave, onClose, saving }) {
  const { t } = useLanguage();

  const [form, setForm] = useState({
    name: prefill?.name || '',
    marque: prefill?.brand || prefill?.marque || '',
    category: prefill?.category || '',
    rayon: prefill?.default_rayon || '',
    expiration_date: '',
    reception_date: new Date().toISOString().split('T')[0],
    price_chf: prefill?.default_price_chf || '',
  });

  const isManual = !prefill?.name;

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const canSave = form.name && form.expiration_date;

  return (
    <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md overflow-hidden max-h-[92vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/30">
          <div>
            <p className="font-bold text-foreground text-base">
              {isManual ? '✏️ Ajouter manuellement' : '⚡ Ajout rapide'}
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

        {/* Product info banner (if found in DB) */}
        {!isManual && (
          <div className="mx-5 mt-4 bg-primary/8 border border-primary/20 rounded-xl px-4 py-3 flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
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

        {/* Form fields */}
        <div className="px-5 py-4 space-y-4 overflow-y-auto flex-1">

          {/* If manual — show name + brand */}
          {isManual && (
            <>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Nom du produit *
                </label>
                <Input
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                  placeholder="Ex: Yaourt nature"
                  className="h-12 text-base rounded-xl"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Marque
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

          {/* Expiration date — LARGE, primary field */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
              <span className="text-red-500">📅</span> Date d'expiration (DLC) *
            </label>
            <Input
              type="date"
              value={form.expiration_date}
              onChange={e => set('expiration_date', e.target.value)}
              className="h-14 text-lg font-medium rounded-xl border-2 border-primary/30 focus:border-primary"
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Rayon — large select */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-primary" /> Rayon
            </label>
            <Select value={form.rayon || '__none__'} onValueChange={v => set('rayon', v === '__none__' ? '' : v)}>
              <SelectTrigger className="h-12 text-base rounded-xl">
                <SelectValue placeholder="Choisir un rayon…" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">— Non défini —</SelectItem>
                {Object.entries(rayonKeys).map(([v, label]) => (
                  <SelectItem key={v} value={v}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Category (if not pre-filled) */}
          {(!form.category || isManual) && (
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-primary" /> Catégorie
              </label>
              <Select value={form.category || '__none__'} onValueChange={v => set('category', v === '__none__' ? '' : v)}>
                <SelectTrigger className="h-12 text-base rounded-xl">
                  <SelectValue placeholder="Choisir une catégorie…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Non défini —</SelectItem>
                  {Object.entries(categoryKeys).map(([v, k]) => (
                    <SelectItem key={v} value={v}>{t(k)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Price CHF */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Prix unitaire CHF
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

        {/* Save button — sticky at bottom, full width, large */}
        <div className="px-5 py-4 border-t border-border/30 bg-white">
          <Button
            className="w-full h-14 text-base font-bold rounded-xl gap-2"
            disabled={!canSave || saving}
            onClick={() => onSave({
              name: form.name,
              marque: form.marque || undefined,
              category: form.category || undefined,
              rayon: form.rayon || undefined,
              expiration_date: form.expiration_date,
              reception_date: form.reception_date,
              price_chf: form.price_chf ? Number(form.price_chf) : undefined,
            })}
          >
            {saving
              ? <><Loader2 className="w-5 h-5 animate-spin" /> Enregistrement…</>
              : <><CheckCircle2 className="w-5 h-5" /> Enregistrer le produit</>
            }
          </Button>
        </div>
      </div>
    </div>
  );
}