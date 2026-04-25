import React, { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { Button } from '@/components/ui/button';
import { ShieldOff, Loader2 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

export default function SubscriptionGate({ onActivated }) {
  const { t } = useLanguage();
  const [activating, setActivating] = useState(false);

  const handleActivate = async () => {
    setActivating(true);
    // Mock activation logic
    await new Promise(resolve => setTimeout(resolve, 1500));
    await base44.auth.updateMe({ subscription_status: 'active' });
    setActivating(false);
    toast.success(t('sub_active'));
    onActivated();
  };

  return (
    <div className="min-h-screen bg-secondary/30 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-10 shadow-lg border border-border/40 max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-6">
          <ShieldOff className="w-8 h-8 text-orange-500" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-3">{t('sub_inactive_title')}</h2>
        <p className="text-muted-foreground mb-8 leading-relaxed">{t('sub_inactive_msg')}</p>
        <Button
          onClick={handleActivate}
          disabled={activating}
          className="rounded-full px-8 gap-2"
          size="lg"
        >
          {activating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t('sub_activating')}
            </>
          ) : (
            t('sub_activate')
          )}
        </Button>
      </div>
    </div>
  );
}