import React, { useState, useMemo, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardFooter from '@/components/dashboard/DashboardFooter';
import PremiumGate from '@/components/dashboard/PremiumGate';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { getProductStatus, getDaysRemaining, categoryKeys, rayonKeys, hasActiveSubscription } from '@/lib/productUtils';
import { logActivity } from '@/lib/activityLogger';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import {
  ShoppingCart, FileText, Send, Download,
  Package, Mail, Building2, Phone, Loader2, CheckCircle2, Search, SlidersHorizontal, X
} from 'lucide-react';
import { toast } from 'sonner';

// ── helpers ──────────────────────────────────────────────
function generateOrderPDFContent(supplier, items, user, orderNumber) {
  const today = format(new Date(), 'dd/MM/yyyy');
  const rows = items.map(it => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0">${it.name}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;color:#666">${it.marque || '—'}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;color:#666">${it.category || '—'}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;text-align:center">${it.quantity}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #f0f0f0;color:#666">${it.note || ''}</td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8"/>
<title>Bon de commande #${orderNumber}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; background: #fff; padding: 40px; }
  h1 { font-size: 28px; font-weight: 700; color: #1a1a1a; }
  .gold { color: #C9A646; }
  .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 3px solid #C9A646; padding-bottom: 20px; }
  .brand { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
  .meta { text-align: right; font-size: 13px; color: #666; }
  .sections { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
  .section { background: #fafafa; border-radius: 10px; padding: 18px; }
  .section h3 { font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: #C9A646; margin-bottom: 10px; }
  .section p { font-size: 13px; color: #555; margin-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  th { background: #1a1a1a; color: #fff; padding: 10px 12px; text-align: left; font-size: 12px; font-weight: 600; }
  th:last-child { text-align: center; }
  .footer { text-align: center; font-size: 12px; color: #aaa; border-top: 1px solid #f0f0f0; padding-top: 16px; margin-top: 32px; }
  .badge { display: inline-block; background: #fef9ec; color: #C9A646; border: 1px solid #C9A646; padding: 2px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; }
</style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand"><span class="gold">Track</span>Smart</div>
      <h1 style="margin-top:8px">Bon de commande</h1>
      <span class="badge">#${orderNumber}</span>
    </div>
    <div class="meta">
      <p><strong>Date :</strong> ${today}</p>
      <p><strong>Boutique :</strong> ${user?.shop_name || user?.full_name || 'N/A'}</p>
      <p><strong>Email :</strong> ${user?.email || ''}</p>
    </div>
  </div>

  <div class="sections">
    <div class="section">
      <h3>Fournisseur</h3>
      <p><strong>${supplier.name || '—'}</strong></p>
      ${supplier.contact ? `<p>Contact : ${supplier.contact}</p>` : ''}
      ${supplier.email ? `<p>Email : ${supplier.email}</p>` : ''}
      ${supplier.phone ? `<p>Tél : ${supplier.phone}</p>` : ''}
      ${supplier.address ? `<p>Adresse : ${supplier.address}</p>` : ''}
    </div>
    <div class="section">
      <h3>Résumé</h3>
      <p>Nombre d'articles : <strong>${items.length}</strong></p>
      <p>Quantité totale : <strong>${items.reduce((s, i) => s + (parseInt(i.quantity) || 1), 0)} unités</strong></p>
      <p>Catégories : <strong>${[...new Set(items.map(i => i.category).filter(Boolean))].length || 1}</strong></p>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Produit</th>
        <th>Marque</th>
        <th>Catégorie</th>
        <th style="text-align:center">Qté</th>
        <th>Note</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="footer">
    <p>Bon de commande généré automatiquement par TrackSmart · ${today}</p>
    <p style="margin-top:4px">support@tracksmart.com</p>
  </div>
</body>
</html>`;
}

// ── main page ─────────────────────────────────────────────
export default function Orders() {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const canAccess = hasActiveSubscription(user);

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.filter({ created_by: user.email }, '-created_date'),
    enabled: canAccess && !!user?.email,
  });

  // Products eligible for re-order
  const eligibleProducts = useMemo(() => products.filter(p => {
    const status = getProductStatus(p.expiration_date);
    return p.action === 'a_recommander' || p.order_status === 'a_commander' || status === 'expired' || status === 'urgent';
  }), [products]);

  const [selectedIds, setSelectedIds] = useState(new Set());
  const [quantities, setQuantities] = useState({});
  const [notes, setNotes] = useState({});
  const [supplier, setSupplier] = useState({ name: '', contact: '', email: '', phone: '', address: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [rayonFilter, setRayonFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const orderNumber = useMemo(() => `TS-${Date.now().toString().slice(-8)}`, []);

  const filteredProducts = useMemo(() => eligibleProducts.filter(p => {
    if (search.trim() && !p.name?.toLowerCase().includes(search.toLowerCase()) && !p.marque?.toLowerCase().includes(search.toLowerCase())) return false;
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    if (rayonFilter !== 'all' && p.rayon !== rayonFilter) return false;
    if (statusFilter !== 'all') {
      const s = getProductStatus(p.expiration_date);
      if (statusFilter === 'a_recommander' && p.action !== 'a_recommander') return false;
      if (statusFilter !== 'a_recommander' && s !== statusFilter) return false;
    }
    return true;
  }), [eligibleProducts, search, categoryFilter, rayonFilter, statusFilter]);

  if (!canAccess) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f5f5f5', color: '#1a1a1a' }}>
        <DashboardHeader />
        <PremiumGate featureName={t('orders_feature')} />
        <DashboardFooter />
      </div>
    );
  }

  const selectedProducts = eligibleProducts.filter(p => selectedIds.has(p.id));
  const orderItems = selectedProducts.map(p => ({
    ...p,
    quantity: quantities[p.id] || 1,
    note: notes[p.id] || '',
    category: p.category ? t(categoryKeys[p.category] || p.category) : '',
  }));

  const toggleAll = () => {
    if (selectedIds.size === eligibleProducts.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(eligibleProducts.map(p => p.id)));
    }
  };

  const toggle = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handlePrint = () => {
    if (orderItems.length === 0) { toast.error(t('orders_select_product')); return; }
    const html = generateOrderPDFContent(supplier, orderItems, user, orderNumber);
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 600);
  };

  const handleSendEmail = async () => {
    if (orderItems.length === 0) { toast.error(t('orders_select_product')); return; }
    if (!supplier.email) { toast.error(t('orders_fill_email')); return; }
    setSending(true);
    logActivity(user, 'order_created', `${user.full_name || user.email} a créé un bon de commande #${orderNumber} (${orderItems.length} produits) pour ${supplier.name || supplier.email}`);
    const lines = orderItems.map(it =>
      `• ${it.name}${it.marque ? ' (' + it.marque + ')' : ''} — Qté : ${it.quantity}${it.note ? ' — ' + it.note : ''}`
    ).join('\n');

    const body = `Bonjour,\n\nVeuillez trouver ci-dessous notre bon de commande #${orderNumber} du ${format(new Date(), 'dd/MM/yyyy')}.\n\nBoutique : ${user?.shop_name || user?.full_name || ''}\n\n--- ARTICLES ---\n${lines}\n\nTotal articles : ${orderItems.length} | Quantité totale : ${orderItems.reduce((s, i) => s + (parseInt(i.quantity) || 1), 0)}\n\nCordialement,\n${user?.shop_name || user?.full_name || 'TrackSmart'}`;

    await base44.integrations.Core.SendEmail({
      to: supplier.email,
      subject: `Bon de commande #${orderNumber} — ${user?.shop_name || 'TrackSmart'}`,
      body,
    });
    setSending(false);
    setSent(true);
    toast.success('Bon de commande envoyé par email !');
    setTimeout(() => setSent(false), 4000);
  };

  const statusBadge = (p) => {
    const s = getProductStatus(p.expiration_date);
    const map = {
      expired: 'bg-red-100 text-red-700',
      urgent: 'bg-orange-100 text-orange-700',
      soon: 'bg-yellow-100 text-yellow-700',
      ok: 'bg-green-100 text-green-700',
    };
    return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[s]}`}>{t('status_' + s)}</span>;
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f5f5', color: '#1a1a1a' }}>
      <DashboardHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <ShoppingCart className="w-7 h-7 text-primary" />
              {t('orders_title')}
            </h1>
            <p className="text-muted-foreground text-xs mt-1">
              {eligibleProducts.length} {t('orders_subtitle_plural')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="rounded-full gap-1.5 text-xs" onClick={handlePrint} disabled={selectedIds.size === 0}>
              <Download className="w-3.5 h-3.5" />
              PDF
            </Button>
            <Button
              size="sm"
              className="rounded-full gap-1.5 text-xs"
              onClick={handleSendEmail}
              disabled={selectedIds.size === 0 || sending}
            >
              {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : sent ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
              {sent ? 'Envoyé !' : 'Envoyer par email'}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left — product list */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-border/40 overflow-hidden">
              <div className="px-5 py-4 border-b border-border/40 space-y-3">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-foreground flex items-center gap-2">
                    <Package className="w-4 h-4 text-primary" />
                    {t('orders_products_title')}
                  </h2>
                  <button
                    className="text-xs text-primary hover:underline font-medium"
                    onClick={toggleAll}
                  >
                    {selectedIds.size === eligibleProducts.length ? t('orders_deselect_all') : t('orders_select_all')}
                  </button>
                </div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <Input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Rechercher un produit..."
                    className="pl-8 h-8 text-xs rounded-full"
                  />
                </div>
                {/* Filters */}
                <div className="flex flex-wrap gap-2 items-center">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-8 text-xs rounded-full w-36">
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="expired">{t('status_expired')}</SelectItem>
                      <SelectItem value="urgent">{t('status_urgent')}</SelectItem>
                      <SelectItem value="soon">{t('status_soon')}</SelectItem>
                      <SelectItem value="a_recommander">{t('orders_to_recommend')}</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="h-8 text-xs rounded-full w-36">
                      <SelectValue placeholder="Catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Toutes catégories</SelectItem>
                      {Object.entries(categoryKeys).map(([v, k]) => (
                        <SelectItem key={v} value={v}>{t(k)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={rayonFilter} onValueChange={setRayonFilter}>
                    <SelectTrigger className="h-8 text-xs rounded-full w-32">
                      <SelectValue placeholder="Rayon" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les rayons</SelectItem>
                      {Object.keys(rayonKeys).map(r => (
                        <SelectItem key={r} value={r}>Rayon {r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {(statusFilter !== 'all' || categoryFilter !== 'all' || rayonFilter !== 'all') && (
                    <button
                      onClick={() => { setStatusFilter('all'); setCategoryFilter('all'); setRayonFilter('all'); }}
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-3 h-3" /> Réinitialiser
                    </button>
                  )}
                </div>
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-7 h-7 text-primary animate-spin" />
                </div>
              ) : eligibleProducts.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground text-sm">
                  <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>{t('orders_empty')}</p>
                  <p className="text-xs mt-1">{t('orders_empty_hint')}</p>
                </div>
              ) : (
                <div className="divide-y divide-border/30">
                  {filteredProducts.map(p => {
                    const isSelected = selectedIds.has(p.id);
                    const days = getDaysRemaining(p.expiration_date);
                    return (
                      <div
                        key={p.id}
                        className={`px-5 py-4 flex flex-col gap-2 transition-colors cursor-pointer hover:bg-secondary/20 ${isSelected ? 'bg-primary/5' : ''}`}
                        onClick={() => toggle(p.id)}
                      >
                        <div className="flex items-start gap-4">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggle(p.id)}
                            className="mt-1 flex-shrink-0"
                            onClick={e => e.stopPropagation()}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-medium text-foreground text-sm">{p.name}</span>
                              {p.marque && <span className="text-xs text-muted-foreground">({p.marque})</span>}
                              {statusBadge(p)}
                              {p.action === 'a_recommander' && (
                                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">
                                  {t('orders_to_recommend')}
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1 flex flex-row flex-nowrap gap-2 overflow-x-auto">
                              {p.category && <span className="whitespace-nowrap">{t(categoryKeys[p.category] || p.category)}</span>}
                              {p.category && (p.rayon || p.expiration_date) && <span>·</span>}
                              {p.rayon && <span className="whitespace-nowrap">Rayon {p.rayon}</span>}
                              {p.rayon && p.expiration_date && <span>·</span>}
                              {p.expiration_date && <span className="whitespace-nowrap">{t('orders_dlc')} : {format(new Date(p.expiration_date), 'dd/MM/yyyy')} ({days}j)</span>}
                            </div>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="flex items-center gap-3 pl-8" onClick={e => e.stopPropagation()}>
                            <div>
                              <label className="text-xs text-muted-foreground block mb-1">{t('orders_qty_label')}</label>
                              <Input
                                type="number"
                                min="1"
                                value={quantities[p.id] || 1}
                                onChange={e => setQuantities(q => ({ ...q, [p.id]: parseInt(e.target.value) || 1 }))}
                                className="h-7 w-16 text-xs text-center"
                              />
                            </div>
                            <div className="flex-1">
                              <label className="text-xs text-muted-foreground block mb-1">{t('orders_note_label')}</label>
                              <Input
                                value={notes[p.id] || ''}
                                onChange={e => setNotes(n => ({ ...n, [p.id]: e.target.value }))}
                                className="h-7 w-full text-xs"
                                placeholder={t('orders_note_placeholder')}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right — supplier + summary */}
          <div className="space-y-4">

            {/* Supplier form */}
            <div className="bg-white rounded-2xl shadow-sm border border-border/40 p-5">
              <h2 className="font-semibold text-foreground flex items-center gap-2 mb-4">
                <Building2 className="w-4 h-4 text-primary" />
                {t('orders_supplier_title')}
              </h2>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">{t('orders_supplier_name')}</label>
                  <Input
                    value={supplier.name}
                    onChange={e => setSupplier(s => ({ ...s, name: e.target.value }))}
                    placeholder="Ex: Metro Cash & Carry"
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">{t('orders_supplier_contact')}</label>
                  <Input
                    value={supplier.contact}
                    onChange={e => setSupplier(s => ({ ...s, contact: e.target.value }))}
                    placeholder={t('orders_supplier_contact_placeholder')}
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1 flex items-center gap-1">
                    <Mail className="w-3 h-3" /> {t('orders_supplier_email')}
                  </label>
                  <Input
                    type="email"
                    value={supplier.email}
                    onChange={e => setSupplier(s => ({ ...s, email: e.target.value }))}
                    placeholder="fournisseur@example.com"
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1 flex items-center gap-1">
                    <Phone className="w-3 h-3" /> {t('orders_supplier_phone')}
                  </label>
                  <Input
                    value={supplier.phone}
                    onChange={e => setSupplier(s => ({ ...s, phone: e.target.value }))}
                    placeholder="+41 XX XXX XX XX"
                    className="text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1">{t('orders_supplier_address')}</label>
                  <Input
                    value={supplier.address}
                    onChange={e => setSupplier(s => ({ ...s, address: e.target.value }))}
                    placeholder={t('orders_supplier_address_placeholder')}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Order summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-border/40 p-5">
              <h2 className="font-semibold text-foreground flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4 text-primary" />
                {t('orders_summary_title')}
              </h2>
              {selectedIds.size === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">{t('orders_summary_empty')}</p>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('orders_summary_items')}</span>
                    <span className="font-semibold">{selectedIds.size}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('orders_summary_qty')}</span>
                    <span className="font-semibold">{orderItems.reduce((s, i) => s + (parseInt(i.quantity) || 1), 0)} {t('units')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{t('orders_summary_order_num')}</span>
                    <span className="font-mono text-xs text-primary font-semibold">#{orderNumber}</span>
                  </div>
                  <div className="border-t border-border/40 pt-3 mt-3 space-y-1">
                    {orderItems.slice(0, 5).map(it => (
                      <div key={it.id} className="flex justify-between text-xs">
                        <span className="text-foreground truncate max-w-[150px]">{it.name}</span>
                        <span className="text-muted-foreground ml-2">×{it.quantity}</span>
                      </div>
                    ))}
                    {orderItems.length > 5 && (
                      <p className="text-xs text-muted-foreground">+{orderItems.length - 5} autres…</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons (mobile-friendly duplicate) */}
            <div className="flex flex-col gap-2">
              <Button
                variant="outline"
                size="sm"
                className="rounded-full gap-1.5 w-full text-xs"
                onClick={handlePrint}
                disabled={selectedIds.size === 0}
              >
                <Download className="w-3.5 h-3.5" />
                Imprimer / PDF
              </Button>
              <Button
                size="sm"
                className="rounded-full gap-1.5 w-full text-xs"
                onClick={handleSendEmail}
                disabled={selectedIds.size === 0 || sending}
              >
                {sending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : sent ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
                {sent ? 'Envoyé !' : 'Envoyer au fournisseur'}
              </Button>
            </div>
          </div>
        </div>
      </main>
      <DashboardFooter />
    </div>
  );
}