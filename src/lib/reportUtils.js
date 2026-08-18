import { startOfMonth, endOfMonth, subMonths, format, isWithinInterval, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getProductLoss, getLossReferenceDate } from '@/lib/productUtils';

// Given a quarter start month index (0=Jan) and year, compute the 3-month period
export function getQuarterPeriod(quarterStartMonth, year) {
  const start = new Date(year, quarterStartMonth, 1);
  const end = endOfMonth(new Date(year, quarterStartMonth + 2, 1));
  return { start, end };
}

// Get the last completed quarter period
export function getLastQuarterPeriod(accountingStartMonth = 0) {
  const today = new Date();
  const currentYear = today.getFullYear();
  
  // Find the current quarter start
  const monthIndex = today.getMonth();
  // offset by accountingStartMonth
  const offset = ((monthIndex - accountingStartMonth) % 12 + 12) % 12;
  const quarterOffset = Math.floor(offset / 3);
  const currentQStart = ((accountingStartMonth + quarterOffset * 3) % 12 + 12) % 12;
  const currentQStartYear = accountingStartMonth + quarterOffset * 3 >= 12
    ? currentYear - (accountingStartMonth + quarterOffset * 3 >= 24 ? 2 : 1)
    : currentYear;

  // Last quarter = 3 months before current quarter start
  const lastQStartMonth = (currentQStart - 3 + 12) % 12;
  const lastQStartYear = currentQStart < 3 ? currentYear - 1 : currentYear;
  
  const start = new Date(lastQStartYear, lastQStartMonth, 1);
  const end = endOfMonth(new Date(lastQStartYear, lastQStartMonth + 2, 1));
  return { start, end };
}

// Get current (in-progress) quarter period
export function getCurrentQuarterPeriod(accountingStartMonth = 0) {
  const today = new Date();
  const currentYear = today.getFullYear();
  const monthIndex = today.getMonth();
  const offset = ((monthIndex - accountingStartMonth) % 12 + 12) % 12;
  const quarterOffset = Math.floor(offset / 3);
  const qStartMonth = (accountingStartMonth + quarterOffset * 3) % 12;
  const qStartYear = accountingStartMonth + quarterOffset * 3 >= 12 ? currentYear - 1 : currentYear;
  
  const start = new Date(qStartYear, qStartMonth, 1);
  const end = endOfMonth(new Date(qStartYear, qStartMonth + 2, 1));
  return { start, end };
}

export function formatQuarterLabel(start, end) {
  const startM = start.getMonth();
  const endM = end.getMonth();
  const year = start.getFullYear();
  const startName = format(start, 'MMM', { locale: fr });
  const endName = format(end, 'MMM', { locale: fr });
  return `${startName} – ${endName} ${year}`;
}

export function computeReportData(products, periodStart, periodEnd, prevQuarterLoss = 0, shopName = '') {
  const thrown = products.filter(p => {
    if (getProductLoss(p) <= 0) return false;
    const actionDate = getLossReferenceDate(p);
    if (!actionDate) return true;
    try {
      const d = new Date(actionDate);
      return d >= periodStart && d <= periodEnd;
    } catch { return false; }
  });

  const totalLoss = thrown.reduce((sum, p) => sum + getProductLoss(p), 0);
  const totalThrown = thrown.reduce((sum, p) => sum + (Number(p.quantity_thrown) || 0), 0);

  // Monthly breakdown
  const months = [];
  for (let i = 0; i < 3; i++) {
    const mStart = startOfMonth(new Date(periodStart.getFullYear(), periodStart.getMonth() + i, 1));
    const mEnd = endOfMonth(mStart);
    const mProducts = thrown.filter(p => {
      const d = new Date(getLossReferenceDate(p) || periodStart);
      return d >= mStart && d <= mEnd;
    });
    const mLoss = mProducts.reduce((sum, p) => sum + getProductLoss(p), 0);
    months.push({ month: format(mStart, 'MMM', { locale: fr }), loss: mLoss, count: mProducts.length });
  }

  // By category
  const catMap = {};
  thrown.forEach(p => {
    const cat = p.category || 'autre';
    catMap[cat] = (catMap[cat] || 0) + getProductLoss(p);
  });
  const topCategories = Object.entries(catMap)
    .map(([name, loss]) => ({ name, loss }))
    .sort((a, b) => b.loss - a.loss);

  // By rayon
  const rayonMap = {};
  thrown.forEach(p => {
    const r = p.rayon || '?';
    rayonMap[r] = (rayonMap[r] || 0) + getProductLoss(p);
  });
  const topRayons = Object.entries(rayonMap)
    .map(([name, loss]) => ({ name, loss }))
    .sort((a, b) => b.loss - a.loss);

  // Insights
  const insights = [];
  if (topCategories.length > 0 && totalLoss > 0) {
    const top = topCategories[0];
    const pct = Math.round((top.loss / totalLoss) * 100);
    const catLabels = { snacks:'Snacks', boissons:'Boissons', produits_frais:'Les produits frais', epicerie_seche:"L'épicerie sèche", confiseries:'Les confiseries', conserves:'Les conserves', congeles_poisson:'Les congelés poisson', congeles_poulet:'Les congelés poulet', hygiene_beaute:"L'hygiène & beauté", entretien_maison:"L'entretien maison", bebe:'Les produits bébé', animaux:'Les produits animaux', alcool:"L'alcool", tabac:'Le tabac' };
    insights.push(`${catLabels[top.name] || top.name} représente ${pct}% des pertes cette période.`);
  }
  if (topRayons.length > 0) {
    insights.push(`Le rayon ${topRayons[0].name} génère le plus de gaspillage (CHF ${Number(topRayons[0].loss).toFixed(2)}).`);
  }
  if (prevQuarterLoss > 0) {
    const diff = ((totalLoss - prevQuarterLoss) / prevQuarterLoss) * 100;
    if (diff < 0) {
      insights.push(`Bonne nouvelle : les pertes ont diminué de ${Math.abs(diff).toFixed(1)}% par rapport au trimestre précédent.`);
    } else if (diff > 0) {
      insights.push(`Attention : les pertes ont augmenté de ${diff.toFixed(1)}% par rapport au trimestre précédent. Un audit des rayons est recommandé.`);
    }
  }
  if (thrown.length > 3) {
    const sortedByLoss = [...thrown].sort((a, b) => getProductLoss(b) - getProductLoss(a));
    const topProduct = sortedByLoss[0];
    const topLoss = getProductLoss(topProduct);
    insights.push(`"${topProduct.name}" est le produit le plus coûteux à éliminer (CHF ${topLoss.toFixed(2)}).`);
  }
  if (totalThrown > 0 && totalLoss > 0) {
    const avgLossPerUnit = totalLoss / totalThrown;
    insights.push(`Perte moyenne par unité jetée : CHF ${avgLossPerUnit.toFixed(2)}.`);
  }

  const thrownWithTotal = thrown.map(p => ({
    ...p,
    total: getProductLoss(p)
  }));

  return {
    total_loss_chf: totalLoss,
    total_products_thrown: totalThrown,
    total_products_tracked: products.length,
    total_expired: thrown.length,
    previous_quarter_loss_chf: prevQuarterLoss,
    top_categories: JSON.stringify(topCategories),
    top_rayons: JSON.stringify(topRayons),
    monthly_breakdown: JSON.stringify(months),
    thrown_products: JSON.stringify(thrownWithTotal),
    insights: JSON.stringify(insights),
    shop_name: shopName,
  };
}