import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/lib/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import NotificationBell from '@/components/dashboard/NotificationBell';
import { Button } from '@/components/ui/button';
import { LogOut, User, BarChart2, ShoppingCart, Menu, X, FileText, Folder, Users, Activity, ChevronDown } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { canAccessAnalytics, canManageTeam } from '@/lib/productUtils';

export default function DashboardHeader() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);

  const handleLogout = () => base44.auth.logout('/');

  // Primary nav items shown inline
  const primaryNavItems = [
    { to: '/dashboard', label: t('nav_dashboard'), icon: null },
    ...(canAccessAnalytics(user) ? [{ to: '/analytics', label: t('nav_analytics'), icon: <BarChart2 className="w-3.5 h-3.5" /> }] : []),
    { to: '/orders', label: t('nav_orders'), icon: <ShoppingCart className="w-3.5 h-3.5" /> },
  ];

  // Secondary nav items in "Plus" dropdown
  const secondaryNavItems = [
    { to: '/documents', label: 'Documents', icon: <Folder className="w-3.5 h-3.5" /> },
    ...(canManageTeam(user) ? [{ to: '/team', label: 'Équipe', icon: <Users className="w-3.5 h-3.5" /> }] : []),
    { to: '/activity', label: 'Activité', icon: <Activity className="w-3.5 h-3.5" /> },
    { to: '/profile', label: t('nav_profile'), icon: <User className="w-3.5 h-3.5" /> },
    { to: '/reports', label: 'Rapports', icon: <FileText className="w-3.5 h-3.5" /> },
  ];

  // Keep navItems for mobile menu (all items)
  const navItems = [...primaryNavItems, ...secondaryNavItems];

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
          <Link to="/dashboard" className="flex items-center gap-2 flex-shrink-0" title="Tableau de bord">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">TS</span>
            </div>
            <span className="font-bold text-base sm:text-lg text-foreground tracking-tight">TrackSmart Retail</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden sm:flex items-center gap-0.5">
            {primaryNavItems.map(item => navLink(item.to, item.label, item.icon))}
            {/* More dropdown */}
            <div className="relative">
              <button
                onClick={() => setMoreOpen(o => !o)}
                className={`flex items-center gap-1 text-sm px-3 py-1.5 rounded-full transition-colors ${secondaryNavItems.some(i => location.pathname === i.to) ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}
              >
                <span>Plus</span>
                <ChevronDown className="w-3 h-3" />
              </button>
              {moreOpen && (
                <div className="absolute right-0 top-full mt-1 bg-white border border-border/50 rounded-xl shadow-lg py-1 z-50 min-w-[180px]" onMouseLeave={() => setMoreOpen(false)}>
                  {secondaryNavItems.map(item => (
                    <Link key={item.to} to={item.to} onClick={() => setMoreOpen(false)} className={`flex items-center gap-2 px-4 py-2 text-sm transition-colors ${location.pathname === item.to ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}`}>
                      {item.icon} {item.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
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