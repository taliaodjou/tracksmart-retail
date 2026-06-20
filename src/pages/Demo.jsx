import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, X, ScanLine, Sparkles, Package, AlertTriangle, XCircle, ChevronRight, ChevronDown, CheckCircle2, Loader2, Tag, Layers, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import BarcodeScanner from '@/components/dashboard/BarcodeScanner';
import { rayonKeys, categoryKeys } from '@/lib/productUtils';

// ── Seed data ────────────────────────────────────────────
const today = new Date();
const d = (offset) => { const dt = new Date(today); dt.setDate(dt.getDate() + offset); return dt.toISOString().split('T')[0]; };

const CATEGORIES = Object.keys(categoryKeys);

// ── Helpers ──────────────────────────────────────────────
const getProductStatus = (expDate) => {
  if (!expDate) return 'ok';
  const t = new Date(); t.setHours(0,0,0,0);
  const e = new Date(expDate); e.setHours(0,0,0,0);
  const diff = Math.ceil((e - t) / 86400000);
  if (diff < 0) return 'expired';
  if (diff <= 3) return 'urgent';
  if (diff <= 7) return 'soon';
  return 'ok';
};

const getDaysRemaining = (expDate) => {
  if (!expDate) return '—';
  const t = new Date(); t.setHours(0,0,0,0);
  const e = new Date(expDate); e.setHours(0,0,0,0);
  return Math.ceil((e - t) / 86400000);
};

const statusConfig = {
  expired: { color: 'bg-red-50 border-red-200 text-red-700', dot: 'bg-red-500' },
  urgent:  { color: 'bg-orange-50 border-orange-200 text-orange-700', dot: 'bg-orange-500' },
  soon:    { color: 'bg-yellow-50 border-yellow-200 text-yellow-700', dot: 'bg-yellow-500' },
  ok:      { color: 'bg-green-50 border-green-200 text-green-700', dot: 'bg-green-500' },
};

