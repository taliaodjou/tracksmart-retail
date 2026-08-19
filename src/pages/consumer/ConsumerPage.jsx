import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Store, Search, Tag, ShoppingCart, Heart, User, PackageCheck, Clock } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const navItems = [
  { to: '/consumer/explore', label: 'Explorer', icon: Search },
  { to: '/consumer/stores', label: 'Boutiques', icon: Store },
  { to: '/consumer/offers', label: 'Offres', icon: Tag },
  { to: '/consumer/cart', label: 'Panier', icon: ShoppingCart },
  { to: '/consumer/orders', label: 'Réservations', icon: PackageCheck },
  { to: '/consumer/favorites', label: 'Favoris', icon: Heart },
  { to: '/consumer/profile', label: 'Profil', icon: User },
];

const formatPrice = (value) => Number(value || 0) > 0 ? `${Number(value).toFixed(2)} CHF` : 'Prix à définir';
const formatDate = (date) => date ? new Date(date).toLocaleDateString('fr-CH') : 'DLC à confirmer';

function OfferCard({ offer }) {
  return (
    <article className="bg-white rounded-2xl border border-border/40 shadow-sm overflow-hidden">
      <div className="h-32 bg-secondary flex items-center justify-center">
        {offer.productImageUrl ? <img src={offer.productImageUrl} alt={offer.title} className="w-full h-full object-cover" /> : <Tag className="w-8 h-8 text-primary" />}
      </div>
      <div className="p-4 space-y-3">
        <div>
          <p className="text-xs text-muted-foreground">{offer.storeName || 'Boutique'}</p>
          <h3 className="font-semibold text-base leading-tight">{offer.title}</h3>
        </div>
        <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 rounded-full px-3 py-1 w-fit">
          <Clock className="w-3.5 h-3.5" /> DLC {formatDate(offer.expirationDate || offer.endDate)}
        </div>
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground line-through">{formatPrice(offer.regularPrice)}</p>
            <p className="text-lg font-bold text-primary">{formatPrice(offer.discountedPrice)}</p>
          </div>
          <p className="text-xs text-muted-foreground">{offer.quantityAvailable || 0} dispo.</p>
        </div>
      </div>
    </article>
  );
}

export default function ConsumerPage({ section = 'home', title = 'TrackSmart Consumer' }) {
  const params = useParams();
  const [offers, setOffers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const selectedStoreId = params.id ? decodeURIComponent(params.id) : null;

  useEffect(() => {
    let active = true;
    const loadOffers = async () => {
      setIsLoading(true);
      const data = await base44.entities.Offer.filter({ isPublished: true, status: 'active' }, 'endDate', 100);
      if (active) {
        setOffers(data || []);
        setIsLoading(false);
      }
    };
    loadOffers();
    return () => { active = false; };
  }, []);

  const groupedStores = useMemo(() => {
    const map = new Map();
    offers.forEach((offer) => {
      const id = offer.storeId || offer.store_owner_email || 'boutique-test';
      if (!map.has(id)) map.set(id, { id, name: offer.storeName || 'Boutique test', offers: [] });
      map.get(id).offers.push(offer);
    });
    return Array.from(map.values());
  }, [offers]);

  const visibleOffers = selectedStoreId ? offers.filter((offer) => (offer.storeId || offer.store_owner_email || 'boutique-test') === selectedStoreId) : offers;
  const selectedStore = groupedStores.find((store) => store.id === selectedStoreId);
  const pageTitle = selectedStore ? selectedStore.name : title;

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
          <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-3">Marketplace anti-gaspillage</p>
          <h1 className="text-2xl sm:text-3xl font-bold mb-3">{pageTitle}</h1>
          <p className="text-muted-foreground max-w-2xl">Les clients voient ici les produits bientôt expirés que la boutique publie en offre.</p>
        </section>

        {isLoading ? <div className="bg-white rounded-2xl border border-border/40 p-8 text-center text-muted-foreground">Chargement des offres...</div> : null}

        {!isLoading && section === 'stores' ? (
          <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {groupedStores.map((store) => <Link key={store.id} to={`/consumer/stores/${encodeURIComponent(store.id)}`} className="bg-white rounded-2xl border border-border/40 shadow-sm p-5 hover:border-primary/50 transition-colors"><Store className="w-8 h-8 text-primary mb-4" /><h3 className="font-semibold text-lg">{store.name}</h3><p className="text-sm text-muted-foreground">{store.offers.length} offre(s) bientôt expirée(s)</p></Link>)}
          </section>
        ) : null}

        {!isLoading && section !== 'stores' ? (
          visibleOffers.length > 0 ? <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">{visibleOffers.map((offer) => <OfferCard key={offer.id} offer={offer} />)}</section> : <div className="bg-white rounded-2xl border border-border/40 p-8 text-center text-muted-foreground">Aucune offre publiée pour le moment.</div>
        ) : null}
      </main>
    </div>
  );
}