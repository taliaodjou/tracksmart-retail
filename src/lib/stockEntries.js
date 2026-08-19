import { base44 } from '@/api/base44Client';

const today = () => new Date().toISOString().split('T')[0];

export function enrichProductsWithStock(products = [], entries = []) {
  const byProduct = entries.reduce((map, entry) => {
    if (!entry.product_id) return map;
    if (!map[entry.product_id]) map[entry.product_id] = [];
    map[entry.product_id].push(entry);
    return map;
  }, {});

  return products.map((product) => {
    const activeEntries = (byProduct[product.id] || [])
      .filter((entry) => (Number(entry.quantity_remaining) || 0) > 0)
      .sort((a, b) => new Date(a.expiration_date) - new Date(b.expiration_date));
    const stockTotal = activeEntries.reduce((sum, entry) => sum + (Number(entry.quantity_remaining) || 0), 0);
    const priority = activeEntries[0];

    return {
      ...product,
      stock_entries: activeEntries,
      stock_total: activeEntries.length ? stockTotal : null,
      priority_stock_quantity: priority ? Number(priority.quantity_remaining) || 0 : null,
      expiration_date: priority?.expiration_date || product.expiration_date,
      reception_date: priority?.date_added || product.reception_date,
    };
  });
}

export function expandProductsByStockDates(products = []) {
  return products.flatMap((product) => {
    if (!product.stock_entries?.length) return [product];
    return product.stock_entries.map((entry) => ({
      ...product,
      id: `${product.id}-${entry.id}`,
      base_product_id: product.id,
      expiration_date: entry.expiration_date,
      reception_date: entry.date_added,
      priority_stock_quantity: Number(entry.quantity_remaining) || 0,
    }));
  });
}

export async function addStockEntry({ productId, storeOwnerEmail, expirationDate, quantity, dateAdded }) {
  const quantityNumber = Number(quantity) || 0;
  if (!productId || !storeOwnerEmail || !expirationDate || quantityNumber <= 0) return null;

  const existing = await base44.entities.Batch.filter({ product_id: productId }, '-created_date', 200);
  const sameDate = existing.find((entry) => entry.expiration_date === expirationDate);

  if (sameDate) {
    return base44.entities.Batch.update(sameDate.id, {
      quantity_received: (Number(sameDate.quantity_received) || 0) + quantityNumber,
      quantity_remaining: (Number(sameDate.quantity_remaining) || 0) + quantityNumber,
      date_added: dateAdded || sameDate.date_added || today(),
    });
  }

  return base44.entities.Batch.create({
    product_id: productId,
    store_owner_email: storeOwnerEmail,
    expiration_date: expirationDate,
    quantity_received: quantityNumber,
    quantity_remaining: quantityNumber,
    date_added: dateAdded || today(),
  });
}

export async function decrementStockFefo(productId, quantity = 1) {
  let remaining = Number(quantity) || 1;
  const entries = await base44.entities.Batch.filter({ product_id: productId }, 'expiration_date', 200);
  const activeEntries = entries
    .filter((entry) => (Number(entry.quantity_remaining) || 0) > 0)
    .sort((a, b) => new Date(a.expiration_date) - new Date(b.expiration_date));

  for (const entry of activeEntries) {
    if (remaining <= 0) break;
    const available = Number(entry.quantity_remaining) || 0;
    const used = Math.min(available, remaining);
    await base44.entities.Batch.update(entry.id, { quantity_remaining: available - used });
    remaining -= used;
  }

  return { decremented: (Number(quantity) || 1) - remaining, missing: remaining };
}