import React, { useMemo, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '@/lib/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LayoutList, Layers, Search, X, Plus } from 'lucide-react';
import { categoryKeys, getProductStatus, getStoreOwnerEmail, isAdmin } from '@/lib/productUtils';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import ProductForm from '@/components/dashboard/ProductForm';
import ProductTable from '@/components/dashboard/ProductTable';
import RayonGroupedTable from '@/components/dashboard/RayonGroupedTable';
import ExportActions from '@/components/dashboard/ExportActions';
import ImportModal from '@/components/dashboard/ImportModal';
import StatsCards from '@/components/dashboard/StatsCards';
import BarcodeScanner from '@/components/dashboard/BarcodeScanner';
import QuickAddModal from '@/components/dashboard/QuickAddModal';
import AddProductOptionsModal from '@/components/dashboard/AddProductOptionsModal';
import ManualProductSearchModal from '@/components/dashboard/ManualProductSearchModal';
import DashboardFooter from '@/components/dashboard/DashboardFooter';
import StockAdjustmentModal from '@/components/dashboard/StockAdjustmentModal';
import StockMovementHistoryModal from '@/components/dashboard/StockMovementHistoryModal';
import InventoryCountModal from '@/components/dashboard/InventoryCountModal';
import { logActivity } from '@/lib/activityLogger';
import { addStockEntry, applyManualStockMovement, applyPeriodicStockCount, enrichProductsWithStock } from '@/lib/stockEntries';

export default function Products() {
  const { t, lang } = useLanguage();
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
  const [showImport, setShowImport] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [showAddOptions, setShowAddOptions] = useState(false);
  const [showManualSearch, setShowManualSearch] = useState(false);
  const [manualInitialProduct, setManualInitialProduct] = useState(null);
  const [scannerMode, setScannerMode] = useState('add');
  const [quickAdd, setQuickAdd] = useState(null);
  const [showAdjustment, setShowAdjustment] = useState(false);
  const [showInventoryCount, setShowInventoryCount] = useState(false);
  const [adjustmentProduct, setAdjustmentProduct] = useState(null);
  const [adjustmentEntry, setAdjustmentEntry] = useState(null);
  const [historyProduct, setHistoryProduct] = useState(null);

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

  const { data: barcodeDB = [] } = useQuery({
    queryKey: ['barcodes'],
    queryFn: () => base44.entities.BarcodeProduct.list('barcode', 1000),
    enabled: !!user?.email
  });

  const { data: stockEntries = [] } = useQuery({
    queryKey: ['stockEntries', storeOwnerEmail],
    queryFn: () => base44.entities.Batch.filter({ store_owner_email: storeOwnerEmail }, 'expiration_date', 5000),
    enabled: !!user?.email && !!storeOwnerEmail
  });

  const { data: stockMovements = [] } = useQuery({
    queryKey: ['stockMovements', storeOwnerEmail],
    queryFn: () => base44.entities.StockMovement.filter({ store_owner_email: storeOwnerEmail, archived: false }, '-movement_date', 5000),
    enabled: !!user?.email && !!storeOwnerEmail
  });

  const productsWithStock = useMemo(() => enrichProductsWithStock(products, stockEntries), [products, stockEntries]);

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
      const productData = { ...data };
      delete productData.quantity_received;
      const savedData = productData.action === 'jeter'
        ? { ...productData, discarded: true, discarded_at: new Date().toISOString().split('T')[0] }
        : productData;
      const product = await base44.entities.Product.update(id, savedData);
      await addStockEntry({
        productId: id,
        storeOwnerEmail,
        expirationDate: data.expiration_date,
        quantity: stockQuantity,
        dateAdded: data.reception_date
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

  const deleteMutation = useMutation({
    mutationFn: async (product) => {
      await base44.entities.Batch.deleteMany({ product_id: product.id });
      await base44.entities.Product.delete(product.id);
      logActivity(user, 'product_deleted', `${user.full_name || user.email} a supprimé "${product?.name || 'un produit'}"`, {
        entity_id: product.id,
        entity_name: product.name
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stockEntries'] });
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
    }
  });

  const adjustmentMutation = useMutation({
    mutationFn: ({ product, quantity, justification, movementDate, movementType }) => applyManualStockMovement({
      productId: product.id,
      storeOwnerEmail,
      quantity,
      justification,
      movementDate,
      movementType
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stockEntries'] });
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
      setShowAdjustment(false);
      setAdjustmentProduct(null);
      setAdjustmentEntry(null);
    },
    onError: (error) => window.alert(error.message || 'Impossible d’enregistrer ce mouvement.')
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
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['stockEntries'] });
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
      setShowInventoryCount(false);
      const changedCount = results.filter(Boolean).length;
      if (changedCount === 0) window.alert('Aucun écart détecté : aucun mouvement ajouté.');
    },
    onError: (error) => window.alert(error.message || 'Impossible de valider cet inventaire.')
  });

  const filteredProducts = useMemo(() => productsWithStock.filter((product) => {
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
  }), [productsWithStock, search, statusFilter, categoryFilter, rayonFilter]);

  const availableRayons = useMemo(() => {
    return Array.from(new Set(productsWithStock.map((product) => product.rayon).filter(Boolean)))
      .sort((a, b) => a.localeCompare(b, 'fr', { numeric: true, sensitivity: 'base' }));
  }, [productsWithStock]);

  const activeFilterCount = [statusFilter !== 'all', categoryFilter !== 'all', rayonFilter !== 'all'].filter(Boolean).length;
  const statusFilters = [
    { key: 'all', label: t('dash_filter_all') },
    { key: 'expired', label: t('dash_filter_expired') },
    { key: 'urgent', label: t('dash_filter_urgent') },
    { key: 'soon', label: t('dash_filter_soon') },
    { key: 'ok', label: t('dash_filter_ok') },
    { key: 'archived', label: t('status_archived') }
  ];

  const handleSave = (data) => {
    if (editProduct) {
      updateMutation.mutate({ id: editProduct.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (product) => {
    setEditProduct(product);
    setShowForm(true);
  };

  const OFF_CATEGORY_MAP = {
    snack: 'snacks', crisp: 'snacks', chip: 'snacks', biscuit: 'snacks', cracker: 'snacks', gâteau: 'snacks', cake: 'snacks', cookie: 'snacks', galette: 'snacks',
    beverage: 'boissons', drink: 'boissons', water: 'boissons', juice: 'boissons', soda: 'boissons', milk: 'boissons', lait: 'boissons', eau: 'boissons', jus: 'boissons', boisson: 'boissons', nectar: 'boissons', limonade: 'boissons', sirop: 'boissons', thé: 'boissons', café: 'boissons', tea: 'boissons', coffee: 'boissons', infusion: 'boissons',
    fish: 'congeles_poisson', seafood: 'congeles_poisson', poisson: 'congeles_poisson', crevette: 'congeles_poisson', thon: 'congeles_poisson', sardine: 'congeles_poisson',
    chicken: 'congeles_poulet', poultry: 'congeles_poulet', poulet: 'congeles_poulet', volaille: 'congeles_poulet', dinde: 'congeles_poulet',
    dairy: 'produits_frais', yogurt: 'produits_frais', cheese: 'produits_frais', fresh: 'produits_frais', yaourt: 'produits_frais', fromage: 'produits_frais', beurre: 'produits_frais', butter: 'produits_frais', crème: 'produits_frais', cream: 'produits_frais', oeuf: 'produits_frais', egg: 'produits_frais',
    pasta: 'epicerie_seche', rice: 'epicerie_seche', flour: 'epicerie_seche', cereal: 'epicerie_seche', grain: 'epicerie_seche', riz: 'epicerie_seche', farine: 'epicerie_seche', sucre: 'epicerie_seche', sugar: 'epicerie_seche', sel: 'epicerie_seche', huile: 'epicerie_seche', oil: 'epicerie_seche', pâte: 'epicerie_seche', semoule: 'epicerie_seche', couscous: 'epicerie_seche', légumineuse: 'epicerie_seche', lentille: 'epicerie_seche', haricot: 'epicerie_seche', pois: 'epicerie_seche', épice: 'epicerie_seche', spice: 'epicerie_seche', condiment: 'epicerie_seche', sauce: 'epicerie_seche',
    candy: 'confiseries', chocolate: 'confiseries', sweet: 'confiseries', confectionery: 'confiseries', chocolat: 'confiseries', bonbon: 'confiseries', caramel: 'confiseries', nougat: 'confiseries',
    canned: 'conserves', tinned: 'conserves', preserve: 'conserves', conserve: 'conserves', tomate: 'conserves', confiture: 'conserves', jam: 'conserves', miel: 'conserves', honey: 'conserves',
    hygiene: 'hygiene_beaute', beauty: 'hygiene_beaute', soap: 'hygiene_beaute', shampoo: 'hygiene_beaute', cosmetic: 'hygiene_beaute', savon: 'hygiene_beaute', dentifrice: 'hygiene_beaute', déodorant: 'hygiene_beaute', parfum: 'hygiene_beaute', lotion: 'hygiene_beaute', rasoir: 'hygiene_beaute',
    cleaning: 'entretien_maison', detergent: 'entretien_maison', household: 'entretien_maison', lessive: 'entretien_maison', nettoyant: 'entretien_maison', désinfectant: 'entretien_maison', vaisselle: 'entretien_maison', balai: 'entretien_maison',
    baby: 'bebe', infant: 'bebe', bébé: 'bebe', couche: 'bebe', diaper: 'bebe', biberon: 'bebe', pet: 'animaux', dog: 'animaux', cat: 'animaux', chien: 'animaux', chat: 'animaux',
    alcohol: 'alcool', wine: 'alcool', beer: 'alcool', spirit: 'alcool', bière: 'alcool', vin: 'alcool', whisky: 'alcool', rhum: 'alcool', liqueur: 'alcool', tobacco: 'tabac', cigarette: 'tabac', cigare: 'tabac'
  };

  const matchCategory = (tags = []) => {
    const allTags = Array.isArray(tags) ? tags : [tags];
    for (const tag of allTags) {
      const clean = (tag || '').replace(/^[a-z]{2}:/, '').toLowerCase().replace(/[-_]/g, ' ');
      for (const [keyword, cat] of Object.entries(OFF_CATEGORY_MAP)) {
        if (clean.includes(keyword)) return cat;
      }
    }
    return '';
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

  const handleBarcodeDetected = async (code) => {
    setShowScanner(false);
    if (scannerMode === 'movement') {
      const product = findExistingProduct('', '', code);
      setScannerMode('add');
      if (product) {
        setAdjustmentProduct(product);
        setAdjustmentEntry(null);
        setShowAdjustment(true);
      } else {
        window.alert('Aucun produit en stock ne correspond à ce code-barres.');
      }
      return;
    }
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

  return (
    <div className="min-h-screen pb-20 sm:pb-0 pt-16 sm:pt-20" style={{ backgroundColor: '#f5f3ef', color: '#1a1a1a' }}>
      <DashboardHeader />
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-6 pb-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Produits</h1>
            <p className="text-sm text-muted-foreground mt-1">Liste complète de vos produits en stock</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={() => setShowAddOptions(true)} className="rounded-full gap-2">
              <Plus className="w-4 h-4" />
              {t('dash_add_product')}
            </Button>
            <ExportActions products={filteredProducts} onImport={() => setShowImport(true)} />
          </div>
        </div>

        <StatsCards products={productsWithStock} movements={stockMovements} />

        {showForm && (
          <ProductForm
            onSave={handleSave}
            onCancel={() => { setShowForm(false); setEditProduct(null); setManualInitialProduct(null); }}
            editProduct={editProduct}
            initialProduct={manualInitialProduct}
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
                    {availableRayons.map((rayon) => <SelectItem key={rayon} value={rayon}>{rayon}</SelectItem>)}
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
          <RayonGroupedTable products={filteredProducts} totalProducts={productsWithStock} movements={stockMovements} onEdit={handleEdit} onDelete={(product) => { if (window.confirm(t('confirm_delete'))) deleteMutation.mutate(product); }} onInlineSave={(id, data) => updateMutation.mutate({ id, data })} onCorrectStock={(product, entry) => { setAdjustmentProduct(product); setAdjustmentEntry(entry); setShowAdjustment(true); }} onViewHistory={setHistoryProduct} />
        ) : (
          <ProductTable products={filteredProducts} totalProducts={productsWithStock} movements={stockMovements} onEdit={handleEdit} onDelete={(product) => { if (window.confirm(t('confirm_delete'))) deleteMutation.mutate(product); }} onInlineSave={(id, data) => updateMutation.mutate({ id, data })} onCorrectStock={(product, entry) => { setAdjustmentProduct(product); setAdjustmentEntry(entry); setShowAdjustment(true); }} onViewHistory={setHistoryProduct} />
        )}
      </main>

      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          onImported={(count) => {
            queryClient.invalidateQueries({ queryKey: ['products'] });
            logActivity(user, 'excel_imported', `${user.full_name || user.email} a importé un fichier Excel${count ? ` (${count} produits)` : ''}`);
          }}
        />
      )}

      {showAddOptions && (
        <AddProductOptionsModal
          onScan={() => { setShowAddOptions(false); setScannerMode('add'); setShowScanner(true); }}
          onSearchByName={() => { setShowAddOptions(false); setShowManualSearch(true); }}
          onCreateManual={() => { setShowAddOptions(false); setEditProduct(null); setManualInitialProduct(null); setShowForm(true); }}
          onClose={() => setShowAddOptions(false)}
        />
      )}

      {showManualSearch && (
        <ManualProductSearchModal
          products={productsWithStock}
          onSelect={(product) => { setQuickAdd({ barcode: null, prefill: null, existingProduct: product }); setShowManualSearch(false); }}
          onCreate={(name) => { setManualInitialProduct({ name }); setEditProduct(null); setShowForm(true); setShowManualSearch(false); }}
          onClose={() => setShowManualSearch(false)}
        />
      )}

      {showScanner && (
        <BarcodeScanner
          lang={lang}
          onDetected={handleBarcodeDetected}
          onClose={() => { setScannerMode('add'); setShowScanner(false); }}
        />
      )}

      {quickAdd && (
        <QuickAddModal
          barcode={quickAdd.barcode}
          prefill={quickAdd.prefill}
          existingProduct={quickAdd.existingProduct}
          onSave={(data) => createMutation.mutate(data)}
          onUpdate={(id, data) => updateMutation.mutate({ id, data })}
          onClose={() => setQuickAdd(null)}
          saving={createMutation.isPending || updateMutation.isPending}
        />
      )}

      {showInventoryCount && (
        <InventoryCountModal
          products={productsWithStock}
          onClose={() => setShowInventoryCount(false)}
          onSubmit={(entries) => inventoryCountMutation.mutate(entries)}
          saving={inventoryCountMutation.isPending}
        />
      )}

      {showAdjustment && (
        <StockAdjustmentModal
          products={productsWithStock}
          product={adjustmentProduct}
          entry={adjustmentEntry}
          onProductChange={(product) => { setAdjustmentProduct(product); setAdjustmentEntry(null); }}
          onScan={() => { setScannerMode('movement'); setShowScanner(true); }}
          onClose={() => { setShowAdjustment(false); setAdjustmentProduct(null); setAdjustmentEntry(null); }}
          onSubmit={(data) => adjustmentMutation.mutate(data)}
          saving={adjustmentMutation.isPending}
        />
      )}

      {historyProduct && (
        <StockMovementHistoryModal
          product={historyProduct}
          movements={stockMovements.filter((movement) => movement.product_id === historyProduct.id).sort((a, b) => new Date(b.movement_date || b.created_date) - new Date(a.movement_date || a.created_date))}
          onClose={() => setHistoryProduct(null)}
        />
      )}

      <DashboardFooter />
    </div>
  );
}