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
    hero_subtitle: "Suivez vos produits, anticipez les expirations et gérez vos commandes facilement",
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
    how_step_1_text: "Entrez le nom, la catégorie, le rayon et la date d'expiration de chaque produit.",
    how_step_2_title: "Suivez en temps réel",
    how_step_2_text: "Le tableau de bord affiche le statut de chaque produit avec des alertes visuelles.",
    how_step_3_title: "Agissez à temps",
    how_step_3_text: "Exportez, imprimez et prenez des décisions avant qu'il ne soit trop tard.",

    // Pricing
    pricing_title: "Nos formules",
    pricing_choose_plan: "Choisir ce plan",
    pricing_per_month: "/mois",
    pricing_setup_fee: "Frais de mise en place",
    pricing_monthly_fee: "Abonnement mensuel",
    pricing_includes: "Inclus :",
    pricing_feature_1: "Suivi illimité des produits",
    pricing_feature_2: "Alertes automatiques",
    pricing_feature_3: "Export CSV et impression",
    pricing_feature_4: "Support dédié",

    // Plans
    plan_small_name: "Petite épicerie",
    plan_small_desc: "Idéal pour les petits commerces de proximité avec 50 à 200 produits.",
    plan_medium_name: "Épicerie moyenne",
    plan_medium_desc: "Pour les épiceries de taille moyenne avec 200 à 500 produits.",
    plan_large_name: "Grande épicerie",
    plan_large_desc: "Pour les grandes surfaces et mini-marchés avec 500+ produits.",

    // Footer
    footer_rights: "Tous droits réservés.",

    // Dashboard
    dash_title: "Tableau de bord",
    dash_add_product: "Ajouter un produit",
    dash_product_name: "Nom du produit",
    dash_category: "Catégorie",
    dash_rayon: "Rayon",
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
    dash_filter_category: "Catégorie",
    dash_filter_rayon: "Rayon",
    dash_order_status: "Statut commande",
    dash_order_date: "Date de commande",

    // Order status
    order_a_commander: "À commander",
    order_commande: "Commandé",
    order_recu: "Reçu",

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

    // Rayons
    rayon_boissons: "Boissons",
    rayon_snacks: "Snacks",
    rayon_produits_frais: "Produits frais",
    rayon_congelateur: "Congélateur",
    rayon_caisse: "Caisse",

    // Subscription
    sub_inactive_title: "Abonnement inactif",
    sub_inactive_msg: "Votre abonnement est inactif. Veuillez le renouveler pour continuer à utiliser TrackSmart.",
    sub_none_title: "Aucun abonnement",
    sub_none_msg: "Vous n'avez pas encore d'abonnement actif. Choisissez un plan pour accéder au tableau de bord.",
    sub_choose_plan: "Voir les offres",
    sub_active: "Actif",
    sub_inactive: "Inactif",
    sub_renew: "Renouveler",

    // Payment
    pay_title: "Finaliser votre abonnement",
    pay_plan: "Plan sélectionné",
    pay_setup: "Frais de mise en place",
    pay_monthly: "Abonnement mensuel",
    pay_total: "Total aujourd'hui",
    pay_card: "Carte de crédit",
    pay_paypal: "PayPal",
    pay_card_number: "Numéro de carte",
    pay_expiry: "Expiration",
    pay_cvc: "CVC",
    pay_cardholder: "Titulaire de la carte",
    pay_confirm: "Confirmer et payer",
    pay_processing: "Traitement en cours...",
    pay_success: "Paiement réussi ! Bienvenue sur TrackSmart.",
    pay_paypal_info: "Vous serez redirigé vers PayPal pour finaliser le paiement.",
    pay_paypal_btn: "Payer avec PayPal",

    // Misc
    confirm_delete: "Êtes-vous sûr de vouloir supprimer ce produit ?",
    edit: "Modifier",
    back: "Retour",
    all: "Tous",
  },
  en: {
    nav_features: "Features",
    nav_pricing: "Pricing",
    nav_dashboard: "Dashboard",
    nav_login: "Login",
    nav_logout: "Logout",
    nav_get_started: "Get started",

    hero_title: "Stop losing money on expired products",
    hero_subtitle: "Track products, anticipate expiration, and manage restocking easily",
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
    how_step_1_text: "Enter the name, category, store section, and expiration date of each product.",
    how_step_2_title: "Track in real time",
    how_step_2_text: "The dashboard shows the status of each product with visual alerts.",
    how_step_3_title: "Act on time",
    how_step_3_text: "Export, print, and make decisions before it's too late.",

    pricing_title: "Our Plans",
    pricing_choose_plan: "Choose this plan",
    pricing_per_month: "/month",
    pricing_setup_fee: "Setup fee",
    pricing_monthly_fee: "Monthly subscription",
    pricing_includes: "Includes:",
    pricing_feature_1: "Unlimited product tracking",
    pricing_feature_2: "Automatic alerts",
    pricing_feature_3: "CSV export & print",
    pricing_feature_4: "Dedicated support",

    plan_small_name: "Small shop",
    plan_small_desc: "Ideal for small convenience stores with 50–200 products.",
    plan_medium_name: "Medium shop",
    plan_medium_desc: "For medium grocery stores with 200–500 products.",
    plan_large_name: "Large shop",
    plan_large_desc: "For large stores and mini-markets with 500+ products.",

    footer_rights: "All rights reserved.",

    dash_title: "Dashboard",
    dash_add_product: "Add product",
    dash_product_name: "Product name",
    dash_category: "Category",
    dash_rayon: "Store section",
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
    dash_filter_category: "Category",
    dash_filter_rayon: "Section",
    dash_order_status: "Order status",
    dash_order_date: "Order date",

    order_a_commander: "To order",
    order_commande: "Ordered",
    order_recu: "Received",

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
    rayon_produits_frais: "Fresh products",
    rayon_congelateur: "Freezer",
    rayon_caisse: "Checkout",

    sub_inactive_title: "Inactive subscription",
    sub_inactive_msg: "Your subscription is inactive. Please renew to continue using TrackSmart.",
    sub_none_title: "No subscription",
    sub_none_msg: "You don't have an active subscription yet. Choose a plan to access the dashboard.",
    sub_choose_plan: "View plans",
    sub_active: "Active",
    sub_inactive: "Inactive",
    sub_renew: "Renew",

    pay_title: "Complete your subscription",
    pay_plan: "Selected plan",
    pay_setup: "Setup fee",
    pay_monthly: "Monthly subscription",
    pay_total: "Total today",
    pay_card: "Credit card",
    pay_paypal: "PayPal",
    pay_card_number: "Card number",
    pay_expiry: "Expiry",
    pay_cvc: "CVC",
    pay_cardholder: "Cardholder name",
    pay_confirm: "Confirm & Pay",
    pay_processing: "Processing...",
    pay_success: "Payment successful! Welcome to TrackSmart.",
    pay_paypal_info: "You will be redirected to PayPal to complete the payment.",
    pay_paypal_btn: "Pay with PayPal",

    confirm_delete: "Are you sure you want to delete this product?",
    edit: "Edit",
    back: "Back",
    all: "All",
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