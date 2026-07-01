import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getProductStatus, getDaysRemaining, statusConfig, categoryKeys } from '@/lib/productUtils';
import { toast } from 'sonner';
import { ArrowLeft, UserCheck, UserX, Mail, Send, CheckCircle } from 'lucide-react';
import { differenceInDays, format, startOfDay } from 'date-fns';

export default function ClientDetailView({ client, products, onBack, onToggle }) {
  const [emailMsg, setEmailMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [reminderSending, setReminderSending] = useState(false);
  const [reminderSentPopup, setReminderSentPopup] = useState(false);
  const [tab, setTab] = useState('overview');
  const queryClient = useQueryClient();

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.User.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin_users'] }),
  });

  const subscriptionAgeDays = client.subscription_start_date
    ? differenceInDays(startOfDay(new Date()), startOfDay(new Date(client.subscription_start_date)))
    : 999;
  const showPaymentConfirm = client.subscription_status !== 'active' || subscriptionAgeDays >= 20;
  const isExpiredSubscription = client.subscription_status === 'active' && subscriptionAgeDays >= 30;
  const isActive = client.subscription_status === 'active' && !isExpiredSubscription;
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
    const displayName = client.shop_name || client.full_name || 'votre boutique';
    const body = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Rappel de paiement TrackSmart</title>
</head>
<body style="margin:0;padding:0;background:#f4f1e8;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f1e8;padding:36px 14px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:620px;background:#ffffff;border-radius:22px;overflow:hidden;box-shadow:0 18px 50px rgba(17,24,39,0.12);">
          <tr>
            <td style="background:#111111;padding:28px 34px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <div style="display:inline-block;background:#C9A646;color:#111111;font-weight:800;font-size:16px;letter-spacing:.3px;padding:10px 14px;border-radius:12px;">TrackSmart</div>
                    <div style="color:rgba(255,255,255,.55);font-size:12px;margin-top:8px;">Gestion intelligente de votre commerce</div>
                  </td>
                  <td align="right" style="color:#C9A646;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;">Rappel paiement</td>
                </tr>
              </table>
            </td>
          </tr>
          <tr><td style="height:5px;background:linear-gradient(90deg,#C9A646,#f2d57d,#C9A646);"></td></tr>
          <tr>
            <td style="padding:38px 34px 28px;">
              <div style="display:inline-block;background:#fff7db;color:#8a6a12;border:1px solid #f0d37a;border-radius:999px;padding:7px 12px;font-size:12px;font-weight:700;margin-bottom:18px;">Action requise</div>
              <h1 style="margin:0 0 14px;font-size:24px;line-height:1.25;color:#111111;">Renouvellement de votre abonnement</h1>
              <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#4b5563;">Bonjour <strong style="color:#111111;">${displayName}</strong>,</p>
              <p style="margin:0 0 18px;font-size:15px;line-height:1.7;color:#4b5563;">Nous vous informons que votre abonnement <strong>TrackSmart Retail</strong> arrive à échéance ou nécessite une confirmation de paiement afin de maintenir l'accès à votre espace.</p>
              <div style="background:#faf7ee;border:1px solid #ead89c;border-radius:16px;padding:18px 20px;margin:24px 0;">
                <p style="margin:0 0 8px;font-size:14px;font-weight:700;color:#111111;">Pour éviter toute interruption :</p>
                <p style="margin:0;font-size:14px;line-height:1.65;color:#555555;">Merci de procéder au règlement de votre abonnement ou de nous envoyer une confirmation de paiement. Dès réception, votre accès sera réactivé ou prolongé rapidement.</p>
              </div>
              <table cellpadding="0" cellspacing="0" style="margin:26px 0 8px;">
                <tr>
                  <td style="background:#C9A646;border-radius:12px;padding:13px 24px;">
                    <a href="mailto:support@tracksmart.com" style="color:#111111;text-decoration:none;font-weight:800;font-size:14px;">Contacter TrackSmart</a>
                  </td>
                </tr>
              </table>
              <p style="margin:22px 0 0;font-size:13px;line-height:1.6;color:#777777;">Si votre paiement a déjà été effectué, vous pouvez ignorer ce message ou nous transmettre le justificatif pour validation.</p>
            </td>
          </tr>
          <tr>
            <td style="background:#111111;padding:22px 34px;text-align:center;">
              <p style="margin:0;color:rgba(255,255,255,.75);font-size:12px;line-height:1.6;">TrackSmart Retail · TNO Studio<br />Merci pour votre confiance.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

    setReminderSending(true);
    try {
      await base44.integrations.Core.SendEmail({
        to: client.email,
        subject: 'TrackSmart — Rappel de renouvellement de votre abonnement',
        body,
      });
      toast.success('Rappel de paiement envoyé');
      setReminderSentPopup(true);
      setTimeout(() => setReminderSentPopup(false), 3500);
    } finally {
      setReminderSending(false);
    }
  };

  return (
    <div className="p-6 lg:p-8 pt-16 lg:pt-8 space-y-6">
      {reminderSentPopup && (
        <div className="fixed top-6 right-6 z-[120] max-w-sm rounded-2xl border border-emerald-500/30 bg-[#111111] p-4 shadow-2xl shadow-black/40">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Rappel paiement envoyé</p>
              <p className="text-white/50 text-xs mt-1">L'email a bien été envoyé à {client.email}.</p>
            </div>
          </div>
        </div>
      )}
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
                  {isActive ? '● Actif' : isExpiredSubscription ? '● À renouveler' : '● Inactif'}
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => onToggle(client)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${showPaymentConfirm ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'}`}
            >
              {showPaymentConfirm ? <><UserCheck className="w-3 h-3" /> Paiement reçu — réactiver</> : <><UserX className="w-3 h-3" /> Désactiver</>}
            </button>
            <button
              onClick={handlePaymentReminder}
              disabled={reminderSending}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 border border-amber-500/20 transition-all disabled:opacity-50"
            >
              <Mail className="w-3 h-3" /> {reminderSending ? 'Envoi...' : 'Rappel paiement'}
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