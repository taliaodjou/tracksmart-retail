import React, { useState } from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { useAuth } from '@/lib/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { isAdmin } from '@/lib/productUtils';
import { useNavigate } from 'react-router-dom';
import { UserCheck, UserX, Mail, Send, Users, RefreshCw } from 'lucide-react';
import { checkAndSendWeeklyReport } from '@/lib/schedulerUtils';

export default function Admin() {
  const { t, lang } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviting, setInviting] = useState(false);
  const [reportingId, setReportingId] = useState(null);

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin_users'],
    queryFn: () => base44.entities.User.list(),
  });

  const { data: products = [] } = useQuery({
    queryKey: ['all_products'],
    queryFn: () => base44.entities.Product.list(),
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.User.update(id, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin_users'] }),
  });

  const handleToggleSubscription = async (u) => {
    const newStatus = u.subscription_status === 'active' ? 'inactive' : 'active';
    const data = { subscription_status: newStatus };
    if (newStatus === 'active' && !u.subscription_start_date) {
      data.subscription_start_date = new Date().toISOString().split('T')[0];
      data.last_reminder_sent = '';
    }
    await updateUserMutation.mutateAsync({ id: u.id, data });

    // Send notification
    await base44.entities.Notification.create({
      user_email: u.email,
      type: newStatus === 'active' ? 'weekly_report' : 'subscription_blocked',
      message: newStatus === 'active'
        ? (lang === 'fr' ? 'Votre abonnement a été activé.' : 'Your subscription has been activated.')
        : (lang === 'fr' ? 'Votre accès est suspendu. Merci de renouveler votre abonnement.' : 'Your access is suspended. Please renew your subscription.'),
      read: false,
      sent_at: new Date().toISOString(),
    });

    // Send email
    await base44.integrations.Core.SendEmail({
      to: u.email,
      subject: 'TrackSmart Retail — ' + (newStatus === 'active' ? 'Abonnement activé' : 'Accès suspendu'),
      body: newStatus === 'active'
        ? 'Votre abonnement TrackSmart Retail a été activé. Vous pouvez maintenant accéder à votre tableau de bord.'
        : 'Votre accès TrackSmart Retail est suspendu. Veuillez contacter l\'administrateur pour renouveler votre abonnement.',
    });

    toast.success(newStatus === 'active' ? t('admin_user_activated') : t('admin_user_deactivated'));
  };

  const handleSetStartDate = async (u, date) => {
    await updateUserMutation.mutateAsync({ id: u.id, data: { subscription_start_date: date } });
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviting(true);
    await base44.users.inviteUser(inviteEmail, 'user');
    toast.success(t('admin_invited'));
    setInviteEmail('');
    setInviting(false);
  };

  const handleSendReport = async (u) => {
    setReportingId(u.id);
    const userProducts = products.filter(p => p.created_by === u.email);
    await checkAndSendWeeklyReport({ ...u, last_weekly_report: null }, userProducts);
    toast.success(lang === 'fr' ? 'Rapport envoyé' : 'Report sent');
    setReportingId(null);
  };

  // Redirect if not admin
  if (user && !isAdmin(user)) {
    navigate('/dashboard');
    return null;
  }

  const nonAdmins = users.filter(u => !isAdmin(u));

  return (
    <div className="min-h-screen bg-secondary/30">
      <DashboardHeader />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            {t('admin_title')}
          </h1>
        </div>

        {/* Invite */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-border/40 mb-6">
          <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Mail className="w-4 h-4 text-primary" />
            {t('admin_invite_user')}
          </h2>
          <form onSubmit={handleInvite} className="flex gap-3">
            <Input
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
              placeholder={lang === 'fr' ? 'Email du nouvel utilisateur' : 'New user email'}
              type="email"
              required
              className="max-w-sm"
            />
            <Button type="submit" disabled={inviting} className="rounded-full gap-2">
              <Send className="w-4 h-4" />
              {t('admin_invite_send')}
            </Button>
          </form>
        </div>

        {/* Users table */}
        <div className="bg-white rounded-2xl shadow-sm border border-border/40 overflow-hidden">
          <div className="px-6 py-4 border-b border-border/40">
            <h2 className="font-semibold text-foreground">{t('admin_users')} ({nonAdmins.length})</h2>
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-7 h-7 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/40">
                  <tr>
                    <th className="text-left px-6 py-3 font-semibold text-foreground">Email</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">{t('admin_subscription_status')}</th>
                    <th className="text-left px-4 py-3 font-semibold text-foreground">{t('admin_sub_start')}</th>
                    <th className="text-right px-6 py-3 font-semibold text-foreground">{lang === 'fr' ? 'Actions' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {nonAdmins.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-10 text-muted-foreground">
                        {lang === 'fr' ? 'Aucun utilisateur' : 'No users yet'}
                      </td>
                    </tr>
                  ) : (
                    nonAdmins.map(u => (
                      <tr key={u.id} className="border-t border-border/30 hover:bg-secondary/20">
                        <td className="px-6 py-4 font-medium text-foreground">{u.email}</td>
                        <td className="px-4 py-4">
                          <Badge className={u.subscription_status === 'active'
                            ? 'bg-green-100 text-green-700 border border-green-200'
                            : 'bg-red-100 text-red-700 border border-red-200'}>
                            {u.subscription_status === 'active' ? t('profile_sub_active') : t('profile_sub_inactive')}
                          </Badge>
                        </td>
                        <td className="px-4 py-4">
                          <Input
                            type="date"
                            defaultValue={u.subscription_start_date || ''}
                            className="w-36 h-7 text-xs"
                            onBlur={e => e.target.value && handleSetStartDate(u, e.target.value)}
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-full gap-1.5 text-xs"
                              onClick={() => handleToggleSubscription(u)}
                            >
                              {u.subscription_status === 'active'
                                ? <><UserX className="w-3.5 h-3.5" />{t('admin_deactivate')}</>
                                : <><UserCheck className="w-3.5 h-3.5" />{t('admin_activate')}</>
                              }
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-full gap-1.5 text-xs"
                              disabled={reportingId === u.id}
                              onClick={() => handleSendReport(u)}
                            >
                              {reportingId === u.id
                                ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                                : <Send className="w-3.5 h-3.5" />
                              }
                              {t('admin_send_report')}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}