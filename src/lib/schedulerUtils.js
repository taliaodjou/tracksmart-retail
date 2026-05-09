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
  if (!user || !user.email) return;
  if (user.role === 'admin' || user.email === 'admin@tracksmart.com') return;
  if (user.subscription_status !== 'active') return;

  const today = format(new Date(), 'yyyy-MM-dd');
  const thisMonth = today.slice(0, 7); // yyyy-MM

  // ── 1. Subscription expiry reminders ────────────────────────────────────
  if (user.subscription_start_date) {
    const daysLeft = getDaysUntilRenewal(user.subscription_start_date);
    const lastReminder = user.last_reminder_sent || '';

    let subType = null;
    let subMessage = null;

    if (daysLeft <= 3 && !lastReminder.includes(`sub_3d-${thisMonth}`)) {
      subType = 'reminder_3d';
      subMessage = `⚠️ Votre abonnement TrackSmart expire dans ${daysLeft} jour(s). Sans renouvellement, votre accès sera bloqué.`;
    } else if (daysLeft <= 7 && daysLeft > 3 && !lastReminder.includes(`sub_7d-${thisMonth}`)) {
      subType = 'reminder_7d';
      subMessage = `Rappel : votre abonnement TrackSmart expire dans ${daysLeft} jours. Merci d'anticiper le renouvellement.`;
    } else if (daysLeft <= 14 && daysLeft > 7 && !lastReminder.includes(`sub_14d-${thisMonth}`)) {
      subType = 'reminder_14d';
      subMessage = `Votre abonnement TrackSmart arrive bientôt à échéance (${daysLeft} jours). Merci de prévoir le renouvellement.`;
    }

    if (subType && subMessage) {
      await base44.entities.Notification.create({
        user_email: user.email,
        type: subType,
        message: subMessage,
        read: false,
        sent_at: new Date().toISOString(),
      });
      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: 'TrackSmart — Rappel abonnement',
        body: subMessage,
      });
      const tag = subType === 'reminder_3d' ? 'sub_3d' : subType === 'reminder_7d' ? 'sub_7d' : 'sub_14d';
      await base44.auth.updateMe({ last_reminder_sent: `${tag}-${thisMonth}` });
    }
  }

  // ── 2. Product expiry reminders ─────────────────────────────────────────
  if (!products || products.length === 0) return;

  const { getDaysRemaining } = await import('@/lib/productUtils');

  // Track which reminder windows we already notified today (stored as JSON string)
  let sentToday = {};
  try {
    const stored = user.last_expiry_reminders_sent || '';
    const parsed = JSON.parse(stored);
    // Only use if it's from today
    if (parsed.date === today) sentToday = parsed.sent || {};
  } catch (_) {}

  const thresholds = [
    { days: 3,  type: 'expiry_3d',  label: '3 jours' },
    { days: 7,  type: 'expiry_7d',  label: '7 jours' },
    { days: 14, type: 'expiry_14d', label: '14 jours' },
  ];

  for (const threshold of thresholds) {
    if (sentToday[threshold.type]) continue; // already sent today

    const expiring = products.filter(p => {
      if (!p.expiration_date) return false;
      const d = getDaysRemaining(p.expiration_date);
      return d >= 0 && d <= threshold.days;
    });

    if (expiring.length === 0) continue;

    const productList = expiring
      .slice(0, 10)
      .map(p => `• ${p.name}${p.rayon ? ` (Rayon ${p.rayon})` : ''} — expire le ${format(new Date(p.expiration_date), 'dd/MM/yyyy')}`)
      .join('\n');
    const extra = expiring.length > 10 ? `\n…et ${expiring.length - 10} autre(s) produit(s)` : '';

    const message = `🔔 ${expiring.length} produit(s) expirent dans moins de ${threshold.label} :\n${productList}${extra}`;

    await base44.entities.Notification.create({
      user_email: user.email,
      type: threshold.type,
      message,
      read: false,
      sent_at: new Date().toISOString(),
    });

    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: `TrackSmart — Produits expirant dans ${threshold.label}`,
      body: message,
    });

    sentToday[threshold.type] = true;
  }

  // Persist which reminders were sent today
  if (Object.keys(sentToday).length > 0) {
    await base44.auth.updateMe({
      last_expiry_reminders_sent: JSON.stringify({ date: today, sent: sentToday }),
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
  const totalLoss = expired.reduce((sum, p) => sum + ((p.quantity_thrown || 0) * (p.price_chf || 0)), 0);
  const shopName = user.shop_name ? `${user.shop_name}` : 'TrackSmart';

  const reportBody = `Résumé hebdomadaire – ${shopName}

Produits expirés :
${expiredList}

Produits à surveiller :
${soonList}

Pertes estimées :
CHF ${totalLoss.toFixed(2)}`;

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