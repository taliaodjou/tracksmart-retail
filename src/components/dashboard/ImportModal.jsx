import React, { useState, useRef } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';
import {
  Upload, X, FileSpreadsheet, AlertCircle, CheckCircle2,
  Download, Loader2, TriangleAlert
} from 'lucide-react';

// ─── HEADER → FIELD MAPPING ──────────────────────────────────────────────────
function headerToField(headerText) {
  const h = String(headerText).toLowerCase().trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  if (h.includes('produit') || h.includes('product') || h.includes('nom') || h === 'article') return 'produit';
  if (h.includes('marque') || h.includes('brand')) return 'marques';
  if (h.includes('categor')) return 'categories';
  if (h.includes('reception') || h.includes('received')) return 'dateReception';
  if (h === 'dlc' || h.includes('limite') || h.includes('expir') || h.includes('expiry') || h.includes('best before')) return 'dlc';
  if (h.includes('rayon') || h.includes('shelf') || h.includes('section')) return 'rayons';
  if (h.includes('quantit') || h.includes('jete') || h.includes('thrown') || h.includes('qty')) return 'quantiteJetees';
  if ((h.includes('prix') || h.includes('price') || h.includes('cost')) && h.includes('chf')) return 'prixCHF';
  if (h.includes('prix') || h.includes('price') || h.includes('cost')) return 'prixCHF';
  if (h.includes('action')) return 'action';
  if (h.includes('commande') || h.includes('order date')) return 'dateCommande';
  return null;
}

// ─── DATE CONVERSION ─────────────────────────────────────────────────────────
function toDate(val) {
  if (val === null || val === undefined || val === '') return '';
  const s = String(val).trim();
  if (s.startsWith('#') || s === 'fix' || s === '/') return '';

  const num = Number(val);
  if (!isNaN(num) && num > 1000 && num < 100000) {
    const d = new Date(Date.UTC(1899, 11, 30) + Math.round(num) * 86400000);
    return d.toISOString().slice(0, 10);
  }

  const dmy = s.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})$/);
  if (dmy) {
    const y = dmy[3].length === 2 ? '20' + dmy[3] : dmy[3];
    return `${y}-${dmy[2].padStart(2, '0')}-${dmy[1].padStart(2, '0')}`;
  }

  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  return '';
}

