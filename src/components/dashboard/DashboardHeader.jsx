import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/lib/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import NotificationBell from '@/components/dashboard/NotificationBell';
import { Button } from '@/components/ui/button';
import { LogOut, User, BarChart2, ShoppingCart, Menu, X, FileText } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function DashboardHeader() {
  const { t } = useLanguage();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => base44.auth.logout('/');

  const navItems = [
    { to: '/dashboard', label: t('nav_dashboard'), icon: null },
    { to: '/analytics', label: t('nav_analytics'), icon: <BarChart2 className="w-3.5 h-3.5" /> },
    { to: '/orders', label: t('nav_orders'), icon: <ShoppingCart className="w-3.5 h-3.5" /> },
    { to: '/reports', label: 'Rapports', icon: <FileText className="w-3.5 h-3.5" /> },
    { to: '/profile', label: t('nav_profile'), icon: <User className="w-3.5 h-3.5" /> },
  ];

  const navLink = (to, label, icon) => {
    const active = location.pathname === to;
    return (
      <Link
        key={to}
        to={to}
        onClick={() => setMobileOpen(false)}
        className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full transition-colors ${
          active
            ? 'bg-primary text-primary-foreground'
            : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
        }`}
      >
        {icon}
        <span className="hidden sm:inline">{label}</span>
      </Link>
    );
  };

  return (
    <header className="bg-white border-b border-border/50 fixed top-0 left-0 right-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Brand */}
          <Link to="/dashboard" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">TS</span>
            </div>
            <span className="font-bold text-base sm:text-lg text-foreground tracking-tight">TrackSmart</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden sm:flex items-center gap-0.5">
            {navItems.map(item => navLink(item.to, item.label, item.icon))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-1.5">
            <NotificationBell />
            <LanguageSwitcher />
            <Button variant="ghost" size="icon" onClick={handleLogout} title={t('nav_logout')} className="hidden sm:flex">
              <LogOut className="w-4 h-4 text-muted-foreground" />
            </Button>
            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="sm:hidden"
              onClick={() => setMobileOpen(o => !o)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileOpen && (
          <div className="sm:hidden border-t border-border/30 py-3 space-y-1">
            {navItems.map(item => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    active
                      ? 'bg-primary text-primary-foreground'
                      : 'text-foreground hover:bg-secondary'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              );
            })}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 w-full transition-colors"
            >
              <LogOut className="w-4 h-4" />
              {t('nav_logout')}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}