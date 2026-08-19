import React from 'react';
import { format } from 'date-fns';

const typeLabel = { reception: 'Réception', vente: 'Vente' };

function formatDate(value) {
  if (!value) return '—';
  try { return format(new Date(value), 'dd/MM/yyyy'); } catch { return value; }
}

export default function StockMovementList({ movements = [], limit = 5, onViewAll }) {
  const visible = movements.slice(0, limit);
  return (
    <div className="rounded-2xl border border-border/50 p-4 space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-bold text-sm">Historique des mouvements</h3>
        {onViewAll && <button onClick={onViewAll} className="text-xs font-semibold text-primary hover:underline">Voir l'historique complet</button>}
      </div>
      {visible.length === 0 ? (
        <p className="text-xs text-muted-foreground">Aucun mouvement sur les 30 derniers jours.</p>
      ) : (
        <div className="space-y-2">
          {visible.map((movement) => (
            <div key={movement.id} className="flex items-center justify-between gap-3 rounded-xl bg-secondary/30 px-3 py-2">
              <div>
                <p className="text-sm font-semibold text-foreground">{typeLabel[movement.type] || movement.type}</p>
                <p className="text-xs text-muted-foreground">{formatDate(movement.movement_date)}</p>
              </div>
              <span className="text-sm font-bold text-primary">{movement.quantity} unités</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}