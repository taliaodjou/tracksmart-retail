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
    <div className="min-h-screen bg-[#080806] text-[#f7f0df]">
      <header className="border-b border-[#c9972b]/20 bg-[#070706]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/consumer" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-[#d29a22] text-[#080806] flex items-center justify-center font-black">TS</div>
            <div className="leading-tight">
              <span className="font-black text-lg block">TRACKSMART</span>
              <span className="text-[#d29a22] text-xs font-bold tracking-wide">RETAIL</span>
            </div>
          </Link>
          <span className="text-xs font-semibold text-[#d29a22] border border-[#d29a22]/40 px-3 py-1 rounded-full">Plateforme client</span>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <section className="grid lg:grid-cols-[1.15fr_.85fr] gap-6 items-stretch">
          <div className="rounded-3xl border border-[#d29a22]/25 bg-[#11100d] p-6 sm:p-8 shadow-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#d29a22] mb-3">Achats malins, zéro gaspillage</p>
            <h1 className="text-3xl sm:text-5xl font-black leading-tight mb-4">{title}{suffix}</h1>
            <p className="text-[#d9cfb9] max-w-2xl">{descriptions[section]}</p>
          </div>
          <div className="rounded-3xl border border-[#d29a22]/25 bg-gradient-to-br from-[#d29a22] to-[#8d640f] p-5 text-[#080806] shadow-2xl">
            <div className="bg-[#080806] rounded-[2rem] p-4 min-h-72 text-[#f7f0df] border border-[#f0c15a]/30">
              <div className="flex justify-between text-xs text-[#d29a22] mb-6"><span>9:41</span><span>TSR</span></div>
              <p className="text-sm text-[#d9cfb9] mb-2">Réservation confirmée</p>
              <div className="text-4xl font-black text-[#d29a22] mb-4">7X2M9</div>
              <div className="space-y-2 text-sm text-[#d9cfb9]"><p>Produits à prix réduits</p><p>Retrait en boutique</p><p>Bon pour la planète</p></div>
            </div>
          </div>
        </section>
        <nav className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {navItems.map(({ to, label, icon: Icon }) => (
            <Link key={to} to={to} className="flex items-center justify-center gap-2 px-3 py-3 rounded-2xl bg-[#11100d] border border-[#d29a22]/20 text-sm text-[#f7f0df] hover:border-[#d29a22] hover:text-[#d29a22]">
              <Icon className="w-4 h-4" />{label}
            </Link>
          ))}
        </nav>
      </main>
    </div>
  );
}