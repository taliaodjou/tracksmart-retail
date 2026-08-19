import React, { useMemo, useState } from 'react';
import { ClipboardCheck, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function InventoryCountPanel({ products = [], onSubmit, saving, message }) {
  const [search, setSearch] = useState('');
  const [counts, setCounts] = useState({});
  const [splits, setSplits] = useState({});
  const [justifications, setJustifications] = useState({});

  const visibleProducts = useMemo(() => {
    const term = search.toLowerCase().trim();
    return products.filter((product) => !term || product.name?.toLowerCase().includes(term) || product.barcode?.includes(term));
  }, [products, search]);

  const countedEntries = Object.entries(counts).filter(([, value]) => value !== '' && !Number.isNaN(Number(value)) && Number(value) >= 0);
  const invalidSplitCount = countedEntries.filter(([productId, value]) => {
    const product = products.find((item) => item.id === productId);
    const theoretical = Number(product?.stock_total) || 0;
    const difference = theoretical - Number(value);
    if (!product || difference <= 0) return false;
    const sold = Number(splits[productId]?.vente) || 0;
    const lost = Number(splits[productId]?.perte) || 0;
    return sold + lost !== difference;
  }).length;

  const submit = () => {
    const entries = countedEntries.flatMap(([productId, value]) => {
      const product = products.find((item) => item.id === productId);
      if (!product) return [];
      const actualQuantity = Number(value);
      const theoretical = Number(product.stock_total) || 0;
      const difference = theoretical - actualQuantity;
      if (difference > 0) {
        const sold = Number(splits[productId]?.vente) || 0;
        const lost = Number(splits[productId]?.perte) || 0;
        return [
          sold > 0 ? { product, quantity: sold, movementType: 'vente', justification: '' } : null,
          lost > 0 ? { product, quantity: lost, movementType: 'perte', justification: justifications[productId] || '' } : null,
        ].filter(Boolean);
      }
      return [{ product, actualQuantity }];
    });
    onSubmit(entries);
  };

  return (
    <div className="bg-white rounded-3xl border border-border/40 shadow-sm overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-5 sm:px-6 py-5 border-b border-border/40">
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Gestion de stock</p>
          <h2 className="text-xl font-bold flex items-center gap-2"><ClipboardCheck className="w-5 h-5 text-primary" />Recomptage des produits</h2>
        </div>
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un produit ou un EAN" className="pl-9 rounded-xl" />
        </div>
      </div>

      <div className="p-5 sm:p-6 border-b border-border/40 bg-secondary/30">
        <p className="text-sm text-muted-foreground">Renseignez la quantité réellement comptée. Si elle est inférieure au stock théorique, répartissez l’écart entre les unités vendues et les unités perdues.</p>
        {message && <p className="mt-3 text-sm font-medium text-primary">{message}</p>}
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[760px]">
          <div className="grid grid-cols-[1fr_120px_150px_260px] gap-3 px-6 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide border-b border-border/40">
            <span>Produit</span><span>Théorique</span><span>Réel compté</span><span>Nature de l’écart</span>
          </div>
          <div className="divide-y divide-border/40">
            {visibleProducts.map((product) => {
              const theoretical = Number(product.stock_total) || 0;
              const actual = counts[product.id] === '' || counts[product.id] == null ? null : Number(counts[product.id]);
              const hasLoss = actual !== null && !Number.isNaN(actual) && actual < theoretical;
              return (
                <div key={product.id} className="grid grid-cols-[1fr_120px_150px_260px] gap-3 items-center px-6 py-4">
                  <div>
                    <p className="text-sm font-bold text-foreground">{product.name}</p>
                    <p className="text-xs text-muted-foreground">{product.marque || 'Sans marque'}{product.barcode ? ` · EAN ${product.barcode}` : ''}</p>
                  </div>
                  <div className="text-sm font-semibold text-muted-foreground">{theoretical}</div>
                  <Input type="number" min="0" value={counts[product.id] || ''} onChange={(e) => setCounts((current) => ({ ...current, [product.id]: e.target.value }))} placeholder="Quantité" className="rounded-xl" />
                  {hasLoss ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-1.5">
                        <Input type="number" min="0" value={splits[product.id]?.vente || ''} onChange={(e) => setSplits((current) => ({ ...current, [product.id]: { ...current[product.id], vente: e.target.value } }))} placeholder="Vendues" className="rounded-lg h-9 text-xs" />
                        <Input type="number" min="0" value={splits[product.id]?.perte || ''} onChange={(e) => setSplits((current) => ({ ...current, [product.id]: { ...current[product.id], perte: e.target.value } }))} placeholder="Perdues" className="rounded-lg h-9 text-xs" />
                      </div>
                      <p className="text-[11px] text-muted-foreground">Total à répartir : {theoretical - actual} unité{theoretical - actual > 1 ? 's' : ''}</p>
                      {(Number(splits[product.id]?.perte) || 0) > 0 && <Input value={justifications[product.id] || ''} onChange={(e) => setJustifications((current) => ({ ...current, [product.id]: e.target.value }))} placeholder="Précision perte optionnelle" className="rounded-lg h-8 text-xs" />}
                    </div>
                  ) : <span className="text-xs text-muted-foreground">—</span>}
                </div>
              );
            })}
            {visibleProducts.length === 0 && <div className="text-center py-12 text-sm text-muted-foreground">Aucun produit trouvé.</div>}
          </div>
        </div>
      </div>

      <div className="px-5 sm:px-6 py-4 border-t border-border/40 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">{countedEntries.length} produit{countedEntries.length > 1 ? 's' : ''} renseigné{countedEntries.length > 1 ? 's' : ''}{invalidSplitCount > 0 ? ` · ${invalidSplitCount} écart${invalidSplitCount > 1 ? 's' : ''} à répartir correctement` : ''}</p>
        <Button disabled={countedEntries.length === 0 || invalidSplitCount > 0 || saving} onClick={submit} className="rounded-xl">Valider le recomptage</Button>
      </div>
    </div>
  );
}