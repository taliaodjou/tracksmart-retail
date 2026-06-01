import { differenceInDays, startOfDay } from 'date-fns';

/**
 * Returns true if a product has been discarded (jeté).
 * Discarded products are excluded from active stock but kept for analytics.
 */
export function isDiscarded(product) {
  return product?.discarded === true;
}

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
  expired:  { color: 'bg-red-100 text-red-700 border-red-200', dot: 'bg-red-500' },
  urgent:   { color: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
  soon:     { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', dot: 'bg-yellow-500' },
  ok:       { color: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500' },
  archived: { color: 'bg-blue-100 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
};

/**
 * Returns the display status for a product, taking into account discarded state.
 * - If discarded AND DLC is still in the past → "archived" (blue)
 * - If discarded BUT DLC updated to future → normal status (ok/soon/urgent)
 * - Otherwise → normal status based on DLC
 */
export function getDisplayStatus(product) {
  if (!product) return 'ok';
  const baseStatus = product.expiration_date ? getProductStatus(product.expiration_date) : 'ok';
  if (product.discarded && baseStatus === 'expired') return 'archived';
  return baseStatus;
}

export const categoryKeys = {
  snacks:           'cat_snacks',
  boissons:         'cat_boissons',
  congeles_poisson: 'cat_congeles_poisson',
  congeles_poulet:  'cat_congeles_poulet',
  produits_frais:   'cat_produits_frais',
  epicerie_seche:   'cat_epicerie_seche',
  confiseries:      'cat_confiseries',
  conserves:        'cat_conserves',
  hygiene_beaute:   'cat_hygiene_beaute',
  entretien_maison: 'cat_entretien_maison',
  bebe:             'cat_bebe',
  animaux:          'cat_animaux',
  alcool:           'cat_alcool',
  tabac:            'cat_tabac',
};

export const rayonKeys = {
  '1': 'Rayon 1', '2': 'Rayon 2', '3': 'Rayon 3', '4': 'Rayon 4', '5': 'Rayon 5',
  '6': 'Rayon 6', '7': 'Rayon 7', '8': 'Rayon 8', '9': 'Rayon 9', '10': 'Rayon 10',
  '11': 'Rayon 11', '12': 'Rayon 12', '13': 'Rayon 13', '14': 'Rayon 14', '15': 'Rayon 15',
  'Frigo 1': 'Frigo 1', 'Frigo 2': 'Frigo 2', 'Frigo 3': 'Frigo 3',
  'Frigo 4': 'Frigo 4', 'Frigo 5': 'Frigo 5',
  'Congélateur 1': 'Congélateur 1', 'Congélateur 2': 'Congélateur 2', 'Congélateur 3': 'Congélateur 3',
};

export const orderStatusKeys = {
  a_commander: 'order_a_commander',
  commande:    'order_commande',
  recu:        'order_recu',
};

export function isAdmin(user) {
  return user?.role === 'admin' || user?.email === 'talia.odjou@gmail.com';
}

export function isStoreOwner(user) {
  return user?.role === 'owner' || user?.role === 'user' || (!user?.store_owner_email && !isAdmin(user));
}

export function isManager(user) {
  return user?.role === 'manager';
}

export function isEmployee(user) {
  return user?.role === 'employee';
}

export function canAccessAnalytics(user) {
  return isAdmin(user) || isStoreOwner(user) || isManager(user);
}

export function canManageTeam(user) {
  return isAdmin(user) || isStoreOwner(user);
}

export function canViewActivity(user) {
  return isAdmin(user) || isStoreOwner(user);
}

export function canManageBilling(user) {
  return isAdmin(user) || isStoreOwner(user);
}

/**
 * Returns the "store owner" email for any user.
 * This is the key used to scope all store data.
 */
export function getStoreOwnerEmail(user) {
  if (!user) return null;
  if (isAdmin(user)) return user.email;
  if (user.store_owner_email) return user.store_owner_email;
  return user.email; // owner = their own store
}

/**
 * Calcule les pertes totales d'une liste de produits.
 * Formule unique utilisée partout dans l'app : somme de (quantity_thrown * price_chf) pour chaque produit.
 * Ne dépend pas du statut d'expiration — un produit jeté est une perte, peu importe quand.
 */
export function calculateTotalLoss(products) {
  return (products || []).reduce((sum, p) => sum + ((p.quantity_thrown || 0) * (p.price_chf || 0)), 0);
}

export function hasActiveSubscription(user) {
  if (!user) return false;
  if (isAdmin(user)) return true;
  if (user?.subscription_status !== 'active') return false;
  // Check the user is still within their current 30-day billing cycle
  if (!user?.subscription_start_date) return false;
  const start = new Date(user.subscription_start_date);
  const today = startOfDay(new Date());
  const daysSinceStart = differenceInDays(today, start);
  // Every 30 days from start date = one billing cycle
  // If daysSinceStart mod 30 < 30, they are in an active cycle
  // But we also need the admin to have confirmed renewal each cycle.
  // Simple rule: active if within 30 days of the MOST RECENT renewal date
  const cyclesPassed = Math.floor(daysSinceStart / 30);
  const currentCycleStart = new Date(start);
  currentCycleStart.setDate(currentCycleStart.getDate() + cyclesPassed * 30);
  const daysIntoCycle = differenceInDays(today, startOfDay(currentCycleStart));
  return daysIntoCycle < 30;
}