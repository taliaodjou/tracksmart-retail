import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="py-10 border-t border-border/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">TS</span>
            </div>
            <span className="font-bold text-foreground">TrackSmart Retail</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} TrackSmart Retail. {t('footer_rights')}
          </p>
        </div>
      </div>
    </footer>
  );
}