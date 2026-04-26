import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { Button } from '@/components/ui/button';
import { ShieldOff, Mail } from 'lucide-react';

export default function SubscriptionGate() {
  const { t } = useLanguage();

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-10 shadow-lg border border-border/40 max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-6">
          <ShieldOff className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-3">{t('sub_blocked_title')}</h2>
        <p className="text-muted-foreground mb-8 leading-relaxed">{t('sub_blocked_msg')}</p>
        <a href="mailto:admin@tracksmart.com">
          <Button className="rounded-full px-8 gap-2" size="lg">
            <Mail className="w-4 h-4" />
            {t('sub_contact')}
          </Button>
        </a>
      </div>
    </div>
  );
}