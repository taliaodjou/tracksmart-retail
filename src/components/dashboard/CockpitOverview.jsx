import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, TrendingDown, List, ClipboardCheck, ChevronRight } from 'lucide-react';
import { BarChart, Bar, ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area } from 'recharts';
import { getProductStatus, getDaysRemaining, isDiscarded, getProductLoss, getLossReferenceDate } from '@/lib/productUtils';
import { expandProductsByStockDates } from '@/lib/stockEntries';

const monthsFr = ['jan', 'fév', 'mars', 'avr', 'mai', 'juin', 'juil', 'août', 'sep', 'oct', 'nov', 'déc'];

export default function CockpitOverview({ products }) {
  const data = useMemo(() => {
    const now = new Date();
    const months = Array.from({ length: 6 }, (_, index) => {
      const d = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
      return { key: `${d.getFullYear()}-${d.getMonth()}`, month: monthsFr[d.getMonth()], pertes: 0, cumulative: 0 };
    });

    products.forEach((product) => {
      const loss = getProductLoss(product);
      if (loss <= 0) return;
      const rawDate = getLossReferenceDate(product);
      const date = rawDate ? new Date(rawDate) : now;
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const entry = months.find((m) => m.key === key);
      if (entry) entry.pertes += loss;
    });

    let running = 0;
    return months.map((month) => {
      running += month.pertes;
      return { ...month, cumulative: Number(running.toFixed(2)) };
    });
  }, [products]);

  const activeProducts = products.filter((product) => !isDiscarded(product));
  const urgentProducts = expandProductsByStockDates(activeProducts)
    .filter((product) => ['expired', 'urgent'].includes(getProductStatus(product.expiration_date)))
    .sort((a, b) => new Date(a.expiration_date) - new Date(b.expiration_date))
    .slice(0, 4);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <section className="bg-white rounded-2xl border border-border/50 shadow-sm p-5 min-h-[210px]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg text-foreground">Pertes</h2>
            <Link to="/analytics" className="text-xs font-medium text-foreground hover:text-primary inline-flex items-center gap-1">
              Voir détails <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={data}>
              <CartesianGrid vertical={false} stroke="#E8E0D3" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value) => [`CHF ${Number(value).toFixed(2)}`, 'Pertes']} />
              <Bar dataKey="pertes" fill="#C9A646" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </section>

        <section className="bg-white rounded-2xl border border-border/50 shadow-sm p-5 min-h-[210px]">
          <h2 className="font-bold text-lg text-foreground mb-4">Urgences</h2>
          <div className="space-y-2">
            <div className="grid grid-cols-[1fr_auto_auto] gap-3 text-xs font-semibold text-muted-foreground border-b border-border/40 pb-2">
              <span>Produit</span>
              <span>Statut</span>
              <span>DLC</span>
            </div>
            {urgentProducts.length > 0 ? urgentProducts.map((product) => {
              const status = getProductStatus(product.expiration_date);
              return (
                <Link key={product.id} to="/products" className="grid grid-cols-[1fr_auto_auto] gap-3 items-center py-2 text-sm hover:bg-secondary/40 rounded-lg px-1">
                  <span className="font-medium text-foreground truncate">{product.name}</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-semibold ${status === 'expired' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                    {status === 'expired' ? 'Expiré' : 'Urgent'}
                  </span>
                  <span className="text-muted-foreground whitespace-nowrap">{getDaysRemaining(product.expiration_date)}j</span>
                </Link>
              );
            }) : (
              <div className="py-8 text-sm text-muted-foreground text-center">Aucune urgence</div>
            )}
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-border/50 shadow-sm p-5 min-h-[210px]">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg text-foreground">Évolution</h2>
            <span className="text-xs rounded-full border border-border px-3 py-1 text-muted-foreground">Pertes CHF</span>
          </div>
          <ResponsiveContainer width="100%" height={140}>
            <ComposedChart data={data}>
              <defs>
                <linearGradient id="lossFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C9A646" stopOpacity={0.35}/>
                  <stop offset="95%" stopColor="#C9A646" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#E8E0D3" />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
              <Tooltip formatter={(value) => [`CHF ${Number(value).toFixed(2)}`, 'Pertes cumulées']} />
              <Area type="monotone" dataKey="cumulative" stroke="none" fill="url(#lossFill)" />
              <Line type="monotone" dataKey="cumulative" stroke="#C9A646" strokeWidth={3} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </section>
      </div>

      <section className="rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/80 border border-slate-100 shadow-sm p-4 sm:p-5">
        <h2 className="font-bold text-xl text-slate-700 mb-4">Actions prioritaires</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link to="/products" className="group relative overflow-hidden bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-4 min-h-[132px] flex flex-col justify-between hover:shadow-md transition-shadow">
            <span className="absolute inset-y-0 left-0 w-1.5 bg-[#C9A646]" />
            <div className="flex items-start justify-between gap-3 pl-2">
              <List className="w-7 h-7 text-[#C9A646]" />
              <ChevronRight className="w-5 h-5 text-slate-400 mt-7 group-hover:text-[#C9A646]" />
            </div>
            <div className="pl-2">
              <h3 className="text-lg sm:text-xl font-bold leading-tight text-slate-950 mb-2">Ouvrir la liste produits</h3>
              <p className="text-xs text-slate-500">Accéder au stock complet</p>
            </div>
          </Link>
          <Link to="/analytics" className="group relative overflow-hidden bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-4 min-h-[132px] flex flex-col justify-between hover:shadow-md transition-shadow">
            <span className="absolute inset-y-0 left-0 w-1.5 bg-[#EF4444]" />
            <div className="flex items-start justify-between gap-3 pl-2">
              <TrendingDown className="w-7 h-7 text-[#EF4444]" />
              <ChevronRight className="w-5 h-5 text-slate-400 mt-7 group-hover:text-[#EF4444]" />
            </div>
            <div className="pl-2">
              <h3 className="text-lg sm:text-xl font-bold leading-tight text-slate-950 mb-2">Analyser les pertes</h3>
              <p className="text-xs text-slate-500">Repérer les rayons à risque</p>
            </div>
          </Link>
          <Link to="/products?status=urgent" className="group relative overflow-hidden bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-4 min-h-[132px] flex flex-col justify-between hover:shadow-md transition-shadow">
            <span className="absolute inset-y-0 left-0 w-1.5 bg-[#F97316]" />
            <div className="flex items-start justify-between gap-3 pl-2">
              <ClipboardCheck className="w-7 h-7 text-[#F97316]" />
              <ChevronRight className="w-5 h-5 text-slate-400 mt-7 group-hover:text-[#F97316]" />
            </div>
            <div className="pl-2">
              <h3 className="text-lg sm:text-xl font-bold leading-tight text-slate-950 mb-2">Valider les stocks urgents</h3>
              <p className="text-xs text-slate-500">Contrôler les produits à traiter</p>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}