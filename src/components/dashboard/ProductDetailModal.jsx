import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Package, Barcode } from 'lucide-react';
import { format } from 'date-fns';
import { useLanguage } from '@/lib/LanguageContext';
import { categoryKeys, getDisplayStatus, getDaysRemaining, statusConfig } from '@/lib/productUtils';

const ACTION_LABELS = {
  jeter: 'Jeté',
  a_recommander: 'À recommander',
  commande: 'Commandé',
  en_transition: 'En transition',
  recu: 'Reçu',
};

const ORDER_LABELS = {
  a_commander: 'À commander',
  commande: 'Commandé',
  recu: 'Reçu',
};

function formatDate(value) {
  if (!value) return '—';
  try {
    return format(new Date(value), 'dd/MM/yyyy');
  } catch {
    return value;
  }
}

function InfoRow({ label, value, highlight }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-border/40 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-sm font-medium text-right ${highlight || 'text-foreground'}`}>{value || '—'}</span>
    </div>
  );
}

export default function ProductDetailModal({ product, onClose, onEdit }) {
  const { t } = useLanguage();
  if (!product) return null;

  const status = getDisplayStatus(product);
  const cfg = statusConfig[status] || statusConfig.ok;
  const days = product.expiration_date ? getDaysRemaining(product.expiration_date) : null;
  const imageUrl = product.image_url || product.photo_url || product.image_front_url;
  const barcode = product.barcode || product.ean || product.code_ean;
  const totalLoss = (product.quantity_thrown || 0) * (product.price_chf || 0);

  return (
    <div className="fixed inset-0 z-[80] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-2xl max-h-[92vh] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Fiche produit</p>
            <h2 className="text-lg font-bold text-foreground">{product.name}</h2>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full hover:bg-secondary flex items-center justify-center">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="overflow-y-auto p-5 space-y-5">
          <div className="grid sm:grid-cols-[160px_1fr] gap-5">
            <div className="rounded-2xl border border-border/50 bg-secondary/30 h-40 flex items-center justify-center overflow-hidden">
              {imageUrl ? (
                <img src={imageUrl} alt={product.name} className="w-full h-full object-contain bg-white" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              ) : (
                <Package className="w-12 h-12 text-muted-foreground" />
              )}
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${cfg.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                  {status === 'archived' ? 'Archivé' : t('status_' + status)}
                </span>
                {barcode && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-neutral-100 text-neutral-700 border border-neutral-200">
                    <Barcode className="w-3.5 h-3.5" /> EAN {barcode}
                  </span>
                )}
              </div>
              <div className="bg-secondary/30 rounded-2xl p-4">
                <InfoRow label="Produit" value={product.name} />
                <InfoRow label="Marque" value={product.marque} />
                <InfoRow label="Code EAN" value={barcode} />
                <InfoRow label="Catégorie" value={product.category ? t(categoryKeys[product.category] || product.category) : '—'} />
              </div>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-border/50 p-4">
              <h3 className="font-bold text-sm mb-2">Localisation & dates</h3>
              <InfoRow label="Rayon" value={product.rayon ? `Rayon ${product.rayon}` : '—'} />
              <InfoRow label="Étagère" value={product.etagere} />
              <InfoRow label="Date de réception" value={formatDate(product.reception_date)} />
              <InfoRow label="DLC" value={formatDate(product.expiration_date)} />
              <InfoRow label="Jours restants" value={days === null ? '—' : `${days} jour${Math.abs(days) > 1 ? 's' : ''}`} />
            </div>

            <div className="rounded-2xl border border-border/50 p-4">
              <h3 className="font-bold text-sm mb-2">Suivi & pertes</h3>
              <InfoRow label="Action" value={ACTION_LABELS[product.action] || product.action || '—'} />
              <InfoRow label="Quantité jetée" value={product.quantity_thrown != null ? product.quantity_thrown : '—'} />
              <InfoRow label="Prix unitaire" value={product.price_chf != null ? `CHF ${Number(product.price_chf).toFixed(2)}` : '—'} />
              <InfoRow label="Total perte" value={totalLoss > 0 ? `CHF ${totalLoss.toFixed(2)}` : '—'} highlight={totalLoss > 0 ? 'text-red-700' : ''} />
              <InfoRow label="Ajouté par" value={product.added_by_name} />
            </div>
          </div>

          <div className="rounded-2xl border border-border/50 p-4">
            <h3 className="font-bold text-sm mb-2">Commande & notes</h3>
            <InfoRow label="Date de commande" value={formatDate(product.order_date)} />
            <InfoRow label="Statut commande" value={ORDER_LABELS[product.order_status] || product.order_status || '—'} />
            <InfoRow label="Description" value={product.description || '—'} />
          </div>
        </div>

        <div className="px-5 py-4 border-t border-border/40 bg-white flex gap-2 justify-end">
          <Button variant="outline" onClick={onClose} className="rounded-xl">Fermer</Button>
          {onEdit && <Button onClick={() => onEdit(product)} className="rounded-xl">Modifier</Button>}
        </div>
      </div>
    </div>
  );
}