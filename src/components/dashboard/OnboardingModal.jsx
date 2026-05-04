import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Store, Mail, MessageSquare } from 'lucide-react';

export default function OnboardingModal({ user, onComplete }) {
  const [form, setForm] = useState({
    shop_name: '',
    shop_size: '',
    product_count_approx: '',
    report_channel: 'email',
    phone_number: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.report_channel === 'sms' && !form.phone_number) return;
    setSaving(true);
    await base44.auth.updateMe({
      shop_name: form.shop_name,
      shop_size: form.shop_size,
      product_count_approx: form.product_count_approx ? Number(form.product_count_approx) : undefined,
      report_channel: form.report_channel,
      phone_number: form.phone_number,
      onboarding_complete: true,
    });
    setSaving(false);
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Store className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">Bienvenue sur TrackSmart</h2>
            <p className="text-sm text-muted-foreground">Configurez votre espace en quelques secondes</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <Label>Nom de la boutique *</Label>
            <Input
              required
              value={form.shop_name}
              onChange={e => setForm({ ...form, shop_name: e.target.value })}
              placeholder="Ex: Épicerie du Marché"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Taille de la boutique *</Label>
            <Select value={form.shop_size} onValueChange={v => setForm({ ...form, shop_size: v })} required>
              <SelectTrigger><SelectValue placeholder="Sélectionner…" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="petite">Petite (0–200 produits)</SelectItem>
                <SelectItem value="moyenne">Moyenne (200–500 produits)</SelectItem>
                <SelectItem value="grande">Grande (500+ produits)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Nombre approximatif de produits</Label>
            <Input
              type="number"
              min="0"
              value={form.product_count_approx}
              onChange={e => setForm({ ...form, product_count_approx: e.target.value })}
              placeholder="Ex: 150"
            />
          </div>

          <div className="space-y-2">
            <Label>Recevoir le récapitulatif par *</Label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setForm({ ...form, report_channel: 'email' })}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                  form.report_channel === 'email'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/40'
                }`}
              >
                <Mail className="w-4 h-4" /> Email
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, report_channel: 'sms' })}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                  form.report_channel === 'sms'
                    ? 'border-primary bg-primary/5 text-primary'
                    : 'border-border text-muted-foreground hover:border-primary/40'
                }`}
              >
                <MessageSquare className="w-4 h-4" /> SMS
              </button>
            </div>
          </div>

          {form.report_channel === 'sms' && (
            <div className="space-y-1.5">
              <Label>Numéro de téléphone *</Label>
              <Input
                required
                type="tel"
                value={form.phone_number}
                onChange={e => setForm({ ...form, phone_number: e.target.value })}
                placeholder="+41 79 000 00 00"
              />
            </div>
          )}

          <div className="pt-2">
            <p className="text-xs text-muted-foreground mb-4">
              Votre email : <span className="font-medium text-foreground">{user?.email}</span>
              &nbsp;·&nbsp;Fréquence du rapport : Hebdomadaire
            </p>
            <Button type="submit" disabled={saving || !form.shop_name || !form.shop_size} className="w-full rounded-full">
              {saving ? 'Enregistrement…' : 'Commencer →'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}