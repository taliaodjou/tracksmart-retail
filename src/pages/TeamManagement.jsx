import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Users, UserPlus, Crown, ShieldCheck, User, Mail, Phone, Trash2, Send, ChevronDown } from 'lucide-react';
import { getStoreOwnerEmail } from '@/lib/activityLogger';
import { logActivity } from '@/lib/activityLogger';
import { hasActiveSubscription } from '@/lib/productUtils';

const ROLE_CONFIG = {
  owner: { label: 'Propriétaire', icon: Crown, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  manager: { label: 'Gérant', icon: ShieldCheck, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  employee: { label: 'Employé', icon: User, color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  user: { label: 'Propriétaire', icon: Crown, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
};

const ROLE_PERMISSIONS = {
  owner: ['Gestion abonnement', 'Inviter des employés', 'Voir les analytiques', 'Exporter rapports', 'Accès complet'],
  manager: ['Gérer les produits', 'Imports', 'Scans code-barres', 'Commandes', 'Rapports'],
  employee: ['Scanner des produits', 'Ajouter des produits', 'Mettre à jour les statuts', 'Créer des demandes'],
};

export default function TeamManagement() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [inviteData, setInviteData] = useState({ email: '', role: 'employee', phone: '' });
  const [inviting, setInviting] = useState(false);
  const [expandedPerms, setExpandedPerms] = useState(null);

  const storeOwnerEmail = getStoreOwnerEmail(user);

  // Fetch all team members (users who belong to this store)
  const { data: allUsers = [] } = useQuery({
    queryKey: ['team_members', storeOwnerEmail],
    queryFn: () => base44.entities.User.list(),
    enabled: !!user,
  });

  // Team = owner + all members pointing to this owner
  const teamMembers = allUsers.filter(u =>
    u.email === storeOwnerEmail ||
    u.store_owner_email === storeOwnerEmail
  );

  const canManage = user?.role === 'owner' || user?.role === 'user' || user?.role === 'admin';

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteData.email) return;
    setInviting(true);
    try {
      // Invite as regular user first, then we update their store_owner_email via entity
      await base44.users.inviteUser(inviteData.email, 'user');

      // We'll need to update the newly created user once they accept the invite.
      // For now, store pending invite info in ActivityLog as a record.
      await logActivity(user, 'team_member_invited', `${user.full_name || user.email} a invité ${inviteData.email} comme ${ROLE_CONFIG[inviteData.role]?.label}`, {
        entity_name: inviteData.email,
        metadata: { invited_email: inviteData.email, role: inviteData.role, store_owner_email: storeOwnerEmail },
      });

      toast.success(`Invitation envoyée à ${inviteData.email}`);
      setInviteData({ email: '', role: 'employee', phone: '' });
      setShowInviteForm(false);
      queryClient.invalidateQueries(['team_members']);
    } catch (err) {
      toast.error("Erreur lors de l'invitation");
    }
    setInviting(false);
  };

  const handleUpdateRole = async (member, newRole) => {
    try {
      await base44.entities.User.update(member.id, {
        role: newRole,
        store_owner_email: storeOwnerEmail,
      });
      queryClient.invalidateQueries(['team_members']);
      toast.success('Rôle mis à jour');
    } catch {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  const shopName = user?.shop_name || user?.full_name || 'Votre boutique';

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#f5f5f5', color: '#1a1a1a' }}>
      <DashboardHeader />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pt-20 sm:pt-24">

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2">
              <Users className="w-7 h-7 text-primary" />
              Équipe
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              <span className="font-semibold text-primary">{shopName}</span> · {teamMembers.length} membre{teamMembers.length !== 1 ? 's' : ''}
            </p>
          </div>
          {canManage && (
            <Button
              onClick={() => setShowInviteForm(v => !v)}
              className="rounded-full gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Ajouter un employé
            </Button>
          )}
        </div>

        {/* Invite form */}
        {showInviteForm && canManage && (
          <div className="bg-white rounded-2xl border border-border/40 shadow-sm p-6 mb-6">
            <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-primary" />
              Inviter un nouveau membre
            </h2>
            <form onSubmit={handleInvite} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1.5 flex items-center gap-1">
                    <Mail className="w-3 h-3" /> Email *
                  </label>
                  <Input
                    type="email"
                    required
                    value={inviteData.email}
                    onChange={e => setInviteData(d => ({ ...d, email: e.target.value }))}
                    placeholder="employe@boutique.com"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground block mb-1.5">Rôle *</label>
                  <select
                    value={inviteData.role}
                    onChange={e => setInviteData(d => ({ ...d, role: e.target.value }))}
                    className="w-full h-9 rounded-md border border-input bg-transparent px-3 text-sm"
                  >
                    <option value="employee">Employé</option>
                    <option value="manager">Gérant</option>
                  </select>
                </div>
              </div>

              {/* Role permissions preview */}
              <div className={`rounded-xl border p-3 text-xs ${ROLE_CONFIG[inviteData.role]?.bg} ${ROLE_CONFIG[inviteData.role]?.border}`}>
                <p className={`font-semibold mb-1.5 ${ROLE_CONFIG[inviteData.role]?.color}`}>
                  Permissions — {ROLE_CONFIG[inviteData.role]?.label}
                </p>
                <ul className="space-y-0.5">
                  {(ROLE_PERMISSIONS[inviteData.role] || []).map(p => (
                    <li key={p} className="flex items-center gap-1.5 text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-50 flex-shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-3 justify-end">
                <Button type="button" variant="outline" className="rounded-full" onClick={() => setShowInviteForm(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={inviting} className="rounded-full gap-2">
                  <Send className="w-4 h-4" />
                  {inviting ? 'Envoi...' : 'Envoyer l\'invitation'}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Team members list */}
        <div className="space-y-3">
          {teamMembers.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-border/40">
              <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="font-medium text-foreground">Aucun membre d'équipe</p>
              <p className="text-sm text-muted-foreground mt-1">Invitez votre premier employé pour commencer</p>
            </div>
          ) : (
            teamMembers.map(member => {
              const roleKey = member.role === 'user' ? 'owner' : (member.role || 'employee');
              const cfg = ROLE_CONFIG[roleKey] || ROLE_CONFIG.employee;
              const Icon = cfg.icon;
              const isCurrentUser = member.email === user?.email;
              const perms = expandedPerms === member.id;

              return (
                <div key={member.id} className="bg-white rounded-2xl border border-border/40 shadow-sm overflow-hidden">
                  <div className="p-4 sm:p-5 flex items-center gap-4">
                    {/* Avatar */}
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-base flex-shrink-0 ${cfg.bg} ${cfg.border} border`}>
                      <span className={cfg.color}>
                        {(member.full_name || member.email || '?')[0].toUpperCase()}
                      </span>
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-foreground truncate">
                          {member.full_name || member.email}
                          {isCurrentUser && <span className="text-xs text-muted-foreground ml-1">(vous)</span>}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
                          <Icon className="w-3 h-3" />
                          {cfg.label}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5 truncate">{member.email}</p>
                      {member.phone_number && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" /> {member.phone_number}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => setExpandedPerms(perms ? null : member.id)}
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
                      >
                        Accès <ChevronDown className={`w-3 h-3 transition-transform ${perms ? 'rotate-180' : ''}`} />
                      </button>

                      {canManage && !isCurrentUser && (member.role !== 'owner' && member.role !== 'user') && (
                        <select
                          value={member.role || 'employee'}
                          onChange={e => handleUpdateRole(member, e.target.value)}
                          className="text-xs border border-border rounded-lg px-2 py-1 bg-transparent"
                          onClick={e => e.stopPropagation()}
                        >
                          <option value="manager">Gérant</option>
                          <option value="employee">Employé</option>
                        </select>
                      )}
                    </div>
                  </div>

                  {/* Permissions accordion */}
                  {perms && (
                    <div className={`px-5 pb-4 border-t border-border/30 pt-3 ${cfg.bg}`}>
                      <p className={`text-xs font-semibold mb-2 ${cfg.color}`}>Permissions</p>
                      <ul className="space-y-1">
                        {(ROLE_PERMISSIONS[roleKey] || ROLE_PERMISSIONS.employee).map(p => (
                          <li key={p} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${cfg.color.replace('text-', 'bg-')}`} />
                            {p}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Info box */}
        <div className="mt-8 bg-primary/5 border border-primary/20 rounded-2xl p-5">
          <p className="text-sm font-semibold text-foreground mb-2">Comment fonctionne l'équipe ?</p>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            <li>• Chaque membre se connecte avec son propre email et mot de passe</li>
            <li>• Toutes les actions sont automatiquement liées à l'utilisateur connecté</li>
            <li>• Les produits et données sont partagés entre tous les membres de l'équipe</li>
            <li>• L'historique d'activité montre qui a fait quoi et quand</li>
          </ul>
        </div>
      </main>
    </div>
  );
}