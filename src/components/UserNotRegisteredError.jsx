import React, { useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/AuthContext';

const UserNotRegisteredError = () => {
  const { checkAppState } = useAuth();

  useEffect(() => {
    const interval = window.setInterval(() => {
      checkAppState();
    }, 5000);

    return () => window.clearInterval(interval);
  }, [checkAppState]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#fafaf8] via-white to-[#f5f0e8] px-4">
      <div className="w-full max-w-lg rounded-3xl border border-[#e8dfc8] bg-white p-10 text-center shadow-sm">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
          TrackSmart Retail
        </p>
        <h1 className="mb-4 text-3xl font-bold text-foreground">
          Votre demande a bien été reçue
        </h1>
        <p className="mx-auto max-w-sm text-base leading-relaxed text-muted-foreground">
          L’administrateur vous donne accès à votre compte. Merci de patienter quelques instants.
        </p>
        <div className="mt-8 rounded-2xl border border-border bg-secondary/40 px-5 py-4 text-sm text-muted-foreground">
          Cette page vérifie automatiquement l’état de votre accès et se mettra à jour dès que votre compte sera validé.
        </div>
      </div>
    </div>
  );
};

export default UserNotRegisteredError;