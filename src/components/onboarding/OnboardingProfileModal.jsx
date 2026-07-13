import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';

const STORY_BG = 'https://media.base44.com/images/public/69ecf4cdab87a3e47f86d732/e22ffdbb6_generated_image.png';

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
    saved: 'Vos informations ont bien été enregistrées. Bienvenue sur votre espace TrackSmart.',
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
    saved: 'Your information has been saved. Welcome to your TrackSmart account.',
    step_of: 'Step',
    of: 'of',
  },
};

const ProgressBars = ({ step }) => (
  <div className="flex gap-2 px-1">
    {[1, 2].map(s => (
      <div key={s} className="h-1.5 flex-1 rounded-full bg-[#D8D8D8] overflow-hidden">
        <div className={`h-full rounded-full bg-[#D5AD3C] transition-all duration-500 ${s <= step ? 'w-full' : 'w-0'}`} />
      </div>
    ))}
  </div>
);

export default function OnboardingProfileModal({ onComplete }) {
  const [step, setStep] = useState(1);
  const [lang, setLangState] = useState('fr');
  const [form, setForm] = useState({ full_name: '', user_position: '', business_type: '', country: '' });
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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
    try {
      await base44.auth.updateMe({
        preferred_lang: lang,
        contact_name: form.full_name.trim(),
        user_position: form.user_position,
        business_type: form.business_type,
        country: form.country,
        onboarding_complete: true,
      });
      setSaved(true);
      setTimeout(() => onComplete(lang), 1600);
    } catch (err) {
      setError(err.message || tx.required);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-white/90 px-5 py-6 backdrop-blur-sm">
      <AnimatePresence mode="wait">
        {saved ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, x: 80, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -80, scale: 0.98 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="relative flex h-[78vh] max-h-[620px] min-h-[520px] w-full max-w-[350px] items-center justify-center overflow-hidden rounded-[28px] px-9 text-center shadow-2xl shadow-black/20"
            style={{ backgroundImage: `url(${STORY_BG})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
          >
            <p className="max-w-[260px] -translate-y-3 text-[22px] font-semibold leading-snug text-[#0E0B05]">{tx.saved}</p>
          </motion.div>
        ) : step === 1 ? (
          <motion.div
            key="language"
            initial={{ opacity: 0, x: 80, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -80, scale: 0.98 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="relative flex h-[78vh] max-h-[620px] min-h-[520px] w-full max-w-[350px] flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl shadow-black/20"
          >
            <div
              className="px-7 pb-9 pt-7"
              style={{ backgroundImage: `url(${STORY_BG})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            >
              <ProgressBars step={step} />
              <div className="mt-12">
                <h2 className="text-[29px] font-extrabold leading-tight text-[#8A6508]">{tx.title}</h2>
                <p className="mt-2 max-w-[240px] text-[16px] leading-snug text-[#15110A]">{tx.subtitle}</p>
              </div>
            </div>

            <div className="-mt-7 flex flex-1 flex-col rounded-t-[28px] bg-white px-7 pb-7 pt-8">
              <p className="text-[13px] font-medium text-[#121212]">{tx.step_of} 1 {tx.of} 2</p>
              <h3 className="mt-1 text-[22px] font-bold leading-tight text-[#0B0B0B]">{tx.step1_title}</h3>

              <div className="mt-6 grid grid-cols-2 gap-4">
                {[{ val: 'fr', label: 'Français' }, { val: 'en', label: 'English' }].map(l => (
                  <button
                    key={l.val}
                    type="button"
                    onClick={() => setLangState(l.val)}
                    className={`flex h-[112px] flex-col items-center justify-center rounded-[14px] border text-[16px] font-semibold transition-all active:scale-95 ${lang === l.val ? 'border-[#C99D28] bg-[#FBF3DA] text-[#0D0D0D] shadow-lg shadow-[#C99D28]/25' : 'border-[#DADADA] bg-white text-[#0D0D0D]'}`}
                  >
                    <span className={`mb-4 h-7 w-7 rounded-full border-[3px] ${lang === l.val ? 'border-[#C99D28] bg-[#F1D98A] shadow-inner' : 'border-[#C99D28] bg-white'}`} />
                    {l.label}
                  </button>
                ))}
              </div>

              {error && <p className="mt-3 text-[12px] font-medium text-[#7A4D00]">{error}</p>}

              <Button
                onClick={next}
                className="mt-auto h-14 w-full rounded-full bg-[#D5AD3C] text-[17px] font-semibold text-white shadow-xl shadow-[#D5AD3C]/35 hover:bg-[#C89E2E]"
              >
                {tx.btn_next}
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="profile"
            initial={{ opacity: 0, x: 80, scale: 0.98 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -80, scale: 0.98 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="relative flex h-[78vh] max-h-[620px] min-h-[520px] w-full max-w-[350px] flex-col overflow-hidden rounded-[28px] bg-white px-7 py-7 shadow-2xl shadow-black/20"
          >
            <ProgressBars step={step} />
            <div className="mt-10 flex-1 overflow-y-auto pr-1">
              <p className="text-[13px] font-medium text-[#121212]">{tx.step_of} 2 {tx.of} 2</p>
              <h3 className="mt-1 text-[22px] font-bold leading-tight text-[#0B0B0B]">{tx.step2_title}</h3>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="mb-1.5 block text-[15px] font-medium text-[#0C0C0C]">{tx.full_name_label.replace(' *', '')} <span className="text-[#A35A00]">*</span></label>
                  <Input
                    placeholder={tx.full_name_placeholder}
                    value={form.full_name}
                    onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                    className="h-10 rounded-lg border-[#C99D28] px-3 text-[14px] shadow-none focus-visible:ring-[#C99D28]"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[15px] font-medium text-[#0C0C0C]">{tx.position_label.replace(' *', '')} <span className="text-[#A35A00]">*</span></label>
                  <div className="grid grid-cols-2 gap-2 rounded-lg border border-[#C99D28] p-1.5">
                    {POSITIONS[lang].map(pos => (
                      <button
                        key={pos.value}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, user_position: pos.value }))}
                        className={`rounded-md px-2 py-1.5 text-[12px] font-medium transition-all ${form.user_position === pos.value ? 'bg-[#D5AD3C] text-white' : 'bg-white text-[#191919]'}`}
                      >
                        {pos.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[15px] font-medium text-[#0C0C0C]">{tx.business_type_label.replace(' *', '')} <span className="text-[#A35A00]">*</span></label>
                  <div className="flex flex-wrap gap-1.5 rounded-lg border border-[#C99D28] p-2">
                    {BUSINESS_TYPES[lang].map(bt => (
                      <button
                        key={bt.value}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, business_type: bt.value }))}
                        className={`rounded-full px-2.5 py-1 text-[11px] font-medium transition-all ${form.business_type === bt.value ? 'bg-[#D5AD3C] text-white' : 'bg-[#F8F1DC] text-[#1A1A1A]'}`}
                      >
                        {bt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[15px] font-medium text-[#0C0C0C]">{tx.country_label.replace(' *', '')} <span className="text-[#A35A00]">*</span></label>
                  <Select value={form.country} onValueChange={v => setForm(f => ({ ...f, country: v }))}>
                    <SelectTrigger className="h-10 rounded-lg border-[#C99D28] px-3 text-[14px] shadow-none focus:ring-[#C99D28]">
                      <SelectValue placeholder={tx.country_placeholder} />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {COUNTRIES.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {error && <p className="text-[13px] font-medium text-[#7A4D00]">{error}</p>}
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <button
                type="button"
                onClick={() => { setError(''); setStep(s => s - 1); }}
                className="px-3 py-2 text-[15px] font-medium text-[#6D4A00] transition-colors active:scale-95"
              >
                {tx.btn_back}
              </button>
              <Button
                onClick={next}
                disabled={saving}
                className="h-12 rounded-full bg-[#D5AD3C] px-7 text-[15px] font-semibold text-white shadow-lg shadow-[#D5AD3C]/25 hover:bg-[#C89E2E] disabled:opacity-60"
              >
                {saving ? '...' : tx.btn_finish}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}