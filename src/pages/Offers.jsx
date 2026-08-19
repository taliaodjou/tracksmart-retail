import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Check, Store, UserCog, HelpCircle, Mail, Phone } from 'lucide-react';

const setupPlans = [
  { name: 'Petit magasin', desc: 'Configuration accompagnée pour une petite structure.', price: 'Sur devis', detail: 'Forfait selon la taille du magasin' },
  { name: 'Magasin moyen', desc: 'Mise en place adaptée à un volume de produits plus important.', price: 'Sur devis', detail: 'Forfait selon la taille du magasin' },
  { name: 'Grand magasin', desc: 'Accompagnement complet pour plusieurs rayons, frigos ou zones.', price: 'Sur devis', detail: 'Forfait selon la taille du magasin' },
];

const faq = [
  { q: 'À qui s’adresse TrackSmart Retail ?', a: 'Aux commerces qui suivent des produits avec dates limites, comme les épiceries, shops, magasins alimentaires, frigos, congélateurs ou points de vente de proximité.' },
  { q: 'Est-ce que je peux scanner les produits ?', a: 'Oui. L’application permet d’ajouter plus rapidement des produits grâce au scan code-barres, puis de compléter les informations utiles comme la DLC, le rayon et le prix.' },
  { q: 'Comment fonctionnent les alertes DLC ?', a: 'Les produits proches de leur date limite sont mis en avant pour vous aider à agir avant expiration et réduire les pertes.' },
  { q: 'Puis-je suivre mes pertes ?', a: 'Oui. Les produits jetés peuvent être suivis avec quantité et prix afin d’obtenir une vision claire des pertes en CHF.' },
  { q: 'Est-ce que je peux générer des rapports ?', a: 'Oui. TrackSmart Retail permet de produire des rapports et analyses utiles pour le suivi interne, la gestion et la comptabilité.' },
  { q: 'Dois-je faire l’installation moi-même ?', a: 'Vous pouvez choisir un accompagnement personnalisé ou effectuer le setup vous-même avec l’offre Classic.' },
];

export default function Offers() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50/60 via-white to-white text-foreground">
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-[72px] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-base sm:text-lg">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white text-xs font-bold">TS</span>
            </div>
            <span>TrackSmart Retail</span>
          </Link>
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Retour
          </Link>
        </div>
      </header>

      <main>
        <section className="py-16 sm:py-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
            <p className="text-sm font-semibold text-primary uppercase tracking-wide mb-3">Les offres</p>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-5">
              Choisissez le niveau de setup adapté à votre magasin.
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Vous pouvez être accompagné pour la mise en place complète de TrackSmart Retail, ou configurer l’application vous-même avec un forfait unique.
            </p>
          </div>
        </section>

        <section className="pb-16 sm:pb-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-[1.15fr_0.85fr] gap-6">
            <div className="rounded-3xl bg-white border border-neutral-100 shadow-sm p-6 sm:p-8">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                <UserCog className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-extrabold mb-3">Setup accompagné</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Nous pouvons préparer votre espace, structurer vos rayons, vous aider à importer vos premiers produits et adapter le setup à la taille de votre magasin.
              </p>
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                {setupPlans.map((plan) => (
                  <div key={plan.name} className="rounded-2xl bg-orange-50/60 border border-orange-100 p-4">
                    <h3 className="font-bold mb-2">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{plan.desc}</p>
                    <p className="font-extrabold text-primary">{plan.price}</p>
                    <p className="text-xs text-muted-foreground">{plan.detail}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl bg-neutral-50 border border-neutral-100 p-4 flex items-start gap-3">
                <Check className="w-5 h-5 text-green-500 mt-0.5" />
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Les heures d’accompagnement supplémentaires sont facturées à <span className="font-bold text-foreground">25 CHF / heure</span>.
                </p>
              </div>
            </div>

            <div className="rounded-3xl bg-foreground text-primary-foreground shadow-xl p-6 sm:p-8 flex flex-col">
              <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center mb-5">
                <Store className="w-6 h-6 text-white" />
              </div>
              <p className="text-sm uppercase tracking-wide text-primary font-bold mb-2">Setup autonome</p>
              <h2 className="text-3xl font-extrabold mb-2">Classic</h2>
              <div className="flex items-end gap-2 mb-5">
                <span className="text-5xl font-extrabold">250</span>
                <span className="text-lg mb-1 opacity-80">CHF</span>
              </div>
              <p className="opacity-80 leading-relaxed mb-6">
                Un forfait unique pour les personnes qui souhaitent configurer elles-mêmes leur espace TrackSmart Retail.
              </p>
              <div className="space-y-3 mb-8 flex-1">
                {['Accès à l’application', 'Configuration personnelle', 'Suivi DLC et alertes', 'Dashboard, analytics et rapports'].map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-primary" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
              <Link to="/contact">
                <Button className="w-full rounded-xl h-11 font-semibold">Demander cette offre</Button>
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 sm:py-24 bg-neutral-50" id="faq">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold mb-3">FAQ</h2>
              <p className="text-muted-foreground">Réponses aux questions fréquentes sur l’utilisation de l’application.</p>
            </div>
            <div className="space-y-3">
              {faq.map((item) => (
                <div key={item.q} className="rounded-2xl bg-white border border-neutral-100 p-5">
                  <h3 className="font-bold mb-2">{item.q}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-14 bg-gradient-to-br from-orange-50 via-amber-50/60 to-orange-100/40">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">Vous souhaitez en discuter ?</h2>
            <p className="text-muted-foreground mb-6">Contactez-nous pour choisir l’offre la plus adaptée à votre magasin.</p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <a href="tel:+41772229764" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white border border-orange-200 px-5 py-3 font-bold">
                <Phone className="w-4 h-4 text-primary" /> +41 77 222 97 64
              </a>
              <a href="mailto:contact@tracksmart.ch" className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white border border-orange-200 px-5 py-3 font-bold">
                <Mail className="w-4 h-4 text-primary" /> contact@tracksmart.ch
              </a>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 border-t border-neutral-100 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="font-semibold text-sm">TrackSmart Retail</span>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-muted-foreground">
            <Link to="/contact" className="hover:text-foreground">Contact</Link>
            <Link to="/mentions-legales" className="hover:text-foreground">Mentions légales</Link>
            <Link to="/politique-confidentialite" className="hover:text-foreground">Politique de confidentialité</Link>
          </div>
          <span className="text-xs text-muted-foreground">© {new Date().getFullYear()} TNO Studio</span>
        </div>
      </footer>
    </div>
  );
}