import React, { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardFooter from '@/components/dashboard/DashboardFooter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { isAdmin } from '@/lib/productUtils';
import {
  Upload, Database, Search, Trash2, CheckCircle2,
  Loader2, FileSpreadsheet, AlertCircle, X, TriangleAlert
} from 'lucide-react';
import { toast } from 'sonner';

// ── parse date from various formats ──────────────────────
function parseDate(val) {
  if (!val) return '';
  const s = String(val).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const dmy = s.match(/^(\d{1,2})[\/\.\-](\d{1,2})[\/\.\-](\d{4})$/);
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2,'0')}-${dmy[1].padStart(2,'0')}`;
  if (/^\d{5}$/.test(s)) {
    const d = new Date((parseInt(s) - 25569) * 86400000);
    if (!isNaN(d)) return d.toISOString().split('T')[0];
  }
  const d = new Date(s);
  if (!isNaN(d)) return d.toISOString().split('T')[0];
  return '';
}

// ── map raw header to field key ────────────────────────── 
const FIELD_ALIASES = {
  barcode: ['barcode','ean','ean13','ean_13','upc','code barre','code-barre','codebarre','gtin'],
  name: ['name','nom','produit','product','libellé','designation','article'],
  brand: ['brand','marque','marques','fabricant','manufacturer'],
  category: ['category','categorie','catégorie','type'],
  default_rayon: ['rayon','rayons','shelf','section','emplacement'],
  default_price_chf: ['prix','price','chf','prix chf','price chf','cout','coût'],
};

function detectHeader(h) {
  const norm = h.toLowerCase().trim().replace(/[-_\s]/g,'');
  for (const [field, aliases] of Object.entries(FIELD_ALIASES)) {
    if (aliases.some(a => norm === a.replace(/[-_\s]/g,'') || norm.includes(a.replace(/[-_\s]/g,'')))) return field;
  }
  return null;
}

// ── normalize category string to enum ─────────────────────
const CAT_MAP = {
  snacks:'snacks', boissons:'boissons', beverages:'boissons',
  'congeles poisson':'congeles_poisson', 'congelés poisson':'congeles_poisson',
  'congeles poulet':'congeles_poulet', 'congelés poulet':'congeles_poulet',
  'produits frais':'produits_frais', frais:'produits_frais', fresh:'produits_frais',
  'epicerie seche':'epicerie_seche', 'épicerie sèche':'epicerie_seche',
  confiseries:'confiseries', conserves:'conserves',
  'hygiene beaute':'hygiene_beaute', hygiene:'hygiene_beaute',
  'entretien maison':'entretien_maison', bebe:'bebe', baby:'bebe',
  animaux:'animaux', pets:'animaux', alcool:'alcool', tabac:'tabac',
};
function normCat(v) {
  if (!v) return '';
  const k = v.toLowerCase().trim().replace(/\s+/,' ');
  return CAT_MAP[k] || '';
}
function normRayon(v) {
  if (!v) return '';
  const n = parseInt(String(v).replace(/\D/g,''));
  return (n >= 1 && n <= 15) ? String(n) : '';
}

export default function BarcodeDatabase() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const fileRef = useRef();

  const [search, setSearch] = useState('');
  const [preview, setPreview] = useState(null); // {items, errors}
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);

  const { data: barcodes = [], isLoading } = useQuery({
    queryKey: ['barcodes'],
    queryFn: () => base44.entities.BarcodeProduct.list('-created_date', 500),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BarcodeProduct.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['barcodes'] }),
  });

  const filtered = barcodes.filter(b => {
    const q = search.toLowerCase();
    return !q || b.barcode?.includes(q) || b.name?.toLowerCase().includes(q) || b.brand?.toLowerCase().includes(q);
  });

  // ── Parse uploaded file via ExtractDataFromUploadedFile ──
  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setUploading(true);
    setPreview(null);

    const { file_url } = await base44.integrations.Core.UploadFile({ file });

    const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
      file_url,
      json_schema: {
        type: 'object',
        properties: {
          rows: {
            type: 'array',
            items: { type: 'object', additionalProperties: { type: 'string' } }
          }
        }
      },
    });

    setUploading(false);

    if (result.status !== 'success' || !result.output) {
      toast.error('Impossible de lire le fichier.');
      return;
    }

    const outputRows = Array.isArray(result.output) ? result.output : (result.output.rows || []);
    if (!outputRows.length) { toast.error('Fichier vide.'); return; }

    const headers = [...new Set(outputRows.flatMap(r => Object.keys(r)))];
    // Auto-detect mapping
    const mapping = {};
    headers.forEach(h => {
      const field = detectHeader(h);
      if (field && !(field in mapping)) mapping[field] = h;
    });

    const items = [];
    const errors = [];

    outputRows.forEach((row, i) => {
      const get = (field) => {
        const hdr = mapping[field];
        return hdr ? String(row[hdr] || '').trim() : '';
      };

      const barcode = get('barcode').replace(/\D/g, '');
      const name = get('name');

      if (!barcode || barcode.length < 6) {
        errors.push(`Ligne ${i + 2} : code-barres manquant ou invalide`);
        return;
      }
      if (!name) {
        errors.push(`Ligne ${i + 2} : nom du produit manquant`);
        return;
      }

      const rawPrice = get('default_price_chf').replace(',', '.');
      items.push({
        barcode,
        name,
        brand: get('brand') || undefined,
        category: normCat(get('category')) || undefined,
        default_rayon: normRayon(get('default_rayon')) || undefined,
        default_price_chf: rawPrice ? (parseFloat(rawPrice) || undefined) : undefined,
      });
    });

    setPreview({ items, errors });
    if (items.length === 0) toast.error('Aucun produit valide détecté.');
    else toast.success(`${items.length} produits détectés — vérifiez l'aperçu.`);
  };

  const handleConfirmImport = async () => {
    if (!preview?.items?.length) return;
    setImporting(true);
    await base44.entities.BarcodeProduct.bulkCreate(preview.items);
    queryClient.invalidateQueries({ queryKey: ['barcodes'] });
    toast.success(`✅ ${preview.items.length} codes-barres importés !`);
    setPreview(null);
    setImporting(false);
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      <DashboardHeader />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Database className="w-7 h-7 text-primary" />
              Base de données EAN
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              {barcodes.length} produit(s) enregistré(s) — utilisés lors des scans
            </p>
          </div>
          <Button
            className="rounded-full gap-2"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
          >
            {uploading
              ? <><Loader2 className="w-4 h-4 animate-spin" /> Traitement…</>
              : <><Upload className="w-4 h-4" /> Importer CSV / Excel</>
            }
          </Button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={handleFile}
          />
        </div>

        {/* Format info */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm mb-6">
          <p className="font-semibold text-primary mb-1">📋 Colonnes reconnues automatiquement</p>
          <p className="text-xs text-muted-foreground">
            <strong>EAN / Barcode</strong> · <strong>Nom / Product</strong> · <strong>Marque / Brand</strong> ·
            <strong> Catégorie</strong> · <strong>Rayon</strong> · <strong>Prix CHF</strong>
          </p>
        </div>

        {/* Preview */}
        {preview && (
          <div className="bg-white rounded-2xl shadow-sm border border-border/40 overflow-hidden mb-6">
            <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between">
              <h2 className="font-semibold text-foreground">
                Aperçu — {preview.items.length} produit(s)
              </h2>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="rounded-full" onClick={() => setPreview(null)}>
                  <X className="w-4 h-4 mr-1" /> Annuler
                </Button>
                <Button size="sm" className="rounded-full gap-1.5" onClick={handleConfirmImport} disabled={importing || preview.items.length === 0}>
                  {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Confirmer l'import
                </Button>
              </div>
            </div>

            {preview.errors.length > 0 && (
              <div className="mx-5 mt-4 bg-red-50 border border-red-200 rounded-xl p-3">
                <p className="text-red-700 font-medium text-sm flex items-center gap-1.5 mb-1">
                  <TriangleAlert className="w-4 h-4" /> {preview.errors.length} ligne(s) ignorée(s)
                </p>
                {preview.errors.slice(0, 5).map((e, i) => (
                  <p key={i} className="text-xs text-red-600">• {e}</p>
                ))}
              </div>
            )}

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/40">
                  <tr>
                    {['EAN', 'Nom', 'Marque', 'Catégorie', 'Rayon', 'Prix CHF'].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 font-semibold text-xs text-foreground whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.items.slice(0, 20).map((item, i) => (
                    <tr key={i} className="border-t border-border/30 hover:bg-secondary/20">
                      <td className="px-4 py-2.5 font-mono text-xs text-primary">{item.barcode}</td>
                      <td className="px-4 py-2.5 font-medium text-foreground">{item.name}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{item.brand || '—'}</td>
                      <td className="px-4 py-2.5 text-muted-foreground text-xs">{item.category || '—'}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{item.default_rayon ? `R${item.default_rayon}` : '—'}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{item.default_price_chf ? `${item.default_price_chf}` : '—'}</td>
                    </tr>
                  ))}
                  {preview.items.length > 20 && (
                    <tr className="border-t border-border/30">
                      <td colSpan={6} className="px-4 py-3 text-center text-muted-foreground text-xs">
                        +{preview.items.length - 20} autres lignes…
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Search + table */}
        <div className="bg-white rounded-2xl shadow-sm border border-border/40 overflow-hidden">
          <div className="px-5 py-4 border-b border-border/40">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Rechercher par EAN, nom, marque…"
                className="pl-9 rounded-full"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-7 h-7 text-primary animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground text-sm">
              <Database className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>{search ? 'Aucun résultat' : 'Aucun code-barres enregistré.'}</p>
              <p className="text-xs mt-1">Importez un fichier CSV/Excel pour commencer.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/40">
                  <tr>
                    {['EAN', 'Nom', 'Marque', 'Catégorie', 'Rayon', 'Prix CHF', ''].map((h, i) => (
                      <th key={i} className="text-left px-4 py-2.5 font-semibold text-xs text-foreground whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(b => (
                    <tr key={b.id} className="border-t border-border/30 hover:bg-secondary/20">
                      <td className="px-4 py-2.5 font-mono text-xs text-primary">{b.barcode}</td>
                      <td className="px-4 py-2.5 font-medium text-foreground">{b.name}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{b.brand || '—'}</td>
                      <td className="px-4 py-2.5 text-muted-foreground text-xs">{b.category || '—'}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{b.default_rayon ? `R${b.default_rayon}` : '—'}</td>
                      <td className="px-4 py-2.5 text-muted-foreground">{b.default_price_chf || '—'}</td>
                      <td className="px-4 py-2.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-400 hover:text-red-600"
                          onClick={() => deleteMutation.mutate(b.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <DashboardFooter />
    </div>
  );
}