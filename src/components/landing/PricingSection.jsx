import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/LanguageContext';
import { Button } from '@/components/ui/button';
import { Check, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PricingSection() {
  const { t } = useLanguage();

  const features = [
    t('pricing_feature_1'),
    t('pricing_feature_2'),
    t('pricing_feature_3'),
    t('pricing_feature_4'),
  ];

  return (
    <section id="pricing" className="py-20">
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

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {/* Setup */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl p-8 shadow-sm border border-border/40"
          >
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide mb-2">{t('pricing_setup')}</p>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-4xl font-extrabold text-foreground">CHF 250</span>
            </div>
            <p className="text-muted-foreground mb-6">{t('pricing_setup_desc')}</p>
            <Link to="/dashboard">
              <Button variant="outline" className="w-full rounded-full gap-2">
                {t('hero_cta')} <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>

          {/* Monthly */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="relative bg-foreground text-primary-foreground rounded-2xl p-8 shadow-lg"
          >
            <p className="text-sm font-medium uppercase tracking-wide mb-2 opacity-70">{t('pricing_monthly')}</p>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-4xl font-extrabold">CHF 100</span>
              <span className="text-sm opacity-70">{t('pricing_per_month')}</span>
            </div>
            <p className="opacity-80 mb-6">{t('pricing_monthly_desc')}</p>

            <div className="mb-6 space-y-3">
              <p className="text-sm font-medium opacity-70">{t('pricing_includes')}</p>
              {features.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <Check className="w-4 h-4 text-primary" />
                  {f}
                </div>
              ))}
            </div>

            <Link to="/dashboard">
              <Button className="w-full rounded-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90">
                {t('hero_cta')} <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}