// ── Inline StatsCards ────────────────────────────────────
function StatsCards({ products }) {
  const active = products.filter(p => !p.discarded);
  const total = active.length;
  const expired = active.filter(p => getProductStatus(p.expiration_date) === 'expired').length;
  const urgent = active.filter(p => getProductStatus(p.expiration_date) === 'urgent').length;
  const cards = [
    { label: 'Total produits', value: total, icon: Package, bg: 'bg-primary/10', iconColor: 'text-primary' },
    { label: 'Produits expirés', value: expired, icon: XCircle, bg: 'bg-red-50', iconColor: 'text-red-500' },
    { label: 'Produits urgents', value: urgent, icon: AlertTriangle, bg: 'bg-orange-50', iconColor: 'text-orange-500' },
  ];
  return (
    <div className="grid grid-cols-3 gap-2 sm:gap-4">
      {cards.map((c, i) => (
        <div key={i} className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-sm border border-neutral-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">{c.label}</p>
              <p className="text-2xl sm:text-3xl font-bold mt-0.5 sm:mt-1">{c.value}</p>
            </div>
            <div className={`hidden sm:flex w-12 h-12 rounded-xl ${c.bg} items-center justify-center`}>
              <c.icon className={`w-6 h-6 ${c.iconColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Inline WeeklyAlert ───────────────────────────────────
function WeeklyAlert({ products, onProductAction }) {
  const expiredUrgent = products.filter(p => !p.discarded && ['expired','urgent'].includes(getProductStatus(p.expiration_date))).sort((a,b) => new Date(a.expiration_date) - new Date(b.expiration_date));
  const soon = products.filter(p => !p.discarded && getProductStatus(p.expiration_date) === 'soon').sort((a,b) => new Date(a.expiration_date) - new Date(b.expiration_date));
  const all = [...expiredUrgent, ...soon];

  const [showModal, setShowModal] = useState(false);
  const [active, setActive] = useState(null);
  const [filter, setFilter] = useState('all');

  if (all.length === 0) return null;

  const Pill = ({ p }) => {
    const days = getDaysRemaining(p.expiration_date);
    const cfg = statusConfig[getProductStatus(p.expiration_date)];
    return (
      <button onClick={() => { setActive(p); setShowModal(true); }} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border cursor-pointer hover:opacity-80 ${cfg.color}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />{p.name} ({days}j)
      </button>
    );
  };

  return (
    <>
      <div className="space-y-3">
        {expiredUrgent.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <h3 className="font-semibold text-sm text-red-800">Expirés & Urgents</h3>
              <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-800 border border-red-200">{expiredUrgent.length}</span>
            </div>
            <div className="flex flex-wrap gap-2">{expiredUrgent.slice(0,6).map(p => <Pill key={p._id} p={p} />)}</div>
          </div>
        )}
        {soon.length > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <h3 className="font-semibold text-sm text-orange-800">Arrivent bientôt à expiration</h3>
              <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-800 border border-orange-200">{soon.length}</span>
            </div>
            <div className="flex flex-wrap gap-2">{soon.slice(0,6).map(p => <Pill key={p._id} p={p} />)}</div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center" onClick={() => { setShowModal(false); setActive(null); }}>
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0">
              <div className="flex items-center gap-2">
                {active && <button onClick={() => setActive(null)} className="mr-1 text-muted-foreground hover:text-foreground"><ChevronRight className="w-4 h-4 rotate-180" /></button>}
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                <h2 className="font-semibold text-sm">{active ? 'Action rapide' : `Produits à surveiller (${all.length})`}</h2>
              </div>
              <button onClick={() => { setShowModal(false); setActive(null); }}><X className="w-5 h-5 text-muted-foreground" /></button>
            </div>
            {!active && (
              <div className="flex gap-1 px-4 py-2 border-b flex-shrink-0">
                {[{key:'all',label:`Tous (${all.length})`},{key:'expired',label:`Expirés (${expiredUrgent.length})`},{key:'soon',label:`Bientôt (${soon.length})`}].map(t => (
                  <button key={t.key} onClick={() => setFilter(t.key)} className={`px-3 py-1.5 rounded-full text-xs font-medium ${filter===t.key?'bg-primary text-primary-foreground':'text-muted-foreground hover:bg-secondary'}`}>{t.label}</button>
                ))}
              </div>
            )}
            <div className="overflow-y-auto flex-1 px-4 py-3">
              {active ? (
                <QuickActionPanel product={active} onDone={() => { onProductAction(active._id); setActive(null); setShowModal(false); }} />
              ) : (
                <div className="space-y-2">
                  {(filter==='expired'?expiredUrgent:filter==='soon'?soon:all).map(p => {
                    const cfg = statusConfig[getProductStatus(p.expiration_date)];
                    return (
                      <button key={p._id} onClick={() => setActive(p)} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm hover:opacity-90 text-left ${cfg.color}`}>
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                          <div className="min-w-0"><p className="font-medium truncate">{p.name}</p>{p.marque&&<p className="text-xs opacity-70 truncate">{p.marque}</p>}</div>
                        </div>
                        <div className="flex items-center gap-3 ml-3">
                          <span className="text-xs font-semibold">{getDaysRemaining(p.expiration_date)}j</span>
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

function QuickActionPanel({ product, onDone }) {
  const [tab, setTab] = useState('info');
  const [qty, setQty] = useState('');
  const [price, setPrice] = useState(product.price_chf ? String(product.price_chf) : '');
  const [done, setDone] = useState(false);
  const loss = (parseFloat(qty)||0)*(parseFloat(price)||0);

  if (done) return <div className="flex flex-col items-center justify-center py-6 gap-2 text-green-600"><div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center"><CheckCircle2 className="w-5 h-5" /></div><p className="text-sm font-semibold">Mis à jour !</p></div>;

  return (
    <div className="space-y-3">
      <div><p className="font-semibold text-sm">{product.name}</p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {product.marque&&<span className="text-xs text-muted-foreground">{product.marque}</span>}
          {product.rayon&&<span className="text-xs text-muted-foreground">• Rayon {product.rayon}</span>}
        </div>
      </div>
      <div className="flex gap-1 bg-secondary/50 p-1 rounded-xl">
        {[
          {k:'info',l:'Infos',cls:'bg-white shadow-sm text-foreground'},
          {k:'jeter',l:'Jeter',cls:'bg-red-500 text-white shadow-sm'},
        ].map(tb => (
          <button key={tb.k} onClick={() => setTab(tb.k)} className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition-colors ${tab===tb.k?tb.cls:'text-muted-foreground hover:text-foreground'}`}>{tb.l}</button>
        ))}
      </div>
      {tab==='info'&&<div className="text-xs text-muted-foreground space-y-1 px-1">
        {product.expiration_date&&<p>DLC: {product.expiration_date}</p>}
        {product.price_chf&&<p>Prix: CHF {product.price_chf}</p>}
        {product.added_by_name&&<p>Ajouté par: {product.added_by_name}</p>}
      </div>}
      {tab==='jeter'&&<div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div><label className="text-xs font-semibold mb-1 block">Quantité jetée</label><Input type="number" min="0" value={qty} onChange={e=>setQty(e.target.value)} placeholder="0" className="h-10 text-sm rounded-xl" autoFocus /></div>
          <div><label className="text-xs font-semibold mb-1 block">Prix vente CHF</label><Input type="number" min="0" step="0.05" value={price} onChange={e=>setPrice(e.target.value)} placeholder="0.00" className="h-10 text-sm rounded-xl" /></div>
        </div>
        {loss>0&&<div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 flex items-center justify-between"><span className="text-xs font-semibold text-red-700">Perte estimée</span><span className="text-base font-bold text-red-700">CHF {loss.toFixed(2)}</span></div>}
        <Button className="w-full bg-red-500 hover:bg-red-600 text-white rounded-xl" disabled={!qty||!price} onClick={()=>setDone(true)}>Confirmer le jet</Button>
      </div>}
    </div>
  );
}

// ── Inline ProductTable (simplified but visually identical) ──
function ProductTable({ products, onDelete }) {
  if (products.length === 0) return <div className="bg-white rounded-2xl p-12 shadow-sm border text-center"><p className="text-muted-foreground text-sm">Aucun produit</p></div>;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
      <div className="hidden sm:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b bg-neutral-50/50">{['Produit','Marque','Catégorie','Rayon','DLC','Statut','CHF','Action'].map(h=><th key={h} className={`px-4 py-3 font-semibold text-muted-foreground ${h==='CHF'?'text-right':h==='Action'?'text-center w-20':'text-left'}`}>{h}</th>)}</tr></thead>
          <tbody>
            {products.map(p => {
              const st = getProductStatus(p.expiration_date);
              const cfg = statusConfig[st];
              const label = st==='expired'?'Expiré':st==='urgent'?'Urgent (J-3)':st==='soon'?'Bientôt (J-7)':'OK';
              return (
                <tr key={p._id} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                  <td className="px-4 py-3 font-medium">{p.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.marque||'—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{categoryKeys[p.category]||'—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.rayon||'—'}</td>
                  <td className="px-4 py-3">{p.expiration_date||'—'}</td>
                  <td className="px-4 py-3"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.color}`}>{label}</span></td>
                  <td className="px-4 py-3 text-right font-medium">{Number(p.price_chf||0).toFixed(2)}</td>
                  <td className="px-4 py-3 text-center"><Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-red-50 hover:text-red-600" onClick={()=>onDelete(p._id)}><X className="w-3.5 h-3.5" /></Button></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="sm:hidden divide-y">
        {products.map(p => {
          const st = getProductStatus(p.expiration_date);
          const cfg = statusConfig[st];
          const label = st==='expired'?'Expiré':st==='urgent'?'Urgent (J-3)':st==='soon'?'Bientôt (J-7)':'OK';
          return (
            <div key={p._id} className="p-4 space-y-2">
              <div className="flex items-start justify-between">
                <div><p className="font-medium">{p.name}</p><p className="text-xs text-muted-foreground">{p.marque||'—'} · {categoryKeys[p.category]||'—'}</p></div>
                <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.color}`}>{label}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{p.rayon?`Rayon ${p.rayon}`:'—'} · DLC: {p.expiration_date||'—'}</span>
                <span className="font-semibold text-foreground">{Number(p.price_chf||0).toFixed(2)} CHF</span>
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs text-red-600 hover:bg-red-50" onClick={()=>onDelete(p._id)}>Supprimer</Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Inline RayonGroupedTable ──────────────────────────────
function RayonGroupedTable({ products, onDelete }) {
  const groups = useMemo(() => {
    const map = {};
    products.forEach(p => { const k = p.rayon||'__none__'; if(!map[k])map[k]=[]; map[k].push(p); });
    return Object.entries(map).sort((a,b) => {
      const sk = r => r==='__none__'?'zzz':/^\d+$/.test(r)?r.padStart(3,'0'):r;
      return sk(a[0]).localeCompare(sk(b[0]));
    });
  }, [products]);

  const [openRayons, setOpenRayons] = useState({});
  const toggle = (r) => setOpenRayons(p=>({...p,[r]:!p[r]}));
  const isOpen = (r) => openRayons[r] !== undefined ? openRayons[r] : groups.find(([k])=>k===r)?.[1]?.some(p=>['expired','urgent'].includes(getProductStatus(p.expiration_date)));

  if (products.length === 0) return <div className="bg-white rounded-2xl p-12 shadow-sm border text-center"><p className="text-muted-foreground text-sm">Aucun produit trouvé</p></div>;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <p className="text-xs text-muted-foreground">{groups.length} rayon{groups.length>1?'s':''}</p>
        <div className="flex gap-2">
          <button onClick={()=>{const s={};groups.forEach(([r])=>s[r]=true);setOpenRayons(s);}} className="text-xs text-primary hover:underline">Tout ouvrir</button>
          <span className="text-xs text-muted-foreground">·</span>
          <button onClick={()=>setOpenRayons({})} className="text-xs text-muted-foreground hover:underline">Tout fermer</button>
        </div>
      </div>
      {groups.map(([rayon, prods]) => {
        const label = rayon==='__none__'?'Sans rayon':rayon.startsWith('Frigo')||rayon.startsWith('Cong')?rayon:`Rayon ${rayon}`;
        const exp = prods.filter(p=>getProductStatus(p.expiration_date)==='expired').length;
        const urg = prods.filter(p=>getProductStatus(p.expiration_date)==='urgent').length;
        return (
          <div key={rayon} className="space-y-1">
            <button onClick={()=>toggle(rayon)} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors text-left ${isOpen(rayon)?'bg-primary/10 border border-primary/30':'bg-white border hover:border-primary/30 hover:bg-secondary/40'}`}>
              <div className="flex items-center gap-3">
                {isOpen(rayon)?<ChevronDown className="w-4 h-4 text-primary"/>:<ChevronRight className="w-4 h-4 text-muted-foreground"/>}
                <span className={`font-semibold text-sm ${isOpen(rayon)?'text-primary':'text-foreground'}`}>{label}</span>
                <span className="text-xs text-muted-foreground">{prods.length} produit{prods.length>1?'s':''}</span>
              </div>
              <div className="flex items-center gap-1.5">
                {exp>0&&<span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">{exp} expiré{exp>1?'s':''}</span>}
                {urg>0&&<span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">{urg} urgent{urg>1?'s':''}</span>}
              </div>
            </button>
            {isOpen(rayon)&&<div className="ml-0 animate-in slide-in-from-top-1 duration-150"><ProductTable products={prods} onDelete={onDelete}/></div>}
          </div>
        );
      })}
    </div>
  );
}

// ── QuickAdd Modal (inline, mirrors real one) ────────────
function QuickAddModal({ prefill, barcode, existingProduct, onSave, onClose }) {
  const [mode, setMode] = useState(existingProduct ? 'update' : 'create');
  const todayStr = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({
    name: prefill?.name || '', marque: prefill?.brand || prefill?.marque || '',
    category: prefill?.category || '', rayon: prefill?.default_rayon || '',
    expiration_date: '', price_chf: prefill?.default_price_chf || '',
  });
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const imageUrl = prefill?.image_url || null;
  const isManual = !prefill?.name;
  const canSave = form.name && form.expiration_date;

  return (
    <div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md overflow-hidden max-h-[95vh] flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0">
          <div><p className="font-bold text-base">{isManual?'✏️ Ajouter manuellement':'⚡ Ajout rapide'}</p>{barcode&&<p className="text-xs text-muted-foreground font-mono mt-0.5">EAN: {barcode}</p>}</div>
          <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-secondary"><X className="w-5 h-5 text-muted-foreground"/></button>
        </div>
        {!isManual&&<div className="mx-5 mt-4 bg-primary/8 border border-primary/20 rounded-xl px-4 py-3 flex items-start gap-3">
          {imageUrl?<img src={imageUrl} alt={form.name} className="w-12 h-12 object-contain rounded-lg bg-white border flex-shrink-0" onError={e=>{e.target.style.display='none'}}/>:<div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0"><Package className="w-5 h-5 text-primary"/></div>}
          <div className="min-w-0 flex-1"><p className="font-semibold text-sm truncate">{form.name}</p>{form.marque&&<p className="text-xs text-muted-foreground">{form.marque}</p>}{form.category&&<span className="inline-block mt-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{categoryKeys[form.category]||form.category}</span>}</div>
        </div>}
        <div className="px-5 py-4 space-y-4 overflow-y-auto flex-1">
          {(isManual||!isManual)&&<div><label className="block text-sm font-semibold mb-2">Nom du produit{isManual?' *':''}</label><Input value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Ex: Yaourt nature" className="h-12 text-base rounded-xl" autoFocus={isManual}/></div>}
          {isManual&&<div><label className="block text-sm font-semibold mb-2">Marque</label><Input value={form.marque} onChange={e=>set('marque',e.target.value)} placeholder="Ex: Danone" className="h-12 text-base rounded-xl"/></div>}
          <div><label className="block text-sm font-semibold mb-2">📅 Date d'expiration (DLC) *</label><Input type="date" value={form.expiration_date} onChange={e=>set('expiration_date',e.target.value)} className="h-14 text-lg font-medium rounded-xl border-2 border-primary/30 focus:border-primary"/></div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground px-1"><span>📦</span><span>Date de réception: <strong>{todayStr}</strong></span></div>
          <div><label className="block text-sm font-semibold mb-2 flex items-center gap-1.5"><Layers className="w-4 h-4 text-primary"/>Rayon</label>
            <Select value={form.rayon||'__none__'} onValueChange={v=>set('rayon',v==='__none__'?'':v)}><SelectTrigger className="h-12 text-base rounded-xl"><SelectValue placeholder="Choisir un rayon…"/></SelectTrigger><SelectContent><SelectItem value="__none__">— Non défini —</SelectItem>{Object.entries(rayonKeys).map(([v,l])=><SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent></Select></div>
          <div><label className="block text-sm font-semibold mb-2 flex items-center gap-1.5"><Tag className="w-4 h-4 text-primary"/>Catégorie</label>
            <Select value={form.category||'__none__'} onValueChange={v=>set('category',v==='__none__'?'':v)}><SelectTrigger className="h-12 text-base rounded-xl"><SelectValue placeholder="Choisir une catégorie…"/></SelectTrigger><SelectContent><SelectItem value="__none__">— Non défini —</SelectItem>{Object.entries(categoryKeys).map(([v,k])=><SelectItem key={v} value={v}>{k}</SelectItem>)}</SelectContent></Select></div>
          <div><label className="block text-sm font-semibold mb-2">Prix unitaire CHF</label><Input type="number" min="0" step="0.05" value={form.price_chf} onChange={e=>set('price_chf',e.target.value)} placeholder="0.00" className="h-12 text-base rounded-xl"/></div>
        </div>
        {existingProduct&&<div className="mx-5 mt-3 flex-shrink-0">
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 space-y-2">
            <div className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5"/><div><p className="text-sm font-semibold text-amber-800">Ce produit existe déjà dans votre stock</p><p className="text-xs text-amber-600">Ancienne DLC: <strong>{existingProduct.expiration_date||'non définie'}</strong></p></div></div>
            <div className="flex gap-2">
              <button onClick={()=>setMode('update')} className={`flex-1 text-xs py-1.5 px-3 rounded-lg font-semibold border transition-colors ${mode==='update'?'bg-amber-500 text-white border-amber-500':'bg-white text-amber-700 border-amber-300'}`}><RefreshCw className="w-3 h-3 inline mr-1"/>Mettre à jour la DLC</button>
              <button onClick={()=>setMode('create')} className={`flex-1 text-xs py-1.5 px-3 rounded-lg font-semibold border transition-colors ${mode==='create'?'bg-foreground text-white border-foreground':'bg-white text-muted-foreground border-border'}`}>Ajouter quand même</button>
            </div>
          </div>
        </div>}
        <div className="px-5 py-4 border-t bg-white flex-shrink-0">
          <Button className={`w-full h-14 text-base font-bold rounded-xl gap-2 ${mode==='update'?'bg-amber-500 hover:bg-amber-600 text-white':''}`} disabled={!canSave} onClick={()=>{
            onSave({...form,price_chf:Number(form.price_chf)||0,reception_date:todayStr}, mode==='update'&&existingProduct?existingProduct._id:null);
          }}>
            {mode==='update'?<><RefreshCw className="w-5 h-5"/>Mettre à jour la DLC</>:<><CheckCircle2 className="w-5 h-5"/>Enregistrer le produit</>}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Demo Banner ───────────────────────────────────────────
function DemoBanner() {
  return (
    <div className="bg-gradient-to-r from-primary/90 to-primary text-white text-center py-2.5 px-4 text-sm font-medium flex items-center justify-center gap-2">
      <Sparkles className="w-4 h-4" />
      Mode démo — les données ne sont pas sauvegardées.
      <Link to="/register" className="underline underline-offset-2 font-semibold ml-2 hover:text-white/90">Créer un vrai compte →</Link>
    </div>
  );
}

// ── Demo Layout ───────────────────────────────────────────
export default function Demo() {
  const [products, setProducts] = useState(() => [
    { _id: 1, name: 'Lait Candia 1L', marque: 'Candia', category: 'boissons', rayon: 'Frigo 2', expiration_date: d(10), price_chf: 2.50, added_by_name: 'Marie', reception_date: d(-5), discarded: false },
    { _id: 2, name: 'Yaourt nature x12', marque: 'Danone', category: 'produits_frais', rayon: 'Frigo 1', expiration_date: d(2), price_chf: 8.90, added_by_name: 'Marie', reception_date: d(-8), discarded: false },
    { _id: 3, name: 'Jambon de dinde', marque: 'Herta', category: 'produits_frais', rayon: 'Frigo 3', expiration_date: d(5), price_chf: 4.50, added_by_name: 'Marie', reception_date: d(-2), discarded: false },
    { _id: 4, name: 'Riz Basmati 1kg', marque: 'Uncle Bens', category: 'epicerie_seche', rayon: '3', expiration_date: d(180), price_chf: 5.90, added_by_name: 'Marie', reception_date: d(-15), discarded: false },
    { _id: 5, name: 'Coca-Cola 1.5L', marque: 'Coca-Cola', category: 'boissons', rayon: '7', expiration_date: d(60), price_chf: 3.20, added_by_name: 'Marie', reception_date: d(-10), discarded: false },
  ]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [rayonFilter, setRayonFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [quickAdd, setQuickAdd] = useState(null);
  const [groupByRayon, setGroupByRayon] = useState(true);
  const [nextId, setNextId] = useState(6);

  // Form state
  const [form, setForm] = useState({ name: '', marque: '', category: '', rayon: '', expiration_date: '', price_chf: '' });

  const active = useMemo(() => products, [products]);

  const filtered = useMemo(() => active.filter(p => {
    if (p.discarded) return false;
    if (search && !p.name?.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'all') {
      if (statusFilter === 'archived') return false;
      if (getProductStatus(p.expiration_date) !== statusFilter) return false;
    }
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    if (rayonFilter !== 'all' && p.rayon !== rayonFilter) return false;
    return true;
  }), [active, search, statusFilter, categoryFilter, rayonFilter]);

  const activeFilterCount = [statusFilter!=='all',categoryFilter!=='all',rayonFilter!=='all'].filter(Boolean).length;

  const addProduct = (data, updateId) => {
    if (updateId) {
      setProducts(prev => prev.map(p => p._id === updateId ? { ...p, expiration_date: data.expiration_date, price_chf: data.price_chf } : p));
    } else {
      setProducts(prev => [{ _id: nextId, ...data, added_by_name: 'Vous (demo)', discarded: false }, ...prev]);
      setNextId(n => n + 1);
    }
    setQuickAdd(null);
  };

  const addManual = () => {
    if (!form.name || !form.expiration_date) return;
    addProduct({ name: form.name, marque: form.marque, category: form.category, rayon: form.rayon, expiration_date: form.expiration_date, price_chf: Number(form.price_chf) || 0, reception_date: new Date().toISOString().split('T')[0] }, null);
    setForm({ name: '', marque: '', category: '', rayon: '', expiration_date: '', price_chf: '' });
    setShowForm(false);
  };

  const deleteProduct = (id) => setProducts(prev => prev.filter(p => p._id !== id));
  const handleProductAction = (id) => setProducts(prev => prev.map(p => p._id === id ? { ...p, discarded: true } : p));

  // ── Barcode scan flow (mirrors real dashboard) ──────────
  const handleBarcodeDetected = async (code) => {
    setShowScanner(false);
    // Search local BarcodeProduct DB (we don't have it in demo, so go to external lookup)
    try {
      const foodData = await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`).then(r => r.json());
      if (foodData?.status === 1 && foodData?.product) {
        const p = foodData.product;
        const name = p.product_name_fr || p.product_name || p.generic_name || '';
        const brand = p.brands || '';
        const existing = products.find(ep => ep.name?.toLowerCase().trim() === name.toLowerCase().trim() && (ep.marque||'').toLowerCase().trim() === brand.toLowerCase().trim());
        setQuickAdd({ barcode: code, prefill: { name, brand, category: '', image_url: p.image_front_url || p.image_url || '' }, existingProduct: existing || null });
        return;
      }
    } catch (_) {}

    // Not found — manual entry
    setQuickAdd({ barcode: code, prefill: null, existingProduct: null });
  };

  return (
    <div className="min-h-screen pb-20 sm:pb-0 pt-0" style={{ backgroundColor: '#f5f5f5', color: '#1a1a1a' }}>
      <DemoBanner />

      {/* Header — same as real DashboardHeader */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white font-bold text-sm">TS</span>
            </div>
            <span className="font-bold text-base sm:text-lg tracking-tight">TrackSmart <span className="text-primary">Démo</span></span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowScanner(true)} className="rounded-full gap-2">
              <ScanLine className="w-4 h-4" /> Scanner
            </Button>
            <Button size="sm" onClick={() => { setShowForm(!showForm); }} className="rounded-full gap-2">
              <Plus className="w-4 h-4" /> {showForm ? 'Annuler' : 'Ajouter'}
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-6 pb-6 sm:pt-10 sm:pb-8">
        {/* Desktop header */}
        <div className="hidden sm:flex items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">Tableau de bord</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setShowScanner(true)} className="rounded-full gap-2">
              <ScanLine className="w-4 h-4" /> Scanner
            </Button>
            <Button onClick={() => { setShowForm(false); setForm({ name: '', marque: '', category: '', rayon: '', expiration_date: '', price_chf: '' }); setShowForm(true); }} className="rounded-full gap-2">
              <Plus className="w-4 h-4" /> Ajouter un produit
            </Button>
          </div>
        </div>

        {/* Mobile header */}
        <div className="sm:hidden flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold">Tableau de bord</h1>
          <Button size="sm" onClick={() => setShowScanner(true)} className="rounded-full h-9 px-3 gap-1.5 text-xs"><ScanLine className="w-3.5 h-3.5" /> Scanner</Button>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Stats */}
          <StatsCards products={active} />

          {/* Product Form */}
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl p-5 shadow-sm border space-y-4">
              <h3 className="font-bold">Ajouter un produit</h3>
              <div className="grid sm:grid-cols-3 gap-3">
                <Input placeholder="Nom du produit *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="rounded-xl h-10 text-sm" />
                <Input placeholder="Marque" value={form.marque} onChange={e => setForm({...form, marque: e.target.value})} className="rounded-xl h-10 text-sm" />
                <Input type="date" value={form.expiration_date} onChange={e => setForm({...form, expiration_date: e.target.value})} className="rounded-xl h-10 text-sm" />
                <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
                  <SelectTrigger className="rounded-xl h-10 text-sm"><SelectValue placeholder="Catégorie" /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{categoryKeys[c]}</SelectItem>)}</SelectContent>
                </Select>
                <Select value={form.rayon} onValueChange={v => setForm({...form, rayon: v})}>
                  <SelectTrigger className="rounded-xl h-10 text-sm"><SelectValue placeholder="Rayon" /></SelectTrigger>
                  <SelectContent>{Object.entries(rayonKeys).map(([v,l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
                </Select>
                <div className="flex gap-2">
                  <Input type="number" placeholder="Prix CHF" value={form.price_chf} onChange={e => setForm({...form, price_chf: e.target.value})} className="rounded-xl h-10 text-sm" step="0.01" />
                  <Button onClick={addManual} className="rounded-xl h-10">Ajouter</Button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Weekly Alert */}
          <WeeklyAlert products={active} onProductAction={handleProductAction} />

          {/* Filters */}
          <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border space-y-3">
            <div className="flex gap-2 items-center">
              <div className="relative flex-1 max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un produit..." className="pl-9 rounded-full h-9 text-xs" />
              </div>
              <Button variant="outline" size="sm" className={`rounded-full gap-1.5 ${activeFilterCount>0?'border-primary text-primary':''}`} onClick={()=>setShowFilters(f=>!f)}>
                Filtres {activeFilterCount>0&&<span className="bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center text-xs">{activeFilterCount}</span>}
              </Button>
              {activeFilterCount>0&&<Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground" onClick={()=>{setStatusFilter('all');setCategoryFilter('all');setRayonFilter('all');}}><X className="w-3.5 h-3.5"/></Button>}
            </div>
            {showFilters&&<div className="space-y-3 pt-2 border-t">
              <div className="flex flex-wrap gap-1.5">
                {[{key:'all',label:'Tous'},{key:'expired',label:'Expirés'},{key:'urgent',label:'Urgents'},{key:'soon',label:'Bientôt'},{key:'ok',label:'OK'}].map(f=>(
                  <button key={f.key} onClick={()=>setStatusFilter(f.key)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${statusFilter===f.key?'bg-primary text-primary-foreground border-primary':'border-neutral-200 text-muted-foreground hover:border-primary/50'}`}>{f.label}</button>
                ))}
              </div>
              <div className="flex gap-2 flex-wrap">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}><SelectTrigger className="w-44 rounded-full text-xs h-9"><SelectValue placeholder="Catégorie"/></SelectTrigger><SelectContent><SelectItem value="all">Toutes les catégories</SelectItem>{CATEGORIES.map(c=><SelectItem key={c} value={c}>{categoryKeys[c]}</SelectItem>)}</SelectContent></Select>
                <Select value={rayonFilter} onValueChange={setRayonFilter}><SelectTrigger className="w-36 rounded-full text-xs h-9"><SelectValue placeholder="Rayon"/></SelectTrigger><SelectContent><SelectItem value="all">Tous les rayons</SelectItem>{Object.entries(rayonKeys).map(([v,l])=><SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent></Select>
              </div>
            </div>}
          </div>

          {/* View toggle */}
          <div className="flex items-center justify-end gap-2">
            <button onClick={()=>setGroupByRayon(false)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${!groupByRayon?'bg-primary text-primary-foreground border-primary':'border-neutral-200 text-muted-foreground hover:border-primary/50'}`}>Liste</button>
            <button onClick={()=>setGroupByRayon(true)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${groupByRayon?'bg-primary text-primary-foreground border-primary':'border-neutral-200 text-muted-foreground hover:border-primary/50'}`}>Par rayon</button>
          </div>

          {/* Product list */}
          {groupByRayon ? <RayonGroupedTable products={filtered} onDelete={deleteProduct} /> : <ProductTable products={filtered} onDelete={deleteProduct} />}
        </div>
      </main>

      {/* Scanner Modal */}
      {showScanner && <BarcodeScanner lang="fr" onDetected={handleBarcodeDetected} onClose={() => setShowScanner(false)} />}

      {/* QuickAdd Modal */}
      {quickAdd && <QuickAddModal barcode={quickAdd.barcode} prefill={quickAdd.prefill} existingProduct={quickAdd.existingProduct} onSave={addProduct} onClose={() => setQuickAdd(null)} />}
    </div>
  );
}