import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, X, ScanLine, ArrowLeft, Sparkles, Clock, TrendingDown, BarChart3, Package } from 'lucide-react';
import { motion } from 'framer-motion';

// ── Helpers ──────────────────────────────────────────────
const getProductStatus = (expDate) => {
  if (!expDate) return 'ok';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(expDate);
  exp.setHours(0, 0, 0, 0);
  const diff = Math.ceil((exp - today) / (1000 * 60 * 60 * 24));
  if (diff < 0) return 'expired';
  if (diff <= 3) return 'urgent';
  if (diff <= 7) return 'soon';
  return 'ok';
};

const CATEGORIES = [
  'snacks', 'boissons', 'congeles_poisson', 'congeles_poulet', 'produits_frais',
  'epicerie_seche', 'confiseries', 'conserves', 'hygiene_beaute', 'entretien_maison',
  'bebe', 'animaux', 'alcool', 'tabac'
];

const CATEGORY_LABELS = {
  snacks: 'Snacks', boissons: 'Boissons', congeles_poisson: 'Congelés poisson',
  congeles_poulet: 'Congelés poulet', produits_frais: 'Produits frais',
  epicerie_seche: 'Épicerie sèche', confiseries: 'Confiseries', conserves: 'Conserves',
  hygiene_beaute: 'Hygiène & Beauté', entretien_maison: 'Entretien maison',
  bebe: 'Bébé', animaux: 'Animaux', alcool: 'Alcool', tabac: 'Tabac'
};

const RAYONS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15',
  'Frigo 1', 'Frigo 2', 'Frigo 3', 'Frigo 4', 'Frigo 5',
  'Congélateur 1', 'Congélateur 2', 'Congélateur 3'];

let idCounter = 1;

