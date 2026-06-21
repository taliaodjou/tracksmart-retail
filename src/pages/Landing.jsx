import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  ArrowRight, Play, Check, Lock, Phone, Search, Clock, Mail,
  Boxes, AlertTriangle, Barcode, BarChart3, Smartphone,
  LayoutDashboard, Package, ChevronDown
} from 'lucide-react';

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
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 sm:h-[72px] flex items-center justify-between">
          <div className="flex items-center gap-6 sm:gap-10">
            <Link to="/" className="flex items-center gap-2 sm:gap-2.5 font-bold text-base sm:text-lg">
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                <span className="text-white text-[11px] sm:text-sm font-bold">TS</span>
              </div>
              <span className="hidden xs:inline">TrackSmart Retail</span>
            </Link>
            <nav className="hidden lg:flex items-center gap-7 text-sm text-muted-foreground">
              <a href="#features" className="hover:text-foreground transition-colors">Fonctionnalités</a>
              <span className="text-neutral-200">Pour qui ?</span>
              <span className="text-neutral-200">Tarifs</span>
              <span className="text-neutral-200">Ressources</span>
            </nav>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link to="/login" className="text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors">
              Connexion
            </Link>
            <Link to="/register">
              <Button size="sm" className="rounded-lg text-xs sm:text-sm h-8 sm:h-9 px-3 sm:px-4">Créer un compte</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero + 98% — light orange background */}
      <div className="bg-gradient-to-b from-orange-50/60 via-orange-50/30 to-white">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10 pb-12 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-28">
            <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
              {/* Left Column */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <motion.div
                  animate={{ scale: [1, 1.02, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs sm:text-sm font-medium mb-4 sm:mb-6"
                >
                  <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                  LA SOLUTION DES COMMERÇANTS MALINS
                </motion.div>
                <h1 className="text-3xl sm:text-4xl lg:text-[52px] font-bold leading-[1.12] tracking-tight mb-4 sm:mb-6">
                  Gérez vos stocks.<br />
                  Évitez les pertes.<br />
                  <span className="text-primary">Développez</span> votre commerce.
                </h1>
                <p className="text-sm sm:text-lg text-muted-foreground leading-relaxed mb-5 sm:mb-6 max-w-lg">
                  TrackSmart Retail vous aide à suivre vos produits, leurs dates de péremption et vos stocks en temps réel pour ne plus perdre d'argent.
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-3 sm:gap-5 text-xs sm:text-sm mb-5 sm:mb-6">
                  <div className="flex items-center gap-1.5 bg-white rounded-lg px-2.5 py-1.5 shadow-sm border border-neutral-100">
                    <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    <span className="font-medium">Installation rapide</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white rounded-lg px-2.5 py-1.5 shadow-sm border border-neutral-100">
                    <Lock className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    <span className="font-medium">Données sécurisées</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-white rounded-lg px-2.5 py-1.5 shadow-sm border border-neutral-100">
                    <Phone className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
                    <span className="font-medium">Support réactif</span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-start gap-2.5 sm:gap-3 mb-0">
                  <Link to="/demo" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full sm:w-auto text-sm sm:text-base px-5 sm:px-7 h-11 sm:h-12 rounded-xl font-semibold shadow-md">
                      Essayer gratuitement
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1" />
                    </Button>
                  </Link>
                  <a href="#features" className="w-full sm:w-auto">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto text-sm sm:text-base px-5 sm:px-7 h-11 sm:h-12 rounded-xl font-medium">
                      <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 sm:mr-1.5" />
                      Voir comment ça marche
                    </Button>
                  </a>
                </div>
              </motion.div>

              {/* Right Column — Phone Mockup like the reference */}
              <motion.div
                initial={{ opacity: 0, x: 30, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="flex justify-center relative mt-6 lg:mt-0"
              >
                {/* Phone frame */}
                <div className="relative w-[240px] sm:w-[280px] lg:w-[300px]">
                  <div className="bg-white rounded-[2.5rem] shadow-2xl border-[3px] border-neutral-800 overflow-hidden">
                    {/* Notch */}
                    <div className="bg-neutral-800 h-7 flex items-center justify-center">
                      <div className="w-20 h-4 bg-neutral-900 rounded-full" />
                    </div>
                    {/* Status bar */}
                    <div className="bg-white px-5 pt-2 pb-1 flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-neutral-800">9:41</span>
                      <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full border border-neutral-400" />
                        <div className="w-3 h-3 rounded-full border border-neutral-400" />
                        <div className="w-3 h-3 rounded-full border border-neutral-400" />
                      </div>
                    </div>
                    {/* App content */}
                    <div className="px-4 pt-1 pb-5 space-y-3">
                      {/* Header row */}
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-primary flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-[9px] font-bold">TS</span>
                        </div>
                        <p className="text-xs font-bold">Tableau de bord</p>
                      </div>

                      {/* Stats cards */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-2.5">
                          <p className="text-[9px] text-muted-foreground mb-0.5">Produits en stock</p>
                          <p className="text-lg font-bold">1 248</p>
                          <p className="text-[9px] text-green-600 font-medium">+12 ce mois</p>
                        </div>
                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-2.5">
                          <p className="text-[9px] text-muted-foreground mb-0.5">Alertes DLC</p>
                          <p className="text-lg font-bold">23</p>
                          <p className="text-[9px] text-red-500 font-medium">à traiter</p>
                        </div>
                        <div className="bg-green-50 border border-green-100 rounded-xl p-2.5">
                          <p className="text-[9px] text-muted-foreground mb-0.5">Pertes évitées</p>
                          <p className="text-lg font-bold">12 500 CHF</p>
                          <p className="text-[9px] text-green-600 font-medium">ce mois</p>
                        </div>
                        <div className="bg-purple-50 border border-purple-100 rounded-xl p-2.5">
                          <p className="text-[9px] text-muted-foreground mb-0.5">Valeur du stock</p>
                          <p className="text-lg font-bold">85 000 CHF</p>
                          <p className="text-[9px] text-muted-foreground">total</p>
                        </div>
                      </div>

                      {/* Alert section */}
                      <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                        <p className="text-[9px] font-semibold text-red-700 mb-2">⚠️ Proches expiration</p>
                        {[
                          { name: 'Lait Candia 1L', date: '30/06/2026' },
                          { name: 'Yaourt nature x12', date: '02/07/2026' },
                          { name: 'Jambon de dinde', date: '05/07/2026' },
                        ].map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between py-1 border-b border-red-100 last:border-0">
                            <span className="text-[9px]">{item.name}</span>
                            <span className="text-[9px] text-red-600 font-medium">{item.date}</span>
                          </div>
                        ))}
                      </div>

                      {/* Bottom nav bar */}
                      <div className="flex items-center justify-around pt-1 border-t border-neutral-100">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center"><LayoutDashboard className="w-3.5 h-3.5 text-primary" /></div>
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center"><Package className="w-3.5 h-3.5 text-muted-foreground" /></div>
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center"><Search className="w-3.5 h-3.5 text-muted-foreground" /></div>
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center"><BarChart3 className="w-3.5 h-3.5 text-muted-foreground" /></div>
                      </div>
                    </div>
                  </div>

                  {/* Floating evolution card */}
                  <div className="absolute -right-24 top-[55%] -translate-y-1/2 bg-white rounded-xl shadow-lg border border-neutral-200 p-3 w-44 z-10">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] font-semibold">Évolution</p>
                      <ChevronDown className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <div className="h-12 flex items-end gap-[2px] mb-1">
                      {[30, 35, 28, 50, 45, 40, 60, 55, 65, 58, 70, 75, 68, 80, 85, 78, 90, 95].map((h, i) => (
                        <div key={i} className="flex-1 bg-primary/60 rounded-[1px]" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold">12 500 CHF</span>
                      <span className="text-[9px] text-green-600 font-semibold">+18%</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 98% Stat — scroll-triggered animation */}
        <section className="pb-10 sm:pb-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: false, margin: "-100px" }}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center gap-2 sm:gap-3 mb-2 sm:mb-3 bg-white/80 backdrop-blur rounded-2xl px-6 sm:px-10 py-4 sm:py-6 shadow-sm border border-neutral-100">
                <Check className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 flex-shrink-0" />
                <span className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-primary">98%</span>
              </div>
              <p className="text-muted-foreground text-sm sm:text-base md:text-lg mt-2">de nos clients réduisent leurs pertes produits</p>
            </motion.div>
          </div>
        </section>
      </div>

      {/* Features Grid */}
      <section id="features" className="py-14 sm:py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8 sm:mb-10 md:mb-14"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-3 sm:mb-4 tracking-tight">
              Tout ce qu'il vous faut pour mieux gérer votre magasin
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
            {[
              {
                icon: Boxes,
                title: 'Suivi des stocks',
                desc: 'Suivez vos entrées, sorties et quantités disponibles en temps réel.',
              },
              {
                icon: AlertTriangle,
                title: 'Gestion des DLC',
                desc: 'Soyez alerté avant la date de péremption et évitez les pertes.',
              },
              {
                icon: Clock,
                title: 'Gain de temps',
                desc: 'Économisez 3 à 4 heures par semaine par rapport à un checking manuel des dates.',
              },
              {
                icon: Barcode,
                title: 'Scan de produits',
                desc: 'Scannez les codes-barres et gagnez du temps au quotidien.',
              },
              {
                icon: BarChart3,
                title: 'Rapports et analyses',
                desc: 'Prenez de meilleures décisions avec des données claires.',
              },
              {
                icon: Smartphone,
                title: 'Accessible partout',
                desc: 'Utilisez TrackSmart sur mobile, tablette ou ordinateur.',
              },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                className="group p-4 sm:p-5 md:p-6 rounded-2xl border border-neutral-100 hover:border-primary/20 hover:shadow-lg transition-all duration-300 text-center"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:bg-primary/15 transition-colors">
                  <f.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <h3 className="font-bold text-sm sm:text-base mb-1.5 sm:mb-2">{f.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Contact Section — soft orange / light tone */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-orange-50 via-amber-50/60 to-orange-100/40 text-foreground">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold mb-3 tracking-tight text-foreground">
              Intéressé(e) par TrackSmart Retail&nbsp;?
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto mb-2">
              Vous souhaitez plus d'informations sur nos tarifs ou devenir client chez nous&nbsp;?
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Contactez-nous directement, nous serons ravis d'échanger avec vous.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
              <motion.a
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                href="tel:+41772229764"
                className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white border border-orange-200 hover:border-primary hover:shadow-md transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#25D366] flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">Par téléphone</p>
                  <p className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">+41 77 222 97 64</p>
                </div>
              </motion.a>

              <motion.a
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.25 }}
                href="mailto:contact@tracksmart.ch"
                className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white border border-orange-200 hover:border-primary hover:shadow-md transition-all duration-300 group"
              >
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">Par email</p>
                  <p className="text-lg font-bold text-foreground group-hover:text-primary transition-colors">contact@tracksmart.ch</p>
                </div>
              </motion.a>
            </div>

            <p className="text-xs text-muted-foreground mt-8">
              Disponible 7j/7 · Réponse sous 24h
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 sm:py-8 md:py-10 border-t border-neutral-100 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-2.5">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-md bg-primary flex items-center justify-center">
              <span className="text-white text-[10px] sm:text-xs font-bold">TS</span>
            </div>
            <span className="font-semibold text-xs sm:text-sm">TrackSmart Retail</span>
          </div>
          <div className="flex items-center gap-4 sm:gap-5 text-xs sm:text-sm text-muted-foreground">
            <Link to="/about" className="hover:text-foreground transition-colors">À propos</Link>
            <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
          <span className="text-[10px] sm:text-xs text-muted-foreground">© {new Date().getFullYear()} TNO Studio</span>
        </div>
      </footer>
    </div>
  );
}