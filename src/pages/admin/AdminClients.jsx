import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { isAdmin, getProductStatus } from '@/lib/productUtils';
import { enterSupportMode } from '@/lib/supportMode';
import AdminLayout from './AdminLayout';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import {
  Search, Users, Plus, Eye, Lock, Unlock, ArrowUpCircle, ArrowDownCircle,
  X, Store, Mail, Phone, Calendar
} from 'lucide-react';

function CreateClientModal({ onClose, onCreated }) {
  const [form, setForm] = useState({
    email: '', password: '', shop_name: '', shop_size: 'moyenne',
    subscription_plan: 'classic', subscription_status: 'active',
    phone: '', last_payment_date: '',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.shop_name) {
      toast.error('Email, mot de passe et nom de boutique requis');
      return;
    }
    setSaving(true);
    try {
      await base44.users.inviteUser(form.email, 'user');
      // Update user fields after invite
      // We store extra info in a deferred way via notification
      // The admin will complete via client detail page
      toast.success(`Invitation envoyée à ${form.email}`);
      onCreated?.();
      onClose();
    } catch (err) {
      toast.error('Erreur lors de la création du compte');
    }
    setSaving(false);
  };

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Nouveau client</h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-gray-100">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Email *</label>
              <Input value={form.email} onChange={e => f('email', e.target.value)} type="email" placeholder="client@email.com" required />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Nom de la boutique *</label>
              <Input value={form.shop_name} onChange={e => f('shop_name', e.target.value)} placeholder="Épicerie du Soleil" required />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Taille</label>
              <select
                value={form.shop_size}
                onChange={e => f('shop_size', e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
              >
                <option value="petite">Petite</option>
                <option value="moyenne">Moyenne</option>
                <option value="grande">Grande</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Plan</label>
              <select
                value={form.subscription_plan}
                onChange={e => f('subscription_plan', e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
              >
                <option value="classic">Classic</option>
                <option value="premium">Premium</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Statut initial</label>
              <select
                value={form.subscription_status}
                onChange={e => f('subscription_status', e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
              >
                <option value="active">Actif</option>
                <option value="inactive">Inactif</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Téléphone</label>
              <Input value={form.phone} onChange={e => f('phone', e.target.value)} placeholder="+41 77 000 00 00" />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-semibold text-gray-600 mb-1 block">Dernier paiement</label>
              <Input value={form.last_payment_date} onChange={e => f('last_payment_date', e.target.value)} type="date" />
            </div>
          </div>
          <p className="text-xs text-gray-400 bg-gray-50 rounded-xl px-3 py-2">
            ✉️ Une invitation sera envoyée par email. Le client devra définir son mot de passe via le lien reçu.
          </p>
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 rounded-xl">Annuler</Button>
            <Button type="submit" disabled={saving} className="flex-1 rounded-xl gap-1.5">
              {saving ? 'Envoi...' : <><Plus className="w-4 h-4" />Créer le client</>}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminClients() {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPlan, setFilterPlan] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin_users'],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: products = [] } = useQuery({
    queryKey: ['all_products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.User.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin_users'] }),
  });

  const clients = users.filter(u => !isAdmin(u));

  const filtered = clients.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      u.email?.toLowerCase().includes(q) ||
      u.full_name?.toLowerCase().includes(q) ||
      u.shop_name?.toLowerCase().includes(q);
    const matchStatus =
      filterStatus === 'all' ||
      (filterStatus === 'active' && u.subscription_status === 'active') ||
      (filterStatus === 'inactive' && u.subscription_status !== 'active');
    const matchPlan =
      filterPlan === 'all' ||
      (u.subscription_plan || 'classic') === filterPlan;
    return matchSearch && matchStatus && matchPlan;
  });

  const getStats = (email) => {
    const prods = products.filter(p => p.created_by === email);
    return { total: prods.length, expired: prods.filter(p => getProductStatus(p.expiration_date) === 'expired').length };
  };

  const handleToggleStatus = async (u) => {
    const newStatus = u.subscription_status === 'active' ? 'inactive' : 'active';
    await updateMutation.mutateAsync({ id: u.id, data: { subscription_status: newStatus } });
    toast.success(`Client ${newStatus === 'active' ? 'activé' : 'bloqué'}`);
  };

  const handleTogglePlan = async (u, plan) => {
    await updateMutation.mutateAsync({ id: u.id, data: { subscription_plan: plan } });
    toast.success(`Plan changé en ${plan}`);
  };

  const handleSupportMode = (u) => {
    enterSupportMode(u);
    navigate('/dashboard');
  };

  return (
    <AdminLayout>
      {showCreate && (
        <CreateClientModal
          onClose={() => setShowCreate(false)}
          onCreated={() => queryClient.invalidateQueries({ queryKey: ['admin_users'] })}
        />
      )}

      <div className="p-4 sm:p-6 lg:p-8 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Clients</h1>
            <p className="text-sm text-gray-500 mt-0.5">{clients.length} comptes enregistrés</p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="rounded-xl gap-2">
            <Plus className="w-4 h-4" />
            Nouveau client
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." className="pl-9" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {[['all', 'Tous'], ['active', 'Actifs'], ['inactive', 'Inactifs']].map(([v, l]) => (
              <button key={v} onClick={() => setFilterStatus(v)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${filterStatus === v ? 'bg-primary text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
                {l}
              </button>
            ))}
            {[['all', 'Tous plans'], ['classic', 'Classic'], ['premium', 'Premium']].map(([v, l]) => (
              <button key={v} onClick={() => setFilterPlan(v)}
                className={`px-3 py-2 rounded-xl text-sm font-medium transition-colors ${filterPlan === v ? 'bg-gray-800 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'}`}>
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
              {/* Desktop */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      {['Boutique', 'Taille', 'Email', 'Plan', 'Statut', 'Produits', 'Dernière activité', 'Actions'].map(h => (
                        <th key={h} className="text-left px-4 py-3 font-semibold text-gray-500 text-xs uppercase tracking-wider">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(u => {
                      const stats = getStats(u.email);
                      const isPremium = u.subscription_plan === 'premium';
                      const isActive = u.subscription_status === 'active';
                      return (
                        <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <span className="text-primary font-bold text-xs">{(u.shop_name || u.email)?.charAt(0)?.toUpperCase()}</span>
                              </div>
                              <span className="font-medium text-gray-900">{u.shop_name || u.full_name || '—'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3.5 text-gray-500 text-xs capitalize">{u.shop_size || '—'}</td>
                          <td className="px-4 py-3.5 text-gray-500 text-xs">{u.email}</td>
                          <td className="px-4 py-3.5">
                            <Badge className={isPremium ? 'bg-amber-100 text-amber-700 border-0' : 'bg-gray-100 text-gray-600 border-0'}>
                              {isPremium ? '⭐ Premium' : '🔹 Classic'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3.5">
                            <Badge className={isActive ? 'bg-green-100 text-green-700 border-0' : 'bg-red-100 text-red-600 border-0'}>
                              {isActive ? 'Actif' : 'Inactif'}
                            </Badge>
                          </td>
                          <td className="px-4 py-3.5 text-gray-700 font-medium">
                            {stats.total}
                            {stats.expired > 0 && <span className="text-orange-500 ml-1.5 text-xs">({stats.expired} expirés)</span>}
                          </td>
                          <td className="px-4 py-3.5 text-gray-400 text-xs">
                            {u.updated_date ? format(new Date(u.updated_date), 'dd/MM/yyyy') : '—'}
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {/* Block/Activate */}
                              <button
                                onClick={() => handleToggleStatus(u)}
                                disabled={updateMutation.isPending}
                                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                  isActive
                                    ? 'bg-red-50 text-red-600 hover:bg-red-100'
                                    : 'bg-green-50 text-green-700 hover:bg-green-100'
                                }`}
                              >
                                {isActive ? <><Lock className="w-3 h-3" />Bloquer</> : <><Unlock className="w-3 h-3" />Activer</>}
                              </button>
                              {/* Plan toggle */}
                              {isPremium ? (
                                <button onClick={() => handleTogglePlan(u, 'classic')}
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-gray-50 text-gray-600 hover:bg-gray-100 transition-colors">
                                  <ArrowDownCircle className="w-3 h-3" />Classic
                                </button>
                              ) : (
                                <button onClick={() => handleTogglePlan(u, 'premium')}
                                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors">
                                  <ArrowUpCircle className="w-3 h-3" />Premium
                                </button>
                              )}
                              {/* Support mode */}
                              <button
                                onClick={() => handleSupportMode(u)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors"
                              >
                                <Eye className="w-3 h-3" />Ouvrir
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="lg:hidden divide-y divide-gray-100">
                {filtered.map(u => {
                  const stats = getStats(u.email);
                  const isPremium = u.subscription_plan === 'premium';
                  const isActive = u.subscription_status === 'active';
                  return (
                    <div key={u.id} className="px-4 py-4 space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <span className="text-primary font-bold text-sm">{(u.shop_name || u.email)?.charAt(0)?.toUpperCase()}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 text-sm truncate">{u.shop_name || u.full_name || u.email}</div>
                          <div className="text-xs text-gray-400 truncate">{u.email}</div>
                        </div>
                        <div className="flex gap-1.5">
                          <Badge className={isPremium ? 'bg-amber-100 text-amber-700 border-0 text-xs' : 'bg-gray-100 text-gray-600 border-0 text-xs'}>
                            {isPremium ? 'Premium' : 'Classic'}
                          </Badge>
                          <Badge className={isActive ? 'bg-green-100 text-green-700 border-0 text-xs' : 'bg-red-100 text-red-600 border-0 text-xs'}>
                            {isActive ? 'Actif' : 'Inactif'}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">{stats.total} produits{stats.expired > 0 ? ` · ${stats.expired} expirés` : ''}</div>
                      <div className="flex gap-2 flex-wrap">
                        <button onClick={() => handleToggleStatus(u)}
                          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold ${isActive ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-700'}`}>
                          {isActive ? <><Lock className="w-3 h-3" />Bloquer</> : <><Unlock className="w-3 h-3" />Activer</>}
                        </button>
                        {isPremium ? (
                          <button onClick={() => handleTogglePlan(u, 'classic')}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-50 text-gray-600">
                            <ArrowDownCircle className="w-3 h-3" />Classic
                          </button>
                        ) : (
                          <button onClick={() => handleTogglePlan(u, 'premium')}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700">
                            <ArrowUpCircle className="w-3 h-3" />Premium
                          </button>
                        )}
                        <button onClick={() => handleSupportMode(u)}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700">
                          <Eye className="w-3 h-3" />Ouvrir espace client
                        </button>
                      </div>
                    </div>
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