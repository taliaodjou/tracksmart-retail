import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { isAdmin } from '@/lib/productUtils';
import { base44 } from '@/api/base44Client';
import {
  LayoutDashboard, Users, BarChart2, CreditCard, HeadphonesIcon,
  Settings, LogOut, Menu, X, ChevronRight
} from 'lucide-react';

const navItems = [
  { to: '/admin-portal', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin-portal/clients', label: 'Clients', icon: Users },
  { to: '/admin-portal/analytics', label: 'Analytics', icon: BarChart2 },
  { to: '/admin-portal/subscriptions', label: 'Abonnements', icon: CreditCard },
  { to: '/admin-portal/support', label: 'Support', icon: HeadphonesIcon },
  { to: '/admin-portal/settings', label: 'Paramètres', icon: Settings },
];

export default function AdminLayout({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (user && !isAdmin(user)) {
    navigate('/dashboard');
    return null;
  }

  const handleLogout = () => base44.auth.logout('/');

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-sm">⌛</span>
          </div>
          <div>
            <div className="font-bold text-white text-sm leading-tight">TrackSmart</div>
            <div className="text-xs text-white/50 font-medium tracking-wider">TNO STUDIO</div>
          </div>
        </div>
      </div>

      {/* Admin badge */}
      <div className="px-4 py-3 mx-4 mt-4 rounded-xl bg-primary/20 border border-primary/30">
        <div className="text-xs font-semibold text-primary uppercase tracking-wider">Admin Portal</div>
        <div className="text-xs text-white/50 mt-0.5 truncate">{user?.email}</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {navItems.map(({ to, label, icon: Icon }) => {
          const active = location.pathname === to || (to !== '/admin-portal' && location.pathname.startsWith(to));
          return (
            <Link
              key={to}
              to={to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {label}
              {active && <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-60" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-6">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/10 transition-all w-full"
        >
          <LogOut className="w-4 h-4" />
          Déconnexion
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F4F5F7] overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-[#1A1D23] flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-[#1A1D23] flex flex-col h-full z-10">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-4 sm:px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-1.5 rounded-lg hover:bg-gray-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <span className="text-sm font-semibold text-gray-800">Admin Portal</span>
              <span className="hidden sm:inline text-gray-400 text-sm"> — TNO Studio</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-bold text-xs">
                {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'A'}
              </span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}