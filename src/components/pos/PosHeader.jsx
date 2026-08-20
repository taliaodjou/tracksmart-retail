import React from 'react';
import { Bell, Barcode, CircleUserRound, Search } from 'lucide-react';

export default function PosHeader({ search, onSearchChange }) {
  return (
    <header className="h-20 bg-white border-b border-[#ece8df] px-5 lg:px-6 flex items-center gap-4">
      <h2 className="text-2xl font-extrabold text-[#6f5400] hidden sm:block">TrackSmart POS</h2>
      <div className="flex-1 max-w-xl relative">
        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-[#7b776f]" />
        <input value={search} onChange={(e) => onSearchChange(e.target.value)} placeholder="Rechercher un produit (Code, Nom)..." className="w-full h-11 rounded-full border border-[#d9d2c3] bg-[#fbfbfb] pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#c9a646]/30" />
      </div>
      <div className="hidden sm:flex items-center gap-5 text-[#2c2c2c]">
        <Barcode className="w-5 h-5" />
        <Bell className="w-5 h-5" />
        <CircleUserRound className="w-5 h-5" />
        <button className="bg-[#202124] text-white rounded-lg px-5 py-2.5 text-sm font-semibold">Clôture Caisse</button>
      </div>
    </header>
  );
}