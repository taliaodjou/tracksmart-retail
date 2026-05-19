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
  Upload, FolderPlus, Search, Folder, FolderOpen, Trash2, ChevronRight,
  FileText, Camera, Filter, X, MoreVertical, Edit2
} from 'lucide-react';

const SYSTEM_SECTIONS = [
  { id: 'all', label: 'Tous les documents', icon: FileText },
  { id: 'trash', label: 'Corbeille', icon: Trash2 },
];

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
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
    // Move docs out of folder first
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

  const totalSize = useMemo(() => {
    const bytes = documents.filter(d => !d.is_deleted).reduce((sum, d) => sum + (d.file_size || 0), 0);
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }, [documents]);

  const trashCount = documents.filter(d => d.is_deleted).length;
  const currentSectionLabel = section === 'all' ? 'Tous les documents'
    : section === 'trash' ? 'Corbeille'
    : folders.find(f => f.id === section)?.name || '';

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border/40">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Folder className="w-4 h-4 text-primary" />
          </div>
          <span className="font-bold text-sm">Documents</span>
        </div>
        <Button size="sm" className="w-full gap-1.5 text-xs" onClick={() => { setShowUpload(true); setSidebarOpen(false); }}>
          <Upload className="w-3.5 h-3.5" /> Ajouter un document
        </Button>
        <Button size="sm" variant="outline" className="w-full gap-1.5 text-xs mt-2" onClick={() => { setShowFolderModal(true); setEditingFolder(null); setSidebarOpen(false); }}>
          <FolderPlus className="w-3.5 h-3.5" /> Nouveau dossier
        </Button>
      </div>

      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {SYSTEM_SECTIONS.map(s => {
          const Icon = s.icon;
          const active = section === s.id;
          return (
            <button key={s.id} onClick={() => { setSection(s.id); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-sm transition-colors ${active ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary text-foreground'}`}
            >
              <div className="flex items-center gap-2">
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{s.label}</span>
              </div>
              {s.id === 'trash' && trashCount > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{trashCount}</span>
              )}
            </button>
          );
        })}

        {folders.length > 0 && (
          <div className="pt-3 pb-1">
            <p className="text-xs font-medium text-muted-foreground px-3 mb-1">Mes dossiers</p>
            {folders.map(folder => {
              const active = section === folder.id;
              const count = documents.filter(d => !d.is_deleted && d.folder_id === folder.id).length;
              return (
                <div key={folder.id} className={`flex items-center group rounded-xl transition-colors ${active ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary'}`}>
                  <button onClick={() => { setSection(folder.id); setSidebarOpen(false); }}
                    className="flex-1 flex items-center gap-2 px-3 py-2 text-sm"
                  >
                    <Folder className="w-4 h-4 flex-shrink-0" style={{ color: active ? 'white' : folder.color }} />
                    <span className="truncate">{folder.name}</span>
                    {count > 0 && (
                      <span className={`ml-auto text-xs px-1.5 py-0.5 rounded-full ${active ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{count}</span>
                    )}
                  </button>
                  <div className="relative pr-1">
                    <button onClick={(e) => { e.stopPropagation(); setFolderMenu(folderMenu === folder.id ? null : folder.id); }}
                      className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity ${active ? 'hover:bg-primary-foreground/20' : 'hover:bg-border'}`}
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>
                    {folderMenu === folder.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setFolderMenu(null)} />
                        <div className="absolute left-0 top-7 z-20 bg-white border border-border rounded-xl shadow-lg py-1 min-w-[130px]">
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
      </nav>

      <div className="p-4 border-t border-border/40">
        <p className="text-xs text-muted-foreground">Stockage utilisé</p>
        <p className="text-sm font-semibold mt-0.5">{totalSize}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-secondary/30">
      <DashboardHeader />

      <div className="pt-14 sm:pt-16 flex h-screen">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-border/40 flex-shrink-0 fixed left-0 top-14 sm:top-16 bottom-0 overflow-hidden z-20">
          <SidebarContent />
        </aside>

        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40 flex">
            <div className="fixed inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
            <div className="relative w-72 bg-white h-full shadow-2xl flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-border/40">
                <span className="font-bold">Documents</span>
                <button onClick={() => setSidebarOpen(false)}><X className="w-5 h-5" /></button>
              </div>
              <div className="flex-1 overflow-hidden">
                <SidebarContent />
              </div>
            </div>
          </div>
        )}

        {/* Main */}
        <main className="flex-1 lg:ml-64 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl hover:bg-white border border-border/40 transition-colors">
                  <Folder className="w-5 h-5 text-primary" />
                </button>
                <div>
                  <h1 className="text-xl font-bold text-foreground">{currentSectionLabel}</h1>
                  <p className="text-xs text-muted-foreground mt-0.5">{filteredDocs.length} document{filteredDocs.length !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" onClick={() => setShowUpload(true)} className="gap-1.5 hidden sm:flex">
                  <Upload className="w-3.5 h-3.5" /> Ajouter
                </Button>
                <Button size="icon" onClick={() => setShowUpload(true)} className="sm:hidden w-9 h-9">
                  <Upload className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Search & filters */}
            <div className="flex gap-2 mb-5 flex-wrap">
              <div className="relative flex-1 min-w-48">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Rechercher un document..."
                  className="pl-9 bg-white"
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
              <div className="text-center py-20">
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
          </div>
        </main>
      </div>

      {/* Modals */}
      {showUpload && (
        <DocumentUploadModal
          folders={folders}
          currentFolderId={section !== 'all' && section !== 'trash' ? section : ''}
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