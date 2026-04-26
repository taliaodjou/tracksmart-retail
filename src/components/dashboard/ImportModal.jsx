import React, { useState, useRef } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import {
  Upload, X, FileSpreadsheet, AlertCircle, CheckCircle2,
  Download, ChevronRight, Loader2, TriangleAlert
} from 'lucide-react';
import { categoryKeys, rayonKeys } from '@/lib/productUtils';

const REQUIRED_FIELDS = ['name', 'expiration_date'];
const ALL_FIELDS = [
  { key: 'name', labelFr: 'Nom du produit', labelEn: 'Product name', required: true },
  { key: 'expiration_date', labelFr: 'Date d\'expiration', labelEn: 'Expiration date', required: true },
  { key: 'category', labelFr: 'Catégorie', labelEn: 'Category', required: false },
  { key: 'rayon', labelFr: 'Rayon', labelEn: 'Store section', required: false },
  { key: 'quantity', labelFr: 'Quantité', labelEn: 'Quantity', required: false },
];

// Smart auto-detect: try to match column headers to our fields
const AUTO_DETECT_ALIASES = {
  name: ['nom', 'produit', 'product', 'name', 'article', 'libellé', 'libelle', 'designation'],
  expiration_date: ['dlc', 'date', 'expir', 'expiration', 'peremption', 'péremption', 'bbf', 'best before'],
  category: ['categ', 'category', 'categorie', 'catégorie', 'type'],
  rayon: ['rayon', 'section', 'rayon/section', 'emplacement', 'location'],
  quantity: ['qte', 'qty', 'quantite', 'quantité', 'quantity', 'stock', 'nb'],
};

function detectField(header) {
  const h = header.toLowerCase().trim();
  for (const [field, aliases] of Object.entries(AUTO_DETECT_ALIASES)) {
    if (aliases.some(a => h.includes(a) || a.includes(h))) return field;
  }
  return '';
}

function parseDate(raw) {
  if (!raw) return null;
  const str = String(raw).trim();
  // ISO
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  // DD/MM/YYYY or DD.MM.YYYY
  const dmy = str.match(/^(\d{1,2})[\/\.\-](\d{1,2})[\/\.\-](\d{4})$/);
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;
  // Excel serial number
  if (/^\d+$/.test(str)) {
    const serial = parseInt(str);
    const date = new Date((serial - 25569) * 86400 * 1000);
    if (!isNaN(date)) return date.toISOString().split('T')[0];
  }
  // JS date parse fallback
  const d = new Date(str);
  if (!isNaN(d)) return d.toISOString().split('T')[0];
  return null;
}

function normalizeCategoryValue(raw) {
  if (!raw) return '';
  const lower = raw.toLowerCase().trim();
  const map = {
    snacks: 'snacks', snack: 'snacks',
    beverages: 'beverages', boissons: 'beverages', boisson: 'beverages', drinks: 'beverages',
    dry_groceries: 'dry_groceries', 'épicerie sèche': 'dry_groceries', 'epicerie seche': 'dry_groceries', epicerie: 'dry_groceries',
    fresh_products: 'fresh_products', frais: 'fresh_products', 'produits frais': 'fresh_products',
    frozen_products: 'frozen_products', congelés: 'frozen_products', congeles: 'frozen_products', 'produits congelés': 'frozen_products',
  };
  return map[lower] || '';
}

function normalizeRayonValue(raw) {
  if (!raw) return '';
  const lower = raw.toLowerCase().trim();
  const map = {
    boissons: 'boissons', boisson: 'boissons', beverages: 'boissons', drinks: 'boissons',
    snacks: 'snacks', snack: 'snacks',
    'produits frais': 'produits_frais', frais: 'produits_frais', fresh: 'produits_frais',
    congelateur: 'congelateur', 'congélateur': 'congelateur', freezer: 'congelateur',
    caisse: 'caisse', checkout: 'caisse', caisse: 'caisse',
  };
  return map[lower] || '';
}

