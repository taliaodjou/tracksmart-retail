import React from 'react';
import { Minus, Plus, Trash2, WalletCards } from 'lucide-react';

export default function CartPanel({ items, subtotal, tax, total, onIncrease, onDecrease, onClear, onPay, isPaying }) {
  return (
    <aside className="w-full xl:w-[360px] bg-white border-l border-[#ece8df] flex flex-col min-h-[calc(100vh-5rem)]">
      <div className="h-20 px-5 flex items-center justify-between border-b border-[#f0ece3]"><h2 className="text-xl font-extrabold">Panier actuel</h2><button onClick={onClear}><Trash2 className="w-4 h-4 text-[#4b4a46]" /></button></div>
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {items.length === 0 ? <p className="text-sm text-[#8a867c] text-center py-10">Ajoutez un produit pour démarrer la vente.</p> : items.map((item) => (
          <div key={item.id} className="bg-[#f8f8f8] border border-[#eeeeee] rounded-lg p-3">
            <div className="flex items-start justify-between gap-3"><h3 className="text-sm font-bold leading-tight">{item.name}</h3><p className="text-sm font-extrabold">{(item.price_chf * item.qty).toFixed(2)}€</p></div>
            <div className="mt-3 flex items-center justify-between"><p className="text-xs text-[#74716b]">{item.price_chf.toFixed(2)}€ / u</p><div className="flex items-center rounded-full bg-white border border-[#e5e2dc]"><button onClick={() => onDecrease(item.id)} className="w-8 h-7 flex items-center justify-center"><Minus className="w-4 h-4" /></button><span className="w-7 text-center text-sm font-bold">{item.qty}</span><button onClick={() => onIncrease(item.id)} className="w-8 h-7 flex items-center justify-center"><Plus className="w-4 h-4" /></button></div></div>
          </div>
        ))}
      </div>
      <div className="border-t border-[#ece8df] p-5 space-y-3 bg-white"><div className="flex justify-between text-sm text-[#74716b]"><span>Sous-total HT</span><span>{subtotal.toFixed(2)}€</span></div><div className="flex justify-between text-sm text-[#74716b]"><span>TVA (20%)</span><span>{tax.toFixed(2)}€</span></div><div className="flex justify-between text-xl font-extrabold pt-2 border-t border-[#eee8dc]"><span>Total TTC</span><span className="text-[#8a6500]">{total.toFixed(2)}€</span></div><button onClick={onPay} disabled={!items.length || isPaying} className="w-full h-14 rounded-xl bg-[#8a6500] text-white font-extrabold shadow disabled:opacity-50 flex items-center justify-center gap-2"><WalletCards className="w-5 h-5" />{isPaying ? 'Paiement...' : 'Procéder au paiement'}</button></div>
    </aside>
  );
}