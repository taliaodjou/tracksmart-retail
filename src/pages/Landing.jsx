import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { AlertTriangle, TrendingDown, BarChart3, ArrowRight, ChevronRight, Clock } from 'lucide-react';

const stats = [
  { value: '30%', label: 'de pertes évitées en moyenne' },
  { value: '200+', label: 'commerces nous font confiance' },
  { value: '50 000+', label: 'produits suivis chaque mois' },
];

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
};

export default function Landing() {
  const { isAuthenticated, isLoadingAuth } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-foreground">
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-neutral-100"
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white text-sm font-bold">TS</span>
            </div>
            TrackSmart
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:inline">
              Connexion
            </Link>
            <Link to="/register">
              <Button size="sm">Essai gratuit</Button>
            </Link>
          </div>
        </div>
      </motion.header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Animated background blobs */}
        <motion.div
          animate={{ scale: [1, 1.08, 1], opacity: [0.06, 0.09, 0.06] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-20 right-0 w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, #C9A646 0%, transparent 70%)' }}
        />
        <motion.div
          animate={{ scale: [1, 1.05, 1], opacity: [0.04, 0.07, 0.04] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute -bottom-20 left-0 w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, #C9A646 0%, transparent 70%)' }}
        />
        <div className="max-w-6xl mx-auto px-6 py-24 sm:py-32 lg:py-40 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-sm font-semibold text-primary tracking-wide uppercase mb-4"
            >
              Gestion d'inventaire
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.08] mb-6"
            >
              Chaque produit jeté<br />
              <span className="text-primary">est de l'argent perdu.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg"
            >
              Les dates de péremption sont la première cause de perte en magasin. TrackSmart vous alerte à temps pour ne plus jamais jeter un produit par oubli.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="flex flex-col sm:flex-row items-start gap-3"
            >
              <Link to="/register">
                <Button size="lg" className="text-base px-8 h-12 rounded-xl">
                  Commencer gratuitement
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="ghost" size="lg" className="text-base h-12 rounded-xl">
                  J'ai déjà un compte
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Floating product card graphic — subtle app preview */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="hidden lg:block absolute right-[8%] top-1/2 -translate-y-1/2 z-10"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            className="w-72 bg-white rounded-2xl shadow-xl border border-neutral-100 p-5"
          >
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground mb-4">
              <Clock className="w-3.5 h-3.5 text-primary" />
              Produits à surveiller
            </div>
            {[
              { name: 'Yaourt nature x24', days: -2, color: 'bg-red-100 text-red-700' },
              { name: 'Jambon de dinde', days: 1, color: 'bg-orange-100 text-orange-700' },
              { name: 'Lait entier 1L', days: 5, color: 'bg-yellow-100 text-yellow-700' },
              { name: 'Fromage râpé', days: 10, color: 'bg-green-100 text-green-700' },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-neutral-50 mb-1.5 last:mb-0">
                <span className="text-xs font-medium">{item.name}</span>
                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${item.color}`}>
                  {item.days < 0 ? 'EXP' : `J-${item.days}`}
                </span>
              </div>
            ))}
            <div className="mt-3 pt-3 border-t border-neutral-100 text-[10px] text-muted-foreground text-center">
              + 47 autres produits suivis
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="border-y border-neutral-100">
        <div className="max-w-6xl mx-auto px-6 py-10">
          <div className="grid grid-cols-3 gap-8">
            {stats.map((s, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="text-center"
              >
                <div className="text-3xl sm:text-4xl font-extrabold text-primary mb-1">{s.value}</div>
                <div className="text-sm text-muted-foreground">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3 Features — in boxes */}
      <section className="py-20 sm:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            {...fadeUp}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-3 tracking-tight">
              Arrêtez de perdre,<br />
              <span className="text-primary">commencez à suivre</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Trois outils pour reprendre le contrôle de vos stocks.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                icon: AlertTriangle,
                title: 'Alertes avant expiration',
                desc: 'Notifications à J-14, J-7 et J-3 pour chaque produit. Vous agissez avant qu’il ne soit trop tard.',
                accent: 'bg-amber-50 border-amber-100',
                iconBg: 'bg-amber-100',
                iconColor: 'text-amber-600',
              },
              {
                icon: TrendingDown,
                title: 'Pertes chiffrées en CHF',
                desc: 'Visualisez exactement ce que vous jetez, par catégorie et par rayon, pour cibler vos efforts.',
                accent: 'bg-red-50 border-red-100',
                iconBg: 'bg-red-100',
                iconColor: 'text-red-600',
              },
              {
                icon: BarChart3,
                title: 'Rapports automatiques',
                desc: 'Un bilan trimestriel complet avec analyses et recommandations, envoyé directement par email.',
                accent: 'bg-blue-50 border-blue-100',
                iconBg: 'bg-blue-100',
                iconColor: 'text-blue-600',
              },
            ].map((f, i) => (
              <motion.div
                key={i}
                {...fadeUp}
                transition={{ duration: 0.4, delay: i * 0.12 }}
                whileHover={{ y: -4 }}
                className={`group p-6 rounded-2xl border ${f.accent} hover:shadow-lg transition-all duration-300`}
              >
                <div className={`w-12 h-12 rounded-xl ${f.iconBg} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                  <f.icon className={`w-6 h-6 ${f.iconColor}`} />
                </div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #C9A646 0%, #b08a2e 100%)' }}>
        <motion.div
          animate={{ scale: [1, 1.06, 1], opacity: [0.15, 0.22, 0.15] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle at 50% 50%, white 0%, transparent 60%)' }}
        />
        <div className="max-w-6xl mx-auto px-6 text-center relative z-10">
          <motion.div {...fadeUp} transition={{ duration: 0.5 }}>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3 tracking-tight">
              Prêt à réduire vos pertes ?
            </h2>
            <p className="text-white/75 text-lg mb-8">
              Essayez gratuitement, sans engagement.
            </p>
            <Link to="/register">
              <Button size="lg" variant="secondary" className="text-base px-8 h-12 rounded-xl font-semibold">
                Créer mon compte
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-neutral-100">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <span className="text-white text-xs font-bold">TS</span>
            </div>
            <span className="font-semibold text-sm">TrackSmart Retail</span>
          </div>
          <div className="flex items-center gap-5 text-sm text-muted-foreground">
            <Link to="/about" className="hover:text-foreground transition-colors">À propos</Link>
            <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
          <span className="text-xs text-muted-foreground">© {new Date().getFullYear()} TNO Studio</span>
        </div>
      </footer>
    </div>
  );
}