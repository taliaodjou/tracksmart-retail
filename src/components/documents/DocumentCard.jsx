import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { FileText, FileImage, File, FileSpreadsheet, MoreVertical, Eye, Folder, Trash2, Edit2 } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const CATEGORY_LABELS = {
  facture: 'Facture', bon_livraison: 'Bon de livraison', contrat: 'Contrat',
  rapport: 'Rapport', tva: 'TVA', fiduciaire: 'Fiduciaire',
  fournisseur: 'Fournisseur', produit: 'Produit', autre: 'Autre',
};
const CATEGORY_COLORS = {
  facture: 'bg-blue-50 text-blue-700', bon_livraison: 'bg-green-50 text-green-700',
  contrat: 'bg-purple-50 text-purple-700', rapport: 'bg-amber-50 text-amber-700',
  tva: 'bg-orange-50 text-orange-700', fiduciaire: 'bg-indigo-50 text-indigo-700',
  fournisseur: 'bg-pink-50 text-pink-700', produit: 'bg-teal-50 text-teal-700',
  autre: 'bg-gray-50 text-gray-600',
};

function FileIcon({ fileType, className }) {
  if (fileType?.startsWith('image/')) return <FileImage className={className} />;
  if (fileType === 'application/pdf') return <FileText className={className} />;
  if (fileType?.includes('sheet') || fileType?.includes('excel') || fileType?.includes('csv')) return <FileSpreadsheet className={className} />;
  return <File className={className} />;
}

export default function DocumentCard({ document, folders, onPreview, onDeleted, onMoved }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const folder = folders.find(f => f.id === document.folder_id);

  const handleTrash = async () => {
    setMenuOpen(false);
    await base44.entities.Document.update(document.id, { is_deleted: true });
    onDeleted();
  };

  const handleRestore = async () => {
    await base44.entities.Document.update(document.id, { is_deleted: false });
    onDeleted();
  };

  return (
    <div className="bg-white rounded-xl border border-border/40 hover:border-primary/30 hover:shadow-md transition-all group relative">
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <FileIcon fileType={document.file_type} className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate pr-6">{document.name}</p>
            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[document.category] || CATEGORY_COLORS.autre}`}>
                {CATEGORY_LABELS[document.category] || 'Autre'}
              </span>
              {document.supplier_name && <span className="text-xs text-muted-foreground">{document.supplier_name}</span>}
            </div>
            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
              {document.amount && <span className="text-xs font-semibold text-primary">CHF {document.amount.toFixed(2)}</span>}
              {document.document_date && <span className="text-xs text-muted-foreground">{format(new Date(document.document_date), 'd MMM yyyy', { locale: fr })}</span>}
              {folder && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Folder className="w-3 h-3" style={{ color: folder.color }} />
                  {folder.name}
                </span>
              )}
            </div>
          </div>

          {/* Menu */}
          <div className="relative">
            <button onClick={() => setMenuOpen(o => !o)} className="p-1 rounded hover:bg-secondary transition-colors">
              <MoreVertical className="w-4 h-4 text-muted-foreground" />
            </button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-6 z-20 bg-white border border-border rounded-xl shadow-lg py-1 min-w-[140px]">
                  <button onClick={() => { setMenuOpen(false); onPreview(document); }} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary w-full text-left">
                    <Eye className="w-3.5 h-3.5" /> Aperçu
                  </button>
                  {document.is_deleted ? (
                    <button onClick={handleRestore} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary w-full text-left text-green-600">
                      <Folder className="w-3.5 h-3.5" /> Restaurer
                    </button>
                  ) : (
                    <button onClick={handleTrash} className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary w-full text-left text-red-500">
                      <Trash2 className="w-3.5 h-3.5" /> Corbeille
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Click to preview */}
        <button onClick={() => onPreview(document)} className="absolute inset-0 w-full h-full opacity-0" aria-label="Aperçu" />
      </div>
    </div>
  );
}