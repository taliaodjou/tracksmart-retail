import React from 'react';

export default function CategoryTabs({ activeCategory, onChange }) {
  const categories = ['Tout', 'Boissons', 'Épicerie', 'Boulangerie'];

  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-1">
      {categories.map((category) => (
        <button key={category} onClick={() => onChange(category)} className={`min-w-24 px-5 py-2.5 rounded-full border text-sm font-semibold transition-colors ${activeCategory === category ? 'bg-[#c9a646] border-[#c9a646] text-white' : 'bg-white border-[#d9d2c3] text-[#4b4a46]'}`}>
          {category}
        </button>
      ))}
    </div>
  );
}