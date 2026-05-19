import React from 'react';
import { X, Download, ExternalLink, FileText, FileSpreadsheet, File } from 'lucide-react';
import { Button } from '@/components/ui/button';

const CATEGORY_LABELS = {
  facture: 'Facture', bon_livraison: 'Bon de livraison', contrat: 'Contrat',
  rapport: 'Rapport', tva: 'TVA', fiduciaire: 'Fiduciaire',
  fournisseur: 'Fournisseur', produit: 'Produit', autre: 'Autre',
};

export default function DocumentPreviewModal({ document, onClose }) {
  const isImage = document.file_type?.startsWith('image/');
  const isPdf = document.file_type === 'application/pdf';

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-border/40 flex-shrink-0">
        <div className="flex-1 min-w-0 mr-4">
          <h3 className="font-semibold text-sm truncate">{document.name}</h3>
          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
            <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
              {CATEGORY_LABELS[document.category] || 'Autre'}
            </span>
            {document.supplier_name && <span className="text-xs text-muted-foreground">{document.supplier_name}</span>}
            {document.amount && <span className="text-xs font-medium text-primary">CHF {document.amount.toFixed(2)}</span>}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <a href={document.file_url} target="_blank" rel="noopener noreferrer">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs">
              <ExternalLink className="w-3.5 h-3.5" /> Ouvrir
            </Button>
          </a>
          <a href={document.file_url} download={document.name}>
            <Button size="sm" variant="outline" className="gap-1.5 text-xs">
              <Download className="w-3.5 h-3.5" /> Télécharger
            </Button>
          </a>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Preview */}
      <div className="flex-1 flex items-center justify-center overflow-hidden bg-gray-100">
        {isImage && (
          <img src={document.file_url} alt={document.name} className="max-w-full max-h-full object-contain" />
        )}
        {isPdf && (
          <iframe src={document.file_url} className="w-full h-full border-0" title={document.name} />
        )}
        {!isImage && !isPdf && (
          <div className="text-center p-8">
            <File className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">Aperçu non disponible pour ce type de fichier</p>
            <a href={document.file_url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline">
                <ExternalLink className="w-4 h-4" /> Ouvrir dans un nouvel onglet
              </Button>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}