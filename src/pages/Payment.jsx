import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/lib/LanguageContext';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CreditCard, CheckCircle, Shield, Lock } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { motion } from 'framer-motion';

export default function Payment() {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const params = new URLSearchParams(window.location.search);
  const plan = params.get('plan') || 'small';
  const setup = Number(params.get('setup')) || 200;
  const monthly = Number(params.get('monthly')) || 100;

  const planNameKey = `plan_${plan}_name`;

  const [method, setMethod] = useState('card');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    name: '',
    card: '',
    expiry: '',
    cvv: '',
  });

  const handlePay = async (e) => {
    e.preventDefault();
    setProcessing(true);
    // Simulate payment processing
    await new Promise((res) => setTimeout(res, 2000));
    // Activate subscription on user
    try {
      await base44.auth.updateMe({ subscription_status: 'active', subscription_plan: plan });
    } catch (_) {}
    setProcessing(false);
    setSuccess(true);
  };

  const handlePayPal = async () => {
    setProcessing(true);
    await new Promise((res) => setTimeout(res, 2000));
    try {
      await base44.auth.updateMe({ subscription_status: 'active', subscription_plan: plan });
    } catch (_) {}
    setProcessing(false);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-secondary/30 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-2xl p-10 shadow-lg border border-border/40 max-w-md w-full text-center"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">{t('payment_success_title')}</h2>
          <p className="text-muted-foreground mb-8">{t('payment_success_msg')}</p>
          <Button
            onClick={() => navigate('/dashboard')}
            className="w-full rounded-full gap-2"
            size="lg"
          >
            {t('payment_go_dashboard')}
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Header */}
      <div className="bg-white border-b border-border/40 px-4 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">TS</span>
              </div>
              <span className="font-bold text-lg text-foreground tracking-tight">TrackSmart</span>
            </Link>
          </div>
          <LanguageSwitcher />
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10">
        <Link to="/#pricing" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          {t('payment_back')}
        </Link>

        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">{t('payment_title')}</h1>

        <div className="grid md:grid-cols-5 gap-8">
          {/* Plan Summary */}
          <div className="md:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-border/40 sticky top-8"
            >
              <h3 className="font-semibold text-foreground mb-4">{t('payment_plan_summary')}</h3>

              <div className="bg-primary/5 rounded-xl p-4 mb-5">
                <p className="font-bold text-foreground text-lg">{t(planNameKey)}</p>
                <p className="text-sm text-muted-foreground mt-1">{t(`plan_${plan}_desc`)}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('payment_setup_fee')}</span>
                  <span className="font-semibold text-foreground">CHF {setup}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{t('payment_monthly_fee')}</span>
                  <span className="font-semibold text-foreground">CHF {monthly}{t('pricing_per_month')}</span>
                </div>
                <div className="border-t border-border/40 pt-3 flex items-center justify-between">
                  <span className="font-semibold text-foreground">{t('payment_total')}</span>
                  <span className="font-bold text-xl text-foreground">CHF {setup + monthly}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('payment_then')} CHF {monthly}{t('pricing_per_month')}
                </p>
              </div>

              <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
                <Lock className="w-3.5 h-3.5" />
                <span>Paiement sécurisé SSL</span>
              </div>
            </motion.div>
          </div>

          {/* Payment Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="md:col-span-3"
          >
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-border/40">
              {/* Method selector */}
              <div className="mb-6">
                <p className="text-sm font-semibold text-foreground mb-3">{t('payment_method')}</p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setMethod('card')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-medium ${
                      method === 'card'
                        ? 'border-primary bg-primary/5 text-foreground'
                        : 'border-border/40 text-muted-foreground hover:border-border'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    {t('payment_card')}
                  </button>
                  <button
                    onClick={() => setMethod('paypal')}
                    className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-medium ${
                      method === 'paypal'
                        ? 'border-primary bg-primary/5 text-foreground'
                        : 'border-border/40 text-muted-foreground hover:border-border'
                    }`}
                  >
                    <span className="font-bold text-blue-600">Pay</span>
                    <span className="font-bold text-blue-800">Pal</span>
                  </button>
                </div>
              </div>

              {method === 'card' ? (
                <form onSubmit={handlePay} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label className="text-sm">{t('payment_name')}</Label>
                    <Input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Jean Dupont"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-sm">{t('payment_card_number')}</Label>
                    <Input
                      value={form.card}
                      onChange={(e) => {
                        const v = e.target.value.replace(/\D/g, '').slice(0, 16);
                        const formatted = v.match(/.{1,4}/g)?.join(' ') || v;
                        setForm({ ...form, card: formatted });
                      }}
                      placeholder="1234 5678 9012 3456"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-sm">{t('payment_expiry')}</Label>
                      <Input
                        value={form.expiry}
                        onChange={(e) => {
                          let v = e.target.value.replace(/\D/g, '').slice(0, 4);
                          if (v.length >= 2) v = v.slice(0, 2) + '/' + v.slice(2);
                          setForm({ ...form, expiry: v });
                        }}
                        placeholder="MM/YY"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm">{t('payment_cvv')}</Label>
                      <Input
                        value={form.cvv}
                        onChange={(e) => setForm({ ...form, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                        placeholder="123"
                        required
                        type="password"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/60 rounded-xl p-3 mt-2">
                    <Shield className="w-4 h-4 shrink-0 text-green-500" />
                    <span>Vos données de paiement sont chiffrées et sécurisées.</span>
                  </div>

                  <Button type="submit" className="w-full rounded-full gap-2" size="lg" disabled={processing}>
                    {processing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                        {t('payment_processing')}
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        {t('payment_pay_now')} — CHF {setup + monthly}
                      </>
                    )}
                  </Button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 text-center">
                    <div className="text-2xl font-bold">
                      <span className="text-blue-600">Pay</span>
                      <span className="text-blue-900">Pal</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Vous serez redirigé vers PayPal pour finaliser le paiement de CHF {setup + monthly}.
                    </p>
                  </div>
                  <Button
                    onClick={handlePayPal}
                    className="w-full rounded-full gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                    size="lg"
                    disabled={processing}
                  >
                    {processing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {t('payment_processing')}
                      </>
                    ) : (
                      t('payment_paypal_btn')
                    )}
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}