import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getProductStatus } from '@/lib/productUtils';
import { toast } from 'sonner';
import { Search, UserCheck, UserX, Mail, Send, ChevronRight, Package, AlertTriangle, Eye } from 'lucide-react';
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

  const filtered = clients.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !q || u.email?.toLowerCase().includes(q) || u.full_name?.toLowerCase().includes(q) || u.shop_name?.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || (statusFilter === 'active' ? u.subscription_status === 'active' : u.subscription_status !== 'active');
    return matchSearch && matchStatus;
  });

  const handleToggle = async (u) => {
    const newStatus = u.subscription_status === 'active' ? 'inactive' : 'active';
    await updateMutation.mutateAsync({ id: u.id, data: { subscription_status: newStatus, ...(newStatus === 'active' && !u.subscription_start_date ? { subscription_start_date: new Date().toISOString().split('T')[0] } : {}) } });
    await base44.integrations.Core.SendEmail({
      to: u.email,
      subject: 'TrackSmart — ' + (newStatus === 'active' ? 'Abonnement activé' : 'Accès suspendu'),
      body: newStatus === 'active'
        ? 'Votre abonnement TrackSmart a été activé. Vous pouvez maintenant accéder à votre tableau de bord.'
        : 'Votre accès TrackSmart est suspendu. Veuillez contacter TNO Studio pour renouveler votre abonnement.',
    });
    toast.success(newStatus === 'active' ? 'Client activé' : 'Client désactivé');
  };

  const handleSendEmail = async (u) => {
    if (!emailMsg.trim()) return;
    setSendingEmail(u.id);
    await base44.integrations.Core.SendEmail({ to: u.email, subject: 'TrackSmart — Message de votre gestionnaire', body: emailMsg });
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

          return (
            <div key={u.id} className="bg-[#1a1a1a] rounded-2xl border border-white/5 overflow-hidden">
              <div
                onClick={() => onSelectClient(u.id)}
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/3 transition-all"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${isActive ? 'bg-primary/20 text-primary' : 'bg-white/5 text-white/30'}`}>
                    {(u.shop_name || u.full_name || u.email || '?')[0].toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <div className="text-white font-medium text-sm truncate">{u.shop_name || u.full_name || u.email}</div>
                    <div className="text-white/40 text-xs truncate">{u.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <div className="hidden sm:flex gap-3 text-xs text-white/30">
                    <span className="flex items-center gap-1"><Package className="w-3 h-3" />{userProducts.length}</span>
                    {expired.length > 0 && <span className="flex items-center gap-1 text-red-400"><AlertTriangle className="w-3 h-3" />{expired.length}</span>}
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${isActive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                    {isActive ? 'Actif' : 'Inactif'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-white/20" />
                </div>
              </div>

              {/* Quick actions */}
              <div className="border-t border-white/5 px-4 py-2 flex gap-2 flex-wrap">
                <button
                  onClick={() => handleToggle(u)}
                  className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all ${isActive ? 'text-red-400 hover:bg-red-500/10' : 'text-emerald-400 hover:bg-emerald-500/10'}`}
                >
                  {isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                  {isActive ? 'Désactiver' : 'Activer'}
                </button>
                <button
                  onClick={() => setShowEmailFor(showEmailFor === u.id ? null : u.id)}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg text-blue-400 hover:bg-blue-500/10 transition-all"
                >
                  <Mail className="w-3.5 h-3.5" /> Envoyer email
                </button>
                <button
                  onClick={() => { enterSupportMode(u); navigate('/support-view'); }}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg text-amber-400 hover:bg-amber-500/10 transition-all ml-auto"
                >
                  <Eye className="w-3.5 h-3.5" /> 👁️ Voir boutique
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