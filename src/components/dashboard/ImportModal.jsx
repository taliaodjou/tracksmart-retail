import React, { useState, useRef } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import { Upload, X, FileSpreadsheet, AlertCircle, CheckCircle2, Download, ChevronRight, Loader2, TriangleAlert } from 'lucide-react';

const REQUIRED_FIELDS = ['name', 'expiration_date'];
const ALL_FIELDS = [
  { key: 'name',            labelFr: 'Nom du produit',      labelEn: 'Product name',    required: true },
  { key: 'expiration_date', labelFr: "Date d'expiration",   labelEn: 'Expiration date', required: true },
  { key: 'category',        labelFr: 'Catégorie',           labelEn: 'Category',        required: false },
  { key: 'rayon',           labelFr: 'Rayon (1-15)',        labelEn: 'Section (1-15)',  required: false },
  { key: 'quantity',        labelFr: 'Quantité',            labelEn: 'Quantity',        required: false },
];

const AUTO_DETECT = {
  name:            ['nom', 'produit', 'product', 'name', 'article', 'libellé', 'designation'],
  expiration_date: ['dlc', 'date', 'expir', 'peremption', 'péremption', 'bbf', 'best before'],
  category:        ['categ', 'category', 'categorie', 'catégorie', 'type'],
  rayon:           ['rayon', 'section', 'emplacement', 'location'],
  quantity:        ['qte', 'qty', 'quantite', 'quantité', 'quantity', 'stock', 'nb'],
};

const CATEGORY_MAP = {
  snacks: 'snacks', snack: 'snacks',
  boissons: 'boissons', boisson: 'boissons', beverages: 'boissons', drinks: 'boissons',
  'congeles poisson': 'congeles_poisson', 'congelés poisson': 'congeles_poisson',
  'congeles poulet': 'congeles_poulet', 'congelés poulet': 'congeles_poulet',
  'produits frais': 'produits_frais', frais: 'produits_frais', fresh: 'produits_frais',
  'epicerie seche': 'epicerie_seche', 'épicerie sèche': 'epicerie_seche', epicerie: 'epicerie_seche',
  confiseries: 'confiseries', sucreries: 'confiseries', confectionery: 'confiseries',
  conserves: 'conserves', canned: 'conserves',
  'hygiene beaute': 'hygiene_beaute', hygiene: 'hygiene_beaute',
  'entretien maison': 'entretien_maison', entretien: 'entretien_maison',
  bebe: 'bebe', baby: 'bebe',
  animaux: 'animaux', pets: 'animaux',
  alcool: 'alcool', alcohol: 'alcool',
  tabac: 'tabac', tobacco: 'tabac',
};

function detectField(header) {
  const h = header.toLowerCase().trim();
  for (const [field, aliases] of Object.entries(AUTO_DETECT)) {
    if (aliases.some(a => h.includes(a) || a.includes(h))) return field;
  }
  return '';
}

function parseDate(raw) {
  if (!raw) return null;
  const str = String(raw).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  const dmy = str.match(/^(\d{1,2})[\/\.\-](\d{1,2})[\/\.\-](\d{4})$/);
  if (dmy) return `${dmy[3]}-${dmy[2].padStart(2,'0')}-${dmy[1].padStart(2,'0')}`;
  if (/^\d{5}$/.test(str)) {
    const d = new Date((parseInt(str) - 25569) * 86400 * 1000);
    if (!isNaN(d)) return d.toISOString().split('T')[0];
  }
  const d = new Date(str);
  if (!isNaN(d)) return d.toISOString().split('T')[0];
  return null;
}

function normalizeCategory(raw) {
  if (!raw) return '';
  return CATEGORY_MAP[raw.toLowerCase().trim()] || '';
}

function normalizeRayon(raw) {
  if (!raw) return '';
  const n = parseInt(raw.replace(/\D/g, ''));
  if (n >= 1 && n <= 15) return String(n);
  return '';
}

