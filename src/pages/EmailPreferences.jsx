import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Mail, MailX, CheckCircle2, Loader2 } from 'lucide-react';

export default function EmailPreferences() {
  const [status, setStatus] = useState('loading'); // loading | success_unsub | success_resub | error
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [action, setAction] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const uid = params.get('uid');
    const act = params.get('action') || 'unsubscribe';
    setUserId(uid);
    setAction(act);

    if (!uid) {
      setStatus('error');
      return;
    }

    // Auto-execute on load
    handleAction(uid, act);
  }, []);

  const handleAction = async (uid, act) => {
    setLoading(true);
    try {
      await base44.functions.invoke('manageEmailSubscription', { action: act, userId: uid });
      setStatus(act === 'unsubscribe' ? 'success_unsub' : 'success_resub');
    } catch (e) {
      setStatus('error');
    }
    setLoading(false);
  };

  const handleResubscribe = () => {
    if (userId) handleAction(userId, 'resubscribe');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fafaf8] via-white to-[#f5f0e8] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl border border-border/40 max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="bg-[#111111] px-8 py-6 flex items-center gap-3">
          <div className="bg-primary rounded-lg px-3 py-1.5">
            <span className="text-black font-bold text-sm">TrackSmart</span>
          </div>
          <span className="text-white/30 text-xs">by TNO Studio</span>
        </div>

        <div className="px-8 py-10 text-center space-y-6">
          {loading || status === 'loading' ? (
            <>
              <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
              <p className="text-muted-foreground text-sm">Traitement en cours...</p>
            </>
          ) : status === 'success_unsub' ? (
            <>
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto">
                <MailX className="w-8 h-8 text-red-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">Désabonnement confirmé</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Vous ne recevrez plus les emails de notification TrackSmart.
                </p>
              </div>
              <div className="bg-secondary/50 rounded-xl p-4">
                <p className="text-xs text-muted-foreground mb-3">Vous vous êtes désabonné(e) par erreur ?</p>
                <button
                  onClick={handleResubscribe}
                  className="px-6 py-2.5 bg-primary text-black rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  Se réabonner aux emails
                </button>
              </div>
            </>
          ) : status === 'success_resub' ? (
            <>
              <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">Réabonnement confirmé !</h2>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Vous recevrez à nouveau les emails de notification TrackSmart.
                </p>
              </div>
              <a
                href="/dashboard"
                className="inline-block px-6 py-2.5 bg-primary text-black rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                Retour au tableau de bord
              </a>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto">
                <MailX className="w-8 h-8 text-red-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground mb-2">Lien invalide</h2>
                <p className="text-muted-foreground text-sm">Ce lien est invalide ou a expiré. Contactez support@tracksmart.com.</p>
              </div>
            </>
          )}
        </div>

        <div className="border-t border-border/30 px-8 py-4 text-center">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} TNO Studio · TrackSmart</p>
        </div>
      </div>
    </div>
  );
}