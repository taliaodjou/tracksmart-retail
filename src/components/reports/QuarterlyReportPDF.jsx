import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const GOLD = '#C9A646';
const DARK = '#1a1a2e';
const GREY = '#4a4a5a';
const LIGHT = '#f8f6f0';

const categoryLabels = {
  snacks: 'Snacks', boissons: 'Boissons', congeles_poisson: 'Congelés Poisson',
  congeles_poulet: 'Congelés Poulet', produits_frais: 'Produits frais',
  epicerie_seche: 'Épicerie sèche', confiseries: 'Confiseries', conserves: 'Conserves',
  hygiene_beaute: 'Hygiène & Beauté', entretien_maison: 'Entretien maison',
  bebe: 'Bébé', animaux: 'Animaux', alcool: 'Alcool', tabac: 'Tabac',
};

function safeJson(str, fallback = []) {
  try { return str ? JSON.parse(str) : fallback; } catch { return fallback; }
}

export function generateReportHTML(report) {
  const thrown = safeJson(report.thrown_products);
  const topCats = safeJson(report.top_categories);
  const topRayons = safeJson(report.top_rayons);
  const monthly = safeJson(report.monthly_breakdown);
  const insights = safeJson(report.insights);
  const prevLoss = report.previous_quarter_loss_chf || 0;
  const currLoss = report.total_loss_chf || 0;
  const evolution = prevLoss > 0 ? ((currLoss - prevLoss) / prevLoss) * 100 : null;
  const evoText = evolution !== null
    ? (evolution >= 0 ? `+${evolution.toFixed(1)}%` : `${evolution.toFixed(1)}%`)
    : '—';
  const evoColor = evolution === null ? GREY : evolution < 0 ? '#16a34a' : '#dc2626';
  const maxMonthly = Math.max(...monthly.map(m => m.loss || 0), 1);

  const tableRows = thrown.map(p => `
    <tr style="border-bottom:1px solid #e8e4dc;">
      <td style="padding:8px 10px;font-size:12px;color:${DARK};font-weight:500;">${p.name || '—'}</td>
      <td style="padding:8px 10px;font-size:12px;color:${GREY};">${p.marque || '—'}</td>
      <td style="padding:8px 10px;font-size:12px;color:${GREY};">${categoryLabels[p.category] || p.category || '—'}</td>
      <td style="padding:8px 10px;font-size:12px;color:${GREY};text-align:center;">${p.rayon || '—'}</td>
      <td style="padding:8px 10px;font-size:12px;color:${GREY};text-align:center;">${p.expiration_date ? format(new Date(p.expiration_date), 'dd/MM/yyyy') : '—'}</td>
      <td style="padding:8px 10px;font-size:12px;color:${GREY};text-align:center;">${p.quantity_thrown || '—'}</td>
      <td style="padding:8px 10px;font-size:12px;color:${GREY};text-align:right;">${p.price_chf ? `CHF ${Number(p.price_chf).toFixed(2)}` : '—'}</td>
      <td style="padding:8px 10px;font-size:12px;font-weight:700;color:#dc2626;text-align:right;">${p.total ? `CHF ${Number(p.total).toFixed(2)}` : '—'}</td>
    </tr>`).join('');

  const catBars = topCats.slice(0, 5).map(c => {
    const maxCat = Math.max(...topCats.map(x => x.loss || 0), 1);
    const pct = Math.round((c.loss / maxCat) * 100);
    return `<div style="margin-bottom:10px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
        <span style="font-size:12px;color:${DARK};">${categoryLabels[c.name] || c.name}</span>
        <span style="font-size:12px;font-weight:700;color:${GOLD};">CHF ${Number(c.loss).toFixed(2)}</span>
      </div>
      <div style="background:#e8e4dc;border-radius:4px;height:8px;">
        <div style="background:${GOLD};width:${pct}%;height:8px;border-radius:4px;"></div>
      </div>
    </div>`;
  }).join('');

  const rayonBars = topRayons.slice(0, 5).map(r => {
    const maxR = Math.max(...topRayons.map(x => x.loss || 0), 1);
    const pct = Math.round((r.loss / maxR) * 100);
    return `<div style="margin-bottom:10px;">
      <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
        <span style="font-size:12px;color:${DARK};">Rayon ${r.name}</span>
        <span style="font-size:12px;font-weight:700;color:${GOLD};">CHF ${Number(r.loss).toFixed(2)}</span>
      </div>
      <div style="background:#e8e4dc;border-radius:4px;height:8px;">
        <div style="background:#b87333;width:${pct}%;height:8px;border-radius:4px;"></div>
      </div>
    </div>`;
  }).join('');

  const monthlyBars = monthly.map(m => {
    const pct = Math.round(((m.loss || 0) / maxMonthly) * 100);
    return `<div style="display:flex;flex-direction:column;align-items:center;flex:1;min-width:0;">
      <span style="font-size:10px;color:${GOLD};font-weight:700;margin-bottom:4px;">${m.loss > 0 ? `CHF ${Number(m.loss).toFixed(0)}` : ''}</span>
      <div style="background:#e8e4dc;border-radius:4px 4px 0 0;width:80%;display:flex;flex-direction:column;justify-content:flex-end;height:80px;">
        <div style="background:${GOLD};width:100%;border-radius:4px 4px 0 0;height:${Math.max(pct, m.loss > 0 ? 4 : 0)}%;min-height:${m.loss > 0 ? '4px' : '0'};"></div>
      </div>
      <span style="font-size:10px;color:${GREY};margin-top:4px;text-align:center;">${m.month}</span>
    </div>`;
  }).join('');

  const insightItems = insights.map(i => `<li style="padding:8px 0;border-bottom:1px solid #f0ece4;font-size:13px;color:${DARK};">💡 ${i}</li>`).join('');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Rapport Trimestriel — ${report.quarter_label}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Helvetica Neue', Arial, sans-serif; background: #fff; color: ${DARK}; }
  @media print {
    body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    .no-print { display: none !important; }
    @page { margin: 15mm; }
  }
</style>
</head>
<body>

<!-- HEADER -->
<div style="background:${DARK};padding:32px 40px;display:flex;justify-content:space-between;align-items:center;">
  <div style="display:flex;align-items:center;gap:16px;">
    <div style="width:48px;height:48px;background:${GOLD};border-radius:12px;display:flex;align-items:center;justify-content:center;">
      <span style="color:#fff;font-weight:900;font-size:18px;letter-spacing:-1px;">TS</span>
    </div>
    <div>
      <div style="color:${GOLD};font-weight:700;font-size:18px;letter-spacing:1px;">TRACKSMART</div>
      <div style="color:#9ca3af;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Gestion des pertes</div>
    </div>
  </div>
  <div style="text-align:right;">
    <div style="color:#fff;font-size:22px;font-weight:700;">${report.quarter_label}</div>
    <div style="color:${GOLD};font-size:13px;margin-top:4px;">Rapport trimestriel des pertes</div>
  </div>
</div>

<!-- GOLD LINE -->
<div style="height:4px;background:linear-gradient(90deg,${GOLD},#e8c96d,${GOLD});"></div>

<!-- TITLE SECTION -->
<div style="background:${LIGHT};padding:28px 40px;border-bottom:1px solid #e8e4dc;">
  <h1 style="font-size:24px;font-weight:700;color:${DARK};margin-bottom:6px;">Rapport trimestriel des pertes produits</h1>
  <p style="color:${GREY};font-size:14px;">Analyse des pertes et produits expirés — ${report.shop_name || 'Ma boutique'}</p>
</div>

<!-- STORE INFO -->
<div style="padding:24px 40px;background:#fff;border-bottom:1px solid #f0ece4;">
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:20px;">
    <div>
      <div style="font-size:10px;color:${GREY};text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Boutique</div>
      <div style="font-size:14px;font-weight:600;color:${DARK};">${report.shop_name || '—'}</div>
    </div>
    <div>
      <div style="font-size:10px;color:${GREY};text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Période</div>
      <div style="font-size:14px;font-weight:600;color:${DARK};">${format(new Date(report.period_start), 'dd MMM', { locale: fr })} — ${format(new Date(report.period_end), 'dd MMM yyyy', { locale: fr })}</div>
    </div>
    <div>
      <div style="font-size:10px;color:${GREY};text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Produits suivis</div>
      <div style="font-size:14px;font-weight:600;color:${DARK};">${report.total_products_tracked || 0}</div>
    </div>
    <div>
      <div style="font-size:10px;color:${GREY};text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Généré le</div>
      <div style="font-size:14px;font-weight:600;color:${DARK};">${format(new Date(), 'dd/MM/yyyy', { locale: fr })}</div>
    </div>
  </div>
</div>

<!-- SUMMARY CARDS -->
<div style="padding:28px 40px;background:${LIGHT};border-bottom:1px solid #e8e4dc;">
  <h2 style="font-size:14px;font-weight:700;color:${GREY};text-transform:uppercase;letter-spacing:2px;margin-bottom:20px;">Résumé exécutif</h2>
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:16px;">
    <div style="background:#fff;border:1px solid #e8e4dc;border-radius:12px;padding:20px;border-top:3px solid ${GOLD};">
      <div style="font-size:11px;color:${GREY};text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">💰 Total pertes</div>
      <div style="font-size:26px;font-weight:900;color:${DARK};">CHF ${Number(currLoss).toFixed(2)}</div>
      <div style="font-size:11px;margin-top:6px;color:${evoColor};font-weight:600;">${evoText} vs trimestre précédent</div>
    </div>
    <div style="background:#fff;border:1px solid #e8e4dc;border-radius:12px;padding:20px;border-top:3px solid #dc2626;">
      <div style="font-size:11px;color:${GREY};text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">📦 Produits jetés</div>
      <div style="font-size:26px;font-weight:900;color:#dc2626;">${report.total_products_thrown || 0}</div>
      <div style="font-size:11px;margin-top:6px;color:${GREY};">unités éliminées</div>
    </div>
    <div style="background:#fff;border:1px solid #e8e4dc;border-radius:12px;padding:20px;border-top:3px solid #ea580c;">
      <div style="font-size:11px;color:${GREY};text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">⚠️ Produits expirés</div>
      <div style="font-size:26px;font-weight:900;color:#ea580c;">${report.total_expired || 0}</div>
      <div style="font-size:11px;margin-top:6px;color:${GREY};">références affectées</div>
    </div>
    <div style="background:#fff;border:1px solid #e8e4dc;border-radius:12px;padding:20px;border-top:3px solid ${evoColor};">
      <div style="font-size:11px;color:${GREY};text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">📉 Évolution</div>
      <div style="font-size:26px;font-weight:900;color:${evoColor};">${evoText}</div>
      <div style="font-size:11px;margin-top:6px;color:${GREY};">vs trimestre précédent</div>
    </div>
  </div>
</div>

<!-- ANALYTICS: MONTHLY + CATEGORIES -->
<div style="padding:28px 40px;background:#fff;border-bottom:1px solid #e8e4dc;">
  <h2 style="font-size:14px;font-weight:700;color:${GREY};text-transform:uppercase;letter-spacing:2px;margin-bottom:20px;">Analyse des pertes</h2>
  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:24px;">

    <!-- Monthly chart -->
    <div style="background:${LIGHT};border-radius:12px;padding:20px;">
      <div style="font-size:12px;font-weight:700;color:${DARK};margin-bottom:16px;">Pertes par mois</div>
      <div style="display:flex;align-items:flex-end;gap:6px;height:100px;">${monthlyBars}</div>
    </div>

    <!-- By category -->
    <div style="background:${LIGHT};border-radius:12px;padding:20px;">
      <div style="font-size:12px;font-weight:700;color:${DARK};margin-bottom:16px;">Par catégorie</div>
      ${catBars || '<p style="font-size:12px;color:#9ca3af;">Aucune donnée</p>'}
    </div>

    <!-- By rayon -->
    <div style="background:${LIGHT};border-radius:12px;padding:20px;">
      <div style="font-size:12px;font-weight:700;color:${DARK};margin-bottom:16px;">Par rayon</div>
      ${rayonBars || '<p style="font-size:12px;color:#9ca3af;">Aucune donnée</p>'}
    </div>
  </div>
</div>

<!-- INSIGHTS -->
${insights.length > 0 ? `
<div style="padding:28px 40px;background:${LIGHT};border-bottom:1px solid #e8e4dc;">
  <h2 style="font-size:14px;font-weight:700;color:${GREY};text-transform:uppercase;letter-spacing:2px;margin-bottom:16px;">🧠 Recommandations & insights</h2>
  <ul style="list-style:none;">${insightItems}</ul>
</div>` : ''}

<!-- DETAILED TABLE -->
<div style="padding:28px 40px;background:#fff;">
  <h2 style="font-size:14px;font-weight:700;color:${GREY};text-transform:uppercase;letter-spacing:2px;margin-bottom:16px;">Détail des produits jetés</h2>
  ${thrown.length > 0 ? `
  <table style="width:100%;border-collapse:collapse;border:1px solid #e8e4dc;border-radius:8px;overflow:hidden;">
    <thead>
      <tr style="background:${DARK};">
        <th style="padding:10px;text-align:left;font-size:11px;color:${GOLD};text-transform:uppercase;letter-spacing:1px;">Produit</th>
        <th style="padding:10px;text-align:left;font-size:11px;color:${GOLD};text-transform:uppercase;letter-spacing:1px;">Marque</th>
        <th style="padding:10px;text-align:left;font-size:11px;color:${GOLD};text-transform:uppercase;letter-spacing:1px;">Catégorie</th>
        <th style="padding:10px;text-align:center;font-size:11px;color:${GOLD};text-transform:uppercase;letter-spacing:1px;">Rayon</th>
        <th style="padding:10px;text-align:center;font-size:11px;color:${GOLD};text-transform:uppercase;letter-spacing:1px;">DLC</th>
        <th style="padding:10px;text-align:center;font-size:11px;color:${GOLD};text-transform:uppercase;letter-spacing:1px;">Qté</th>
        <th style="padding:10px;text-align:right;font-size:11px;color:${GOLD};text-transform:uppercase;letter-spacing:1px;">Prix</th>
        <th style="padding:10px;text-align:right;font-size:11px;color:${GOLD};text-transform:uppercase;letter-spacing:1px;">Total</th>
      </tr>
    </thead>
    <tbody>${tableRows}</tbody>
    <tfoot>
      <tr style="background:${LIGHT};">
        <td colspan="7" style="padding:12px 10px;font-size:13px;font-weight:700;color:${DARK};text-align:right;">TOTAL PERTES</td>
        <td style="padding:12px 10px;font-size:15px;font-weight:900;color:#dc2626;text-align:right;">CHF ${Number(currLoss).toFixed(2)}</td>
      </tr>
    </tfoot>
  </table>` : '<p style="font-size:13px;color:#9ca3af;font-style:italic;">Aucun produit jeté durant cette période.</p>'}
</div>

<!-- FOOTER -->
<div style="background:${DARK};padding:20px 40px;display:flex;justify-content:space-between;align-items:center;margin-top:24px;">
  <div style="color:#6b7280;font-size:11px;">Document généré automatiquement par TrackSmart Retail • Confidentiel</div>
  <div style="color:${GOLD};font-size:11px;font-weight:600;">${report.quarter_label} — ${report.shop_name || ''}</div>
</div>

</body>
</html>`;
}

export default function QuarterlyReportPDF({ report, onClose }) {
  const html = generateReportHTML(report);

  const handlePrint = () => {
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    win.print();
  };

  const handleDownload = () => {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rapport-${report.quarter_label?.replace(/\s/g, '-')}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return { handlePrint, handleDownload };
}