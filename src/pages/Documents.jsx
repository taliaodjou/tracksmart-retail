import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DocumentCard from '@/components/documents/DocumentCard';
import DocumentUploadModal from '@/components/documents/DocumentUploadModal';
import DocumentPreviewModal from '@/components/documents/DocumentPreviewModal';
import FolderModal from '@/components/documents/FolderModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Upload, FolderPlus, Search, Folder, Trash2,
  FileText, X, MoreVertical, Edit2, ChevronLeft
} from 'lucide-react';

const CATEGORY_LABELS = {
  facture: 'Facture', bon_livraison: 'Bon de livraison', contrat: 'Contrat',
  rapport: 'Rapport', tva: 'TVA', fiduciaire: 'Fiduciaire',
  fournisseur: 'Fournisseur', produit: 'Produit', autre: 'Autre',
};

export default function Documents() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [section, setSection] = useState('all'); // 'all', 'trash', or folder id
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [showUpload, setShowUpload] = useState(false);
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [editingFolder, setEditingFolder] = useState(null);
  const [previewDoc, setPreviewDoc] = useState(null);
  const [folderMenu, setFolderMenu] = useState(null);

  const { data: folders = [] } = useQuery({
    queryKey: ['folders', user?.email],
    queryFn: () => base44.entities.Folder.filter({ user_email: user.email }),
    enabled: !!user,
  });

  const { data: documents = [] } = useQuery({
    queryKey: ['documents', user?.email],
    queryFn: () => base44.entities.Document.filter({ user_email: user.email }),
    enabled: !!user,
  });

  const refresh = () => {
    queryClient.invalidateQueries(['documents', user?.email]);
    queryClient.invalidateQueries(['folders', user?.email]);
  };

  const deleteFolder = async (folder) => {
    setFolderMenu(null);
    const docsInFolder = documents.filter(d => d.folder_id === folder.id);
    await Promise.all(docsInFolder.map(d => base44.entities.Document.update(d.id, { folder_id: null })));
    await base44.entities.Folder.delete(folder.id);
    if (section === folder.id) setSection('all');
    refresh();
  };

  const filteredDocs = useMemo(() => {
    let docs = documents;
    if (section === 'trash') {
      docs = docs.filter(d => d.is_deleted);
    } else if (section === 'all') {
      docs = docs.filter(d => !d.is_deleted);
    } else {
      docs = docs.filter(d => !d.is_deleted && d.folder_id === section);
    }
    if (search) {
      const q = search.toLowerCase();
      docs = docs.filter(d =>
        d.name?.toLowerCase().includes(q) ||
        d.supplier_name?.toLowerCase().includes(q) ||
        d.amount?.toString().includes(q)
      );
    }
    if (filterCategory) {
      docs = docs.filter(d => d.category === filterCategory);
    }
    return docs.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
  }, [documents, section, search, filterCategory]);

  const trashCount = documents.filter(d => d.is_deleted).length;
  const inFolder = section !== 'all' && section !== 'trash';
  const currentFolder = inFolder ? folders.find(f => f.id === section) : null;
  const currentSectionLabel = section === 'all' ? 'Tous les documents'
    : section === 'trash' ? 'Corbeille'
    : currentFolder?.name || '';

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f5f5', color: '#1a1a1a' }}>
      <DashboardHeader />

      <main className="pt-20 sm:pt-24 max-w-5xl mx-auto px-4 sm:px-6 pb-6">

        {/* Page header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {inFolder && (
              <button onClick={() => setSection('all')} className="p-1.5 rounded-lg hover:bg-white border border-border/40 transition-colors">
                <ChevronLeft className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">{currentSectionLabel}</h1>
              {section === 'all' && (
                <p className="text-xs text-muted-foreground">Stockez et organisez vos factures, bons de livraison, contrats et autres documents.</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs"
              onClick={() => { setEditingFolder(null); setShowFolderModal(true); }}
            >
              <FolderPlus className="w-4 h-4" />
              <span className="hidden sm:inline">Nouveau dossier</span>
              <span className="sm:hidden">Dossier</span>
            </Button>
            <Button size="sm" className="gap-1.5 text-xs" onClick={() => setShowUpload(true)}>
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Ajouter un document</span>
              <span className="sm:hidden">Ajouter</span>
            </Button>
          </div>
        </div>

        {/* Folders grid — shown on 'all' view */}
        {section === 'all' && (
          <div className="mb-6">
            {folders.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {folders.map(folder => {
                  const count = documents.filter(d => !d.is_deleted && d.folder_id === folder.id).length;
                  return (
                    <div key={folder.id} className="relative group">
                      <button
                        onClick={() => setSection(folder.id)}
                        className="w-full flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-border/40 hover:border-primary/40 hover:shadow-md transition-all text-center"
                      >
                        <div
                          className="w-12 h-12 rounded-xl flex items-center justify-center"
                          style={{ backgroundColor: (folder.color || '#C9A646') + '20' }}
                        >
                          <Folder className="w-7 h-7" style={{ color: folder.color || '#C9A646' }} />
                        </div>
                        <div className="w-full min-w-0">
                          <p className="text-sm font-semibold text-foreground truncate">{folder.name}</p>
                          <p className="text-xs text-muted-foreground">{count} doc{count !== 1 ? 's' : ''}</p>
                        </div>
                      </button>
                      {/* Folder actions menu */}
                      <div className="absolute top-2 right-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); setFolderMenu(folderMenu === folder.id ? null : folder.id); }}
                          className="p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white border border-border/40 shadow-sm"
                        >
                          <MoreVertical className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                        {folderMenu === folder.id && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setFolderMenu(null)} />
                            <div className="absolute right-0 top-7 z-20 bg-white border border-border rounded-xl shadow-lg py-1 min-w-[130px]">
                              <button onClick={() => { setEditingFolder(folder); setShowFolderModal(true); setFolderMenu(null); }}
                                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary w-full text-left text-foreground"
                              >
                                <Edit2 className="w-3.5 h-3.5" /> Renommer
                              </button>
                              <button onClick={() => deleteFolder(folder)}
                                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-secondary w-full text-left text-red-500"
                              >
                                <Trash2 className="w-3.5 h-3.5" /> Supprimer
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}




        {/* Trash back link */}
        {section === 'trash' && (
          <button
            onClick={() => setSection('all')}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-5 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            Retour aux documents
          </button>
        )}

        {/* Search & filters */}
        <div className="flex gap-2 mb-5 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Rechercher un document..."
              className="pl-9 bg-white text-xs h-8"
            />
          </div>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="h-9 rounded-md border border-input bg-white px-3 text-sm"
          >
            <option value="">Tous les types</option>
            {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
              <option key={v} value={v}>{l}</option>
            ))}
          </select>
          {(search || filterCategory) && (
            <Button size="sm" variant="ghost" onClick={() => { setSearch(''); setFilterCategory(''); }}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Documents grid */}
        {filteredDocs.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="font-medium text-foreground mb-1">Aucun document</p>
            <p className="text-sm text-muted-foreground mb-4">
              {section === 'trash' ? 'La corbeille est vide' : 'Ajoutez votre premier document'}
            </p>
            {section !== 'trash' && (
              <Button onClick={() => setShowUpload(true)} size="sm" className="gap-1.5">
                <Upload className="w-3.5 h-3.5" /> Ajouter un document
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {filteredDocs.map(doc => (
              <DocumentCard
                key={doc.id}
                document={doc}
                folders={folders}
                onPreview={setPreviewDoc}
                onDeleted={refresh}
                onMoved={refresh}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modals */}
      {showUpload && (
        <DocumentUploadModal
          folders={folders}
          currentFolderId={inFolder ? section : ''}
          userEmail={user?.email}
          onClose={() => setShowUpload(false)}
          onUploaded={refresh}
        />
      )}
      {showFolderModal && (
        <FolderModal
          userEmail={user?.email}
          folder={editingFolder}
          onClose={() => { setShowFolderModal(false); setEditingFolder(null); }}
          onSaved={refresh}
        />
      )}
      {previewDoc && (
        <DocumentPreviewModal document={previewDoc} onClose={() => setPreviewDoc(null)} />
      )}
    </div>
  );
}