import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { Globe, Building2, User, ChevronRight, Sparkles } from 'lucide-react';

const COUNTRIES = [
  'Afghanistan','Afrique du Sud','Albanie','Algérie','Allemagne','Andorre','Angola','Antigua-et-Barbuda',
  'Arabie saoudite','Argentine','Arménie','Australie','Autriche','Azerbaïdjan','Bahamas','Bahreïn',
  'Bangladesh','Barbade','Bélarus','Belgique','Belize','Bénin','Bhoutan','Bolivie','Bosnie-Herzégovine',
  'Botswana','Brésil','Brunéi','Bulgarie','Burkina Faso','Burundi','Cabo Verde','Cambodge','Cameroun',
  'Canada','Chili','Chine','Chypre','Colombie','Comores','Congo','Corée du Nord','Corée du Sud',
  'Costa Rica','Côte d\'Ivoire','Croatie','Cuba','Danemark','Djibouti','Dominique','Égypte','Émirats arabes unis',
  'Équateur','Érythrée','Espagne','Estonie','Eswatini','Éthiopie','Fidji','Finlande','France',
  'Gabon','Gambie','Géorgie','Ghana','Grèce','Grenade','Guatemala','Guinée','Guinée-Bissau',
  'Guinée équatoriale','Guyana','Haïti','Honduras','Hongrie','Inde','Indonésie','Irak','Iran',
  'Irlande','Islande','Israël','Italie','Jamaïque','Japon','Jordanie','Kazakhstan','Kenya',
  'Kirghizistan','Kiribati','Koweït','Laos','Lesotho','Lettonie','Liban','Libéria','Libye',
  'Liechtenstein','Lituanie','Luxembourg','Madagascar','Malawi','Malaisie','Maldives','Mali','Malte',
  'Maroc','Marshall','Maurice','Mauritanie','Mexique','Micronésie','Moldavie','Monaco','Mongolie',
  'Monténégro','Mozambique','Myanmar','Namibie','Nauru','Népal','Nicaragua','Niger','Nigéria',
  'Norvège','Nouvelle-Zélande','Oman','Ouganda','Ouzbékistan','Pakistan','Palaos','Palestine',
  'Panama','Papouasie-Nouvelle-Guinée','Paraguay','Pays-Bas','Pérou','Philippines','Pologne',
  'Portugal','Qatar','République centrafricaine','République démocratique du Congo','République dominicaine',
  'République tchèque','Roumanie','Royaume-Uni','Russie','Rwanda','Saint-Kitts-et-Nevis',
  'Saint-Marin','Saint-Vincent-et-les-Grenadines','Sainte-Lucie','Salomon','Salvador','Samoa',
  'São Tomé-et-Príncipe','Sénégal','Serbie','Seychelles','Sierra Leone','Singapour','Slovaquie',
  'Slovénie','Somalie','Soudan','Soudan du Sud','Sri Lanka','Suède','Suisse','Suriname','Syrie',
  'Tadjikistan','Tanzanie','Tchad','Thaïlande','Timor oriental','Togo','Tonga','Trinité-et-Tobago',
  'Tunisie','Turkménistan','Turquie','Tuvalu','Ukraine','Uruguay','Vanuatu','Vatican',
  'Venezuela','Viêt Nam','Yémen','Zambie','Zimbabwe',
];

const BUSINESS_TYPES = {
  fr: [
    { value: 'supermarche', label: 'Supermarché' },
    { value: 'epicerie', label: 'Épicerie' },
    { value: 'boulangerie', label: 'Boulangerie' },
    { value: 'boucherie', label: 'Boucherie' },
    { value: 'pharmacie', label: 'Pharmacie' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'cafe_bar', label: 'Café / Bar' },
    { value: 'autre', label: 'Autre' },
  ],
  en: [
    { value: 'supermarche', label: 'Supermarket' },
    { value: 'epicerie', label: 'Convenience store' },
    { value: 'boulangerie', label: 'Bakery' },
    { value: 'boucherie', label: 'Butcher shop' },
    { value: 'pharmacie', label: 'Pharmacy' },
    { value: 'restaurant', label: 'Restaurant' },
    { value: 'cafe_bar', label: 'Café / Bar' },
    { value: 'autre', label: 'Other' },
  ],
};

const POSITIONS = {
  fr: [
    { value: 'owner', label: '👑 Propriétaire' },
    { value: 'employee', label: '👤 Employé(e)' },
  ],
  en: [
    { value: 'owner', label: '👑 Owner' },
    { value: 'employee', label: '👤 Employee' },
  ],
};

const i18n = {
  fr: {
    title: 'Bienvenue ! 👋',
    subtitle: 'Quelques infos pour personnaliser votre expérience.',
    step1_title: 'Choisissez votre langue',
    step2_title: 'Votre profil',
    full_name_label: 'Prénom et nom *',
    full_name_placeholder: 'Ex : Marie Dupont',
    position_label: 'Votre rôle *',
    business_type_label: 'Type de commerce *',
    country_label: 'Pays *',
    country_placeholder: 'Ex : Suisse',
    btn_next: 'Continuer',
    btn_finish: 'Commencer',
    btn_back: 'Retour',
    required: 'Veuillez remplir tous les champs.',
    step_of: 'Étape',
    of: 'sur',
  },
  en: {
    title: 'Welcome! 👋',
    subtitle: 'A few details to personalize your experience.',
    step1_title: 'Choose your language',
    step2_title: 'Your profile',
    full_name_label: 'Full name *',
    full_name_placeholder: 'e.g. Marie Dupont',
    position_label: 'Your role *',
    business_type_label: 'Business type *',
    country_label: 'Country *',
    country_placeholder: 'e.g. Switzerland',
    btn_next: 'Continue',
    btn_finish: 'Get started',
    btn_back: 'Back',
    required: 'Please fill in all required fields.',
    step_of: 'Step',
    of: 'of',
  },
};

