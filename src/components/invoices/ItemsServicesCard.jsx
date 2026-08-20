import React from 'react';
import { ReceiptText, Plus, Trash2 } from 'lucide-react';
import { lineTotal, lineDiscountAmount } from '@/lib/invoiceMath';

export default function ItemsServicesCard({ items, onChange, estimatedTotal, products = [] }) {
  const updateItem = (index, field, value) => {
    onChange(items.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  };

  const pickDescription = (index, value) => {
    const match = products.find((p) => p.name === value);
    onChange(items.map((item, i) => (i === index
      ? match
        ? { ...item, description: value, product_id: match.id, price: Number(match.price_chf || 0), stock_total: Number(match.stock_total || 0) }
        : { ...item, description: value, product_id: null, stock_total: undefined }
      : item)));
  };

  return (
    <section className="bg-white rounded-2xl border border-[#eee8dc] shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-[#8a6500]"><ReceiptText className="w-5 h-5" /> Articles & Services</h2>
        <button onClick={() => onChange([...items, { description: '', qty: 1, price: 0, discount: 0 }])} className="text-xs font-bold text-[#6f5400] bg-[#f3ecd9] border border-[#e2d6b4] rounded-full px-3 py-1.5 flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Ajouter une ligne</button>
      </div>
      <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-[#8b877d] mb-1 px-1">
        <span className="col-span-5">Description</span>
        <span className="col-span-2">Qté</span>
        <span className="col-span-2">Prix</span>
        <span className="col-span-3">Remise %</span>
      </div>
      <datalist id="invoice-products">
        {products.map((p) => <option key={p.id} value={p.name} />)}
      </datalist>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-5">
              <input list="invoice-products" value={item.description} onChange={(e) => pickDescription(index, e.target.value)} placeholder="Produit du stock ou description libre" className="w-full h-10 rounded-lg border border-[#d9d2c3] px-3 text-sm outline-none focus:ring-2 focus:ring-[#c9a646]/30" />
              {item.product_id && <span className="text-[11px] text-[#6f5400] font-semibold">Lié au stock · {item.stock_total ?? 0} en stock</span>}
            </div>
            <input type="number" min="1" value={item.qty} onChange={(e) => updateItem(index, 'qty', e.target.value)} className="col-span-2 h-10 rounded-lg border border-[#d9d2c3] px-2 text-sm outline-none focus:ring-2 focus:ring-[#c9a646]/30" />
            <input type="number" min="0" step="0.01" value={item.price} onChange={(e) => updateItem(index, 'price', e.target.value)} className="col-span-2 h-10 rounded-lg border border-[#d9d2c3] px-2 text-sm outline-none focus:ring-2 focus:ring-[#c9a646]/30" />
            <div className="col-span-3 flex items-center gap-1.5">
              <input type="number" min="0" max="100" step="1" value={item.discount ?? 0} onChange={(e) => updateItem(index, 'discount', e.target.value)} placeholder="0" className="flex-1 min-w-0 h-10 rounded-lg border border-[#d9d2c3] px-2 text-sm outline-none focus:ring-2 focus:ring-[#c9a646]/30" />
              <button onClick={() => onChange(items.filter((_, i) => i !== index))} className="text-[#9a9689] hover:text-red-500 shrink-0"><Trash2 className="w-4 h-4" /></button>
            </div>
            {Number(item.discount) > 0 && (
              <span className="col-span-12 text-[11px] font-semibold text-[#8a6500] px-1">
                Remise −{lineDiscountAmount(item).toFixed(2)}€ · net {lineTotal(item).toFixed(2)}€
              </span>
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 bg-[#faf6ec] border border-[#efe5c9] rounded-xl px-4 py-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-[#4b4a46]">Total estimé</span>
        <span className="text-lg font-extrabold text-[#8a6500]">{estimatedTotal.toFixed(2)}€</span>
      </div>
    </section>
  );
}