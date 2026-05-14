import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useSupportMode } from '@/lib/SupportModeContext';
import SupportModeBanner from '@/components/admin/SupportModeBanner';
import { getProductStatus, getDaysRemaining, statusConfig, categoryKeys } from '@/lib/productUtils';
import { format } from 'date-fns';
import { Package, AlertTriangle, TrendingDown, CheckCircle, ArrowLeft } from 'lucide-react';

export default function ClientSupportView() {
  const { supportClient, exitSupportMode } = useSupportMode();

  const { data: allProducts = [] } = useQuery({
    queryKey: ['all_products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const products = useMemo(() => {
    if (!supportClient) return [];
    return allProducts.filter(p => p.created_by === supportClient.email);
  }, [allProducts, supportClient]);

  if (!supportClient) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30">
        <p className="text-muted-foreground">Aucun client sélectionné.</p>
      </div>
    );
  }

  const expired = products.filter(p => getProductStatus(p.expiration_date) === 'expired');
  const urgent = products.filter(p => getProductStatus(p.expiration_date) === 'urgent');
  const ok = products.filter(p => getProductStatus(p.expiration_date) === 'ok');
  const totalLoss = expired.reduce((sum, p) => sum + (p.quantity_thrown || 0) * (p.price_chf || 0), 0);

  return (
    <div className="min-h-screen bg-secondary/30 pt-10">
      <SupportModeBanner />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Client header */}
        <div className="bg-white rounded-2xl p-6 border border-border/40 shadow-sm mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center font-bold text-2xl text-primary">
                {(supportClient.shop_name || supportClient.full_name || supportClient.email || '?')[0].toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">{supportClient.shop_name || supportClient.full_name || 'Client'}</h2>
                <p className="text-muted-foreground text-sm">{supportClient.email}</p>
                <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${supportClient.subscription_status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {supportClient.subscription_status === 'active' ? 'Abonnement actif' : 'Abonnement inactif'}
                </span>
              </div>
            </div>
            <button
              onClick={exitSupportMode}
              className="flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 border border-amber-300 rounded-xl text-sm font-semibold hover:bg-amber-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Retour au portail admin
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total produits', value: products.length, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Expirés', value: expired.length, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
            { label: 'Urgents', value: urgent.length, icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: 'Pertes CHF', value: `${totalLoss.toFixed(0)}`, icon: TrendingDown, color: 'text-primary', bg: 'bg-primary/10' },
          ].map(({ label, value, icon: Icon, color, bg }) => (
            <div key={label} className="bg-white rounded-2xl border border-border/40 shadow-sm p-5">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                <Icon className={`w-5 h-5 ${color}`} />
              </div>
              <div className={`text-2xl font-bold ${color}`}>{value}</div>
              <div className="text-muted-foreground text-xs mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Products list */}
        <div className="bg-white rounded-2xl border border-border/40 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Inventaire produits ({products.length})</h3>
            <span className="text-xs text-muted-foreground">Vue lecture seule — mode support</span>
          </div>
          {products.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">Aucun produit pour ce client</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/40">
                  <tr>
                    {['Produit', 'Marque', 'Rayon', 'DLC', 'Jours', 'Statut', 'Pertes CHF'].map(h => (
                      <th key={h} className="text-left px-4 py-3 font-semibold text-foreground text-xs whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => {
                    const status = getProductStatus(p.expiration_date);
                    const days = getDaysRemaining(p.expiration_date);
                    const cfg = statusConfig[status];
                    const loss = (p.quantity_thrown || 0) * (p.price_chf || 0);
                    return (
                      <tr key={p.id} className={`border-t border-border/30 ${status === 'expired' ? 'bg-red-50/40' : status === 'urgent' ? 'bg-orange-50/30' : ''}`}>
                        <td className="px-4 py-3 font-medium text-foreground">{p.name}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{p.marque || '—'}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs">{p.rayon ? `R${p.rayon}` : '—'}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                          {p.expiration_date ? format(new Date(p.expiration_date), 'dd/MM/yyyy') : '—'}
                        </td>
                        <td className="px-4 py-3 font-medium text-xs" style={{ color: status === 'expired' ? '#dc2626' : days < 3 ? '#ea580c' : days < 14 ? '#ca8a04' : '#16a34a' }}>
                          {days}j
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg?.color || ''}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${cfg?.dot || ''}`} />
                            {status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs font-medium text-red-700">
                          {loss > 0 ? `CHF ${loss.toFixed(2)}` : '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}