function downloadTemplate() {
  const headers = ['Nom du produit', 'Catégorie', 'Rayon', "Date d'expiration", 'Quantité'];
  const examples = [
    ['Lait entier', 'produits_frais', '3', '2026-05-10', '12'],
    ['Coca-Cola 1.5L', 'boissons', '1', '2026-12-31', '24'],
    ['Chips barbecue', 'snacks', '2', '2026-08-15', '36'],
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
  const [step, setStep] = useState('upload');
  const [rawData, setRawData] = useState(null);
  const [mapping, setMapping] = useState({});
  const [preview, setPreview] = useState([]);
  const [errors, setErrors] = useState([]);
  const [importing, setImporting] = useState(false);
  const [importCount, setImportCount] = useState(0);
  const [parseError, setParseError] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setParseError('');
    setUploading(true);

    const { file_url } = await base44.integrations.Core.UploadFile({ file });

    const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
      file_url,
      json_schema: {
        type: 'object',
        properties: {
          rows: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                name: { type: 'string' },
                expiration_date: { type: 'string' },
                category: { type: 'string' },
                rayon: { type: 'string' },
                quantity: { type: 'string' },
                marque: { type: 'string' },
                reception_date: { type: 'string' },
                price_chf: { type: 'string' },
              }
            }
          }
        }
      },
    });

    setUploading(false);

    if (result.status !== 'success' || !result.output) {
      setParseError(lang === 'fr' ? 'Impossible de lire le fichier.' : 'Could not read the file.');
      return;
    }

    // ExtractDataFromUploadedFile returns rows as array of objects with column names as keys
    // We need to detect headers from the first row's keys
    const outputRows = Array.isArray(result.output) ? result.output : (result.output.rows || []);

    if (!outputRows.length) {
      setParseError(lang === 'fr' ? 'Fichier vide ou mal formaté.' : 'File empty or badly formatted.');
      return;
    }

    // Get all unique column names from the data
    const headers = [...new Set(outputRows.flatMap(r => Object.keys(r)))];

    const autoMapping = {};
    headers.forEach((h, idx) => {
      const field = detectField(h);
      if (field && !(field in autoMapping)) autoMapping[field] = idx;
    });

    // Convert rows to array-indexed format
    const rows = outputRows.map(r => headers.map(h => r[h] ?? ''));

    setRawData({ headers, rows });
    setMapping(autoMapping);
    setStep('map');
  };

  const handleConfirmMapping = () => {
    const { headers, rows } = rawData;
    const validated = [];
    const errs = [];

    rows.forEach((row, ri) => {
      const rowValues = Array.isArray(row) ? row : headers.map(h => row[h] ?? '');
      const entry = {};
      const rowErrors = [];

      ALL_FIELDS.forEach(({ key, required }) => {
        const colIdx = mapping[key];
        const raw = colIdx !== undefined ? rowValues[colIdx] : '';

        if (key === 'expiration_date') {
          const parsed = parseDate(raw);
          if (!parsed) {
            if (required) rowErrors.push({ row: ri + 1, msg: lang === 'fr' ? 'Date invalide' : 'Invalid date' });
          }
          entry[key] = parsed || '';
        } else if (key === 'category') {
          entry[key] = normalizeCategory(raw);
        } else if (key === 'rayon') {
          entry[key] = normalizeRayon(raw);
        } else if (key === 'quantity') {
          entry[key] = raw ? Number(raw) || '' : '';
        } else {
          if (!raw && required) rowErrors.push({ row: ri + 1, msg: lang === 'fr' ? 'Nom manquant' : 'Name missing' });
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

  const handleImport = async () => {
    setImporting(true);
    await base44.entities.Product.bulkCreate(preview);
    setImportCount(preview.length);
    setImporting(false);
    setStep('done');
    onImported();
  };

  const fieldLabel = f => lang === 'fr' ? f.labelFr : f.labelEn;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-bold text-lg text-foreground">
              {lang === 'fr' ? 'Importer un fichier Excel / CSV' : 'Import Excel / CSV file'}
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>

        <div className="p-6 space-y-5">

          {/* UPLOAD */}
          {step === 'upload' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between bg-secondary/50 rounded-xl p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">{lang === 'fr' ? 'Télécharger le modèle CSV' : 'Download CSV template'}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{lang === 'fr' ? 'Colonnes préremplies' : 'Pre-filled columns'}</p>
                </div>
                <Button variant="outline" size="sm" className="rounded-full gap-2" onClick={downloadTemplate}>
                  <Download className="w-4 h-4" />
                  {lang === 'fr' ? 'Modèle' : 'Template'}
                </Button>
              </div>

              <div
                className="border-2 border-dashed border-border rounded-2xl p-10 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
                onClick={() => fileRef.current.click()}
              >
                {uploading
                  ? <Loader2 className="w-10 h-10 text-primary mx-auto mb-3 animate-spin" />
                  : <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                }
                <p className="font-medium text-foreground mb-1">
                  {uploading
                    ? (lang === 'fr' ? 'Lecture du fichier…' : 'Reading file…')
                    : (lang === 'fr' ? 'Cliquez pour choisir un fichier' : 'Click to choose a file')
                  }
                </p>
                <p className="text-xs text-muted-foreground">.xlsx, .csv acceptés</p>
                <input ref={fileRef} type="file" accept=".xlsx,.csv,.xls" className="hidden" onChange={handleFile} disabled={uploading} />
              </div>

              {parseError && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-xl p-4">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />{parseError}
                </div>
              )}
            </div>
          )}

          {/* MAP */}
          {step === 'map' && rawData && (
            <div className="space-y-5">
              <p className="text-sm text-muted-foreground">
                {lang === 'fr'
                  ? `${rawData.rows.length} ligne(s) détectée(s). Associez les colonnes.`
                  : `${rawData.rows.length} row(s) detected. Map the columns.`}
              </p>
              <div className="space-y-3">
                {ALL_FIELDS.map(field => (
                  <div key={field.key} className="flex items-center gap-3">
                    <div className="w-44 flex-shrink-0 text-sm font-medium text-foreground">
                      {fieldLabel(field)}{field.required && <span className="text-red-500 ml-1">*</span>}
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <Select
                      value={mapping[field.key] !== undefined ? String(mapping[field.key]) : '__none__'}
                      onValueChange={v => {
                        const m = { ...mapping };
                        if (v === '__none__') delete m[field.key]; else m[field.key] = parseInt(v);
                        setMapping(m);
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

              {/* Mini preview */}
              <div className="bg-secondary/40 rounded-xl p-3 overflow-x-auto">
                <p className="text-xs font-medium text-muted-foreground mb-2">{lang === 'fr' ? 'Aperçu (2 premières lignes)' : 'Preview (first 2 rows)'}</p>
                <table className="text-xs w-full">
                  <thead>
                    <tr>{rawData.headers.map((h, i) => <th key={i} className="text-left px-2 py-1 text-muted-foreground font-medium">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {rawData.rows.slice(0, 2).map((row, ri) => (
                      <tr key={ri} className="border-t border-border/30">
                        {rawData.headers.map((h, ci) => <td key={ci} className="px-2 py-1">{(Array.isArray(row) ? row[ci] : row[h]) || '—'}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" className="rounded-full" onClick={() => setStep('upload')}>{t('back')}</Button>
                <Button
                  className="rounded-full gap-2"
                  disabled={!REQUIRED_FIELDS.every(f => mapping[f] !== undefined)}
                  onClick={handleConfirmMapping}
                >
                  {lang === 'fr' ? 'Valider' : 'Validate'} <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* PREVIEW */}
          {step === 'preview' && (
            <div className="space-y-5">
              {errors.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-1">
                  <div className="flex items-center gap-2 text-red-700 font-medium text-sm">
                    <TriangleAlert className="w-4 h-4" />
                    {lang === 'fr' ? `${errors.length} ligne(s) ignorée(s)` : `${errors.length} row(s) skipped`}
                  </div>
                  {errors.slice(0, 5).map((e, i) => (
                    <p key={i} className="text-xs text-red-600">{lang === 'fr' ? `Ligne ${e.row} — ${e.msg}` : `Row ${e.row} — ${e.msg}`}</p>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl p-4">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-sm text-green-800 font-medium">
                  {lang === 'fr' ? `${preview.length} produit(s) prêt(s) à importer` : `${preview.length} product(s) ready to import`}
                </span>
              </div>

              <div className="overflow-x-auto border border-border/40 rounded-xl">
                <table className="text-xs w-full">
                  <thead className="bg-secondary/50">
                    <tr>{ALL_FIELDS.map(f => <th key={f.key} className="text-left px-3 py-2 font-semibold">{fieldLabel(f)}</th>)}</tr>
                  </thead>
                  <tbody>
                    {preview.slice(0, 8).map((row, i) => (
                      <tr key={i} className="border-t border-border/30">
                        {ALL_FIELDS.map(f => <td key={f.key} className="px-3 py-2">{row[f.key] || '—'}</td>)}
                      </tr>
                    ))}
                    {preview.length > 8 && (
                      <tr className="border-t border-border/30">
                        <td colSpan={ALL_FIELDS.length} className="px-3 py-2 text-center text-muted-foreground">
                          +{preview.length - 8} {lang === 'fr' ? 'lignes' : 'rows'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" className="rounded-full" onClick={() => setStep('map')}>{t('back')}</Button>
                <Button className="rounded-full gap-2" disabled={preview.length === 0 || importing} onClick={handleImport}>
                  {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {lang === 'fr' ? `Importer ${preview.length} produit(s)` : `Import ${preview.length} product(s)`}
                </Button>
              </div>
            </div>
          )}

          {/* DONE */}
          {step === 'done' && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold">{lang === 'fr' ? 'Importation réussie !' : 'Import successful!'}</h3>
              <p className="text-muted-foreground">
                {lang === 'fr' ? `${importCount} produit(s) ajouté(s).` : `${importCount} product(s) added.`}
              </p>
              <Button className="rounded-full px-8" onClick={onClose}>{t('close')}</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}