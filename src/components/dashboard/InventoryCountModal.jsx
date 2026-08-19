import React, { useMemo, useState } from 'react';
import { ClipboardCheck, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function InventoryCountModal({ products = [], onClose, onSubmit, saving }) {
  const [search, setSearch] = useState('');
  const [counts, setCounts] = useState({});

  const visibleProducts = useMemo(() => {
    const term = search.toLowerCase().trim();
    return products.filter((product) => !term || product.name?.toLowerCase().includes(term) || product.barcode?.includes(term));
  }, [products, search]);

  const selectedCount = Object.values(counts).filter((value) => value !== '' && !Number.isNaN(Number(value)) && Number(value) >= 0).length;

  const updateCount = (productId, value) => {
    setCounts((current) => ({ ...current, [productId]: value }));
  };

  const submit = () => {
    const entries = Object.entries(counts)
      .filter(([, value]) => value !== '' && !Number.isNaN(Number(value)) && Number(value) >= 0)
      .map(([productId, value]) => ({
        product: products.find((product) => product.id === productId),
        actualQuantity: Number(value)
      }))
      .filter((entry) => entry.product);
    onSubmit(entries);
  };

  return (
    <div className="fixed inset-0 z-[95] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-4xl max-h-[92vh] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Gestion de stock</p>
            <h2 className="text-lg font-bold flex items-center gap-2"><ClipboardCheck className="w-5 h-5 text-primary" />Faire l'inventaire</h2>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full hover:bg-secondary flex items-center justify-center"><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>

        <div className="p-5 border-b border-border/40 space-y-3">
          <p className="text-sm text-muted-foreground">Saisissez uniquement les produits que vous voulez recompter. Les lignes laissées vides seront ignorées.</p>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un produit ou un EAN" className="pl-9 rounded-xl" />
          </div>
        </div>

        <div className="overflow-y-auto p-5 space-y-2">
          <div className="hidden sm:grid grid-cols-[1fr_140px_180px] gap-3 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            <span>Produit</span><span>Stock théorique</span><span>Stock réel compté</span>
          </div>
          {visibleProducts.map((product) => {
            const theoretical = Number(product.stock_total) || 0;
            return (
              <div key={product.id} className="grid sm:grid-cols-[1fr_140px_180px] gap-3 items-center rounded-2xl border border-border/50 bg-white p-3">
                <div>
                  <p className="text-sm font-bold text-foreground">{product.name}</p>
                  <p className="text-xs text-muted-foreground">{product.marque || 'Sans marque'}{product.barcode ? ` · EAN ${product.barcode}` : ''}</p>
                </div>
                <div className="text-sm font-semibold text-muted-foreground"><span className="sm:hidden">Stock théorique: </span>{theoretical}</div>
                <Input type="number" min="0" value={counts[product.id] || ''} onChange={(e) => updateCount(product.id, e.target.value)} placeholder="Quantité réelle" className="rounded-xl" />
              </div>
            );
          })}
          {visibleProducts.length === 0 && <div className="text-center py-10 text-sm text-muted-foreground">Aucun produit trouvé.</div>}
        </div>

        <div className="px-5 py-4 border-t border-border/40 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">{selectedCount} produit{selectedCount > 1 ? 's' : ''} renseigné{selectedCount > 1 ? 's' : ''}</p>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={onClose} className="rounded-xl">Annuler</Button><Button disabled={selectedCount === 0 || saving} onClick={submit} className="rounded-xl">Valider l'inventaire</Button></div>
        </div>
      </div>
    </div>
  );
}