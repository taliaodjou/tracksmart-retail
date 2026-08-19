import React, { useMemo, useState } from 'react';
import { X, Search, ScanLine } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const reasons = [
  'Produit périmé',
  'Produit abîmé',
  'Casse',
  'Erreur de comptage',
  'Erreur de réception',
  'Vente hors système',
  'Retour fournisseur',
  'Vol ou perte',
  'Don / dégustation',
  'Retrait qualité',
  'Autre'
];

export default function StockAdjustmentModal({ products = [], product, entry, onProductChange, onScan, onClose, onSubmit, saving }) {
  const [search, setSearch] = useState('');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const matches = useMemo(() => products.filter((p) => !search || p.name?.toLowerCase().includes(search.toLowerCase())).slice(0, 8), [products, search]);
  const justification = reason === 'Autre' ? customReason : reason;
  const canSave = product && Number(quantity) > 0 && justification?.trim() && date;

  return (
    <div className="fixed inset-0 z-[95] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
          <div><p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Gestion de stock</p><h2 className="text-lg font-bold">Enregistrer un mouvement</h2></div>
          <button onClick={onClose} className="w-9 h-9 rounded-full hover:bg-secondary flex items-center justify-center"><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>
        <div className="p-5 space-y-4">
          {!product && <div className="space-y-2"><div className="flex gap-2"><div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher un produit" className="pl-9 rounded-xl" /></div><Button variant="outline" onClick={onScan} className="rounded-xl gap-2"><ScanLine className="w-4 h-4" />Scanner</Button></div>{matches.map((item) => <button key={item.id} onClick={() => onProductChange(item)} className="w-full text-left rounded-xl border border-border/50 px-3 py-2 hover:border-primary/50"><span className="text-sm font-semibold">{item.name}</span><span className="block text-xs text-muted-foreground">Stock: {item.stock_total ?? 0} unités</span></button>)}</div>}
          {product && <div className="rounded-2xl bg-primary/5 border border-primary/20 p-3 flex items-center justify-between gap-3"><div><p className="text-sm font-bold">{product.name}</p><p className="text-xs text-muted-foreground">Stock actuel: {product.stock_total ?? 0} unités</p>{entry && <p className="text-xs text-primary font-semibold mt-1">Réception ciblée: DLC {format(new Date(entry.expiration_date), 'dd/MM/yyyy')} · {entry.quantity_remaining} unités restantes</p>}</div><Button variant="ghost" size="sm" onClick={() => onProductChange(null)}>Changer</Button></div>}
          <Input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Quantité concernée" className="rounded-xl" />
          <Select value={reason} onValueChange={setReason}><SelectTrigger className="rounded-xl"><SelectValue placeholder="Justification obligatoire" /></SelectTrigger><SelectContent className="z-[120]">{reasons.map((item) => <SelectItem key={item} value={item}>{item}</SelectItem>)}</SelectContent></Select>
          {reason === 'Autre' && <Input value={customReason} onChange={(e) => setCustomReason(e.target.value)} placeholder="Préciser la justification" className="rounded-xl" />}
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="rounded-xl" />
        </div>
        <div className="px-5 py-4 border-t border-border/40 flex justify-end gap-2"><Button variant="outline" onClick={onClose} className="rounded-xl">Annuler</Button><Button disabled={!canSave || saving} onClick={() => onSubmit({ product, quantity: Number(quantity), justification: justification.trim(), movementDate: date })} className="rounded-xl">Valider</Button></div>
      </div>
    </div>
  );
}