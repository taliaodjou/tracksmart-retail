import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { UserCheck, UserX, CreditCard, DollarSign } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminSubscriptionsView() {
  const queryClient = useQueryClient();
  const { data: users = [], isLoading } = useQuery({ queryKey: ['admin_users'], queryFn: () => base44.entities.User.list() });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.User.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin_users'] }),
  });

  const clients = users.filter(u => u.role !== 'admin');
  const active = clients.filter(u => u.subscription_status === 'active');
  const inactive = clients.filter(u => u.subscription_status !== 'active');

  const handleToggle = async (u) => {
    const newStatus = u.subscription_status === 'active' ? 'inactive' : 'active';
    await updateMutation.mutateAsync({
      id: u.id,
      data: {
        subscription_status: newStatus,
        ...(newStatus === 'active' && !u.subscription_start_date ? { subscription_start_date: new Date().toISOString().split('T')[0] } : {}),
      },
    });
    await base44.integrations.Core.SendEmail({
      to: u.email,
      subject: 'TrackSmart Retail — ' + (newStatus === 'active' ? 'Abonnement activé' : 'Accès suspendu'),
      body: newStatus === 'active'
        ? 'Votre abonnement TrackSmart Retail a été activé.'
        : "Votre accès TrackSmart Retail est suspendu. Contactez TNO Studio.",
    });
    toast.success(newStatus === 'active' ? 'Abonnement activé' : 'Abonnement désactivé');
  };

  const handlePlanChange = async (u, plan) => {
    await updateMutation.mutateAsync({ id: u.id, data: { subscription_plan: plan } });
    toast.success('Plan mis à jour: ' + plan);
  };

  const handleDateChange = async (u, date) => {
    await updateMutation.mutateAsync({ id: u.id, data: { subscription_start_date: date } });
  };

  const ClientRow = ({ u }) => {
    const isActive = u.subscription_status === 'active';
    return (
      <div className={`bg-[#1a1a1a] rounded-2xl border p-4 ${isActive ? 'border-emerald-500/15' : 'border-red-500/15'}`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${isActive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
              {(u.shop_name || u.full_name || u.email || '?')[0].toUpperCase()}
            </div>
            <div>
              <div className="text-white text-sm font-medium">{u.shop_name || u.full_name || u.email}</div>
              <div className="text-white/40 text-xs">{u.email}</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* Plan selector */}
            <select
              value={u.subscription_plan || 'basic'}
              onChange={e => handlePlanChange(u, e.target.value)}
              className="bg-white/5 border border-white/10 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-primary/40"
            >
              <option value="basic">Basic</option>
              <option value="premium">Premium</option>
            </select>
            {/* Start date */}
            <input
              type="date"
              defaultValue={u.subscription_start_date || ''}
              onBlur={e => e.target.value && handleDateChange(u, e.target.value)}
              className="bg-white/5 border border-white/10 text-white text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-primary/40 w-32"
            />
            {/* Toggle */}
            <button
              onClick={() => handleToggle(u)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/20'
              }`}
            >
              {isActive ? <><UserX className="w-3.5 h-3.5" /> Désactiver</> : <><UserCheck className="w-3.5 h-3.5" /> Activer</>}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 lg:p-8 pt-16 lg:pt-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Abonnements</h1>
        <p className="text-white/40 text-sm mt-1">Gérez les abonnements de tous vos clients</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Actifs', value: active.length, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
          { label: 'Inactifs', value: inactive.length, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
          { label: 'MRR estimé', value: `CHF ${active.length * 29}`, color: 'text-primary', bg: 'bg-primary/10 border-primary/20' },
        ].map((s, i) => (
          <div key={i} className={`rounded-2xl p-4 border text-center ${s.bg}`}>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
            <div className="text-white/40 text-xs mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="w-7 h-7 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {inactive.length > 0 && (
            <div>
              <h3 className="text-red-400 text-sm font-semibold mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-400" /> Abonnements inactifs ({inactive.length})
              </h3>
              <div className="space-y-2">{inactive.map(u => <ClientRow key={u.id} u={u} />)}</div>
            </div>
          )}
          {active.length > 0 && (
            <div>
              <h3 className="text-emerald-400 text-sm font-semibold mb-3 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" /> Abonnements actifs ({active.length})
              </h3>
              <div className="space-y-2">{active.map(u => <ClientRow key={u.id} u={u} />)}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}