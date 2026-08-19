import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { Store, Search, Tag, ShoppingCart, Heart, User, PackageCheck } from 'lucide-react';

const navItems = [
  { to: '/consumer/explore', label: 'Explorer', icon: Search },
  { to: '/consumer/stores', label: 'Boutiques', icon: Store },
  { to: '/consumer/offers', label: 'Offres', icon: Tag },
  { to: '/consumer/cart', label: 'Panier', icon: ShoppingCart },
  { to: '/consumer/orders', label: 'Réservations', icon: PackageCheck },
  { to: '/consumer/favorites', label: 'Favoris', icon: Heart },
  { to: '/consumer/profile', label: 'Profil', icon: User },
];

const descriptions = {
  home: 'Point d’entrée consumer pour la future marketplace TrackSmart Retail.',
  explore: 'Recherche, proximité, catégories et filtres seront branchés ici plus tard.',
  stores: 'Liste des boutiques visibles sur la marketplace, basée sur les profils boutiques existants.',
  storeDetail: 'Détail boutique connecté à la boutique existante et à ses futures offres publiées.',
  offers: 'Catalogue des offres explicitement publiées par les boutiques.',
  offerDetail: 'Détail d’une offre qui référence un produit TrackSmart existant.',
  cart: 'Structure réservée au futur panier et aux réservations, sans paiement pour cette phase.',
  orders: 'Structure réservée au suivi des futures réservations et codes de retrait.',
  favorites: 'Structure réservée aux boutiques et produits favoris.',
  profile: 'Profil consumer séparé de l’Espace Boutique.',
};

export default function ConsumerPage({ section = 'home', title = 'TrackSmart Consumer' }) {
  const params = useParams();
  const suffix = params.id ? ` #${params.id}` : '';

  return (
    <div className="min-h-screen bg-[#f5f3ef] text-foreground">
      <header className="bg-white border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/consumer" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center"><span className="text-primary-foreground font-bold text-sm">TS</span></div>
            <span className="font-bold text-lg">TrackSmart Retail</span>
          </Link>
          <span className="text-xs font-medium text-muted-foreground bg-secondary px-3 py-1 rounded-full">Espace Consumer</span>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <nav className="flex gap-2 overflow-x-auto pb-1">
          {navItems.map(({ to, label, icon: Icon }) => <Link key={to} to={to} className="flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-border/50 text-sm whitespace-nowrap hover:border-primary/50"><Icon className="w-4 h-4" />{label}</Link>)}
        </nav>
        <section className="bg-white rounded-2xl border border-border/40 shadow-sm p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-3">Fondation marketplace</p>
          <h1 className="text-2xl sm:text-3xl font-bold mb-3">{title}{suffix}</h1>
          <p className="text-muted-foreground max-w-2xl">{descriptions[section]}</p>
        </section>
      </main>
    </div>
  );
}