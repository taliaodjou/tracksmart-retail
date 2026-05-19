import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { getProductStatus } from '@/lib/productUtils';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#b5924c', '#3b82f6', '#10b981', '#f97316', '#8b5cf6', '#ec4899'];

export default function AdminAnalyticsView() {
  const { data: users = [] } = useQuery({ queryKey: ['admin_users'], queryFn: () => base44.entities.User.list() });
  const { data: allProductsRes = {}, isLoading: loadingProducts } = useQuery({
    queryKey: ['admin_all_products'],
    queryFn: () => base44.functions.invoke('adminGetAllProducts', {}),
  });
  const products = allProductsRes?.data?.products || [];

  if (loadingProducts) {
    return (
      <div className="p-6 lg:p-8 pt-16 lg:pt-8 flex items-center justify-center py-32">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const clients = users.filter(u => u.role !== 'admin');
  const activeClients = clients.filter(u => u.subscription_status === 'active');

  // Category distribution
  const categoryCount = {};
  products.forEach(p => {
    if (p.category) categoryCount[p.category] = (categoryCount[p.category] || 0) + 1;
  });
  const categoryData = Object.entries(categoryCount).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);

  // Products per client
  const clientProducts = clients.map(u => ({
    name: u.shop_name || u.full_name || u.email?.split('@')[0] || 'Client',
    total: products.filter(p => p.created_by === u.email).length,
    expired: products.filter(p => p.created_by === u.email && getProductStatus(p.expiration_date) === 'expired').length,
  })).sort((a, b) => b.total - a.total).slice(0, 8);

  // Status distribution
  const statusCount = { ok: 0, soon: 0, urgent: 0, expired: 0 };
  products.forEach(p => { const s = getProductStatus(p.expiration_date); if (statusCount[s] !== undefined) statusCount[s]++; });
  const statusData = Object.entries(statusCount).map(([name, value]) => ({ name, value }));

  // Total losses
  const totalLoss = products
    .filter(p => getProductStatus(p.expiration_date) === 'expired')
    .reduce((sum, p) => sum + (p.quantity_thrown || 0) * (p.price_chf || 0), 0);

  return (
    <div className="p-6 lg:p-8 pt-16 lg:pt-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Analytics</h1>
        <p className="text-white/40 text-sm mt-1">Vue globale de tous les comptes clients</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-4 max-w-xs">
        {[
          { label: 'Clients actifs', value: activeClients.length, sub: `sur ${clients.length} total` },
          { label: 'Clients inactifs', value: clients.length - activeClients.length, sub: 'abonnement suspendu' },
        ].map((k, i) => (
          <div key={i} className="bg-[#1a1a1a] rounded-2xl p-5 border border-white/5">
            <div className="text-2xl font-bold text-primary">{k.value}</div>
            <div className="text-white text-sm font-medium mt-1">{k.label}</div>
            <div className="text-white/30 text-xs mt-0.5">{k.sub}</div>
          </div>
        ))}
      </div>

      {/* Charts grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Products per client */}
        <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/5">
          <h3 className="text-white font-semibold mb-4 text-sm">Produits par client</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={clientProducts} barSize={20} barGap={2}>
              <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 9 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
              <Bar dataKey="total" fill="#3b82f6" name="Total" radius={[3, 3, 0, 0]} />
              <Bar dataKey="expired" fill="#ef4444" name="Expirés" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Status pie */}
        <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/5">
          <h3 className="text-white font-semibold mb-4 text-sm">Répartition des statuts</h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="45%" height={150}>
              <PieChart>
                <Pie data={statusData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3} dataKey="value">
                  {statusData.map((_, i) => (
                    <Cell key={i} fill={['#10b981', '#f59e0b', '#f97316', '#ef4444'][i]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {[['ok', '#10b981', 'OK'], ['soon', '#f59e0b', 'Bientôt'], ['urgent', '#f97316', 'Urgent'], ['expired', '#ef4444', 'Expiré']].map(([key, color, label]) => (
                <div key={key} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: color }} />
                    <span className="text-white/50">{label}</span>
                  </div>
                  <span className="text-white font-medium">{statusCount[key]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/5 lg:col-span-2">
          <h3 className="text-white font-semibold mb-4 text-sm">Distribution par catégorie</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={categoryData} barSize={32}>
              <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#fff' }} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}