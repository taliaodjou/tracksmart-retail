import React, { useState, useRef } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';
import {
  Upload, X, FileSpreadsheet, AlertCircle, CheckCircle2,
  Download, ChevronRight, Loader2, TriangleAlert
} from 'lucide-react';

// ─── FIELD DEFINITIONS ──────────────────────────────────────────────────────
const FIELD_DEFS = [
  { key: 'name',            labelFr: 'Produit',           labelEn: 'Product',       required: true,
    aliases: ['produit', 'product', 'nom', 'name', 'article', 'libellé', 'designation'] },
  { key: 'marque',          labelFr: 'Marques',           labelEn: 'Brand',         required: false,
    aliases: ['marques', 'marque', 'brand', 'brands', 'fabricant'] },
  { key: 'category',        labelFr: 'Catégories',        labelEn: 'Categories',    required: false,
    aliases: ['catégories', 'categories', 'catégorie', 'category', 'categorie', 'type'] },
  { key: 'reception_date',  labelFr: 'Date réception',    labelEn: 'Reception date',required: false,
    aliases: ['date réception', 'date reception', 'reception_date', 'reception date', 'date arrivée', 'arrivée'] },
  { key: 'expiration_date', labelFr: 'DLC',               labelEn: 'Expiry date',   required: true,
    aliases: ['dlc', 'date expiration', 'expiration', 'expiry', 'best before', 'péremption', 'peremption', 'date limite'] },
  { key: 'rayon',           labelFr: 'Rayons',            labelEn: 'Section',       required: false,
    aliases: ['rayons', 'rayon', 'section', 'emplacement', 'location'] },
  { key: 'action',          labelFr: 'Action (si expiré)',labelEn: 'Action (if expired)', required: false,
    aliases: ['action', 'action si expiré', 'action si expire', 'action (si expiré)', 'action (si expire)'] },
  { key: 'order_date',      labelFr: 'Date de commande',  labelEn: 'Order date',    required: false,
    aliases: ['date de commande', 'order date', 'order_date', 'commande date', 'date commande'] },
  { key: 'quantity_thrown', labelFr: 'Quantité jetées',   labelEn: 'Thrown qty',    required: false,
    aliases: ['quantité jetées', 'quantite jetees', 'quantité jettées', 'quantité jetes', 'quantite jettes',
              'quantité jetée', 'qty thrown', 'thrown', 'quantite'] },
  { key: 'price_chf',       labelFr: 'Prix CHF',          labelEn: 'Price CHF',     required: false,
    aliases: ['prix chf', 'prix', 'price', 'chf', 'price chf', 'cout', 'coût'] },
];

// Columns that must never be imported (always recalculated)
const SKIP_COLUMNS = ['jours restants', 'statut', 'total chf', 'days remaining', 'status', 'total'];

const ACTION_MAP = {
  jeter: 'jeter', 'à jeter': 'jeter',
  'à recommander': 'a_recommander', 'a recommander': 'a_recommander', recommander: 'a_recommander',
  commandé: 'commande', commande: 'commande', ordered: 'commande',
  'en transition': 'en_transition', transition: 'en_transition',
  reçu: 'recu', recu: 'recu', received: 'recu',
};

// ─── PARSING UTILITIES ───────────────────────────────────────────────────────

function cleanField(val) {
  if (val === null || val === undefined) return '';
  const s = String(val).trim();
  if (s.startsWith('#')) return ''; // Excel errors: #VALUE!, #REF!, #N/A
  return s;
}

