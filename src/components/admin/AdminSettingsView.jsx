import React from 'react';
import { useAuth } from '@/lib/AuthContext';
import { Hourglass, Building2, Mail, Globe } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function AdminSettingsView() {
  const { user } = useAuth();

  return (
    <div className="p-6 lg:p-8 pt-16 lg:pt-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Paramètres Admin</h1>
        <p className="text-white/40 text-sm mt-1">Configuration du portail TrackSmart</p>
      </div>

      {/* Company info */}
      <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/5 space-y-5">
        <h3 className="text-white font-semibold text-sm">Informations société</h3>
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center flex-col">
            <Hourglass className="w-7 h-7 text-primary" />
          </div>
          <div>
            <div className="text-white font-bold text-lg">TrackSmart</div>
            <div className="text-white/40 text-sm">by TNO Studio</div>
            <div className="text-white/30 text-xs mt-0.5">Gestion des dates de péremption</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {[
            { iconName: 'building', label: 'Société', value: 'TNO Studio' },
            { iconName: 'mail', label: 'Contact', value: 'contact@tno-studio.com' },
            { iconName: 'globe', label: 'Application', value: 'TrackSmart v2.0' },
          ].map(({ iconName, label, value }) => {
            const IconMap = { building: Building2, mail: Mail, globe: Globe };
            const IconComp = IconMap[iconName];
            return (
            <div key={label} className="flex items-center gap-3 p-3 bg-white/3 rounded-xl border border-white/5">
              <IconComp className="w-4 h-4 text-primary flex-shrink-0" />
              <div>
                <div className="text-white/40 text-xs">{label}</div>
                <div className="text-white text-sm font-medium">{value}</div>
              </div>
            </div>
          );})}

        </div>
      </div>

      {/* Current admin */}
      <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/5 space-y-3">
        <h3 className="text-white font-semibold text-sm">Compte administrateur</h3>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center font-bold text-black text-lg">
            {user?.full_name?.[0] || user?.email?.[0]?.toUpperCase() || 'A'}
          </div>
          <div>
            <div className="text-white font-medium">{user?.full_name || 'Admin'}</div>
            <div className="text-white/40 text-sm">{user?.email}</div>
            <div className="mt-1">
              <span className="px-2 py-0.5 bg-primary/20 text-primary rounded-full text-xs font-medium">Administrateur</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing reference */}
      <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/5 space-y-4">
        <h3 className="text-white font-semibold text-sm">Plans tarifaires</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { plan: 'Basic', price: 'CHF 29/mois', features: ['Jusqu\'à 500 produits', 'Alertes email', 'Export CSV'] },
            { plan: 'Premium', price: 'CHF 49/mois', features: ['Produits illimités', 'Alertes avancées', 'Rapports hebdo', 'Scanner code-barres'] },
          ].map(({ plan, price, features }) => (
            <div key={plan} className="p-4 rounded-xl border border-primary/20 bg-primary/5">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-semibold">{plan}</span>
                <span className="text-primary font-bold">{price}</span>
              </div>
              <ul className="space-y-1">
                {features.map(f => <li key={f} className="text-white/40 text-xs flex items-center gap-1.5"><span className="w-1 h-1 rounded-full bg-primary/50 flex-shrink-0" />{f}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => base44.auth.logout('/')}
          className="px-5 py-2.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-sm font-medium hover:bg-red-500/20 transition-all"
        >
          Déconnexion
        </button>
      </div>
    </div>
  );
}