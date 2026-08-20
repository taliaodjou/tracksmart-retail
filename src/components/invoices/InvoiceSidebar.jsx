import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, Box, ClipboardList, AlertTriangle, FileText, ShoppingCart, Settings, LogOut, Plus, CircleUserRound } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

const navItems = [
  { to: '/dashboard', label: 'Tableau de bord', icon: LayoutGrid },
  { to: '/products', label: 'Inventaire', icon: Box },
  { to: '/sales', label: 'Journal des ventes', icon: ClipboardList },
  { to: '/stock', label: 'Péremptions', icon: AlertTriangle },
  { to: '/invoices', label: 'Factures', icon: FileText },
  { to: '/sales', label: 'Caisse', icon: ShoppingCart, key: 'checkout' },
];

export default function InvoiceSidebar() {
  const location = useLocation();
  const { user } = useAuth();

  return (
    <aside className="hidden lg:flex w-56 shrink-0 bg-[#fbfaf7] border-r border-[#e9e4d8] min-h-screen flex-col px-4 py-6">
      <div className="px-2">
        <h1 className="text-xl font-extrabold text-[#8a6500] leading-tight">TrackSmart Retail</h1>
        <p className="text-[11px] text-[#8b877d] mt-1 font-medium tracking-wide">Premium POS System</p>
      </div>
      <Link to="/sales" className="mt-5 mx-1 h-10 rounded-lg bg-[#c9a646] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-sm">
        <Plus className="w-4 h-4" /> Nouvelle vente
      </Link>
      <nav className="mt-7 space-y-1 flex-1">
        {navItems.map(({ to, label, icon: Icon, key }) => {
          const active = location.pathname === to && !key;
          return (
            <Link key={key || to} to={to} className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${active ? 'bg-[#f3ecd9] text-[#6f5400] font-bold' : 'text-[#5c5952] hover:bg-white font-medium'}`}>
              <Icon className="w-4 h-4" />{label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-[#e9e4d8] pt-4 space-y-1">
        <Link to="/profile" className="flex items-center gap-3 px-3 py-2 text-sm text-[#5c5952] font-medium"><Settings className="w-4 h-4" />Paramètres</Link>
        <button onClick={() => base44.auth.logout('/')} className="flex items-center gap-3 px-3 py-2 text-sm text-[#5c5952] font-medium w-full"><LogOut className="w-4 h-4" />Déconnexion</button>
        <div className="flex items-center gap-3 px-3 pt-3">
          <CircleUserRound className="w-8 h-8 text-[#b7b3a8]" />
          <div>
            <p className="text-xs font-bold text-[#2a2926] leading-tight">{user?.full_name || user?.email}</p>
            <p className="text-[11px] text-[#8b877d]">{user?.role === 'admin' ? 'Admin' : 'Commerçant'}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}