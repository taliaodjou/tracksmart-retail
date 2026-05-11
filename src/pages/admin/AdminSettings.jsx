import React, { useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import AdminLayout from './AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Settings, Shield, Building2 } from 'lucide-react';

export default function AdminSettings() {
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
  });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await base44.auth.updateMe({ full_name: form.full_name });
    toast.success('Profil mis à jour');
    setSaving(false);
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Paramètres</h1>
          <p className="text-sm text-gray-500 mt-0.5">Configuration du portail admin</p>
        </div>

        {/* Company Branding */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-primary" />
            TNO Studio
          </h3>
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center shadow-lg flex-shrink-0">
              <span className="text-white font-bold text-lg">⌛</span>
            </div>
            <div>
              <div className="font-bold text-gray-900 text-lg">TrackSmart</div>
              <div className="text-sm text-gray-500">by TNO Studio</div>
              <div className="text-xs text-gray-400 mt-0.5">Solution SaaS de gestion des dates de péremption</div>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-xs text-gray-500 font-medium mb-1">App</div>
              <div className="font-semibold text-gray-800">TrackSmart</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-xs text-gray-500 font-medium mb-1">Éditeur</div>
              <div className="font-semibold text-gray-800">TNO Studio</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-xs text-gray-500 font-medium mb-1">Plan Basic</div>
              <div className="font-semibold text-gray-800">CHF 29 / mois</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-xs text-gray-500 font-medium mb-1">Plan Premium</div>
              <div className="font-semibold text-gray-800">CHF 59 / mois</div>
            </div>
          </div>
        </div>

        {/* Admin Profile */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Profil administrateur
          </h3>
          <form onSubmit={handleSave} className="space-y-4 max-w-sm">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Nom complet</label>
              <Input
                value={form.full_name}
                onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                placeholder="Votre nom"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Email</label>
              <Input value={form.email} disabled className="bg-gray-50 text-gray-400" />
            </div>
            <Button type="submit" className="rounded-xl gap-2" disabled={saving}>
              <Settings className="w-4 h-4" />
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </form>
        </div>

        {/* Access Rules */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Règles d'accès</h3>
          <div className="space-y-3 text-sm">
            {[
              { rule: 'Clients actifs', access: '✅ Accès complet au dashboard' },
              { rule: 'Clients inactifs', access: '🚫 Accès bloqué (subscription gate)' },
              { rule: 'Administrateurs', access: '👑 Accès total, jamais bloqués' },
              { rule: 'Données clients', access: '🔒 Isolation par email (RLS)' },
            ].map(({ rule, access }) => (
              <div key={rule} className="flex items-center justify-between py-2.5 px-3 bg-gray-50 rounded-xl">
                <span className="font-medium text-gray-700">{rule}</span>
                <span className="text-gray-600 text-xs">{access}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}