import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

const ADMIN_EMAIL = 'talia.odjou@gmail.com';
const ADMIN_PIN = '1217';
const STORAGE_KEY = 'tracksmart_admin_pin_ok';

export default function AdminPinGate({ userEmail, children }) {
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [showPin, setShowPin] = useState(false);

  useEffect(() => {
    // Check session storage so they don't re-enter on page navigation
    if (sessionStorage.getItem(STORAGE_KEY) === 'true') {
      setUnlocked(true);
    }
  }, []);

  // Only require PIN for the specific admin account
  if (userEmail !== ADMIN_EMAIL || unlocked) {
    return children;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin === ADMIN_PIN) {
      sessionStorage.setItem(STORAGE_KEY, 'true');
      setUnlocked(true);
      setError(false);
    } else {
      setError(true);
      setPin('');
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Lock className="w-7 h-7 text-primary" />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Portail Admin</h1>
          <p className="text-white/40 text-sm">Entrez votre code PIN pour continuer</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <input
              type={showPin ? 'text' : 'password'}
              value={pin}
              onChange={(e) => { setPin(e.target.value); setError(false); }}
              placeholder="Code PIN"
              maxLength={8}
              autoFocus
              className={`w-full bg-[#1a1a1a] border rounded-2xl px-5 py-4 text-white text-center text-2xl font-bold tracking-widest placeholder:text-white/20 focus:outline-none transition-all pr-12 ${
                error ? 'border-red-500/60 focus:border-red-500' : 'border-white/10 focus:border-primary/50'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPin(v => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
            >
              {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center">Code incorrect. Réessayez.</p>
          )}

          <button
            type="submit"
            disabled={!pin}
            className="w-full bg-primary text-black font-bold py-4 rounded-2xl text-base hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Accéder au portail
          </button>
        </form>

        <p className="text-center text-white/20 text-xs mt-8">TrackSmart · TNO Studio</p>
      </div>
    </div>
  );
}