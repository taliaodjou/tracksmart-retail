import React from 'react';
import { Plus } from 'lucide-react';

const fallbackImages = [
  'https://images.unsplash.com/photo-1555507036-ab794f4afe5b?auto=format&fit=crop&w=500&q=80',
  'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&w=500&q=80',
  'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=500&q=80',
];

export default function ProductCard({ product, index, onAdd }) {
  const stock = Number(product.stock_total || 0);
  const price = Number(product.price_chf || 0);
  const image = product.image_url || fallbackImages[index % fallbackImages.length];

  return (
    <article className="w-full sm:w-32 bg-white rounded-xl border border-[#eee8dc] shadow-sm overflow-hidden">
      <div className="h-28 relative bg-[#eee9df]">
        <img src={image} alt={product.name} className="w-full h-full object-cover" />
        <span className="absolute top-2 right-2 text-[10px] bg-[#5e5b55]/80 text-white rounded-full px-2 py-1">En stock: {stock}</span>
      </div>
      <div className="p-3">
        <h3 className="text-sm font-bold text-[#2a2926] leading-snug h-10 overflow-hidden">{product.name}</h3>
        <div className="mt-3 flex items-center justify-between">
          <p className="text-lg font-extrabold text-[#8a6500]">{price.toFixed(2)}€</p>
          <button onClick={() => onAdd(product)} disabled={stock <= 0} className="w-8 h-8 rounded-full bg-[#c9a646] text-white flex items-center justify-center disabled:opacity-40"><Plus className="w-4 h-4" /></button>
        </div>
      </div>
    </article>
  );
}