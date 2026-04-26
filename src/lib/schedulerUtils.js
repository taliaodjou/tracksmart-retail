import { differenceInDays, addMonths, startOfDay, format } from 'date-fns';
import { base44 } from '@/api/base44Client';

// Calculate days until next monthly renewal
export function getDaysUntilRenewal(subscriptionStartDate) {
  if (!subscriptionStartDate) return null;
  const today = startOfDay(new Date());
  const start = new Date(subscriptionStartDate);
  // Find next renewal: same day next month (or future months)
  let next = new Date(start);
  while (next <= today) {
    next = addMonths(next, 1);
  }
  return differenceInDays(startOfDay(next), today);
}

export function getNextRenewalDate(subscriptionStartDate) {
  if (!subscriptionStartDate) return null;
  const today = startOfDay(new Date());
  const start = new Date(subscriptionStartDate);
  let next = new Date(start);
  while (next <= today) {
    next = addMonths(next, 1);
  }
  return next;
}

export async function checkAndSendReminders(user, products) {
  if (!user || !user.subscription_start_date) return;
  if (user.role === 'admin' || user.email === 'admin@tracksmart.com') return;
  if (user.subscription_status !== 'active') return;

  const daysLeft = getDaysUntilRenewal(user.subscription_start_date);
  if (daysLeft === null) return;

  const today = format(new Date(), 'yyyy-MM-dd');
  const lastReminder = user.last_reminder_sent || '';

  let reminderType = null;
  let message = null;

  if (daysLeft <= 3 && !lastReminder.includes(`3d-${today.slice(0, 7)}`)) {
    reminderType = 'reminder_3d';
    message = 'Attention : votre abonnement expire dans 3 jours. Sans renouvellement, l\'accès sera bloqué.';
  } else if (daysLeft <= 7 && daysLeft > 3 && !lastReminder.includes(`7d-${today.slice(0, 7)}`)) {
    reminderType = 'reminder_7d';
    message = 'Rappel : votre abonnement expire dans 7 jours.';
  } else if (daysLeft <= 14 && daysLeft > 7 && !lastReminder.includes(`14d-${today.slice(0, 7)}`)) {
    reminderType = 'reminder_14d';
    message = 'Votre abonnement arrive bientôt à échéance. Merci d\'anticiper le renouvellement.';
  }

  if (reminderType && message) {
    // Create in-app notification
    await base44.entities.Notification.create({
      user_email: user.email,
      type: reminderType,
      message,
      read: false,
      sent_at: new Date().toISOString(),
    });

    // Send email
    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: 'TrackSmart — Rappel abonnement',
      body: message,
    });

    // Update last_reminder_sent
    const tag = reminderType === 'reminder_3d' ? '3d' : reminderType === 'reminder_7d' ? '7d' : '14d';
    await base44.auth.updateMe({
      last_reminder_sent: `${tag}-${today.slice(0, 7)}`,
    });
  }
}

export async function checkAndSendWeeklyReport(user, products) {
  if (!user || !user.email) return;
  if (user.role === 'admin' || user.email === 'admin@tracksmart.com') return;

  const today = format(new Date(), 'yyyy-MM-dd');
  const lastReport = user.last_weekly_report || '';

  // Only send if not sent this week (compare year-week)
  const thisWeek = getWeekKey(new Date());
  if (lastReport && getWeekKey(new Date(lastReport)) === thisWeek) return;

  const { getProductStatus } = await import('@/lib/productUtils');

  const expired = products.filter(p => getProductStatus(p.expiration_date) === 'expired');
  const soon = products.filter(p => {
    const s = getProductStatus(p.expiration_date);
    return s === 'urgent' || s === 'soon';
  });

  if (expired.length === 0 && soon.length === 0) return;

  const expiredList = expired.map(p => `- ${p.name}`).join('\n') || 'Aucun';
  const soonList = soon.map(p => `- ${p.name}`).join('\n') || 'Aucun';

  const reportBody = `Résumé hebdomadaire TrackSmart :

Produits expirés :
${expiredList}

Produits à surveiller :
${soonList}`;

  // Create in-app notification
  await base44.entities.Notification.create({
    user_email: user.email,
    type: 'weekly_report',
    message: reportBody,
    read: false,
    sent_at: new Date().toISOString(),
  });

  // Send via preferred channel
  if (user.report_channel === 'sms' && user.phone_number) {
    // Mock SMS — log it (no real SMS integration available without Builder+)
    console.log(`[SMS to ${user.phone_number}]`, reportBody);
  }

  // Always send email as well
  await base44.integrations.Core.SendEmail({
    to: user.email,
    subject: 'TrackSmart — Rapport hebdomadaire',
    body: reportBody,
  });

  await base44.auth.updateMe({ last_weekly_report: today });
}

function getWeekKey(date) {
  const d = new Date(date);
  const startOfYear = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${week}`;
}