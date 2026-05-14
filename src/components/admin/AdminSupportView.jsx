import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { Mail, Send, MessageSquare, AlertCircle } from 'lucide-react';

export default function AdminSupportView() {
  const { data: users = [] } = useQuery({ queryKey: ['admin_users'], queryFn: () => base44.entities.User.list() });
  const [selectedUser, setSelectedUser] = useState('');
  const [msgType, setMsgType] = useState('support');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const clients = users.filter(u => u.role !== 'admin');

  const templates = {
    support: `Bonjour,\n\nMerci de nous avoir contacté. Notre équipe TNO Studio est à votre disposition.\n\nN'hésitez pas à nous décrire votre problème en détail.\n\nCordialement,\nL'équipe TrackSmart`,
    payment: `Bonjour,\n\nNous vous rappelons que votre abonnement TrackSmart nécessite un renouvellement de paiement.\n\nMerci de nous contacter pour régulariser votre situation et maintenir l'accès à votre tableau de bord.\n\nCordialement,\nTNO Studio`,
    welcome: `Bienvenue sur TrackSmart !\n\nNous sommes ravis de vous accueillir parmi nos clients. Votre boutique est maintenant configurée et votre abonnement est actif.\n\nPour toute question, contactez notre équipe TNO Studio.\n\nBonne utilisation !`,
  };

  const handleSend = async () => {
    if (!selectedUser || !message.trim()) return;
    const u = clients.find(c => c.id === selectedUser);
    if (!u) return;
    setSending(true);
    await base44.integrations.Core.SendEmail({
      to: u.email,
      subject: msgType === 'payment' ? 'TrackSmart — Rappel de paiement' : msgType === 'welcome' ? 'Bienvenue sur TrackSmart !' : 'TrackSmart — Message de support',
      body: message,
    });
    toast.success('Message envoyé à ' + (u.shop_name || u.email));
    setMessage('');
    setSending(false);
  };

  const handleBroadcast = async () => {
    if (!message.trim()) return;
    setSending(true);
    for (const u of clients) {
      await base44.integrations.Core.SendEmail({
        to: u.email,
        subject: 'TrackSmart — Annonce importante',
        body: message,
      });
    }
    toast.success(`Message envoyé à ${clients.length} clients`);
    setMessage('');
    setSending(false);
  };

  return (
    <div className="p-6 lg:p-8 pt-16 lg:pt-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Support & Communication</h1>
        <p className="text-white/40 text-sm mt-1">Communiquez avec vos clients</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Message composer */}
        <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/5 space-y-4">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" /> Envoyer un message
          </h3>

          {/* Client selector */}
          <div>
            <label className="text-white/40 text-xs mb-1.5 block">Destinataire</label>
            <select
              value={selectedUser}
              onChange={e => setSelectedUser(e.target.value)}
              className="w-full bg-white/5 border border-white/10 text-white text-sm rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary/40"
            >
              <option value="">Sélectionner un client...</option>
              {clients.map(u => (
                <option key={u.id} value={u.id}>{u.shop_name || u.full_name || u.email}</option>
              ))}
            </select>
          </div>

          {/* Type */}
          <div>
            <label className="text-white/40 text-xs mb-1.5 block">Type de message</label>
            <div className="flex gap-2">
              {[['support', 'Support'], ['payment', 'Paiement'], ['welcome', 'Bienvenue']].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => { setMsgType(key); setMessage(templates[key]); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${msgType === key ? 'bg-primary text-black' : 'bg-white/5 text-white/50 hover:text-white border border-white/10'}`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="text-white/40 text-xs mb-1.5 block">Message</label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={7}
              placeholder="Votre message..."
              className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-primary/40 resize-none"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSend}
              disabled={sending || !selectedUser || !message.trim()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-primary text-black rounded-xl text-sm font-semibold hover:bg-primary/90 disabled:opacity-40 transition-all"
            >
              <Send className="w-4 h-4" />
              {sending ? 'Envoi...' : 'Envoyer au client'}
            </button>
          </div>
        </div>

        {/* Broadcast */}
        <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-amber-500/15 space-y-4">
          <h3 className="text-white font-semibold text-sm flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-400" /> Diffusion à tous les clients
          </h3>
          <p className="text-white/40 text-xs">Envoyez un message à tous vos {clients.length} clients simultanément.</p>
          <textarea
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={7}
            placeholder="Annonce, mise à jour, maintenance..."
            className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-amber-400/40 resize-none"
          />
          <button
            onClick={handleBroadcast}
            disabled={sending || !message.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-amber-500/15 text-amber-400 border border-amber-500/20 rounded-xl text-sm font-semibold hover:bg-amber-500/25 disabled:opacity-40 transition-all"
          >
            <Send className="w-4 h-4" />
            {sending ? 'Envoi...' : `Envoyer à tous (${clients.length})`}
          </button>
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/5">
        <h3 className="text-white font-semibold text-sm mb-4">Actions rapides</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { label: 'Rappel paiement (inactifs)', action: async () => {
              const inactive = clients.filter(u => u.subscription_status !== 'active');
              for (const u of inactive) {
                await base44.integrations.Core.SendEmail({ to: u.email, subject: 'TrackSmart — Rappel de paiement', body: templates.payment });
              }
              toast.success(`Rappels envoyés à ${inactive.length} clients inactifs`);
            }, color: 'text-red-400 border-red-500/20 hover:bg-red-500/10' },
            { label: 'Message de bienvenue (actifs)', action: async () => {
              const active = clients.filter(u => u.subscription_status === 'active');
              for (const u of active) {
                await base44.integrations.Core.SendEmail({ to: u.email, subject: 'Bienvenue sur TrackSmart !', body: templates.welcome });
              }
              toast.success(`Messages envoyés à ${active.length} clients`);
            }, color: 'text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/10' },
            { label: 'Rapport de test (moi)', action: async () => {
              const me = users.find(u => u.role === 'admin');
              if (me) { await base44.integrations.Core.SendEmail({ to: me.email, subject: 'TrackSmart — Test email', body: 'Ceci est un test de l\'envoi d\'email depuis le portail admin.' }); toast.success('Email de test envoyé'); }
            }, color: 'text-primary border-primary/20 hover:bg-primary/10' },
          ].map((a, i) => (
            <button key={i} onClick={a.action} className={`p-4 rounded-xl border text-sm font-medium text-left transition-all ${a.color}`}>
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}