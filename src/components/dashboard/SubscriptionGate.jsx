import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { Button } from '@/components/ui/button';
import { ShieldOff, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SubscriptionGate({ status }) {
  const { t } = useLanguage();

  const isNone = status === 'none' || !status;

  return (
    <div className="min-h-screen bg-secondary/30 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-10 shadow-lg border border-border/40 max-w-md w-full text-center">
        <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-6">
          <ShieldOff className="w-8 h-8 text-orange-500" />
        </div>
        <h2 className="text-xl font-bold text-foreground mb-3">
          {isNone ? t('sub_none_title') : t('sub_inactive_title')}
        </h2>
        <p className="text-muted-foreground mb-8 leading-relaxed">
          {isNone ? t('sub_none_msg') : t('sub_inactive_msg')}
        </p>
        <Link to="/#pricing">
          <Button className="rounded-full px-8 gap-2" size="lg">
            {t('sub_choose_plan')}
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}