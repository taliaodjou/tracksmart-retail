import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { PackagePlus, LayoutDashboard, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HowItWorksSection() {
  const { t } = useLanguage();

  const steps = [
    { icon: PackagePlus, title: t('how_step_1_title'), text: t('how_step_1_text'), step: '01' },
    { icon: LayoutDashboard, title: t('how_step_2_title'), text: t('how_step_2_text'), step: '02' },
    { icon: Zap, title: t('how_step_3_title'), text: t('how_step_3_text'), step: '03' },
  ];

  return (
    <section className="py-20 bg-secondary/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">{t('how_title')}</h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="relative bg-white rounded-2xl p-8 shadow-sm border border-border/40"
            >
              <span className="absolute top-4 right-4 text-5xl font-extrabold text-primary/10">{step.step}</span>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                <step.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-3">{step.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{step.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}