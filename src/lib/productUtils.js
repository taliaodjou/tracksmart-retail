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
  urgent:  { color: 'bg-orange-100 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
  soon:    { color: 'bg-yellow-100 text-yellow-700 border-yellow-200', dot: 'bg-yellow-500' },
  ok:      { color: 'bg-green-100 text-green-700 border-green-200', dot: 'bg-green-500' },
};

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
};

export const orderStatusKeys = {
  a_commander: 'order_a_commander',
  commande:    'order_commande',
  recu:        'order_recu',
};

export function isAdmin(user) {
  return user?.role === 'admin' || user?.email === 'talia.odjou@gmail.com';
}

export function hasActiveSubscription(user) {
  if (!user) return false;
  if (isAdmin(user)) return true;
  return user?.subscription_status === 'active';
}