import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { Badge } from '@/components/ui/badge';
import { format, addMonths } from 'date-fns';
import { getNextRenewalDate } from '@/lib/schedulerUtils';
import { User, Phone, Mail, MessageSquare } from 'lucide-react';

export default function Profile() {
  const { t, lang } = useLanguage();
  const { user, checkUserAuth } = useAuth();
  const [form, setForm] = useState({ phone_number: '', report_channel: 'email' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        phone_number: user.phone_number || '',
        report_channel: user.report_channel || 'email',
      });
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await base44.auth.updateMe(form);
    await checkUserAuth();
    setSaving(false);
    toast.success(t('profile_saved'));
  };

  const nextRenewal = user?.subscription_start_date ? getNextRenewalDate(user.subscription_start_date) : null;

  return (
    <div className="min-h-screen bg-secondary/30">
      <DashboardHeader />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold text-foreground mb-8">{t('profile_title')}</h1>

        {/* Subscription card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-border/40 mb-6">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            {t('profile_subscription')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t('profile_sub_status')}</p>
              <Badge className={user?.subscription_status === 'active'
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-red-100 text-red-700 border border-red-200'}>
                {user?.subscription_status === 'active' ? t('profile_sub_active') : t('profile_sub_inactive')}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t('profile_sub_start')}</p>
              <p className="text-sm font-medium text-foreground">
                {user?.subscription_start_date
                  ? format(new Date(user.subscription_start_date), 'dd/MM/yyyy')
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">{t('profile_next_renewal')}</p>
              <p className="text-sm font-medium text-foreground">
                {nextRenewal ? format(nextRenewal, 'dd/MM/yyyy') : '—'}
              </p>
            </div>
          </div>
        </div>

        {/* Profile form */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-border/40">
          <h2 className="font-semibold text-foreground mb-4">{lang === 'fr' ? 'Préférences de notification' : 'Notification preferences'}</h2>
          <form onSubmit={handleSave} className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-sm flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                {t('profile_phone')}
              </Label>
              <Input
                value={form.phone_number}
                onChange={e => setForm({ ...form, phone_number: e.target.value })}
                placeholder="+41 79 000 00 00"
                type="tel"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">{t('profile_report_channel')}</Label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, report_channel: 'email' })}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                    form.report_channel === 'email'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/40'
                  }`}
                >
                  <Mail className="w-4 h-4" />
                  {t('profile_email')}
                </button>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, report_channel: 'sms' })}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                    form.report_channel === 'sms'
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-border text-muted-foreground hover:border-primary/40'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  {t('profile_sms')}
                </button>
              </div>
              {form.report_channel === 'sms' && !form.phone_number && (
                <p className="text-xs text-orange-600">{lang === 'fr' ? 'Veuillez entrer un numéro de téléphone.' : 'Please enter a phone number.'}</p>
              )}
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={saving} className="rounded-full px-8">
                {saving ? t('loading') : t('profile_save')}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}