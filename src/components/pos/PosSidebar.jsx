import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, Box, LogOut, Settings, ShoppingBag, Users, ClipboardList, FileText } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const navItems = [
  { to: '/dashboard', label: 'Tableau de bord', icon: BarChart3 },
  { to: '/sales', label: 'Ventes', icon: ShoppingBag },
  { to: '/products', label: 'Inventaire', icon: Box },
  { to: '/invoices', label: 'Factures', icon: FileText },
  { to: '/team', label: 'Clients', icon: Users },
  { to: '/reports', label: 'Rapports', icon: ClipboardList },
];

export default function PosSidebar() {
  const location = useLocation();
  const handleLogout = () => base44.auth.logout('/');

  return (
    <aside className="hidden lg:flex w-64 bg-[#f7f7f8] border-r border-[#ece8df] min-h-screen flex-col px-7 py-8">
      <div className="mb-10">
        <h1 className="text-2xl font-extrabold leading-tight text-[#6f5400]">TrackSmart<br />Retail</h1>
        <p className="text-xs text-[#837f75] mt-2 font-semibold">Session: Caisse 01</p>
      </div>
      <nav className="space-y-3 flex-1">
        {navItems.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to;
          return <Link key={to} to={to} className={`flex items-center gap-3 px-3 py-3 rounded-r-xl text-sm transition-colors ${active ? 'bg-[#e6e2da] text-[#8a6500] border-r-4 border-[#8a6500] font-semibold' : 'text-[#74716b] hover:bg-white'}`}><Icon className="w-5 h-5" />{label}</Link>;
        })}
      </nav>
      <div className="space-y-3 border-t border-[#ece8df] pt-6">
        <Link to="/profile" className="flex items-center gap-3 px-3 py-3 text-sm text-[#74716b]"><Settings className="w-5 h-5" />Paramètres</Link>
        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-3 text-sm text-red-600"><LogOut className="w-5 h-5" />Déconnexion</button>
      </div>
    </aside>
  );
}