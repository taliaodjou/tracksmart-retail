import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { AlertTriangle, TrendingDown, Ban } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ProblemSection() {
  const { t } = useLanguage();

  const items = [
    { icon: TrendingDown, text: t('problem_text_1') },
    { icon: AlertTriangle, text: t('problem_text_2') },
    { icon: Ban, text: t('problem_text_3') },
  ];

  return (
    <section id="features" className="py-20 bg-secondary/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground">{t('problem_title')}</h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {items.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="bg-white rounded-2xl p-8 shadow-sm border border-border/40 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mb-5">
                <item.icon className="w-6 h-6 text-destructive" />
              </div>
              <p className="text-muted-foreground leading-relaxed">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}