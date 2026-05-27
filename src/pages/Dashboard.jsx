import React, { useState, useMemo, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/lib/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, ScanLine, X, LayoutList, Layers } from 'lucide-react';

const XlsIcon = () =>
<span className="text-[10px] font-bold hidden">XLS</span>;

import { getProductStatus, hasActiveSubscription, categoryKeys, rayonKeys, getStoreOwnerEmail } from '@/lib/productUtils';
import { checkAndSendReminders, checkAndSendWeeklyReport } from '@/lib/schedulerUtils';
import { logActivity } from '@/lib/activityLogger';

import DashboardHeader from '@/components/dashboard/DashboardHeader';
import SubscriptionGate from '@/components/dashboard/SubscriptionGate';
import StatsCards from '@/components/dashboard/StatsCards';
import WeeklyAlert from '@/components/dashboard/WeeklyAlert';
import ProductForm from '@/components/dashboard/ProductForm';
import ProductTable from '@/components/dashboard/ProductTable';
import RayonGroupedTable from '@/components/dashboard/RayonGroupedTable';
import ExportActions from '@/components/dashboard/ExportActions';
import ImportModal from '@/components/dashboard/ImportModal';
import OnboardingModal from '@/components/dashboard/OnboardingModal';
import DashboardFooter from '@/components/dashboard/DashboardFooter';
import BarcodeScanner from '@/components/dashboard/BarcodeScanner';
import QuickAddModal from '@/components/dashboard/QuickAddModal';

