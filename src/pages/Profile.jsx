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
import { User, Phone, Mail, MessageSquare, HeadphonesIcon, ExternalLink, ChevronDown, ChevronUp, CheckCircle2, BellOff, Bell } from 'lucide-react';
import AccountingSettings from '@/components/profile/AccountingSettings';
import SubscriptionPlans from '@/components/profile/SubscriptionPlans';

export default function Profile() {
  const { t, lang } = useLanguage();
  const { user, checkUserAuth } = useAuth();
  const [form, setForm] = useState({ shop_name: '', phone_number: '', report_channel: 'email' });
  const [saving, setSaving] = useState(false);
  const [prefOpen, setPrefOpen] = useState(false);
  const [savedBanner, setSavedBanner] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        shop_name: user.shop_name || '',
        phone_number: user.phone_number || '',
        report_channel: user.report_channel || 'email',
      });
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await base44.auth.updateMe({ shop_name: form.shop_name, phone_number: form.phone_number, report_channel: form.report_channel });
    await checkUserAuth();
    setSaving(false);
    setPrefOpen(false);
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 3000);
  };

  const nextRenewal = user?.subscription_start_date ? getNextRenewalDate(user.subscription_start_date) : null;

  return (
    <div className="min-h-screen bg-secondary/30">
      <DashboardHeader />
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-2xl font-bold text-foreground mb-8">{t('profile_title')}</h1>

        {/* Subscription plans */}
        <div className="mb-6">
          <SubscriptionPlans user={user} />
        </div>

        {/* Support card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-border/40 mb-6">
          <h2 className="font-semibold text-foreground mb-1 flex items-center gap-2">
            <HeadphonesIcon className="w-4 h-4 text-primary" />
            {lang === 'fr' ? 'Service client' : 'Customer support'}
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            {lang === 'fr'
              ? 'Une question, un problème ou une demande ? Notre équipe est disponible pour vous aider.'
              : 'A question, issue or request? Our team is available to help.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="mailto:support@tracksmart.com"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors"
            >
              <Mail className="w-4 h-4 text-primary" />
              support@tracksmart.com
            </a>
            <a
              href="https://wa.me/41772229764"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors"
            >
              <MessageSquare className="w-4 h-4 text-primary" />
              WhatsApp <ExternalLink className="w-3 h-3 text-muted-foreground" />
            </a>
          </div>
        </div>

        {/* Email preferences */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-border/40 mb-6">
          <h2 className="font-semibold text-foreground mb-1 flex items-center gap-2">
            {user?.email_unsubscribed ? <BellOff className="w-4 h-4 text-orange-500" /> : <Bell className="w-4 h-4 text-primary" />}
            {lang === 'fr' ? 'Notifications email' : 'Email notifications'}
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            {user?.email_unsubscribed
              ? (lang === 'fr' ? 'Vous ne recevez plus les emails de notification TrackSmart.' : 'You are no longer receiving TrackSmart notification emails.')
              : (lang === 'fr' ? 'Vous recevez les emails de notification TrackSmart.' : 'You are receiving TrackSmart notification emails.')
            }
          </p>
          <button
            onClick={async () => {
              const newVal = !user.email_unsubscribed;
              await base44.auth.updateMe({ email_unsubscribed: newVal });
              await checkUserAuth();
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${
              user?.email_unsubscribed
                ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                : 'border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100'
            }`}
          >
            {user?.email_unsubscribed
              ? <><Bell className="w-4 h-4" /> {lang === 'fr' ? 'Se réabonner aux emails' : 'Re-subscribe to emails'}</>
              : <><BellOff className="w-4 h-4" /> {lang === 'fr' ? 'Se désabonner des emails' : 'Unsubscribe from emails'}</>
            }
          </button>
        </div>

        {/* Accounting settings */}
        <AccountingSettings user={user} onSaved={checkUserAuth} />

        {/* Profile form */}
        <div className="bg-white rounded-2xl shadow-sm border border-border/40 mt-6 overflow-hidden">
          <button
            type="button"
            onClick={() => setPrefOpen(o => !o)}
            className="w-full flex items-center justify-between p-6 text-left hover:bg-secondary/20 transition-colors"
          >
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-foreground">{lang === 'fr' ? 'Préférences' : 'Preferences'}</h2>
              {savedBanner && !prefOpen && (
                <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {lang === 'fr' ? 'Enregistré' : 'Saved'}
                </span>
              )}
            </div>
            {prefOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </button>

          {prefOpen && (
            <div className="px-6 pb-6 border-t border-border/30">
              <form onSubmit={handleSave} className="space-y-5 pt-5">
                <div className="space-y-1.5">
                  <Label className="text-sm flex items-center gap-1.5">
                    {lang === 'fr' ? 'Nom de la boutique' : 'Shop name'}
                  </Label>
                  <Input
                    value={form.shop_name}
                    onChange={e => setForm({ ...form, shop_name: e.target.value })}
                    placeholder="Ex: Épicerie du Marché"
                  />
                </div>
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
          )}
        </div>
      </main>
    </div>
  );
}