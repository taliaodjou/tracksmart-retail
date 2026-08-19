import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  fr: {
    // Nav
    nav_dashboard: 'Tableau de bord',
    nav_analytics: 'Analytiques',
    nav_admin: 'Administration',
    nav_orders: 'Commandes',
    nav_barcode_db: 'Base EAN',
    nav_profile: 'Profil',
    nav_logout: 'Déconnexion',
    nav_notifications: 'Notifications',
    nav_features: 'Fonctionnalités',
    nav_pricing: 'Tarifs',
    nav_get_started: 'Commencer',
    nav_products: 'Produits',
    nav_stock: 'Gérer mon stock',
    nav_more: 'Plus',
    nav_documents: 'Documents',
    nav_team: 'Équipe',
    nav_activity: 'Activité',
    nav_reports: 'Rapports',

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
    status_archived: 'Fin de stock',

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
    sub_blocked_title: 'Votre demande a bien été reçue',
    sub_blocked_msg: 'L’administrateur vous donne accès à votre compte. Merci de patienter quelques instants.',
    sub_waiting_auto: 'Cette page vérifie automatiquement l’état de votre accès et se mettra à jour dès que votre compte sera validé.',

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

    // Table headers
    col_product: 'Produit',
    col_brand: 'Marque',
    col_category: 'Catégorie',
    col_rayon: 'Rayon',
    col_dlc: 'DLC',
    col_days: 'Jours',
    col_status: 'Statut',
    col_action: 'Action',
    col_qty_thrown: 'Qté jetée',
    col_price_chf: 'Prix CHF',

    // Filter bar
    filter_label: 'Filtres',
    btn_scanner: 'Scanner',
    btn_add: 'Ajouter',

    // Product form labels
    form_product: 'Produit *',
    form_brand: 'Marque',
    form_category: 'Catégorie',
    form_rayon: 'Rayon',
    form_reception_date: 'Date de réception',
    form_dlc: "DLC (Date d'expiration) *",
    form_expired_section: 'Champs expiré',
    form_action: 'Action',
    form_order_date: 'Date de commande',
    form_qty_thrown: 'Quantité jetée',
    form_price_chf: 'Prix CHF',
    form_total_chf: 'Total CHF',

    // Action options
    action_jeter: 'Jeter',
    action_a_recommander: 'À recommander',
    action_commande: 'Commandé',
    action_en_transition: 'En transition',
    action_recu: 'Reçu',

    // Orders page
    orders_title: 'Gestion des commandes',
    orders_subtitle_plural: 'produit(s) identifié(s) à recommander ou réapprovisionner',
    orders_pdf: 'PDF / Imprimer',
    orders_send_email: 'Envoyer par email',
    orders_sent: 'Envoyé !',
    orders_products_title: 'Produits à commander',
    orders_select_all: 'Tout sélectionner',
    orders_deselect_all: 'Tout désélectionner',
    orders_empty: 'Aucun produit à recommander pour l\'instant.',
    orders_empty_hint: 'Marquez des produits comme "À recommander" dans le tableau de bord.',
    orders_supplier_title: 'Coordonnées fournisseur',
    orders_supplier_name: 'Nom fournisseur *',
    orders_supplier_contact: 'Contact',
    orders_supplier_contact_placeholder: 'Nom du commercial',
    orders_supplier_email: 'Email *',
    orders_supplier_phone: 'Téléphone',
    orders_supplier_address: 'Adresse',
    orders_supplier_address_placeholder: 'Rue, Ville, Code postal',
    orders_summary_title: 'Récapitulatif',
    orders_summary_empty: 'Aucun produit sélectionné',
    orders_summary_items: 'Articles sélectionnés',
    orders_summary_qty: 'Quantité totale',
    orders_summary_order_num: 'N° bon de commande',
    orders_download: 'Télécharger / Imprimer PDF',
    orders_send_supplier: 'Envoyer par email au fournisseur',
    orders_dlc: 'DLC',
    orders_qty_label: 'Qté',
    orders_note_label: 'Note',
    orders_note_placeholder: 'Remarque…',
    orders_select_product: 'Sélectionnez au moins un produit.',
    orders_fill_email: "Veuillez renseigner l'email du fournisseur.",
    orders_feature: 'la gestion des commandes',
    orders_to_recommend: 'À recommander',

    // Barcode DB
    barcode_title: 'Base de données EAN',
    barcode_subtitle: 'produit(s) enregistré(s) — utilisés lors des scans',
    barcode_import: 'Importer CSV / Excel',
    barcode_processing: 'Traitement…',
    barcode_columns_info: '📋 Colonnes reconnues automatiquement',
    barcode_columns_desc: 'EAN / Barcode · Nom / Product · Marque / Brand · Catégorie · Rayon · Prix CHF',
    barcode_preview_title: 'Aperçu',
    barcode_preview_products: 'produit(s)',
    barcode_cancel: 'Annuler',
    barcode_confirm_import: "Confirmer l'import",
    barcode_ignored_lines: 'ligne(s) ignorée(s)',
    barcode_more_lines: 'autres lignes…',
    barcode_search_placeholder: 'Rechercher par EAN, nom, marque…',
    barcode_no_result: 'Aucun résultat',
    barcode_empty: 'Aucun code-barres enregistré.',
    barcode_empty_hint: 'Importez un fichier CSV/Excel pour commencer.',
    barcode_feature: 'la base de données EAN',
    col_name: 'Nom',
    col_ean: 'EAN',
    barcode_detected: 'produits détectés — vérifiez l\'aperçu.',
    barcode_empty_file: 'Fichier vide.',
    barcode_read_error: 'Impossible de lire le fichier.',
    barcode_no_valid: 'Aucun produit valide détecté.',
    barcode_imported: 'codes-barres importés !',

    // Misc
    confirm_delete: 'Êtes-vous sûr de vouloir supprimer ce produit ?',
    edit: 'Modifier',
    back: 'Retour',
    all: 'Tous',
    loading: 'Chargement…',
    close: 'Fermer',
    mark_read: 'Marquer comme lu',
    units: 'unités',
  },
  en: {
    nav_dashboard: 'Dashboard',
    nav_analytics: 'Analytics',
    nav_admin: 'Admin',
    nav_orders: 'Orders',
    nav_barcode_db: 'EAN DB',
    nav_profile: 'Profile',
    nav_logout: 'Logout',
    nav_notifications: 'Notifications',
    nav_features: 'Features',
    nav_pricing: 'Pricing',
    nav_get_started: 'Get started',
    nav_products: 'Products',
    nav_stock: 'Manage stock',
    nav_more: 'More',
    nav_documents: 'Documents',
    nav_team: 'Team',
    nav_activity: 'Activity',
    nav_reports: 'Reports',

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
    status_archived: 'Out of stock',

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

    sub_blocked_title: 'Your request has been received',
    sub_blocked_msg: 'The administrator is giving you access to your account. Please wait a few moments.',
    sub_waiting_auto: 'This page automatically checks your access status and will update as soon as your account is validated.',

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

    // Table headers
    col_product: 'Product',
    col_brand: 'Brand',
    col_category: 'Category',
    col_rayon: 'Section',
    col_dlc: 'Exp. Date',
    col_days: 'Days',
    col_status: 'Status',
    col_action: 'Action',
    col_qty_thrown: 'Qty thrown',
    col_price_chf: 'Price CHF',

    // Filter bar
    filter_label: 'Filters',
    btn_scanner: 'Scan',
    btn_add: 'Add',

    // Product form labels
    form_product: 'Product *',
    form_brand: 'Brand',
    form_category: 'Category',
    form_rayon: 'Section',
    form_reception_date: 'Reception date',
    form_dlc: 'Expiration date *',
    form_expired_section: 'Expired fields',
    form_action: 'Action',
    form_order_date: 'Order date',
    form_qty_thrown: 'Quantity thrown',
    form_price_chf: 'Unit price CHF',
    form_total_chf: 'Total CHF',

    // Action options
    action_jeter: 'Discard',
    action_a_recommander: 'To reorder',
    action_commande: 'Ordered',
    action_en_transition: 'In transition',
    action_recu: 'Received',

    // Orders page
    orders_title: 'Order management',
    orders_subtitle_plural: 'product(s) identified for reorder or replenishment',
    orders_pdf: 'PDF / Print',
    orders_send_email: 'Send by email',
    orders_sent: 'Sent!',
    orders_products_title: 'Products to order',
    orders_select_all: 'Select all',
    orders_deselect_all: 'Deselect all',
    orders_empty: 'No products to reorder right now.',
    orders_empty_hint: 'Mark products as "To reorder" in the dashboard.',
    orders_supplier_title: 'Supplier details',
    orders_supplier_name: 'Supplier name *',
    orders_supplier_contact: 'Contact',
    orders_supplier_contact_placeholder: 'Sales rep name',
    orders_supplier_email: 'Email *',
    orders_supplier_phone: 'Phone',
    orders_supplier_address: 'Address',
    orders_supplier_address_placeholder: 'Street, City, ZIP',
    orders_summary_title: 'Summary',
    orders_summary_empty: 'No products selected',
    orders_summary_items: 'Selected items',
    orders_summary_qty: 'Total quantity',
    orders_summary_order_num: 'Order number',
    orders_download: 'Download / Print PDF',
    orders_send_supplier: 'Send by email to supplier',
    orders_dlc: 'Exp.',
    orders_qty_label: 'Qty',
    orders_note_label: 'Note',
    orders_note_placeholder: 'Remark…',
    orders_select_product: 'Please select at least one product.',
    orders_fill_email: 'Please enter the supplier email.',
    orders_feature: 'order management',
    orders_to_recommend: 'To reorder',

    // Barcode DB
    barcode_title: 'EAN Database',
    barcode_subtitle: 'product(s) registered — used during scans',
    barcode_import: 'Import CSV / Excel',
    barcode_processing: 'Processing…',
    barcode_columns_info: '📋 Auto-detected columns',
    barcode_columns_desc: 'EAN / Barcode · Name / Product · Brand · Category · Section · Price CHF',
    barcode_preview_title: 'Preview',
    barcode_preview_products: 'product(s)',
    barcode_cancel: 'Cancel',
    barcode_confirm_import: 'Confirm import',
    barcode_ignored_lines: 'row(s) skipped',
    barcode_more_lines: 'more rows…',
    barcode_search_placeholder: 'Search by EAN, name, brand…',
    barcode_no_result: 'No results',
    barcode_empty: 'No barcodes registered yet.',
    barcode_empty_hint: 'Import a CSV/Excel file to get started.',
    barcode_feature: 'EAN database',
    col_name: 'Name',
    col_ean: 'EAN',
    barcode_detected: 'products detected — check the preview.',
    barcode_empty_file: 'Empty file.',
    barcode_read_error: 'Unable to read the file.',
    barcode_no_valid: 'No valid products detected.',
    barcode_imported: 'barcodes imported!',

    confirm_delete: 'Are you sure you want to delete this product?',
    edit: 'Edit',
    back: 'Back',
    all: 'All',
    loading: 'Loading…',
    close: 'Close',
    mark_read: 'Mark as read',
    units: 'units',
  },
};

