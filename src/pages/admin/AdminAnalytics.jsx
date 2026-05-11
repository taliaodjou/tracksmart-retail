import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { isAdmin, getProductStatus } from '@/lib/productUtils';
import AdminLayout from './AdminLayout';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend
} from 'recharts';

const COLORS = ['#B9943A', '#22c55e', '#ef4444', '#f97316', '#8b5cf6', '#06b6d4'];

export default function AdminAnalytics() {
  const { data: users = [] } = useQuery({
    queryKey: ['admin_users'],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: products = [] } = useQuery({
    queryKey: ['all_products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const clients = users.filter(u => !isAdmin(u));

  // Category distribution
  const categoryData = Object.entries(
    products.reduce((acc, p) => {
      const cat = p.category || 'autre';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name, value }));

  // Status distribution
  const statusCounts = products.reduce((acc, p) => {
    const s = getProductStatus(p.expiration_date);
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const statusData = [
    { name: 'OK', value: statusCounts.ok || 0, color: '#22c55e' },
    { name: 'Bientôt', value: statusCounts.soon || 0, color: '#eab308' },
    { name: 'Urgent', value: statusCounts.urgent || 0, color: '#f97316' },
    { name: 'Expiré', value: statusCounts.expired || 0, color: '#ef4444' },
  ];

  // Clients by products
  const clientProductData = clients
    .map(u => ({
      name: u.shop_name || u.email?.split('@')[0] || 'Client',
      produits: products.filter(p => p.created_by === u.email).length,
      expires: products.filter(p => p.created_by === u.email && getProductStatus(p.expiration_date) === 'expired').length,
    }))
    .filter(c => c.produits > 0)
    .sort((a, b) => b.produits - a.produits)
    .slice(0, 8);

  const totalExpired = statusCounts.expired || 0;
  const totalLoss = products
    .filter(p => getProductStatus(p.expiration_date) === 'expired')
    .reduce((sum, p) => sum + ((p.quantity_thrown || 0) * (p.price_chf || 0)), 0);

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Analytics globales</h1>
          <p className="text-sm text-gray-500 mt-0.5">Vue consolidée de tous les clients</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Total produits', value: products.length },
            { label: 'Produits expirés', value: totalExpired, warning: totalExpired > 0 },
            { label: 'Pertes totales (CHF)', value: totalLoss.toFixed(0), warning: totalLoss > 0 },
            { label: 'Clients actifs', value: clients.filter(u => u.subscription_status === 'active').length },
          ].map(({ label, value, warning }) => (
            <div key={label} className={`bg-white rounded-2xl p-4 shadow-sm border ${warning ? 'border-red-100' : 'border-gray-100'}`}>
              <div className={`text-2xl font-bold ${warning ? 'text-red-600' : 'text-gray-900'}`}>{value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Charts row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">État des produits</h3>
            <div className="flex items-center gap-4">
              <ResponsiveContainer width={150} height={150}>
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" outerRadius={65} dataKey="value" paddingAngle={2}>
                    {statusData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {statusData.map(d => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: d.color }} />
                    <span className="text-sm text-gray-600">{d.name}</span>
                    <span className="text-sm font-bold text-gray-900 ml-auto pl-4">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4">Produits par catégorie</h3>
            <ResponsiveContainer width="100%" height={170}>
              <BarChart data={categoryData} margin={{ top: 0, right: 0, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Client comparison */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-4">Produits par client</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={clientProductData} margin={{ top: 0, right: 0, left: -10, bottom: 20 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-30} textAnchor="end" />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="produits" name="Total" fill="#B9943A" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expires" name="Expirés" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AdminLayout>
  );
}