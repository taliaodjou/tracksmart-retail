import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { isAdmin, getProductStatus } from '@/lib/productUtils';
import AdminLayout from './AdminLayout';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, ArrowRight, Users } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminClients() {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin_users'],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: products = [] } = useQuery({
    queryKey: ['all_products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const clients = users.filter(u => !isAdmin(u));

  const filtered = clients.filter(u => {
    const matchSearch = !search ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.shop_name?.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      filter === 'all' ||
      (filter === 'active' && u.subscription_status === 'active') ||
      (filter === 'inactive' && u.subscription_status !== 'active');
    return matchSearch && matchFilter;
  });

  const getClientStats = (email) => {
    const clientProds = products.filter(p => p.created_by === email);
    const expired = clientProds.filter(p => getProductStatus(p.expiration_date) === 'expired').length;
    return { total: clientProds.length, expired };
  };

  return (
    <AdminLayout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Clients</h1>
            <p className="text-sm text-gray-500 mt-0.5">{clients.length} comptes enregistrés</p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un client..."
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            {[['all', 'Tous'], ['active', 'Actifs'], ['inactive', 'Inactifs']].map(([v, l]) => (
              <button
                key={v}
                onClick={() => setFilter(v)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  filter === v ? 'bg-primary text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-7 h-7 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>Aucun client trouvé</p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="text-left px-5 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Client</th>
                      <th className="text-left px-4 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Plan</th>
                      <th className="text-left px-4 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Statut</th>
                      <th className="text-left px-4 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Produits</th>
                      <th className="text-left px-4 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Expirés</th>
                      <th className="text-left px-4 py-3.5 font-semibold text-gray-600 text-xs uppercase tracking-wider">Créé le</th>
                      <th className="px-4 py-3.5" />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(u => {
                      const stats = getClientStats(u.email);
                      return (
                        <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-primary font-bold text-xs">
                                  {(u.shop_name || u.full_name || u.email)?.charAt(0)?.toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <div className="font-medium text-gray-900">{u.shop_name || u.full_name || '—'}</div>
                                <div className="text-xs text-gray-400">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <Badge variant="outline" className="text-xs capitalize">
                              {u.subscription_plan || 'basic'}
                            </Badge>
                          </td>
                          <td className="px-4 py-4">
                            <Badge className={u.subscription_status === 'active'
                              ? 'bg-green-100 text-green-700 border-0'
                              : 'bg-red-100 text-red-600 border-0'}>
                              {u.subscription_status === 'active' ? 'Actif' : 'Inactif'}
                            </Badge>
                          </td>
                          <td className="px-4 py-4 text-gray-700 font-medium">{stats.total}</td>
                          <td className="px-4 py-4">
                            {stats.expired > 0
                              ? <span className="text-orange-600 font-semibold">{stats.expired}</span>
                              : <span className="text-gray-400">0</span>
                            }
                          </td>
                          <td className="px-4 py-4 text-gray-500 text-xs">
                            {u.created_date ? format(new Date(u.created_date), 'dd/MM/yyyy') : '—'}
                          </td>
                          <td className="px-4 py-4">
                            <Link
                              to={`/admin-portal/clients/${u.id}`}
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                            >
                              Voir <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="sm:hidden divide-y divide-gray-100">
                {filtered.map(u => {
                  const stats = getClientStats(u.email);
                  return (
                    <Link key={u.id} to={`/admin-portal/clients/${u.id}`} className="flex items-center gap-3 px-4 py-4 hover:bg-gray-50">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-bold text-sm">
                          {(u.shop_name || u.full_name || u.email)?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-gray-900 text-sm truncate">{u.shop_name || u.full_name || u.email}</div>
                        <div className="text-xs text-gray-400 truncate">{u.email}</div>
                        <div className="flex gap-2 mt-1">
                          <Badge className={`text-xs ${u.subscription_status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'} border-0`}>
                            {u.subscription_status === 'active' ? 'Actif' : 'Inactif'}
                          </Badge>
                          <span className="text-xs text-gray-400">{stats.total} produits</span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-gray-300" />
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}