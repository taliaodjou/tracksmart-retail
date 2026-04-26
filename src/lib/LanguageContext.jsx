import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  fr: {
    // Nav
    nav_dashboard: 'Tableau de bord',
    nav_admin: 'Administration',
    nav_profile: 'Profil',
    nav_logout: 'Déconnexion',
    nav_notifications: 'Notifications',

    // Dashboard
    dash_title: 'Tableau de bord',
    dash_add_product: 'Ajouter un produit',
    dash_product_name: 'Nom du produit',
    dash_category: 'Catégorie',
    dash_rayon: 'Rayon',
    dash_expiration_date: "Date d'expiration",
    dash_quantity: 'Quantité (optionnel)',
    dash_save: 'Enregistrer',
    dash_cancel: 'Annuler',
    dash_days_remaining: 'Jours restants',
    dash_status: 'Statut',
    dash_actions: 'Actions',
    dash_delete: 'Supprimer',
    dash_no_products: 'Aucun produit. Commencez par ajouter votre premier produit.',
    dash_print: 'Imprimer',
    dash_export_csv: 'Exporter CSV',
    dash_weekly_summary: 'Produits à surveiller cette semaine',
    dash_total_products: 'Total produits',
    dash_expired_products: 'Produits expirés',
    dash_urgent_products: 'Produits urgents',
    dash_search: 'Rechercher un produit…',
    dash_filter_all: 'Tous',
    dash_filter_expired: 'Expirés',
    dash_filter_urgent: 'Urgents',
    dash_filter_soon: 'Bientôt',
    dash_filter_ok: 'OK',
    dash_filter_category: 'Catégorie',
    dash_filter_rayon: 'Rayon',
    dash_order_status: 'Statut commande',
    dash_order_date: 'Date commande',

    // Order status
    order_a_commander: 'À commander',
    order_commande: 'Commandé',
    order_recu: 'Reçu',

    // Expiration status
    status_expired: 'Expiré',
    status_urgent: 'Urgent',
    status_soon: 'Bientôt',
    status_ok: 'OK',

    // Categories
    cat_snacks: 'Snacks',
    cat_boissons: 'Boissons',
    cat_congeles_poisson: 'Congelés Poisson',
    cat_congeles_poulet: 'Congelés Poulet',
    cat_produits_frais: 'Produits frais',
    cat_epicerie_seche: 'Épicerie sèche',
    cat_confiseries: 'Confiseries / sucreries',
    cat_conserves: 'Conserves',
    cat_hygiene_beaute: 'Hygiène & beauté',
    cat_entretien_maison: 'Entretien maison',
    cat_bebe: 'Bébé',
    cat_animaux: 'Animaux',
    cat_alcool: 'Alcool',
    cat_tabac: 'Tabac',

    // Subscription gate
    sub_blocked_title: 'Accès suspendu',
    sub_blocked_msg: 'Votre accès est suspendu. Merci de renouveler votre abonnement.',
    sub_contact: 'Contacter l\'administrateur',

    // Reminders
    reminder_14d: 'Votre abonnement arrive bientôt à échéance. Merci d\'anticiper le renouvellement.',
    reminder_7d: 'Rappel : votre abonnement expire dans 7 jours.',
    reminder_3d: 'Attention : votre abonnement expire dans 3 jours. Sans renouvellement, l\'accès sera bloqué.',

    // Profile
    profile_title: 'Mon profil',
    profile_phone: 'Numéro de téléphone',
    profile_report_channel: 'Recevoir le rapport hebdomadaire par',
    profile_email: 'Email',
    profile_sms: 'SMS',
    profile_save: 'Enregistrer',
    profile_saved: 'Profil enregistré',
    profile_subscription: 'Abonnement',
    profile_sub_status: 'Statut',
    profile_sub_start: 'Date de début',
    profile_sub_active: 'Actif',
    profile_sub_inactive: 'Inactif',
    profile_next_renewal: 'Prochain renouvellement',

    // Admin
    admin_title: 'Administration',
    admin_users: 'Utilisateurs',
    admin_subscription_status: 'Statut abonnement',
    admin_sub_start: 'Début abonnement',
    admin_activate: 'Activer',
    admin_deactivate: 'Désactiver',
    admin_payment_received: 'Paiement reçu',
    admin_send_report: 'Envoyer rapport',
    admin_invite_user: 'Inviter un utilisateur',
    admin_invite_email: 'Email',
    admin_invite_send: 'Envoyer invitation',
    admin_invited: 'Invitation envoyée',
    admin_user_activated: 'Abonnement activé',
    admin_user_deactivated: 'Abonnement désactivé',

    // Weekly report
    weekly_report_title: 'Rapport hebdomadaire',
    weekly_report_expired: 'Produits expirés',
    weekly_report_soon: 'Produits à surveiller',
    weekly_report_none: 'Aucun',

    // Misc
    confirm_delete: 'Êtes-vous sûr de vouloir supprimer ce produit ?',
    edit: 'Modifier',
    back: 'Retour',
    all: 'Tous',
    loading: 'Chargement…',
    close: 'Fermer',
    mark_read: 'Marquer comme lu',
  },
  en: {
    nav_dashboard: 'Dashboard',
    nav_admin: 'Admin',
    nav_profile: 'Profile',
    nav_logout: 'Logout',
    nav_notifications: 'Notifications',

    dash_title: 'Dashboard',
    dash_add_product: 'Add product',
    dash_product_name: 'Product name',
    dash_category: 'Category',
    dash_rayon: 'Section',
    dash_expiration_date: 'Expiration date',
    dash_quantity: 'Quantity (optional)',
    dash_save: 'Save',
    dash_cancel: 'Cancel',
    dash_days_remaining: 'Days remaining',
    dash_status: 'Status',
    dash_actions: 'Actions',
    dash_delete: 'Delete',
    dash_no_products: 'No products yet. Start by adding your first product.',
    dash_print: 'Print',
    dash_export_csv: 'Export CSV',
    dash_weekly_summary: 'Products to monitor this week',
    dash_total_products: 'Total products',
    dash_expired_products: 'Expired products',
    dash_urgent_products: 'Urgent products',
    dash_search: 'Search a product…',
    dash_filter_all: 'All',
    dash_filter_expired: 'Expired',
    dash_filter_urgent: 'Urgent',
    dash_filter_soon: 'Soon',
    dash_filter_ok: 'OK',
    dash_filter_category: 'Category',
    dash_filter_rayon: 'Section',
    dash_order_status: 'Order status',
    dash_order_date: 'Order date',

    order_a_commander: 'To order',
    order_commande: 'Ordered',
    order_recu: 'Received',

    status_expired: 'Expired',
    status_urgent: 'Urgent',
    status_soon: 'Soon',
    status_ok: 'OK',

    cat_snacks: 'Snacks',
    cat_boissons: 'Beverages',
    cat_congeles_poisson: 'Frozen Fish',
    cat_congeles_poulet: 'Frozen Chicken',
    cat_produits_frais: 'Fresh Products',
    cat_epicerie_seche: 'Dry Groceries',
    cat_confiseries: 'Confectionery',
    cat_conserves: 'Canned Goods',
    cat_hygiene_beaute: 'Hygiene & Beauty',
    cat_entretien_maison: 'Home Care',
    cat_bebe: 'Baby',
    cat_animaux: 'Pets',
    cat_alcool: 'Alcohol',
    cat_tabac: 'Tobacco',

    sub_blocked_title: 'Access suspended',
    sub_blocked_msg: 'Your access is suspended. Please renew your subscription.',
    sub_contact: 'Contact administrator',

    reminder_14d: 'Your subscription is expiring soon. Please arrange renewal in advance.',
    reminder_7d: 'Reminder: your subscription expires in 7 days.',
    reminder_3d: 'Warning: your subscription expires in 3 days. Without renewal, access will be blocked.',

    profile_title: 'My Profile',
    profile_phone: 'Phone number',
    profile_report_channel: 'Receive weekly report by',
    profile_email: 'Email',
    profile_sms: 'SMS',
    profile_save: 'Save',
    profile_saved: 'Profile saved',
    profile_subscription: 'Subscription',
    profile_sub_status: 'Status',
    profile_sub_start: 'Start date',
    profile_sub_active: 'Active',
    profile_sub_inactive: 'Inactive',
    profile_next_renewal: 'Next renewal',

    admin_title: 'Administration',
    admin_users: 'Users',
    admin_subscription_status: 'Subscription status',
    admin_sub_start: 'Subscription start',
    admin_activate: 'Activate',
    admin_deactivate: 'Deactivate',
    admin_payment_received: 'Payment received',
    admin_send_report: 'Send report',
    admin_invite_user: 'Invite user',
    admin_invite_email: 'Email',
    admin_invite_send: 'Send invitation',
    admin_invited: 'Invitation sent',
    admin_user_activated: 'Subscription activated',
    admin_user_deactivated: 'Subscription deactivated',

    weekly_report_title: 'Weekly Report',
    weekly_report_expired: 'Expired products',
    weekly_report_soon: 'Products to monitor',
    weekly_report_none: 'None',

    confirm_delete: 'Are you sure you want to delete this product?',
    edit: 'Edit',
    back: 'Back',
    all: 'All',
    loading: 'Loading…',
    close: 'Close',
    mark_read: 'Mark as read',
  },
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('tracksmart_lang') || 'fr');

  useEffect(() => {
    localStorage.setItem('tracksmart_lang', lang);
  }, [lang]);

  const t = (key) => translations[lang]?.[key] || translations['fr']?.[key] || key;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}