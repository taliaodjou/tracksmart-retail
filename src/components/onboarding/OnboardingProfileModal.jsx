import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { Globe, Building2, MapPin, User, ChevronRight, Sparkles } from 'lucide-react';

const BUSINESS_TYPES = {
  fr: [
    { value: 'supermarche', label: 'Supermarché / Grande surface' },
    { value: 'epicerie', label: 'Épicerie / Alimentation générale' },
    { value: 'boulangerie', label: 'Boulangerie / Pâtisserie' },
    { value: 'boucherie', label: 'Boucherie / Charcuterie' },
    { value: 'pharmacie', label: 'Pharmacie / Parapharmacie' },
    { value: 'restaurant', label: 'Restaurant / Traiteur' },
    { value: 'cafe_bar', label: 'Café / Bar' },
    { value: 'autre', label: 'Autre' },
  ],
  en: [
    { value: 'supermarche', label: 'Supermarket / Grocery store' },
    { value: 'epicerie', label: 'Convenience store' },
    { value: 'boulangerie', label: 'Bakery / Pastry shop' },
    { value: 'boucherie', label: 'Butcher shop' },
    { value: 'pharmacie', label: 'Pharmacy / Drugstore' },
    { value: 'restaurant', label: 'Restaurant / Catering' },
    { value: 'cafe_bar', label: 'Café / Bar' },
    { value: 'autre', label: 'Other' },
  ],
};

const POSITIONS = {
  fr: [
    { value: 'owner', label: 'Propriétaire / Gérant' },
    { value: 'manager', label: 'Responsable / Manager' },
    { value: 'employee', label: 'Employé(e)' },
  ],
  en: [
    { value: 'owner', label: 'Owner / Director' },
    { value: 'manager', label: 'Manager / Supervisor' },
    { value: 'employee', label: 'Employee' },
  ],
};

const i18n = {
  fr: {
    title: 'Bienvenue sur TrackSmart ! 👋',
    subtitle: 'Dites-nous en plus sur vous pour personnaliser votre expérience.',
    step1_title: 'Votre langue',
    step1_sub: 'Choisissez la langue dans laquelle vous souhaitez utiliser TrackSmart.',
    lang_fr: 'Français',
    lang_en: 'English',
    step2_title: 'Votre profil',
    full_name_label: 'Votre prénom et nom *',
    full_name_placeholder: 'Ex : Marie Dupont',
    position_label: 'Votre poste *',
    step3_title: 'Votre commerce',
    business_type_label: 'Type de commerce *',
    city_label: 'Ville *',
    city_placeholder: 'Ex : Genève',
    country_label: 'Pays *',
    country_placeholder: 'Ex : Suisse',
    btn_next: 'Continuer',
    btn_finish: 'Commencer TrackSmart',
    btn_back: 'Retour',
    required: 'Veuillez remplir tous les champs obligatoires.',
    step_of: 'Étape',
    of: 'sur',
  },
  en: {
    title: 'Welcome to TrackSmart! 👋',
    subtitle: 'Tell us a bit about yourself to personalize your experience.',
    step1_title: 'Your language',
    step1_sub: 'Choose the language you want to use TrackSmart in.',
    lang_fr: 'Français',
    lang_en: 'English',
    step2_title: 'Your profile',
    full_name_label: 'Your full name *',
    full_name_placeholder: 'e.g. Marie Dupont',
    position_label: 'Your position *',
    step3_title: 'Your business',
    business_type_label: 'Business type *',
    city_label: 'City *',
    city_placeholder: 'e.g. Geneva',
    country_label: 'Country *',
    country_placeholder: 'e.g. Switzerland',
    btn_next: 'Continue',
    btn_finish: 'Start TrackSmart',
    btn_back: 'Back',
    required: 'Please fill in all required fields.',
    step_of: 'Step',
    of: 'of',
  },
};

