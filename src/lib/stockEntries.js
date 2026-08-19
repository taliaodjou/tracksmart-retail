import { base44 } from '@/api/base44Client';

const today = () => new Date().toISOString().split('T')[0];

function sumStock(entries = []) {
  return entries.reduce((sum, entry) => sum + (Number(entry.quantity_remaining) || 0), 0);
}

async function createMovement(data) {
  return base44.entities.StockMovement.create({ archived: false, ...data });
}

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
    const stockTotal = sumStock(activeEntries);
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
  const totalBefore = sumStock(existing);
  let savedEntry;
  let beforeEntryQuantity = 0;
  let afterEntryQuantity = quantityNumber;

  if (sameDate) {
    beforeEntryQuantity = Number(sameDate.quantity_remaining) || 0;
    afterEntryQuantity = beforeEntryQuantity + quantityNumber;
    savedEntry = await base44.entities.Batch.update(sameDate.id, {
      quantity_received: (Number(sameDate.quantity_received) || 0) + quantityNumber,
      quantity_remaining: afterEntryQuantity,
      date_added: dateAdded || sameDate.date_added || today(),
    });
  } else {
    savedEntry = await base44.entities.Batch.create({
      product_id: productId,
      store_owner_email: storeOwnerEmail,
      expiration_date: expirationDate,
      quantity_received: quantityNumber,
      quantity_remaining: quantityNumber,
      date_added: dateAdded || today(),
    });
  }

  await createMovement({
    store_owner_email: storeOwnerEmail,
    product_id: productId,
    batch_id: savedEntry.id,
    movement_date: dateAdded || today(),
    type: 'reception',
    source: 'form',
    quantity: quantityNumber,
    quantity_before: totalBefore,
    quantity_after: totalBefore + quantityNumber,
    values_before: JSON.stringify({ batch_id: savedEntry.id, quantity_remaining: beforeEntryQuantity }),
    values_after: JSON.stringify({ batch_id: savedEntry.id, quantity_remaining: afterEntryQuantity }),
  });

  return savedEntry;
}

export async function applyManualStockMovement({ productId, storeOwnerEmail, quantity, justification, movementDate }) {
  const quantityNumber = Number(quantity) || 0;
  if (!productId || !storeOwnerEmail || quantityNumber <= 0 || !justification?.trim()) {
    throw new Error('Produit, quantité et justification sont obligatoires.');
  }

  const entries = await base44.entities.Batch.filter({ product_id: productId }, 'expiration_date', 200);
  const activeEntries = entries.filter((entry) => (Number(entry.quantity_remaining) || 0) > 0)
    .sort((a, b) => new Date(a.expiration_date) - new Date(b.expiration_date));
  const totalBefore = sumStock(activeEntries);
  if (quantityNumber > totalBefore) throw new Error('La quantité dépasse le stock disponible.');

  let remaining = quantityNumber;
  const before = [];
  const after = [];

  for (const entry of activeEntries) {
    if (remaining <= 0) break;
    const available = Number(entry.quantity_remaining) || 0;
    const used = Math.min(available, remaining);
    const newQuantity = available - used;
    before.push({ batch_id: entry.id, expiration_date: entry.expiration_date, quantity_remaining: available });
    after.push({ batch_id: entry.id, expiration_date: entry.expiration_date, quantity_remaining: newQuantity });
    await base44.entities.Batch.update(entry.id, { quantity_remaining: newQuantity });
    remaining -= used;
  }

  await createMovement({
    store_owner_email: storeOwnerEmail,
    product_id: productId,
    movement_date: movementDate || today(),
    type: 'vente',
    source: 'manual',
    quantity: quantityNumber,
    quantity_before: totalBefore,
    quantity_after: totalBefore - quantityNumber,
    justification: justification.trim(),
    values_before: JSON.stringify(before),
    values_after: JSON.stringify(after),
  });

  return { decremented: quantityNumber, missing: 0 };
}

export async function decrementStockFefo(productId, quantity = 1) {
  const entries = await base44.entities.Batch.filter({ product_id: productId }, 'expiration_date', 200);
  const firstEntry = entries.find((entry) => entry.store_owner_email);
  return applyManualStockMovement({
    productId,
    storeOwnerEmail: firstEntry?.store_owner_email,
    quantity,
    justification: 'Vente scannée',
    movementDate: today(),
  });
}