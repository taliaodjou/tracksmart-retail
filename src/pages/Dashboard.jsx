import React, { useState, useMemo, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/lib/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, FileSpreadsheet } from 'lucide-react';
import { getProductStatus, hasActiveSubscription, categoryKeys, rayonKeys } from '@/lib/productUtils';
import { checkAndSendReminders, checkAndSendWeeklyReport } from '@/lib/schedulerUtils';

import DashboardHeader from '@/components/dashboard/DashboardHeader';
import SubscriptionGate from '@/components/dashboard/SubscriptionGate';
import StatsCards from '@/components/dashboard/StatsCards';
import WeeklyAlert from '@/components/dashboard/WeeklyAlert';
import ProductForm from '@/components/dashboard/ProductForm';
import ProductTable from '@/components/dashboard/ProductTable';
import ExportActions from '@/components/dashboard/ExportActions';
import ImportModal from '@/components/dashboard/ImportModal';
import OnboardingModal from '@/components/dashboard/OnboardingModal';
import DashboardFooter from '@/components/dashboard/DashboardFooter';

export default function Dashboard() {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [rayonFilter, setRayonFilter] = useState('all');

  const canAccess = hasActiveSubscription(user);
  const needsOnboarding = canAccess && user && !user.onboarding_complete;
  const [onboardingDone, setOnboardingDone] = useState(false);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list('-created_date'),
    enabled: canAccess,
  });

  // Run scheduler checks once on load
  useEffect(() => {
    if (user && canAccess && products.length >= 0) {
      checkAndSendReminders(user, products);
      checkAndSendWeeklyReport(user, products);
    }
  }, [user, products.length]);

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Product.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['products'] }); setShowForm(false); setEditProduct(null); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Product.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['products'] }); setShowForm(false); setEditProduct(null); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Product.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });

  const handleSave = (data) => {
    if (editProduct) updateMutation.mutate({ id: editProduct.id, data });
    else createMutation.mutate(data);
  };

  const handleEdit = (product) => { setEditProduct(product); setShowForm(true); };
  const handleDelete = (product) => {
    if (window.confirm(t('confirm_delete'))) deleteMutation.mutate(product.id);
  };

  const filteredProducts = useMemo(() => products.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'all' && getProductStatus(p.expiration_date) !== statusFilter) return false;
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    if (rayonFilter !== 'all' && p.rayon !== rayonFilter) return false;
    return true;
  }), [products, search, statusFilter, categoryFilter, rayonFilter]);

  if (!canAccess) {
    return (
      <div className="min-h-screen bg-secondary/30">
        <DashboardHeader />
        <SubscriptionGate />
      </div>
    );
  }

  const statusFilters = [
    { key: 'all', label: t('dash_filter_all') },
    { key: 'expired', label: t('dash_filter_expired') },
    { key: 'urgent', label: t('dash_filter_urgent') },
    { key: 'soon', label: t('dash_filter_soon') },
    { key: 'ok', label: t('dash_filter_ok') },
  ];

  return (
    <div className="min-h-screen bg-secondary/30">
      {needsOnboarding && !onboardingDone && (
        <OnboardingModal user={user} onComplete={() => setOnboardingDone(true)} />
      )}
      <DashboardHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('dash_title')}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <ExportActions products={filteredProducts} />
            <Button variant="outline" onClick={() => setShowImport(true)} className="rounded-full gap-2">
              <FileSpreadsheet className="w-4 h-4" />
              {lang === 'fr' ? 'Importer Excel' : 'Import Excel'}
            </Button>
            <Button onClick={() => { setEditProduct(null); setShowForm(true); }} className="rounded-full gap-2">
              <Plus className="w-4 h-4" />
              {t('dash_add_product')}
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : (
          <div className="space-y-6">
            <StatsCards products={products} />
            <WeeklyAlert products={products} />

            {showForm && (
              <ProductForm
                onSave={handleSave}
                onCancel={() => { setShowForm(false); setEditProduct(null); }}
                editProduct={editProduct}
              />
            )}

            {/* Filters */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-border/40 space-y-3">
              <div className="relative max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('dash_search')} className="pl-9 rounded-full" />
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1 flex-wrap">
                  {statusFilters.map(f => (
                    <Button key={f.key} variant={statusFilter === f.key ? 'default' : 'outline'} size="sm" className="rounded-full text-xs" onClick={() => setStatusFilter(f.key)}>
                      {f.label}
                    </Button>
                  ))}
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-44 rounded-full text-xs h-8"><SelectValue placeholder={t('dash_filter_category')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('all')} — {t('dash_filter_category')}</SelectItem>
                    {Object.entries(categoryKeys).map(([v, k]) => <SelectItem key={v} value={v}>{t(k)}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Select value={rayonFilter} onValueChange={setRayonFilter}>
                  <SelectTrigger className="w-36 rounded-full text-xs h-8"><SelectValue placeholder={t('dash_filter_rayon')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{t('all')} — {t('dash_filter_rayon')}</SelectItem>
                    {Object.keys(rayonKeys).map(r => <SelectItem key={r} value={r}>Rayon {r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <ProductTable products={filteredProducts} onEdit={handleEdit} onDelete={handleDelete} />
          </div>
        )}
      </main>

      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          onImported={() => { queryClient.invalidateQueries({ queryKey: ['products'] }); setShowImport(false); }}
        />
      )}
      <DashboardFooter />
    </div>
  );
}