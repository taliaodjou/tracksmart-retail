import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import {
  LayoutDashboard, Users, BarChart3, CreditCard, HeadphonesIcon, Settings, LogOut, Menu, X, Hourglass
} from 'lucide-react';

const navItems = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'clients', label: 'Clients', icon: Users },
  { key: 'analytics', label: 'Analytics', icon: BarChart3 },
  { key: 'subscriptions', label: 'Abonnements', icon: CreditCard },
  { key: 'support', label: 'Support', icon: HeadphonesIcon },
  { key: 'settings', label: 'Paramètres', icon: Settings },
];

export default function AdminSidebar({ activeSection, onNavigate }) {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
          <Hourglass className="w-5 h-5 text-primary-foreground" />
        </div>
        {!collapsed && (
          <div>
            <div className="font-bold text-white text-sm leading-tight tracking-tight">TrackSmart</div>
            <div className="text-[10px] text-white/40 tracking-widest uppercase">TNO Studio</div>
          </div>
        )}
      </div>

      {/* Admin badge */}
      {!collapsed && (
        <div className="mx-3 mt-4 px-3 py-2 bg-primary/15 rounded-xl border border-primary/20">
          <div className="text-[10px] text-primary/70 uppercase tracking-widest font-semibold mb-0.5">Admin Portal</div>
          <div className="text-xs text-white/70 truncate">{user?.email}</div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-2 py-4 space-y-0.5">
        {navItems.map(item => {
          const Icon = item.icon;
          const active = activeSection === item.key;
          return (
            <button
              key={item.key}
              onClick={() => { onNavigate(item.key); setMobileOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-primary text-black font-semibold'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Collapse toggle (desktop) */}
      <div className="hidden lg:block px-3 pb-3">
        <button
          onClick={() => setCollapsed(c => !c)}
          className="w-full flex items-center justify-center py-2 rounded-xl text-white/30 hover:text-white/70 hover:bg-white/5 transition-all"
        >
          {collapsed ? <Menu className="w-4 h-4" /> : <X className="w-4 h-4" />}
        </button>
      </div>

      {/* Logout */}
      <div className="px-2 pb-4">
        <button
          onClick={() => base44.auth.logout('/')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all ${collapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col flex-shrink-0 bg-[#141414] border-r border-white/8 transition-all duration-300 ${collapsed ? 'w-16' : 'w-56'}`}>
        <SidebarContent />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#141414] border-b border-white/10 flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Hourglass className="w-4 h-4 text-black" />
          </div>
          <span className="font-bold text-white text-sm">TrackSmart <span className="text-white/40 font-normal text-xs">Admin</span></span>
        </div>
        <button onClick={() => setMobileOpen(o => !o)} className="text-white/60 hover:text-white">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="w-56 bg-[#141414] h-full pt-14">
            <SidebarContent />
          </div>
          <div className="flex-1 bg-black/50" onClick={() => setMobileOpen(false)} />
        </div>
      )}
    </>
  );
}