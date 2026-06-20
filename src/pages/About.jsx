import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function About() {
  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#fafaf8', color: '#1a1a1a' }}>
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border/40" style={{ backgroundColor: 'rgba(250,250,248,0.92)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight">TrackSmart</span>
            </Link>
            <Link to="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Retour à l'accueil
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-8">
            À propos de <span className="text-primary">TrackSmart Retail</span>
          </h1>

          <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
            <p>
              TrackSmart Retail est une plateforme de gestion d'inventaire conçue spécifiquement pour les commerces de proximité, les supérettes, les épiceries et les magasins d'alimentation. Notre mission est simple : aider les commerçants à réduire le gaspillage alimentaire en leur donnant une visibilité totale sur les dates de péremption de leurs produits.
            </p>

            <p>
              Chaque année, des tonnes de produits alimentaires sont jetées parce qu'une date limite est passée inaperçue. TrackSmart Retail résout ce problème en suivant chaque produit du rayon au congélateur, et en envoyant des alertes intelligentes 14, 7 et 3 jours avant expiration. Vous savez exactement ce qui doit être vendu, utilisé ou commandé — sans avoir à parcourir vos rayons manuellement.
            </p>

            <p>
              La plateforme va bien au-delà du simple suivi des dates. Elle offre une gestion complète des commandes fournisseurs, des rapports trimestriels détaillés avec analyse des pertes par catégorie et par rayon, un suivi financier en CHF des produits jetés, et un espace collaboratif pour votre équipe. Chaque employé voit ce dont il a besoin selon son rôle, et les propriétaires gardent une vue d'ensemble sur la performance du magasin.
            </p>

            <p>
              TrackSmart Retail est développé par <strong>TNO Studio</strong>, une entreprise spécialisée dans les solutions numériques pour les commerces et les indépendants. Nous croyons que la technologie doit être simple, utile et accessible. C'est pourquoi nous avons conçu TrackSmart pour qu'il soit utilisable dès la première connexion, sans formation complexe ni matériel coûteux.
            </p>

            <p>
              Notre équipe travaille en étroite collaboration avec des commerçants pour améliorer continuellement la plateforme. Chaque fonctionnalité est pensée pour répondre à un besoin réel du terrain : scan de codes-barres pour ajouter des produits en un clin d'œil, import Excel pour les gros inventaires, notifications par email pour ne jamais rien oublier, et tableaux de bord visuels pour piloter votre activité en un coup d'œil.
            </p>

            <p>
              Que vous gériez une petite épicerie de quartier ou une chaîne de plusieurs magasins, TrackSmart Retail s'adapte à votre taille et à vos besoins. Rejoignez les centaines de commerçants qui ont déjà réduit leurs pertes de plus de 30 % grâce à une meilleure gestion de leurs dates.
            </p>
          </div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-border/40" style={{ backgroundColor: '#1a1a1a', color: '#9ca3af' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-white">TrackSmart Retail</span>
            </div>
            <div className="flex items-center gap-6 text-sm">
              <Link to="/about" className="hover:text-white transition-colors">À propos</Link>
              <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
              <a href="mailto:support@tracksmart.com" className="hover:text-white transition-colors">Support</a>
            </div>
            <span className="text-xs">© {new Date().getFullYear()} TNO Studio. Tous droits réservés.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}