import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { isAdmin, getProductStatus, getDaysRemaining, statusConfig } from '@/lib/productUtils';
import AdminLayout from './AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  ArrowLeft, Mail, Phone, Store, UserCheck, UserX, Send,
  Package, AlertTriangle, TrendingDown, Calendar, CreditCard
} from 'lucide-react';

export default function AdminClientDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [editingPlan, setEditingPlan] = useState(false);

  const { data: users = [] } = useQuery({
    queryKey: ['admin_users'],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: products = [] } = useQuery({
    queryKey: ['all_products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const client = users.find(u => u.id === id);
  const clientProducts = products.filter(p => p.created_by === client?.email);
  const expired = clientProducts.filter(p => getProductStatus(p.expiration_date) === 'expired');
  const urgent = clientProducts.filter(p => getProductStatus(p.expiration_date) === 'urgent');
  const totalLoss = expired.reduce((sum, p) => sum + ((p.quantity_thrown || 0) * (p.price_chf || 0)), 0);

  const updateMutation = useMutation({
    mutationFn: (data) => base44.entities.User.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin_users'] });
      toast.success('Client mis à jour');
    },
  });

  const handleToggleSubscription = async () => {
    const newStatus = client.subscription_status === 'active' ? 'inactive' : 'active';
    await updateMutation.mutateAsync({ subscription_status: newStatus });
    await base44.integrations.Core.SendEmail({
      to: client.email,
      subject: `TrackSmart — Abonnement ${newStatus === 'active' ? 'activé' : 'suspendu'}`,
      body: newStatus === 'active'
        ? 'Votre abonnement TrackSmart a été activé. Vous pouvez accéder à votre tableau de bord.'
        : 'Votre accès TrackSmart est suspendu. Contactez-nous pour renouveler.',
    });
  };

  const handleChangePlan = async (plan) => {
    await updateMutation.mutateAsync({ subscription_plan: plan });
    setEditingPlan(false);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    setSending(true);
    await base44.integrations.Core.SendEmail({
      to: client.email,
      subject: 'Message de TrackSmart (TNO Studio)',
      body: messageText,
      from_name: 'TrackSmart — TNO Studio',
    });
    await base44.entities.Notification.create({
      user_email: client.email,
      type: 'weekly_report',
      message: messageText,
      read: false,
      sent_at: new Date().toISOString(),
    });
    toast.success('Message envoyé');
    setMessageText('');
    setSending(false);
  };

  const handleSendPaymentReminder = async () => {
    await base44.integrations.Core.SendEmail({
      to: client.email,
      subject: 'Rappel de paiement — TrackSmart',
      body: `Bonjour,\n\nNous vous rappelons que votre abonnement TrackSmart est en attente de renouvellement.\n\nMerci de procéder au paiement pour continuer à accéder à vos services.\n\nCordialement,\nTNO Studio`,
      from_name: 'TrackSmart — TNO Studio',
    });
    toast.success('Rappel de paiement envoyé');
  };

  if (!client) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64 text-gray-400">Client introuvable</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-5">
        {/* Back */}
        <Link to="/admin-portal/clients" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Retour aux clients
        </Link>

        {/* Header */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <span className="text-primary font-bold text-2xl">
                  {(client.shop_name || client.full_name || client.email)?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{client.shop_name || client.full_name || client.email}</h1>
                <div className="flex flex-wrap gap-2 mt-1.5">
                  <Badge className={`${client.subscription_status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'} border-0`}>
                    {client.subscription_status === 'active' ? 'Actif' : 'Inactif'}
                  </Badge>
                  <Badge variant="outline" className="capitalize">{client.subscription_plan || 'basic'}</Badge>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                variant="outline"
                className="rounded-xl gap-2"
                onClick={handleToggleSubscription}
                disabled={updateMutation.isPending}
              >
                {client.subscription_status === 'active'
                  ? <><UserX className="w-4 h-4 text-red-500" />Désactiver</>
                  : <><UserCheck className="w-4 h-4 text-green-500" />Activer</>
                }
              </Button>
              <Button size="sm" variant="outline" className="rounded-xl gap-2" onClick={handleSendPaymentReminder}>
                <Mail className="w-4 h-4 text-primary" />
                Rappel paiement
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left column */}
          <div className="space-y-5">
            {/* Info */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4">Informations</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2.5 text-gray-600">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {client.email}
                </div>
                {client.phone && (
                  <div className="flex items-center gap-2.5 text-gray-600">
                    <Phone className="w-4 h-4 text-gray-400" />
                    {client.phone}
                  </div>
                )}
                {client.shop_name && (
                  <div className="flex items-center gap-2.5 text-gray-600">
                    <Store className="w-4 h-4 text-gray-400" />
                    {client.shop_name}
                  </div>
                )}
                {client.created_date && (
                  <div className="flex items-center gap-2.5 text-gray-600">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    Membre depuis {format(new Date(client.created_date), 'dd/MM/yyyy')}
                  </div>
                )}
              </div>
            </div>

            {/* Subscription */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-primary" />
                Abonnement
              </h3>
              <div className="space-y-3">
                {editingPlan ? (
                  <div className="space-y-2">
                    {['basic', 'premium'].map(plan => (
                      <button
                        key={plan}
                        onClick={() => handleChangePlan(plan)}
                        className={`w-full py-2.5 px-4 rounded-xl text-sm font-medium border transition-colors ${
                          client.subscription_plan === plan
                            ? 'bg-primary text-white border-primary'
                            : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        {plan === 'basic' ? '🔹 Basic — CHF 29/mois' : '⭐ Premium — CHF 59/mois'}
                      </button>
                    ))}
                    <button onClick={() => setEditingPlan(false)} className="text-xs text-gray-400 hover:text-gray-600 w-full text-center mt-1">Annuler</button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Plan actuel</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="capitalize">{client.subscription_plan || 'basic'}</Badge>
                        <button onClick={() => setEditingPlan(true)} className="text-xs text-primary hover:underline">Changer</button>
                      </div>
                    </div>
                    {client.subscription_start_date && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Depuis</span>
                        <span className="text-sm font-medium">{format(new Date(client.subscription_start_date), 'dd/MM/yyyy')}</span>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-2 space-y-5">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Produits', value: clientProducts.length, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Expirés', value: expired.length, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' },
                { label: 'Pertes CHF', value: totalLoss.toFixed(0), icon: TrendingDown, color: 'text-orange-600', bg: 'bg-orange-50' },
              ].map(({ label, value, icon: Icon, color, bg }) => (
                <div key={label} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 text-center">
                  <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mx-auto mb-2`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <div className="text-xl font-bold text-gray-900">{value}</div>
                  <div className="text-xs text-gray-500">{label}</div>
                </div>
              ))}
            </div>

            {/* Product list (read-only) */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="font-semibold text-gray-800">Produits ({clientProducts.length})</h3>
              </div>
              {clientProducts.length === 0 ? (
                <p className="text-center py-8 text-gray-400 text-sm">Aucun produit</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {['Produit', 'DLC', 'Statut', 'Action'].map(h => (
                          <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {clientProducts.slice(0, 15).map(p => {
                        const st = getProductStatus(p.expiration_date);
                        const cfg = statusConfig[st];
                        return (
                          <tr key={p.id} className="border-t border-gray-50 hover:bg-gray-50/50">
                            <td className="px-4 py-3 font-medium text-gray-800">{p.name}</td>
                            <td className="px-4 py-3 text-gray-500 text-xs">
                              {p.expiration_date ? format(new Date(p.expiration_date), 'dd/MM/yy') : '—'}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.color}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                                {st}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-400">{p.action || '—'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {clientProducts.length > 15 && (
                    <div className="px-4 py-3 text-xs text-gray-400 border-t border-gray-50">
                      + {clientProducts.length - 15} autres produits
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Message */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Send className="w-4 h-4 text-primary" />
                Envoyer un message
              </h3>
              <form onSubmit={handleSendMessage} className="space-y-3">
                <textarea
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  placeholder="Votre message au client..."
                  rows={3}
                  className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                />
                <div className="flex gap-2">
                  <Button type="submit" size="sm" className="rounded-xl gap-2" disabled={sending || !messageText.trim()}>
                    <Send className="w-3.5 h-3.5" />
                    {sending ? 'Envoi...' : 'Envoyer par email'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}