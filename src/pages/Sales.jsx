import React, { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { toast } from '@/components/ui/use-toast';
import SubscriptionGate from '@/components/dashboard/SubscriptionGate';
import InvoiceSidebar from '@/components/invoices/InvoiceSidebar';
import PosHeader from '@/components/pos/PosHeader';
import CategoryTabs from '@/components/pos/CategoryTabs';
import ProductCard from '@/components/pos/ProductCard';
import CartPanel from '@/components/pos/CartPanel';
import { applyManualStockMovement, enrichProductsWithStock } from '@/lib/stockEntries';
import { getStoreOwnerEmail, hasActiveSubscription, isAdmin } from '@/lib/productUtils';

const today = () => new Date().toISOString().split('T')[0];
const matchesCategory = (product, category) => category === 'Tout' || (category === 'Boissons' && product.category === 'boissons') || (category === 'Boulangerie' && product.category === 'produits_frais') || (category === 'Épicerie' && ['epicerie_seche', 'conserves', 'confiseries', 'snacks'].includes(product.category));

export default function Sales() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Tout');
  const [cart, setCart] = useState([]);
  const [isPaying, setIsPaying] = useState(false);
  const storeOwnerEmail = getStoreOwnerEmail(user);

  const { data = [], isLoading, isFetching, refetch } = useQuery({
    queryKey: ['pos-products', storeOwnerEmail],
    queryFn: async () => {
      const [products, batches] = await Promise.all([base44.entities.Product.list('-created_date', 500), base44.entities.Batch.list('-date_added', 1000)]);
      const scopedProducts = isAdmin(user) ? products : products.filter((p) => (p.store_owner_email || user.email) === storeOwnerEmail);
      const enriched = enrichProductsWithStock(scopedProducts.filter((p) => !p.discarded), batches);
      return enriched.filter((p) => p.stock_total === null || Number(p.stock_total) > 0);
    },
    enabled: !!user,
  });

  // Synchronisation automatique dès qu'un produit ou un mouvement de stock change
  useEffect(() => {
    const invalidate = () => queryClient.invalidateQueries({ queryKey: ['pos-products', storeOwnerEmail] });
    const unsubProduct = base44.entities.Product.subscribe(invalidate);
    const unsubBatch = base44.entities.Batch.subscribe(invalidate);
    return () => { unsubProduct(); unsubBatch(); };
  }, [queryClient, storeOwnerEmail]);

  const products = useMemo(() => data.filter((product) => {
    const term = search.trim().toLowerCase();
    const text = `${product.name || ''} ${product.barcode || ''}`.toLowerCase();
    return matchesCategory(product, category) && (!term || text.includes(term));
  }), [data, search, category]);

  const subtotal = cart.reduce((sum, item) => sum + item.price_chf * item.qty, 0);
  const tax = subtotal * 0.2;
  const total = subtotal + tax;

  const addToCart = (product) => setCart((items) => {
    const existing = items.find((item) => item.id === product.id);
    const max = product.stock_total === null ? 999 : Number(product.stock_total || 0);
    if (existing) return items.map((item) => item.id === product.id ? { ...item, qty: Math.min(item.qty + 1, max) } : item);
    return [...items, { id: product.id, name: product.name, price_chf: Number(product.price_chf || 0), stock_total: max, tracked: product.stock_total !== null, qty: 1 }];
  });
  const increase = (id) => setCart((items) => items.map((item) => item.id === id ? { ...item, qty: Math.min(item.qty + 1, item.stock_total) } : item));
  const decrease = (id) => setCart((items) => items.flatMap((item) => item.id !== id ? [item] : item.qty > 1 ? [{ ...item, qty: item.qty - 1 }] : []));

  const pay = async () => {
    if (!cart.length) return;
    setIsPaying(true);
    for (const item of cart.filter((i) => i.tracked)) await applyManualStockMovement({ productId: item.id, storeOwnerEmail, quantity: item.qty, movementType: 'vente', source: 'manual', movementDate: today(), justification: 'Vente POS' });
    await base44.entities.SaleTransaction.create({ store_owner_email: storeOwnerEmail, cashier_email: user.email, session_label: 'Caisse 01', items: JSON.stringify(cart), subtotal_ht: subtotal, tax_amount: tax, total_ttc: total, status: 'paid', sold_at: today() });
    setCart([]);
    setIsPaying(false);
    queryClient.invalidateQueries({ queryKey: ['pos-products', storeOwnerEmail] });
    toast({ title: 'Paiement validé', description: 'La vente a été enregistrée et le stock mis à jour.' });
  };

  if (!hasActiveSubscription(user)) return <SubscriptionGate />;

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-[#242321] flex">
      <InvoiceSidebar />
      <div className="flex-1 min-w-0"><PosHeader search={search} onSearchChange={setSearch} onRefresh={() => refetch()} isRefreshing={isFetching} />
        <div className="flex flex-col xl:flex-row"><main className="flex-1 px-5 lg:px-6 py-7"><h1 className="text-xl font-extrabold mb-4">Catalogue Rapide</h1><CategoryTabs activeCategory={category} onChange={setCategory} />
          {isLoading ? <div className="mt-6 text-sm text-[#74716b]">Chargement du catalogue...</div> : <div className="mt-7 flex flex-wrap gap-4">{products.map((product, index) => <ProductCard key={product.id} product={product} index={index} onAdd={addToCart} />)}<Link to="/products" className="w-full sm:w-32 h-56 rounded-xl border-2 border-dashed border-[#d6c9ad] text-[#74716b] bg-white/40 flex flex-col items-center justify-center text-center text-sm px-4"><PlusCircle className="w-10 h-10 mb-3 text-[#9a9995]" />Ajouter un produit rapide</Link></div>}
        </main><CartPanel items={cart} subtotal={subtotal} tax={tax} total={total} onIncrease={increase} onDecrease={decrease} onClear={() => setCart([])} onPay={pay} isPaying={isPaying} /></div>
      </div>
    </div>
  );
}