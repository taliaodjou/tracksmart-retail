import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  fr: {
    // Nav
    nav_features: "Fonctionnalités",
    nav_pricing: "Tarifs",
    nav_dashboard: "Tableau de bord",
    nav_login: "Connexion",
    nav_logout: "Déconnexion",
    nav_get_started: "Commencer",

    // Hero
    hero_title: "Arrêtez de perdre de l'argent avec les produits expirés",
    hero_subtitle: "Suivez vos dates d'expiration, réduisez le gaspillage et augmentez vos profits simplement",
    hero_cta: "Commencer",
    hero_cta_secondary: "En savoir plus",

    // Problem
    problem_title: "Le problème",
    problem_text_1: "Chaque année, les petits commerces perdent des milliers de francs à cause des produits périmés jetés.",
    problem_text_2: "Sans un suivi précis, les dates d'expiration passent inaperçues et les pertes s'accumulent.",
    problem_text_3: "Les solutions existantes sont souvent trop complexes ou coûteuses pour les petits commerces.",

    // Solution
    solution_title: "La solution",
    solution_text_1: "TrackSmart vous alerte automatiquement avant qu'un produit n'expire.",
    solution_text_2: "Visualisez en un coup d'œil les produits à surveiller.",
    solution_text_3: "Réduisez vos pertes et augmentez vos marges facilement.",

    // How it works
    how_title: "Comment ça marche",
    how_step_1_title: "Ajoutez vos produits",
    how_step_1_text: "Entrez le nom, le rayon, la catégorie et la date d'expiration de chaque produit.",
    how_step_2_title: "Suivez en temps réel",
    how_step_2_text: "Le tableau de bord affiche le statut de chaque produit avec des alertes visuelles.",
    how_step_3_title: "Agissez à temps",
    how_step_3_text: "Gérez vos commandes de réapprovisionnement et exportez vos données.",

    // Pricing
    pricing_title: "Nos offres",
    pricing_subtitle: "Choisissez le plan adapté à la taille de votre commerce",
    pricing_choose: "Choisir ce plan",
    pricing_setup: "Mise en place",
    pricing_monthly: "Mensuel",
    pricing_setup_desc: "Configuration initiale, formation et onboarding",
    pricing_monthly_desc: "Accès complet à toutes les fonctionnalités",
    pricing_per_month: "/mois",
    pricing_includes: "Inclus :",
    pricing_feature_1: "Suivi illimité des produits",
    pricing_feature_2: "Alertes automatiques",
    pricing_feature_3: "Export CSV et impression",
    pricing_feature_4: "Support dédié",
    pricing_feature_5: "Gestion des rayons",
    pricing_feature_6: "Suivi des réapprovisionnements",

    // Plans
    plan_small_name: "Petit commerce",
    plan_small_desc: "Épicerie de proximité",
    plan_small_detail: "Environ 50–200 produits",
    plan_medium_name: "Commerce moyen",
    plan_medium_desc: "Supermarché de taille moyenne",
    plan_medium_detail: "Environ 200–500 produits",
    plan_large_name: "Grand commerce",
    plan_large_desc: "Grande épicerie / mini-marché",
    plan_large_detail: "500+ produits",
    plan_popular: "Le plus populaire",

    // Payment
    payment_title: "Finaliser votre abonnement",
    payment_plan_summary: "Récapitulatif du plan",
    payment_setup_fee: "Frais de mise en place",
    payment_monthly_fee: "Abonnement mensuel",
    payment_method: "Mode de paiement",
    payment_card: "Carte bancaire",
    payment_paypal: "PayPal",
    payment_card_number: "Numéro de carte",
    payment_expiry: "Date d'expiration",
    payment_cvv: "CVV",
    payment_name: "Nom sur la carte",
    payment_pay_now: "Payer et activer",
    payment_processing: "Traitement en cours...",
    payment_success_title: "Paiement réussi !",
    payment_success_msg: "Votre abonnement est maintenant actif. Bienvenue sur TrackSmart !",
    payment_go_dashboard: "Aller au tableau de bord",
    payment_paypal_btn: "Payer avec PayPal",
    payment_back: "Retour",
    payment_total: "Total aujourd'hui",
    payment_then: "puis",

    // Footer
    footer_rights: "Tous droits réservés.",

    // Dashboard
    dash_title: "Tableau de bord",
    dash_add_product: "Ajouter un produit",
    dash_product_name: "Nom du produit",
    dash_category: "Catégorie",
    dash_rayon: "Rayon",
    dash_rayon_placeholder: "Ex: Boissons, Snacks...",
    dash_expiration_date: "Date d'expiration",
    dash_quantity: "Quantité (optionnel)",
    dash_save: "Enregistrer",
    dash_cancel: "Annuler",
    dash_days_remaining: "Jours restants",
    dash_status: "Statut",
    dash_actions: "Actions",
    dash_delete: "Supprimer",
    dash_no_products: "Aucun produit ajouté. Commencez par ajouter votre premier produit.",
    dash_print: "Imprimer",
    dash_export_csv: "Exporter CSV",
    dash_weekly_summary: "Produits à surveiller cette semaine",
    dash_total_products: "Total produits",
    dash_expired_products: "Produits expirés",
    dash_urgent_products: "Produits urgents",
    dash_search: "Rechercher un produit...",
    dash_filter_all: "Tous",
    dash_filter_expired: "Expirés",
    dash_filter_urgent: "Urgents",
    dash_filter_soon: "Bientôt",
    dash_filter_ok: "OK",
    dash_filter_rayon: "Tous les rayons",
    dash_order_status: "Statut commande",
    dash_order_date: "Date de commande",
    dash_restocking: "Réapprovisionnement",

    // Order statuses
    order_to_order: "À commander",
    order_ordered: "Commandé",
    order_received: "Reçu",

    // Status
    status_expired: "Expiré",
    status_urgent: "Urgent",
    status_soon: "Bientôt",
    status_ok: "OK",

    // Categories
    cat_snacks: "Snacks",
    cat_beverages: "Boissons",
    cat_dry_groceries: "Épicerie sèche",
    cat_fresh_products: "Produits frais",
    cat_frozen_products: "Produits congelés",

    // Default rayons
    rayon_boissons: "Boissons",
    rayon_snacks: "Snacks",
    rayon_frais: "Produits frais",
    rayon_congelateur: "Congélateur",
    rayon_caisse: "Caisse",
    rayon_epicerie: "Épicerie",
    rayon_hygiene: "Hygiène",

    // Subscription
    sub_inactive_title: "Abonnement inactif",
    sub_inactive_msg: "Votre abonnement est inactif. Veuillez le renouveler pour continuer à utiliser TrackSmart.",
    sub_activate: "Activer l'abonnement",
    sub_activating: "Activation...",
    sub_active: "Actif",
    sub_inactive: "Inactif",
    sub_choose_plan: "Choisir un plan",

    // Misc
    confirm_delete: "Êtes-vous sûr de vouloir supprimer ce produit ?",
    edit: "Modifier",
  },
  en: {
    nav_features: "Features",
    nav_pricing: "Pricing",
    nav_dashboard: "Dashboard",
    nav_login: "Login",
    nav_logout: "Logout",
    nav_get_started: "Get started",

    hero_title: "Stop losing money on expired products",
    hero_subtitle: "Track expiration dates, reduce waste, and increase your profits easily",
    hero_cta: "Get started",
    hero_cta_secondary: "Learn more",

    problem_title: "The problem",
    problem_text_1: "Every year, small shops lose thousands of francs because of expired products thrown away.",
    problem_text_2: "Without accurate tracking, expiration dates go unnoticed and losses accumulate.",
    problem_text_3: "Existing solutions are often too complex or expensive for small businesses.",

    solution_title: "The solution",
    solution_text_1: "TrackSmart automatically alerts you before a product expires.",
    solution_text_2: "See at a glance which products need attention.",
    solution_text_3: "Reduce your losses and increase your margins easily.",

    how_title: "How it works",
    how_step_1_title: "Add your products",
    how_step_1_text: "Enter the name, shelf section, category and expiration date of each product.",
    how_step_2_title: "Track in real time",
    how_step_2_text: "The dashboard shows the status of each product with visual alerts.",
    how_step_3_title: "Act on time",
    how_step_3_text: "Manage restocking orders and export your data before it's too late.",

    pricing_title: "Pricing",
    pricing_subtitle: "Choose the plan that fits your store size",
    pricing_choose: "Choose this plan",
    pricing_setup: "Setup",
    pricing_monthly: "Monthly",
    pricing_setup_desc: "Initial configuration, training and onboarding",
    pricing_monthly_desc: "Full access to all features",
    pricing_per_month: "/month",
    pricing_includes: "Includes:",
    pricing_feature_1: "Unlimited product tracking",
    pricing_feature_2: "Automatic alerts",
    pricing_feature_3: "CSV export & print",
    pricing_feature_4: "Dedicated support",
    pricing_feature_5: "Shelf section management",
    pricing_feature_6: "Restocking tracking",

    plan_small_name: "Small shop",
    plan_small_desc: "Small convenience store",
    plan_small_detail: "Around 50–200 products",
    plan_medium_name: "Medium shop",
    plan_medium_desc: "Medium-size grocery store",
    plan_medium_detail: "Around 200–500 products",
    plan_large_name: "Large shop",
    plan_large_desc: "Large grocery store / mini-market",
    plan_large_detail: "500+ products",
    plan_popular: "Most popular",

    payment_title: "Complete your subscription",
    payment_plan_summary: "Plan summary",
    payment_setup_fee: "Setup fee",
    payment_monthly_fee: "Monthly subscription",
    payment_method: "Payment method",
    payment_card: "Credit card",
    payment_paypal: "PayPal",
    payment_card_number: "Card number",
    payment_expiry: "Expiry date",
    payment_cvv: "CVV",
    payment_name: "Name on card",
    payment_pay_now: "Pay & activate",
    payment_processing: "Processing...",
    payment_success_title: "Payment successful!",
    payment_success_msg: "Your subscription is now active. Welcome to TrackSmart!",
    payment_go_dashboard: "Go to dashboard",
    payment_paypal_btn: "Pay with PayPal",
    payment_back: "Back",
    payment_total: "Total today",
    payment_then: "then",

    footer_rights: "All rights reserved.",

    dash_title: "Dashboard",
    dash_add_product: "Add product",
    dash_product_name: "Product name",
    dash_category: "Category",
    dash_rayon: "Shelf / Section",
    dash_rayon_placeholder: "E.g: Beverages, Snacks...",
    dash_expiration_date: "Expiration date",
    dash_quantity: "Quantity (optional)",
    dash_save: "Save",
    dash_cancel: "Cancel",
    dash_days_remaining: "Days remaining",
    dash_status: "Status",
    dash_actions: "Actions",
    dash_delete: "Delete",
    dash_no_products: "No products added yet. Start by adding your first product.",
    dash_print: "Print",
    dash_export_csv: "Export CSV",
    dash_weekly_summary: "Products to monitor this week",
    dash_total_products: "Total products",
    dash_expired_products: "Expired products",
    dash_urgent_products: "Urgent products",
    dash_search: "Search a product...",
    dash_filter_all: "All",
    dash_filter_expired: "Expired",
    dash_filter_urgent: "Urgent",
    dash_filter_soon: "Soon",
    dash_filter_ok: "OK",
    dash_filter_rayon: "All sections",
    dash_order_status: "Order status",
    dash_order_date: "Order date",
    dash_restocking: "Restocking",

    order_to_order: "To order",
    order_ordered: "Ordered",
    order_received: "Received",

    status_expired: "Expired",
    status_urgent: "Urgent",
    status_soon: "Soon",
    status_ok: "OK",

    cat_snacks: "Snacks",
    cat_beverages: "Beverages",
    cat_dry_groceries: "Dry groceries",
    cat_fresh_products: "Fresh products",
    cat_frozen_products: "Frozen products",

    rayon_boissons: "Beverages",
    rayon_snacks: "Snacks",
    rayon_frais: "Fresh products",
    rayon_congelateur: "Freezer",
    rayon_caisse: "Checkout",
    rayon_epicerie: "Grocery",
    rayon_hygiene: "Hygiene",

    sub_inactive_title: "Inactive subscription",
    sub_inactive_msg: "Your subscription is inactive. Please renew to continue using TrackSmart.",
    sub_activate: "Activate subscription",
    sub_activating: "Activating...",
    sub_active: "Active",
    sub_inactive: "Inactive",
    sub_choose_plan: "Choose a plan",

    confirm_delete: "Are you sure you want to delete this product?",
    edit: "Edit",
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('tracksmart_lang') || 'fr';
  });

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