import React from 'react';
import { Link } from 'react-router-dom';
import { Lock, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function PremiumGate({ featureName = 'cette fonctionnalité' }) {
  return (
    <div className="flex-1 flex items-center justify-center px-4 py-20">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6 shadow-sm">
          <Lock className="w-9 h-9 text-primary" />
        </div>

        <h2 className="text-2xl font-extrabold text-foreground mb-3">
          Abonnement requis
        </h2>

        <p className="text-muted-foreground text-base mb-2 leading-relaxed">
          Renouvelez votre abonnement pour bénéficier de vos avantages premium et accéder à&nbsp;
          <span className="font-semibold text-foreground">{featureName}</span>.
        </p>

        <p className="text-sm text-muted-foreground/70 mb-8">
          Votre période de 30 jours est expirée. Contactez votre administrateur ou renouvelez directement.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="rounded-full gap-2 px-8">
            <Link to="/profile">
              <Sparkles className="w-4 h-4" />
              Renouveler mon abonnement
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full gap-2 px-6">
            <Link to="/dashboard">
              Retour au tableau de bord
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}