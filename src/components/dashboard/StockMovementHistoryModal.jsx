import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StockMovementList from './StockMovementList';

export default function StockMovementHistoryModal({ product, movements = [], onClose }) {
  if (!product) return null;
  return (
    <div className="fixed inset-0 z-[90] bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-xl max-h-[88vh] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Historique complet</p>
            <h2 className="text-lg font-bold text-foreground">{product.name}</h2>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full hover:bg-secondary flex items-center justify-center">
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>
        <div className="overflow-y-auto p-5">
          <StockMovementList movements={movements} limit={movements.length || 1} />
        </div>
        <div className="px-5 py-4 border-t border-border/40 bg-white flex justify-end">
          <Button variant="outline" onClick={onClose} className="rounded-xl">Fermer</Button>
        </div>
      </div>
    </div>
  );
}