export default function OnboardingProfileModal({ onComplete }) {
  const [step, setStep] = useState(1); // 1=lang, 2=profile, 3=business
  const [lang, setLangState] = useState('fr');
  const [form, setForm] = useState({
    full_name: '',
    user_position: '',
    business_type: '',
    city: '',
    country: '',
  });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const tx = i18n[lang];

  const handleLangSelect = (l) => {
    setLangState(l);
  };

  const next = () => {
    setError('');
    if (step === 2) {
      if (!form.full_name.trim() || !form.user_position) {
        setError(tx.required);
        return;
      }
    }
    if (step === 3) {
      handleSubmit();
      return;
    }
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    if (!form.business_type || !form.city.trim() || !form.country.trim()) {
      setError(tx.required);
      return;
    }
    setSaving(true);
    await base44.auth.updateMe({
      preferred_lang: lang,
      user_position: form.user_position,
      business_type: form.business_type,
      city: form.city.trim(),
      country: form.country.trim(),
      onboarding_complete: true,
    });
    setSaving(false);
    onComplete(lang);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
      >
        {/* Header */}
        <div className="bg-[#111111] px-8 py-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-white text-base">TrackSmart Retail</span>
          </div>
          <h2 className="text-xl font-bold text-white">{tx.title}</h2>
          <p className="text-sm text-white/60 mt-1">{tx.subtitle}</p>
          {/* Progress */}
          <div className="flex gap-1.5 mt-4">
            {[1, 2, 3].map(s => (
              <div key={s} className={`h-1 flex-1 rounded-full transition-all ${s <= step ? 'bg-primary' : 'bg-white/20'}`} />
            ))}
          </div>
          <p className="text-xs text-white/40 mt-2">{tx.step_of} {step} {tx.of} 3</p>
        </div>

        {/* Body */}
        <div className="px-8 py-6 min-h-[280px]">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="flex items-center gap-2 mb-1">
                  <Globe className="w-4 h-4 text-primary" />
                  <p className="font-semibold text-foreground">{tx.step1_title}</p>
                </div>
                <p className="text-sm text-muted-foreground mb-6">{tx.step1_sub}</p>
                <div className="grid grid-cols-2 gap-3">
                  {[{ val: 'fr', label: tx.lang_fr, flag: '🇫🇷' }, { val: 'en', label: tx.lang_en, flag: '🇬🇧' }].map(l => (
                    <button
                      key={l.val}
                      onClick={() => handleLangSelect(l.val)}
                      className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all ${lang === l.val ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}
                    >
                      <span className="text-3xl">{l.flag}</span>
                      <span className={`font-semibold text-sm ${lang === l.val ? 'text-primary' : 'text-foreground'}`}>{l.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-4 h-4 text-primary" />
                  <p className="font-semibold text-foreground">{tx.step2_title}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{tx.full_name_label}</label>
                  <Input
                    placeholder={tx.full_name_placeholder}
                    value={form.full_name}
                    onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{tx.position_label}</label>
                  <div className="grid grid-cols-1 gap-2">
                    {POSITIONS[lang].map(pos => (
                      <button
                        key={pos.value}
                        onClick={() => setForm(f => ({ ...f, user_position: pos.value }))}
                        className={`text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ${form.user_position === pos.value ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/40 text-foreground'}`}
                      >
                        {pos.label}
                      </button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="w-4 h-4 text-primary" />
                  <p className="font-semibold text-foreground">{tx.step3_title}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{tx.business_type_label}</label>
                  <div className="grid grid-cols-2 gap-2 max-h-[160px] overflow-y-auto pr-1">
                    {BUSINESS_TYPES[lang].map(bt => (
                      <button
                        key={bt.value}
                        onClick={() => setForm(f => ({ ...f, business_type: bt.value }))}
                        className={`text-left px-3 py-2.5 rounded-xl border-2 text-xs font-medium transition-all ${form.business_type === bt.value ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-primary/40 text-foreground'}`}
                      >
                        {bt.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{tx.city_label}</label>
                    <Input placeholder={tx.city_placeholder} value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className="rounded-xl" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{tx.country_label}</label>
                    <Input placeholder={tx.country_placeholder} value={form.country} onChange={e => setForm(f => ({ ...f, country: e.target.value }))} className="rounded-xl" />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && <p className="text-xs text-destructive mt-3">{error}</p>}
        </div>

        {/* Footer */}
        <div className="px-8 pb-6 flex items-center justify-between">
          {step > 1 ? (
            <button onClick={() => setStep(s => s - 1)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              ← {tx.btn_back}
            </button>
          ) : <div />}
          <Button onClick={next} disabled={saving} className="rounded-full px-6 gap-2">
            {saving ? '...' : step === 3 ? tx.btn_finish : tx.btn_next}
            {!saving && <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}