const uiTextTranslations = {
  'Tableau de bord': 'Dashboard',
  'Produits': 'Products',
  'Gérer mon stock': 'Manage stock',
  'Analytiques': 'Analytics',
  'Analytique': 'Analytics',
  'Commandes': 'Orders',
  'Documents': 'Documents',
  'Équipe': 'Team',
  'Activité': 'Activity',
  'Rapports': 'Reports',
  'Profil': 'Profile',
  'Plus': 'More',
  'Déconnexion': 'Logout',
  'Ajouter un produit': 'Add product',
  'Fichiers': 'Files',
  'Importer': 'Import',
  'Exporter': 'Export',
  'Imprimer': 'Print',
  'Rechercher': 'Search',
  'Tous': 'All',
  'Expirés': 'Expired',
  'Urgents': 'Urgent',
  'Bientôt': 'Soon',
  'Fin de stock': 'Out of stock',
  'Catégorie': 'Category',
  'Rayon': 'Section',
  'Statut': 'Status',
  'Actions': 'Actions',
  'Modifier': 'Edit',
  'Supprimer': 'Delete',
  'Fermer': 'Close',
  'Annuler': 'Cancel',
  'Enregistrer': 'Save',
  'Valider': 'Confirm',
  'Retour': 'Back',
  'Chargement…': 'Loading…',
  'Unités en stock': 'Units in stock',
  'Produits expirés': 'Expired products',
  'Produits urgents': 'Urgent products',
  'Total pertes': 'Total losses',
  'Valeur du stock': 'Stock value',
  'Voir le détail des pertes': 'View loss details',
  'Produits à surveiller cette semaine': 'Products to monitor this week',
  'Proches expiration': 'Close to expiry',
  'à traiter': 'to review',
  'Pertes évitées': 'Avoided losses',
  'ce mois': 'this month',
  'total': 'total',
  'Compléter': 'Replenish',
  'Jeter': 'Discard',
  'Vendu': 'Sold',
  'Perdu': 'Lost',
  'Vendues': 'Sold',
  'Perdues': 'Lost',
  'Précision perte optionnelle': 'Optional loss details',
  'Valider le recomptage': 'Confirm stock count',
  'Stock théorique': 'Expected stock',
  'Quantité réelle': 'Actual quantity',
  'Nature de l’écart': 'Discrepancy type',
  'Nature de l\'écart': 'Discrepancy type',
  'Total à répartir': 'Total to split',
  'unités': 'units',
  'unité': 'unit',
  'Scanner le code-barres': 'Scan barcode',
  'Saisir un nouveau produit manuellement': 'Enter a new product manually',
  'Compléter un produit déjà enregistré': 'Replenish an existing product',
  'Nom du produit': 'Product name',
  'Marque': 'Brand',
  'Code-barres': 'Barcode',
  'Prix de vente': 'Sale price',
  'Date de réception': 'Reception date',
  'Date d\'expiration': 'Expiration date',
  'DLC': 'Expiry date',
  'Quantité': 'Quantity',
  'Description': 'Description',
  'Connexion': 'Log in',
  'Créer un compte': 'Create account',
  'Essayer gratuitement': 'Try for free',
  'Voir comment ça marche': 'See how it works',
  'Le problème': 'The problem',
  'La solution': 'The solution',
  'Fonctionnalités': 'Features',
  'Les offres': 'Plans',
  'LA SOLUTION DES COMMERÇANTS MALINS': 'THE SMART RETAILER SOLUTION',
  'Gérez vos stocks.': 'Manage your stock.',
  'Évitez les pertes.': 'Avoid losses.',
  'Développez': 'Grow',
  'votre commerce.': 'your business.',
  'TrackSmart Retail vous aide à suivre vos produits, leurs dates de péremption et vos stocks en temps réel pour ne plus perdre d\'argent.': 'TrackSmart Retail helps you track products, expiry dates and stock in real time so you stop losing money.',
  'Installation rapide': 'Quick setup',
  'Données sécurisées': 'Secure data',
  'Support réactif': 'Responsive support',
  'de nos clients réduisent leurs pertes produits': 'of our clients reduce product losses',
  'Trop de produits suivis à la main, trop de pertes invisibles.': 'Too many products tracked manually, too many invisible losses.',
  'TrackSmart remplace les carnets, les oublis et les contrôles dispersés par une vue claire de vos DLC, alertes, documents et pertes.': 'TrackSmart replaces notebooks, missed checks and scattered controls with a clear view of your expiry dates, alerts, documents and losses.',
  'Découvrir les offres': 'View plans',
  'Marge protégée': 'Protected margin',
  'Repérez les produits à risque avant qu’ils ne deviennent une perte.': 'Spot at-risk products before they become a loss.',
  'Alertes utiles': 'Useful alerts',
  'Les DLC importantes remontent au bon moment, sans vérification permanente.': 'Important expiry dates surface at the right time, without constant checking.',
  'Ajout rapide': 'Quick add',
  'Scannez, complétez, suivez : moins de saisie, plus de fiabilité.': 'Scan, complete, track: less data entry, more reliability.',
  'Tout centralisé': 'Everything centralized',
  'Stock, analyses, PDF et documents restent au même endroit.': 'Stock, analytics, PDFs and documents stay in one place.',
  'Comment ça fonctionne': 'How it works',
  'Un processus simple pour reprendre le contrôle de vos pertes.': 'A simple process to regain control of your losses.',
  'Scanner': 'Scan',
  'Ajoutez un produit en quelques secondes.': 'Add a product in seconds.',
  'Planifier': 'Plan',
  'Gardez les dates importantes visibles.': 'Keep important dates visible.',
  'Agir': 'Act',
  'Traitez les alertes avant expiration.': 'Handle alerts before expiry.',
  'Optimiser': 'Optimize',
  'Mesurez les pertes évitées et progressez.': 'Measure avoided losses and improve.',
  'Les fonctionnalités': 'Features',
  'Tout ce qu\'il vous faut pour mieux gérer votre magasin': 'Everything you need to manage your store better',
  'Vue stock': 'Stock view',
  'Toutes les priorités du magasin visibles en un coup d’œil.': 'All store priorities visible at a glance.',
  'Scan rapide': 'Fast scan',
  'Moins de saisie, plus de précision au quotidien.': 'Less typing, more accuracy every day.',
  'Pilotage': 'Management',
  'Repérez les rayons sensibles et les tendances de pertes.': 'Identify sensitive sections and loss trends.',
  'PDF prêts': 'Ready PDFs',
  'Des rapports propres pour les suivis et la comptabilité.': 'Clean reports for follow-up and accounting.',
  'Factures et bons de livraison gardés au bon endroit.': 'Invoices and delivery notes kept in the right place.',
  'Multi-écran': 'Multi-device',
  'Une utilisation fluide sur mobile, tablette et ordinateur.': 'Smooth use on mobile, tablet and desktop.',
  'Intéressé(e) par TrackSmart Retail ?': 'Interested in TrackSmart Retail?',
  'Vous souhaitez plus d\'informations sur nos tarifs ou devenir client chez nous ?': 'Would you like more information about our prices or to become a customer?',
  'Contactez-nous directement, nous serons ravis d\'échanger avec vous.': 'Contact us directly — we’ll be happy to talk with you.',
  'Voir les offres': 'View plans',
  'Par téléphone': 'By phone',
  'Par email': 'By email',
  'Disponible 7j/7 · Réponse sous 24h': 'Available 7 days a week · Reply within 24h',
  'Mentions légales': 'Legal notice',
  'Politique de confidentialité': 'Privacy policy',
  'Conditions d\'utilisation': 'Terms of use',
  'Powered by TrackSmart Retail': 'Powered by TrackSmart Retail',
  'Mon profil': 'My profile',
  'Gestion des commandes': 'Order management',
  'Produits à commander': 'Products to order',
  'Coordonnées fournisseur': 'Supplier details',
  'Récapitulatif': 'Summary',
  'Documents': 'Documents',
  'Activité récente': 'Recent activity',
  'Gestion équipe': 'Team management'
};

