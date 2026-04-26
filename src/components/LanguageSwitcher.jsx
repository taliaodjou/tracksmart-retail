import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { Button } from '@/components/ui/button';

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();
  return (
    <div className="flex items-center gap-1">
      <Button variant={lang === 'fr' ? 'default' : 'ghost'} size="sm" onClick={() => setLang('fr')} className="text-xs px-2 py-1 h-7">
        🇫🇷 FR
      </Button>
      <Button variant={lang === 'en' ? 'default' : 'ghost'} size="sm" onClick={() => setLang('en')} className="text-xs px-2 py-1 h-7">
        🇬🇧 EN
      </Button>
    </div>
  );
}