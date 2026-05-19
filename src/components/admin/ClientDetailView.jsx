import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getProductStatus, getDaysRemaining, statusConfig, categoryKeys } from '@/lib/productUtils';
import { toast } from 'sonner';
import { ArrowLeft, UserCheck, UserX, Mail, Send, Package, AlertTriangle, TrendingDown, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export default function ClientDetailView({ client, products, onBack, onToggle }) {
  const [emailMsg, setEmailMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [tab, setTab] = useState('overview');
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.User.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin_users'] }),
  });

  const isActive = client.subscription_status === 'active';
  const expired = products.filter(p => getProductStatus(p.expiration_date) === 'expired');
  const urgent = products.filter(p => getProductStatus(p.expiration_date) === 'urgent');
  const ok = products.filter(p => getProductStatus(p.expiration_date) === 'ok');
  const totalLoss = expired.reduce((sum, p) => sum + (p.quantity_thrown || 0) * (p.price_chf || 0), 0);

  const handleSendEmail = async () => {
    if (!emailMsg.trim()) return;
    setSending(true);
    await base44.integrations.Core.SendEmail({ to: client.email, subject: 'TrackSmart — Message de votre gestionnaire', body: emailMsg });
    toast.success('Email envoyé');
    setEmailMsg('');
    setSending(false);
  };

  const handlePaymentReminder = async () => {
    await base44.integrations.Core.SendEmail({
      to: client.email,
      subject: 'TrackSmart — Rappel de paiement',
      body: `Bonjour,\n\nNous vous rappelons que votre abonnement TrackSmart nécessite un renouvellement.\n\nMerci de contacter TNO Studio pour régulariser votre situation.\n\nCordialement,\nL'équipe TNO Studio`,
    });
    toast.success('Rappel de paiement envoyé');
  };

  return (
    <div className="p-6 lg:p-8 pt-16 lg:pt-8 space-y-6">
      {/* Back */}
      <button onClick={onBack} className="flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors">
        <ArrowLeft className="w-4 h-4" /> Retour aux clients
      </button>

      {/* Client header */}
      <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl ${isActive ? 'bg-primary/20 text-primary' : 'bg-white/5 text-white/30'}`}>
              {(client.shop_name || client.full_name || client.email || '?')[0].toUpperCase()}
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">{client.shop_name || client.full_name || 'Client'}</h2>
              <div className="text-white/40 text-sm">{client.email}</div>
              {client.phone && <div className="text-white/40 text-sm">{client.phone}</div>}
              <div className="mt-1">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${isActive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                  {isActive ? '● Actif' : '● Inactif'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => onToggle(client)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${isActive ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'}`}
            >
              {isActive ? <><UserX className="w-3 h-3" /> Désactiver</> : <><UserCheck className="w-3 h-3" /> Activer</>}
            </button>
            <button
              onClick={handlePaymentReminder}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 transition-all"
            >
              <Mail className="w-3 h-3" /> Rappel paiement
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total produits', value: products.length, color: 'text-blue-400' },
          { label: 'Expirés', value: expired.length, color: 'text-red-400' },
          { label: 'Urgents', value: urgent.length, color: 'text-amber-400' },
          { label: 'Pertes CHF', value: `${totalLoss.toFixed(0)}`, color: 'text-primary' },
        ].map((s, i) => (
          <div key={i} className="bg-[#1a1a1a] rounded-xl p-4 border border-white/5 text-center">
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-white/30 text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-[#1a1a1a] p-1 rounded-xl border border-white/5 w-fit">
        {[['overview', 'Aperçu'], ['products', 'Produits'], ['contact', 'Contacter']].map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === key ? 'bg-primary text-black' : 'text-white/50 hover:text-white'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'overview' && (
        <div className="space-y-4">
          <div className="bg-[#1a1a1a] rounded-2xl p-5 border border-white/5 space-y-3">
            <h3 className="text-white font-semibold text-sm">Informations boutique</h3>
            {[
              ['Boutique', client.shop_name],
              ['Propriétaire', client.full_name],
              ['Email', client.email],
              ['Téléphone', client.phone],
              ['Abonnement', client.subscription_plan || 'Basic'],
              ['Début abonnement', client.subscription_start_date],
              ['Dernière activité', client.updated_date ? format(new Date(client.updated_date), 'dd/MM/yyyy') : '—'],
              ['Inscrit le', client.created_date ? format(new Date(client.created_date), 'dd/MM/yyyy') : '—'],
            ].map(([label, val]) => val ? (
              <div key={label} className="flex justify-between text-sm border-b border-white/5 pb-2">
                <span className="text-white/40">{label}</span>
                <span className="text-white">{val}</span>
              </div>
            ) : null)}
          </div>
        </div>
      )}

      {tab === 'products' && (
        <div className="space-y-2">
          {products.length === 0 ? (
            <div className="text-center py-12 text-white/30 bg-[#1a1a1a] rounded-2xl border border-white/5">
              Aucun produit pour ce client
            </div>
          ) : products.slice(0, 30).map(p => {
            const status = getProductStatus(p.expiration_date);
            const cfg = statusConfig[status];
            return (
              <div key={p.id} className={`bg-[#1a1a1a] rounded-xl border px-4 py-3 flex items-center justify-between ${status === 'expired' ? 'border-red-500/20' : 'border-white/5'}`}>
                <div>
                  <div className="text-white text-sm font-medium">{p.name}</div>
                  <div className="text-white/30 text-xs">{p.expiration_date ? format(new Date(p.expiration_date), 'dd/MM/yyyy') : '—'}</div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs border ${cfg?.color || ''}`}>
                  {status}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {tab === 'contact' && (
        <div className="bg-[#1a1a1a] rounded-2xl p-5 border border-white/5 space-y-3">
          <h3 className="text-white font-semibold text-sm">Envoyer un message à {client.shop_name || client.email}</h3>
          <textarea
            value={emailMsg}
            onChange={e => setEmailMsg(e.target.value)}
            placeholder="Votre message..."
            rows={5}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-primary/40 resize-none"
          />
          <button
            onClick={handleSendEmail}
            disabled={sending || !emailMsg.trim()}
            className="px-5 py-2.5 bg-primary text-black rounded-xl text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2"
          >
            <Send className="w-4 h-4" />
            {sending ? 'Envoi...' : 'Envoyer par email'}
          </button>
        </div>
      )}
    </div>
  );
}