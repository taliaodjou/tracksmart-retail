import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Target, Lightbulb, Heart, Shield, Zap, Phone, Mail } from 'lucide-react';

export default function About() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-neutral-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 font-bold text-lg">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-white text-sm font-bold">TS</span>
            </div>
            TrackSmart
          </Link>
          <Link to="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-orange-50/50 to-white py-16 sm:py-20">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-6 shadow-sm">
                <span className="text-white text-2xl font-bold">TS</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
                À propos de <span className="text-primary">TrackSmart Retail</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Une plateforme conçue pour aider les commerçants à réduire le gaspillage alimentaire et à mieux gérer leurs stocks.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Mission */}
        <section className="py-16 sm:py-20">
          <div className="max-w-4xl mx-auto px-6">
            <div className="grid sm:grid-cols-3 gap-6 mb-16">
              {[
                { icon: Target, title: 'Notre mission', desc: 'Aider chaque commerçant à ne plus jamais perdre d\'argent à cause d\'une date oubliée.', color: 'bg-amber-50 border-amber-100', iconColor: 'text-amber-600', iconBg: 'bg-amber-100' },
                { icon: Lightbulb, title: 'Notre vision', desc: 'Un monde où aucun produit alimentaire n\'est gaspillé pour une simple question d\'organisation.', color: 'bg-blue-50 border-blue-100', iconColor: 'text-blue-600', iconBg: 'bg-blue-100' },
                { icon: Heart, title: 'Nos valeurs', desc: 'Simplicité, utilité et proximité avec les commerçants qui utilisent notre outil au quotidien.', color: 'bg-red-50 border-red-100', iconColor: 'text-red-600', iconBg: 'bg-red-100' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className={`p-6 rounded-2xl border ${item.color} text-center`}
                >
                  <div className={`w-12 h-12 rounded-xl ${item.iconBg} flex items-center justify-center mx-auto mb-4`}>
                    <item.icon className={`w-6 h-6 ${item.iconColor}`} />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="prose prose-lg max-w-none text-muted-foreground"
            >
              <div className="bg-neutral-50 rounded-2xl p-8 border border-neutral-100">
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <Zap className="w-6 h-6 text-primary" />
                  Pourquoi TrackSmart ?
                </h2>
                <p className="mb-4">
                  Chaque année, des tonnes de produits alimentaires sont jetées parce qu'une date limite est passée inaperçue. TrackSmart Retail résout ce problème en suivant chaque produit du rayon au congélateur, et en envoyant des alertes intelligentes 14, 7 et 3 jours avant expiration.
                </p>
                <p className="mb-4">
                  La plateforme offre une gestion complète : suivi des commandes fournisseurs, rapports trimestriels détaillés avec analyse des pertes par catégorie et par rayon, suivi financier en CHF des produits jetés, et un espace collaboratif pour votre équipe.
                </p>
                <p>
                  TrackSmart Retail est développé par <strong>TNO Studio</strong>, une entreprise spécialisée dans les solutions numériques pour les commerces et les indépendants. Nous croyons que la technologie doit être simple, utile et accessible — c'est pourquoi TrackSmart est utilisable dès la première connexion, sans formation complexe.
                </p>
              </div>

              <div className="bg-primary/5 rounded-2xl p-8 border border-primary/10 mt-6">
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-3">
                  <Shield className="w-6 h-6 text-primary" />
                  La promesse TrackSmart
                </h2>
                <p>
                  Que vous gériez une petite épicerie de quartier ou une chaîne de plusieurs magasins, TrackSmart Retail s'adapte à votre taille et à vos besoins. Rejoignez les commerçants qui ont déjà réduit leurs pertes de plus de 30 % grâce à une meilleure gestion de leurs dates.
                </p>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* CTA Contact */}
      <section className="py-16 sm:py-20 bg-gradient-to-br from-primary/10 via-white to-orange-50/30">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">
              Envie d'en savoir plus ?
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto mb-8">
              Des questions sur nos tarifs ou sur comment devenir client ? Contactez-nous directement, nous sommes là pour vous répondre.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a href="tel:+41772229764" className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white border shadow-sm hover:shadow-md transition-all w-full sm:w-auto">
                <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center flex-shrink-0">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">Téléphone</p>
                  <p className="font-bold">+41 77 222 97 64</p>
                </div>
              </a>
              <a href="mailto:contact@tracksmart.ch" className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-white border shadow-sm hover:shadow-md transition-all w-full sm:w-auto">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="font-bold">contact@tracksmart.ch</p>
                </div>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-neutral-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <span className="text-white text-xs font-bold">TS</span>
            </div>
            <span className="font-semibold text-sm">TrackSmart Retail</span>
          </div>
          <div className="flex items-center gap-5 text-sm text-muted-foreground">
            <Link to="/about" className="text-primary font-medium">À propos</Link>
            <Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link>
          </div>
          <span className="text-xs text-muted-foreground">© {new Date().getFullYear()} TNO Studio</span>
        </div>
      </footer>
    </div>
  );
}