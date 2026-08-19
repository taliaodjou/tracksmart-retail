import React, { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { getProductStatus, getDaysRemaining, statusConfig, isDiscarded } from '@/lib/productUtils';
import { AlertTriangle, X, ChevronRight, Trash2, PackagePlus, Loader2, Check } from 'lucide-react';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const PREVIEW_COUNT = 10;

// Action panel for a single product inside the modal
function ProductActionPanel({ product, onUpdate, onDiscard, onCompleteProduct, lang }) {
  const isFr = lang === 'fr';
  const [tab, setTab] = useState('info'); // info | jeter | complete
  const [qty, setQty] = useState('');
  const [price, setPrice] = useState(product.price_chf ? String(product.price_chf) : '');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const loss = (parseFloat(qty) || 0) * (parseFloat(price) || 0);
  const status = getProductStatus(product.expiration_date);
  const days = getDaysRemaining(product.expiration_date);
  const cfg = statusConfig[status];

  const handleJeter = async () => {
    if ((Number(qty) || 0) <= 0 || (Number(price) || 0) <= 0) return;
    setSaving(true);
    if (onDiscard) {
      await onDiscard(product, Number(qty), Number(price));
    } else {
      await onUpdate(product.id, {
        action: 'jeter',
        quantity_thrown: Number(qty),
        price_chf: Number(price),
      });
    }
    setSaving(false);
    setDone(true);
  };

  const handleCompleteProduct = () => {
    if (onCompleteProduct) onCompleteProduct(product);
  };

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center py-6 gap-2 text-green-600">
        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
          <Check className="w-5 h-5" />
        </div>
        <p className="text-sm font-semibold">{isFr ? 'Mis à jour !' : 'Updated!'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Product header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold text-foreground text-sm">{product.name}</p>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            {product.marque && <span className="text-xs text-muted-foreground">{product.marque}</span>}
            {product.rayon && <span className="text-xs text-muted-foreground">• Rayon {product.rayon}</span>}
            <span className={`inline-flex items-center gap-1 px-2 py-0 rounded-full text-xs font-medium border ${cfg.color}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {product.expiration_date ? format(new Date(product.expiration_date), 'dd/MM/yy') : '—'} ({days}j)
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-secondary/50 p-1 rounded-xl">
        <button
          onClick={() => setTab('info')}
          className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition-colors ${tab === 'info' ? 'bg-white shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          {isFr ? 'Infos' : 'Info'}
        </button>
        <button
          onClick={() => setTab('jeter')}
          className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-1 ${tab === 'jeter' ? 'bg-red-500 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <Trash2 className="w-3 h-3" /> {isFr ? 'Jeter' : 'Discard'}
        </button>
        <button
          onClick={() => setTab('complete')}
          className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-1 ${tab === 'complete' ? 'bg-blue-500 text-white shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <PackagePlus className="w-3 h-3" /> {isFr ? 'Compléter' : 'Add stock'}
        </button>
      </div>

      {/* Info tab */}
      {tab === 'info' && (
        <div className="text-xs text-muted-foreground space-y-1 px-1">
          {product.category && <p><span className="font-medium text-foreground">{isFr ? 'Catégorie' : 'Category'}:</span> {product.category}</p>}
          {product.rayon && <p><span className="font-medium text-foreground">Rayon:</span> {product.rayon}</p>}
          {product.expiration_date && <p><span className="font-medium text-foreground">DLC:</span> {format(new Date(product.expiration_date), 'dd/MM/yyyy')}</p>}
          {product.price_chf && <p><span className="font-medium text-foreground">Prix:</span> CHF {product.price_chf}</p>}
          {product.added_by_name && <p><span className="font-medium text-foreground">{isFr ? 'Ajouté par' : 'Added by'}:</span> {product.added_by_name}</p>}
        </div>
      )}

      {/* Jeter tab */}
      {tab === 'jeter' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">{isFr ? 'Quantité jetée' : 'Qty discarded'}</label>
              <Input
                type="number"
                min="1"
                value={qty}
                onChange={e => setQty(e.target.value)}
                placeholder="0"
                className="h-10 text-sm rounded-xl"
                autoFocus
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-foreground mb-1 block">{isFr ? 'Prix vente CHF' : 'Sale price CHF'}</label>
              <Input
                type="number"
                min="0.01"
                step="0.05"
                value={price}
                onChange={e => setPrice(e.target.value)}
                placeholder="0.00"
                className="h-10 text-sm rounded-xl"
              />
            </div>
          </div>
          {loss > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 flex items-center justify-between">
              <span className="text-xs font-semibold text-red-700">{isFr ? 'Perte estimée' : 'Estimated loss'}</span>
              <span className="text-base font-bold text-red-700">CHF {loss.toFixed(2)}</span>
            </div>
          )}
          <Button
            className="w-full bg-red-500 hover:bg-red-600 text-white rounded-xl"
            disabled={(Number(qty) || 0) <= 0 || (Number(price) || 0) <= 0 || saving}
            onClick={handleJeter}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Trash2 className="w-4 h-4" /> {isFr ? 'Confirmer le jet' : 'Confirm discard'}</>}
          </Button>
        </div>
      )}

      {/* Complete stock tab */}
      {tab === 'complete' && (
        <div className="space-y-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
          <div>
            <p className="text-sm font-semibold text-foreground">{isFr ? 'Compléter un produit déjà enregistré' : 'Add stock to existing product'}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {isFr ? 'Ajoutez une quantité avec sa DLC : c’est le même flux que le réassort depuis Ajouter un produit.' : 'Add a quantity with its expiry date using the same restock flow.'}
            </p>
          </div>
          <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-xl" onClick={handleCompleteProduct}>
            <PackagePlus className="w-4 h-4" /> {isFr ? 'Compléter un produit déjà enregistré' : 'Add stock to existing product'}
          </Button>
        </div>
      )}
    </div>
  );
}

// Sort by expiration date ascending (most urgent first = oldest date)
function sortByUrgency(list) {
  return [...list].sort((a, b) => {
    const da = a.expiration_date ? new Date(a.expiration_date).getTime() : Infinity;
    const db = b.expiration_date ? new Date(b.expiration_date).getTime() : Infinity;
    return da - db;
  });
}

function ProductPill({ p, onClick }) {
  const days = getDaysRemaining(p.expiration_date);
  const status = getProductStatus(p.expiration_date);
  return (
    <button
      onClick={() => onClick(p)}
      className={`inline-flex items-center gap-1 px-2 py-1 sm:gap-1.5 sm:px-3 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-medium border cursor-pointer hover:opacity-80 transition-opacity ${statusConfig[status].color}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[status].dot}`} />
      {p.name} ({days}j)
    </button>
  );
}

function WatchBox({ title, products, icon, borderColor, bgColor, titleColor, onProductClick, isFr }) {
  const [showAll, setShowAll] = useState(false);
  const LIMIT = 6;
  const visible = showAll ? products : products.slice(0, LIMIT);
  const extra = products.length - LIMIT;

  if (products.length === 0) return null;

  return (
    <div className={`${bgColor} border ${borderColor} rounded-xl sm:rounded-2xl p-2.5 sm:p-4`}>
      <div className="flex items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
        {icon}
        <h3 className={`font-semibold text-xs sm:text-sm ${titleColor}`}>{title}</h3>
        <span className={`ml-auto text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 rounded-full ${bgColor} ${titleColor} border ${borderColor}`}>{products.length}</span>
      </div>
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {visible.map(p => (
          <ProductPill key={p.id} p={p} onClick={onProductClick} />
        ))}
        {!showAll && extra > 0 && (
          <button
            onClick={() => setShowAll(true)}
            className={`inline-flex items-center gap-1 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold border ${borderColor} ${bgColor} ${titleColor} hover:opacity-80 transition-colors`}
          >
            +{extra} <ChevronRight className="w-3 h-3" />
          </button>
        )}
      </div>
    </div>
  );
}

export default function WeeklyAlert({ products, onUpdate, onDiscard, onCompleteProduct }) {
  const { t, lang } = useLanguage();
  const [showModal, setShowModal] = useState(false);
  const [activeProduct, setActiveProduct] = useState(null);
  const [modalFilter, setModalFilter] = useState('all'); // 'all' | 'expired' | 'soon'
  const [dismissedIds, setDismissedIds] = useState(new Set());
  const isFr = lang === 'fr';

  // Split by status, sorted by most urgent first (exclude dismissed and discarded/archived)
  const expiredProducts = sortByUrgency(products.filter(p => {
    if (dismissedIds.has(p.id)) return false;
    if (isDiscarded(p)) return false; // discarded = archivé, ne plus afficher dans les alertes
    const s = getProductStatus(p.expiration_date);
    return s === 'expired' || s === 'urgent';
  }));

  const soonProducts = sortByUrgency(products.filter(p => {
    if (dismissedIds.has(p.id)) return false;
    if (isDiscarded(p)) return false;
    const s = getProductStatus(p.expiration_date);
    return s === 'soon';
  }));

  const allWatchProducts = sortByUrgency(products.filter(p => {
    if (dismissedIds.has(p.id)) return false;
    if (isDiscarded(p)) return false;
    const s = getProductStatus(p.expiration_date);
    return s === 'expired' || s === 'urgent' || s === 'soon';
  }));

  if (allWatchProducts.length === 0) return null;

  const handleProductClick = (p) => {
    setActiveProduct(p);
    setShowModal(true);
  };

  const modalProducts = modalFilter === 'expired' ? expiredProducts
    : modalFilter === 'soon' ? soonProducts
    : allWatchProducts;

  return (
    <>
      <div className="space-y-3">
        {/* Box 1 — Expirés & Urgents */}
        <WatchBox
          title={isFr ? 'Expirés & Urgents' : 'Expired & Urgent'}
          products={expiredProducts}
          icon={<AlertTriangle className="w-4 h-4 text-red-600" />}
          borderColor="border-red-200"
          bgColor="bg-red-50"
          titleColor="text-red-800"
          onProductClick={handleProductClick}
          isFr={isFr}
        />
        {/* Box 2 — Bientôt */}
        <WatchBox
          title={isFr ? 'Arrivent bientôt à expiration' : 'Expiring soon'}
          products={soonProducts}
          icon={<AlertTriangle className="w-4 h-4 text-orange-500" />}
          borderColor="border-orange-200"
          bgColor="bg-orange-50"
          titleColor="text-orange-800"
          onProductClick={handleProductClick}
          isFr={isFr}
        />
      </div>

      {/* Full modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center" onClick={() => { setShowModal(false); setActiveProduct(null); }}>
          <div className="absolute inset-0 bg-black/40" />
          <div
            className="relative bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] flex flex-col shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-1 sm:hidden">
              <div className="w-10 h-1 rounded-full bg-border" />
            </div>

            <div className="flex items-center justify-between px-5 py-4 border-b border-border/40 flex-shrink-0">
              <div className="flex items-center gap-2">
                {activeProduct && (
                  <button onClick={() => setActiveProduct(null)} className="text-muted-foreground hover:text-foreground mr-1">
                    <ChevronRight className="w-4 h-4 rotate-180" />
                  </button>
                )}
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                <h2 className="font-semibold text-foreground text-sm">
                  {activeProduct
                    ? (isFr ? 'Action rapide' : 'Quick action')
                    : `${isFr ? 'Produits à surveiller' : 'Products to watch'} (${allWatchProducts.length})`
                  }
                </h2>
              </div>
              <button onClick={() => { setShowModal(false); setActiveProduct(null); }} className="text-muted-foreground hover:text-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter tabs in modal */}
            {!activeProduct && (
              <div className="flex gap-1 px-4 py-2 border-b border-border/30 flex-shrink-0">
                {[
                  { key: 'all', label: isFr ? `Tous (${allWatchProducts.length})` : `All (${allWatchProducts.length})` },
                  { key: 'expired', label: isFr ? `Expirés (${expiredProducts.length})` : `Expired (${expiredProducts.length})` },
                  { key: 'soon', label: isFr ? `Bientôt (${soonProducts.length})` : `Soon (${soonProducts.length})` },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setModalFilter(tab.key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${modalFilter === tab.key ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'}`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            <div className="overflow-y-auto flex-1 px-4 py-3">
              {activeProduct ? (
                <ProductActionPanel
                  key={activeProduct.id}
                  product={activeProduct}
                  onDiscard={async (product, quantity, price) => {
                    if (onDiscard) await onDiscard(product, quantity, price);
                    setDismissedIds(prev => new Set([...prev, product.id]));
                    setActiveProduct(null);
                    setShowModal(false);
                  }}
                  onUpdate={async (id, data) => {
                    if (onUpdate) await onUpdate(id, data);
                    // If thrown, remove immediately from the alert lists
                    if (data.action === 'jeter') {
                      setDismissedIds(prev => new Set([...prev, id]));
                    }
                    setActiveProduct(null);
                    setShowModal(false);
                  }}
                  onCompleteProduct={(product) => {
                    setActiveProduct(null);
                    setShowModal(false);
                    if (onCompleteProduct) onCompleteProduct(product);
                  }}
                  lang={lang}
                />
              ) : (
                <div className="space-y-2">
                  {modalProducts.map(p => {
                    const status = getProductStatus(p.expiration_date);
                    const days = getDaysRemaining(p.expiration_date);
                    const cfg = statusConfig[status];
                    return (
                      <button
                        key={p.id}
                        onClick={() => setActiveProduct(p)}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm hover:opacity-90 transition-opacity text-left ${cfg.color}`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                          <div className="min-w-0">
                            <p className="font-medium truncate">{p.name}</p>
                            {p.marque && <p className="text-xs opacity-70 truncate">{p.marque}</p>}
                          </div>
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                          <div className="flex flex-col items-end text-xs">
                            <span className="font-semibold">{days}j</span>
                            {p.rayon && <span className="opacity-60">R{p.rayon}</span>}
                          </div>
                          <ChevronRight className="w-4 h-4 opacity-50" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}