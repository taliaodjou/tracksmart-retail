import React, { useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { hasActiveSubscription } from '@/lib/productUtils';

export default function SubscriptionGate() {
  const { t } = useLanguage();
  const { user, checkUserAuth } = useAuth();

  useEffect(() => {
    if (hasActiveSubscription(user)) return undefined;

    const interval = window.setInterval(async () => {
      try {
        const latestUser = await base44.auth.me();
        if (hasActiveSubscription(latestUser)) {
          sessionStorage.setItem('tracksmart_account_validated', 'true');
          window.location.href = '/welcome?validated=1';
          return;
        }
        checkUserAuth();
      } catch {
        checkUserAuth();
      }
    }, 5000);

    return () => window.clearInterval(interval);
  }, [user, checkUserAuth]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-10 shadow-sm border border-[#e8dfc8] max-w-lg w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 text-primary">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-primary">TrackSmart Retail</p>
        <h2 className="text-2xl font-bold text-foreground mb-4">{t('sub_blocked_title')}</h2>
        <p className="text-muted-foreground leading-relaxed">{t('sub_blocked_msg')}</p>
        <div className="mt-8 rounded-2xl border border-border bg-secondary/40 px-5 py-4 text-sm text-muted-foreground">
          {t('sub_waiting_auto')}
        </div>
      </div>
    </div>
  );
}