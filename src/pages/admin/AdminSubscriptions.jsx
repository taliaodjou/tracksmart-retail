import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { isAdmin } from '@/lib/productUtils';
import AdminLayout from './AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { UserCheck, UserX, Mail, CreditCard } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminSubscriptions() {
  const queryClient = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [inviteRole, setInviteRole] = useState('user');

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin_users'],
    queryFn: () => base44.entities.User.list(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.User.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin_users'] }),
  });

  const clients = users.filter(u => !isAdmin(u));
  const active = clients.filter(u => u.subscription_status === 'active');
  const inactive = clients.filter(u => u.subscription_status !== 'active');
  const mrr = clients.filter(u => u.subscription_status === 'active').reduce((sum, u) => {
    return sum + (u.subscription_plan === 'premium' ? 59 : 29);
  }, 0);

  const handleToggle = async (u) => {
    const newStatus = u.subscription_status === 'active' ? 'inactive' : 'active';
    await updateMutation.mutateAsync({ id: u.id, data: { subscription_status: newStatus } });
    await base44.integrations.Core.SendEmail({
      to: u.email,
      subject: `TrackSmart — Abonnement ${newStatus === 'active' ? 'activé' : 'suspendu'}`,
      body: newStatus === 'active'
        ? 'Votre abonnement TrackSmart a été activé.'
        : 'Votre accès TrackSmart est suspendu. Veuillez contacter le support.',
    });
    toast.success(newStatus === 'active' ? 'Abonnement activé' : 'Abonnement suspendu');
  };

  const handleChangePlan = async (u, plan) => {
    await updateMutation.mutateAsync({ id: u.id, data: { subscription_plan: plan } });
    toast.success('Plan modifié');
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviting(true);
    await base44.users.inviteUser(inviteEmail, inviteRole);
    toast.success('Invitation envoyée');
    setInviteEmail('');
    setInviting(false);
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Abonnements</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gérez les abonnements clients</p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Actifs', value: active.length, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Inactifs', value: inactive.length, color: 'text-red-500', bg: 'bg-red-50' },
            { label: 'MRR (CHF)', value: mrr, color: 'text-primary', bg: 'bg-yellow-50' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} className={`${bg} rounded-2xl p-4 text-center`}>
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <div className="text-xs text-gray-600 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Invite */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" />
            Inviter un utilisateur
          </h3>
          <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
            <Input
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              placeholder="Email du nouvel utilisateur"
              type="email"
              required
              className="flex-1"
            />
            <select
              value={inviteRole}
              onChange={e => setInviteRole(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="user">Client</option>
              <option value="admin">Admin</option>
            </select>
            <Button type="submit" disabled={inviting} className="rounded-xl gap-2">
              <Mail className="w-4 h-4" />
              {inviting ? 'Envoi...' : 'Inviter'}
            </Button>
          </form>
        </div>

        {/* Subscriptions table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Tous les clients ({clients.length})</h3>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-7 h-7 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Client</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Plan</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Statut</th>
                    <th className="text-left px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Depuis</th>
                    <th className="px-4 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map(u => (
                    <tr key={u.id} className="border-t border-gray-50 hover:bg-gray-50/60">
                      <td className="px-5 py-4">
                        <Link to={`/admin-portal/clients/${u.id}`} className="font-medium text-gray-900 hover:text-primary transition-colors">
                          {u.shop_name || u.full_name || u.email}
                        </Link>
                        <div className="text-xs text-gray-400">{u.email}</div>
                      </td>
                      <td className="px-4 py-4">
                        <select
                          value={u.subscription_plan || 'basic'}
                          onChange={e => handleChangePlan(u, e.target.value)}
                          className="border border-gray-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30 bg-white"
                        >
                          <option value="basic">Basic</option>
                          <option value="premium">Premium</option>
                        </select>
                      </td>
                      <td className="px-4 py-4">
                        <Badge className={u.subscription_status === 'active'
                          ? 'bg-green-100 text-green-700 border-0'
                          : 'bg-red-100 text-red-600 border-0'}>
                          {u.subscription_status === 'active' ? 'Actif' : 'Inactif'}
                        </Badge>
                      </td>
                      <td className="px-4 py-4 text-xs text-gray-500">
                        {u.subscription_start_date ? format(new Date(u.subscription_start_date), 'dd/MM/yyyy') : '—'}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-xl gap-1.5 text-xs"
                          onClick={() => handleToggle(u)}
                          disabled={updateMutation.isPending}
                        >
                          {u.subscription_status === 'active'
                            ? <><UserX className="w-3.5 h-3.5 text-red-500" />Suspendre</>
                            : <><UserCheck className="w-3.5 h-3.5 text-green-500" />Activer</>
                          }
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}