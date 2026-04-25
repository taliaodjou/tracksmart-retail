import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/LanguageContext';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight, Star } from 'lucide-react';
import { motion } from 'framer-motion';

const plans = [
  {
    key: 'small',
    setup: 200,
    monthly: 100,
    nameKey: 'plan_small_name',
    descKey: 'plan_small_desc',
    detailKey: 'plan_small_detail',
    popular: false,
  },
  {
    key: 'medium',
    setup: 300,
    monthly: 100,
    nameKey: 'plan_medium_name',
    descKey: 'plan_medium_desc',
    detailKey: 'plan_medium_detail',
    popular: true,
  },
  {
    key: 'large',
    setup: 400,
    monthly: 100,
    nameKey: 'plan_large_name',
    descKey: 'plan_large_desc',
    detailKey: 'plan_large_detail',
    popular: false,
  },
];

export default function PricingSection() {
  const { t } = useLanguage();

  const features = [
    t('pricing_feature_1'),
    t('pricing_feature_2'),
    t('pricing_feature_3'),
    t('pricing_feature_4'),
    t('pricing_feature_5'),
    t('pricing_feature_6'),
  ];

  return (
    <section id="pricing" className="py-20 bg-secondary/30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">{t('pricing_title')}</h2>
          <p className="mt-3 text-muted-foreground text-lg">{t('pricing_subtitle')}</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className={`relative rounded-2xl p-8 flex flex-col ${
                plan.popular
                  ? 'bg-foreground text-primary-foreground shadow-xl ring-2 ring-primary'
                  : 'bg-white border border-border/40 shadow-sm'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-xs font-semibold px-4 py-1.5 rounded-full shadow">
                    <Star className="w-3 h-3 fill-current" />
                    {t('plan_popular')}
                  </span>
                </div>
              )}

              <div className="mb-6">
                <p className={`text-lg font-bold ${plan.popular ? 'text-primary-foreground' : 'text-foreground'}`}>
                  {t(plan.nameKey)}
                </p>
                <p className={`text-sm mt-1 ${plan.popular ? 'opacity-70' : 'text-muted-foreground'}`}>
                  {t(plan.descKey)}
                </p>
                <p className={`text-xs mt-0.5 ${plan.popular ? 'opacity-50' : 'text-muted-foreground/60'}`}>
                  {t(plan.detailKey)}
                </p>
              </div>

              <div className={`rounded-xl p-4 mb-6 ${plan.popular ? 'bg-white/10' : 'bg-secondary/60'}`}>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className={`text-sm ${plan.popular ? 'opacity-70' : 'text-muted-foreground'}`}>
                    {t('pricing_setup')} :
                  </span>
                  <span className={`text-xl font-bold ${plan.popular ? '' : 'text-foreground'}`}>
                    CHF {plan.setup}
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className={`text-sm ${plan.popular ? 'opacity-70' : 'text-muted-foreground'}`}>
                    {t('pricing_monthly')} :
                  </span>
                  <span className={`text-xl font-bold ${plan.popular ? '' : 'text-foreground'}`}>
                    CHF {plan.monthly}
                  </span>
                  <span className={`text-xs ${plan.popular ? 'opacity-60' : 'text-muted-foreground'}`}>
                    {t('pricing_per_month')}
                  </span>
                </div>
              </div>

              <div className="space-y-2.5 mb-8 flex-1">
                {features.map((f, fi) => (
                  <div key={fi} className="flex items-start gap-2 text-sm">
                    <Check className={`w-4 h-4 mt-0.5 shrink-0 ${plan.popular ? 'text-primary' : 'text-primary'}`} />
                    <span className={plan.popular ? 'opacity-80' : 'text-muted-foreground'}>{f}</span>
                  </div>
                ))}
              </div>

              <Link to={`/payment?plan=${plan.key}&setup=${plan.setup}&monthly=${plan.monthly}`}>
                <Button
                  className={`w-full rounded-full gap-2 ${
                    plan.popular
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : 'bg-foreground text-primary-foreground hover:bg-foreground/90'
                  }`}
                >
                  {t('pricing_choose')}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}