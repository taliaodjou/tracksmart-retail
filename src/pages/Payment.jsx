import React, { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CreditCard, Check, Loader2, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import LanguageSwitcher from '@/components/LanguageSwitcher';

const PLANS = {
  small: { setup: 200, monthly: 100 },
  medium: { setup: 300, monthly: 100 },
  large: { setup: 400, monthly: 100 },
};

export default function Payment() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();

  const urlParams = new URLSearchParams(window.location.search);
  const planKey = urlParams.get('plan') || 'small';
  const plan = PLANS[planKey] || PLANS.small;

  const [payMethod, setPayMethod] = useState('card');
  const [processing, setProcessing] = useState(false);
  const [form, setForm] = useState({
    cardholder: '',
    card_number: '',
    expiry: '',
    cvc: '',
  });

  const planName = t(`plan_${planKey}_name`);

  const handlePay = async (e) => {
    e.preventDefault();
    setProcessing(true);
    // Mock payment processing
    await new Promise(r => setTimeout(r, 2000));
    await base44.auth.updateMe({
      subscription_status: 'active',
      subscription_plan: planKey,
      subscription_date: new Date().toISOString().split('T')[0],
    });
    setProcessing(false);
    toast.success(t('pay_success'));
    navigate('/dashboard');
  };

  const handlePayPal = async () => {
    setProcessing(true);
    await new Promise(r => setTimeout(r, 2000));
    await base44.auth.updateMe({
      subscription_status: 'active',
      subscription_plan: planKey,
      subscription_date: new Date().toISOString().split('T')[0],
    });
    setProcessing(false);
    toast.success(t('pay_success'));
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Header */}
      <header className="bg-white border-b border-border/50 px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">TS</span>
          </div>
          <span className="font-bold text-lg text-foreground tracking-tight">TrackSmart</span>
        </Link>
        <LanguageSwitcher />
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link to="/#pricing" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {t('back')}
        </Link>

        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">{t('pay_title')}</h1>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-8 shadow-sm border border-border/40 h-fit"
          >
            <h2 className="font-semibold text-lg text-foreground mb-6">{t('pay_plan')}</h2>

            <div className="bg-secondary/50 rounded-xl p-5 mb-6">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary" />
                </div>
                <span className="font-semibold text-foreground">{planName}</span>
              </div>
              <p className="text-sm text-muted-foreground ml-11">{t(`plan_${planKey}_desc`)}</p>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('pay_setup')}</span>
                <span className="font-medium">CHF {plan.setup}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('pay_monthly')}</span>
                <span className="font-medium">CHF {plan.monthly}/mois</span>
              </div>
              <div className="border-t border-border pt-3 flex justify-between font-semibold">
                <span>{t('pay_total')}</span>
                <span className="text-primary">CHF {plan.setup + plan.monthly}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="w-4 h-4 text-green-500" />
              Paiement 100% sécurisé · Données chiffrées
            </div>
          </motion.div>

          {/* Payment form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-8 shadow-sm border border-border/40"
          >
            {/* Method selector */}
            <div className="flex gap-3 mb-8">
              <button
                onClick={() => setPayMethod('card')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                  payMethod === 'card'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/40'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                {t('pay_card')}
              </button>
              <button
                onClick={() => setPayMethod('paypal')}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                  payMethod === 'paypal'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/40'
                }`}
              >
                <span className="font-bold text-blue-600">Pay</span><span className="font-bold text-blue-800">Pal</span>
              </button>
            </div>

            {payMethod === 'card' ? (
              <form onSubmit={handlePay} className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-sm">{t('pay_cardholder')}</Label>
                  <Input
                    value={form.cardholder}
                    onChange={(e) => setForm({ ...form, cardholder: e.target.value })}
                    placeholder="Jean Dupont"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm">{t('pay_card_number')}</Label>
                  <Input
                    value={form.card_number}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 16);
                      const formatted = val.replace(/(.{4})/g, '$1 ').trim();
                      setForm({ ...form, card_number: formatted });
                    }}
                    placeholder="1234 5678 9012 3456"
                    required
                    maxLength={19}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm">{t('pay_expiry')}</Label>
                    <Input
                      value={form.expiry}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, '').slice(0, 4);
                        if (val.length >= 3) val = val.slice(0, 2) + '/' + val.slice(2);
                        setForm({ ...form, expiry: val });
                      }}
                      placeholder="MM/YY"
                      required
                      maxLength={5}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm">{t('pay_cvc')}</Label>
                    <Input
                      value={form.cvc}
                      onChange={(e) => setForm({ ...form, cvc: e.target.value.replace(/\D/g, '').slice(0, 3) })}
                      placeholder="123"
                      required
                      maxLength={3}
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={processing}
                  className="w-full rounded-full mt-2 gap-2"
                  size="lg"
                >
                  {processing ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />{t('pay_processing')}</>
                  ) : (
                    <>{t('pay_confirm')} — CHF {plan.setup + plan.monthly}</>
                  )}
                </Button>
              </form>
            ) : (
              <div className="text-center space-y-6">
                <div className="bg-blue-50 rounded-xl p-6">
                  <div className="text-3xl font-bold mb-1">
                    <span className="text-blue-600">Pay</span><span className="text-blue-900">Pal</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">{t('pay_paypal_info')}</p>
                </div>
                <Button
                  onClick={handlePayPal}
                  disabled={processing}
                  className="w-full rounded-full gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                  size="lg"
                >
                  {processing ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />{t('pay_processing')}</>
                  ) : (
                    t('pay_paypal_btn')
                  )}
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}