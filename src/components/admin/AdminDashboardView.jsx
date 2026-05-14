import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getProductStatus } from '@/lib/productUtils';
import { Users, TrendingUp, AlertTriangle, Package, DollarSign, Activity, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';

export default function AdminDashboardView({ onNavigate, onSelectClient }) {
  const { data: users = [] } = useQuery({ queryKey: ['admin_users'], queryFn: () => base44.entities.User.list() });
  const { data: products = [] } = useQuery({ queryKey: ['all_products'], queryFn: () => base44.entities.Product.list() });

  // Exclure les comptes admin des statistiques clients
  const clients = users.filter(u => u.role !== 'admin' && u.email !== 'talia.odjou@gmail.com');
  const activeClients = clients.filter(u => u.subscription_status === 'active');
  const inactiveClients = clients.filter(u => u.subscription_status !== 'active');

  const expiredProducts = products.filter(p => getProductStatus(p.expiration_date) === 'expired');
  const mrr = activeClients.length * 29; // estimate CHF 29/client

  // Clients with most expired products
  const clientExpiry = clients.map(u => {
    const userProducts = products.filter(p => p.created_by === u.email);
    const expired = userProducts.filter(p => getProductStatus(p.expiration_date) === 'expired');
    return { name: u.shop_name || u.email?.split('@')[0] || u.full_name || 'Client', expired: expired.length, total: userProducts.length, id: u.id };
  }).sort((a, b) => b.expired - a.expired).slice(0, 6);

  const stats = [
    { label: 'Total Clients', value: clients.length, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10', trend: '' },
    { label: 'Abonnements actifs', value: activeClients.length, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10', trend: '' },
    { label: 'Non actifs', value: inactiveClients.length, icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10', trend: '' },
    { label: 'MRR estimé', value: `CHF ${mrr}`, icon: DollarSign, color: 'text-primary', bg: 'bg-primary/10', trend: '' },
    { label: 'Produits trackés', value: products.length, icon: Package, color: 'text-purple-400', bg: 'bg-purple-500/10', trend: '' },
    { label: 'Produits expirés', value: expiredProducts.length, icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10', trend: '' },
  ];

  const alertClients = clients.filter(u => {
    const userProducts = products.filter(p => p.created_by === u.email);
    const expired = userProducts.filter(p => getProductStatus(p.expiration_date) === 'expired');
    return expired.length > 3 || u.subscription_status !== 'active';
  });

  return (
    <div className="p-6 lg:p-8 pt-16 lg:pt-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard Admin</h1>
        <p className="text-white/40 text-sm mt-1">Vue d'ensemble de tous les clients TrackSmart</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {stats.map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="bg-[#1a1a1a] rounded-2xl p-5 border border-white/5">
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${s.color}`} />
                </div>
              </div>
              <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-white/40 text-xs mt-1">{s.label}</div>
            </div>
          );
        })}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Expiry by client chart */}
        <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/5">
          <h3 className="text-white font-semibold mb-4 text-sm">Produits expirés par client (top 6)</h3>
          {clientExpiry.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={clientExpiry} barSize={28}>
                <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
                <Bar dataKey="expired" radius={[4, 4, 0, 0]}>
                  {clientExpiry.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? '#ef4444' : i < 3 ? '#f97316' : '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-48 text-white/30 text-sm">Pas de données</div>
          )}
        </div>

        {/* Subscription status */}
        <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/5">
          <h3 className="text-white font-semibold mb-4 text-sm">Statuts des abonnements</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-emerald-500/10 rounded-xl border border-emerald-500/20">
              <span className="text-emerald-400 text-sm font-medium">Actifs</span>
              <span className="text-emerald-400 font-bold text-lg">{activeClients.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-xl border border-red-500/20">
              <span className="text-red-400 text-sm font-medium">Inactifs / Expirés</span>
              <span className="text-red-400 font-bold text-lg">{inactiveClients.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-primary/10 rounded-xl border border-primary/20">
              <span className="text-primary text-sm font-medium">MRR estimé</span>
              <span className="text-primary font-bold text-lg">CHF {mrr}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {alertClients.length > 0 && (
        <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-amber-500/20">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Alertes clients ({alertClients.length})
            </h3>
            <button onClick={() => onNavigate('clients')} className="text-xs text-white/40 hover:text-white flex items-center gap-1">
              Voir tout <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2">
            {alertClients.slice(0, 5).map(u => {
              const userProducts = products.filter(p => p.created_by === u.email);
              const expired = userProducts.filter(p => getProductStatus(p.expiration_date) === 'expired');
              return (
                <div
                  key={u.id}
                  onClick={() => onSelectClient(u.id)}
                  className="flex items-center justify-between p-3 bg-white/3 rounded-xl hover:bg-white/5 cursor-pointer border border-white/5 transition-all"
                >
                  <div>
                    <div className="text-white text-sm font-medium">{u.shop_name || u.full_name || u.email}</div>
                    <div className="text-white/40 text-xs">{u.email}</div>
                  </div>
                  <div className="flex gap-2">
                    {u.subscription_status !== 'active' && (
                      <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded-full text-xs">Inactif</span>
                    )}
                    {expired.length > 0 && (
                      <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 rounded-full text-xs">{expired.length} expirés</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}