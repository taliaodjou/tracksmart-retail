import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';
export default function Navbar() {
  const { t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-border/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">TS</span>
            </div>
            <span className="font-bold text-lg text-foreground tracking-tight">TrackSmart</span>
          </Link>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('nav_features')}</a>
            <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('nav_pricing')}</a>
            <Link to="/dashboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{t('nav_dashboard')}</Link>
            <LanguageSwitcher />
            <Link to="/dashboard">
              <Button size="sm" className="rounded-full px-5">{t('nav_get_started')}</Button>
            </Link>
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden flex items-center gap-2">
            <LanguageSwitcher />
            <Button variant="ghost" size="icon" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <a href="#features" onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-muted-foreground">{t('nav_features')}</a>
            <a href="#pricing" onClick={() => setMobileOpen(false)} className="block py-2 text-sm text-muted-foreground">{t('nav_pricing')}</a>
            <Link to="/dashboard" onClick={() => setMobileOpen(false)}>
              <Button size="sm" className="w-full rounded-full">{t('nav_get_started')}</Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
}