import React, { useState, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Upload, Camera, FileText, Loader2 } from 'lucide-react';

const CATEGORIES = [
  { value: 'facture', label: 'Facture' },
  { value: 'bon_livraison', label: 'Bon de livraison' },
  { value: 'contrat', label: 'Contrat' },
  { value: 'rapport', label: 'Rapport' },
  { value: 'tva', label: 'TVA' },
  { value: 'fiduciaire', label: 'Fiduciaire' },
  { value: 'fournisseur', label: 'Fournisseur' },
  { value: 'produit', label: 'Produit' },
  { value: 'autre', label: 'Autre' },
];

export default function DocumentUploadModal({ folders, currentFolderId, userEmail, onClose, onUploaded }) {
  const [file, setFile] = useState(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('autre');
  const [folderId, setFolderId] = useState(currentFolderId || '');
  const [supplierName, setSupplierName] = useState('');
  const [amount, setAmount] = useState('');
  const [documentDate, setDocumentDate] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFile = (f) => {
    setFile(f);
    if (!name) setName(f.name.replace(/\.[^/.]+$/, ''));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);

    const { file_url } = await base44.integrations.Core.UploadFile({ file });

    await base44.entities.Document.create({
      name: name || file.name,
      file_url,
      file_type: file.type,
      file_size: file.size,
      category,
      folder_id: folderId || null,
      user_email: userEmail,
      supplier_name: supplierName || null,
      amount: amount ? parseFloat(amount) : null,
      document_date: documentDate || null,
      is_deleted: false,
    });

    setUploading(false);
    onUploaded();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl shadow-2xl max-h-[95vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border/40">
          <h2 className="font-bold text-lg">Ajouter un document</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Drop zone */}
          {!file ? (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${dragOver ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}`}
            >
              <div className="flex flex-col items-center gap-3">
                <Upload className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Glissez un fichier ici ou</p>
                <div className="flex gap-2 flex-wrap justify-center">
                  <Button type="button" size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="w-3.5 h-3.5" /> Choisir un fichier
                  </Button>
                  <Button type="button" size="sm" variant="outline" onClick={() => cameraInputRef.current?.click()}>
                    <Camera className="w-3.5 h-3.5" /> Scanner
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground/60">PDF, JPG, PNG, DOCX, XLSX, CSV</p>
              </div>
              <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.docx,.xlsx,.csv" className="hidden" onChange={e => e.target.files[0] && handleFile(e.target.files[0])} />
              <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={e => e.target.files[0] && handleFile(e.target.files[0])} />
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-secondary/40 rounded-xl border border-border/40">
              <FileText className="w-8 h-8 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(0)} KB</p>
              </div>
              <button type="button" onClick={() => setFile(null)} className="p-1 rounded hover:bg-border transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Name */}
          <div className="space-y-1.5">
            <Label className="text-sm">Nom du document</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Facture Metro Janvier 2025" required />
          </div>

          {/* Category & Folder */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm">Type</Label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm">
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Dossier</Label>
              <select value={folderId} onChange={e => setFolderId(e.target.value)} className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm">
                <option value="">Aucun dossier</option>
                {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
          </div>

          {/* Optional fields */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-sm">Fournisseur</Label>
              <Input value={supplierName} onChange={e => setSupplierName(e.target.value)} placeholder="Ex: Metro" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm">Montant (CHF)</Label>
              <Input type="number" step="0.01" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-sm">Date du document</Label>
            <Input type="date" value={documentDate} onChange={e => setDocumentDate(e.target.value)} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Annuler</Button>
            <Button type="submit" disabled={!file || uploading} className="flex-1">
              {uploading ? <><Loader2 className="w-4 h-4 animate-spin" /> Upload...</> : <><Upload className="w-4 h-4" /> Enregistrer</>}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}