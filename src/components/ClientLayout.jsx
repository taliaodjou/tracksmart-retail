import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import SupportModeBanner from '@/components/SupportModeBanner';
import {
  LayoutDashboard, Upload, Package, BarChart2, Settings, LogOut, Menu, X
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/orders', label: 'Importer Excel', icon: Upload },
  { to: '/products', label: 'Produits', icon: Package },
  { to: '/analytics', label: 'Analytiques', icon: BarChart2 },
  { to: '/profile', label: 'Paramètres', icon: Settings },
];

export default function ClientLayout({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  const handleLogout = () => base44.auth.logout('/');

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border/30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">⌛</span>
          </div>
          <div>
            <div className="font-bold text-foreground text-sm">TrackSmart</div>
            <div className="text-xs text-muted-foreground">by TNO Studio</div>
          </div>
        </div>
      </div>

      {/* User info */}
      {user?.shop_name && (
        <div className="px-5 py-3 bg-secondary/50 mx-3 mt-3 rounded-xl">
          <div className="text-xs font-semibold text-foreground truncate">{user.shop_name}</div>
          <div className="text-xs text-muted-foreground truncate">{user.email}</div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to;
          return (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-5">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition-all w-full"
        >
          <LogOut className="w-4 h-4" />
          Déconnexion
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F4F5F7] overflow-hidden flex-col">
      <SupportModeBanner />
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-border/50 flex-shrink-0">
          <SidebarContent />
        </aside>

        {/* Mobile sidebar overlay */}
        {open && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
            <aside className="relative w-64 bg-white flex flex-col h-full z-10">
              <button onClick={() => setOpen(false)} className="absolute top-4 right-4 text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
              <SidebarContent />
            </aside>
          </div>
        )}

        {/* Main */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile topbar */}
          <header className="lg:hidden bg-white border-b border-border/50 px-4 py-3 flex items-center gap-3 flex-shrink-0">
            <button onClick={() => setOpen(true)} className="p-1.5 rounded-lg hover:bg-secondary">
              <Menu className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">⌛</span>
              </div>
              <span className="font-semibold text-sm">TrackSmart</span>
            </div>
          </header>

          {/* Content */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}