// Download CSV template
function downloadTemplate() {
  const headers = ['Nom du produit', 'Catégorie', 'Rayon', 'Date d\'expiration', 'Quantité'];
  const examples = [
    ['Lait entier', 'fresh_products', 'produits_frais', '2026-05-10', '12'],
    ['Coca-Cola 1.5L', 'beverages', 'boissons', '2026-12-31', '24'],
    ['Chips barbecue', 'snacks', 'snacks', '2026-08-15', '36'],
  ];
  const csv = [headers, ...examples].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'tracksmart_modele.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export default function ImportModal({ onClose, onImported }) {
  const { t, lang } = useLanguage();
  const fileRef = useRef();

  const [step, setStep] = useState('upload'); // upload | map | preview | importing | done
  const [rawData, setRawData] = useState(null);   // { headers, rows }
  const [mapping, setMapping] = useState({});      // { fieldKey: columnIndex }
  const [preview, setPreview] = useState([]);       // validated rows
  const [errors, setErrors] = useState([]);         // { row, field, msg }
  const [importing, setImporting] = useState(false);
  const [importCount, setImportCount] = useState(0);
  const [parseError, setParseError] = useState('');

  // ── Step 1: File upload ──────────────────────────────────────────────────
  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setParseError('');

    try {
      // Upload file and use ExtractDataFromUploadedFile integration
      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      const schema = {
        type: 'object',
        properties: {
          rows: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                nom_produit: { type: 'string' },
                categorie: { type: 'string' },
                rayon: { type: 'string' },
                date_expiration: { type: 'string' },
                quantite: { type: 'string' },
              },
            },
          },
          headers: { type: 'array', items: { type: 'string' } },
        },
      };

      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url,
        json_schema: {
          type: 'object',
          properties: {
            headers: { type: 'array', items: { type: 'string' } },
            rows: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: { type: 'string' },
              },
            },
          },
        },
      });

      if (result.status !== 'success' || !result.output) {
        setParseError(lang === 'fr' ? 'Impossible de lire le fichier. Vérifiez le format.' : 'Could not read the file. Check the format.');
        return;
      }

      const { headers = [], rows = [] } = result.output;
      if (!headers.length || !rows.length) {
        setParseError(lang === 'fr' ? 'Le fichier est vide ou mal formaté.' : 'The file is empty or badly formatted.');
        return;
      }

      // Auto-detect mapping
      const autoMapping = {};
      headers.forEach((h, idx) => {
        const field = detectField(h);
        if (field && !(field in autoMapping)) autoMapping[field] = idx;
      });

      setRawData({ headers, rows });
      setMapping(autoMapping);
      setStep('map');
    } catch (err) {
      setParseError(lang === 'fr' ? 'Erreur lors de la lecture du fichier.' : 'Error reading the file.');
    }
  };

  // ── Step 2: Confirm mapping → build preview ───────────────────────────────
  const handleConfirmMapping = () => {
    const { headers, rows } = rawData;
    const validated = [];
    const errs = [];

    rows.forEach((row, ri) => {
      const rowValues = headers.map((h) => row[h] ?? '');
      const entry = {};
      let rowErrors = [];

      ALL_FIELDS.forEach(({ key, required }) => {
        const colIdx = mapping[key];
        const raw = colIdx !== undefined ? rowValues[colIdx] : '';

        if (key === 'expiration_date') {
          const parsed = parseDate(raw);
          if (!parsed && required) rowErrors.push({ row: ri + 1, field: key, msg: lang === 'fr' ? 'Date invalide' : 'Invalid date' });
          entry[key] = parsed || '';
        } else if (key === 'category') {
          entry[key] = normalizeCategoryValue(raw);
        } else if (key === 'rayon') {
          entry[key] = normalizeRayonValue(raw);
        } else if (key === 'quantity') {
          entry[key] = raw ? Number(raw) || '' : '';
        } else {
          if (!raw && required) rowErrors.push({ row: ri + 1, field: key, msg: lang === 'fr' ? 'Champ requis manquant' : 'Required field missing' });
          entry[key] = raw;
        }
      });

      if (rowErrors.length) errs.push(...rowErrors);
      else validated.push(entry);
    });

    setErrors(errs);
    setPreview(validated);
    setStep('preview');
  };

  // ── Step 3: Import ────────────────────────────────────────────────────────
  const handleImport = async () => {
    setImporting(true);
    await base44.entities.Product.bulkCreate(preview);
    setImportCount(preview.length);
    setImporting(false);
    setStep('done');
    onImported();
  };

  const fieldLabel = (f) => lang === 'fr' ? f.labelFr : f.labelEn;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-bold text-lg text-foreground">
              {lang === 'fr' ? 'Importer un fichier Excel / CSV' : 'Import Excel / CSV file'}
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 space-y-5">
          {/* ── STEP: UPLOAD ── */}
          {step === 'upload' && (
            <div className="space-y-5">
              {/* Template download */}
              <div className="flex items-center justify-between bg-secondary/50 rounded-xl p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {lang === 'fr' ? 'Télécharger le modèle' : 'Download template'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {lang === 'fr' ? 'CSV avec les colonnes requises' : 'CSV with required columns'}
                  </p>
                </div>
                <Button variant="outline" size="sm" className="rounded-full gap-2" onClick={downloadTemplate}>
                  <Download className="w-4 h-4" />
                  {lang === 'fr' ? 'Modèle CSV' : 'CSV Template'}
                </Button>
              </div>

              {/* Drop zone */}
              <div
                className="border-2 border-dashed border-border rounded-2xl p-10 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
                onClick={() => fileRef.current.click()}
              >
                <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium text-foreground mb-1">
                  {lang === 'fr' ? 'Cliquez pour choisir un fichier' : 'Click to choose a file'}
                </p>
                <p className="text-xs text-muted-foreground">.xlsx, .csv acceptés</p>
                <input ref={fileRef} type="file" accept=".xlsx,.csv,.xls" className="hidden" onChange={handleFile} />
              </div>

              {parseError && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-xl p-4">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {parseError}
                </div>
              )}
            </div>
          )}

          {/* ── STEP: MAP ── */}
          {step === 'map' && rawData && (
            <div className="space-y-5">
              <p className="text-sm text-muted-foreground">
                {lang === 'fr'
                  ? `${rawData.rows.length} ligne(s) détectée(s). Associez les colonnes de votre fichier aux champs TrackSmart.`
                  : `${rawData.rows.length} row(s) detected. Map your file columns to TrackSmart fields.`}
              </p>

              <div className="space-y-3">
                {ALL_FIELDS.map((field) => (
                  <div key={field.key} className="flex items-center gap-3">
                    <div className="w-44 flex-shrink-0">
                      <span className="text-sm font-medium text-foreground">{fieldLabel(field)}</span>
                      {field.required && <span className="ml-1 text-red-500 text-xs">*</span>}
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <Select
                      value={mapping[field.key] !== undefined ? String(mapping[field.key]) : '__none__'}
                      onValueChange={(v) => {
                        const updated = { ...mapping };
                        if (v === '__none__') delete updated[field.key];
                        else updated[field.key] = parseInt(v);
                        setMapping(updated);
                      }}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder={lang === 'fr' ? 'Choisir colonne…' : 'Choose column…'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">{lang === 'fr' ? '— Ignorer —' : '— Ignore —'}</SelectItem>
                        {rawData.headers.map((h, idx) => (
                          <SelectItem key={idx} value={String(idx)}>{h}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>

              {/* Preview of first 2 rows */}
              <div className="bg-secondary/40 rounded-xl p-3 overflow-x-auto">
                <p className="text-xs font-medium text-muted-foreground mb-2">
                  {lang === 'fr' ? 'Aperçu (2 premières lignes)' : 'Preview (first 2 rows)'}
                </p>
                <table className="text-xs w-full">
                  <thead>
                    <tr>
                      {rawData.headers.map((h, i) => (
                        <th key={i} className="text-left px-2 py-1 text-muted-foreground font-medium">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rawData.rows.slice(0, 2).map((row, ri) => (
                      <tr key={ri} className="border-t border-border/30">
                        {rawData.headers.map((h, ci) => (
                          <td key={ci} className="px-2 py-1 text-foreground">{row[h] || '—'}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" className="rounded-full" onClick={() => setStep('upload')}>
                  {t('back')}
                </Button>
                <Button
                  className="rounded-full gap-2"
                  disabled={!REQUIRED_FIELDS.every(f => mapping[f] !== undefined)}
                  onClick={handleConfirmMapping}
                >
                  {lang === 'fr' ? 'Valider et prévisualiser' : 'Validate & preview'}
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ── STEP: PREVIEW ── */}
          {step === 'preview' && (
            <div className="space-y-5">
              {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-1.5">
                  <div className="flex items-center gap-2 text-red-700 font-medium text-sm mb-2">
                    <TriangleAlert className="w-4 h-4" />
                    {lang === 'fr' ? `${errors.length} erreur(s) détectée(s) — ces lignes seront ignorées` : `${errors.length} error(s) found — these rows will be skipped`}
                  </div>
                  {errors.slice(0, 6).map((e, i) => (
                    <p key={i} className="text-xs text-red-600">
                      {lang === 'fr' ? `Ligne ${e.row} — ${e.msg}` : `Row ${e.row} — ${e.msg}`}
                    </p>
                  ))}
                  {errors.length > 6 && (
                    <p className="text-xs text-red-500">+{errors.length - 6} {lang === 'fr' ? 'autres erreurs' : 'more errors'}</p>
                  )}
                </div>
              )}

              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl p-4">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-800 font-medium">
                  {lang === 'fr'
                    ? `${preview.length} produit(s) prêt(s) à importer`
                    : `${preview.length} product(s) ready to import`}
                </span>
              </div>

              {/* Preview table */}
              <div className="overflow-x-auto border border-border/40 rounded-xl">
                <table className="text-xs w-full">
                  <thead className="bg-secondary/50">
                    <tr>
                      {ALL_FIELDS.map(f => (
                        <th key={f.key} className="text-left px-3 py-2 font-semibold text-foreground">{fieldLabel(f)}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.slice(0, 8).map((row, i) => (
                      <tr key={i} className="border-t border-border/30 hover:bg-secondary/20">
                        {ALL_FIELDS.map(f => (
                          <td key={f.key} className="px-3 py-2 text-foreground">{row[f.key] || '—'}</td>
                        ))}
                      </tr>
                    ))}
                    {preview.length > 8 && (
                      <tr className="border-t border-border/30">
                        <td colSpan={ALL_FIELDS.length} className="px-3 py-2 text-xs text-muted-foreground text-center">
                          +{preview.length - 8} {lang === 'fr' ? 'lignes supplémentaires' : 'more rows'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" className="rounded-full" onClick={() => setStep('map')}>
                  {t('back')}
                </Button>
                <Button
                  className="rounded-full gap-2"
                  disabled={preview.length === 0 || importing}
                  onClick={handleImport}
                >
                  {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {lang === 'fr' ? `Importer ${preview.length} produit(s)` : `Import ${preview.length} product(s)`}
                </Button>
              </div>
            </div>
          )}

          {/* ── STEP: DONE ── */}
          {step === 'done' && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-foreground">
                {lang === 'fr' ? 'Importation réussie !' : 'Import successful!'}
              </h3>
              <p className="text-muted-foreground">
                {lang === 'fr'
                  ? `${importCount} produit(s) ajouté(s) à votre tableau de bord.`
                  : `${importCount} product(s) added to your dashboard.`}
              </p>
              <Button className="rounded-full px-8" onClick={onClose}>
                {lang === 'fr' ? 'Fermer' : 'Close'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}