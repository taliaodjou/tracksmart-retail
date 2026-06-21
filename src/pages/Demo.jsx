import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Search, X, ScanLine, Sparkles, Package, AlertTriangle, XCircle,
  ChevronRight, ChevronDown, CheckCircle2, Tag, Layers, RefreshCw,
  TrendingDown, TrendingUp, PackageX, Flame, BarChart2, ShoppingCart,
  FileText, Download, Send, Building2, Mail, Phone,
  LayoutDashboard, BarChart3, Folder, Users, Crown,
  ShieldCheck, User as UserIcon, Upload, FolderPlus, ChevronLeft,
  FileText as DocIcon, Trash2, MoreVertical, Edit2, UserPlus
} from 'lucide-react';
import { motion } from 'framer-motion';
import BarcodeScanner from '@/components/dashboard/BarcodeScanner';
import { rayonKeys, categoryKeys } from '@/lib/productUtils';
import { format, startOfMonth, subMonths, isSameMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

// ── Seed data ────────────────────────────────────────────
const today = new Date();
const d = (offset) => { const dt = new Date(today); dt.setDate(dt.getDate() + offset); return dt.toISOString().split('T')[0]; };
const dm = (offset) => { const dt = new Date(today); dt.setMonth(dt.getMonth() + offset); return dt.toISOString().split('T')[0]; };

const CATEGORIES = Object.keys(categoryKeys);
const MONTHS_BACK = 6;

const SEED = [
  // ── Active stock (OK) ──────────────────────────────────
  { _id: 1, name: 'Lait Candia 1L', marque: 'Candia', category: 'boissons', rayon: 'Frigo 2', expiration_date: d(10), price_chf: 2.50, added_by_name: 'Marie', reception_date: d(-5), discarded: false, discarded_at: null, action: null, quantity_thrown: 0 },
  { _id: 2, name: 'Yaourt nature x12', marque: 'Danone', category: 'produits_frais', rayon: 'Frigo 1', expiration_date: d(2), price_chf: 8.90, added_by_name: 'Marie', reception_date: d(-8), discarded: false, discarded_at: null, action: null, quantity_thrown: 0 },
  { _id: 3, name: 'Jambon de dinde', marque: 'Herta', category: 'produits_frais', rayon: 'Frigo 3', expiration_date: d(5), price_chf: 4.50, added_by_name: 'Marie', reception_date: d(-2), discarded: false, discarded_at: null, action: 'a_recommander', quantity_thrown: 0 },
  { _id: 4, name: 'Riz Basmati 1kg', marque: 'Uncle Bens', category: 'epicerie_seche', rayon: '3', expiration_date: d(180), price_chf: 5.90, added_by_name: 'Marie', reception_date: d(-15), discarded: false, discarded_at: null, action: null, quantity_thrown: 0 },
  { _id: 5, name: 'Coca-Cola 1.5L', marque: 'Coca-Cola', category: 'boissons', rayon: '7', expiration_date: d(60), price_chf: 3.20, added_by_name: 'Marie', reception_date: d(-10), discarded: false, discarded_at: null, action: null, quantity_thrown: 0 },
  { _id: 6, name: 'Pâtes Barilla 500g', marque: 'Barilla', category: 'epicerie_seche', rayon: '5', expiration_date: d(250), price_chf: 2.80, added_by_name: 'Marie', reception_date: d(-20), discarded: false, discarded_at: null, action: null, quantity_thrown: 0 },
  { _id: 10, name: 'Poulet entier', marque: 'Le Gaulois', category: 'congeles_poulet', rayon: 'Congélateur 1', expiration_date: d(90), price_chf: 12.90, added_by_name: 'Marie', reception_date: d(-3), discarded: false, discarded_at: null, action: null, quantity_thrown: 0 },
  { _id: 11, name: 'Chips nature', marque: 'Lay\'s', category: 'snacks', rayon: '9', expiration_date: d(45), price_chf: 3.90, added_by_name: 'Marie', reception_date: d(-7), discarded: false, discarded_at: null, action: null, quantity_thrown: 0 },
  { _id: 12, name: 'Dentifrice', marque: 'Signal', category: 'hygiene_beaute', rayon: '12', expiration_date: d(365), price_chf: 4.50, added_by_name: 'Marie', reception_date: d(-30), discarded: false, discarded_at: null, action: null, quantity_thrown: 0 },

  // ── Active stock — expired/urgent ──────────────────────
  { _id: 16, name: 'Crème fraîche 33cl', marque: 'Elle & Vire', category: 'produits_frais', rayon: 'Frigo 2', expiration_date: d(-2), price_chf: 3.80, added_by_name: 'Marie', reception_date: d(-15), discarded: false, discarded_at: null, action: null, quantity_thrown: 0 },
  { _id: 17, name: 'Saumon fumé 200g', marque: 'Labeyrie', category: 'congeles_poisson', rayon: 'Frigo 4', expiration_date: d(-3), price_chf: 9.90, added_by_name: 'Marie', reception_date: d(-12), discarded: false, discarded_at: null, action: null, quantity_thrown: 0 },
  { _id: 18, name: 'Mozzarella di bufala', marque: 'Galbani', category: 'produits_frais', rayon: 'Frigo 2', expiration_date: d(-1), price_chf: 5.60, added_by_name: 'Pierre', reception_date: d(-10), discarded: false, discarded_at: null, action: null, quantity_thrown: 0 },
  { _id: 19, name: 'Baguette précuite', marque: 'Harrys', category: 'epicerie_seche', rayon: '1', expiration_date: d(-4), price_chf: 2.20, added_by_name: 'Pierre', reception_date: d(-18), discarded: false, discarded_at: null, action: 'a_recommander', quantity_thrown: 0 },

  // ── More active products ───────────────────────────────
  { _id: 20, name: 'Eau minérale 1.5L', marque: 'Evian', category: 'boissons', rayon: '8', expiration_date: d(365), price_chf: 1.50, added_by_name: 'Marie', reception_date: d(-2), discarded: false, discarded_at: null, action: null, quantity_thrown: 0 },
  { _id: 21, name: 'Café moulu 250g', marque: 'Lavazza', category: 'epicerie_seche', rayon: '6', expiration_date: d(400), price_chf: 7.90, added_by_name: 'Pierre', reception_date: d(-5), discarded: false, discarded_at: null, action: null, quantity_thrown: 0 },
  { _id: 22, name: 'Nutella 750g', marque: 'Ferrero', category: 'epicerie_seche', rayon: '4', expiration_date: d(300), price_chf: 9.50, added_by_name: 'Marie', reception_date: d(-3), discarded: false, discarded_at: null, action: null, quantity_thrown: 0 },
  { _id: 23, name: 'Pizza surgelée', marque: 'Buitoni', category: 'congeles_poulet', rayon: 'Congélateur 2', expiration_date: d(120), price_chf: 5.50, added_by_name: 'Pierre', reception_date: d(-8), discarded: false, discarded_at: null, action: null, quantity_thrown: 0 },
  { _id: 24, name: 'Glace vanille 1L', marque: 'Carte d\'Or', category: 'congeles_poulet', rayon: 'Congélateur 2', expiration_date: d(200), price_chf: 6.90, added_by_name: 'Marie', reception_date: d(-6), discarded: false, discarded_at: null, action: null, quantity_thrown: 0 },
  { _id: 25, name: 'Sauce tomate 500g', marque: 'Panzani', category: 'conserves', rayon: '5', expiration_date: d(450), price_chf: 3.20, added_by_name: 'Pierre', reception_date: d(-20), discarded: false, discarded_at: null, action: null, quantity_thrown: 0 },
  { _id: 26, name: 'Haricots verts boîte', marque: 'd\'Aucy', category: 'conserves', rayon: '5', expiration_date: d(500), price_chf: 2.80, added_by_name: 'Marie', reception_date: d(-25), discarded: false, discarded_at: null, action: null, quantity_thrown: 0 },
  { _id: 27, name: 'Thon entier boîte', marque: 'Saupiquet', category: 'conserves', rayon: '5', expiration_date: d(600), price_chf: 4.50, added_by_name: 'Pierre', reception_date: d(-10), discarded: false, discarded_at: null, action: null, quantity_thrown: 0 },
  { _id: 28, name: 'Chocolat noir 200g', marque: 'Lindt', category: 'confiseries', rayon: '10', expiration_date: d(365), price_chf: 3.90, added_by_name: 'Marie', reception_date: d(-4), discarded: false, discarded_at: null, action: null, quantity_thrown: 0 },
  { _id: 29, name: 'Bonbons Haribo', marque: 'Haribo', category: 'confiseries', rayon: '10', expiration_date: d(280), price_chf: 2.50, added_by_name: 'Pierre', reception_date: d(-7), discarded: false, discarded_at: null, action: null, quantity_thrown: 0 },
  { _id: 30, name: 'Gel douche 250ml', marque: 'Dove', category: 'hygiene_beaute', rayon: '12', expiration_date: d(500), price_chf: 5.50, added_by_name: 'Marie', reception_date: d(-14), discarded: false, discarded_at: null, action: null, quantity_thrown: 0 },
  { _id: 31, name: 'Shampoing 300ml', marque: 'L\'Oréal', category: 'hygiene_beaute', rayon: '12', expiration_date: d(400), price_chf: 7.90, added_by_name: 'Marie', reception_date: d(-14), discarded: false, discarded_at: null, action: null, quantity_thrown: 0 },
  { _id: 32, name: 'Lessive liquide 1L', marque: 'Ariel', category: 'entretien_maison', rayon: '13', expiration_date: d(700), price_chf: 12.50, added_by_name: 'Pierre', reception_date: d(-30), discarded: false, discarded_at: null, action: null, quantity_thrown: 0 },
  { _id: 33, name: 'Liquide vaisselle', marque: 'Paic', category: 'entretien_maison', rayon: '13', expiration_date: d(600), price_chf: 3.50, added_by_name: 'Marie', reception_date: d(-30), discarded: false, discarded_at: null, action: null, quantity_thrown: 0 },
  { _id: 34, name: 'Croûtons nature', marque: 'Old El Paso', category: 'snacks', rayon: '9', expiration_date: d(60), price_chf: 2.90, added_by_name: 'Pierre', reception_date: d(-5), discarded: false, discarded_at: null, action: null, quantity_thrown: 0 },
  { _id: 35, name: 'Bière 33cl x6', marque: 'Heineken', category: 'alcool', rayon: '11', expiration_date: d(200), price_chf: 12.00, added_by_name: 'Marie', reception_date: d(-3), discarded: false, discarded_at: null, action: null, quantity_thrown: 0 },
  { _id: 36, name: 'Vin rouge 75cl', marque: 'Bordeaux', category: 'alcool', rayon: '11', expiration_date: d(1000), price_chf: 15.00, added_by_name: 'Pierre', reception_date: d(-30), discarded: false, discarded_at: null, action: null, quantity_thrown: 0 },
  { _id: 37, name: 'Couches bébé x36', marque: 'Pampers', category: 'bebe', rayon: '14', expiration_date: d(900), price_chf: 18.00, added_by_name: 'Marie', reception_date: d(-10), discarded: false, discarded_at: null, action: null, quantity_thrown: 0 },
  { _id: 38, name: 'Croquettes chien 3kg', marque: 'Royal Canin', category: 'animaux', rayon: '15', expiration_date: d(500), price_chf: 22.00, added_by_name: 'Pierre', reception_date: d(-15), discarded: false, discarded_at: null, action: null, quantity_thrown: 0 },

  // ── Discarded (perte) — current month ──────────────────
  { _id: 7, name: 'Fromage Emmental', marque: 'Président', category: 'produits_frais', rayon: 'Frigo 2', expiration_date: d(-1), price_chf: 6.50, added_by_name: 'Marie', reception_date: d(-14), discarded: true, discarded_at: d(-1), action: 'jeter', quantity_thrown: 3 },
  { _id: 8, name: 'Jus d\'orange 1L', marque: 'Pago', category: 'boissons', rayon: 'Frigo 4', expiration_date: d(-3), price_chf: 4.20, added_by_name: 'Marie', reception_date: d(-18), discarded: true, discarded_at: d(-3), action: 'jeter', quantity_thrown: 2 },
  { _id: 9, name: 'Pain de mie', marque: 'Harrys', category: 'epicerie_seche', rayon: '2', expiration_date: d(-5), price_chf: 3.50, added_by_name: 'Marie', reception_date: d(-20), discarded: true, discarded_at: d(-5), action: 'jeter', quantity_thrown: 5 },

  // ── Discarded (perte) — previous months for analytics ──
  { _id: 13, name: 'Lait entier 1L', marque: 'Candia', category: 'boissons', rayon: 'Frigo 2', expiration_date: dm(-1), price_chf: 2.50, added_by_name: 'Marie', reception_date: dm(-2), discarded: true, discarded_at: dm(-1), action: 'jeter', quantity_thrown: 4 },
  { _id: 14, name: 'Yaourt aux fruits', marque: 'Danone', category: 'produits_frais', rayon: 'Frigo 1', expiration_date: dm(-1), price_chf: 7.50, added_by_name: 'Marie', reception_date: dm(-2), discarded: true, discarded_at: dm(-1), action: 'jeter', quantity_thrown: 6 },
  { _id: 15, name: 'Beurre doux', marque: 'Président', category: 'produits_frais', rayon: 'Frigo 3', expiration_date: dm(-2), price_chf: 4.80, added_by_name: 'Marie', reception_date: dm(-3), discarded: true, discarded_at: dm(-2), action: 'jeter', quantity_thrown: 3 },
  { _id: 39, name: 'Jambon blanc', marque: 'Herta', category: 'produits_frais', rayon: 'Frigo 2', expiration_date: dm(-1), price_chf: 7.20, added_by_name: 'Pierre', reception_date: dm(-2), discarded: true, discarded_at: dm(-1), action: 'jeter', quantity_thrown: 2 },
  { _id: 40, name: 'Crème dessert x4', marque: 'Danette', category: 'produits_frais', rayon: 'Frigo 1', expiration_date: dm(-2), price_chf: 3.90, added_by_name: 'Marie', reception_date: dm(-3), discarded: true, discarded_at: dm(-2), action: 'jeter', quantity_thrown: 4 },
];

// ── Documents seed ─────────────────────────────────────────
const DOC_SEED = [
  { _id: 'd1', name: 'Facture Metro Janvier', file_type: 'application/pdf', category: 'facture', folder_id: null, is_deleted: false, supplier_name: 'Metro Cash & Carry', amount: 1250.50, document_date: '2026-01-15', notes: 'Commande mensuelle', file_size: 245000 },
  { _id: 'd2', name: 'Bon livraison Mars', file_type: 'image/png', category: 'bon_livraison', folder_id: null, is_deleted: false, supplier_name: 'Prodega', amount: 875.00, document_date: '2026-03-22', notes: '', file_size: 380000 },
  { _id: 'd3', name: 'Contrat fournisseur Aligro', file_type: 'application/pdf', category: 'contrat', folder_id: null, is_deleted: false, supplier_name: 'Aligro', amount: null, document_date: '2026-01-01', notes: 'Contrat annuel', file_size: 750000 },
  { _id: 'd4', name: 'Rapport trimestriel T1', file_type: 'application/pdf', category: 'rapport', folder_id: null, is_deleted: false, supplier_name: null, amount: null, document_date: '2026-03-31', notes: 'Généré par TrackSmart', file_size: 320000 },
];

const FOLDER_SEED = [
  { _id: 'f1', name: 'Factures 2026', color: '#C9A646', user_email: 'demo@tracksmart.com' },
  { _id: 'f2', name: 'Fournisseurs', color: '#3B82F6', user_email: 'demo@tracksmart.com' },
  { _id: 'f3', name: 'Contrats', color: '#EF4444', user_email: 'demo@tracksmart.com' },
];

// ── Team seed ──────────────────────────────────────────────
const TEAM_SEED = [
  { _id: 'u1', full_name: 'Marie Dubois', email: 'marie@boutique.ch', role: 'owner', phone_number: '+41 79 123 45 67' },
  { _id: 'u2', full_name: 'Pierre Martin', email: 'pierre@boutique.ch', role: 'manager', phone_number: '+41 79 234 56 78' },
  { _id: 'u3', full_name: 'Sophie Laurent', email: 'sophie@boutique.ch', role: 'employee', phone_number: null },
  { _id: 'u4', full_name: 'Lucas Favre', email: 'lucas@boutique.ch', role: 'employee', phone_number: '+41 79 345 67 89' },
];

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
const isDiscarded = (p) => p.discarded === true;
const calculateTotalLoss = (products) => products.reduce((sum, p) => sum + ((p.quantity_thrown || 0) * (p.price_chf || 0)), 0);
const getMonthKey = (date) => format(date, 'yyyy-MM');
const getMonthLabel = (key) => { const [y, m] = key.split('-'); return format(new Date(parseInt(y), parseInt(m) - 1, 1), 'MMM yy', { locale: fr }); };

const ROLE_CONFIG = {
  owner: { label: 'Propriétaire', icon: Crown, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  manager: { label: 'Gérant', icon: ShieldCheck, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  employee: { label: 'Employé', icon: UserIcon, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
};
const ROLE_PERMS = {
  owner: ['Gestion abonnement', 'Inviter des employés', 'Voir les analytiques', 'Exporter rapports', 'Accès complet'],
  manager: ['Gérer les produits', 'Imports', 'Scans code-barres', 'Commandes', 'Rapports'],
  employee: ['Scanner des produits', 'Ajouter des produits', 'Mettre à jour les statuts', 'Créer des demandes'],
};

const CATEGORY_LABELS = {
  facture:'Facture',bon_livraison:'Bon de livraison',contrat:'Contrat',rapport:'Rapport',tva:'TVA',fiduciaire:'Fiduciaire',fournisseur:'Fournisseur',produit:'Produit',autre:'Autre',
};

// ═══════════ SHARED COMPONENTS ═══════════

function DemoBanner() {
  return (
    <div className="bg-gradient-to-r from-primary/90 to-primary text-white text-center py-2 sm:py-2.5 px-4 text-xs sm:text-sm font-medium flex items-center justify-center gap-2 flex-wrap">
      <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
      Mode démo — données non sauvegardées
      <Link to="/register" className="underline underline-offset-2 font-semibold ml-0.5 hover:text-white/90">Créer un vrai compte →</Link>
    </div>
  );
}

function StatsCards({ products }) {
  const active = products.filter(p => !isDiscarded(p));
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
            <div><p className="text-xs sm:text-sm text-muted-foreground">{c.label}</p><p className="text-2xl sm:text-3xl font-bold mt-0.5 sm:mt-1">{c.value}</p></div>
            <div className={`hidden sm:flex w-12 h-12 rounded-xl ${c.bg} items-center justify-center`}><c.icon className={`w-6 h-6 ${c.iconColor}`} /></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function WeeklyAlert({ products, onProductAction, onEditDlc }) {
  const expiredUrgent = products.filter(p => !isDiscarded(p) && ['expired','urgent'].includes(getProductStatus(p.expiration_date))).sort((a,b) => new Date(a.expiration_date)-new Date(b.expiration_date));
  const soon = products.filter(p => !isDiscarded(p) && getProductStatus(p.expiration_date)==='soon').sort((a,b) => new Date(a.expiration_date)-new Date(b.expiration_date));
  const all = [...expiredUrgent, ...soon];
  const [showModal, setShowModal] = useState(false);
  const [active, setActive] = useState(null);
  const [filter, setFilter] = useState('all');
  if (all.length===0) return null;
  const Pill = ({ p }) => {
    const cfg = statusConfig[getProductStatus(p.expiration_date)];
    return <button onClick={()=>{setActive(p);setShowModal(true)}} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border cursor-pointer hover:opacity-80 ${cfg.color}`}><span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`}/>{p.name} ({getDaysRemaining(p.expiration_date)}j)</button>;
  };
  return (<>
    <div className="space-y-3">
      {expiredUrgent.length>0&&<div className="bg-red-50 border border-red-200 rounded-2xl p-4"><div className="flex items-center gap-2 mb-3"><AlertTriangle className="w-4 h-4 text-red-600"/><h3 className="font-semibold text-sm text-red-800">Expirés & Urgents</h3><span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-800 border border-red-200">{expiredUrgent.length}</span></div><div className="flex flex-wrap gap-2">{expiredUrgent.slice(0,8).map(p=><Pill key={p._id} p={p}/>)}</div></div>}
      {soon.length>0&&<div className="bg-orange-50 border border-orange-200 rounded-2xl p-4"><div className="flex items-center gap-2 mb-3"><AlertTriangle className="w-4 h-4 text-orange-500"/><h3 className="font-semibold text-sm text-orange-800">Arrivent bientôt à expiration</h3><span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-orange-50 text-orange-800 border border-orange-200">{soon.length}</span></div><div className="flex flex-wrap gap-2">{soon.slice(0,6).map(p=><Pill key={p._id} p={p}/>)}</div></div>}
    </div>
    {showModal&&<div className="fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center" onClick={()=>{setShowModal(false);setActive(null)}}><div className="absolute inset-0 bg-black/40"/><div className="relative bg-white rounded-t-3xl sm:rounded-2xl w-full sm:max-w-lg max-h-[90vh] flex flex-col shadow-2xl" onClick={e=>e.stopPropagation()}><div className="flex items-center justify-between px-5 py-4 border-b"><div className="flex items-center gap-2">{active&&<button onClick={()=>setActive(null)} className="mr-1 text-muted-foreground hover:text-foreground"><ChevronRight className="w-4 h-4 rotate-180"/></button>}<AlertTriangle className="w-4 h-4 text-orange-600"/><h2 className="font-semibold text-sm">{active?'Action rapide':`Produits à surveiller (${all.length})`}</h2></div><button onClick={()=>{setShowModal(false);setActive(null)}}><X className="w-5 h-5 text-muted-foreground"/></button></div>{!active&&<div className="flex gap-1 px-4 py-2 border-b">{[{key:'all',label:`Tous (${all.length})`},{key:'expired',label:`Expirés (${expiredUrgent.length})`},{key:'soon',label:`Bientôt (${soon.length})`}].map(t=><button key={t.key} onClick={()=>setFilter(t.key)} className={`px-3 py-1.5 rounded-full text-xs font-medium ${filter===t.key?'bg-primary text-primary-foreground':'text-muted-foreground hover:bg-secondary'}`}>{t.label}</button>)}</div>}<div className="overflow-y-auto flex-1 px-4 py-3">{active?<QuickActionPanel product={active} onDone={()=>{onProductAction(active._id);setActive(null);setShowModal(false)}} onEditDlc={onEditDlc}/>:<div className="space-y-2">{(filter==='expired'?expiredUrgent:filter==='soon'?soon:all).map(p=>{const cfg=statusConfig[getProductStatus(p.expiration_date)];return <button key={p._id} onClick={()=>setActive(p)} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm hover:opacity-90 text-left ${cfg.color}`}><div className="flex items-center gap-2 min-w-0"><span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`}/><div className="min-w-0"><p className="font-medium truncate">{p.name}</p>{p.marque&&<p className="text-xs opacity-70 truncate">{p.marque}</p>}</div></div><div className="flex items-center gap-3 ml-3"><span className="text-xs font-semibold">{getDaysRemaining(p.expiration_date)}j</span><ChevronRight className="w-4 h-4 opacity-50"/></div></button>})}</div>}</div></div></div>}
  </>);
}

function QuickActionPanel({ product, onDone, onEditDlc }) {
  const [tab, setTab] = useState('info'); const [qty, setQty] = useState(''); const [price, setPrice] = useState(product.price_chf?String(product.price_chf):''); const [done, setDone] = useState(false);
  const [newDlc, setNewDlc] = useState(product.expiration_date||'');
  const loss = (parseFloat(qty)||0)*(parseFloat(price)||0);
  if (done) return <div className="flex flex-col items-center justify-center py-6 gap-2 text-green-600"><div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center"><CheckCircle2 className="w-5 h-5"/></div><p className="text-sm font-semibold">Mis à jour !</p></div>;
  return <div className="space-y-3"><div><p className="font-semibold text-sm">{product.name}</p><div className="flex items-center gap-2 mt-0.5 flex-wrap">{product.marque&&<span className="text-xs text-muted-foreground">{product.marque}</span>}{product.rayon&&<span className="text-xs text-muted-foreground">• Rayon {product.rayon}</span>}</div></div><div className="flex gap-1 bg-secondary/50 p-1 rounded-xl flex-wrap">{[{k:'info',l:'Infos',cls:'bg-white shadow-sm text-foreground'},{k:'modifier',l:'Modifier DLC',cls:'bg-primary/80 text-white shadow-sm'},{k:'jeter',l:'Jeter',cls:'bg-red-500 text-white shadow-sm'}].map(tb=><button key={tb.k} onClick={()=>setTab(tb.k)} className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${tab===tb.k?tb.cls:'text-muted-foreground hover:text-foreground'}`}>{tb.l}</button>)}</div>{tab==='info'&&<div className="text-xs text-muted-foreground space-y-1 px-1">{product.expiration_date&&<p>DLC: {product.expiration_date}</p>}{product.price_chf&&<p>Prix: CHF {product.price_chf}</p>}{product.added_by_name&&<p>Ajouté par: {product.added_by_name}</p>}</div>}{tab==='modifier'&&<div className="space-y-3"><div><label className="text-xs font-semibold mb-1 block">📅 Nouvelle date d'expiration</label><Input type="date" value={newDlc} onChange={e=>setNewDlc(e.target.value)} className="h-14 text-lg font-medium rounded-xl border-2 border-primary/30 focus:border-primary"/></div><p className="text-xs text-muted-foreground">Ancienne DLC: <strong>{product.expiration_date}</strong></p><Button className="w-full rounded-xl h-12" disabled={!newDlc||newDlc===product.expiration_date} onClick={()=>{if(onEditDlc)onEditDlc(product._id,newDlc);setDone(true)}}>💾 Enregistrer la nouvelle DLC</Button></div>}{tab==='jeter'&&<div className="space-y-3"><div className="grid grid-cols-2 gap-2"><div><label className="text-xs font-semibold mb-1 block">Quantité jetée</label><Input type="number" min="0" value={qty} onChange={e=>setQty(e.target.value)} placeholder="0" className="h-10 text-sm rounded-xl" autoFocus/></div><div><label className="text-xs font-semibold mb-1 block">Prix vente CHF</label><Input type="number" min="0" step="0.05" value={price} onChange={e=>setPrice(e.target.value)} placeholder="0.00" className="h-10 text-sm rounded-xl"/></div></div>{loss>0&&<div className="bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 flex items-center justify-between"><span className="text-xs font-semibold text-red-700">Perte estimée</span><span className="text-base font-bold text-red-700">CHF {loss.toFixed(2)}</span></div>}<Button className="w-full bg-red-500 hover:bg-red-600 text-white rounded-xl" disabled={!qty||!price} onClick={()=>setDone(true)}>Confirmer le jet</Button></div>}</div>;
}

function ProductTable({ products, onDelete, onEdit }) {
  if (!products.length) return <div className="bg-white rounded-2xl p-12 shadow-sm border text-center"><p className="text-muted-foreground text-sm">Aucun produit</p></div>;
  return (<div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
    <div className="hidden sm:block overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b bg-neutral-50/50">{['Produit','Marque','Catégorie','Rayon','DLC','Statut','CHF','Action'].map(h=><th key={h} className={`px-4 py-3 font-semibold text-muted-foreground ${h==='CHF'?'text-right':h==='Action'?'text-center w-20':'text-left'}`}>{h}</th>)}</tr></thead><tbody>{products.map(p=>{const st=getProductStatus(p.expiration_date);const cfg=statusConfig[st];const lbl=st==='expired'?'Expiré':st==='urgent'?'Urgent (J-3)':st==='soon'?'Bientôt (J-7)':'OK';return <tr key={p._id} className="border-b border-neutral-50 hover:bg-neutral-50/50"><td className="px-4 py-3 font-medium">{p.name}</td><td className="px-4 py-3 text-muted-foreground">{p.marque||'—'}</td><td className="px-4 py-3 text-muted-foreground">{categoryKeys[p.category]||'—'}</td><td className="px-4 py-3 text-muted-foreground">{p.rayon||'—'}</td><td className="px-4 py-3">{p.expiration_date||'—'}</td><td className="px-4 py-3"><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.color}`}>{lbl}</span></td><td className="px-4 py-3 text-right font-medium">{Number(p.price_chf||0).toFixed(2)}</td><td className="px-4 py-3 text-center"><div className="flex items-center justify-center gap-1">{onEdit&&<Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-primary/10 hover:text-primary" onClick={()=>onEdit(p)}><Edit2 className="w-3 h-3"/></Button>}<Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-red-50 hover:text-red-600" onClick={()=>onDelete(p._id)}><X className="w-3.5 h-3.5"/></Button></div></td></tr>})}</tbody></table></div>
    <div className="sm:hidden divide-y">{products.map(p=>{const st=getProductStatus(p.expiration_date);const cfg=statusConfig[st];const lbl=st==='expired'?'Expiré':st==='urgent'?'Urgent (J-3)':st==='soon'?'Bientôt (J-7)':'OK';return <div key={p._id} className="p-4 space-y-2"><div className="flex items-start justify-between"><div><p className="font-medium text-sm">{p.name}</p><p className="text-xs text-muted-foreground">{p.marque||'—'} · {categoryKeys[p.category]||'—'}</p></div><span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.color}`}>{lbl}</span></div><div className="flex items-center justify-between text-xs text-muted-foreground"><span>{p.rayon?`Rayon ${p.rayon}`:'—'} · DLC: {p.expiration_date||'—'}</span><span className="font-semibold text-foreground">{Number(p.price_chf||0).toFixed(2)} CHF</span></div><div className="flex gap-2">{onEdit&&<Button variant="ghost" size="sm" className="h-7 text-xs text-primary hover:bg-primary/10" onClick={()=>onEdit(p)}><Edit2 className="w-3 h-3 mr-1"/>Modifier</Button>}<Button variant="ghost" size="sm" className="h-7 text-xs text-red-600 hover:bg-red-50" onClick={()=>onDelete(p._id)}>Supprimer</Button></div></div>})}</div>
  </div>);
}

function RayonGroupedTable({ products, onDelete, onEdit }) {
  const groups = useMemo(()=>{const m={};products.forEach(p=>{const k=p.rayon||'__none__';if(!m[k])m[k]=[];m[k].push(p)});return Object.entries(m).sort((a,b)=>{const sk=r=>r==='__none__'?'zzz':/^\d+$/.test(r)?r.padStart(3,'0'):r;return sk(a[0]).localeCompare(sk(b[0]))})},[products]);
  const [open,setOpen]=useState({});const toggle=r=>setOpen(p=>({...p,[r]:!p[r]}));const isO=r=>open[r]!==undefined?open[r]:groups.find(([k])=>k===r)?.[1]?.some(p=>['expired','urgent'].includes(getProductStatus(p.expiration_date)));
  if(!products.length) return <div className="bg-white rounded-2xl p-12 shadow-sm border text-center"><p className="text-muted-foreground text-sm">Aucun produit trouvé</p></div>;
  return (<div className="space-y-2"><div className="flex items-center justify-between px-1"><p className="text-xs text-muted-foreground">{groups.length} rayon{groups.length>1?'s':''}</p><div className="flex gap-2"><button onClick={()=>{const s={};groups.forEach(([r])=>s[r]=true);setOpen(s)}} className="text-xs text-primary hover:underline">Tout ouvrir</button><span className="text-xs text-muted-foreground">·</span><button onClick={()=>setOpen({})} className="text-xs text-muted-foreground hover:underline">Tout fermer</button></div></div>{groups.map(([rayon,prods])=>{const lbl=rayon==='__none__'?'Sans rayon':rayon.startsWith('Frigo')||rayon.startsWith('Cong')?rayon:`Rayon ${rayon}`;const exp=prods.filter(p=>getProductStatus(p.expiration_date)==='expired').length;const urg=prods.filter(p=>getProductStatus(p.expiration_date)==='urgent').length;return <div key={rayon} className="space-y-1"><button onClick={()=>toggle(rayon)} className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-colors text-left ${isO(rayon)?'bg-primary/10 border border-primary/30':'bg-white border hover:border-primary/30 hover:bg-secondary/40'}`}><div className="flex items-center gap-3">{isO(rayon)?<ChevronDown className="w-4 h-4 text-primary"/>:<ChevronRight className="w-4 h-4 text-muted-foreground"/>}<span className={`font-semibold text-sm ${isO(rayon)?'text-primary':'text-foreground'}`}>{lbl}</span><span className="text-xs text-muted-foreground">{prods.length} produit{prods.length>1?'s':''}</span></div><div className="flex items-center gap-1.5">{exp>0&&<span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">{exp} expiré{exp>1?'s':''}</span>}{urg>0&&<span className="px-2 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">{urg} urgent{urg>1?'s':''}</span>}</div></button>{isO(rayon)&&<div className="ml-0 animate-in slide-in-from-top-1 duration-150"><ProductTable products={prods} onDelete={onDelete} onEdit={onEdit}/></div>}</div>})}</div>);
}

function QuickAddModal({ prefill, barcode, existingProduct, onSave, onClose }) {
  const [mode, setMode] = useState(existingProduct?'update':'create');
  const todayStr = new Date().toISOString().split('T')[0];
  const [form, setForm] = useState({name:prefill?.name||'',marque:prefill?.brand||prefill?.marque||'',category:prefill?.category||'',rayon:prefill?.default_rayon||'',expiration_date:'',price_chf:prefill?.default_price_chf||''});
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const imgUrl=prefill?.image_url||null;const isManual=!prefill?.name;const canSave=form.name&&form.expiration_date;
  return (<div className="fixed inset-0 z-[70] bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center"><div className="bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl w-full sm:max-w-md overflow-hidden max-h-[95vh] flex flex-col"><div className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"><div><p className="font-bold text-base">{isManual?'✏️ Ajouter manuellement':'⚡ Ajout rapide'}</p>{barcode&&<p className="text-xs text-muted-foreground font-mono mt-0.5">EAN: {barcode}</p>}</div><button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-secondary"><X className="w-5 h-5 text-muted-foreground"/></button></div>{!isManual&&<div className="mx-5 mt-4 bg-primary/8 border border-primary/20 rounded-xl px-4 py-3 flex items-start gap-3">{imgUrl?<img src={imgUrl} alt={form.name} className="w-12 h-12 object-contain rounded-lg bg-white border flex-shrink-0" onError={e=>{e.target.style.display='none'}}/>:<div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center flex-shrink-0"><Package className="w-5 h-5 text-primary"/></div>}<div className="min-w-0 flex-1"><p className="font-semibold text-sm truncate">{form.name}</p>{form.marque&&<p className="text-xs text-muted-foreground">{form.marque}</p>}{form.category&&<span className="inline-block mt-1 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">{categoryKeys[form.category]||form.category}</span>}</div></div>}<div className="px-5 py-4 space-y-4 overflow-y-auto flex-1"><div><label className="block text-sm font-semibold mb-2">Nom du produit{isManual?' *':''}</label><Input value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Ex: Yaourt nature" className="h-12 text-base rounded-xl" autoFocus={isManual}/></div>{isManual&&<div><label className="block text-sm font-semibold mb-2">Marque</label><Input value={form.marque} onChange={e=>set('marque',e.target.value)} placeholder="Ex: Danone" className="h-12 text-base rounded-xl"/></div>}<div><label className="block text-sm font-semibold mb-2">📅 Date d'expiration (DLC) *</label><Input type="date" value={form.expiration_date} onChange={e=>set('expiration_date',e.target.value)} className="h-14 text-lg font-medium rounded-xl border-2 border-primary/30 focus:border-primary"/></div><div className="flex items-center gap-2 text-xs text-muted-foreground px-1"><span>📦</span><span>Date de réception: <strong>{todayStr}</strong></span></div><div><label className="block text-sm font-semibold mb-2 flex items-center gap-1.5"><Layers className="w-4 h-4 text-primary"/>Rayon</label><Select value={form.rayon||'__none__'} onValueChange={v=>set('rayon',v==='__none__'?'':v)}><SelectTrigger className="h-12 text-base rounded-xl"><SelectValue placeholder="Choisir un rayon…"/></SelectTrigger><SelectContent><SelectItem value="__none__">— Non défini —</SelectItem>{Object.entries(rayonKeys).map(([v,l])=><SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent></Select></div><div><label className="block text-sm font-semibold mb-2 flex items-center gap-1.5"><Tag className="w-4 h-4 text-primary"/>Catégorie</label><Select value={form.category||'__none__'} onValueChange={v=>set('category',v==='__none__'?'':v)}><SelectTrigger className="h-12 text-base rounded-xl"><SelectValue placeholder="Choisir une catégorie…"/></SelectTrigger><SelectContent><SelectItem value="__none__">— Non défini —</SelectItem>{Object.entries(categoryKeys).map(([v,k])=><SelectItem key={v} value={v}>{k}</SelectItem>)}</SelectContent></Select></div><div><label className="block text-sm font-semibold mb-2">Prix unitaire CHF</label><Input type="number" min="0" step="0.05" value={form.price_chf} onChange={e=>set('price_chf',e.target.value)} placeholder="0.00" className="h-12 text-base rounded-xl"/></div></div>{existingProduct&&<div className="mx-5 mt-3 flex-shrink-0"><div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 space-y-2"><div className="flex items-start gap-2"><AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5"/><div><p className="text-sm font-semibold text-amber-800">Ce produit existe déjà dans votre stock</p><p className="text-xs text-amber-600">Ancienne DLC: <strong>{existingProduct.expiration_date||'non définie'}</strong></p></div></div><div className="flex gap-2"><button onClick={()=>setMode('update')} className={`flex-1 text-xs py-1.5 px-3 rounded-lg font-semibold border transition-colors ${mode==='update'?'bg-amber-500 text-white border-amber-500':'bg-white text-amber-700 border-amber-300'}`}><RefreshCw className="w-3 h-3 inline mr-1"/>Mettre à jour la DLC</button><button onClick={()=>setMode('create')} className={`flex-1 text-xs py-1.5 px-3 rounded-lg font-semibold border transition-colors ${mode==='create'?'bg-foreground text-white border-foreground':'bg-white text-muted-foreground border-border'}`}>Ajouter quand même</button></div></div></div>}<div className="px-5 py-4 border-t bg-white flex-shrink-0"><Button className={`w-full h-14 text-base font-bold rounded-xl gap-2 ${mode==='update'?'bg-amber-500 hover:bg-amber-600 text-white':''}`} disabled={!canSave} onClick={()=>onSave({...form,price_chf:Number(form.price_chf)||0,reception_date:todayStr},mode==='update'&&existingProduct?existingProduct._id:null)}>{mode==='update'?<><RefreshCw className="w-5 h-5"/>Mettre à jour la DLC</>:<><CheckCircle2 className="w-5 h-5"/>Enregistrer le produit</>}</Button></div></div></div>);
}

// ═══════════ TAB: DASHBOARD ═══════════
function DashboardTab({ products, addProduct, deleteProduct, handleProductAction, editProductDlc, editProductField }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [rayonFilter, setRayonFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [groupByRayon, setGroupByRayon] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({name:'',marque:'',category:'',rayon:'',expiration_date:'',price_chf:''});
  const [editing, setEditing] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [showLossModal, setShowLossModal] = useState(false);

  const active = useMemo(()=>products,[products]);
  const filtered = useMemo(()=>active.filter(p=>{if(isDiscarded(p))return false;if(search&&!p.name?.toLowerCase().includes(search.toLowerCase()))return false;if(statusFilter!=='all'&&getProductStatus(p.expiration_date)!==statusFilter)return false;if(categoryFilter!=='all'&&p.category!==categoryFilter)return false;if(rayonFilter!=='all'&&p.rayon!==rayonFilter)return false;return true}),[active,search,statusFilter,categoryFilter,rayonFilter]);
  const afc = [statusFilter!=='all',categoryFilter!=='all',rayonFilter!=='all'].filter(Boolean).length;
  const addManual = () => {if(!form.name||!form.expiration_date)return;addProduct({name:form.name,marque:form.marque,category:form.category,rayon:form.rayon,expiration_date:form.expiration_date,price_chf:Number(form.price_chf)||0,reception_date:new Date().toISOString().split('T')[0]},null);setForm({name:'',marque:'',category:'',rayon:'',expiration_date:'',price_chf:''});setShowForm(false)};
  const handleEdit = (p) => {setEditing(p._id);setEditForm({expiration_date:p.expiration_date,price_chf:p.price_chf,rayon:p.rayon,category:p.category});};
  const applyEdit = () => {if(editing){editProductField(editing,editForm);setEditing(null);setEditForm({});}};

  // Loss recap data
  const thrownProducts = active.filter(p=>p.discarded&&p.action==='jeter'&&p.quantity_thrown>0&&p.price_chf>0);
  const lossTotal = thrownProducts.reduce((s,p)=>s+((p.quantity_thrown||0)*(p.price_chf||0)),0);

  return (<div className="space-y-4 sm:space-y-6">
    <StatsCards products={active}/>
    {showForm&&<motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} className="bg-white rounded-2xl p-5 shadow-sm border space-y-4"><h3 className="font-bold">Ajouter un produit</h3><div className="grid sm:grid-cols-3 gap-3"><Input placeholder="Nom du produit *" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} className="rounded-xl h-10 text-sm"/><Input placeholder="Marque" value={form.marque} onChange={e=>setForm({...form,marque:e.target.value})} className="rounded-xl h-10 text-sm"/><Input type="date" value={form.expiration_date} onChange={e=>setForm({...form,expiration_date:e.target.value})} className="rounded-xl h-10 text-sm"/><Select value={form.category} onValueChange={v=>setForm({...form,category:v})}><SelectTrigger className="rounded-xl h-10 text-sm"><SelectValue placeholder="Catégorie"/></SelectTrigger><SelectContent>{CATEGORIES.map(c=><SelectItem key={c} value={c}>{categoryKeys[c]}</SelectItem>)}</SelectContent></Select><Select value={form.rayon} onValueChange={v=>setForm({...form,rayon:v})}><SelectTrigger className="rounded-xl h-10 text-sm"><SelectValue placeholder="Rayon"/></SelectTrigger><SelectContent>{Object.entries(rayonKeys).map(([v,l])=><SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent></Select><div className="flex gap-2"><Input type="number" placeholder="Prix CHF" value={form.price_chf} onChange={e=>setForm({...form,price_chf:e.target.value})} className="rounded-xl h-10 text-sm" step="0.01"/><Button onClick={addManual} className="rounded-xl h-10">Ajouter</Button></div></div></motion.div>}

    {editing&&<motion.div initial={{opacity:0,y:-10}} animate={{opacity:1,y:0}} className="bg-primary/5 rounded-2xl p-5 border border-primary/20 space-y-4"><h3 className="font-bold text-sm">✏️ Modifier le produit</h3><div className="grid sm:grid-cols-3 gap-3"><div><label className="text-xs font-semibold mb-1 block">📅 DLC</label><Input type="date" value={editForm.expiration_date||''} onChange={e=>setEditForm({...editForm,expiration_date:e.target.value})} className="rounded-xl h-10 text-sm"/></div><div><label className="text-xs font-semibold mb-1 block">Prix CHF</label><Input type="number" step="0.01" value={editForm.price_chf||''} onChange={e=>setEditForm({...editForm,price_chf:e.target.value})} className="rounded-xl h-10 text-sm"/></div><div><label className="text-xs font-semibold mb-1 block">Rayon</label><Select value={editForm.rayon||''} onValueChange={v=>setEditForm({...editForm,rayon:v})}><SelectTrigger className="rounded-xl h-10 text-sm"><SelectValue placeholder="Rayon"/></SelectTrigger><SelectContent>{Object.entries(rayonKeys).map(([v,l])=><SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent></Select></div></div><div className="flex gap-2"><Button onClick={applyEdit} className="rounded-xl h-10">💾 Enregistrer</Button><Button variant="outline" onClick={()=>{setEditing(null);setEditForm({})}} className="rounded-xl h-10">Annuler</Button></div></motion.div>}

    <WeeklyAlert products={active} onProductAction={handleProductAction} onEditDlc={editProductDlc}/>
    <div className="bg-white rounded-2xl p-3 sm:p-4 shadow-sm border space-y-3"><div className="flex gap-2 items-center"><div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/><Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un produit..." className="pl-9 rounded-full h-9 text-xs"/></div><Button variant="outline" size="sm" className={`rounded-full gap-1.5 ${afc>0?'border-primary text-primary':''}`} onClick={()=>setShowFilters(f=>!f)}>Filtres {afc>0&&<span className="bg-primary text-primary-foreground rounded-full w-4 h-4 flex items-center justify-center text-xs">{afc}</span>}</Button>{afc>0&&<Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-muted-foreground" onClick={()=>{setStatusFilter('all');setCategoryFilter('all');setRayonFilter('all')}}><X className="w-3.5 h-3.5"/></Button>}</div>{showFilters&&<div className="space-y-3 pt-2 border-t"><div className="flex flex-wrap gap-1.5">{[{key:'all',label:'Tous'},{key:'expired',label:'Expirés'},{key:'urgent',label:'Urgents'},{key:'soon',label:'Bientôt'},{key:'ok',label:'OK'}].map(f=><button key={f.key} onClick={()=>setStatusFilter(f.key)} className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${statusFilter===f.key?'bg-primary text-primary-foreground border-primary':'border-neutral-200 text-muted-foreground hover:border-primary/50'}`}>{f.label}</button>)}</div><div className="flex gap-2 flex-wrap"><Select value={categoryFilter} onValueChange={setCategoryFilter}><SelectTrigger className="w-44 rounded-full text-xs h-9"><SelectValue placeholder="Catégorie"/></SelectTrigger><SelectContent><SelectItem value="all">Toutes les catégories</SelectItem>{CATEGORIES.map(c=><SelectItem key={c} value={c}>{categoryKeys[c]}</SelectItem>)}</SelectContent></Select><Select value={rayonFilter} onValueChange={setRayonFilter}><SelectTrigger className="w-36 rounded-full text-xs h-9"><SelectValue placeholder="Rayon"/></SelectTrigger><SelectContent><SelectItem value="all">Tous les rayons</SelectItem>{Object.entries(rayonKeys).map(([v,l])=><SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent></Select></div></div>}</div>
    <div className="flex items-center justify-end gap-2"><button onClick={()=>setGroupByRayon(false)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${!groupByRayon?'bg-primary text-primary-foreground border-primary':'border-neutral-200 text-muted-foreground hover:border-primary/50'}`}>Liste</button><button onClick={()=>setGroupByRayon(true)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${groupByRayon?'bg-primary text-primary-foreground border-primary':'border-neutral-200 text-muted-foreground hover:border-primary/50'}`}>Par rayon</button></div>
    {groupByRayon?<RayonGroupedTable products={filtered} onDelete={deleteProduct} onEdit={handleEdit}/>:<ProductTable products={filtered} onDelete={deleteProduct} onEdit={handleEdit}/>}

    {/* Loss recap */}
    <div className="bg-white rounded-2xl shadow-sm border p-4">
      <div className="flex items-center justify-between cursor-pointer" onClick={()=>setShowLossModal(!showLossModal)}>
        <div className="flex items-center gap-2">
          <TrendingDown className="w-4 h-4 text-red-600"/>
          <span className="font-semibold text-sm">Récapitulatif des pertes</span>
          <span className="text-xs bg-red-50 text-red-700 px-2 py-0.5 rounded-full font-medium">{thrownProducts.length} produit{thrownProducts.length>1?'s':''}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-red-700">CHF {lossTotal.toFixed(2)}</span>
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${showLossModal?'rotate-180':''}`}/>
        </div>
      </div>
      {showLossModal&&<div className="mt-4 space-y-2 border-t pt-3">
        {thrownProducts.length===0?<p className="text-center text-sm text-muted-foreground py-4">Aucun produit jeté enregistré</p>:thrownProducts.map(p=>{const t=(p.quantity_thrown||0)*(p.price_chf||0);return <div key={p._id} className="flex items-center justify-between bg-red-50/60 border border-red-100 rounded-xl px-4 py-3"><div className="min-w-0 flex-1"><p className="font-medium text-sm truncate">{p.name}</p><div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-0.5 text-xs text-muted-foreground">{p.marque&&<span>{p.marque}</span>}{p.category&&<span>· {categoryKeys[p.category]||p.category}</span>}{p.rayon&&<span>· Rayon {p.rayon}</span>}</div><p className="text-xs text-muted-foreground mt-1">{p.quantity_thrown} unité{p.quantity_thrown>1?'s':''} × CHF {Number(p.price_chf).toFixed(2)} 🗑 Jeté le {p.discarded_at||'—'}</p></div><div className="ml-4 flex-shrink-0 text-right"><span className="text-sm font-bold text-red-700">CHF {t.toFixed(2)}</span></div></div>})}
      </div>}
    </div>
  </div>);
}

// ═══════════ TAB: ANALYTICS ═══════════
function AnalyticsTab({ products }) {
  const monthlyData = useMemo(()=>{const months=[];for(let i=MONTHS_BACK-1;i>=0;i--){months.push(getMonthKey(subMonths(new Date(),i)))}return months.map(monthKey=>{const [y,m]=monthKey.split('-');const monthDate=new Date(parseInt(y),parseInt(m)-1,1);const expiredInMonth=products.filter(p=>{const dc=p.discarded_at?new Date(p.discarded_at):(p.expiration_date?new Date(p.expiration_date):null);if(!dc)return false;return isSameMonth(dc,monthDate)});const tl=expiredInMonth.reduce((s,p)=>s+((p.quantity_thrown||0)*(p.price_chf||0)),0);const tq=expiredInMonth.reduce((s,p)=>s+(p.quantity_thrown||0),0);return {month:monthKey,label:getMonthLabel(monthKey),expiredCount:expiredInMonth.length,totalLoss:parseFloat(tl.toFixed(2)),totalThrown:tq}})},[products]);
  const cur=monthlyData[monthlyData.length-1],prv=monthlyData[monthlyData.length-2];
  const lossTrend=prv?.totalLoss>0?(((cur?.totalLoss-prv.totalLoss)/prv.totalLoss)*100).toFixed(0):null;
  const expiredTrend=prv?.expiredCount>0?cur?.expiredCount-prv.expiredCount:null;
  const catStats=useMemo(()=>{const m={};products.forEach(p=>{if(!p.category)return;if(!m[p.category])m[p.category]={count:0,loss:0};if(isDiscarded(p)||getProductStatus(p.expiration_date)==='expired'){m[p.category].count++;m[p.category].loss+=(p.quantity_thrown||0)*(p.price_chf||0)}});return Object.entries(m).map(([c,d])=>({cat:c,label:categoryKeys[c]||c,...d})).sort((a,b)=>b.loss-a.loss).slice(0,6)},[products]);
  const rayStats=useMemo(()=>{const m={};products.forEach(p=>{if(!p.rayon)return;if(!m[p.rayon])m[p.rayon]={count:0,loss:0};if(isDiscarded(p)||getProductStatus(p.expiration_date)==='expired'){m[p.rayon].count++;m[p.rayon].loss+=(p.quantity_thrown||0)*(p.price_chf||0)}});return Object.entries(m).map(([r,d])=>({rayon:`R${r}`,...d})).sort((a,b)=>b.loss-a.loss).slice(0,8)},[products]);
  const topP=useMemo(()=>products.filter(p=>(isDiscarded(p)||getProductStatus(p.expiration_date)==='expired')&&p.price_chf).sort((a,b)=>((b.quantity_thrown||0)*(b.price_chf||0))-((a.quantity_thrown||0)*(a.price_chf||0))).slice(0,5),[products]);
  const tl=calculateTotalLoss(products),te=products.filter(p=>isDiscarded(p)||getProductStatus(p.expiration_date)==='expired').length,tq=products.reduce((s,p)=>s+(p.quantity_thrown||0),0),un=products.filter(p=>!isDiscarded(p)&&getProductStatus(p.expiration_date)==='urgent').length;
  return (<div className="space-y-6 sm:space-y-8">
    <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><BarChart2 className="w-5 h-5 text-primary"/></div><div><h1 className="text-2xl font-bold">Historique & Analytiques</h1><p className="text-sm text-muted-foreground">Suivi des pertes et tendances sur 6 mois</p></div></div>
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">{[{icon:<TrendingDown className="w-5 h-5 text-primary"/>,value:`CHF ${tl.toFixed(2)}`,label:'Pertes totales',bg:'bg-primary/10'},{icon:<PackageX className="w-5 h-5 text-red-500"/>,value:te,label:'Produits expirés',bg:'bg-red-50'},{icon:<Flame className="w-5 h-5 text-orange-500"/>,value:tq,label:'Quantité jetée',bg:'bg-orange-50'},{icon:<AlertTriangle className="w-5 h-5 text-yellow-500"/>,value:un,label:'Urgents',bg:'bg-yellow-50'}].map((k,i)=><div key={i} className="bg-white rounded-2xl border shadow-sm p-5 flex flex-col gap-3"><div className={`w-10 h-10 rounded-xl ${k.bg} flex items-center justify-center`}>{k.icon}</div><div><p className="text-xl font-bold">{k.value}</p><p className="text-xs text-muted-foreground mt-0.5">{k.label}</p></div></div>)}</div>
    {(lossTrend!==null||expiredTrend!==null)&&<div className="flex flex-wrap gap-3">{lossTrend!==null&&<div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${Number(lossTrend)<0?'bg-green-50 text-green-700 border-green-200':'bg-red-50 text-red-700 border-red-200'}`}>{Number(lossTrend)<0?<TrendingDown className="w-4 h-4"/>:<TrendingUp className="w-4 h-4"/>}{Number(lossTrend)<0?'':'+'}{lossTrend}% pertes ce mois</div>}{expiredTrend!==null&&<div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${expiredTrend<0?'bg-green-50 text-green-700 border-green-200':'bg-red-50 text-red-700 border-red-200'}`}>{expiredTrend<0?<TrendingDown className="w-4 h-4"/>:<TrendingUp className="w-4 h-4"/>}{expiredTrend>0?'+':''}{expiredTrend} produits expirés</div>}</div>}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl border shadow-sm p-5"><h3 className="font-semibold text-sm mb-4">Pertes par mois (CHF)</h3><ResponsiveContainer width="100%" height={220}><BarChart data={monthlyData} margin={{top:5,right:10,bottom:5,left:0}}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/><XAxis dataKey="label" tick={{fontSize:11}}/><YAxis tick={{fontSize:11}}/><Tooltip formatter={v=>[`CHF ${v}`,'Pertes']}/><Bar dataKey="totalLoss" radius={[6,6,0,0]}>{monthlyData.map((_,i)=><Cell key={i} fill={i===monthlyData.length-1?'hsl(var(--primary))':'hsl(var(--primary) / 0.4)'}/>)}</Bar></BarChart></ResponsiveContainer></div>
      <div className="bg-white rounded-2xl border shadow-sm p-5"><h3 className="font-semibold text-sm mb-4">Produits expirés par mois</h3><ResponsiveContainer width="100%" height={220}><LineChart data={monthlyData} margin={{top:5,right:10,bottom:5,left:0}}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/><XAxis dataKey="label" tick={{fontSize:11}}/><YAxis tick={{fontSize:11}}/><Tooltip formatter={v=>[v,'Expirés']}/><Line type="monotone" dataKey="expiredCount" stroke="hsl(var(--destructive))" strokeWidth={2} dot={{r:4,fill:'hsl(var(--destructive))'}}/></LineChart></ResponsiveContainer></div>
      <div className="bg-white rounded-2xl border shadow-sm p-5"><h3 className="font-semibold text-sm mb-4">Quantité jetée par mois</h3><ResponsiveContainer width="100%" height={220}><BarChart data={monthlyData} margin={{top:5,right:10,bottom:5,left:0}}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/><XAxis dataKey="label" tick={{fontSize:11}}/><YAxis tick={{fontSize:11}}/><Tooltip formatter={v=>[v,'Jetés']}/><Bar dataKey="totalThrown" radius={[6,6,0,0]}>{monthlyData.map((_,i)=><Cell key={i} fill={i===monthlyData.length-1?'#f97316':'#fed7aa'}/>)}</Bar></BarChart></ResponsiveContainer></div>
      <div className="bg-white rounded-2xl border shadow-sm p-5"><h3 className="font-semibold text-sm mb-4">Pertes par catégorie (CHF)</h3>{catStats.length===0?<div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">Aucune donnée</div>:<ResponsiveContainer width="100%" height={220}><BarChart data={catStats} layout="vertical" margin={{top:5,right:30,bottom:5,left:60}}><CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false}/><XAxis type="number" tick={{fontSize:11}}/><YAxis dataKey="label" type="category" tick={{fontSize:11}} width={55}/><Tooltip formatter={v=>[`CHF ${v.toFixed(2)}`,'Pertes']}/><Bar dataKey="loss" radius={[0,6,6,0]} fill="hsl(var(--primary) / 0.7)"/></BarChart></ResponsiveContainer>}</div>
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border"><h3 className="font-semibold mb-4 flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-orange-500"/>Rayons à surveiller</h3>{rayStats.length===0?<p className="text-sm text-muted-foreground">Aucun rayon problématique.</p>:<div className="space-y-2">{rayStats.map((r,i)=><div key={r.rayon} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50"><div className="flex items-center gap-3"><span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${i===0?'bg-red-500':i===1?'bg-orange-500':'bg-yellow-500'}`}>{i+1}</span><span className="font-medium text-sm">Rayon {r.rayon.slice(1)}</span></div><div className="text-right"><p className="text-sm font-semibold">CHF {r.loss.toFixed(2)}</p><p className="text-xs text-muted-foreground">{r.count} expirés</p></div></div>)}</div>}</div>
      <div className="bg-white rounded-2xl p-6 shadow-sm border"><h3 className="font-semibold mb-4 flex items-center gap-2"><Flame className="w-4 h-4 text-red-500"/>Produits problématiques</h3>{topP.length===0?<p className="text-sm text-muted-foreground">Aucune perte.</p>:<div className="space-y-2">{topP.map((p,i)=>{const l=(p.quantity_thrown||0)*(p.price_chf||0);return <div key={p._id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50"><div className="flex items-center gap-3"><span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${i===0?'bg-red-500':i===1?'bg-orange-500':'bg-yellow-500'}`}>{i+1}</span><div><p className="text-sm font-medium">{p.name}</p>{p.marque&&<p className="text-xs text-muted-foreground">{p.marque}</p>}</div></div><div className="text-right"><p className="text-sm font-semibold text-red-600">CHF {l.toFixed(2)}</p><p className="text-xs text-muted-foreground">{p.quantity_thrown} jetés</p></div></div>})}</div>}</div>
    </div>
  </div>);
}

// ═══════════ TAB: ORDERS ═══════════
function OrdersTab({ products }) {
  const sortByUrgency=(l)=>[...l].sort((a,b)=>{const da=a.expiration_date?new Date(a.expiration_date).getTime():Infinity;const db=b.expiration_date?new Date(b.expiration_date).getTime():Infinity;return da-db});
  const expiredUrgent=useMemo(()=>sortByUrgency(products.filter(p=>!isDiscarded(p)&&['expired','urgent'].includes(getProductStatus(p.expiration_date)))),[products]);
  const toReorder=useMemo(()=>sortByUrgency(products.filter(p=>!isDiscarded(p)&&(p.action==='a_recommander'||p.order_status==='a_commander')&&!['expired','urgent'].includes(getProductStatus(p.expiration_date)))),[products]);
  const eligible=useMemo(()=>sortByUrgency([...expiredUrgent,...toReorder.filter(p=>!expiredUrgent.find(ep=>ep._id===p._id))]),[expiredUrgent,toReorder]);
  const [ids,setIds]=useState(new Set());const [qties,setQties]=useState({});const [nts,setNts]=useState({});const [supplier,setSupplier]=useState({name:'',contact:'',email:'',phone:'',address:''});const [search,setSearch]=useState('');const [cf,setCf]=useState('all');const [rf,setRf]=useState('all');const [sf,setSf]=useState('all');const [sent,setSent]=useState(false);
  const toggle=(id)=>setIds(p=>{const n=new Set(p);n.has(id)?n.delete(id):n.add(id);return n});
  const toggleAll=()=>{if(ids.size===eligible.length)setIds(new Set());else setIds(new Set(eligible.map(p=>p._id)))};
  const sel=eligible.filter(p=>ids.has(p._id));
  const sb=(p)=>{const s=getProductStatus(p.expiration_date);const m={expired:'bg-red-100 text-red-700',urgent:'bg-orange-100 text-orange-700',soon:'bg-yellow-100 text-yellow-700',ok:'bg-green-100 text-green-700'};return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${m[s]}`}>{s==='expired'?'Expiré':s==='urgent'?'Urgent':s==='soon'?'Bientôt':'OK'}</span>};
  const filtered=useMemo(()=>eligible.filter(p=>{if(search.trim()&&!p.name?.toLowerCase().includes(search.toLowerCase())&&!p.marque?.toLowerCase().includes(search.toLowerCase()))return false;if(cf!=='all'&&p.category!==cf)return false;if(rf!=='all'&&p.rayon!==rf)return false;if(sf!=='all'){const s=getProductStatus(p.expiration_date);if(sf==='a_recommander'&&p.action!=='a_recommander')return false;if(sf!=='a_recommander'&&s!==sf)return false}return true}),[eligible,search,cf,rf,sf]);
  const handleSend=()=>{if(sel.length===0||!supplier.email)return;setSent(true);setTimeout(()=>setSent(false),4000)};
  return (<div className="space-y-6">
    <div className="mb-4"><div className="flex items-center gap-2 mb-1"><div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center"><ShoppingCart className="w-4 h-4 text-primary"/></div><h1 className="text-xl sm:text-2xl font-bold">Commandes</h1></div><p className="text-muted-foreground text-xs pl-10">{eligible.length} produit{eligible.length>1?'s':''} à réapprovisionner</p></div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4"><div className="bg-white rounded-2xl shadow-sm border overflow-hidden"><div className="px-4 py-3 border-b space-y-2.5"><div className="flex items-center justify-between"><h2 className="font-semibold text-sm flex items-center gap-2"><Package className="w-4 h-4 text-primary"/>Produits à commander{eligible.length>0&&<span className="bg-primary/10 text-primary text-xs font-semibold px-2 py-0.5 rounded-full">{eligible.length}</span>}</h2><button className="text-xs text-primary font-medium" onClick={toggleAll}>{ids.size===eligible.length?'Tout désélectionner':'Tout sélectionner'}</button></div><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground"/><Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher..." className="pl-8 h-9 text-sm rounded-full"/></div><div className="flex gap-2 items-center overflow-x-auto pb-0.5"><Select value={sf} onValueChange={setSf}><SelectTrigger className={`h-8 text-xs rounded-full flex-shrink-0 w-auto px-3 ${sf!=='all'?'border-primary text-primary':''}`}><SelectValue placeholder="Statut"/></SelectTrigger><SelectContent><SelectItem value="all">Tous statuts</SelectItem><SelectItem value="expired">Expirés</SelectItem><SelectItem value="urgent">Urgents</SelectItem><SelectItem value="soon">Bientôt</SelectItem><SelectItem value="a_recommander">À recommander</SelectItem></SelectContent></Select><Select value={cf} onValueChange={setCf}><SelectTrigger className={`h-8 text-xs rounded-full flex-shrink-0 w-auto px-3 ${cf!=='all'?'border-primary text-primary':''}`}><SelectValue placeholder="Catégorie"/></SelectTrigger><SelectContent><SelectItem value="all">Toutes</SelectItem>{Object.entries(categoryKeys).map(([v,k])=><SelectItem key={v} value={v}>{k}</SelectItem>)}</SelectContent></Select><Select value={rf} onValueChange={setRf}><SelectTrigger className={`h-8 text-xs rounded-full flex-shrink-0 w-auto px-3 ${rf!=='all'?'border-primary text-primary':''}`}><SelectValue placeholder="Rayon"/></SelectTrigger><SelectContent><SelectItem value="all">Tous</SelectItem>{Object.keys(rayonKeys).map(r=><SelectItem key={r} value={r}>Rayon {r}</SelectItem>)}</SelectContent></Select></div></div>
      {eligible.length===0?<div className="text-center py-16 text-muted-foreground text-sm"><Package className="w-10 h-10 mx-auto mb-3 opacity-30"/><p>Aucun produit à commander</p></div>:<div className="divide-y">{expiredUrgent.length>0&&<div className="px-5 py-2 bg-red-50 border-b border-red-100 flex items-center gap-2"><AlertTriangle className="w-3.5 h-3.5 text-red-600"/><span className="text-xs font-semibold text-red-700">Expirés & Urgents ({expiredUrgent.length})</span></div>}{expiredUrgent.filter(p=>{if(search.trim()&&!p.name?.toLowerCase().includes(search.toLowerCase())&&!p.marque?.toLowerCase().includes(search.toLowerCase()))return false;if(cf!=='all'&&p.category!==cf)return false;if(rf!=='all'&&p.rayon!==rf)return false;if(sf!=='all'&&sf!=='expired'&&sf!=='urgent')return false;return true}).map(p=>{const i=ids.has(p._id);return <div key={p._id} className={`px-4 py-3 flex flex-col gap-2 cursor-pointer ${i?'bg-primary/5 border-l-2 border-primary':'border-l-2 border-transparent'}`} onClick={()=>toggle(p._id)}><div className="flex items-start gap-3"><Checkbox checked={i} onCheckedChange={()=>toggle(p._id)} className="mt-0.5" onClick={e=>e.stopPropagation()}/><div className="flex-1 min-w-0"><div className="flex items-center gap-1.5 flex-wrap"><span className="font-semibold text-sm">{p.name}</span>{p.marque&&<span className="text-xs text-muted-foreground">· {p.marque}</span>}</div><div className="flex items-center gap-1.5 flex-wrap mt-1">{sb(p)}{p.action==='a_recommander'&&<span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">À recommander</span>}</div><div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-2 gap-y-0.5">{p.category&&<span>{categoryKeys[p.category]||p.category}</span>}{p.rayon&&<span>Rayon {p.rayon}</span>}{p.expiration_date&&<span className={getDaysRemaining(p.expiration_date)<0?'text-red-500 font-medium':getDaysRemaining(p.expiration_date)<=7?'text-orange-500 font-medium':''}>DLC: {p.expiration_date} ({getDaysRemaining(p.expiration_date)}j)</span>}</div></div></div>{i&&<div className="flex items-center gap-2 pl-6 pt-1" onClick={e=>e.stopPropagation()}><div><label className="text-xs text-muted-foreground block mb-1">Qté</label><Input type="number" min="1" value={qties[p._id]||1} onChange={e=>setQties(q=>({...q,[p._id]:parseInt(e.target.value)||1}))} className="h-8 w-16 text-sm text-center"/></div><div className="flex-1"><label className="text-xs text-muted-foreground block mb-1">Note</label><Input value={nts[p._id]||''} onChange={e=>setNts(n=>({...n,[p._id]:e.target.value}))} className="h-8 w-full text-sm" placeholder="optionnel"/></div></div>}</div>})}{toReorder.length>0&&<div className="px-5 py-2 bg-primary/5 border-b flex items-center gap-2"><Package className="w-3.5 h-3.5 text-primary"/><span className="text-xs font-semibold text-primary">À recommander ({toReorder.length})</span></div>}{toReorder.filter(p=>{if(search.trim()&&!p.name?.toLowerCase().includes(search.toLowerCase())&&!p.marque?.toLowerCase().includes(search.toLowerCase()))return false;if(cf!=='all'&&p.category!==cf)return false;if(rf!=='all'&&p.rayon!==rf)return false;if(sf==='expired'||sf==='urgent')return false;return true}).map(p=>{const i=ids.has(p._id);return <div key={p._id} className={`px-4 py-3 flex flex-col gap-2 cursor-pointer ${i?'bg-primary/5 border-l-2 border-primary':'border-l-2 border-transparent'}`} onClick={()=>toggle(p._id)}><div className="flex items-start gap-3"><Checkbox checked={i} onCheckedChange={()=>toggle(p._id)} className="mt-0.5" onClick={e=>e.stopPropagation()}/><div className="flex-1 min-w-0"><div className="flex items-center gap-1.5 flex-wrap"><span className="font-semibold text-sm">{p.name}</span>{p.marque&&<span className="text-xs text-muted-foreground">· {p.marque}</span>}</div><div className="flex items-center gap-1.5 flex-wrap mt-1">{sb(p)}{p.action==='a_recommander'&&<span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium border border-primary/20">À recommander</span>}</div><div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-2 gap-y-0.5">{p.category&&<span>{categoryKeys[p.category]||p.category}</span>}{p.rayon&&<span>Rayon {p.rayon}</span>}{p.expiration_date&&<span className={getDaysRemaining(p.expiration_date)<0?'text-red-500 font-medium':getDaysRemaining(p.expiration_date)<=7?'text-orange-500 font-medium':''}>DLC: {p.expiration_date} ({getDaysRemaining(p.expiration_date)}j)</span>}</div></div></div>{i&&<div className="flex items-center gap-2 pl-6 pt-1" onClick={e=>e.stopPropagation()}><div><label className="text-xs text-muted-foreground block mb-1">Qté</label><Input type="number" min="1" value={qties[p._id]||1} onChange={e=>setQties(q=>({...q,[p._id]:parseInt(e.target.value)||1}))} className="h-8 w-16 text-sm text-center"/></div><div className="flex-1"><label className="text-xs text-muted-foreground block mb-1">Note</label><Input value={nts[p._id]||''} onChange={e=>setNts(n=>({...n,[p._id]:e.target.value}))} className="h-8 w-full text-sm" placeholder="optionnel"/></div></div>}</div>})}</div>}</div></div>
      <div className="space-y-4">
        {ids.size>0&&<div className="bg-white rounded-2xl shadow-sm border p-4"><h2 className="font-semibold text-sm flex items-center gap-2 mb-3"><FileText className="w-4 h-4 text-primary"/>Résumé<span className="ml-auto bg-primary text-primary-foreground text-xs font-bold px-2 py-0.5 rounded-full">{ids.size}</span></h2><div className="space-y-1.5"><div className="flex justify-between text-sm"><span className="text-muted-foreground">Qté totale</span><span className="font-semibold">{sel.reduce((s,p)=>s+(qties[p._id]||1),0)} unités</span></div><div className="border-t pt-2 mt-2 space-y-1">{sel.slice(0,4).map(p=><div key={p._id} className="flex justify-between text-xs"><span className="truncate max-w-[160px]">{p.name}</span><span className="text-muted-foreground ml-2">×{qties[p._id]||1}</span></div>)}{sel.length>4&&<p className="text-xs text-muted-foreground">+{sel.length-4} autres…</p>}</div></div></div>}
        <div className="bg-white rounded-2xl shadow-sm border p-4"><h2 className="font-semibold text-sm flex items-center gap-2 mb-3"><Building2 className="w-4 h-4 text-primary"/>Fournisseur</h2><div className="space-y-2.5"><div><label className="text-xs font-medium text-muted-foreground block mb-1">Nom</label><Input value={supplier.name} onChange={e=>setSupplier(s=>({...s,name:e.target.value}))} placeholder="Ex: Metro Cash & Carry" className="text-sm h-9"/></div><div><label className="text-xs font-medium text-muted-foreground block mb-1">Contact</label><Input value={supplier.contact} onChange={e=>setSupplier(s=>({...s,contact:e.target.value}))} placeholder="Nom du contact" className="text-sm h-9"/></div><div><label className="text-xs font-medium text-muted-foreground block mb-1 flex items-center gap-1"><Mail className="w-3 h-3"/>Email</label><Input type="email" value={supplier.email} onChange={e=>setSupplier(s=>({...s,email:e.target.value}))} placeholder="fournisseur@exemple.com" className="text-sm h-9"/></div><div className="grid grid-cols-2 gap-2"><div><label className="text-xs font-medium text-muted-foreground block mb-1 flex items-center gap-1"><Phone className="w-3 h-3"/>Téléphone</label><Input value={supplier.phone} onChange={e=>setSupplier(s=>({...s,phone:e.target.value}))} placeholder="+41 XX XXX XX XX" className="text-sm h-9"/></div><div><label className="text-xs font-medium text-muted-foreground block mb-1">Adresse</label><Input value={supplier.address} onChange={e=>setSupplier(s=>({...s,address:e.target.value}))} placeholder="Adresse" className="text-sm h-9"/></div></div></div></div>
        <div className="flex gap-2"><Button variant="outline" className="flex-1 gap-2 rounded-xl h-11" disabled={ids.size===0}><Download className="w-4 h-4"/>PDF</Button><Button className="flex-[2] gap-2 rounded-xl h-11 px-5" onClick={handleSend} disabled={ids.size===0}>{sent?<><CheckCircle2 className="w-4 h-4"/>Envoyé!</>:<><Send className="w-4 h-4"/>Envoyer</>}</Button></div>
      </div>
    </div>
  </div>);
}

// ═══════════ TAB: DOCUMENTS ═══════════
function DocumentsTab() {
  const [folders] = useState(FOLDER_SEED);
  const [documents, setDocuments] = useState(DOC_SEED);
  const [section, setSection] = useState('all');
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');

  const filteredDocs = useMemo(()=>{
    let docs = documents;
    if (section==='trash') docs=docs.filter(d=>d.is_deleted);
    else if (section==='all') docs=docs.filter(d=>!d.is_deleted);
    else docs=docs.filter(d=>!d.is_deleted&&d.folder_id===section);
    if(search){const q=search.toLowerCase();docs=docs.filter(d=>d.name?.toLowerCase().includes(q)||d.supplier_name?.toLowerCase().includes(q)||d.amount?.toString().includes(q))}
    if(filterCategory) docs=docs.filter(d=>d.category===filterCategory);
    return docs.sort((a,b)=>a.name.localeCompare(b.name));
  },[documents,section,search,filterCategory]);

  const trashCount=documents.filter(d=>d.is_deleted).length;
  const inFolder=section!=='all'&&section!=='trash';
  const currentFolder=inFolder?folders.find(f=>f._id===section):null;
  const currentLabel=section==='all'?'Tous les documents':section==='trash'?'Corbeille':currentFolder?.name||'';

  const deleteDoc = (doc) => setDocuments(prev=>prev.map(d=>d._id===doc._id?{...d,is_deleted:!d.is_deleted}:d));

  return (<div className="space-y-6">
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-1">
      <div><h1 className="text-xl sm:text-2xl font-bold mb-1">{currentLabel}</h1>
        <p className="text-xs text-muted-foreground max-w-xl">Numérisez, stockez et organisez vos documents professionnels.</p>
      </div>
      {section!=='trash'&&<div className="flex items-center gap-2 flex-shrink-0">
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={()=>setDocuments(prev=>[...prev,{_id:'d'+Date.now(),name:'Nouveau document '+Math.floor(Math.random()*100),file_type:'application/pdf',category:'autre',folder_id:inFolder?section:null,is_deleted:false,supplier_name:null,amount:null,document_date:new Date().toISOString().split('T')[0],notes:'',file_size:150000}])}>
          <FolderPlus className="w-4 h-4"/><span className="hidden sm:inline">Nouveau dossier</span></Button>
        <Button size="sm" className="gap-1.5 text-xs"><Upload className="w-4 h-4"/><span className="hidden sm:inline">Ajouter un document</span></Button>
      </div>}
    </div>
    {section!=='all'&&<button onClick={()=>setSection('all')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"><ChevronLeft className="w-4 h-4"/>Retour aux documents</button>}
    {section==='all'&&<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-6">{folders.map(f=>{const count=documents.filter(d=>!d.is_deleted&&d.folder_id===f._id).length;return <button key={f._id} onClick={()=>setSection(f._id)} className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border hover:border-primary/40 hover:shadow-md transition-all text-center"><div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{backgroundColor:(f.color||'#C9A646')+'20'}}><Folder className="w-7 h-7" style={{color:f.color||'#C9A646'}}/></div><div className="w-full min-w-0"><p className="text-sm font-semibold truncate">{f.name}</p><p className="text-xs text-muted-foreground">{count} doc{count!==1?'s':''}</p></div></button>})}</div>}
    <div className="flex gap-2 mb-5 flex-wrap"><div className="relative flex-1 min-w-48"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"/><Input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un document..." className="pl-9 bg-white text-xs h-8"/></div><select value={filterCategory} onChange={e=>setFilterCategory(e.target.value)} className="h-9 rounded-md border border-input bg-white px-3 text-sm"><option value="">Tous les types</option>{Object.entries(CATEGORY_LABELS).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></div>
    {filteredDocs.length===0?<div className="text-center py-16"><div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4"><DocIcon className="w-8 h-8 text-muted-foreground"/></div><p className="font-medium mb-1">Aucun document</p><p className="text-sm text-muted-foreground">{section==='trash'?'La corbeille est vide':'Ajoutez votre premier document'}</p></div>:<div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">{filteredDocs.map(doc=>{const catLabel=CATEGORY_LABELS[doc.category]||doc.category;return <div key={doc._id} className="bg-white rounded-2xl border p-4 hover:shadow-md transition-shadow"><div className="flex items-start gap-3"><div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0"><DocIcon className="w-5 h-5 text-primary"/></div><div className="flex-1 min-w-0"><p className="font-semibold text-sm truncate">{doc.name}</p><div className="flex items-center gap-2 mt-1 flex-wrap"><span className="text-xs bg-secondary px-2 py-0.5 rounded-full">{catLabel}</span>{doc.supplier_name&&<span className="text-xs text-muted-foreground">{doc.supplier_name}</span>}</div>{doc.amount&&<p className="text-xs font-semibold mt-1">CHF {Number(doc.amount).toFixed(2)}</p>}<p className="text-xs text-muted-foreground mt-0.5">{doc.document_date||doc._id}</p></div></div><div className="flex gap-1 mt-3 pt-2 border-t"><Button variant="ghost" size="sm" className="text-xs h-7 text-muted-foreground">Ouvrir</Button><Button variant="ghost" size="sm" className="text-xs h-7 text-red-500" onClick={()=>deleteDoc(doc)}>{section==='trash'?'Restaurer':'Supprimer'}</Button></div></div>})}</div>}
  </div>);
}

// ═══════════ TAB: TEAM ═══════════
function TeamTab() {
  const [team] = useState(TEAM_SEED);
  const [expandedPerms, setExpandedPerms] = useState(null);
  return (<div className="space-y-6">
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div><h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2"><Users className="w-7 h-7 text-primary"/>Équipe</h1><p className="text-sm text-muted-foreground mt-1"><span className="font-semibold text-primary">Boutique Démo</span> · {team.length} membres</p></div>
      <Button className="rounded-full gap-2"><UserPlus className="w-4 h-4"/>Ajouter un employé</Button>
    </div>
    <div className="space-y-3">
      {team.map(m=>{const roleKey=m.role==='user'?'owner':(m.role||'employee');const cfg=ROLE_CONFIG[roleKey]||ROLE_CONFIG.employee;const Icon=cfg.icon;const perms=expandedPerms===m._id;const isOwner=m.role==='owner';
        return (<div key={m._id} className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base flex-shrink-0 ${cfg.bg} ${cfg.border} border`}><span className={cfg.color}>{m.full_name[0]}</span></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap"><span className="font-semibold truncate">{m.full_name}{m._id==='u1'&&<span className="text-xs text-muted-foreground ml-1">(vous)</span>}</span><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.border} ${cfg.color}`}><Icon className="w-3 h-3"/>{cfg.label}</span></div>
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{m.email}</p>
              {m.phone_number&&<p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Phone className="w-3 h-3"/>{m.phone_number}</p>}
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={()=>setExpandedPerms(perms?null:m._id)} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"><span className="hidden sm:inline">Accès </span><ChevronDown className={`w-3 h-3 transition-transform ${perms?'rotate-180':''}`}/></button>
              {!isOwner&&m._id!=='u1'&&<select className="text-xs border border-border rounded-lg px-2 py-1 bg-transparent"><option value="manager">Gérant</option><option value="employee">Employé</option></select>}
            </div>
          </div>
          {perms&&<div className={`px-5 pb-4 border-t pt-3 ${cfg.bg}`}><p className={`text-xs font-semibold mb-2 ${cfg.color}`}>Permissions</p><ul className="space-y-1">{(ROLE_PERMS[roleKey]||ROLE_PERMS.employee).map(p=><li key={p} className="flex items-center gap-2 text-xs text-muted-foreground"><span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.color.replace('text-','bg-')}`}/>{p}</li>)}</ul></div>}
        </div>);
      })}
    </div>
    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5"><p className="text-sm font-semibold mb-2">Comment fonctionne l'équipe ?</p><ul className="space-y-1.5 text-xs text-muted-foreground"><li>• Chaque membre se connecte avec son propre email</li><li>• Toutes les actions sont liées à l'utilisateur connecté</li><li>• Les produits et données sont partagés entre l'équipe</li><li>• L'historique d'activité montre qui a fait quoi</li></ul></div>
  </div>);
}

// ═══════════ MAIN DEMO ═══════════
export default function Demo() {
  const [products, setProducts] = useState(SEED);
  const [tab, setTab] = useState('dashboard');
  const [showScanner, setShowScanner] = useState(false);
  const [quickAdd, setQuickAdd] = useState(null);
  const [nextId, setNextId] = useState(41);

  const addProduct = (data, updateId) => {
    if (updateId) setProducts(prev=>prev.map(p=>p._id===updateId?{...p,expiration_date:data.expiration_date,price_chf:data.price_chf}:p));
    else {setProducts(prev=>[{_id:nextId,...data,added_by_name:'Vous (demo)',discarded:false,discarded_at:null,action:null,quantity_thrown:0},...prev]);setNextId(n=>n+1)}
    setQuickAdd(null);
  };
  const editProductDlc = (id, newDlc) => setProducts(prev=>prev.map(p=>p._id===id?{...p,expiration_date:newDlc}:p));
  const editProductField = (id, fields) => setProducts(prev=>prev.map(p=>p._id===id?{...p,...fields}:p));
  const deleteProduct = (id) => setProducts(prev=>prev.filter(p=>p._id!==id));
  const handleProductAction = (id) => setProducts(prev=>prev.map(p=>p._id===id?{...p,discarded:true,discarded_at:new Date().toISOString().split('T')[0]}:p));

  const handleBarcodeDetected = async (code) => {
    setShowScanner(false);
    try {
      const fd = await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`).then(r=>r.json());
      if (fd?.status===1&&fd?.product) {
        const p=fd.product;const name=p.product_name_fr||p.product_name||p.generic_name||'';const brand=p.brands||'';
        const existing=products.find(ep=>ep.name?.toLowerCase().trim()===name.toLowerCase().trim()&&(ep.marque||'').toLowerCase().trim()===brand.toLowerCase().trim());
        setQuickAdd({barcode:code,prefill:{name,brand,category:'',image_url:p.image_front_url||p.image_url||''},existingProduct:existing||null});return;
      }
    } catch (_) {}
    setQuickAdd({barcode:code,prefill:null,existingProduct:null});
  };

  const tabs = [
    { key: 'dashboard', label: 'Dashboard', short: 'TdB', icon: LayoutDashboard },
    { key: 'analytics', label: 'Analytiques', short: 'Stats', icon: BarChart3 },
    { key: 'orders', label: 'Commandes', short: 'Cmd', icon: ShoppingCart },
    { key: 'documents', label: 'Documents', short: 'Docs', icon: Folder },
    { key: 'team', label: 'Équipe', short: 'Équipe', icon: Users },
  ];

  return (
    <div className="min-h-screen pb-20 sm:pb-0 pt-0" style={{backgroundColor:'#f5f5f5',color:'#1a1a1a'}}>
      <DemoBanner/>
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 h-14 sm:h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary flex items-center justify-center"><span className="text-white font-bold text-xs sm:text-sm">TS</span></div>
            <span className="font-bold text-sm sm:text-lg tracking-tight hidden sm:inline">TrackSmart <span className="text-primary">Démo</span></span>
          </Link>
          <div className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto">
            {tabs.map(t => (
              <button key={t.key} onClick={()=>setTab(t.key)} className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${tab===t.key?'bg-primary text-primary-foreground':'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}>
                <t.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5"/><span className="sm:hidden">{t.short}</span><span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button variant="outline" size="sm" onClick={()=>setShowScanner(true)} className="rounded-full gap-1 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9 px-2.5 sm:px-3">
              <ScanLine className="w-3.5 h-3.5 sm:w-4 sm:h-4"/> <span className="hidden sm:inline">Scanner</span>
            </Button>
            <Link to="/register"><Button size="sm" className="rounded-lg text-xs sm:text-sm h-8 sm:h-9 px-3">Essayer</Button></Link>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 pt-4 sm:pt-6 pb-6 sm:pb-8">
        {tab==='dashboard'&&<DashboardTab products={products} addProduct={addProduct} deleteProduct={deleteProduct} handleProductAction={handleProductAction} editProductDlc={editProductDlc} editProductField={editProductField}/>}
        {tab==='analytics'&&<AnalyticsTab products={products}/>}
        {tab==='orders'&&<OrdersTab products={products}/>}
        {tab==='documents'&&<DocumentsTab/>}
        {tab==='team'&&<TeamTab/>}
      </main>
      {showScanner&&<BarcodeScanner lang="fr" onDetected={handleBarcodeDetected} onClose={()=>setShowScanner(false)}/>}
      {quickAdd&&<QuickAddModal barcode={quickAdd.barcode} prefill={quickAdd.prefill} existingProduct={quickAdd.existingProduct} onSave={addProduct} onClose={()=>setQuickAdd(null)}/>}
    </div>
  );
}