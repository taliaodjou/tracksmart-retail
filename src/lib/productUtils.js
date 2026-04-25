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

export const categoryKeys = {
  snacks: 'cat_snacks',
  beverages: 'cat_beverages',
  dry_groceries: 'cat_dry_groceries',
  fresh_products: 'cat_fresh_products',
  frozen_products: 'cat_frozen_products',
};

export const rayonKeys = {
  boissons: 'rayon_boissons',
  snacks: 'rayon_snacks',
  produits_frais: 'rayon_produits_frais',
  congelateur: 'rayon_congelateur',
  caisse: 'rayon_caisse',
};

export const orderStatusKeys = {
  a_commander: 'order_a_commander',
  commande: 'order_commande',
  recu: 'order_recu',
};

export const ADMIN_EMAIL = 'admin@tracksmart.com';

export function isAdmin(user) {
  return user?.role === 'admin' || user?.email === ADMIN_EMAIL;
}

export function hasActiveSubscription(user) {
  if (!user) return false;
  if (isAdmin(user)) return true;
  return user?.subscription_status === 'active';
}