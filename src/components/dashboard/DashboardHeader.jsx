import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function DashboardHeader() {
  const { t } = useLanguage();

  const handleLogout = () => {
    base44.auth.logout('/');
  };

  return (
    <header className="bg-white border-b border-border/50 sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">TS</span>
            </div>
            <span className="font-bold text-lg text-foreground tracking-tight">TrackSmart</span>
          </Link>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-2 text-muted-foreground">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">{t('nav_logout')}</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}