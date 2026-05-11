import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { isAdmin, getProductStatus } from '@/lib/productUtils';
import AdminLayout from './AdminLayout';
import { Link } from 'react-router-dom';
import { Users, CheckCircle2, XCircle, TrendingUp, Package, AlertTriangle, ArrowRight, Clock } from 'lucide-react';
import { differenceInDays } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function AdminDashboard() {
  const { data: users = [] } = useQuery({
    queryKey: ['admin_users'],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: products = [] } = useQuery({
    queryKey: ['all_products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const clients = users.filter(u => !isAdmin(u));
  const active = clients.filter(u => u.subscription_status === 'active');
  const inactive = clients.filter(u => u.subscription_status !== 'active');

  const basicClients = clients.filter(u => u.subscription_plan === 'basic' || !u.subscription_plan);
  const premiumClients = clients.filter(u => u.subscription_plan === 'premium');
  const mrr = (basicClients.filter(u => u.subscription_status === 'active').length * 29) +
               (premiumClients.filter(u => u.subscription_status === 'active').length * 59);

  const expiredProducts = products.filter(p => getProductStatus(p.expiration_date) === 'expired');
  const urgentProducts = products.filter(p => getProductStatus(p.expiration_date) === 'urgent');

  // Inactive for 30+ days
  const inactiveAlerts = clients.filter(u => {
    if (!u.updated_date) return false;
    return differenceInDays(new Date(), new Date(u.updated_date)) > 30;
  });

  // Clients with many expired products
  const clientsWithExpiredProducts = clients.map(u => ({
    ...u,
    expiredCount: products.filter(p => p.created_by === u.email && getProductStatus(p.expiration_date) === 'expired').length,
  })).filter(u => u.expiredCount > 3).sort((a, b) => b.expiredCount - a.expiredCount);

  const subscriptionChartData = [
    { name: 'Actifs', value: active.length, color: '#22c55e' },
    { name: 'Inactifs', value: inactive.length, color: '#ef4444' },
  ];

  const categoryData = Object.entries(
    products.reduce((acc, p) => {
      const cat = p.category || 'autre';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {})
  ).slice(0, 6).map(([name, value]) => ({ name, value }));

  const statCards = [
    { label: 'Total clients', value: clients.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Abonnements actifs', value: active.length, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Abonnements inactifs', value: inactive.length, icon: XCircle, color: 'text-red-500', bg: 'bg-red-50' },
    { label: 'MRR estimé (CHF)', value: `${mrr}`, icon: TrendingUp, color: 'text-primary', bg: 'bg-yellow-50' },
    { label: 'Produits suivis', value: products.length, icon: Package, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Produits expirés', value: expiredProducts.length, icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Vue d'ensemble</h1>
          <p className="text-sm text-gray-500 mt-1">Tableau de bord administrateur TNO Studio</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {statCards.map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm border border-gray-100">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium">{label}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1">{value}</p>
                </div>
                <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center`}>
                  <Icon className={`w-4.5 h-4.5 ${color}`} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Subscription Pie */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Répartition abonnements</h3>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={140} height={140}>
                <PieChart>
                  <Pie data={subscriptionChartData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" paddingAngle={3}>
                    {subscriptionChartData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {subscriptionChartData.map(d => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                    <span className="text-sm text-gray-600">{d.name}</span>
                    <span className="text-sm font-bold text-gray-900 ml-auto pl-4">{d.value}</span>
                  </div>
                ))}
                <div className="pt-2 border-t border-gray-100">
                  <div className="text-xs text-gray-500">Taux d'activation</div>
                  <div className="text-lg font-bold text-gray-900">
                    {clients.length ? Math.round((active.length / clients.length) * 100) : 0}%
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Category Bar */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Produits par catégorie</h3>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={categoryData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Unpaid/inactive */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-red-500" />
                Abonnements inactifs ({inactive.length})
              </h3>
              <Link to="/admin-portal/subscriptions" className="text-xs text-primary hover:underline flex items-center gap-1">
                Voir tout <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {inactive.slice(0, 4).map(u => (
                <Link key={u.id} to={`/admin-portal/clients/${u.id}`} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 transition-colors group">
                  <div>
                    <div className="text-sm font-medium text-gray-800">{u.shop_name || u.full_name || u.email}</div>
                    <div className="text-xs text-gray-400">{u.email}</div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500" />
                </Link>
              ))}
              {inactive.length === 0 && <p className="text-sm text-gray-400 text-center py-2">Aucun abonnement inactif 🎉</p>}
            </div>
          </div>

          {/* Clients with many expired */}
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-orange-500" />
                Alertes produits expirés
              </h3>
              <Link to="/admin-portal/clients" className="text-xs text-primary hover:underline flex items-center gap-1">
                Voir tout <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="space-y-2">
              {clientsWithExpiredProducts.slice(0, 4).map(u => (
                <Link key={u.id} to={`/admin-portal/clients/${u.id}`} className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 transition-colors group">
                  <div>
                    <div className="text-sm font-medium text-gray-800">{u.shop_name || u.full_name || u.email}</div>
                    <div className="text-xs text-orange-500 font-medium">{u.expiredCount} produits expirés</div>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500" />
                </Link>
              ))}
              {clientsWithExpiredProducts.length === 0 && <p className="text-sm text-gray-400 text-center py-2">Aucune alerte</p>}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}