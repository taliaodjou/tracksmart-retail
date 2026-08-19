import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';

const dateOnly = (date) => date.toISOString().split('T')[0];
const monthKey = (value) => (value || '').slice(0, 7);

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const cutoff = new Date();
    cutoff.setMonth(cutoff.getMonth() - 6);
    const cutoffDate = dateOnly(cutoff);
    const today = dateOnly(new Date());

    const movements = await base44.asServiceRole.entities.StockMovement.filter({ archived: false }, 'movement_date', 5000);
    const oldMovements = movements.filter((movement) => movement.movement_date && movement.movement_date < cutoffDate);
    const groups = new Map();

    for (const movement of oldMovements) {
      const key = [movement.store_owner_email, movement.product_id, monthKey(movement.movement_date)].join('|');
      const current = groups.get(key) || {
        store_owner_email: movement.store_owner_email,
        product_id: movement.product_id,
        month: monthKey(movement.movement_date),
        total_receptions: 0,
        total_ventes: 0,
        movement_count: 0,
      };
      if (movement.type === 'reception') current.total_receptions += Number(movement.quantity) || 0;
      if (movement.type === 'vente') current.total_ventes += Number(movement.quantity) || 0;
      current.movement_count += 1;
      groups.set(key, current);
    }

    for (const summary of groups.values()) {
      const existing = await base44.asServiceRole.entities.StockMovementSummary.filter({
        store_owner_email: summary.store_owner_email,
        product_id: summary.product_id,
        month: summary.month,
      }, '-created_date', 1);
      if (existing[0]) {
        await base44.asServiceRole.entities.StockMovementSummary.update(existing[0].id, {
          total_receptions: (Number(existing[0].total_receptions) || 0) + summary.total_receptions,
          total_ventes: (Number(existing[0].total_ventes) || 0) + summary.total_ventes,
          movement_count: (Number(existing[0].movement_count) || 0) + summary.movement_count,
          generated_at: today,
        });
      } else {
        await base44.asServiceRole.entities.StockMovementSummary.create({ ...summary, generated_at: today });
      }
    }

    if (oldMovements.length > 0) {
      await base44.asServiceRole.entities.StockMovement.bulkUpdate(oldMovements.map((movement) => ({
        id: movement.id,
        archived: true,
        archived_at: today,
      })));
    }

    return Response.json({ archived_movements: oldMovements.length, summaries_updated: groups.size });
  } catch (error) {
    console.error('archiveStockMovements error', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}