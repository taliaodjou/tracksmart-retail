import React from 'react';
import { Keyboard, Package, ScanLine, X } from 'lucide-react';

export default function AddProductOptionsModal({ onScan, onSearchByName, onCreateManual, onClose }) {
  return (
    <div className="fixed inset-0 z-[75] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Stock</p>
            <h2 className="text-lg font-bold text-foreground">Ajouter un produit</h2>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full hover:bg-secondary flex items-center justify-center"><X className="w-5 h-5 text-muted-foreground" /></button>
        </div>

        <div className="p-5 space-y-3">
          <button onClick={onScan} className="w-full rounded-2xl border border-primary/30 bg-primary/5 p-4 text-left hover:border-primary/60 transition-colors flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-primary/15 flex items-center justify-center"><ScanLine className="w-5 h-5 text-primary" /></div>
            <div>
              <p className="font-bold text-sm text-foreground">Scanner le code-barres</p>
              <p className="text-xs text-muted-foreground mt-0.5">Option recommandée pour identifier automatiquement le produit.</p>
            </div>
          </button>

          <button onClick={onSearchByName} className="w-full rounded-2xl border border-border/60 p-4 text-left hover:border-primary/50 hover:bg-primary/5 transition-colors flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center"><Package className="w-5 h-5 text-primary" /></div>
            <div>
              <p className="font-bold text-sm text-foreground">Rechercher par nom</p>
              <p className="text-xs text-muted-foreground mt-0.5">Pour retrouver un produit déjà présent dans le stock.</p>
            </div>
          </button>

          <button onClick={onCreateManual} className="w-full rounded-2xl border border-border/60 p-4 text-left hover:border-primary/50 hover:bg-primary/5 transition-colors flex items-center gap-4">
            <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center"><Keyboard className="w-5 h-5 text-primary" /></div>
            <div>
              <p className="font-bold text-sm text-foreground">Saisir un nouveau produit</p>
              <p className="text-xs text-muted-foreground mt-0.5">Pour remplir les informations manuellement sans scanner.</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}