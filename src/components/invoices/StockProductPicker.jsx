import React, { useMemo, useState } from 'react';
import { Search, PackagePlus } from 'lucide-react';

export default function StockProductPicker({ products = [], onPick }) {
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = q ? products.filter((p) => `${p.name} ${p.marque || ''} ${p.barcode || ''}`.toLowerCase().includes(q)) : products;
    return list.slice(0, 40);
  }, [products, query]);

  return (
    <section className="bg-white rounded-2xl border border-[#eee8dc] shadow-sm p-5">
      <h2 className="flex items-center gap-2 text-lg font-extrabold text-[#8a6500] mb-3"><PackagePlus className="w-5 h-5" /> Produits du stock</h2>
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9a9689]" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher un produit enregistré..."
          className="w-full h-10 rounded-lg border border-[#d9d2c3] pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#c9a646]/30"
        />
      </div>
      <div className="mt-3 max-h-64 overflow-y-auto divide-y divide-[#f2ece0]">
        {results.length === 0 && <p className="py-4 text-sm text-[#8b877d]">Aucun produit en stock trouvé.</p>}
        {results.map((p) => (
          <button
            key={p.id}
            onClick={() => onPick(p)}
            className="w-full text-left py-2.5 flex items-center justify-between gap-3 hover:bg-[#faf6ec] px-1 rounded"
          >
            <span className="min-w-0">
              <span className="block text-sm font-semibold text-[#2a2926] truncate">{p.name}</span>
              <span className="block text-[11px] text-[#8b877d]">{p.marque ? `${p.marque} · ` : ''}{Number(p.stock_total || 0)} en stock</span>
            </span>
            <span className="text-sm font-extrabold text-[#8a6500] shrink-0">{Number(p.price_chf || 0).toFixed(2)}€</span>
          </button>
        ))}
      </div>
      <p className="mt-3 text-[11px] text-[#8b877d]">Les prix ajoutés restent modifiables dans la liste des articles.</p>
    </section>
  );
}