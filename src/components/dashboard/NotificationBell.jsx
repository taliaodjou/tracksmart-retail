import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useLanguage } from '@/lib/LanguageContext';
import { Button } from '@/components/ui/button';
import { Bell, X, Check } from 'lucide-react';
import { format } from 'date-fns';

export default function NotificationBell() {
  const { user } = useAuth();
  const { t, lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', user?.email],
    queryFn: () => base44.entities.Notification.filter({ user_email: user?.email }, '-sent_at', 20),
    enabled: !!user?.email,
    refetchInterval: 30000,
  });

  const unread = notifications.filter(n => !n.read).length;

  const markReadMutation = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllRead = async () => {
    await Promise.all(notifications.filter(n => !n.read).map(n => markReadMutation.mutateAsync(n.id)));
  };

  const typeLabel = {
    reminder_14d: lang === 'fr' ? '🔔 Abonnement 14j' : '🔔 Subscription 14d',
    reminder_7d:  lang === 'fr' ? '⚠️ Abonnement 7j'  : '⚠️ Subscription 7d',
    reminder_3d:  lang === 'fr' ? '🚨 Abonnement 3j'  : '🚨 Subscription 3d',
    expiry_14d:   lang === 'fr' ? '🔔 Expiration 14j'  : '🔔 Expiry 14d',
    expiry_7d:    lang === 'fr' ? '⚠️ Expiration 7j'   : '⚠️ Expiry 7d',
    expiry_3d:    lang === 'fr' ? '🚨 Expiration 3j'   : '🚨 Expiry 3d',
    subscription_blocked: lang === 'fr' ? '🚫 Accès bloqué' : '🚫 Access blocked',
    weekly_report: lang === 'fr' ? '📊 Rapport hebdo' : '📊 Weekly report',
  };

  return (
    <div className="relative">
      <Button variant="ghost" size="icon" onClick={() => setOpen(!open)} className="relative">
        <Bell className="w-4 h-4 text-muted-foreground" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </Button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 z-50 w-80 bg-white rounded-2xl shadow-xl border border-border/50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
              <span className="font-semibold text-sm text-foreground">{t('nav_notifications')}</span>
              <div className="flex items-center gap-1">
                {unread > 0 && (
                  <Button variant="ghost" size="sm" className="text-xs h-7" onClick={markAllRead}>
                    <Check className="w-3 h-3 mr-1" /> {t('mark_read')}
                  </Button>
                )}
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setOpen(false)}>
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-center text-sm text-muted-foreground py-8">
                  {lang === 'fr' ? 'Aucune notification' : 'No notifications'}
                </p>
              ) : (
                notifications.map(n => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 border-b border-border/30 cursor-pointer hover:bg-secondary/30 transition-colors ${!n.read ? 'bg-primary/5' : ''}`}
                    onClick={() => markReadMutation.mutate(n.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full mb-1 inline-block ${
                          n.type.startsWith('expiry_3d') ? 'bg-red-100 text-red-700' :
                          n.type.startsWith('expiry_7d') ? 'bg-orange-100 text-orange-700' :
                          n.type.startsWith('expiry_14d') ? 'bg-yellow-100 text-yellow-700' :
                          n.type.includes('reminder') ? 'bg-orange-100 text-orange-700' :
                          n.type === 'weekly_report' ? 'bg-blue-100 text-blue-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {typeLabel[n.type] || n.type}
                        </span>
                        <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line line-clamp-3">{n.message}</p>
                      </div>
                      {!n.read && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />}
                    </div>
                    {n.sent_at && (
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {format(new Date(n.sent_at), 'dd/MM HH:mm')}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}