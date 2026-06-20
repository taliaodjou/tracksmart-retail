import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  ArrowRight, Play, Check, Lock, Phone, Search,
  Boxes, AlertTriangle, Barcode, BarChart3, Smartphone,
  LayoutDashboard, Package, Warehouse, Bell, ArrowLeftRight, FileText, Settings,
  TrendingUp, ShoppingCart, ChevronDown
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
        <div className="max-w-7xl mx-auto px-6 h-[72px] flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link to="/" className="flex items-center gap-2.5 font-bold text-lg">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <span className="text-white text-sm font-bold">TS</span>
              </div>
              TrackSmart Retail
            </Link>
            <nav className="hidden lg:flex items-center gap-7 text-sm text-muted-foreground">
              <a href="#features" className="hover:text-foreground transition-colors">Fonctionnalités</a>
              <span className="text-neutral-200">Pour qui ?</span>
              <span className="text-neutral-200">Tarifs</span>
              <span className="text-neutral-200">Ressources</span>
              <Link to="/about" className="hover:text-foreground transition-colors">À propos</Link>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors hidden sm:inline">
              Déjà un compte ?
            </Link>
            <Link to="/login">
              <Button variant="outline" size="sm" className="rounded-lg hidden sm:flex">Connexion</Button>
            </Link>
            <Link to="/register">
              <Button size="sm" className="rounded-lg">Créer un compte</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-white to-primary/[0.02]">
        <div className="max-w-7xl mx-auto px-6 pt-16 pb-20 lg:pt-20 lg:pb-28">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6">
                <Check className="w-4 h-4" />
                LA SOLUTION DES COMMERÇANTS MALINS
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-[52px] font-extrabold leading-[1.12] tracking-tight mb-6">
                Gérez vos stocks.<br />
                Évitez les pertes.<br />
                <span className="text-primary">Développez</span> votre commerce.
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-lg">
                TrackSmart Retail vous aide à suivre vos produits, leurs dates de péremption et vos stocks en temps réel pour ne plus perdre d'argent.
              </p>
              <div className="flex flex-col sm:flex-row items-start gap-3 mb-10">
                <Link to="/register">
                  <Button size="lg" className="text-base px-7 h-12 rounded-xl font-semibold shadow-md">
                    Essayer gratuitement
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="text-base px-7 h-12 rounded-xl font-medium">
                  <Play className="w-4 h-4 mr-1.5" />
                  Voir comment ça marche
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-500" />
                  Installation rapide
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-green-500" />
                  Données 100% sécurisées
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-green-500" />
                  Support réactif
                </div>
              </div>
            </motion.div>

            {/* Right Column — App Dashboard Preview */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="hidden lg:block"
            >
              <div className="bg-white rounded-2xl shadow-xl border border-neutral-200 overflow-hidden">
                <div className="flex h-[420px]">
                  {/* Sidebar */}
                  <div className="w-[160px] bg-neutral-50 border-r border-neutral-100 p-4 flex flex-col gap-0.5">
                    <div className="flex items-center gap-2 mb-4 px-2">
                      <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold">TS</span>
                      </div>
                      <span className="text-xs font-semibold">TrackSmart</span>
                    </div>
                    {[
                      { icon: LayoutDashboard, label: 'Tableau de bord', active: true },
                      { icon: Package, label: 'Produits' },
                      { icon: Warehouse, label: 'Stocks' },
                      { icon: Bell, label: 'Alertes DLC' },
                      { icon: ArrowLeftRight, label: 'Entrées / Sorties' },
                      { icon: FileText, label: 'Rapports' },
                      { icon: Settings, label: 'Paramètres' },
                    ].map((item, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                          item.active
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'text-muted-foreground hover:bg-neutral-100'
                        }`}
                      >
                        <item.icon className="w-3.5 h-3.5 flex-shrink-0" />
                        {item.label}
                      </div>
                    ))}
                  </div>

                  {/* Main Content */}
                  <div className="flex-1 p-4 overflow-hidden">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="text-xs font-semibold">Bonjour, Marie 👋</p>
                      </div>
                      <div className="flex items-center gap-1.5 bg-neutral-100 rounded-lg px-2.5 py-1 text-[10px] text-muted-foreground">
                        <Search className="w-3 h-3" />
                        Rechercher...
                      </div>
                    </div>

                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {[
                        { label: 'Produits en stock', value: '1 248', icon: Package, color: 'bg-blue-50 border-blue-100' },
                        { label: 'Alertes DLC', value: '23', icon: Bell, color: 'bg-amber-50 border-amber-100' },
                        { label: 'Pertes évitées', value: '250 000 CHF', icon: TrendingUp, color: 'bg-green-50 border-green-100' },
                        { label: 'Valeur du stock', value: '2 450 000 CHF', icon: ShoppingCart, color: 'bg-purple-50 border-purple-100' },
                      ].map((card, idx) => (
                        <div key={idx} className={`rounded-xl border p-2.5 ${card.color}`}>
                          <div className="flex items-center gap-1.5 mb-1">
                            <card.icon className="w-3 h-3 text-muted-foreground" />
                            <span className="text-[10px] text-muted-foreground">{card.label}</span>
                          </div>
                          <p className="text-sm font-bold">{card.value}</p>
                        </div>
                      ))}
                    </div>

                    {/* Alert List */}
                    <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-3">
                      <p className="text-[10px] font-semibold text-red-700 mb-2">⚠️ Alerte proches expiration</p>
                      {[
                        { name: 'Lait Candia 1L', date: '30/06/2026' },
                        { name: 'Yaourt nature x12', date: '02/07/2026' },
                        { name: 'Jambon de dinde', date: '05/07/2026' },
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between py-1 border-b border-red-100 last:border-0">
                          <span className="text-[10px]">{item.name}</span>
                          <span className="text-[10px] text-red-600 font-medium">{item.date}</span>
                        </div>
                      ))}
                    </div>

                    {/* Mini Chart */}
                    <div className="bg-neutral-50 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-semibold">Évolution des pertes évitées</p>
                        <ChevronDown className="w-3 h-3 text-muted-foreground" />
                      </div>
                      <div className="h-16 flex items-end gap-1.5">
                        {[20, 25, 18, 35, 40, 30, 50, 45, 55, 48, 60, 65, 58, 70, 72, 68, 75, 80, 78, 82, 85, 80, 88, 90, 85, 92, 95, 90, 98, 100].map((h, i) => (
                          <div
                            key={i}
                            className="flex-1 bg-primary/60 rounded-sm hover:bg-primary transition-colors"
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                      <div className="flex justify-between mt-1.5 text-[9px] text-muted-foreground">
                        <span>1 Juin</span>
                        <span>30 Juin</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Single Stat */}
      <section className="border-y border-neutral-100 bg-gradient-to-r from-primary/5 via-white to-primary/5">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="text-4xl sm:text-5xl font-extrabold text-primary mb-2">98%</div>
            <p className="text-muted-foreground text-lg">de nos clients réduisent leurs pertes produits</p>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 sm:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight">
              Tout ce qu'il vous faut pour mieux gérer votre magasin
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-5">
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
                className="group p-6 rounded-2xl border border-neutral-100 hover:border-primary/20 hover:shadow-lg transition-all duration-300 text-center"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/15 transition-colors">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-neutral-100 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
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