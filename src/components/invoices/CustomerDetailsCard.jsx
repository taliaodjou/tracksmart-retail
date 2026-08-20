import React, { useState } from 'react';
import { UserRound, Search, MapPin, X, Plus } from 'lucide-react';

export default function CustomerDetailsCard({ customer, onChange, savedCustomers = [] }) {
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(!customer.name);

  const suggestions = search.trim()
    ? savedCustomers.filter((c) => c.name.toLowerCase().includes(search.trim().toLowerCase())).slice(0, 5)
    : [];

  const selectCustomer = (c) => {
    onChange(c);
    setSearch('');
    setEditing(false);
  };

  return (
    <section className="bg-white rounded-2xl border border-[#eee8dc] shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-lg font-extrabold text-[#8a6500]"><UserRound className="w-5 h-5" /> Détails du client</h2>
        <button onClick={() => { onChange({ name: '', address: '', email: '' }); setEditing(true); }} className="text-xs font-bold text-[#8a6500] flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> Nouveau client</button>
      </div>
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9a9689]" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un client existant" className="w-full h-10 rounded-lg border border-[#d9d2c3] pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#c9a646]/30" />
        {suggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white border border-[#e5e0d3] rounded-lg shadow-lg overflow-hidden">
            {suggestions.map((c) => (
              <button key={c.name + c.email} onClick={() => selectCustomer(c)} className="w-full text-left px-4 py-2.5 text-sm hover:bg-[#faf6ec]">
                <span className="font-bold">{c.name}</span>
                {c.email && <span className="text-[#8b877d] ml-2 text-xs">{c.email}</span>}
              </button>
            ))}
          </div>
        )}
      </div>
      {editing ? (
        <div className="mt-4 space-y-2">
          <input value={customer.name} onChange={(e) => onChange({ ...customer, name: e.target.value })} placeholder="Nom du client" className="w-full h-10 rounded-lg border border-[#d9d2c3] px-3 text-sm outline-none focus:ring-2 focus:ring-[#c9a646]/30" />
          <input value={customer.address} onChange={(e) => onChange({ ...customer, address: e.target.value })} placeholder="Adresse" className="w-full h-10 rounded-lg border border-[#d9d2c3] px-3 text-sm outline-none focus:ring-2 focus:ring-[#c9a646]/30" />
          <input value={customer.email} onChange={(e) => onChange({ ...customer, email: e.target.value })} placeholder="Email de facturation" className="w-full h-10 rounded-lg border border-[#d9d2c3] px-3 text-sm outline-none focus:ring-2 focus:ring-[#c9a646]/30" />
        </div>
      ) : (
        <div className="mt-4 bg-[#f3f2ef] border border-[#e7e4dc] rounded-xl p-4 flex items-start gap-3">
          <MapPin className="w-4 h-4 text-[#8a6500] mt-0.5" />
          <div className="flex-1 text-sm">
            <p className="font-bold text-[#2a2926]">{customer.name}</p>
            {customer.address && <p className="text-[#6b675e]">{customer.address}</p>}
            {customer.email && <p className="text-[#6b675e]">{customer.email}</p>}
          </div>
          <button onClick={() => setEditing(true)}><X className="w-4 h-4 text-[#8b877d]" /></button>
        </div>
      )}
    </section>
  );
}