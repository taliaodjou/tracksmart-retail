import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { isAdmin } from '@/lib/productUtils';
import AdminLayout from './AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Mail, MessageSquare, AlertCircle, Search } from 'lucide-react';

const templates = [
  {
    id: 'payment',
    label: '💳 Rappel paiement',
    subject: 'Rappel de renouvellement — TrackSmart',
    body: `Bonjour,\n\nNous vous contactons pour vous rappeler que votre abonnement TrackSmart arrive à expiration.\n\nPour continuer à bénéficier de nos services, merci de procéder au renouvellement dès que possible.\n\nEn cas de question, n'hésitez pas à nous contacter.\n\nCordialement,\nL'équipe TNO Studio — TrackSmart`,
  },
  {
    id: 'welcome',
    label: '👋 Message de bienvenue',
    subject: 'Bienvenue sur TrackSmart !',
    body: `Bonjour,\n\nBienvenue sur TrackSmart, votre solution de gestion des dates de péremption !\n\nVotre compte est maintenant actif. Vous pouvez dès à présent commencer à suivre vos produits et éviter les pertes.\n\nSi vous avez besoin d'aide pour démarrer, notre équipe est disponible pour vous accompagner.\n\nBonne utilisation !\nL'équipe TNO Studio — TrackSmart`,
  },
  {
    id: 'support',
    label: '🛠 Message support',
    subject: 'Support TrackSmart — Suivi de votre demande',
    body: `Bonjour,\n\nNous avons bien reçu votre demande et nous y répondons dans les meilleurs délais.\n\nNotre équipe technique examine votre situation et reviendra vers vous très prochainement.\n\nMerci de votre patience.\n\nCordialement,\nL'équipe TNO Studio — TrackSmart`,
  },
];

export default function AdminSupport() {
  const [selectedUser, setSelectedUser] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState('');

  const { data: users = [] } = useQuery({
    queryKey: ['admin_users'],
    queryFn: () => base44.entities.User.list(),
  });

  const clients = users.filter(u => !isAdmin(u));
  const filteredClients = clients.filter(u =>
    !search ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.shop_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.full_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleTemplate = (tpl) => {
    setSubject(tpl.subject);
    setBody(tpl.body);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!selectedUser || !subject || !body) return;
    setSending(true);
    const targetUser = users.find(u => u.id === selectedUser);
    await base44.integrations.Core.SendEmail({
      to: targetUser.email,
      subject,
      body,
      from_name: 'TrackSmart — TNO Studio',
    });
    await base44.entities.Notification.create({
      user_email: targetUser.email,
      type: 'weekly_report',
      message: body.substring(0, 200),
      read: false,
      sent_at: new Date().toISOString(),
    });
    toast.success('Message envoyé à ' + targetUser.email);
    setSubject('');
    setBody('');
    setSending(false);
  };

  const handleBroadcast = async () => {
    if (!subject || !body) return;
    setSending(true);
    const activeClients = clients.filter(u => u.subscription_status === 'active');
    for (const u of activeClients) {
      await base44.integrations.Core.SendEmail({
        to: u.email,
        subject,
        body,
        from_name: 'TrackSmart — TNO Studio',
      });
    }
    toast.success(`Message envoyé à ${activeClients.length} clients actifs`);
    setSending(false);
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Support clients</h1>
          <p className="text-sm text-gray-500 mt-0.5">Communiquez avec vos clients</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Compose */}
          <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-primary" />
              Composer un message
            </h3>

            {/* Templates */}
            <div className="flex flex-wrap gap-2 mb-4">
              {templates.map(tpl => (
                <button
                  key={tpl.id}
                  onClick={() => handleTemplate(tpl)}
                  className="px-3 py-1.5 text-xs rounded-xl bg-gray-100 hover:bg-primary hover:text-white transition-colors font-medium"
                >
                  {tpl.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSend} className="space-y-3">
              {/* Recipient */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Destinataire</label>
                <select
                  value={selectedUser}
                  onChange={e => setSelectedUser(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 bg-white"
                  required
                >
                  <option value="">Sélectionner un client...</option>
                  {filteredClients.map(u => (
                    <option key={u.id} value={u.id}>
                      {u.shop_name || u.full_name || u.email} — {u.email}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Sujet</label>
                <Input
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="Objet du message"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Message</label>
                <textarea
                  value={body}
                  onChange={e => setBody(e.target.value)}
                  placeholder="Contenu du message..."
                  rows={6}
                  required
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                <Button type="submit" className="rounded-xl gap-2" disabled={sending}>
                  <Mail className="w-4 h-4" />
                  {sending ? 'Envoi...' : 'Envoyer au client'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl gap-2"
                  disabled={sending || !subject || !body}
                  onClick={handleBroadcast}
                >
                  <AlertCircle className="w-4 h-4 text-orange-500" />
                  Envoyer à tous les actifs
                </Button>
              </div>
            </form>
          </div>

          {/* Client list */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-3">Clients ({clients.length})</h3>
            <div className="relative mb-3">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher..."
                className="pl-8 text-xs h-8"
              />
            </div>
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {filteredClients.map(u => (
                <button
                  key={u.id}
                  onClick={() => setSelectedUser(u.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    selectedUser === u.id ? 'bg-primary/10 text-primary' : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="font-medium truncate">{u.shop_name || u.full_name || u.email}</div>
                  <div className="text-xs text-gray-400 truncate">{u.email}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}