// ── Demo Badge ───────────────────────────────────────────
function DemoBanner() {
  return (
    <div className="bg-gradient-to-r from-primary/90 to-primary text-white text-center py-2.5 px-4 text-sm font-medium flex items-center justify-center gap-2">
      <Sparkles className="w-4 h-4" />
      Mode démo — les données ne sont pas sauvegardées.
      <Link to="/register" className="underline underline-offset-2 font-semibold ml-2 hover:text-white/90">
        Créer un vrai compte →
      </Link>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────
export default function Demo() {
  const [products, setProducts] = useState(() => {
    // Seed with sample data
    const today = new Date();
    const d = (offset) => {
      const dt = new Date(today);
      dt.setDate(dt.getDate() + offset);
      return dt.toISOString().split('T')[0];
    };
    return [
      { _id: 1, name: 'Lait Candia 1L', marque: 'Candia', category: 'boissons', rayon: 'Frigo 2', expiration_date: d(10), price_chf: 2.50, added_by_name: 'Marie', reception_date: d(-5) },
      { _id: 2, name: 'Yaourt nature x12', marque: 'Danone', category: 'produits_frais', rayon: 'Frigo 1', expiration_date: d(2), price_chf: 8.90, added_by_name: 'Marie', reception_date: d(-8) },
      { _id: 3, name: 'Jambon de dinde', marque: 'Herta', category: 'produits_frais', rayon: 'Frigo 3', expiration_date: d(5), price_chf: 4.50, added_by_name: 'Marie', reception_date: d(-2) },
      { _id: 4, name: 'Riz Basmati 1kg', marque: 'Uncle Bens', category: 'epicerie_seche', rayon: '3', expiration_date: d(180), price_chf: 5.90, added_by_name: 'Marie', reception_date: d(-15) },
      { _id: 5, name: 'Coca-Cola 1.5L', marque: 'Coca-Cola', category: 'boissons', rayon: '7', expiration_date: d(60), price_chf: 3.20, added_by_name: 'Marie', reception_date: d(-10) },
    ];
  });
  idCounter = products.length + 1;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [form, setForm] = useState({
    name: '', marque: '', category: '', rayon: '', expiration_date: '', price_chf: '', reception_date: ''
  });

  const filteredProducts = useMemo(() => products.filter((p) => {
    if (search && !p.name?.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== 'all' && getProductStatus(p.expiration_date) !== statusFilter) return false;
    if (categoryFilter !== 'all' && p.category !== categoryFilter) return false;
    return true;
  }), [products, search, statusFilter, categoryFilter]);

  // Stats
  const stats = useMemo(() => {
    const total = products.length;
    const expired = products.filter(p => getProductStatus(p.expiration_date) === 'expired').length;
    const urgent = products.filter(p => getProductStatus(p.expiration_date) === 'urgent').length;
    const totalValue = products.reduce((s, p) => s + (Number(p.price_chf) || 0), 0);
    return { total, expired, urgent, totalValue };
  }, [products]);

  const addProduct = () => {
    if (!form.name || !form.expiration_date) return;
    const newProduct = {
      _id: idCounter++,
      ...form,
      price_chf: Number(form.price_chf) || 0,
      added_by_name: 'Vous (demo)',
      reception_date: form.reception_date || new Date().toISOString().split('T')[0],
    };
    setProducts([newProduct, ...products]);
    setForm({ name: '', marque: '', category: '', rayon: '', expiration_date: '', price_chf: '', reception_date: '' });
    setShowForm(false);
  };

  const deleteProduct = (id) => {
    setProducts(products.filter(p => p._id !== id));
  };

  const updateProduct = (id, field, value) => {
    setProducts(products.map(p => p._id === id ? { ...p, [field]: value } : p));
  };

  const statusColor = (status) => {
    switch (status) {
      case 'expired': return 'border-red-300 bg-red-50 text-red-700';
      case 'urgent': return 'border-orange-300 bg-orange-50 text-orange-700';
      case 'soon': return 'border-yellow-300 bg-yellow-50 text-yellow-700';
      default: return 'border-green-300 bg-green-50 text-green-700';
    }
  };

  const statusLabel = (status) => {
    switch (status) {
      case 'expired': return 'Expiré';
      case 'urgent': return 'Urgent (J-3)';
      case 'soon': return 'Bientôt (J-7)';
      default: return 'OK';
    }
  };

  const activeFilterCount = [statusFilter !== 'all', categoryFilter !== 'all'].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col">
      <DemoBanner />

      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white text-xs font-bold">TS</span>
              </div>
              <span className="font-bold text-sm">TrackSmart <span className="text-primary">Démo</span></span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)} className="rounded-lg gap-1.5">
              <Plus className="w-4 h-4" />
              {showForm ? 'Annuler' : 'Ajouter'}
            </Button>
            <Link to="/register">
              <Button size="sm" className="rounded-lg">Créer un compte</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 py-6 w-full">
        {/* Add Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-5 shadow-sm border border-neutral-200 mb-6"
          >
            <h3 className="font-bold mb-4">Ajouter un produit (démo)</h3>
            <div className="grid sm:grid-cols-3 gap-3">
              <Input placeholder="Nom du produit *" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="rounded-lg h-10 text-sm" />
              <Input placeholder="Marque" value={form.marque} onChange={e => setForm({...form, marque: e.target.value})} className="rounded-lg h-10 text-sm" />
              <Input type="date" value={form.expiration_date} onChange={e => setForm({...form, expiration_date: e.target.value})} className="rounded-lg h-10 text-sm" />
              <Select value={form.category} onValueChange={v => setForm({...form, category: v})}>
                <SelectTrigger className="rounded-lg h-10 text-sm"><SelectValue placeholder="Catégorie" /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>)}</SelectContent>
              </Select>
              <Select value={form.rayon} onValueChange={v => setForm({...form, rayon: v})}>
                <SelectTrigger className="rounded-lg h-10 text-sm"><SelectValue placeholder="Rayon" /></SelectTrigger>
                <SelectContent>{RAYONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
              <div className="flex gap-2">
                <Input type="number" placeholder="Prix CHF" value={form.price_chf} onChange={e => setForm({...form, price_chf: e.target.value})} className="rounded-lg h-10 text-sm" step="0.01" />
                <Button onClick={addProduct} className="rounded-lg h-10">Ajouter</Button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Produits', value: stats.total, icon: Package, color: 'border-blue-200 bg-blue-50' },
            { label: 'Alertes urgentes', value: stats.urgent, icon: Clock, color: 'border-orange-200 bg-orange-50' },
            { label: 'Produits expirés', value: stats.expired, icon: TrendingDown, color: 'border-red-200 bg-red-50' },
            { label: 'Valeur stock (CHF)', value: `${stats.totalValue.toFixed(0)}`, icon: BarChart3, color: 'border-green-200 bg-green-50' },
          ].map((s, i) => (
            <div key={i} className={`rounded-xl border p-3.5 ${s.color}`}>
              <div className="flex items-center gap-2 mb-1">
                <s.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
              <p className="text-xl font-bold">{s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-neutral-200 mb-4">
          <div className="flex gap-2 items-center flex-wrap">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher un produit..." className="pl-9 rounded-full h-9 text-sm" />
            </div>
            <Button
              variant="outline"
              size="sm"
              className={`rounded-full gap-1.5 text-sm ${activeFilterCount > 0 ? 'border-primary text-primary' : ''}`}
              onClick={() => setShowFilters(f => !f)}
            >
              Filtres {activeFilterCount > 0 && <span className="bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center text-xs">{activeFilterCount}</span>}
            </Button>
            {activeFilterCount > 0 && (
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => {setStatusFilter('all'); setCategoryFilter('all');}}>
                <X className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
          {showFilters && (
            <div className="mt-3 pt-3 border-t border-neutral-100 space-y-3">
              <div className="flex flex-wrap gap-1.5">
                {[
                  { key: 'all', label: 'Tous' },
                  { key: 'expired', label: 'Expirés' },
                  { key: 'urgent', label: 'Urgents' },
                  { key: 'soon', label: 'Bientôt' },
                  { key: 'ok', label: 'OK' },
                ].map(f => (
                  <button
                    key={f.key}
                    onClick={() => setStatusFilter(f.key)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                      statusFilter === f.key ? 'bg-primary text-primary-foreground border-primary' : 'border-neutral-200 text-muted-foreground hover:border-primary/50'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-44 rounded-full text-xs h-9"><SelectValue placeholder="Catégorie" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {CATEGORIES.map(c => <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Product List */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg mb-2">Aucun produit trouvé</p>
            <p className="text-sm">Essayez d'ajouter un produit ou modifiez vos filtres.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-neutral-100 bg-neutral-50/50">
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Produit</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Marque</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Catégorie</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Rayon</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">DLC</th>
                    <th className="text-left px-4 py-3 font-semibold text-muted-foreground">Statut</th>
                    <th className="text-right px-4 py-3 font-semibold text-muted-foreground">CHF</th>
                    <th className="text-center px-4 py-3 font-semibold text-muted-foreground w-20">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p) => {
                    const status = getProductStatus(p.expiration_date);
                    return (
                      <tr key={p._id} className="border-b border-neutral-50 hover:bg-neutral-50/50 transition-colors">
                        <td className="px-4 py-3 font-medium">{p.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{p.marque || '—'}</td>
                        <td className="px-4 py-3 text-muted-foreground">{CATEGORY_LABELS[p.category] || '—'}</td>
                        <td className="px-4 py-3 text-muted-foreground">{p.rayon || '—'}</td>
                        <td className="px-4 py-3">{p.expiration_date ? new Date(p.expiration_date).toLocaleDateString('fr-CH') : '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${statusColor(status)}`}>
                            {statusLabel(status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-medium">{Number(p.price_chf || 0).toFixed(2)}</td>
                        <td className="px-4 py-3 text-center">
                          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-red-50 hover:text-red-600" onClick={() => deleteProduct(p._id)}>
                            <X className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-neutral-100">
              {filteredProducts.map((p) => {
                const status = getProductStatus(p.expiration_date);
                return (
                  <div key={p._id} className="p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.marque || '—'} · {CATEGORY_LABELS[p.category] || '—'}</p>
                      </div>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${statusColor(status)}`}>
                        {statusLabel(status)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{p.rayon ? `Rayon ${p.rayon}` : '—'} · DLC: {p.expiration_date ? new Date(p.expiration_date).toLocaleDateString('fr-CH') : '—'}</span>
                      <span className="font-semibold text-foreground">{Number(p.price_chf || 0).toFixed(2)} CHF</span>
                    </div>
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-red-600 hover:bg-red-50" onClick={() => deleteProduct(p._id)}>
                      Supprimer
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <p className="text-center text-xs text-muted-foreground mt-4">
          {products.length} produit{products.length > 1 ? 's' : ''} · Mode démo — rien n'est sauvegardé
        </p>
      </main>
    </div>
  );
}