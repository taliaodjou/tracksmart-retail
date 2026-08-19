import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/lib/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, X, LayoutList, Layers } from 'lucide-react';

import { getProductStatus, hasActiveSubscription, categoryKeys, getStoreOwnerEmail, isDiscarded } from '@/lib/productUtils';
import { checkAndSendReminders, checkAndSendWeeklyReport } from '@/lib/schedulerUtils';
import { logActivity } from '@/lib/activityLogger';
import { addStockEntry, applyManualStockMovement, applyPeriodicStockCount, enrichProductsWithStock } from '@/lib/stockEntries';

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
import CockpitOverview from '@/components/dashboard/CockpitOverview';
import InventoryCountModal from '@/components/dashboard/InventoryCountModal';
import BarcodeScanner from '@/components/dashboard/BarcodeScanner';
import QuickAddModal from '@/components/dashboard/QuickAddModal';
import AddProductOptionsModal from '@/components/dashboard/AddProductOptionsModal';
import ManualProductSearchModal from '@/components/dashboard/ManualProductSearchModal';

export default function Dashboard() {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [showInventoryCount, setShowInventoryCount] = useState(false);
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [showManualSearch, setShowManualSearch] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [manualInitialProduct, setManualInitialProduct] = useState(null);
  const [quickAdd, setQuickAdd] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [rayonFilter, setRayonFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [groupByRayon, setGroupByRayon] = useState(true);

  const navigate = useNavigate();
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

  const { data: barcodeDB = [] } = useQuery({
    queryKey: ['barcodes'],
    queryFn: () => base44.entities.BarcodeProduct.list('barcode', 1000),
    enabled: canAccess && !!user?.email
  });

  const { data: stockEntries = [] } = useQuery({
    queryKey: ['stockEntries', storeOwnerEmail],
    queryFn: () => base44.entities.Batch.filter({ store_owner_email: storeOwnerEmail }, 'expiration_date', 5000),
    enabled: canAccess && !!storeOwnerEmail
  });

  const { data: stockMovements = [] } = useQuery({
    queryKey: ['stockMovements', storeOwnerEmail],
    queryFn: () => base44.entities.StockMovement.filter({ store_owner_email: storeOwnerEmail, archived: false }, '-movement_date', 5000),
    enabled: canAccess && !!storeOwnerEmail
  });

  const productsWithStock = useMemo(() => enrichProductsWithStock(products, stockEntries), [products, stockEntries]);

  useEffect(() => {
    if (user && canAccess && productsWithStock.length >= 0) {
      checkAndSendReminders(user, productsWithStock);
      checkAndSendWeeklyReport(user, productsWithStock);
    }
  }, [user, productsWithStock.length]);

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const stockQuantity = Number(data.quantity_received) || 0;
      const productData = { ...data };
      delete productData.quantity_received;
      const savedData = productData.action === 'jeter'
        ? { ...productData, discarded: true, discarded_at: new Date().toISOString().split('T')[0] }
        : productData;
      const product = await base44.entities.Product.create({
        ...savedData,
        store_owner_email: storeOwnerEmail,
        added_by_name: user.full_name || user.email
      });
      await addStockEntry({
        productId: product.id,
        storeOwnerEmail,
        expirationDate: data.expiration_date,
        quantity: stockQuantity,
        dateAdded: data.reception_date
      });
      logActivity(user, 'product_added', `${user.full_name || user.email} a ajouté le produit "${data.name}"`, {
        entity_id: product.id,
        entity_name: data.name
      });
      return product;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stockEntries'] });
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
      setShowForm(false);
      setEditProduct(null);
      setManualInitialProduct(null);
      setQuickAdd(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }) => {
      const stockQuantity = Number(data.quantity_received) || 0;
      const savedData = { ...data };
      delete savedData.quantity_received;
      if (data.action === 'jeter') {
        savedData.discarded = true;
        savedData.discarded_at = new Date().toISOString().split('T')[0];
      } else if (data.expiration_date && getProductStatus(data.expiration_date) !== 'expired') {
        savedData.discarded = false;
      }
      const product = await base44.entities.Product.update(id, savedData);
      await addStockEntry({
        productId: id,
        storeOwnerEmail,
        expirationDate: data.expiration_date,
        quantity: stockQuantity,
        dateAdded: data.reception_date
      });
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
      queryClient.invalidateQueries({ queryKey: ['stockEntries'] });
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
      setShowForm(false);
      setEditProduct(null);
      setManualInitialProduct(null);
      setQuickAdd(null);
    }
  });

  const quickDiscardMutation = useMutation({
    mutationFn: async ({ product, quantity, price }) => {
      const movementDate = new Date().toISOString().split('T')[0];
      const priceNumber = Number(price) || Number(product.price_chf) || 0;
      const stockTotal = Number(product.stock_total) || 0;
      await applyManualStockMovement({
        productId: product.id,
        storeOwnerEmail,
        quantity,
        movementType: 'perte',
        justification: 'Action rapide — produit jeté',
        movementDate,
        source: 'manual'
      });
      const updates = { price_chf: priceNumber };
      if (quantity >= stockTotal) Object.assign(updates, { action: 'jeter', discarded: true, discarded_at: movementDate });
      await base44.entities.Product.update(product.id, updates);
      logActivity(user, 'product_thrown', `${user.full_name || user.email} a jeté ${quantity} unité(s) de "${product.name}"`, {
        entity_id: product.id,
        entity_name: product.name
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stockEntries'] });
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
    },
    onError: (error) => window.alert(error.message || 'Impossible d’enregistrer cette perte.')
  });

  const inventoryCountMutation = useMutation({
    mutationFn: (entries) => Promise.all(entries.map((entry) => applyPeriodicStockCount({
      product: entry.product,
      storeOwnerEmail,
      actualQuantity: entry.actualQuantity,
      movementDate: new Date().toISOString().split('T')[0],
      movementType: entry.movementType,
      justification: entry.justification
    }))),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stockEntries'] });
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
      setShowInventoryCount(false);
    },
    onError: (error) => window.alert(error.message || 'Impossible de valider cet inventaire.')
  });

  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const prod = productsWithStock.find((p) => p.id === id);
      await base44.entities.Batch.deleteMany({ product_id: id });
      await base44.entities.Product.delete(id);
      logActivity(user, 'product_deleted', `${user.full_name || user.email} a supprimé "${prod?.name || 'un produit'}"`, {
        entity_id: id,
        entity_name: prod?.name
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stockEntries'] });
    }
  });

  const handleSave = (data) => {
    if (editProduct) updateMutation.mutate({ id: editProduct.id, data });else
    createMutation.mutate(data);
  };

  const handleEdit = (product) => {setEditProduct(product);setShowForm(true);};
  const handleDelete = (product) => {
    if (window.confirm(t('confirm_delete'))) deleteMutation.mutate(product.id);
  };

  const findExistingProduct = (name, brand, barcode) => {
    const normalize = (value) => (value || '').toLowerCase().trim();
    if (barcode) {
      const byBarcode = productsWithStock.find((product) => normalize(product.barcode) === normalize(barcode));
      if (byBarcode) return byBarcode;
    }
    if (!name) return null;
    return productsWithStock.find((product) => normalize(product.name) === normalize(name) && normalize(product.marque) === normalize(brand)) || null;
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

  const handleBarcodeDetected = async (code) => {
    setShowScanner(false);
    logActivity(user, 'barcode_scanned', `${user.full_name || user.email} a scanné le code-barres ${code}`, { entity_name: code });

    const match = barcodeDB.find((barcode) => barcode.barcode === code);
    if (match) {
      setQuickAdd({ barcode: code, prefill: match, existingProduct: findExistingProduct(match.name, match.brand || match.marque, code) });
      return;
    }

    const applyPrefill = (productData, defaultCategory = '') => {
      const name = productData.product_name_fr || productData.product_name || productData.generic_name || '';
      const brand = productData.brands || '';
      const category = matchCategory(productData.categories_tags || []) || defaultCategory;
      setQuickAdd({
        barcode: code,
        prefill: { name, brand, category, image_url: productData.image_front_url || productData.image_url || '' },
        existingProduct: findExistingProduct(name, brand, code)
      });
    };

    try {
      const foodData = await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`).then((response) => response.json());
      if (foodData?.status === 1 && foodData?.product) { applyPrefill(foodData.product); return; }
    } catch (_) {}

    try {
      const beautyData = await fetch(`https://world.openbeautyfacts.org/api/v0/product/${code}.json`).then((response) => response.json());
      if (beautyData?.status === 1 && beautyData?.product) { applyPrefill(beautyData.product, 'hygiene_beaute'); return; }
    } catch (_) {}

    try {
      const opData = await fetch(`https://world.openproductsfacts.org/api/v0/product/${code}.json`).then((response) => response.json());
      if (opData?.status === 1 && opData?.product) { applyPrefill(opData.product); return; }
    } catch (_) {}

    try {
      const upcData = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${code}`).then((response) => response.json());
      if (upcData?.code === 'OK' && upcData?.items?.length > 0) {
        const item = upcData.items[0];
        const name = item.title || '';
        const brand = item.brand || '';
        const category = matchCategory((item.category || '').toLowerCase().split(/[,/]/).map((value) => value.trim()));
        setQuickAdd({ barcode: code, prefill: { name, brand, category, image_url: item.images?.[0] || '' }, existingProduct: findExistingProduct(name, brand, code) });
        return;
      }
    } catch (_) {}

    setManualInitialProduct({ barcode: code });
    setEditProduct(null);
    setShowForm(true);
  };

  // All products (including discarded) shown in stock list
  const activeProducts = useMemo(() => productsWithStock, [productsWithStock]);

  const filteredProducts = useMemo(() => activeProducts.filter((p) => {
    if (search && !p.name?.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter === 'all') {
      if (p.discarded) return false;
    } else if (statusFilter === 'archived') {
      if (!p.discarded) return false;
    } else {
      if (p.discarded) return false;
      if (getProductStatus(p.expiration_date) !== statusFilter) return false;
    }
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    if (rayonFilter !== 'all' && p.rayon !== rayonFilter) return false;
    return true;
  }), [activeProducts, search, statusFilter, categoryFilter, rayonFilter]);

  const activeFilterCount = [
  statusFilter !== 'all',
  categoryFilter !== 'all',
  rayonFilter !== 'all'].
  filter(Boolean).length;

  const availableRayons = useMemo(() => {
    return Array.from(new Set(activeProducts.map((product) => product.rayon).filter(Boolean)))
      .sort((a, b) => a.localeCompare(b, 'fr', { numeric: true, sensitivity: 'base' }));
  }, [activeProducts]);

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
  { key: 'ok', label: t('dash_filter_ok') },
  { key: 'archived', label: t('status_archived') }];


  return (
    <div className="min-h-screen pb-20 sm:pb-0 pt-16 sm:pt-20" style={{ backgroundColor: '#f5f5f5', color: '#1a1a1a' }}>
      {needsOnboarding && !onboardingDone &&
      <OnboardingModal user={user} onComplete={() => { setOnboardingDone(true); navigate('/welcome'); }} />
      }
      <DashboardHeader />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-6 pb-6 sm:pt-10 sm:pb-8">

        {/* Desktop header */}
        <div className="hidden sm:flex items-start sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">{t('dash_title')}</h1>
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={() => setShowAddOptions(true)} className="rounded-full gap-2">
              <Plus className="w-4 h-4" />
              {t('dash_add_product')}
            </Button>
            <ExportActions products={filteredProducts} onImport={() => setShowImport(true)} />
          </div>
        </div>

        {/* Mobile header */}
        <div className="sm:hidden flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-foreground">{t('dash_title')}</h1>
          <div className="flex flex-wrap justify-end gap-2">
            <Button size="sm" onClick={() => setShowAddOptions(true)} className="rounded-full h-9 px-4 gap-1.5 text-xs font-semibold">
              <Plus className="w-3.5 h-3.5" /> Ajouter un produit
            </Button>
            <ExportActions products={filteredProducts} onImport={() => setShowImport(true)} />
          </div>
        </div>

        {isLoading ?
        <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div> :

        <div className="space-y-4 sm:space-y-6">
            <StatsCards products={activeProducts} movements={stockMovements} />

            <WeeklyAlert
              products={activeProducts}
              onUpdate={(id, data) => updateMutation.mutateAsync({ id, data })}
              onDiscard={(product, quantity, price) => quickDiscardMutation.mutateAsync({ product, quantity, price })}
              onCompleteProduct={(product) => setQuickAdd({ barcode: product.barcode || null, prefill: null, existingProduct: product })}
            />

            {showForm &&
          <ProductForm
            onSave={handleSave}
            onCancel={() => {setShowForm(false);setEditProduct(null);setManualInitialProduct(null);}}
            editProduct={editProduct}
            initialProduct={manualInitialProduct} />

          }

            <CockpitOverview products={activeProducts} />
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

      {showAddOptions &&
      <AddProductOptionsModal
        onScan={() => { setShowAddOptions(false); setShowScanner(true); }}
        onSearchByName={() => { setShowAddOptions(false); setShowManualSearch(true); }}
        onCreateManual={() => { setShowAddOptions(false); setEditProduct(null); setManualInitialProduct(null); setShowForm(true); }}
        onClose={() => setShowAddOptions(false)} />

      }

      {showManualSearch &&
      <ManualProductSearchModal
        products={productsWithStock}
        onSelect={(product) => { setQuickAdd({ barcode: null, prefill: null, existingProduct: product }); setShowManualSearch(false); }}
        onCreate={(name) => { setManualInitialProduct({ name }); setEditProduct(null); setShowForm(true); setShowManualSearch(false); }}
        onClose={() => setShowManualSearch(false)} />

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

      {showInventoryCount &&
      <InventoryCountModal
        products={productsWithStock}
        onClose={() => setShowInventoryCount(false)}
        onSubmit={(entries) => inventoryCountMutation.mutate(entries)}
        saving={inventoryCountMutation.isPending} />

      }

      <DashboardFooter />
    </div>);

}