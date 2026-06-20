import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  Clock, Shield, Boxes, AlertTriangle, TrendingDown,
  ShoppingCart, Users, BarChart3, PackageCheck, ArrowRight, ChevronRight
} from 'lucide-react';

const features = [
  {
    icon: Boxes,
    title: 'Gestion des stocks',
    description: 'Suivez chaque produit, du rayon au congélateur, avec une visibilité complète sur votre inventaire.',
  },
  {
    icon: AlertTriangle,
    title: 'Alertes DLC intelligentes',
    description: 'Recevez des notifications 14, 7 et 3 jours avant expiration. Ne jetez plus jamais de produits par oubli.',
  },
  {
    icon: TrendingDown,
    title: 'Suivi des pertes',
    description: 'Quantifiez vos pertes en CHF et identifiez les catégories et rayons les plus problématiques.',
  },
  {
    icon: BarChart3,
    title: 'Rapports trimestriels',
    description: 'Recevez automatiquement des rapports détaillés avec analyses et recommandations personnalisées.',
  },
  {
    icon: ShoppingCart,
    title: 'Gestion des commandes',
    description: 'Passez et suivez vos commandes fournisseurs directement depuis la plateforme.',
  },
  {
    icon: Users,
    title: 'Travail en équipe',
    description: 'Invitez vos employés et managers. Chacun voit ce dont il a besoin, selon son rôle.',
  },
];

const benefits = [
  { icon: PackageCheck, text: 'Réduisez vos pertes alimentaires jusqu\'à 30%' },
  { icon: Clock, text: 'Gagnez des heures chaque semaine sur la gestion des dates' },
  { icon: Shield, text: 'Restez en conformité avec les normes d\'hygiène et de sécurité' },
  { icon: TrendingDown, text: 'Économisez sur vos commandes grâce à une meilleure visibilité' },
];

export default function Landing() {
  const { isAuthenticated, isLoadingAuth } = useAuth();

  // Show spinner while auth is loading
  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#fafaf8' }}>
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // If user is already authenticated, redirect immediately (no flash)
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#fafaf8', color: '#1a1a1a' }}>
      {/* ─── Header ─── */}
      <header className="sticky top-0 z-50 border-b border-border/40" style={{ backgroundColor: 'rgba(250,250,248,0.92)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-lg tracking-tight">TrackSmart</span>
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground hidden sm:inline">Déjà client ?</span>
              <Link to="/login">
                <Button variant="outline" size="sm">Connexion</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Essai gratuit</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-[5%] w-72 h-72 rounded-full" style={{ background: 'radial-gradient(circle, #C9A64618 0%, transparent 70%)' }} />
          <div className="absolute top-20 right-[10%] w-96 h-96 rounded-full" style={{ background: 'radial-gradient(circle, #C9A64612 0%, transparent 70%)' }} />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-36 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8">
              <SparklesIcon className="w-4 h-4" />
              La gestion d'inventaire intelligente pour les commerces
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight mb-6">
              Ne perdez plus un seul produit
              <span className="block text-primary">à cause d'une date oubliée</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-10 max-w-2xl mx-auto">
              TrackSmart Retail vous alerte avant chaque expiration, suit vos pertes en temps réel et vous aide à optimiser vos stocks — pour que chaque produit compte.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="text-base px-8 py-6 h-auto rounded-xl shadow-lg hover:shadow-xl transition-shadow">
                  Commencer gratuitement
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="text-base px-8 py-6 h-auto rounded-xl">
                  J'ai déjà un compte
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── Features ─── */}
      <section className="py-20 sm:py-28" style={{ backgroundColor: '#ffffff' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4">Tout ce dont vous avez besoin</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Une plateforme complète pour gérer vos produits, vos dates et votre équipe — sans prise de tête.
            </p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="group p-6 rounded-2xl border border-border/60 bg-card hover:shadow-lg hover:border-primary/20 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 transition-colors">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Benefits ─── */}
      <section className="py-20 sm:py-28" style={{ backgroundColor: '#fafaf8' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl sm:text-4xl font-extrabold mb-6">
                Conçu pour les{' '}
                <span className="text-primary">commerçants</span> comme vous
              </h2>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                Que vous gériez une supérette, un magasin de proximité ou une chaîne de commerces, TrackSmart Retail s'adapte à votre taille et à vos besoins.
              </p>
              <ul className="space-y-4">
                {benefits.map((b, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <b.icon className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-foreground font-medium">{b.text}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="aspect-[4/3] rounded-2xl bg-card border border-border/60 p-6 flex flex-col gap-4 shadow-lg">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Clock className="w-4 h-4 text-primary" />
                  Produits à surveiller cette semaine
                </div>
                {[
                  { name: 'Yaourt nature x24', days: -2, status: 'Expiré' },
                  { name: 'Jambon de dinde', days: 1, status: 'Urgent' },
                  { name: 'Lait entier 1L', days: 5, status: 'Bientôt' },
                  { name: 'Fromage râpé', days: 10, status: 'À surveiller' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-secondary/40">
                    <span className="text-sm font-medium">{item.name}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      item.days < 0 ? 'bg-red-100 text-red-700' :
                      item.days < 3 ? 'bg-orange-100 text-orange-700' :
                      item.days < 7 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {item.days < 0 ? 'EXP' : `J-${item.days}`}
                    </span>
                  </div>
                ))}
                <div className="mt-auto pt-2 border-t border-border/40 text-xs text-muted-foreground text-center">
                  Et des dizaines d'autres produits suivis automatiquement
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── CTA Banner ─── */}
      <section className="py-16 sm:py-20" style={{ background: 'linear-gradient(135deg, #C9A646 0%, #b8923a 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">
              Prêt à réduire vos pertes ?
            </h2>
            <p className="text-white/80 text-lg mb-8 max-w-lg mx-auto">
              Commencez gratuitement et découvrez combien vous pouvez économiser.
            </p>
            <Link to="/register">
              <Button
                size="lg"
                variant="secondary"
                className="text-base px-8 py-6 h-auto rounded-xl font-bold shadow-lg"
              >
                Créer mon compte gratuit
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── Footer ─── */}
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

// Small sparkles icon inline
function SparklesIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <path d="M8 0l1.5 4.5L14 3l-3 3.5L15 10l-4.5-1L10 14l-2-4-4 2 2-4L0 6l4.5-.5L8 0z" />
    </svg>
  );
}