export default function OnboardingProfileModal({ onComplete }) {
  const [step, setStep] = useState(1);
  const [lang, setLangState] = useState('fr');
  const [form, setForm] = useState({ full_name: '', user_position: '', business_type: '', country: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const tx = i18n[lang];

  const next = () => {
    setError('');
    if (step === 2) {
      handleSubmit();
      return;
    }
    setStep(s => s + 1);
  };

  const handleSubmit = async () => {
    if (!form.full_name.trim() || !form.user_position || !form.business_type || !form.country.trim()) {
      setError(tx.required);
      return;
    }
    setSaving(true);
    await base44.auth.updateMe({
      preferred_lang: lang,
      full_name: form.full_name.trim(),
      user_position: form.user_position,
      business_type: form.business_type,
      country: form.country,
      onboarding_complete: true,
    });
    setSaving(false);
    onComplete(lang);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, y: 60 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="bg-white w-full sm:max-w-md sm:rounded-3xl rounded-t-3xl shadow-2xl flex flex-col max-h-[92vh]"
      >
        {/* Header — compact */}
        <div className="bg-[#111111] px-6 py-5 sm:rounded-t-3xl rounded-t-3xl flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-white text-sm">TrackSmart Retail</span>
            </div>
            <span className="text-xs text-white/40">{tx.step_of} {step} {tx.of} 2</span>
          </div>
          <h2 className="text-lg font-bold text-white">{tx.title}</h2>
          <p className="text-xs text-white/50 mt-0.5">{tx.subtitle}</p>
          {/* Progress */}
          <div className="flex gap-1.5 mt-3">
            {[1, 2].map(s => (
              <div key={s} className={`h-1 flex-1 rounded-full transition-all ${s <= step ? 'bg-primary' : 'bg-white/20'}`} />
            ))}
          </div>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="flex items-center gap-2 mb-1">
                  <Globe className="w-4 h-4 text-primary" />
                  <p className="font-semibold text-foreground text-sm">{tx.step1_title}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  {[{ val: 'fr', label: 'Français', flag: '🇫🇷' }, { val: 'en', label: 'English', flag: '🇬🇧' }].map(l => (
                    <button
                      key={l.val}
                      onClick={() => setLangState(l.val)}
                      className={`flex flex-col items-center gap-2 p-5 rounded-2xl border-2 transition-all active:scale-95 ${lang === l.val ? 'border-primary bg-primary/5' : 'border-border'}`}
                    >
                      <span className="text-3xl">{l.flag}</span>
                      <span className={`font-semibold text-sm ${lang === l.val ? 'text-primary' : 'text-foreground'}`}>{l.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                {/* Name */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <User className="w-4 h-4 text-primary" />
                    <p className="font-semibold text-foreground text-sm">{tx.step2_title}</p>
                  </div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{tx.full_name_label}</label>
                  <Input
                    placeholder={tx.full_name_placeholder}
                    value={form.full_name}
                    onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                    className="rounded-xl h-11 text-base"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-2 block">{tx.position_label}</label>
                  <div className="grid grid-cols-2 gap-2">
                    {POSITIONS[lang].map(pos => (
                      <button
                        key={pos.value}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, user_position: pos.value }))}
                        className={`text-center px-3 py-3.5 rounded-xl border-2 text-sm font-medium transition-all active:scale-95 ${form.user_position === pos.value ? 'border-primary bg-primary/5 text-primary' : 'border-border text-foreground'}`}
                      >
                        {pos.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Business type */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-3.5 h-3.5 text-primary" />
                    <label className="text-xs font-medium text-muted-foreground">{tx.business_type_label}</label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {BUSINESS_TYPES[lang].map(bt => (
                      <button
                        key={bt.value}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, business_type: bt.value }))}
                        className={`text-left px-3 py-2.5 rounded-xl border-2 text-xs font-medium transition-all active:scale-95 ${form.business_type === bt.value ? 'border-primary bg-primary/5 text-primary' : 'border-border text-foreground'}`}
                      >
                        {bt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Country */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1.5 block">{tx.country_label}</label>
                  <Select value={form.country} onValueChange={v => setForm(f => ({ ...f, country: v }))}>
                    <SelectTrigger className="rounded-xl h-11 text-base w-full">
                      <SelectValue placeholder={tx.country_placeholder} />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {COUNTRIES.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {error && <p className="text-xs text-destructive">{error}</p>}
              </motion.div>
            )}
          </AnimatePresence>

          {step === 1 && error && <p className="text-xs text-destructive mt-3">{error}</p>}
        </div>

        {/* Footer — always visible, safe area */}
        <div className="px-6 pb-6 pt-3 flex items-center justify-between flex-shrink-0 border-t border-border/30" style={{ paddingBottom: 'max(24px, env(safe-area-inset-bottom))' }}>
          {step > 1 ? (
            <button
              onClick={() => { setError(''); setStep(s => s - 1); }}
              className="text-sm text-muted-foreground active:text-foreground transition-colors py-2 px-1"
            >
              ← {tx.btn_back}
            </button>
          ) : <div />}
          <Button onClick={next} disabled={saving} className="rounded-full px-7 gap-2 h-11">
            {saving ? '...' : step === 2 ? tx.btn_finish : tx.btn_next}
            {!saving && <ChevronRight className="w-4 h-4" />}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}