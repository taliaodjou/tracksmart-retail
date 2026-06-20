import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clock, ArrowLeft, Mail, MapPin, Send, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { base44 } from '@/api/base44Client';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Veuillez remplir tous les champs.');
      return;
    }
    setSending(true);
    try {
      await base44.functions.invoke('sendContactMessage', { name, email, message });
      setSent(true);
    } catch (err) {
      setError("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setSending(false);
    }
  };

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
            <span className="text-primary">Contactez</span>-nous
          </h1>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact form */}
            <div className="bg-white rounded-2xl border border-border/60 p-6 sm:p-8 shadow-sm">
              {sent ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <CheckCircle className="w-12 h-12 text-green-500 mb-4" />
                  <h2 className="text-xl font-bold mb-2">Message envoyé !</h2>
                  <p className="text-muted-foreground text-sm">
                    Merci pour votre message. Nous vous répondrons dans les plus brefs délais.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h2 className="text-lg font-bold mb-1">Envoyez-nous un message</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Une question, une suggestion ou besoin d'aide ? Écrivez-nous.
                  </p>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Nom</label>
                    <Input
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Votre nom"
                      className="h-10"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Email</label>
                    <Input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="vous@exemple.com"
                      className="h-10"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium mb-1 block">Message</label>
                    <Textarea
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      placeholder="Votre message..."
                      rows={5}
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-red-600">{error}</p>
                  )}

                  <Button type="submit" disabled={sending} className="w-full h-11">
                    {sending ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Envoi...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        Envoyer
                      </span>
                    )}
                  </Button>
                </form>
              )}
            </div>

            {/* Contact info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-lg font-bold mb-4">Nos coordonnées</h2>
                <div className="space-y-4">
                  <a
                    href="mailto:support@tracksmart.com"
                    className="flex items-center gap-3 p-4 rounded-xl bg-white border border-border/60 hover:border-primary/30 hover:shadow-sm transition-all"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Email</p>
                      <p className="text-muted-foreground text-sm">support@tracksmart.com</p>
                    </div>
                  </a>

                  <div className="flex items-center gap-3 p-4 rounded-xl bg-white border border-border/60">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">Adresse</p>
                      <p className="text-muted-foreground text-sm">TNO Studio — Suisse</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-primary/5 rounded-2xl border border-primary/10 p-6">
                <h3 className="font-bold mb-2">Besoin d'aide rapidement ?</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Consultez notre documentation ou contactez-nous directement par email. Nous répondons généralement sous 24 heures ouvrées.
                </p>
              </div>
            </div>
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