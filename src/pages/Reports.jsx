import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';
import { hasActiveSubscription } from '@/lib/productUtils';
import { computeReportData, getCurrentQuarterPeriod, getLastQuarterPeriod, formatQuarterLabel } from '@/lib/reportUtils';
import { generateReportHTML } from '@/components/reports/QuarterlyReportPDF';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardFooter from '@/components/dashboard/DashboardFooter';
import PremiumGate from '@/components/dashboard/PremiumGate';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  FileText, Download, Printer, TrendingDown, TrendingUp, Package,
  AlertTriangle, ChevronRight, Clock, BarChart2, Loader2, Plus, Eye
} from 'lucide-react';
import { toast } from 'sonner';

const GOLD = '#C9A646';

const MONTH_NAMES_FR = ['Janvier','Février','Mars','Avril','Mai','Juin','Juillet','Août','Septembre','Octobre','Novembre','Décembre'];

function StatCard({ label, value, sub, accent = false, icon: Icon }) {
  return (
    <div className={`bg-white rounded-xl p-3 border shadow-sm flex items-center gap-3 ${accent ? 'border-[#C9A646]/40 bg-gradient-to-br from-[#fdf9ee] to-white' : 'border-border/40'}`}>
      {Icon && (
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${accent ? 'bg-[#C9A646]/10' : 'bg-secondary'}`}>
          <Icon className={`w-4 h-4 ${accent ? 'text-[#C9A646]' : 'text-muted-foreground'}`} />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground font-medium truncate mb-0.5">{label}</p>
        <p className={`text-sm font-bold break-all leading-tight ${accent ? 'text-[#C9A646]' : 'text-foreground'}`}>{value}</p>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </div>
    </div>
  );
}

function ReportCard({ report, onView, onPrint, onDownload }) {
  const prevLoss = report.previous_quarter_loss_chf || 0;
  const currLoss = report.total_loss_chf || 0;
  const evolution = prevLoss > 0 ? ((currLoss - prevLoss) / prevLoss) * 100 : null;

  return (
    <div className="bg-white rounded-2xl border border-border/40 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="h-1.5" style={{ background: `linear-gradient(90deg,${GOLD},#e8c96d,${GOLD})` }} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-bold text-foreground text-base">{report.quarter_label}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {report.period_start && report.period_end
                ? `${format(new Date(report.period_start), 'dd MMM', { locale: fr })} — ${format(new Date(report.period_end), 'dd MMM yyyy', { locale: fr })}`
                : ''}
            </p>
          </div>
          <Badge className="bg-[#C9A646]/10 text-[#9a7c2e] border-[#C9A646]/20 text-xs">
            <FileText className="w-3 h-3 mr-1" />
            Rapport
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-secondary/40 rounded-xl p-3">
            <p className="text-xs text-muted-foreground mb-1">Pertes totales</p>
            <p className="text-lg font-bold text-foreground">CHF {Number(currLoss).toFixed(2)}</p>
            {evolution !== null && (
              <div className={`flex items-center gap-1 mt-1 text-xs font-medium ${evolution < 0 ? 'text-green-600' : 'text-red-500'}`}>
                {evolution < 0 ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                {evolution < 0 ? '' : '+'}{evolution.toFixed(1)}%
              </div>
            )}
          </div>
          <div className="bg-secondary/40 rounded-xl p-3">
            <p className="text-xs text-muted-foreground mb-1">Produits jetés</p>
            <p className="text-lg font-bold text-foreground">{report.total_products_thrown || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">unités</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={() => onView(report)} className="flex-1 text-xs gap-1.5">
            <Eye className="w-3.5 h-3.5" /> Voir
          </Button>
          <Button size="sm" variant="outline" onClick={() => onPrint(report)} className="flex-1 text-xs gap-1.5">
            <Printer className="w-3.5 h-3.5" /> Imprimer
          </Button>
          <Button size="sm" onClick={() => onDownload(report)} className="flex-1 text-xs gap-1.5" style={{ background: GOLD, color: '#fff', border: 'none' }}>
            <Download className="w-3.5 h-3.5" /> PDF
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function Reports() {
  const { user } = useAuth();
  const { lang } = useLanguage();
  const queryClient = useQueryClient();
  const [generating, setGenerating] = useState(false);
  const [previewReport, setPreviewReport] = useState(null);

  const { data: products = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const { data: reports = [] } = useQuery({
    queryKey: ['quarterly-reports'],
    queryFn: () => base44.entities.QuarterlyReport.filter({ user_email: user?.email }, '-created_date', 20),
    enabled: !!user?.email,
  });

  const createReport = useMutation({
    mutationFn: (data) => base44.entities.QuarterlyReport.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['quarterly-reports'] }),
  });

  if (!hasActiveSubscription(user)) return <PremiumGate feature="les rapports trimestriels" />;

  const acctStartMonth = user?.accounting_start_month ?? 0;

  const currentPeriod = getCurrentQuarterPeriod(acctStartMonth);
  const lastPeriod = getLastQuarterPeriod(acctStartMonth);

  // Compute live stats for current quarter
  const currentStats = computeReportData(products, currentPeriod.start, currentPeriod.end, 0, user?.shop_name || '');
  const lastStats = computeReportData(products, lastPeriod.start, lastPeriod.end, 0, user?.shop_name || '');

  const handleGenerate = async (period, label) => {
    setGenerating(true);
    const prev = reports[0]?.total_loss_chf || 0;
    const data = computeReportData(products, period.start, period.end, prev, user?.shop_name || '');
    const payload = {
      user_email: user.email,
      shop_name: user.shop_name || '',
      quarter_label: label,
      period_start: format(period.start, 'yyyy-MM-dd'),
      period_end: format(period.end, 'yyyy-MM-dd'),
      status: 'generated',
      ...data,
    };
    await createReport.mutateAsync(payload);
    setGenerating(false);
    toast.success('Rapport généré avec succès !');
  };

  const handlePrint = (report) => {
    const html = generateReportHTML(report);
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  const handleDownload = (report) => {
    const html = generateReportHTML(report);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tracksmart-rapport-${report.quarter_label?.replace(/\s/g, '-') || 'rapport'}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleView = (report) => {
    setPreviewReport(report);
  };

  const currentLabel = formatQuarterLabel(currentPeriod.start, currentPeriod.end);
  const lastLabel = formatQuarterLabel(lastPeriod.start, lastPeriod.end);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f5f5', color: '#1a1a1a' }}>
      <DashboardHeader />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-12">

        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: GOLD }}>
              <BarChart2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Rapports trimestriels</h1>
              <p className="text-sm text-muted-foreground">Analyse financière des pertes produits</p>
            </div>
          </div>
        </div>

        {/* Current Quarter Live Stats */}
        <div className="bg-white rounded-2xl border border-[#C9A646]/30 shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-foreground text-lg">Trimestre en cours</h2>
              <p className="text-sm text-muted-foreground">{currentLabel}</p>
            </div>
            <Button
              onClick={() => handleGenerate(currentPeriod, currentLabel)}
              disabled={generating}
              className="gap-2 text-sm font-semibold"
              style={{ background: GOLD, color: '#fff', border: 'none' }}
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              Générer rapport
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Pertes estimées" value={`CHF ${Number(currentStats.total_loss_chf).toFixed(2)}`} icon={TrendingDown} accent />
            <StatCard label="Produits jetés" value={currentStats.total_products_thrown} sub="unités" icon={Package} />
            <StatCard label="Produits suivis" value={currentStats.total_products_tracked} sub="références" icon={BarChart2} />
            <StatCard label="Expirés" value={currentStats.total_expired} sub="références" icon={AlertTriangle} />
          </div>
        </div>

        {/* Last Quarter */}
        <div className="bg-white rounded-2xl border border-border/40 shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-foreground text-lg">Trimestre précédent</h2>
              <p className="text-sm text-muted-foreground">{lastLabel}</p>
            </div>
            <Button
              variant="outline"
              onClick={() => handleGenerate(lastPeriod, lastLabel)}
              disabled={generating}
              className="gap-2 text-sm"
            >
              {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Générer rapport
            </Button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard label="Pertes estimées" value={`CHF ${Number(lastStats.total_loss_chf).toFixed(2)}`} icon={TrendingDown} />
            <StatCard label="Produits jetés" value={lastStats.total_products_thrown} sub="unités" icon={Package} />
            <StatCard label="Produits suivis" value={lastStats.total_products_tracked} sub="références" icon={BarChart2} />
            <StatCard label="Expirés" value={lastStats.total_expired} sub="références" icon={AlertTriangle} />
          </div>
        </div>

        {/* Report History */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-foreground text-lg">Historique des rapports</h2>
            <span className="text-sm text-muted-foreground">{reports.length} rapport(s)</span>
          </div>

          {reports.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-border/60 p-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground/40 mx-auto mb-4" />
              <p className="text-foreground font-medium mb-1">Aucun rapport généré</p>
              <p className="text-sm text-muted-foreground">Cliquez sur "Générer rapport" pour créer votre premier rapport trimestriel.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {reports.map(r => (
                <ReportCard
                  key={r.id}
                  report={r}
                  onView={handleView}
                  onPrint={handlePrint}
                  onDownload={handleDownload}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Preview Modal */}
      {previewReport && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setPreviewReport(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-5 border-b border-border/40">
              <div>
                <h3 className="font-bold text-foreground">{previewReport.quarter_label}</h3>
                <p className="text-xs text-muted-foreground">{previewReport.shop_name}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => handlePrint(previewReport)} className="gap-1.5 text-xs">
                  <Printer className="w-3.5 h-3.5" /> Imprimer
                </Button>
                <Button size="sm" onClick={() => handleDownload(previewReport)} className="gap-1.5 text-xs" style={{ background: GOLD, color: '#fff', border: 'none' }}>
                  <Download className="w-3.5 h-3.5" /> Télécharger
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setPreviewReport(null)} className="text-xs">Fermer</Button>
              </div>
            </div>
            <ReportPreview report={previewReport} />
          </div>
        </div>
      )}

      <DashboardFooter />
    </div>
  );
}

function ReportPreview({ report }) {
  const thrown = (() => { try { return JSON.parse(report.thrown_products || '[]'); } catch { return []; } })();
  const insights = (() => { try { return JSON.parse(report.insights || '[]'); } catch { return []; } })();
  const topCats = (() => { try { return JSON.parse(report.top_categories || '[]'); } catch { return []; } })();
  const monthly = (() => { try { return JSON.parse(report.monthly_breakdown || '[]'); } catch { return []; } })();
  const prevLoss = report.previous_quarter_loss_chf || 0;
  const currLoss = report.total_loss_chf || 0;
  const evolution = prevLoss > 0 ? ((currLoss - prevLoss) / prevLoss) * 100 : null;

  const catLabels = { snacks:'Snacks', boissons:'Boissons', produits_frais:'Produits frais', epicerie_seche:'Épicerie sèche', confiseries:'Confiseries', conserves:'Conserves', congeles_poisson:'Congelés poisson', congeles_poulet:'Congelés poulet', hygiene_beaute:'Hygiène & Beauté', entretien_maison:'Entretien maison', bebe:'Bébé', animaux:'Animaux', alcool:'Alcool', tabac:'Tabac' };
  const maxCat = Math.max(...topCats.map(c => c.loss || 0), 1);

  return (
    <div className="p-5 space-y-6">
      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl p-4 text-center" style={{ background: '#fdf9ee', border: `1px solid ${GOLD}30` }}>
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Pertes totales</p>
          <p className="text-2xl font-bold" style={{ color: GOLD }}>CHF {Number(currLoss).toFixed(2)}</p>
          {evolution !== null && (
            <p className={`text-xs mt-1 font-medium ${evolution < 0 ? 'text-green-600' : 'text-red-500'}`}>
              {evolution < 0 ? '▼' : '▲'} {Math.abs(evolution).toFixed(1)}% vs trimestre précédent
            </p>
          )}
        </div>
        <div className="rounded-xl p-4 text-center bg-secondary/40">
          <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Produits jetés</p>
          <p className="text-2xl font-bold text-foreground">{report.total_products_thrown || 0}</p>
          <p className="text-xs text-muted-foreground mt-1">unités</p>
        </div>
      </div>

      {/* Monthly */}
      {monthly.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3">Pertes par mois</h4>
          <div className="space-y-2">
            {monthly.map(m => {
              const maxM = Math.max(...monthly.map(x => x.loss || 0), 1);
              const pct = Math.round(((m.loss || 0) / maxM) * 100);
              return (
                <div key={m.month} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-12 capitalize">{m.month}</span>
                  <div className="flex-1 bg-secondary rounded-full h-2">
                    <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: GOLD }} />
                  </div>
                  <span className="text-xs font-medium w-20 text-right text-foreground">CHF {Number(m.loss || 0).toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top categories */}
      {topCats.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3">Par catégorie</h4>
          <div className="space-y-2">
            {topCats.slice(0, 5).map(c => {
              const pct = Math.round(((c.loss || 0) / maxCat) * 100);
              return (
                <div key={c.name} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-28 truncate">{catLabels[c.name] || c.name}</span>
                  <div className="flex-1 bg-secondary rounded-full h-2">
                    <div className="h-2 rounded-full" style={{ width: `${pct}%`, background: GOLD }} />
                  </div>
                  <span className="text-xs font-medium w-20 text-right text-foreground">CHF {Number(c.loss || 0).toFixed(2)}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Insights */}
      {insights.length > 0 && (
        <div className="rounded-xl p-4" style={{ background: '#fdf9ee', border: `1px solid ${GOLD}30` }}>
          <h4 className="text-sm font-semibold mb-3" style={{ color: GOLD }}>💡 Recommandations</h4>
          <ul className="space-y-2">
            {insights.map((ins, i) => (
              <li key={i} className="text-xs text-foreground flex gap-2">
                <span className="text-[#C9A646] mt-0.5">→</span>
                <span>{ins}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Table */}
      {thrown.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-3">Détail produits jetés</h4>
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/40">
                  <th className="py-2 pr-3 text-left text-muted-foreground font-medium">Produit</th>
                  <th className="py-2 pr-3 text-left text-muted-foreground font-medium hidden sm:table-cell">Catégorie</th>
                  <th className="py-2 pr-3 text-center text-muted-foreground font-medium">Qté</th>
                  <th className="py-2 text-right text-muted-foreground font-medium">Total</th>
                </tr>
              </thead>
              <tbody>
                {thrown.map((p, i) => (
                  <tr key={i} className="border-b border-border/20">
                    <td className="py-2 pr-3 font-medium text-foreground">{p.name}</td>
                    <td className="py-2 pr-3 text-muted-foreground hidden sm:table-cell">{catLabels[p.category] || p.category || '—'}</td>
                    <td className="py-2 pr-3 text-center text-foreground">{p.quantity_thrown}</td>
                    <td className="py-2 text-right font-bold text-red-600">CHF {Number(p.total || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="3" className="py-3 text-right font-bold text-foreground text-sm pr-3 hidden sm:table-cell">Total</td>
                  <td colSpan="3" className="py-3 text-right font-bold text-foreground text-sm pr-3 sm:hidden">Total</td>
                  <td className="py-3 text-right font-bold text-red-600 text-sm">CHF {Number(currLoss).toFixed(2)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}