const reverseUiTextTranslations = Object.fromEntries(Object.entries(uiTextTranslations).map(([fr, en]) => [en, fr]));

function translateUiText(value, lang) {
  if (typeof value !== 'string') return value;
  const trimmed = value.trim();
  if (!trimmed) return value;
  const translated = lang === 'en' ? uiTextTranslations[trimmed] : reverseUiTextTranslations[trimmed];
  if (!translated) return value;
  const prefix = value.match(/^\s*/)?.[0] || '';
  const suffix = value.match(/\s*$/)?.[0] || '';
  return `${prefix}${translated}${suffix}`;
}

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('tracksmart_lang') || 'fr');

  useEffect(() => {
    localStorage.setItem('tracksmart_lang', lang);
  }, [lang]);

  useEffect(() => {
    const root = document.getElementById('root');
    if (!root) return;

    const applyTranslations = () => {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const textNodes = [];
      while (walker.nextNode()) textNodes.push(walker.currentNode);
      textNodes.forEach((node) => {
        const nextValue = translateUiText(node.nodeValue, lang);
        if (nextValue !== node.nodeValue) node.nodeValue = nextValue;
      });

      root.querySelectorAll('[placeholder], [title], [aria-label]').forEach((element) => {
        ['placeholder', 'title', 'aria-label'].forEach((attribute) => {
          if (!element.hasAttribute(attribute)) return;
          const current = element.getAttribute(attribute);
          const nextValue = translateUiText(current, lang);
          if (nextValue !== current) element.setAttribute(attribute, nextValue);
        });
      });
    };

    let frame = null;
    const schedule = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = null;
        applyTranslations();
      });
    };

    applyTranslations();
    const observer = new MutationObserver(schedule);
    observer.observe(root, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ['placeholder', 'title', 'aria-label']
    });

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
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