// ─── NORMALIZERS ─────────────────────────────────────────────────────────────
function normalizeCategory(val) {
  if (!val) return 'epicerie_seche';
  const v = String(val).trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (v.includes('snack') || v.includes('glace')) return 'snacks';
  if (v.includes('boisson')) return 'boissons';
  if (v.includes('congel') && v.includes('poisson')) return 'congeles_poisson';
  if (v.includes('congel') && v.includes('poulet')) return 'congeles_poulet';
  if (v.includes('congel')) return 'congeles_poulet';
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

function normalizeRayon(val) {
  if (!val) return '';
  const v = String(val).trim().toLowerCase();
  const rayonMatch = v.match(/rayon[_ ]?(\d+)/);
  if (rayonMatch) return String(parseInt(rayonMatch[1]));
  const frigoMatch = v.match(/frigo[_ ]?(\d+)/);
  if (frigoMatch) return `Frigo ${frigoMatch[1]}`;
  const conglMatch = v.match(/congl[_ ]?(\d+)|cong[eé]lateur[_ ]?(\d+)/);
  if (conglMatch) return `Congélateur ${conglMatch[1] || conglMatch[2]}`;
  const n = parseInt(v);
  if (!isNaN(n) && n >= 1 && n <= 15) return String(n);
  return val;
}

function normalizeAction(val) {
  if (!val) return '';
  const k = String(val).toLowerCase().trim();
  const map = {
    jeter: 'jeter', 'à jeter': 'jeter',
    'à recommander': 'a_recommander', 'a recommander': 'a_recommander', recommander: 'a_recommander',
    commandé: 'commande', commande: 'commande', ordered: 'commande',
    'en transition': 'en_transition', transition: 'en_transition',
    reçu: 'recu', recu: 'recu', received: 'recu',
  };
  return map[k] || '';
}

// ─── SKIP ROW ─────────────────────────────────────────────────────────────────
function shouldSkip(row, colMap) {
  if (row.every(c => c === '' || c === null || c === undefined)) return true;
  const produit = String(row[colMap.produit] ?? '').trim();
  const dlc = String(row[colMap.dlc] ?? '').trim();
  if (/^(rayon|frigo|cong)/i.test(produit) && dlc === '') return true;
  return false;
}

// ─── LOAD XLSX FROM CDN ───────────────────────────────────────────────────────
let xlsxPromise = null;
function loadXLSX() {
  if (window.XLSX) return Promise.resolve(window.XLSX);
  if (!xlsxPromise) {
    xlsxPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';
      script.onload = () => resolve(window.XLSX);
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  return xlsxPromise;
}

// ─── PARSE FILE ───────────────────────────────────────────────────────────────
function parseFile(arrayBuffer) {
  const XLSX = window.XLSX;
  const workbook = XLSX.read(arrayBuffer, {
    type: 'array',
    cellDates: false,
    raw: true,
    cellNF: false,
    cellStyles: false,
  });

  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const allRows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true, defval: '' });

  if (allRows.length < 2) return { products: [], errors: [], skipped: 0, dateCount: 0 };

  const headers = allRows[0];
  const dataRows = allRows.slice(1);

  // Build colMap
  const colMap = {};
  headers.forEach((h, i) => {
    const field = headerToField(h);
    if (field && !(field in colMap)) colMap[field] = i;
  });

  const products = [];
  const errors = [];
  let skipped = 0;
  let dateCount = 0;

  dataRows.forEach((row, idx) => {
    if (shouldSkip(row, colMap)) { skipped++; return; }

    const get = (field) => String(row[colMap[field]] ?? '').trim();

    const rawDlc = colMap.dlc !== undefined ? row[colMap.dlc] : '';
    const rawReception = colMap.dateReception !== undefined ? row[colMap.dateReception] : '';
    const rawCommande = colMap.dateCommande !== undefined ? row[colMap.dateCommande] : '';

    const num = Number(rawDlc);
    if (!isNaN(num) && num > 1000 && num < 100000) dateCount++;

    const dlc = toDate(rawDlc);
    const produit = get('produit').replace(/^#.*/, '').trim();

    if (!produit) {
      errors.push(`Ligne ${idx + 2} : nom du produit manquant`);
      return;
    }

    products.push({
      name: produit,
      marque: get('marques').replace(/^#.*/, '').trim(),
      category: normalizeCategory(get('categories')),
      reception_date: toDate(rawReception),
      expiration_date: dlc,
      rayon: normalizeRayon(get('rayons')),
      action: normalizeAction(get('action')),
      order_date: toDate(rawCommande),
      quantity_thrown: (() => {
        const v = get('quantiteJetees').replace(',', '.');
        const n = parseFloat(v);
        return isNaN(n) ? '' : n;
      })(),
      price_chf: (() => {
        const v = get('prixCHF').replace(',', '.');
        const n = parseFloat(v);
        return isNaN(n) ? '' : n;
      })(),
      _rawRayon: get('rayons'),
    });
  });

  return { products, errors, skipped, dateCount };
}

// ─── TEMPLATE DOWNLOAD ────────────────────────────────────────────────────────
function downloadTemplate() {
  const headers = ['Produit', 'Marques', 'Catégories', 'Date réception', 'DLC', 'Rayons', 'Action (si expiré)', 'Date de commande', 'Quantité jetées', 'Prix CHF'];
  const examples = [
    ['Lait entier', 'Migros', 'Produits frais', '01/04/2026', '10/05/2026', 'Rayon 3', '', '', '', '2.50'],
    ['Coca-Cola 1.5L', 'Coca-Cola', 'Boissons', '15/03/2026', '31/12/2026', 'Frigo 1', '', '', '', '1.80'],
    ["Chips barbecue", "Lay's", 'Snacks', '20/04/2026', '15/08/2026', 'Rayon 2', 'Jeter', '05/05/2026', '3', '3.20'],
  ];
  const csv = [headers, ...examples].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'tracksmart_modele.csv'; a.click();
  URL.revokeObjectURL(url);
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function ImportModal({ onClose, onImported }) {
  const { t, lang } = useLanguage();
  const fileRef = useRef();
  const isFr = lang === 'fr';

  const [step, setStep] = useState('upload'); // upload | preview | done
  const [parsed, setParsed] = useState(null); // { products, errors, skipped, dateCount }
  const [importing, setImporting] = useState(false);
  const [importCount, setImportCount] = useState(0);
  const [parseError, setParseError] = useState('');
  const [reading, setReading] = useState(false);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setParseError('');
    setReading(true);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        await loadXLSX();
        const result = parseFile(evt.target.result);
        if (result.products.length === 0 && result.skipped === 0) {
          setParseError(isFr ? 'Aucune donnée trouvée dans le fichier.' : 'No data found in file.');
          setReading(false);
          return;
        }
        setParsed(result);
        setStep('preview');
      } catch (err) {
        setParseError(isFr ? `Erreur de lecture : ${err.message}` : `Read error: ${err.message}`);
      }
      setReading(false);
    };
    reader.onerror = () => {
      setParseError(isFr ? 'Impossible de lire le fichier.' : 'Could not read the file.');
      setReading(false);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImport = async () => {
    setImporting(true);
    const toSave = parsed.products.map(({ _rawRayon, quantity_thrown, price_chf, ...rest }) => {
      const obj = { ...rest };
      if (quantity_thrown !== '' && quantity_thrown !== null && quantity_thrown !== undefined) obj.quantity_thrown = Number(quantity_thrown);
      if (price_chf !== '' && price_chf !== null && price_chf !== undefined) obj.price_chf = Number(price_chf);
      return obj;
    });
    await base44.entities.Product.bulkCreate(toSave);
    setImportCount(parsed.products.length);
    setImporting(false);
    setStep('done');
    onImported();
  };

  const PREVIEW_FIELDS = [
    { key: 'name', label: 'Produit' },
    { key: 'marque', label: 'Marque' },
    { key: 'category', label: 'Catégorie' },
    { key: 'expiration_date', label: 'DLC' },
    { key: 'rayon', label: 'Rayon' },
    { key: 'price_chf', label: 'Prix CHF' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">

        {/* Header */}
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

          {/* UPLOAD STEP */}
          {step === 'upload' && (
            <div className="space-y-5">
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-sm space-y-1">
                <p className="font-semibold text-primary">
                  {isFr ? 'Colonnes reconnues automatiquement :' : 'Auto-recognized columns:'}
                </p>
                <p className="text-xs text-muted-foreground">
                  Produit · Marques · Catégories · Date réception · DLC · Rayons · Action · Date de commande · Quantité jetées · Prix CHF
                </p>
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
                onClick={() => !reading && fileRef.current.click()}
              >
                {reading
                  ? <Loader2 className="w-10 h-10 text-primary mx-auto mb-3 animate-spin" />
                  : <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />}
                <p className="font-medium text-foreground mb-1">
                  {reading
                    ? (isFr ? 'Analyse du fichier en cours…' : 'Analyzing file…')
                    : (isFr ? 'Cliquez pour choisir un fichier' : 'Click to choose a file')}
                </p>
                <p className="text-xs text-muted-foreground">.xlsx, .xls, .csv acceptés</p>
                <input ref={fileRef} type="file" accept=".xlsx,.csv,.xls" className="hidden" onChange={handleFile} disabled={reading} />
              </div>

              {parseError && (
                <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 rounded-xl p-4">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />{parseError}
                </div>
              )}
            </div>
          )}

          {/* PREVIEW STEP */}
          {step === 'preview' && parsed && (
            <div className="space-y-5">
              {/* Summary banner */}
              <div className="bg-secondary/50 border border-border/40 rounded-xl p-4 text-sm space-y-1">
                <p>✅ <strong>{parsed.products.length}</strong> {isFr ? 'produit(s) valide(s)' : 'valid product(s)'}</p>
                {parsed.skipped > 0 && (
                  <p>⏭️ <strong>{parsed.skipped}</strong> {isFr ? 'ligne(s) ignorée(s) (en-têtes de section)' : 'row(s) skipped (section headers)'}</p>
                )}
                {parsed.dateCount > 0 && (
                  <p>🔄 <strong>{parsed.dateCount}</strong> {isFr ? 'date(s) converties depuis le format Excel' : 'date(s) converted from Excel serial format'}</p>
                )}
                {parsed.errors.length > 0 && (
                  <p>⚠️ <strong>{parsed.errors.length}</strong> {isFr ? 'ligne(s) avec erreur' : 'row(s) with error'}</p>
                )}
              </div>

              {/* Errors detail */}
              {parsed.errors.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 space-y-1">
                  <div className="flex items-center gap-2 text-yellow-800 font-medium text-sm">
                    <TriangleAlert className="w-4 h-4" />
                    {isFr ? `${parsed.errors.length} erreur(s)` : `${parsed.errors.length} error(s)`}
                  </div>
                  {parsed.errors.slice(0, 5).map((e, i) => (
                    <p key={i} className="text-xs text-yellow-700">{e}</p>
                  ))}
                  {parsed.errors.length > 5 && (
                    <p className="text-xs text-yellow-600">+{parsed.errors.length - 5} {isFr ? 'autres' : 'more'}…</p>
                  )}
                </div>
              )}

              {parsed.products.length === 0 ? (
                <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-xl p-4 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {isFr ? 'Aucun produit valide trouvé.' : 'No valid products found.'}
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl p-4">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="text-sm text-green-800 font-medium">
                    {isFr ? `${parsed.products.length} produit(s) prêt(s) à importer` : `${parsed.products.length} product(s) ready to import`}
                  </span>
                </div>
              )}

              {/* Preview table */}
              <div className="overflow-x-auto border border-border/40 rounded-xl">
                <table className="text-xs w-full min-w-max">
                  <thead className="bg-secondary/50">
                    <tr>
                      {PREVIEW_FIELDS.map(f => (
                        <th key={f.key} className="text-left px-3 py-2 font-semibold whitespace-nowrap">{f.label}</th>
                      ))}
                      <th className="text-left px-3 py-2 font-semibold whitespace-nowrap text-muted-foreground">
                        {isFr ? 'Rayon original' : 'Original rayon'}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {parsed.products.slice(0, 15).map((row, i) => (
                      <tr key={i} className="border-t border-border/30">
                        {PREVIEW_FIELDS.map(f => (
                          <td key={f.key} className="px-3 py-2 whitespace-nowrap">
                            {f.key === 'rayon'
                              ? <span className="font-medium text-primary">{row[f.key] || '—'}</span>
                              : (row[f.key] !== '' && row[f.key] !== null && row[f.key] !== undefined ? String(row[f.key]) : '—')}
                          </td>
                        ))}
                        <td className="px-3 py-2 whitespace-nowrap text-muted-foreground">{row._rawRayon || '—'}</td>
                      </tr>
                    ))}
                    {parsed.products.length > 15 && (
                      <tr className="border-t border-border/30">
                        <td colSpan={PREVIEW_FIELDS.length + 1} className="px-3 py-2 text-center text-muted-foreground">
                          +{parsed.products.length - 15} {isFr ? 'lignes' : 'rows'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline" className="rounded-full" onClick={() => { setStep('upload'); setParsed(null); fileRef.current && (fileRef.current.value = ''); }}>
                  {isFr ? 'Retour' : 'Back'}
                </Button>
                <Button
                  className="rounded-full gap-2"
                  disabled={parsed.products.length === 0 || importing}
                  onClick={handleImport}
                >
                  {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {isFr ? `Confirmer l'import (${parsed.products.length})` : `Confirm import (${parsed.products.length})`}
                </Button>
              </div>
            </div>
          )}

          {/* DONE STEP */}
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