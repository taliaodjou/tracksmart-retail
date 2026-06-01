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
        // Deduplicate by id, and only keep byCreator products that belong to this store
        // (i.e. no store_owner_email, or store_owner_email matches this store)
        const seen = new Set();
        const storeOwnerProds = byStoreOwner.filter((p) => {
          if (seen.has(p.id)) return false;
          seen.add(p.id);
          return true;
        });
        const creatorProds = byCreator.filter((p) => {
          if (seen.has(p.id)) return false;
          seen.add(p.id);
          // Only include if no store_owner_email (old data) or matches this store
          return !p.store_owner_email || p.store_owner_email === storeOwnerEmail;
        });
        return [...storeOwnerProds, ...creatorProds];
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
    // Snacks
    snack: 'snacks', crisp: 'snacks', chip: 'snacks', biscuit: 'snacks', cracker: 'snacks',
    gâteau: 'snacks', cake: 'snacks', cookie: 'snacks', galette: 'snacks',
    // Boissons
    beverage: 'boissons', drink: 'boissons', water: 'boissons', juice: 'boissons', soda: 'boissons',
    milk: 'boissons', lait: 'boissons', eau: 'boissons', jus: 'boissons', boisson: 'boissons',
    nectar: 'boissons', limonade: 'boissons', sirop: 'boissons', thé: 'boissons', café: 'boissons',
    tea: 'boissons', coffee: 'boissons', infusion: 'boissons',
    // Poisson congelé
    fish: 'congeles_poisson', seafood: 'congeles_poisson', poisson: 'congeles_poisson',
    crevette: 'congeles_poisson', thon: 'congeles_poisson', sardine: 'congeles_poisson',
    // Poulet congelé
    chicken: 'congeles_poulet', poultry: 'congeles_poulet', poulet: 'congeles_poulet',
    volaille: 'congeles_poulet', dinde: 'congeles_poulet',
    // Produits frais
    dairy: 'produits_frais', yogurt: 'produits_frais', cheese: 'produits_frais', fresh: 'produits_frais',
    yaourt: 'produits_frais', fromage: 'produits_frais', beurre: 'produits_frais', butter: 'produits_frais',
    crème: 'produits_frais', cream: 'produits_frais', oeuf: 'produits_frais', egg: 'produits_frais',
    // Épicerie sèche
    pasta: 'epicerie_seche', rice: 'epicerie_seche', flour: 'epicerie_seche', cereal: 'epicerie_seche',
    grain: 'epicerie_seche', riz: 'epicerie_seche', farine: 'epicerie_seche', sucre: 'epicerie_seche',
    sugar: 'epicerie_seche', sel: 'epicerie_seche', huile: 'epicerie_seche', oil: 'epicerie_seche',
    pâte: 'epicerie_seche', semoule: 'epicerie_seche', couscous: 'epicerie_seche', légumineuse: 'epicerie_seche',
    lentille: 'epicerie_seche', haricot: 'epicerie_seche', pois: 'epicerie_seche', épice: 'epicerie_seche',
    spice: 'epicerie_seche', condiment: 'epicerie_seche', sauce: 'epicerie_seche',
    // Confiseries
    candy: 'confiseries', chocolate: 'confiseries', sweet: 'confiseries', confectionery: 'confiseries',
    chocolat: 'confiseries', bonbon: 'confiseries', caramel: 'confiseries', nougat: 'confiseries',
    // Conserves
    canned: 'conserves', tinned: 'conserves', preserve: 'conserves', conserve: 'conserves',
    tomate: 'conserves', confiture: 'conserves', jam: 'conserves', miel: 'conserves', honey: 'conserves',
    // Hygiène / Beauté
    hygiene: 'hygiene_beaute', beauty: 'hygiene_beaute', soap: 'hygiene_beaute', shampoo: 'hygiene_beaute',
    cosmetic: 'hygiene_beaute', savon: 'hygiene_beaute', dentifrice: 'hygiene_beaute', déodorant: 'hygiene_beaute',
    parfum: 'hygiene_beaute', crème: 'hygiene_beaute', lotion: 'hygiene_beaute', rasoir: 'hygiene_beaute',
    // Entretien maison
    cleaning: 'entretien_maison', detergent: 'entretien_maison', household: 'entretien_maison',
    lessive: 'entretien_maison', nettoyant: 'entretien_maison', désinfectant: 'entretien_maison',
    vaisselle: 'entretien_maison', balai: 'entretien_maison',
    // Bébé
    baby: 'bebe', infant: 'bebe', bébé: 'bebe', couche: 'bebe', diaper: 'bebe', biberon: 'bebe',
    // Animaux
    pet: 'animaux', dog: 'animaux', cat: 'animaux', chien: 'animaux', chat: 'animaux',
    // Alcool
    alcohol: 'alcool', wine: 'alcool', beer: 'alcool', spirit: 'alcool',
    bière: 'alcool', vin: 'alcool', whisky: 'alcool', rhum: 'alcool', liqueur: 'alcool',
    // Tabac
    tobacco: 'tabac', cigarette: 'tabac', cigare: 'tabac',
  };

  const matchCategory = (tags = []) => {
    // tags can be an array of strings (OFF format) or a single string split
    const allTags = Array.isArray(tags) ? tags : [tags];
    for (const tag of allTags) {
      const clean = (tag || '').replace(/^[a-z]{2}:/, '').toLowerCase().replace(/[-_]/g, ' ');
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

    // Helper to build prefill and setQuickAdd from an OFF-style product object
    const applyPrefill = (p, defaultCategory = '') => {
      const name = p.product_name_fr || p.product_name || p.generic_name || '';
      const brand = p.brands || '';
      const rawCategory = matchCategory(p.categories_tags || []);
      const category = rawCategory || defaultCategory;
      const existing = findExistingProduct(name, brand);
      setQuickAdd({
        barcode: code,
        prefill: { name, brand, category, image_url: p.image_front_url || p.image_url || '' },
        existingProduct: existing
      });
    };

    // 2. Open Food Facts
    try {
      const foodData = await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`).then(r => r.json());
      if (foodData?.status === 1 && foodData?.product) {
        applyPrefill(foodData.product);
        return;
      }
    } catch (_) {}

    // 3. Open Beauty Facts
    try {
      const beautyData = await fetch(`https://world.openbeautyfacts.org/api/v0/product/${code}.json`).then(r => r.json());
      if (beautyData?.status === 1 && beautyData?.product) {
        applyPrefill(beautyData.product, 'hygiene_beaute');
        return;
      }
    } catch (_) {}

    // 4. Open Products Facts (produits ménagers, Afrique, etc.)
    try {
      const opData = await fetch(`https://world.openproductsfacts.org/api/v0/product/${code}.json`).then(r => r.json());
      if (opData?.status === 1 && opData?.product) {
        applyPrefill(opData.product);
        return;
      }
    } catch (_) {}

    // 5. UPC Item DB (base de données mondiale, bons résultats pour produits africains)
    try {
      const upcData = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${code}`).then(r => r.json());
      if (upcData?.code === 'OK' && upcData?.items?.length > 0) {
        const item = upcData.items[0];
        const name = item.title || '';
        const brand = item.brand || '';
        const category = matchCategory((item.category || '').toLowerCase().split(/[,/]/).map(s => s.trim()));
        const existing = findExistingProduct(name, brand);
        setQuickAdd({
          barcode: code,
          prefill: { name, brand, category, image_url: item.images?.[0] || '' },
          existingProduct: existing
        });
        return;
      }
    } catch (_) {}

    // 6. Not found anywhere — manual entry
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