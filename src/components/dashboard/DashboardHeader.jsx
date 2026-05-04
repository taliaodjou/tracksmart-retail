import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '@/lib/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import NotificationBell from '@/components/dashboard/NotificationBell';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function DashboardHeader() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const location = useLocation();

  const handleLogout = () => base44.auth.logout('/');

  const navLink = (to, label, icon) => {
    const active = location.pathname === to;
    return (
      <Link
        to={to}
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
    <header className="bg-white border-b border-border/50 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand */}
          <Link to="/dashboard" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">TS</span>
            </div>
            <div>
              <span className="font-bold text-lg text-foreground tracking-tight">TrackSmart</span>
              {user?.shop_name && (
                <span className="hidden sm:inline text-xs text-muted-foreground ml-2">— {user.shop_name}</span>
              )}
            </div>
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-1">
            {navLink('/dashboard', t('nav_dashboard'), null)}
            {navLink('/profile', t('nav_profile'), <User className="w-3.5 h-3.5" />)}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <NotificationBell />
            <LanguageSwitcher />
            <Button variant="ghost" size="icon" onClick={handleLogout} title={t('nav_logout')}>
              <LogOut className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}