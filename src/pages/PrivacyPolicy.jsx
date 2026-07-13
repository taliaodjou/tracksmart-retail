import React from 'react';
import { Link } from 'react-router-dom';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white text-foreground">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <Link to="/" className="text-sm text-primary font-semibold">Retour à l’accueil</Link>
        <h1 className="text-3xl font-extrabold mt-6 mb-4">Politique de confidentialité</h1>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>TrackSmart Retail collecte uniquement les informations nécessaires au fonctionnement de l’application et à la gestion des comptes clients.</p>
          <p>Les données liées aux produits, documents et rapports restent utilisées dans le cadre du service TrackSmart Retail.</p>
          <p>Pour toute question concernant vos données, vous pouvez nous contacter à contact@tracksmart.ch.</p>
        </div>
      </div>
    </div>
  );
}