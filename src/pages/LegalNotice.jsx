import React from 'react';
import { Link } from 'react-router-dom';

export default function LegalNotice() {
  return (
    <div className="min-h-screen bg-white text-foreground">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <Link to="/" className="text-sm text-primary font-semibold">Retour à l’accueil</Link>
        <h1 className="text-3xl font-extrabold mt-6 mb-4">Mentions légales</h1>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>TrackSmart Retail est une solution éditée par TNO Studio.</p>
          <p>Contact : contact@tracksmart.ch</p>
          <p>Les informations présentes sur ce site sont fournies à titre informatif et peuvent être mises à jour à tout moment.</p>
        </div>
      </div>
    </div>
  );
}