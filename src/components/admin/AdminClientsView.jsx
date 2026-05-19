import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getProductStatus } from '@/lib/productUtils';
import { toast } from 'sonner';
import { Search, UserCheck, UserX, Mail, Send, ChevronRight, Package, AlertTriangle, Eye, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSupportMode } from '@/lib/SupportModeContext';
import ClientDetailView from './ClientDetailView';

export default function AdminClientsView({ selectedClientId, onSelectClient }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sendingEmail, setSendingEmail] = useState(null);
  const [emailMsg, setEmailMsg] = useState('');
  const [showEmailFor, setShowEmailFor] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const navigate = useNavigate();
  const { enterSupportMode } = useSupportMode();

  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({ queryKey: ['admin_users'], queryFn: () => base44.entities.User.list() });
  const { data: allProductsRes = {} } = useQuery({
    queryKey: ['admin_all_products'],
    queryFn: () => base44.functions.invoke('adminGetAllProducts', {}),
  });
  const products = allProductsRes?.data?.products || [];

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.User.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin_users'] }),
  });

  // Exclure les comptes admin de la liste clients
  const clients = users.filter(u => u.role !== 'admin' && u.email !== 'talia.odjou@gmail.com');

  // Compter les employés par boutique (manager + employee liés à un owner)
  const getEmployeeCount = (ownerEmail) =>
    users.filter(u => u.store_owner_email === ownerEmail && (u.role === 'employee' || u.role === 'manager')).length;

  const filtered = clients.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.email?.toLowerCase().includes(q) || u.full_name?.toLowerCase().includes(q) || u.shop_name?.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || (statusFilter === 'active' ? u.subscription_status === 'active' : u.subscription_status !== 'active');
    return matchSearch && matchStatus;
  });

  const unsubscribeFooter = (userId) => `
    <tr>
      <td style="background:#f9f9f7;border-top:1px solid #eeeeee;padding:16px 40px;text-align:center;">
        <p style="margin:0;font-size:11px;color:#bbbbbb;">
          Vous ne souhaitez plus recevoir ces emails ?
          <a href="https://tracksmart.base44.app/email-preferences?uid=${userId}&action=unsubscribe" style="color:#999999;text-decoration:underline;">Se désabonner</a>
        </p>
      </td>
    </tr>`;

  const emailTemplate = (title, accentColor, bodyContent, userId = '') => `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f0;padding:40px 0;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background:#111111;padding:28px 40px;text-align:left;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#C9A64C;border-radius:10px;padding:8px 14px;display:inline-block;">
                  <span style="color:#000000;font-weight:800;font-size:15px;letter-spacing:0.5px;">TrackSmart</span>
                </td>
                <td style="padding-left:14px;color:rgba(255,255,255,0.35);font-size:11px;">by TNO Studio</td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Accent bar -->
        <tr><td style="height:4px;background:${accentColor};"></td></tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 32px;">
            <h1 style="margin:0 0 16px;font-size:22px;font-weight:700;color:#111111;">${title}</h1>
            ${bodyContent}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f9f9f7;border-top:1px solid #eeeeee;padding:24px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#999999;">© ${new Date().getFullYear()} TNO Studio · TrackSmart</p>
            <p style="margin:6px 0 0;font-size:12px;color:#bbbbbb;">support@tracksmart.com</p>
          </td>
        </tr>
        ${userId ? unsubscribeFooter(userId) : ''}
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const handleToggle = async (u) => {
    const newStatus = u.subscription_status === 'active' ? 'inactive' : 'active';
    await updateMutation.mutateAsync({ id: u.id, data: { subscription_status: newStatus, ...(newStatus === 'active' && !u.subscription_start_date ? { subscription_start_date: new Date().toISOString().split('T')[0] } : {}) } });

    const shopName = u.shop_name || u.full_name || 'votre boutique';

    const body = newStatus === 'active'
      ? emailTemplate(
          '🎉 Votre abonnement est activé',
          '#10b981',
          `<p style="margin:0 0 16px;font-size:15px;color:#444444;line-height:1.7;">Bonjour <strong>${shopName}</strong>,</p>
           <p style="margin:0 0 20px;font-size:15px;color:#444444;line-height:1.7;">Votre abonnement <strong>TrackSmart</strong> a été activé avec succès. Vous avez désormais accès à l'ensemble des fonctionnalités de votre tableau de bord.</p>
           <table cellpadding="0" cellspacing="0" style="margin:24px 0;">
             <tr><td style="background:#10b981;border-radius:10px;padding:12px 28px;">
               <a href="https://tracksmart.base44.app/dashboard" style="color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;">Accéder à mon tableau de bord →</a>
             </td></tr>
           </table>
           <p style="margin:0;font-size:13px;color:#999999;">Si vous avez des questions, contactez-nous à support@tracksmart.com.</p>`,
          u.id
        )
      : emailTemplate(
          '⚠️ Accès suspendu',
          '#ef4444',
          `<p style="margin:0 0 16px;font-size:15px;color:#444444;line-height:1.7;">Bonjour <strong>${shopName}</strong>,</p>
           <p style="margin:0 0 20px;font-size:15px;color:#444444;line-height:1.7;">Votre accès <strong>TrackSmart</strong> a été temporairement suspendu. Pour renouveler votre abonnement et retrouver l'accès à vos données, veuillez nous contacter.</p>
           <p style="margin:0;font-size:14px;color:#444444;">📧 <a href="mailto:support@tracksmart.com" style="color:#C9A64C;font-weight:600;">support@tracksmart.com</a></p>`,
          u.id
        );

    await base44.integrations.Core.SendEmail({
      to: u.email,
      subject: newStatus === 'active' ? 'TrackSmart — Abonnement activé 🎉' : 'TrackSmart — Accès suspendu',
      body,
    });
    toast.success(newStatus === 'active' ? 'Client activé' : 'Client désactivé');
  };

  const handleSendEmail = async (u) => {
    if (!emailMsg.trim()) return;
    setSendingEmail(u.id);
    const shopName = u.shop_name || u.full_name || 'votre boutique';
    const body = emailTemplate(
      'Message de votre gestionnaire',
      '#C9A64C',
      `<p style="margin:0 0 16px;font-size:15px;color:#444444;line-height:1.7;">Bonjour <strong>${shopName}</strong>,</p>
       <div style="background:#f9f9f7;border-left:4px solid #C9A64C;border-radius:4px;padding:16px 20px;margin:0 0 20px;">
         <p style="margin:0;font-size:15px;color:#333333;line-height:1.7;white-space:pre-wrap;">${emailMsg.replace(/</g, '&lt;')}</p>
       </div>
       <p style="margin:0;font-size:13px;color:#999999;">Pour toute question, répondez directement à cet email ou contactez support@tracksmart.com.</p>`,
      u.id
    );
    await base44.integrations.Core.SendEmail({
      to: u.email,
      subject: 'TrackSmart — Message de votre gestionnaire',
      body,
    });
    toast.success('Email envoyé');
    setEmailMsg('');
    setShowEmailFor(null);
    setSendingEmail(null);
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviting(true);
    await base44.users.inviteUser(inviteEmail, 'user');
    toast.success('Invitation envoyée à ' + inviteEmail);
    setInviteEmail('');
    setInviting(false);
  };

  if (selectedClientId) {
    const client = clients.find(u => u.id === selectedClientId);
    if (client) {
      return (
        <ClientDetailView
          client={client}
          products={products.filter(p => p.created_by === client.email)}
          onBack={() => onSelectClient(null)}
          onToggle={handleToggle}
        />
      );
    }
  }

  return (
    <div className="p-6 lg:p-8 pt-16 lg:pt-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Clients</h1>
          <p className="text-white/40 text-sm mt-1">{clients.length} clients enregistrés</p>
        </div>
      </div>

      {/* Invite form */}
      <div className="bg-[#1a1a1a] rounded-2xl p-5 border border-white/5">
        <h3 className="text-white/70 text-xs font-semibold mb-3 flex items-center gap-2">
          <Mail className="w-4 h-4 text-primary" /> Inviter un nouveau client
        </h3>
        <form onSubmit={handleInvite} className="flex gap-3 items-center">
          <input
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            type="email"
            placeholder="email@boutique.com"
            required
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-white text-xs placeholder:text-white/30 focus:outline-none focus:border-primary/50"
          />
          <button type="submit" disabled={inviting} className="px-5 py-2 bg-primary text-black rounded-xl text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2">
            <Send className="w-4 h-4" /> {inviting ? '...' : 'Inviter'}
          </button>
        </form>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un client..."
            className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-primary/40"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'active', 'inactive'].map(f => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`px-4 py-2 rounded-xl text-xs font-medium transition-all ${statusFilter === f ? 'bg-primary text-black' : 'bg-[#1a1a1a] text-white/50 border border-white/10 hover:text-white'}`}
            >
              {f === 'all' ? 'Tous' : f === 'active' ? 'Actifs' : 'Inactifs'}
            </button>
          ))}
        </div>
      </div>

      {/* Client list */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-7 h-7 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-white/30">Aucun client trouvé</div>
        ) : filtered.map(u => {
          const userProducts = products.filter(p => p.created_by === u.email);
          const expired = userProducts.filter(p => getProductStatus(p.expiration_date) === 'expired');
          const isActive = u.subscription_status === 'active';
          const employeeCount = getEmployeeCount(u.email);
          const planTier = employeeCount === 0 ? null : employeeCount <= 2 ? { label: 'Classic', color: 'text-amber-400', bg: 'bg-amber-500/10' } : employeeCount <= 9 ? { label: 'Premium', color: 'text-blue-400', bg: 'bg-blue-500/10' } : { label: 'Business', color: 'text-purple-400', bg: 'bg-purple-500/10' };

          return (
            <div key={u.id} className="bg-[#1a1a1a] rounded-2xl border border-white/5 overflow-hidden">
              <div
                onClick={() => onSelectClient(u.id)}
                className="flex items-center justify-between p-3 cursor-pointer hover:bg-white/3 transition-all gap-2"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 ${isActive ? 'bg-primary/20 text-primary' : 'bg-white/5 text-white/30'}`}>
                    {(u.shop_name || u.full_name || u.email || '?')[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-white font-medium text-xs truncate">{u.shop_name || u.full_name || u.email}</div>
                    <div className="text-white/40 text-[10px] truncate">{u.email}</div>
                    {/* Mobile: show employee count below email */}
                    <div className="flex items-center gap-1.5 mt-0.5 sm:hidden">
                      <span className="flex items-center gap-1 text-[10px] text-white/40"><Users className="w-2.5 h-2.5" />{employeeCount + 1} util.</span>
                      {planTier && <span className={`px-1.5 py-0 rounded-full text-[10px] font-semibold ${planTier.bg} ${planTier.color}`}>{planTier.label}</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="hidden sm:flex gap-2 text-xs text-white/30">
                    <span className="flex items-center gap-1"><Package className="w-3 h-3" />{userProducts.length}</span>
                    {expired.length > 0 && <span className="flex items-center gap-1 text-red-400"><AlertTriangle className="w-3 h-3" />{expired.length}</span>}
                    <span className="flex items-center gap-1 text-white/40"><Users className="w-3 h-3" />{employeeCount + 1} util.</span>
                    {planTier && <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${planTier.bg} ${planTier.color}`}>{planTier.label}</span>}
                  </div>
                  {u.email_unsubscribed && (
                    <span className="hidden sm:inline px-2 py-0.5 rounded-full text-xs font-medium bg-orange-500/15 text-orange-400" title="Ne reçoit plus les emails">📵</span>
                  )}
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${isActive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                    {isActive ? 'Actif' : 'Inactif'}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-white/20" />
                </div>
              </div>

              {/* Quick actions */}
              <div className="border-t border-white/5 px-3 py-1.5 flex gap-1.5 flex-wrap">
                <button
                  onClick={() => handleToggle(u)}
                  className={`flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg transition-all ${isActive ? 'text-red-400 hover:bg-red-500/10' : 'text-emerald-400 hover:bg-emerald-500/10'}`}
                >
                  {isActive ? <UserX className="w-3 h-3" /> : <UserCheck className="w-3 h-3" />}
                  {isActive ? 'Désactiver' : 'Activer'}
                </button>
                <button
                  onClick={() => setShowEmailFor(showEmailFor === u.id ? null : u.id)}
                  className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg text-blue-400 hover:bg-blue-500/10 transition-all"
                >
                  <Mail className="w-3 h-3" /> Email
                </button>
                <button
                  onClick={() => { enterSupportMode(u); navigate('/support-view'); }}
                  className="flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg text-amber-400 hover:bg-amber-500/10 transition-all ml-auto"
                >
                  <Eye className="w-3 h-3" /> Voir boutique
                </button>
              </div>

              {/* Email composer */}
              {showEmailFor === u.id && (
                <div className="border-t border-white/5 p-4 space-y-2">
                  <textarea
                    value={emailMsg}
                    onChange={e => setEmailMsg(e.target.value)}
                    placeholder="Votre message..."
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-primary/40 resize-none"
                  />
                  <button
                    onClick={() => handleSendEmail(u)}
                    disabled={sendingEmail === u.id || !emailMsg.trim()}
                    className="px-4 py-2 bg-primary text-black rounded-lg text-xs font-semibold hover:bg-primary/90 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    {sendingEmail === u.id ? 'Envoi...' : 'Envoyer'}
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}