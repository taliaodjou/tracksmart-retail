import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  ArrowRight, Play, Check, Lock, Phone, Search, Clock, Mail,
  Boxes, AlertTriangle, Barcode, BarChart3, Smartphone,
  LayoutDashboard, Package, ChevronDown, Bell, FileText, FolderOpen, TrendingDown
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
              <a href="#problem" className="hover:text-foreground transition-colors">Le problème</a>
              <a href="#solution" className="hover:text-foreground transition-colors">La solution</a>
              <a href="#features" className="hover:text-foreground transition-colors">Fonctionnalités</a>
              <Link to="/offres" className="hover:text-foreground transition-colors">Les offres</Link>
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-14 pb-16 sm:pt-16 sm:pb-20 lg:pt-20 lg:pb-28">
            <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
              {/* Left Column */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                  <Check className="w-3 h-3 sm:w-4 sm:h-4" />
                  LA SOLUTION DES COMMERÇANTS MALINS
                </div>
                <h1 className="text-[32px] sm:text-[44px] lg:text-[52px] font-bold leading-[1.12] tracking-tight mb-4 sm:mb-6">
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
                  <a href="#how-it-works" className="w-full sm:w-auto">
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
                animate={{ opacity: 1, x: 0, scale: 1, y: [0, -6, 0] }}
                transition={{ 
                  opacity: { duration: 0.7, delay: 0.2 },
                  x: { duration: 0.7, delay: 0.2 },
                  scale: { duration: 0.7, delay: 0.2 },
                  y: { duration: 3, repeat: Infinity, ease: "easeInOut" }
                }}
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
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: [0, 4, 0], y: [0, -3, 0] }}
                    transition={{ 
                      opacity: { duration: 0.5, delay: 0.8 },
                      x: { duration: 4, repeat: Infinity, ease: "easeInOut" },
                      y: { duration: 3.5, repeat: Infinity, ease: "easeInOut" }
                    }}
                    className="absolute -right-4 sm:-right-16 lg:-right-20 top-[68%] -translate-y-1/2 bg-white rounded-xl shadow-lg border border-neutral-200 p-2.5 sm:p-3 w-36 sm:w-44 z-10"
                  >
                    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                      <p className="text-[9px] sm:text-[10px] font-semibold">Évolution</p>
                      <ChevronDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-muted-foreground" />
                    </div>
                    <div className="h-10 sm:h-12 flex items-end gap-[2px] mb-1">
                      {[30, 35, 28, 50, 45, 40, 60, 55, 65, 58, 70, 75, 68, 80, 85, 78, 90, 95].map((h, i) => (
                        <div key={i} className="flex-1 bg-primary/60 rounded-[1px]" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs sm:text-sm font-bold">12 500 CHF</span>
                      <span className="text-[8px] sm:text-[9px] text-green-600 font-semibold">+18%</span>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* 98% Stat — scroll-triggered animation */}
        <section className="pb-10 sm:pb-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: "easeOut", delay: 0.5 }}
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

      {/* Problem + Solution Section */}
      <section id="problem" className="py-16 sm:py-24 bg-gradient-to-br from-white via-orange-50/50 to-emerald-50/40 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-8 lg:gap-12 items-center">
            <div>
              <p className="text-sm font-semibold text-primary uppercase tracking-wide mb-2">Le problème</p>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight mb-4">
                Trop de produits suivis à la main, trop de pertes invisibles.
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-6">
                TrackSmart Retail remplace les carnets, les oublis et les contrôles dispersés par une vue claire de vos DLC, alertes, documents et pertes.
              </p>
              <Link to="/offres" className="inline-flex">
                <Button className="rounded-xl px-5 h-11 font-semibold gap-2 shadow-md">
                  Découvrir les offres
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { icon: TrendingDown, title: 'Marge protégée', desc: 'Repérez les produits à risque avant qu’ils ne deviennent une perte.', bg: 'bg-red-50', text: 'text-red-500', border: 'border-red-100' },
                { icon: Bell, title: 'Alertes utiles', desc: 'Les DLC importantes remontent au bon moment, sans vérification permanente.', bg: 'bg-amber-50', text: 'text-amber-500', border: 'border-amber-100' },
                { icon: Barcode, title: 'Ajout rapide', desc: 'Scannez, complétez, suivez : moins de saisie, plus de fiabilité.', bg: 'bg-blue-50', text: 'text-blue-500', border: 'border-blue-100' },
                { icon: FolderOpen, title: 'Tout centralisé', desc: 'Stock, analyses, PDF et documents restent au même endroit.', bg: 'bg-emerald-50', text: 'text-emerald-500', border: 'border-emerald-100' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: i * 0.07 }}
                  whileHover={{ y: -5, rotate: i % 2 === 0 ? -1 : 1 }}
                  className={`rounded-3xl border ${item.border} ${item.bg} p-5 shadow-sm`}
                >
                  <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mb-4 shadow-sm">
                    <item.icon className={`w-6 h-6 ${item.text}`} />
                  </div>
                  <h3 className="font-extrabold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>

          <div id="solution" className="mt-10 sm:mt-14 rounded-3xl bg-white border border-neutral-100 shadow-sm p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-center gap-3">
              {[
                { icon: LayoutDashboard, title: 'Dashboard', color: 'bg-blue-50 text-blue-600' },
                { icon: Barcode, title: 'Barcode', color: 'bg-amber-50 text-amber-600' },
                { icon: BarChart3, title: 'Analytics', color: 'bg-purple-50 text-purple-600' },
                { icon: FileText, title: 'Rapports PDF', color: 'bg-red-50 text-red-600' },
                { icon: FolderOpen, title: 'Documents', color: 'bg-emerald-50 text-emerald-600' },
              ].map((item) => (
                <div key={item.title} className={`flex items-center gap-2 rounded-2xl px-4 py-3 ${item.color}`}>
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm font-bold">{item.title}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center mb-10 sm:mb-12">
            <p className="text-sm font-semibold text-primary uppercase tracking-wide mb-2">Comment ça fonctionne</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
              Un processus simple pour reprendre le contrôle de vos pertes.
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Barcode, title: 'Scanner', desc: 'Ajoutez un produit en quelques secondes.', bg: 'bg-blue-50', text: 'text-blue-500', accent: 'text-blue-100' },
              { icon: Clock, title: 'Planifier', desc: 'Gardez les dates importantes visibles.', bg: 'bg-amber-50', text: 'text-amber-500', accent: 'text-amber-100' },
              { icon: Bell, title: 'Agir', desc: 'Traitez les alertes avant expiration.', bg: 'bg-red-50', text: 'text-red-500', accent: 'text-red-100' },
              { icon: TrendingDown, title: 'Optimiser', desc: 'Mesurez les pertes évitées et progressez.', bg: 'bg-emerald-50', text: 'text-emerald-500', accent: 'text-emerald-100' },
            ].map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.06 }}
                whileHover={{ y: -5 }}
                className={`relative rounded-3xl border border-neutral-100 ${step.bg} p-5 shadow-sm overflow-hidden`}
              >
                <span className={`absolute top-3 right-4 text-5xl font-extrabold ${step.accent}`}>0{i + 1}</span>
                <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center mb-4 shadow-sm">
                  <step.icon className={`w-5 h-5 ${step.text}`} />
                </div>
                <h3 className="font-bold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-16 sm:py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8 sm:mb-10 md:mb-14"
          >
            <p className="text-sm font-semibold text-primary uppercase tracking-wide mb-2">Les fonctionnalités</p>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-3 sm:mb-4 tracking-tight">
              Tout ce qu'il vous faut pour mieux gérer votre magasin
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5">
            {[
              {
                icon: LayoutDashboard,
                title: 'Vue stock',
                desc: 'Toutes les priorités du magasin visibles en un coup d’œil.',
                color: 'bg-blue-50 text-blue-500 border-blue-100',
              },
              {
                icon: Barcode,
                title: 'Scan rapide',
                desc: 'Moins de saisie, plus de précision au quotidien.',
                color: 'bg-amber-50 text-amber-500 border-amber-100',
              },
              {
                icon: BarChart3,
                title: 'Pilotage',
                desc: 'Repérez les rayons sensibles et les tendances de pertes.',
                color: 'bg-purple-50 text-purple-500 border-purple-100',
              },
              {
                icon: FileText,
                title: 'PDF prêts',
                desc: 'Des rapports propres pour les suivis et la comptabilité.',
                color: 'bg-red-50 text-red-500 border-red-100',
              },
              {
                icon: FolderOpen,
                title: 'Documents',
                desc: 'Factures et bons de livraison gardés au bon endroit.',
                color: 'bg-emerald-50 text-emerald-500 border-emerald-100',
              },
              {
                icon: Smartphone,
                title: 'Multi-écran',
                desc: 'Une utilisation fluide sur mobile, tablette et ordinateur.',
                color: 'bg-cyan-50 text-cyan-500 border-cyan-100',
              },
            ].map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                className={`group p-4 sm:p-5 md:p-6 rounded-3xl border ${f.color} hover:shadow-lg transition-all duration-300 text-center bg-white`}
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-sm group-hover:scale-105 transition-transform">
                  <f.icon className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <h3 className="font-bold text-sm sm:text-base mb-1.5 sm:mb-2">{f.title}</h3>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Contact Section — soft orange / light tone */}
      <section className="py-16 sm:py-24 bg-gradient-to-br from-orange-50 via-amber-50/60 to-orange-100/40 text-foreground mt-4 sm:mt-0">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
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

            <Link to="/offres" className="inline-flex mb-8">
              <Button className="rounded-xl px-6 h-11 font-semibold gap-2">
                Voir les offres
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-8">
              <motion.a
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                href="mailto:contact@tracksmart.ch"
                className="flex items-center gap-2.5 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl bg-white border border-orange-200 hover:border-primary hover:shadow-md transition-all duration-300 group w-full sm:w-auto"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] sm:text-xs text-muted-foreground">Par email</p>
                  <p className="text-sm sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors">contact@tracksmart.ch</p>
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
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-5 text-xs sm:text-sm text-muted-foreground">
            <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
            <Link to="/mentions-legales" className="hover:text-foreground transition-colors">Mentions légales</Link>
            <Link to="/politique-confidentialite" className="hover:text-foreground transition-colors">Politique de confidentialité</Link>
          </div>
          <span className="text-[10px] sm:text-xs text-muted-foreground">© {new Date().getFullYear()} TNO Studio</span>
        </div>
      </footer>
    </div>
  );
}