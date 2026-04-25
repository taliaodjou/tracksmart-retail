import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/LanguageContext';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const plans = [
  { key: 'small', setup: 200, monthly: 100, highlight: false },
  { key: 'medium', setup: 300, monthly: 100, highlight: true },
  { key: 'large', setup: 400, monthly: 100, highlight: false },
];

export default function PricingSection() {
  const { t } = useLanguage();

  const features = [
    t('pricing_feature_1'),
    t('pricing_feature_2'),
    t('pricing_feature_3'),
    t('pricing_feature_4'),
  ];

  return (
    <section id="pricing" className="py-20 bg-secondary/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">{t('pricing_title')}</h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className={`rounded-2xl p-8 shadow-sm border flex flex-col relative ${
                plan.highlight
                  ? 'bg-foreground text-primary-foreground border-transparent shadow-xl'
                  : 'bg-white border-border/40'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-4 py-1 rounded-full">
                  Populaire
                </div>
              )}

              <div className="mb-6">
                <p className={`text-sm font-semibold uppercase tracking-wide mb-1 ${plan.highlight ? 'opacity-70' : 'text-muted-foreground'}`}>
                  {t(`plan_${plan.key}_name`)}
                </p>
                <p className={`text-sm mb-4 leading-relaxed ${plan.highlight ? 'opacity-80' : 'text-muted-foreground'}`}>
                  {t(`plan_${plan.key}_desc`)}
                </p>
                <div className="space-y-1.5">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-sm ${plan.highlight ? 'opacity-70' : 'text-muted-foreground'}`}>{t('pricing_setup_fee')} :</span>
                    <span className="font-bold text-xl">CHF {plan.setup}</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-sm ${plan.highlight ? 'opacity-70' : 'text-muted-foreground'}`}>{t('pricing_monthly_fee')} :</span>
                    <span className="font-bold text-xl">CHF {plan.monthly}</span>
                    <span className={`text-xs ${plan.highlight ? 'opacity-70' : 'text-muted-foreground'}`}>{t('pricing_per_month')}</span>
                  </div>
                </div>
              </div>

              <div className="mb-8 space-y-2.5 flex-1">
                <p className={`text-xs font-medium uppercase tracking-wide ${plan.highlight ? 'opacity-60' : 'text-muted-foreground'}`}>
                  {t('pricing_includes')}
                </p>
                {features.map((f, fi) => (
                  <div key={fi} className="flex items-center gap-2 text-sm">
                    <Check className={`w-4 h-4 flex-shrink-0 ${plan.highlight ? 'text-primary' : 'text-green-500'}`} />
                    <span className={plan.highlight ? 'opacity-90' : ''}>{f}</span>
                  </div>
                ))}
              </div>

              <Link to={`/payment?plan=${plan.key}`}>
                <Button
                  className={`w-full rounded-full gap-2 ${
                    plan.highlight
                      ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                      : ''
                  }`}
                  variant={plan.highlight ? 'default' : 'outline'}
                >
                  {t('pricing_choose_plan')}
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