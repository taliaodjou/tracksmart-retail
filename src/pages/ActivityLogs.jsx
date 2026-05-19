import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getStoreOwnerEmail } from '@/lib/activityLogger';
import { hasActiveSubscription } from '@/lib/productUtils';
import DashboardFooter from '@/components/dashboard/DashboardFooter';
import {
  Activity, Package, ScanLine, FileSpreadsheet, ShoppingCart,
  FileText, UserPlus, Trash2, Edit3, ArrowRightLeft, Filter
} from 'lucide-react';

const ACTION_CONFIG = {
  product_added:        { label: 'Produit ajouté',           icon: Package,         color: 'text-green-600',  bg: 'bg-green-50',  border: 'border-green-200' },
  product_edited:       { label: 'Produit modifié',          icon: Edit3,           color: 'text-blue-600',   bg: 'bg-blue-50',   border: 'border-blue-200' },
  product_deleted:      { label: 'Produit supprimé',         icon: Trash2,          color: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-200' },
  product_status_changed:{ label: 'Statut changé',           icon: ArrowRightLeft,  color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200' },
  product_thrown:       { label: 'Produit jeté',             icon: Trash2,          color: 'text-red-600',    bg: 'bg-red-50',    border: 'border-red-200' },
  barcode_scanned:      { label: 'Code-barres scanné',       icon: ScanLine,        color: 'text-primary',    bg: 'bg-primary/5', border: 'border-primary/20' },
  excel_imported:       { label: 'Fichier Excel importé',    icon: FileSpreadsheet, color: 'text-teal-600',   bg: 'bg-teal-50',   border: 'border-teal-200' },
  order_created:        { label: 'Commande créée',           icon: ShoppingCart,    color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200' },
  report_generated:     { label: 'Rapport généré',           icon: FileText,        color: 'text-gray-600',   bg: 'bg-gray-50',   border: 'border-gray-200' },
  team_member_invited:  { label: 'Membre invité',            icon: UserPlus,        color: 'text-violet-600', bg: 'bg-violet-50', border: 'border-violet-200' },
};

const ROLE_LABELS = {
  owner: 'Propriétaire', manager: 'Gérant', employee: 'Employé', user: 'Propriétaire',
};

export default function ActivityLogs() {
  const { user } = useAuth();
  const [userFilter, setUserFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');

  const storeOwnerEmail = getStoreOwnerEmail(user);

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['activity_logs', storeOwnerEmail],
    queryFn: () => base44.entities.ActivityLog.filter(
      { store_owner_email: storeOwnerEmail },
      '-created_date',
      200
    ),
    enabled: !!storeOwnerEmail,
  });

  // Unique users in logs
  const uniqueUsers = [...new Set(logs.map(l => l.user_email))];

  const filteredLogs = logs.filter(l => {
    if (userFilter !== 'all' && l.user_email !== userFilter) return false;
    if (actionFilter !== 'all' && l.action_type !== actionFilter) return false;
    return true;
  });

  // Group by date
  const grouped = filteredLogs.reduce((acc, log) => {
    const date = log.created_date
      ? format(new Date(log.created_date), 'EEEE d MMMM yyyy', { locale: fr })
      : 'Date inconnue';
    if (!acc[date]) acc[date] = [];
    acc[date].push(log);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-secondary/30">
      <DashboardHeader />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pt-20 sm:pt-24">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Activity className="w-7 h-7 text-primary" />
              Historique d'activité
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{filteredLogs.length} action{filteredLogs.length !== 1 ? 's' : ''} enregistrée{filteredLogs.length !== 1 ? 's' : ''}</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl border border-border/40 shadow-sm p-4 mb-6 flex flex-wrap gap-3 items-center">
          <Filter className="w-4 h-4 text-muted-foreground flex-shrink-0" />

          <select
            value={userFilter}
            onChange={e => setUserFilter(e.target.value)}
            className="h-9 rounded-full border border-input bg-transparent px-3 text-sm"
          >
            <option value="all">Tous les membres</option>
            {uniqueUsers.map(email => (
              <option key={email} value={email}>{email}</option>
            ))}
          </select>

          <select
            value={actionFilter}
            onChange={e => setActionFilter(e.target.value)}
            className="h-9 rounded-full border border-input bg-transparent px-3 text-sm"
          >
            <option value="all">Toutes les actions</option>
            {Object.entries(ACTION_CONFIG).map(([key, cfg]) => (
              <option key={key} value={key}>{cfg.label}</option>
            ))}
          </select>

          {(userFilter !== 'all' || actionFilter !== 'all') && (
            <button
              onClick={() => { setUserFilter('all'); setActionFilter('all'); }}
              className="text-xs text-muted-foreground hover:text-foreground underline"
            >
              Réinitialiser
            </button>
          )}
        </div>

        {/* Log list */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-border/40">
            <Activity className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="font-medium text-foreground">Aucune activité enregistrée</p>
            <p className="text-sm text-muted-foreground mt-1">Les actions de votre équipe apparaîtront ici automatiquement</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([date, entries]) => (
              <div key={date}>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 capitalize">{date}</p>
                <div className="space-y-2">
                  {entries.map(log => {
                    const cfg = ACTION_CONFIG[log.action_type] || ACTION_CONFIG.product_edited;
                    const LogIcon = cfg.icon;
                    const time = log.created_date
                      ? format(new Date(log.created_date), 'HH:mm')
                      : '';

                    return (
                      <div key={log.id} className={`flex items-start gap-3 p-3.5 rounded-xl border ${cfg.bg} ${cfg.border}`}>
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-white/80 border ${cfg.border}`}>
                          <LogIcon className={`w-4 h-4 ${cfg.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground">{log.description}</p>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className={`text-xs font-medium ${cfg.color}`}>{cfg.label}</span>
                            {log.user_role && (
                              <span className="text-xs text-muted-foreground">
                                · {ROLE_LABELS[log.user_role] || log.user_role}
                              </span>
                            )}
                            {log.entity_name && (
                              <span className="text-xs text-muted-foreground truncate">
                                · {log.entity_name}
                              </span>
                            )}
                          </div>
                        </div>
                        {time && (
                          <span className="text-xs text-muted-foreground flex-shrink-0">{time}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <DashboardFooter />
    </div>
  );
}