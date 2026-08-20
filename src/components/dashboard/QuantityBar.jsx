import React from 'react';
import { Minus, Plus, Package } from 'lucide-react';

export default function QuantityBar({ value, onChange, label, hint, required }) {
  const current = Number(value) || 0;
  const setQty = (next) => onChange(next <= 0 ? '' : String(next));

  return (
    <div className="sm:col-span-2 rounded-xl border-2 border-primary/25 bg-primary/5 px-4 py-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <Package className="w-4 h-4 text-primary shrink-0" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-foreground">{label}{required ? ' *' : ''}</p>
            {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setQty(current - 1)} className="w-9 h-9 rounded-lg bg-white border border-border flex items-center justify-center text-foreground hover:border-primary">
            <Minus className="w-4 h-4" />
          </button>
          <input
            type="number"
            min="0"
            required={required}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="0"
            className="w-20 h-9 rounded-lg border border-border bg-white text-center text-base font-bold outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button type="button" onClick={() => setQty(current + 1)} className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}