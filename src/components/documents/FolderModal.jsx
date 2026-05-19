import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, FolderPlus } from 'lucide-react';

const COLORS = ['#C9A646', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#6B7280'];

export default function FolderModal({ userEmail, folder, onClose, onSaved }) {
  const [name, setName] = useState(folder?.name || '');
  const [color, setColor] = useState(folder?.color || '#C9A646');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    if (folder) {
      await base44.entities.Folder.update(folder.id, { name, color });
    } else {
      await base44.entities.Folder.create({ name, color, user_email: userEmail, is_system: false });
    }
    setSaving(false);
    onSaved();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border/40">
          <h2 className="font-bold text-lg flex items-center gap-2">
            <FolderPlus className="w-5 h-5 text-primary" />
            {folder ? 'Renommer le dossier' : 'Nouveau dossier'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="space-y-1.5">
            <Label>Nom du dossier</Label>
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Factures Janvier" required autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label>Couleur</Label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button key={c} type="button" onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${color === c ? 'border-foreground scale-110' : 'border-transparent'}`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Annuler</Button>
            <Button type="submit" disabled={saving || !name} className="flex-1">
              {saving ? 'Enregistrement...' : folder ? 'Renommer' : 'Créer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}