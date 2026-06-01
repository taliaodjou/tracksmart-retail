import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useLanguage } from '@/lib/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { getProductStatus, getDaysRemaining, categoryKeys, hasActiveSubscription, getStoreOwnerEmail, isAdmin, calculateTotalLoss, isDiscarded } from '@/lib/productUtils';
import { format, startOfMonth, subMonths, isSameMonth } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { TrendingDown, TrendingUp, PackageX, Flame, AlertTriangle, BarChart2 } from 'lucide-react';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardFooter from '@/components/dashboard/DashboardFooter';
import SubscriptionGate from '@/components/dashboard/SubscriptionGate';
import PremiumGate from '@/components/dashboard/PremiumGate';

const MONTHS_BACK = 6;

function getMonthKey(date) {
  return format(date, 'yyyy-MM');
}

function getMonthLabel(key, lang) {
  const [y, m] = key.split('-');
  const d = new Date(parseInt(y), parseInt(m) - 1, 1);
  return lang === 'fr'
    ? format(d, 'MMM yy', { locale: fr })
    : format(d, 'MMM yy');
}

export default function Analytics() {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const canAccess = hasActiveSubscription(user);

  const storeOwnerEmail = getStoreOwnerEmail(user);
  const isOwnerOrManager = user?.role === 'owner' || user?.role === 'user' || user?.role === 'manager';

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products', storeOwnerEmail, isOwnerOrManager],
    queryFn: async () => {
      if (isOwnerOrManager) {
        const [byStoreOwner, byCreator] = await Promise.all([
          base44.entities.Product.filter({ store_owner_email: storeOwnerEmail }, '-created_date', 2000),
          base44.entities.Product.filter({ created_by: storeOwnerEmail }, '-created_date', 2000),
        ]);
        const seen = new Set();
        const storeOwnerProds = byStoreOwner.filter(p => { if (seen.has(p.id)) return false; seen.add(p.id); return true; });
        const creatorProds = byCreator.filter(p => { if (seen.has(p.id)) return false; seen.add(p.id); return !p.store_owner_email || p.store_owner_email === storeOwnerEmail; });
        return [...storeOwnerProds, ...creatorProds];
      }
      return base44.entities.Product.filter({ created_by: user.email }, '-created_date');
    },
    enabled: canAccess && !!user?.email,
  });

  // Build monthly data for the last MONTHS_BACK months
  const monthlyData = useMemo(() => {
    const months = [];
    for (let i = MONTHS_BACK - 1; i >= 0; i--) {
      const d = subMonths(new Date(), i);
      months.push(getMonthKey(d));
    }

    return months.map(monthKey => {
      const [y, m] = monthKey.split('-');
      const monthDate = new Date(parseInt(y), parseInt(m) - 1, 1);

      // Products that expired OR were discarded in this month
      const expiredInMonth = products.filter(p => {
        if (!p.expiration_date && !p.discarded_at) return false;
        // Discarded: use discarded_at date if available, otherwise expiration_date
        const dateToCheck = p.discarded_at ? new Date(p.discarded_at) : (p.expiration_date ? new Date(p.expiration_date) : null);
        if (!dateToCheck) return false;
        return isSameMonth(dateToCheck, monthDate);
      });

      const totalLoss = expiredInMonth.reduce((sum, p) => sum + ((p.quantity_thrown || 0) * (p.price_chf || 0)), 0);
      const totalThrown = expiredInMonth.reduce((sum, p) => sum + (p.quantity_thrown || 0), 0);

      return {
        month: monthKey,
        label: getMonthLabel(monthKey, lang),
        expiredCount: expiredInMonth.length,
        totalLoss: parseFloat(totalLoss.toFixed(2)),
        totalThrown,
      };
    });
  }, [products, lang]);

  // Current month vs previous month trend
  const currentMonth = monthlyData[monthlyData.length - 1];
  const prevMonth = monthlyData[monthlyData.length - 2];
  const lossTrend = prevMonth?.totalLoss > 0
    ? (((currentMonth?.totalLoss - prevMonth.totalLoss) / prevMonth.totalLoss) * 100).toFixed(0)
    : null;
  const expiredTrend = prevMonth?.expiredCount > 0
    ? currentMonth?.expiredCount - prevMonth.expiredCount
    : null;

  // Category analysis — includes discarded products
  const categoryStats = useMemo(() => {
    const map = {};
    products.forEach(p => {
      if (!p.category) return;
      if (!map[p.category]) map[p.category] = { count: 0, loss: 0, thrown: 0 };
      if (isDiscarded(p) || getProductStatus(p.expiration_date) === 'expired') {
        map[p.category].count++;
        map[p.category].loss += (p.quantity_thrown || 0) * (p.price_chf || 0);
        map[p.category].thrown += (p.quantity_thrown || 0);
      }
    });
    return Object.entries(map)
      .map(([cat, data]) => ({ cat, label: t(categoryKeys[cat] || cat), ...data }))
      .sort((a, b) => b.loss - a.loss)
      .slice(0, 6);
  }, [products, t]);

  // Rayon analysis — includes discarded products
  const rayonStats = useMemo(() => {
    const map = {};
    products.forEach(p => {
      if (!p.rayon) return;
      if (!map[p.rayon]) map[p.rayon] = { count: 0, loss: 0 };
      if (isDiscarded(p) || getProductStatus(p.expiration_date) === 'expired') {
        map[p.rayon].count++;
        map[p.rayon].loss += (p.quantity_thrown || 0) * (p.price_chf || 0);
      }
    });
    return Object.entries(map)
      .map(([rayon, data]) => ({ rayon: `R${rayon}`, ...data }))
      .sort((a, b) => b.loss - a.loss)
      .slice(0, 8);
  }, [products]);

  // Most problematic products — includes discarded
  const topProblematicProducts = useMemo(() => {
    return products
      .filter(p => (isDiscarded(p) || getProductStatus(p.expiration_date) === 'expired') && p.price_chf)
      .sort((a, b) => ((b.quantity_thrown || 0) * (b.price_chf || 0)) - ((a.quantity_thrown || 0) * (a.price_chf || 0)))
      .slice(0, 5);
  }, [products]);

  if (!canAccess) {
    const hasSubscription = user?.subscription_status === 'active';
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#f5f5f5', color: '#1a1a1a' }}>
        <DashboardHeader />
        {hasSubscription
          ? <PremiumGate featureName="les analytiques" />
          : <SubscriptionGate />
        }
      </div>
    );
  }

  // Include discarded products in loss calculations — they are archived, not deleted
  const totalLossAll = calculateTotalLoss(products);
  const totalExpired = products.filter(p => isDiscarded(p) || getProductStatus(p.expiration_date) === 'expired').length;
  const totalThrown = products.reduce((sum, p) => sum + (p.quantity_thrown || 0), 0);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f5f5', color: '#1a1a1a' }}>
      <DashboardHeader />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-8 space-y-8">

        {/* Title */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <BarChart2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {lang === 'fr' ? 'Historique & Analytiques' : 'History & Analytics'}
            </h1>
            <p className="text-sm text-muted-foreground">
              {lang === 'fr' ? 'Suivi des pertes et tendances sur 6 mois' : '6-month loss tracking and trends'}
            </p>
          </div>
        </div>

        {/* Summary KPIs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <KpiCard
            icon={<TrendingDown className="w-5 h-5 text-primary" />}
            value={`CHF ${totalLossAll.toFixed(2)}`}
            label={lang === 'fr' ? 'Pertes totales' : 'Total losses'}
            bg="bg-primary/10"
          />
          <KpiCard
            icon={<PackageX className="w-5 h-5 text-red-500" />}
            value={totalExpired}
            label={lang === 'fr' ? 'Produits expirés' : 'Expired products'}
            bg="bg-red-50"
          />
          <KpiCard
            icon={<Flame className="w-5 h-5 text-orange-500" />}
            value={totalThrown}
            label={lang === 'fr' ? 'Quantité jetée' : 'Quantity thrown'}
            bg="bg-orange-50"
          />
          <KpiCard
            icon={<AlertTriangle className="w-5 h-5 text-yellow-500" />}
            value={products.filter(p => getProductStatus(p.expiration_date) === 'urgent').length}
            label={lang === 'fr' ? 'Urgents maintenant' : 'Urgent now'}
            bg="bg-yellow-50"
          />
        </div>

        {/* Trend banners */}
        {(lossTrend !== null || expiredTrend !== null) && (
          <div className="flex flex-wrap gap-3">
            {lossTrend !== null && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${
                Number(lossTrend) < 0
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}>
                {Number(lossTrend) < 0 ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                {Number(lossTrend) < 0 ? '' : '+'}{lossTrend}% {lang === 'fr' ? 'pertes ce mois' : 'losses this month'}
              </div>
            )}
            {expiredTrend !== null && (
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border ${
                expiredTrend < 0
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}>
                {expiredTrend < 0 ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                {expiredTrend > 0 ? '+' : ''}{expiredTrend} {lang === 'fr' ? 'produits expirés' : 'expired products'}
              </div>
            )}
          </div>
        )}

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Loss chart */}
          <ChartCard title={lang === 'fr' ? 'Pertes par mois (CHF)' : 'Monthly Losses (CHF)'}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [`CHF ${v}`, lang === 'fr' ? 'Pertes' : 'Losses']} />
                <Bar dataKey="totalLoss" radius={[6, 6, 0, 0]}>
                  {monthlyData.map((_, i) => (
                    <Cell key={i} fill={i === monthlyData.length - 1 ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.4)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Expired products chart */}
          <ChartCard title={lang === 'fr' ? 'Produits expirés par mois' : 'Expired products per month'}>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={monthlyData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [v, lang === 'fr' ? 'Expirés' : 'Expired']} />
                <Line type="monotone" dataKey="expiredCount" stroke="hsl(var(--destructive))" strokeWidth={2} dot={{ r: 4, fill: 'hsl(var(--destructive))' }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Thrown quantity chart */}
          <ChartCard title={lang === 'fr' ? 'Quantité jetée par mois' : 'Quantity thrown per month'}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={monthlyData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v) => [v, lang === 'fr' ? 'Unités jetées' : 'Units thrown']} />
                <Bar dataKey="totalThrown" radius={[6, 6, 0, 0]}>
                  {monthlyData.map((_, i) => (
                    <Cell key={i} fill={i === monthlyData.length - 1 ? '#f97316' : '#fed7aa'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Category loss chart */}
          <ChartCard title={lang === 'fr' ? 'Pertes par catégorie (CHF)' : 'Losses by category (CHF)'}>
            {categoryStats.length === 0 ? (
              <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">
                {lang === 'fr' ? 'Aucune donnée' : 'No data'}
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={categoryStats} layout="vertical" margin={{ top: 5, right: 30, bottom: 5, left: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 11 }} />
                  <YAxis dataKey="label" type="category" tick={{ fontSize: 11 }} width={55} />
                  <Tooltip formatter={(v) => [`CHF ${v.toFixed(2)}`, lang === 'fr' ? 'Pertes' : 'Losses']} />
                  <Bar dataKey="loss" radius={[0, 6, 6, 0]} fill="hsl(var(--primary) / 0.7)" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </ChartCard>
        </div>

        {/* Smart insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Rayons à surveiller */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-border/40">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              {lang === 'fr' ? 'Rayons à surveiller' : 'Sections to monitor'}
            </h3>
            {rayonStats.length === 0 ? (
              <p className="text-sm text-muted-foreground">{lang === 'fr' ? 'Aucun rayon problématique.' : 'No problematic sections.'}</p>
            ) : (
              <div className="space-y-2">
                {rayonStats.map((r, i) => (
                  <div key={r.rayon} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                        i === 0 ? 'bg-red-500' : i === 1 ? 'bg-orange-500' : 'bg-yellow-500'
                      }`}>{i + 1}</span>
                      <span className="font-medium text-sm text-foreground">{lang === 'fr' ? 'Rayon' : 'Section'} {r.rayon.slice(1)}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">CHF {r.loss.toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground">{r.count} {lang === 'fr' ? 'expirés' : 'expired'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Produits les plus problématiques */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-border/40">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Flame className="w-4 h-4 text-red-500" />
              {lang === 'fr' ? 'Produits les plus problématiques' : 'Most problematic products'}
            </h3>
            {topProblematicProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">{lang === 'fr' ? 'Aucune perte enregistrée.' : 'No losses recorded.'}</p>
            ) : (
              <div className="space-y-2">
                {topProblematicProducts.map((p, i) => {
                  const loss = (p.quantity_thrown || 0) * (p.price_chf || 0);
                  return (
                    <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                      <div className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                          i === 0 ? 'bg-red-500' : i === 1 ? 'bg-orange-500' : 'bg-yellow-500'
                        }`}>{i + 1}</span>
                        <div>
                          <p className="text-sm font-medium text-foreground">{p.name}</p>
                          {p.marque && <p className="text-xs text-muted-foreground">{p.marque}</p>}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-red-600">CHF {loss.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground">{p.quantity_thrown} {lang === 'fr' ? 'jetés' : 'thrown'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      </main>
      <DashboardFooter />
    </div>
  );
}

function KpiCard({ icon, value, label, bg }) {
  return (
    <div className="bg-white rounded-2xl border border-border/40 shadow-sm p-5 flex flex-col gap-3">
      <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>{icon}</div>
      <div>
        <p className="text-xl font-bold text-foreground">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-2xl border border-border/40 shadow-sm p-5">
      <h3 className="font-semibold text-sm text-foreground mb-4">{title}</h3>
      {children}
    </div>
  );
}