export default function Dashboard() {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [quickAdd, setQuickAdd] = useState(null); // { barcode, prefill }
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [rayonFilter, setRayonFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [groupByRayon, setGroupByRayon] = useState(true);

  const canAccess = hasActiveSubscription(user);
  const needsOnboarding = canAccess && user && !user.onboarding_complete;
  const [onboardingDone, setOnboardingDone] = useState(false);

  // For store owners: see ALL products (created by any team member)
  // For team members: only their own products (or later expanded if owner grants)
  const storeOwnerEmail = getStoreOwnerEmail(user);
  const isOwnerOrManager = user?.role === 'owner' || user?.role === 'user' || user?.role === 'manager';

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', storeOwnerEmail, isOwnerOrManager],
    queryFn: async () => {
      if (isOwnerOrManager) {
        // Fetch products scoped to this store (by store_owner_email OR created_by)
        // Two separate queries merged to handle both products with and without store_owner_email
        const [byStoreOwner, byCreator] = await Promise.all([
        base44.entities.Product.filter({ store_owner_email: storeOwnerEmail }, '-created_date', 2000),
        base44.entities.Product.filter({ created_by: storeOwnerEmail }, '-created_date', 2000)]
        );
        // Deduplicate by id
        const seen = new Set();
        return [...byStoreOwner, ...byCreator].filter((p) => {
          if (seen.has(p.id)) return false;
          seen.add(p.id);
          return true;
        });
      }
      // Employees only see their own products
      return base44.entities.Product.filter({ created_by: user.email }, '-created_date');
    },
    enabled: canAccess && !!user?.email
  });

  // Barcode DB — loaded once, used for local lookup
  const { data: barcodeDB = [] } = useQuery({
    queryKey: ['barcodes'],
    queryFn: () => base44.entities.BarcodeProduct.list('barcode', 1000),
    enabled: canAccess
  });

  useEffect(() => {
    if (user && canAccess && products.length >= 0) {
      checkAndSendReminders(user, products);
      checkAndSendWeeklyReport(user, products);
    }
  }, [user, products.length]);

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const product = await base44.entities.Product.create({
        ...data,
        store_owner_email: storeOwnerEmail,
        added_by_name: user.full_name || user.email
      });
      logActivity(user, 'product_added', `${user.full_name || user.email} a ajouté le produit "${data.name}"`, {
        entity_id: product.id,
        entity_name: data.name
      });
      return product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowForm(false);
      setEditProduct(null);
      setQuickAdd(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const product = await base44.entities.Product.update(id, data);
      const actionType = data.action === 'jeter' ? 'product_thrown' :
      data.action ? 'product_status_changed' :
      'product_edited';
      logActivity(user, actionType, `${user.full_name || user.email} a modifié "${data.name || 'un produit'}"`, {
        entity_id: id,
        entity_name: data.name
      });
      return product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      setShowForm(false);
      setEditProduct(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const prod = products.find((p) => p.id === id);
      await base44.entities.Product.delete(id);
      logActivity(user, 'product_deleted', `${user.full_name || user.email} a supprimé "${prod?.name || 'un produit'}"`, {
        entity_id: id,
        entity_name: prod?.name
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] })
  });

  const handleSave = (data) => {
    if (editProduct) updateMutation.mutate({ id: editProduct.id, data });else
    createMutation.mutate(data);
  };

  const handleEdit = (product) => {setEditProduct(product);setShowForm(true);};
  const handleDelete = (product) => {
    if (window.confirm(t('confirm_delete'))) deleteMutation.mutate(product.id);
  };

  // ── Category mapping from Open Food Facts tags ───────────
  const OFF_CATEGORY_MAP = {
    snack: 'snacks', crisp: 'snacks', chip: 'snacks', biscuit: 'snacks', cracker: 'snacks',
    beverage: 'boissons', drink: 'boissons', water: 'boissons', juice: 'boissons', soda: 'boissons', milk: 'boissons',
    fish: 'congeles_poisson', seafood: 'congeles_poisson',
    chicken: 'congeles_poulet', poultry: 'congeles_poulet',
    dairy: 'produits_frais', yogurt: 'produits_frais', cheese: 'produits_frais', fresh: 'produits_frais',
    pasta: 'epicerie_seche', rice: 'epicerie_seche', flour: 'epicerie_seche', cereal: 'epicerie_seche', grain: 'epicerie_seche',
    candy: 'confiseries', chocolate: 'confiseries', sweet: 'confiseries', confectionery: 'confiseries',
    canned: 'conserves', tinned: 'conserves', preserve: 'conserves',
    hygiene: 'hygiene_beaute', beauty: 'hygiene_beaute', soap: 'hygiene_beaute', shampoo: 'hygiene_beaute', cosmetic: 'hygiene_beaute',
    cleaning: 'entretien_maison', detergent: 'entretien_maison', household: 'entretien_maison',
    baby: 'bebe', infant: 'bebe',
    pet: 'animaux', dog: 'animaux', cat: 'animaux',
    alcohol: 'alcool', wine: 'alcool', beer: 'alcool', spirit: 'alcool',
    tobacco: 'tabac', cigarette: 'tabac'
  };

  const matchCategory = (tags = []) => {
    for (const tag of tags) {
      const clean = tag.replace(/^[a-z]{2}:/, '').toLowerCase().replace(/-/g, ' ');
      for (const [keyword, cat] of Object.entries(OFF_CATEGORY_MAP)) {
        if (clean.includes(keyword)) return cat;
      }
    }
    return '';
  };

  // ── Find duplicate by name + brand ──────────────────────
  const findExistingProduct = (name, brand) => {
    if (!name) return null;
    const normalize = (s) => (s || '').toLowerCase().trim();
    return products.find((p) =>
    normalize(p.name) === normalize(name) &&
    normalize(p.marque) === normalize(brand)
    ) || null;
  };

  // ── Barcode scan flow ────────────────────────────────────
  const handleBarcodeDetected = async (code) => {
    setShowScanner(false);
    logActivity(user, 'barcode_scanned', `${user.full_name || user.email} a scanné le code-barres ${code}`, {
      entity_name: code
    });

    // 1. Search local DB first
    const match = barcodeDB.find((b) => b.barcode === code);
    if (match) {
      const existing = findExistingProduct(match.name, match.brand || match.marque);
      setQuickAdd({ barcode: code, prefill: match, existingProduct: existing });
      return;
    }

    // 2. Try Open Food Facts + Open Beauty Facts in parallel
    try {
      const [foodRes, beautyRes] = await Promise.allSettled([
      fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`).then((r) => r.json()),
      fetch(`https://world.openbeautyfacts.org/api/v0/product/${code}.json`).then((r) => r.json())]
      );

      // Check Food Facts first
      if (foodRes.status === 'fulfilled' && foodRes.value?.status === 1 && foodRes.value?.product) {
        const p = foodRes.value.product;
        const category = matchCategory(p.categories_tags || []);
        const name = p.product_name_fr || p.product_name || p.generic_name || '';
        const brand = p.brands || '';
        const existing = findExistingProduct(name, brand);
        setQuickAdd({
          barcode: code,
          prefill: { name, brand, category, image_url: p.image_front_url || p.image_url || '' },
          existingProduct: existing
        });
        return;
      }

      // Then check Beauty Facts (cosmétiques, huiles, soins...)
      if (beautyRes.status === 'fulfilled' && beautyRes.value?.status === 1 && beautyRes.value?.product) {
        const p = beautyRes.value.product;
        const name = p.product_name_fr || p.product_name || p.generic_name || '';
        const brand = p.brands || '';
        // Beauty products → hygiene_beaute by default, refine with tags
        const rawCategory = matchCategory(p.categories_tags || []);
        const category = rawCategory || 'hygiene_beaute';
        const existing = findExistingProduct(name, brand);
        setQuickAdd({
          barcode: code,
          prefill: { name, brand, category, image_url: p.image_front_url || p.image_url || '' },
          existingProduct: existing
        });
        return;
      }
    } catch (_) {}

    // 3. Not found — manual entry (null prefill → QuickAddModal shows manual form)
    setQuickAdd({ barcode: code, prefill: null, existingProduct: null });
  };

  const filteredProducts = useMemo(() => products.filter((p) => {
    if (search && !p.name?.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'all' && getProductStatus(p.expiration_date) !== statusFilter) return false;
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    if (rayonFilter !== 'all' && p.rayon !== rayonFilter) return false;
    return true;
  }), [products, search, statusFilter, categoryFilter, rayonFilter]);

  const activeFilterCount = [
  statusFilter !== 'all',
  categoryFilter !== 'all',
  rayonFilter !== 'all'].
  filter(Boolean).length;

  if (!canAccess) {
    return (
      <div className="min-h-screen bg-secondary/30">
        <DashboardHeader />
        <SubscriptionGate />
      </div>);

  }

  const statusFilters = [
  { key: 'all', label: t('dash_filter_all') },
  { key: 'expired', label: t('dash_filter_expired') },
  { key: 'urgent', label: t('dash_filter_urgent') },
  { key: 'soon', label: t('dash_filter_soon') },
  { key: 'ok', label: t('dash_filter_ok') }];


  return (
    <div className="min-h-screen pb-20 sm:pb-0 pt-16 sm:pt-20" style={{ backgroundColor: '#f5f5f5', color: '#1a1a1a' }}>
      {needsOnboarding && !onboardingDone &&
      <OnboardingModal user={user} onComplete={() => setOnboardingDone(true)} />
      }
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-6 pb-6 sm:pt-10 sm:pb-8">

        {/* Desktop header */}
        <div className="hidden sm:flex items-start sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('dash_title')}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <ExportActions products={filteredProducts} />
            <Button variant="outline" onClick={() => setShowImport(true)} className="rounded-full gap-2">
              <XlsIcon />
              {lang === 'fr' ? 'Importer' : 'Import'}
            </Button>
            <Button variant="outline" onClick={() => setShowScanner(true)} className="rounded-full gap-2">
              <ScanLine className="w-4 h-4" />
              {t('btn_scanner')}
            </Button>
            <Button onClick={() => {setEditProduct(null);setShowForm(true);}} className="rounded-full gap-2">
              <Plus className="w-4 h-4" />
              {t('dash_add_product')}
            </Button>
          </div>
        </div>

        {/* Mobile header */}
        <div className="sm:hidden flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-foreground">{t('dash_title')}</h1>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowImport(true)} className="rounded-full h-9 px-3 gap-1.5 text-xs">
              <XlsIcon />
              <span>Importer</span>
            </Button>
            <Button size="sm" onClick={() => {setEditProduct(null);setShowForm(true);}} className="rounded-full h-9 px-4 gap-1.5 text-xs font-semibold">
              <Plus className="w-3.5 h-3.5" /> Ajouter un produit
            </Button>
          </div>
        </div>

        {isLoading ?
        <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div> :

        <div className="space-y-4 sm:space-y-6">
            <StatsCards products={products} />

            {showForm &&
          <ProductForm
            onSave={handleSave}
            onCancel={() => {setShowForm(false);setEditProduct(null);}}
            editProduct={editProduct} />

          }

            <WeeklyAlert products={products} onUpdate={(id, data) => updateMutation.mutate({ id, data })} />

            {/* Filters */}
            <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border border-border/40 space-y-3">
              <div className="flex gap-2 items-center">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t('dash_search')}
                  className="pl-9 rounded-full h-9 text-xs" />
                
                </div>
                <Button
                variant="outline"
                size="sm"
                className={`rounded-full whitespace-nowrap gap-1.5 ${activeFilterCount > 0 ? 'border-primary text-primary' : ''}`}
                onClick={() => setShowFilters((f) => !f)}>
                
                  {t('filter_label')} {activeFilterCount > 0 && <span className="bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center text-xs">{activeFilterCount}</span>}
                </Button>
                {activeFilterCount > 0 &&
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full text-muted-foreground"
                onClick={() => {setStatusFilter('all');setCategoryFilter('all');setRayonFilter('all');}}>
                
                    <X className="w-3.5 h-3.5" />
                  </Button>
              }
              </div>

              {/* Filter panel */}
              {showFilters &&
            <div className="space-y-3 pt-2 border-t border-border/30">
                  {/* Status filter pills */}
                  <div className="flex flex-wrap gap-1.5">
                    {statusFilters.map((f) =>
                <button
                  key={f.key}
                  onClick={() => setStatusFilter(f.key)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                  statusFilter === f.key ?
                  'bg-primary text-primary-foreground border-primary' :
                  'border-border text-muted-foreground hover:border-primary/50'}`
                  }>
                  
                        {f.label}
                      </button>
                )}
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-44 rounded-full text-xs h-9">
                        <SelectValue placeholder={t('dash_filter_category')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('all')} — {t('dash_filter_category')}</SelectItem>
                        {Object.entries(categoryKeys).map(([v, k]) => <SelectItem key={v} value={v}>{t(k)}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Select value={rayonFilter} onValueChange={setRayonFilter}>
                      <SelectTrigger className="w-36 rounded-full text-xs h-9">
                        <SelectValue placeholder={t('dash_filter_rayon')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{t('all')} — {t('dash_filter_rayon')}</SelectItem>
                        {Object.keys(rayonKeys).map((r) => <SelectItem key={r} value={r}>Rayon {r}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
            }
            </div>

            {/* View toggle */}
            <div className="flex items-center justify-end gap-2">
              <button
              onClick={() => setGroupByRayon(false)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${!groupByRayon ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}>
              
                <LayoutList className="w-3.5 h-3.5" /> Liste
              </button>
              <button
              onClick={() => setGroupByRayon(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${groupByRayon ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}>
              
                <Layers className="w-3.5 h-3.5" /> Par rayon
              </button>
            </div>

            {groupByRayon ?
          <RayonGroupedTable
            products={filteredProducts}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onInlineSave={(id, data) => updateMutation.mutate({ id, data })} /> :


          <ProductTable
            products={filteredProducts}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onInlineSave={(id, data) => updateMutation.mutate({ id, data })} />

          }
          </div>
        }
      </main>



      {/* Modals */}
      {showImport &&
      <ImportModal
        onClose={() => setShowImport(false)}
        onImported={(count) => {
          queryClient.invalidateQueries({ queryKey: ['products'] });
          logActivity(user, 'excel_imported', `${user.full_name || user.email} a importé un fichier Excel${count ? ` (${count} produits)` : ''}`);
        }} />

      }

      {showScanner &&
      <BarcodeScanner
        lang={lang}
        onDetected={handleBarcodeDetected}
        onClose={() => setShowScanner(false)} />

      }

      {quickAdd &&
      <QuickAddModal
        barcode={quickAdd.barcode}
        prefill={quickAdd.prefill}
        existingProduct={quickAdd.existingProduct}
        onSave={(data) => createMutation.mutate(data)}
        onUpdate={(id, data) => updateMutation.mutate({ id, data })}
        onClose={() => setQuickAdd(null)}
        saving={createMutation.isPending || updateMutation.isPending} />

      }

      <DashboardFooter />
    </div>);

}