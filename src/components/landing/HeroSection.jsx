import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '@/lib/LanguageContext';
import { Button } from '@/components/ui/button';
import { ArrowRight, ShieldCheck, BarChart3, Bell } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroSection() {
  const { t } = useLanguage();

  return (
    <section className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-8">
            <ShieldCheck className="w-4 h-4" />
            TrackSmart
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight max-w-4xl mx-auto">
            {t('hero_title')}
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {t('hero_subtitle')}
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/dashboard">
              <Button size="lg" className="rounded-full px-8 text-base gap-2 shadow-lg shadow-primary/20">
                {t('hero_cta')}
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <a href="#features">
              <Button size="lg" variant="outline" className="rounded-full px-8 text-base">
                {t('hero_cta_secondary')}
              </Button>
            </a>
          </div>
        </motion.div>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-4"
        >
          {[
            { icon: Bell, label: t('pricing_feature_2') },
            { icon: BarChart3, label: t('pricing_feature_1') },
            { icon: ShieldCheck, label: t('pricing_feature_4') },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 bg-white border border-border/60 rounded-full px-4 py-2 text-sm text-muted-foreground shadow-sm">
              <item.icon className="w-4 h-4 text-primary" />
              {item.label}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}