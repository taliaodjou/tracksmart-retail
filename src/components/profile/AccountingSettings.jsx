import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, BarChart2, ToggleLeft, ToggleRight, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const GOLD = '#C9A646';

const MONTHS_FR = [
  'Janvier','Février','Mars','Avril','Mai','Juin',
  'Juillet','Août','Septembre','Octobre','Novembre','Décembre'
];

export default function AccountingSettings({ user, onSaved }) {
  const [form, setForm] = useState({
    accounting_start_month: 0,
    report_delivery_mode: 'email',
    report_email: '',
    auto_reports: false,
    phone_number: '',
  });
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(false);
  const [savedBanner, setSavedBanner] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        accounting_start_month: user.accounting_start_month ?? 0,
        report_delivery_mode: user.report_delivery_mode || 'email',
        report_email: user.report_email || user.email || '',
        auto_reports: user.auto_reports ?? false,
        phone_number: user.phone_number || '',
      });
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await base44.auth.updateMe({
      accounting_start_month: Number(form.accounting_start_month),
      report_delivery_mode: form.report_delivery_mode,
      report_email: form.report_email,
      auto_reports: form.auto_reports,
      phone_number: form.phone_number,
    });
    setSaving(false);
    setOpen(false);
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 3000);
    if (onSaved) onSaved();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-border/40 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-6 text-left hover:bg-secondary/20 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: GOLD }}>
            <BarChart2 className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-bold text-foreground">Paramètres comptables</span>
          {savedBanner && !open && (
            <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Enregistré
            </span>
          )}
        </div>
        {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {open && (
      <div className="px-6 pb-6 border-t border-border/30">
        <p className="text-xs text-muted-foreground mt-4 mb-5 leading-relaxed">
          Les paramètres comptables vous permettent de définir le début de votre trimestre fiscal et la manière dont TrackSmart Retail vous envoie vos rapports trimestriels. Ces rapports récapitulent les pertes, les produits jetés et les tendances sur la période pour vous aider à mieux gérer votre stock et votre comptabilité.
        </p>
        <form onSubmit={handleSave} className="space-y-5">
        {/* Quarter start */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Début du trimestre comptable</Label>
          <Select
            value={String(form.accounting_start_month)}
            onValueChange={v => setForm({ ...form, accounting_start_month: Number(v) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Choisir un mois" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS_FR.map((m, i) => (
                <SelectItem key={i} value={String(i)}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Votre trimestre actuel commence en <strong>{MONTHS_FR[form.accounting_start_month]}</strong>.
          </p>
        </div>

        {/* Delivery mode */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Réception des rapports</Label>
          <p className="text-xs text-muted-foreground">Les rapports trimestriels vous sont envoyés par email automatiquement.</p>
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <Label className="text-sm font-medium flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-muted-foreground" />
            Email de réception des rapports
          </Label>
          <Input
            type="email"
            value={form.report_email}
            onChange={e => setForm({ ...form, report_email: e.target.value })}
            placeholder="votre@email.com"
          />
        </div>

        {/* Auto reports toggle */}
        <div className="flex items-center justify-between py-3 px-4 rounded-xl bg-secondary/40 border border-border/40">
          <div>
            <p className="text-sm font-medium text-foreground">Génération automatique des rapports</p>
            <p className="text-xs text-muted-foreground mt-0.5">Rapport généré automatiquement à la fin de chaque trimestre</p>
          </div>
          <button
            type="button"
            onClick={() => setForm({ ...form, auto_reports: !form.auto_reports })}
            className="flex-shrink-0"
          >
            {form.auto_reports
              ? <ToggleRight className="w-8 h-8" style={{ color: GOLD }} />
              : <ToggleLeft className="w-8 h-8 text-muted-foreground" />
            }
          </button>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving} className="rounded-full px-8" style={{ background: GOLD, color: '#fff', border: 'none' }}>
            {saving ? 'Enregistrement…' : 'Enregistrer'}
          </Button>
        </div>
        </form>
      </div>
      )}
    </div>
  );
}