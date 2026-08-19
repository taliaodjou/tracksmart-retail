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
import { addStockEntry, applyPeriodicStockCount, enrichProductsWithStock } from '@/lib/stockEntries';

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

export default function Dashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [showImport, setShowImport] = useState(false);
  const [showInventoryCount, setShowInventoryCount] = useState(false);
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
    }
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

  // All products (including discarded) shown in stock list
  const activeProducts = useMemo(() => productsWithStock, [productsWithStock]);

  const filteredProducts = useMemo(() => activeProducts.filter((p) => {
    if (search && !p.name?.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'all') {
      if (statusFilter === 'archived') {
        if (!p.discarded) return false;
      } else {
        if (p.discarded) return false;
        if (getProductStatus(p.expiration_date) !== statusFilter) return false;
      }
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
            <Button onClick={() => {setEditProduct(null);setShowForm(true);}} className="rounded-full gap-2">
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
            <Button size="sm" onClick={() => {setEditProduct(null);setShowForm(true);}} className="rounded-full h-9 px-4 gap-1.5 text-xs font-semibold">
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

            {showForm &&
          <ProductForm
            onSave={handleSave}
            onCancel={() => {setShowForm(false);setEditProduct(null);}}
            editProduct={editProduct} />

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