import React, { useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/lib/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LayoutList, Layers, Search, X } from 'lucide-react';
import { categoryKeys, rayonKeys, getProductStatus, getStoreOwnerEmail, isAdmin } from '@/lib/productUtils';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import ProductForm from '@/components/dashboard/ProductForm';
import ProductTable from '@/components/dashboard/ProductTable';
import RayonGroupedTable from '@/components/dashboard/RayonGroupedTable';
import DashboardFooter from '@/components/dashboard/DashboardFooter';
import { logActivity } from '@/lib/activityLogger';

export default function Products() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(() => new URLSearchParams(window.location.search).get('status') || 'all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [rayonFilter, setRayonFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [groupByRayon, setGroupByRayon] = useState(true);
  const [editProduct, setEditProduct] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const storeOwnerEmail = getStoreOwnerEmail(user);
  const isOwnerOrManager = user?.role === 'owner' || user?.role === 'user' || user?.role === 'manager' || isAdmin(user);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', storeOwnerEmail, isOwnerOrManager],
    queryFn: async () => {
      if (isOwnerOrManager) {
        const [byStoreOwner, byCreator] = await Promise.all([
          base44.entities.Product.filter({ store_owner_email: storeOwnerEmail }, '-created_date', 2000),
          base44.entities.Product.filter({ created_by: storeOwnerEmail }, '-created_date', 2000)
        ]);
        const seen = new Set();
        return [...byStoreOwner, ...byCreator].filter((product) => {
          if (seen.has(product.id)) return false;
          seen.add(product.id);
          return !product.store_owner_email || product.store_owner_email === storeOwnerEmail;
        });
      }
      return base44.entities.Product.filter({ created_by: user.email }, '-created_date');
    },
    enabled: !!user?.email
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const savedData = data.action === 'jeter'
        ? { ...data, discarded: true, discarded_at: new Date().toISOString().split('T')[0] }
        : data;
      return base44.entities.Product.create({
        ...savedData,
        store_owner_email: storeOwnerEmail,
        added_by_name: user.full_name || user.email
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowForm(false);
      setEditProduct(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const savedData = data.action === 'jeter'
        ? { ...data, discarded: true, discarded_at: new Date().toISOString().split('T')[0] }
        : data;
      return base44.entities.Product.update(id, savedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowForm(false);
      setEditProduct(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (product) => {
      await base44.entities.Product.delete(product.id);
      logActivity(user, 'product_deleted', `${user.full_name || user.email} a supprimé "${product?.name || 'un produit'}"`, {
        entity_id: product.id,
        entity_name: product.name
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] })
  });

  const filteredProducts = useMemo(() => products.filter((product) => {
    if (search && !product.name?.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'all') {
      if (statusFilter === 'archived') {
        if (!product.discarded) return false;
      } else if (product.discarded || getProductStatus(product.expiration_date) !== statusFilter) {
        return false;
      }
    }
    if (categoryFilter !== 'all' && product.category !== categoryFilter) return false;
    if (rayonFilter !== 'all' && product.rayon !== rayonFilter) return false;
    return true;
  }), [products, search, statusFilter, categoryFilter, rayonFilter]);

  const activeFilterCount = [statusFilter !== 'all', categoryFilter !== 'all', rayonFilter !== 'all'].filter(Boolean).length;
  const statusFilters = [
    { key: 'all', label: t('dash_filter_all') },
    { key: 'expired', label: t('dash_filter_expired') },
    { key: 'urgent', label: t('dash_filter_urgent') },
    { key: 'soon', label: t('dash_filter_soon') },
    { key: 'ok', label: t('dash_filter_ok') },
    { key: 'archived', label: 'Archivé' }
  ];

  const handleEdit = (product) => {
    setEditProduct(product);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen pb-20 sm:pb-0 pt-16 sm:pt-20" style={{ backgroundColor: '#f5f3ef', color: '#1a1a1a' }}>
      <DashboardHeader />
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-6 pb-8 space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Produits</h1>
            <p className="text-sm text-muted-foreground mt-1">Liste complète de vos produits en stock</p>
          </div>
          <Button onClick={() => { setEditProduct(null); setShowForm(true); }} className="rounded-full">Ajouter un produit</Button>
        </div>

        {showForm && (
          <ProductForm
            onSave={(data) => editProduct ? updateMutation.mutate({ id: editProduct.id, data }) : createMutation.mutate(data)}
            onCancel={() => { setShowForm(false); setEditProduct(null); }}
            editProduct={editProduct}
          />
        )}

        <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-border/40 space-y-3">
          <div className="flex gap-2 items-center">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('dash_search')} className="pl-9 rounded-full h-9 text-xs" />
            </div>
            <Button variant="outline" size="sm" className={`rounded-full whitespace-nowrap gap-1.5 ${activeFilterCount > 0 ? 'border-primary text-primary' : ''}`} onClick={() => setShowFilters((value) => !value)}>
              {t('filter_label')} {activeFilterCount > 0 && <span className="bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center text-xs">{activeFilterCount}</span>}
            </Button>
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground" onClick={() => { setStatusFilter('all'); setCategoryFilter('all'); setRayonFilter('all'); }}>
                <X className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
          {showFilters && (
            <div className="space-y-3 pt-2 border-t border-border/30">
              <div className="flex flex-wrap gap-1.5">
                {statusFilters.map((filter) => (
                  <button key={filter.key} onClick={() => setStatusFilter(filter.key)} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${statusFilter === filter.key ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}>
                    {filter.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2 flex-wrap">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-44 rounded-full text-xs h-9"><SelectValue placeholder={t('dash_filter_category')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('all')} — {t('dash_filter_category')}</SelectItem>
                    {Object.entries(categoryKeys).map(([value, key]) => <SelectItem key={value} value={value}>{t(key)}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={rayonFilter} onValueChange={setRayonFilter}>
                  <SelectTrigger className="w-36 rounded-full text-xs h-9"><SelectValue placeholder={t('dash_filter_rayon')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('all')} — {t('dash_filter_rayon')}</SelectItem>
                    {Object.keys(rayonKeys).map((rayon) => <SelectItem key={rayon} value={rayon}>Rayon {rayon}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-2">
          <button onClick={() => setGroupByRayon(false)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${!groupByRayon ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground bg-white hover:border-primary/50'}`}>
            <LayoutList className="w-3.5 h-3.5" /> Liste
          </button>
          <button onClick={() => setGroupByRayon(true)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${groupByRayon ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground bg-white hover:border-primary/50'}`}>
            <Layers className="w-3.5 h-3.5" /> Par rayon
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
        ) : groupByRayon ? (
          <RayonGroupedTable products={filteredProducts} totalProducts={products} onEdit={handleEdit} onDelete={(product) => { if (window.confirm(t('confirm_delete'))) deleteMutation.mutate(product); }} onInlineSave={(id, data) => updateMutation.mutate({ id, data })} />
        ) : (
          <ProductTable products={filteredProducts} totalProducts={products} onEdit={handleEdit} onDelete={(product) => { if (window.confirm(t('confirm_delete'))) deleteMutation.mutate(product); }} onInlineSave={(id, data) => updateMutation.mutate({ id, data })} />
        )}
      </main>
      <DashboardFooter />
    </div>
  );
}