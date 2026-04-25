import { differenceInDays, startOfDay } from 'date-fns';

export function getProductStatus(expirationDate) {
  const today = startOfDay(new Date());
  const expiry = startOfDay(new Date(expirationDate));
  const daysRemaining = differenceInDays(expiry, today);

  if (daysRemaining < 0) return 'expired';
  if (daysRemaining < 3) return 'urgent';
  if (daysRemaining < 14) return 'soon';
  return 'ok';
}

export function getDaysRemaining(expirationDate) {
  const today = startOfDay(new Date());
  const expiry = startOfDay(new Date(expirationDate));
  return differenceInDays(expiry, today);
}

export const statusConfig = {
  expired: { color: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500' },
  urgent: { color: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
  soon: { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', dot: 'bg-yellow-500' },
  ok: { color: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500' },
};

export const orderStatusConfig = {
  to_order: { color: 'bg-red-100 text-red-700 border-red-200' },
  ordered: { color: 'bg-blue-100 text-blue-700 border-blue-200' },
  received: { color: 'bg-green-100 text-green-700 border-green-200' },
};

export const categoryKeys = {
  snacks: 'cat_snacks',
  beverages: 'cat_beverages',
  dry_groceries: 'cat_dry_groceries',
  fresh_products: 'cat_fresh_products',
  frozen_products: 'cat_frozen_products',
};

export const defaultRayons = [
  'Boissons',
  'Snacks',
  'Produits frais',
  'Congélateur',
  'Caisse',
  'Épicerie',
  'Hygiène',
];