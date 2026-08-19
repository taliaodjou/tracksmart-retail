import React, { useMemo, useState } from 'react';
import { Package, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const normalize = (value = '') => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

export default function ManualProductSearchModal({ products = [], onSelect, onCreate, onClose }) {
  const [query, setQuery] = useState('');
  const cleanQuery = normalize(query);

  const suggestions = useMemo(() => {
    if (cleanQuery.length < 2) return [];
    return products
      .filter((product) => {
        const name = normalize(product.name || '');
        const brand = normalize(product.marque || '');
        return name.includes(cleanQuery) || brand.includes(cleanQuery);
      })
      .sort((a, b) => {
        const aStarts = normalize(a.name || '').startsWith(cleanQuery) ? 0 : 1;
        const bStarts = normalize(b.name || '').startsWith(cleanQuery) ? 0 : 1;
        return aStarts - bStarts || (a.name || '').localeCompare(b.name || '', 'fr');
      })
      .slice(0, 8);
  }, [products, cleanQuery]);

  const canCreate = cleanQuery.length >= 2 && suggestions.length === 0;

  return (
    <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Ajouter un produit</p>
            <h2 className="text-lg font-bold text-foreground">Rechercher par nom</h2>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full hover:bg-secondary flex items-center justify-center"><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>

        <div className="p-5 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nom du produit" className="pl-10 h-12 rounded-xl text-base" autoFocus />
          </div>

          {cleanQuery.length < 2 && <p className="text-sm text-muted-foreground">Tapez au moins 2 caractères pour retrouver un produit déjà enregistré.</p>}

          {suggestions.length > 0 && (
            <div className="rounded-2xl border border-border/50 overflow-hidden divide-y divide-border/40">
              {suggestions.map((product) => (
                <button key={product.id} onClick={() => onSelect(product)} className="w-full text-left px-4 py-3 hover:bg-secondary/60 flex items-center gap-3 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0"><Package className="w-5 h-5 text-primary" /></div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">{product.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{product.marque || 'Sans marque'}{product.barcode ? ` · EAN ${product.barcode}` : ''}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {canCreate && (
            <Button onClick={() => onCreate(query.trim())} className="w-full h-12 rounded-xl gap-2">
              <Package className="w-4 h-4" />
              Créer un nouveau produit
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}