function parseExcelDate(val) {
  if (val === null || val === undefined || val === '') return '';

  // Excel error strings
  if (typeof val === 'string' && val.startsWith('#')) return '';
  if (typeof val === 'string' && ['fix', '/'].includes(val.trim())) return '';

  // JavaScript Date object
  if (val instanceof Date && !isNaN(val.getTime())) {
    return val.toISOString().slice(0, 10);
  }

  const s = String(val).trim();
  if (!s) return '';

  // YYYY-MM-DD already correct
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);

  // DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const dmy = s.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})$/);
  if (dmy) {
    const y = dmy[3].length === 2 ? '20' + dmy[3] : dmy[3];
    return `${y}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;
  }

  // Excel serial number — both numeric and string forms (e.g. 46156 or "46156")
  const num = parseFloat(s);
  if (!isNaN(num) && num > 1000 && num < 100000) {
    const date = new Date(Date.UTC(1899, 11, 30) + Math.round(num) * 86400000);
    if (!isNaN(date.getTime())) {
      const y = date.getUTCFullYear();
      const m = String(date.getUTCMonth() + 1).padStart(2, '0');
      const d = String(date.getUTCDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
  }

  return '';
}

function isSerialDate(val) {
  if (typeof val === 'number') return val > 1000 && val < 100000;
  const num = parseFloat(String(val).trim());
  return !isNaN(num) && num > 1000 && num < 100000;
}

function normalizeRayon(val) {
  if (!val) return '';
  const v = String(val).trim().toLowerCase();

  const rayonMatch = v.match(/rayon[_ ]?(\d+)/);
  if (rayonMatch) return String(parseInt(rayonMatch[1]));

  const frigoMatch = v.match(/frigo[_ ]?(\d+)/);
  if (frigoMatch) return `Frigo ${frigoMatch[1]}`;

  const conglMatch = v.match(/congl[_ ]?(\d+)|cong[eé]lateur[_ ]?(\d+)/);
  if (conglMatch) return `Congélateur ${conglMatch[1] || conglMatch[2]}`;

  // plain number → rayon number
  const n = parseInt(v);
  if (!isNaN(n) && n >= 1 && n <= 15) return String(n);

  return val;
}

function normalizeCategory(val) {
  if (!val) return 'epicerie_seche';
  const v = String(val).trim().toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  if (v.includes('snack')) return 'snacks';
  if (v.includes('glace')) return 'snacks';
  if (v.includes('boisson')) return 'boissons';
  if (v.includes('congel') && v.includes('poisson')) return 'congeles_poisson';
  if (v.includes('congel') && v.includes('poulet')) return 'congeles_poulet';
  if (v.includes('congel')) return 'congeles_poulet'; // generic frozen
  if (v.includes('frais')) return 'produits_frais';
  if (v.includes('epicerie') || v.includes('seche')) return 'epicerie_seche';
  if (v.includes('confiserie') || v.includes('sucrerie')) return 'confiseries';
  if (v.includes('conserve')) return 'conserves';
  if (v.includes('hygiene') || v.includes('beaute')) return 'hygiene_beaute';
  if (v.includes('entretien')) return 'entretien_maison';
  if (v.includes('bebe')) return 'bebe';
  if (v.includes('animal')) return 'animaux';
  if (v.includes('alcool') || v.includes('biere') || v.includes('vin') || v.includes('spirit')) return 'alcool';
  if (v.includes('tabac')) return 'tabac';

  return 'epicerie_seche';
}

function normalizeAction(raw) {
  if (!raw) return '';
  const k = raw.toLowerCase().trim();
  return ACTION_MAP[k] || '';
}

function detectField(header) {
  const h = header.toLowerCase().trim().replace(/[_\-]/g, ' ');
  // Skip calculated columns
  if (SKIP_COLUMNS.some(s => h === s || h.includes(s))) return '__skip__';
  for (const def of FIELD_DEFS) {
    if (def.aliases.some(a => h === a || h.includes(a) || a.includes(h))) return def.key;
  }
  return '';
}

// Only exact section title strings (with empty DLC) should be skipped
const SECTION_HEADER_RE = /^(rayon[_ ]?\d*|frigo[_ ]?\d*|cong[eé]lateur[_ ]?\d*|congl[_ ]?\d*)$/i;

function shouldSkipRow(rowValues, colMap) {
  // Rule 1: skip if ALL cells are empty/null/whitespace
  const hasAnyValue = rowValues.some(cell =>
    cell !== null && cell !== undefined && String(cell).trim() !== ''
  );
  if (!hasAnyValue) return true;

  // Rule 2: skip only if produit looks exactly like a section header AND dlc is empty
  const produitIdx = colMap['name'];
  const dlcIdx = colMap['expiration_date'];

  const produitVal = produitIdx !== undefined ? String(rowValues[produitIdx] ?? '').trim() : '';
  const dlcVal = dlcIdx !== undefined ? String(rowValues[dlcIdx] ?? '').trim() : '';

  if (SECTION_HEADER_RE.test(produitVal) && (dlcVal === '' || dlcVal === '0')) return true;

  // Everything else is a valid product row — do NOT skip
  return false;
}

function downloadTemplate() {
  const headers = ['Produit','Marques','Catégories','Date réception','DLC','Rayons','Action (si expiré)','Date de commande','Quantité jetées','Prix CHF'];
  const examples = [
    ['Lait entier','Migros','Produits frais','01/04/2026','10/05/2026','Rayon 3','','','','2.50'],
    ['Coca-Cola 1.5L','Coca-Cola','Boissons','15/03/2026','31/12/2026','Frigo 1','','','','1.80'],
    ['Chips barbecue','Lay\'s','Snacks','20/04/2026','15/08/2026','Rayon 2','Jeter','05/05/2026','3','3.20'],
  ];
  const csv = [headers, ...examples].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'tracksmart_modele.csv'; a.click();
  URL.revokeObjectURL(url);
}

// ─── COMPONENT ───────────────────────────────────────────────────────────────
export default function ImportModal({ onClose, onImported }) {
  const { t, lang } = useLanguage();
  const fileRef = useRef();
  const [step, setStep] = useState('upload');
  const [rawData, setRawData] = useState(null);
  const [mapping, setMapping] = useState({});
  const [preview, setPreview] = useState([]);
  const [skipped, setSkipped] = useState([]);
  const [dateConvertCount, setDateConvertCount] = useState(0);
  const [importing, setImporting] = useState(false);
  const [importCount, setImportCount] = useState(0);
  const [parseError, setParseError] = useState('');
  const [uploading, setUploading] = useState(false);

  const isFr = lang === 'fr';

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
          rows: { type: 'array', items: { type: 'object', additionalProperties: true } }
        }
      },
    });

    setUploading(false);

    if (result.status !== 'success' || !result.output) {
      setParseError(isFr ? 'Impossible de lire le fichier.' : 'Could not read the file.');
      return;
    }

    const outputRows = Array.isArray(result.output) ? result.output : (result.output.rows || []);
    if (!outputRows.length) {
      setParseError(isFr ? 'Fichier vide ou mal formaté.' : 'File empty or badly formatted.');
      return;
    }

    const headers = [...new Set(outputRows.flatMap(r => Object.keys(r)))];
    const rows = outputRows.map(r => headers.map(h => r[h] ?? ''));

    // Auto-detect field mappings (skip calculated columns)
    const autoMapping = {};
    headers.forEach((h, idx) => {
      const field = detectField(h);
      if (field && field !== '__skip__' && !(field in autoMapping)) autoMapping[field] = idx;
    });

    setRawData({ headers, rows });
    setMapping(autoMapping);
    setStep('map');
  };

  const handleConfirmMapping = () => {
    const { rows } = rawData;
    const validated = [];
    const skippedRows = [];
    let serialDateCount = 0;

    rows.forEach((rowValues, ri) => {
      // Skip only truly empty rows and section header rows
      if (shouldSkipRow(rowValues, mapping)) {
        skippedRows.push({ row: ri + 1, reason: isFr ? 'En-tête de section ou ligne vide' : 'Section header or empty row' });
        return;
      }

      const entry = {};
      let hasError = false;

      FIELD_DEFS.forEach(({ key, required }) => {
        const colIdx = mapping[key];
        const rawVal = colIdx !== undefined ? rowValues[colIdx] : undefined;

        if (key === 'expiration_date' || key === 'reception_date' || key === 'order_date') {
          if (isSerialDate(rawVal)) serialDateCount++;
          const parsed = parseExcelDate(rawVal);
          if (!parsed && required) {
            hasError = true;
            skippedRows.push({ row: ri + 1, reason: isFr ? 'DLC invalide ou manquante' : 'Missing/invalid expiry date' });
          }
          entry[key] = parsed || '';
        } else if (key === 'category') {
          const cleaned = cleanField(rawVal);
          entry[key] = normalizeCategory(cleaned); // always returns a valid category
        } else if (key === 'rayon') {
          const cleaned = cleanField(rawVal);
          entry[key] = normalizeRayon(cleaned);
          entry._rawRayon = cleaned;
        } else if (key === 'action') {
          entry[key] = normalizeAction(cleanField(rawVal));
        } else if (key === 'quantity_thrown' || key === 'price_chf') {
          const cleaned = cleanField(rawVal);
          entry[key] = cleaned ? parseFloat(cleaned.replace(',', '.')) || '' : '';
        } else {
          // name field
          const cleaned = cleanField(rawVal);
          if (!cleaned && required) {
            // Missing name: skip with error
            hasError = true;
            skippedRows.push({ row: ri + 1, reason: isFr ? 'Nom du produit manquant' : 'Product name missing' });
          }
          entry[key] = cleaned;
        }
      });

      if (!hasError) validated.push(entry);
    });

    setDateConvertCount(serialDateCount);
    setSkipped(skippedRows);
    setPreview(validated);
    setStep('preview');
  };

  const handleImport = async () => {
    setImporting(true);
    // Strip internal _rawRayon before saving
    const toSave = preview.map(({ _rawRayon, ...rest }) => rest);
    await base44.entities.Product.bulkCreate(toSave);
    setImportCount(preview.length);
    setImporting(false);
    setStep('done');
    onImported();
  };

  const fieldLabel = (f) => isFr ? f.labelFr : f.labelEn;
  const displayFields = FIELD_DEFS.filter(f =>
    ['name', 'marque', 'category', 'expiration_date', 'rayon', 'quantity_thrown', 'price_chf'].includes(f.key)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileSpreadsheet className="w-5 h-5 text-primary" />
            </div>
            <h2 className="font-bold text-lg text-foreground">
              {isFr ? 'Importer un fichier Excel / CSV' : 'Import Excel / CSV file'}
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="w-4 h-4" /></Button>
        </div>

        <div className="p-6 space-y-5">

          {/* UPLOAD */}
          {step === 'upload' && (
            <div className="space-y-5">
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm space-y-1">
                <p className="font-semibold text-primary">{isFr ? 'Colonnes reconnues automatiquement :' : 'Auto-recognized columns:'}</p>
                <p className="text-xs text-muted-foreground">Produit · Marques · Catégories · Date réception · DLC · Rayons · Action · Date de commande · Quantité jetées · Prix CHF</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {isFr ? '✅ Dates Excel (numéros sériels) converties automatiquement.' : '✅ Excel serial dates converted automatically.'}
                </p>
              </div>
              <div className="flex items-center justify-between bg-secondary/50 rounded-xl p-4">
                <div>
                  <p className="text-sm font-medium">{isFr ? 'Télécharger le modèle CSV' : 'Download CSV template'}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{isFr ? 'Structure officielle TrackSmart' : 'Official TrackSmart structure'}</p>
                </div>
                <Button variant="outline" size="sm" className="rounded-full gap-2" onClick={downloadTemplate}>
                  <Download className="w-4 h-4" />{isFr ? 'Modèle' : 'Template'}
                </Button>
              </div>
              <div
                className="border-2 border-dashed border-border rounded-2xl p-10 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
                onClick={() => !uploading && fileRef.current.click()}
              >
                {uploading
                  ? <Loader2 className="w-10 h-10 text-primary mx-auto mb-3 animate-spin" />
                  : <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />}
                <p className="font-medium text-foreground mb-1">
                  {uploading
                    ? (isFr ? 'Analyse du fichier en cours…' : 'Analyzing file…')
                    : (isFr ? 'Cliquez pour choisir un fichier' : 'Click to choose a file')}
                </p>
                <p className="text-xs text-muted-foreground">.xlsx, .xls, .csv acceptés</p>
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
                {isFr
                  ? `${rawData.rows.length} ligne(s) détectée(s). Vérifiez le mapping des colonnes.`
                  : `${rawData.rows.length} row(s) detected. Review column mapping.`}
              </p>
              <div className="space-y-2.5">
                {FIELD_DEFS.map(field => (
                  <div key={field.key} className="flex items-center gap-3">
                    <div className="w-44 flex-shrink-0 text-sm font-medium">
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
                        <SelectValue placeholder={isFr ? 'Choisir colonne…' : 'Choose column…'} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">{isFr ? '— Ignorer —' : '— Ignore —'}</SelectItem>
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
                <p className="text-xs font-medium text-muted-foreground mb-2">{isFr ? 'Aperçu (2 premières lignes)' : 'Preview (first 2 rows)'}</p>
                <table className="text-xs w-full min-w-max">
                  <thead>
                    <tr>{rawData.headers.map((h, i) => <th key={i} className="text-left px-2 py-1 text-muted-foreground font-medium whitespace-nowrap">{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {rawData.rows.slice(0, 2).map((row, ri) => (
                      <tr key={ri} className="border-t border-border/30">
                        {rawData.headers.map((h, ci) => (
                          <td key={ci} className="px-2 py-1 whitespace-nowrap">{row[ci] ?? '—'}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" className="rounded-full" onClick={() => setStep('upload')}>{t('back')}</Button>
                <Button
                  className="rounded-full gap-2"
                  disabled={!['name', 'expiration_date'].every(f => mapping[f] !== undefined)}
                  onClick={handleConfirmMapping}
                >
                  {isFr ? 'Valider' : 'Validate'} <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* PREVIEW */}
          {step === 'preview' && (
            <div className="space-y-5">
              {/* Summary banner */}
              <div className="bg-secondary/50 border border-border/40 rounded-xl p-4 text-sm space-y-1">
                <p>✅ <strong>{preview.length}</strong> {isFr ? 'produit(s) valide(s)' : 'valid product(s)'}</p>
                {skipped.length > 0 && (
                  <p>⚠️ <strong>{skipped.length}</strong> {isFr ? 'ligne(s) ignorée(s)' : 'row(s) skipped'}</p>
                )}
                {dateConvertCount > 0 && (
                  <p>🔄 <strong>{dateConvertCount}</strong> {isFr ? 'date(s) converties depuis le format Excel' : 'date(s) converted from Excel serial format'}</p>
                )}
              </div>

              {/* Skipped rows detail */}
              {skipped.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 space-y-1">
                  <div className="flex items-center gap-2 text-yellow-800 font-medium text-sm">
                    <TriangleAlert className="w-4 h-4" />
                    {isFr ? `${skipped.length} ligne(s) ignorée(s)` : `${skipped.length} row(s) skipped`}
                  </div>
                  {skipped.slice(0, 5).map((e, i) => (
                    <p key={i} className="text-xs text-yellow-700">
                      {isFr ? `Ligne ${e.row} — ${e.reason}` : `Row ${e.row} — ${e.reason}`}
                    </p>
                  ))}
                  {skipped.length > 5 && (
                    <p className="text-xs text-yellow-600">+{skipped.length - 5} {isFr ? 'autres' : 'more'}…</p>
                  )}
                </div>
              )}

              {preview.length === 0 ? (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-xl p-4 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {isFr ? 'Aucun produit valide trouvé.' : 'No valid products found.'}
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl p-4">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-800 font-medium">
                    {isFr ? `${preview.length} produit(s) prêt(s) à importer` : `${preview.length} product(s) ready to import`}
                  </span>
                </div>
              )}

              {/* Preview table with original rayon column */}
              <div className="overflow-x-auto border border-border/40 rounded-xl">
                <table className="text-xs w-full min-w-max">
                  <thead className="bg-secondary/50">
                    <tr>
                      {displayFields.map(f => (
                        <th key={f.key} className="text-left px-3 py-2 font-semibold whitespace-nowrap">{fieldLabel(f)}</th>
                      ))}
                      <th className="text-left px-3 py-2 font-semibold whitespace-nowrap text-muted-foreground">
                        {isFr ? 'Rayon original' : 'Original rayon'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.slice(0, 10).map((row, i) => (
                      <tr key={i} className="border-t border-border/30">
                        {displayFields.map(f => (
                          <td key={f.key} className="px-3 py-2 whitespace-nowrap">
                            {f.key === 'rayon'
                              ? (row[f.key] ? (
                                  <span className="font-medium text-primary">{row[f.key]}</span>
                                ) : '—')
                              : (row[f.key] || '—')}
                          </td>
                        ))}
                        <td className="px-3 py-2 whitespace-nowrap text-muted-foreground text-xs">
                          {row._rawRayon || '—'}
                        </td>
                      </tr>
                    ))}
                    {preview.length > 10 && (
                      <tr className="border-t border-border/30">
                        <td colSpan={displayFields.length + 1} className="px-3 py-2 text-center text-muted-foreground">
                          +{preview.length - 10} {isFr ? 'lignes' : 'rows'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" className="rounded-full" onClick={() => setStep('map')}>{t('back')}</Button>
                <Button
                  className="rounded-full gap-2"
                  disabled={preview.length === 0 || importing}
                  onClick={handleImport}
                >
                  {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {isFr ? `Importer ${preview.length} produit(s)` : `Import ${preview.length} product(s)`}
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
              <h3 className="text-xl font-bold">{isFr ? 'Importation réussie !' : 'Import successful!'}</h3>
              <p className="text-muted-foreground">
                {isFr ? `${importCount} produit(s) ajouté(s).` : `${importCount} product(s) added.`}
              </p>
              <Button className="rounded-full px-8" onClick={onClose}>{t('close')}</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}