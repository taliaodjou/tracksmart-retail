import React, { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { applyManualStockMovement, applyPeriodicStockCount, enrichProductsWithStock } from '@/lib/stockEntries';
import { getStoreOwnerEmail, hasActiveSubscription, isAdmin } from '@/lib/productUtils';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardFooter from '@/components/dashboard/DashboardFooter';
import SubscriptionGate from '@/components/dashboard/SubscriptionGate';
import InventoryCountPanel from '@/components/dashboard/InventoryCountPanel';

export default function Stock() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState('');
  const storeOwnerEmail = getStoreOwnerEmail(user);
  const userIsAdmin = isAdmin(user);
  const canAccess = hasActiveSubscription(user) || userIsAdmin;
  const isOwnerOrManager = user?.role === 'owner' || user?.role === 'user' || user?.role === 'manager' || userIsAdmin;

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
    enabled: canAccess && !!user?.email
  });

  const { data: stockEntries = [] } = useQuery({
    queryKey: ['stockEntries', storeOwnerEmail],
    queryFn: () => base44.entities.Batch.filter({ store_owner_email: storeOwnerEmail }, 'expiration_date', 5000),
    enabled: canAccess && !!storeOwnerEmail
  });

  const productsWithStock = useMemo(() => enrichProductsWithStock(products, stockEntries).filter((product) => !product.discarded), [products, stockEntries]);

  const inventoryCountMutation = useMutation({
    mutationFn: async (entries) => {
      const results = [];
      for (const entry of entries) {
        const movementDate = new Date().toISOString().split('T')[0];
        if (entry.quantity) {
          results.push(await applyManualStockMovement({
            productId: entry.product.id,
            storeOwnerEmail,
            quantity: entry.quantity,
            movementDate,
            movementType: entry.movementType,
            justification: entry.justification || 'Recomptage périodique',
            source: 'manual'
          }));
        } else {
          results.push(await applyPeriodicStockCount({
            product: entry.product,
            storeOwnerEmail,
            actualQuantity: entry.actualQuantity,
            movementDate,
            movementType: entry.movementType,
            justification: entry.justification
          }));
        }
      }
      return results;
    },
    onSuccess: (results) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['stockEntries'] });
      queryClient.invalidateQueries({ queryKey: ['stockMovements'] });
      const changedCount = results.filter(Boolean).length;
      setMessage(changedCount > 0 ? `${changedCount} ajustement${changedCount > 1 ? 's' : ''} enregistré${changedCount > 1 ? 's' : ''}.` : 'Aucun écart détecté : aucun mouvement ajouté.');
    },
    onError: (error) => window.alert(error.message || 'Impossible de valider cet inventaire.')
  });

  if (!canAccess) {
    return <div className="min-h-screen bg-secondary/30"><DashboardHeader /><SubscriptionGate /></div>;
  }

  return (
    <div className="min-h-screen pb-20 sm:pb-0 pt-16 sm:pt-20" style={{ backgroundColor: '#f5f3ef', color: '#1a1a1a' }}>
      <DashboardHeader />
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-6 pb-8 space-y-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Gérer mon stock</h1>
          <p className="text-sm text-muted-foreground mt-1">Recomptez vos produits et ajustez les écarts de stock depuis une page dédiée.</p>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
        ) : (
          <InventoryCountPanel products={productsWithStock} onSubmit={(entries) => inventoryCountMutation.mutate(entries)} saving={inventoryCountMutation.isPending} message={message} />
        )}
      </main>
      <DashboardFooter />
    </div>
  );
}