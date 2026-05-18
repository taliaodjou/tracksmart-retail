import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, Zap, Calendar, ExternalLink, Loader2 } from 'lucide-react';

const MONTHLY_PRICE_ID = 'price_1TYUha8DDFjXRXu1bECoxzyQ';
const ANNUAL_PRICE_ID = 'price_1TYUha8DDFjXRXu1b568DStq';

const plans = [
  {
    id: 'monthly',
    priceId: MONTHLY_PRICE_ID,
    name: 'Mensuel',
    price: '29',
    currency: 'CHF',
    period: '/ mois',
    highlight: false,
    features: ['Suivi illimité des DLC', 'Alertes d\'expiration', 'Rapports mensuels', 'Support email'],
  },
  {
    id: 'annual',
    priceId: ANNUAL_PRICE_ID,
    name: 'Annuel',
    price: '290',
    currency: 'CHF',
    period: '/ an',
    highlight: true,
    badge: '2 mois offerts',
    features: ['Suivi illimité des DLC', 'Alertes d\'expiration', 'Rapports trimestriels', 'Support prioritaire'],
  },
];

export default function SubscriptionPlans({ user }) {
  const [loadingPlan, setLoadingPlan] = useState(null);
  const [loadingPortal, setLoadingPortal] = useState(false);

  const isActive = user?.subscription_status === 'active';
  const hasStripe = !!user?.stripe_customer_id;

  const handleSubscribe = async (priceId, planId) => {
    // Block checkout in iframe
    if (window.self !== window.top) {
      alert('Le paiement est uniquement disponible depuis l\'application publiée.');
      return;
    }
    setLoadingPlan(planId);
    try {
      const res = await base44.functions.invoke('stripeCheckout', { priceId });
      if (res.data?.url) window.location.href = res.data.url;
    } catch (e) {
      console.error(e);
    }
    setLoadingPlan(null);
  };

  const handleManage = async () => {
    setLoadingPortal(true);
    try {
      const res = await base44.functions.invoke('stripePortal', {});
      if (res.data?.url) window.location.href = res.data.url;
    } catch (e) {
      console.error(e);
    }
    setLoadingPortal(false);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-border/40">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="font-semibold text-foreground flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" /> Abonnement
          </h2>
          {isActive && (
            <p className="text-xs text-emerald-600 mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Abonnement actif
            </p>
          )}
        </div>
        {isActive && hasStripe && (
          <button
            onClick={handleManage}
            disabled={loadingPortal}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-border/80 transition-colors"
          >
            {loadingPortal ? <Loader2 className="w-3 h-3 animate-spin" /> : <ExternalLink className="w-3 h-3" />}
            Gérer mon abonnement
          </button>
        )}
      </div>

      {isActive ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-sm text-emerald-800">
          Votre abonnement est actif. Utilisez "Gérer mon abonnement" pour modifier, mettre en pause ou annuler.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {plans.map(plan => (
            <div
              key={plan.id}
              className={`relative rounded-xl border p-5 flex flex-col gap-4 transition-all ${
                plan.highlight
                  ? 'border-primary bg-primary/5 shadow-sm'
                  : 'border-border bg-secondary/30'
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-2.5 left-4 bg-primary text-black text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {plan.badge}
                </span>
              )}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="font-semibold text-foreground">{plan.name}</span>
                </div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-foreground">{plan.price}</span>
                  <span className="text-sm text-muted-foreground">{plan.currency} {plan.period}</span>
                </div>
              </div>
              <ul className="space-y-1.5 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                onClick={() => handleSubscribe(plan.priceId, plan.id)}
                disabled={!!loadingPlan}
                className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                  plan.highlight
                    ? 'bg-primary text-black hover:bg-primary/90'
                    : 'bg-foreground text-background hover:bg-foreground/90'
                } disabled:opacity-50`}
              >
                {loadingPlan === plan.id ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                S'abonner
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}