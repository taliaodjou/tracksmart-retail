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

// ── Email HTML templates ─────────────────────────────────────────────────
function buildEmailHtml({ title, accentColor, bodyContent, userId = '' }) {
  const unsubFooter = userId ? `
    <tr>
      <td style="background:#f5f5f3;border-top:1px solid #e8e8e5;padding:14px 40px;text-align:center;">
        <p style="margin:0;font-size:11px;color:#aaaaaa;">
          Vous ne souhaitez plus recevoir ces emails ?
          <a href="https://tracksmart.base44.app/email-preferences?uid=${userId}&action=unsubscribe" style="color:#888888;text-decoration:underline;">Se désabonner</a>
        </p>
      </td>
    </tr>` : '';

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background:#f0efeb;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0efeb;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.10);max-width:560px;">
        <!-- Header -->
        <tr>
          <td style="background:#111111;padding:28px 40px;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#C9A64C;border-radius:10px;padding:8px 16px;">
                  <span style="color:#000000;font-weight:800;font-size:15px;letter-spacing:0.5px;">TrackSmart</span>
                  <span style="color:rgba(0,0,0,0.35);font-size:11px;font-weight:500;margin-left:6px;">Retail</span>
                </td>
                <td style="padding-left:16px;">
                  <span style="color:rgba(255,255,255,0.25);font-size:10px;letter-spacing:0.5px;text-transform:uppercase;">by TNO Studio</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <!-- Accent bar -->
        <tr><td style="height:3px;background:linear-gradient(90deg,${accentColor},${accentColor}aa);"></td></tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 32px;">
            ${bodyContent}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#f9f9f7;border-top:1px solid #eeeeee;padding:22px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#aaaaaa;">© ${new Date().getFullYear()} TNO Studio · TrackSmart Retail</p>
            <p style="margin:6px 0 0;font-size:12px;color:#cccccc;">support@tracksmart.com</p>
          </td>
        </tr>
        ${unsubFooter}
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function subscriptionReminderEmail({ shopName, daysLeft, renewalDate, userId, urgency }) {
  const isUrgent = urgency === 'urgent'; // 3 days
  const accentColor = isUrgent ? '#ef4444' : '#C9A64C';
  const badgeBg = isUrgent ? '#fef2f2' : '#fffbeb';
  const badgeColor = isUrgent ? '#dc2626' : '#b45309';
  const badgeBorder = isUrgent ? '#fecaca' : '#fde68a';
  const dateFormatted = renewalDate ? format(renewalDate, 'dd/MM/yyyy') : '';

  const bodyContent = `
    <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#C9A64C;letter-spacing:0.5px;text-transform:uppercase;">Rappel abonnement</p>
    <h1 style="margin:0 0 20px;font-size:24px;font-weight:800;color:#111111;line-height:1.2;">
      ${isUrgent ? 'Renouvellement urgent' : 'Votre abonnement arrive à échéance'}
    </h1>

    <p style="margin:0 0 24px;font-size:15px;color:#555555;line-height:1.7;">
      Bonjour <strong>${shopName}</strong>,
    </p>

    <!-- Countdown badge -->
    <table cellpadding="0" cellspacing="0" style="margin:0 0 28px;">
      <tr>
        <td style="background:${badgeBg};border:1px solid ${badgeBorder};border-radius:12px;padding:16px 24px;">
          <table cellpadding="0" cellspacing="0">
            <tr>
              <td style="padding-right:16px;border-right:1px solid ${badgeBorder};">
                <div style="font-size:36px;font-weight:800;color:${badgeColor};line-height:1;">${daysLeft}</div>
                <div style="font-size:11px;color:${badgeColor};font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-top:2px;">jour${daysLeft > 1 ? 's' : ''} restant${daysLeft > 1 ? 's' : ''}</div>
              </td>
              ${dateFormatted ? `<td style="padding-left:16px;">
                <div style="font-size:11px;color:#888888;text-transform:uppercase;letter-spacing:0.5px;font-weight:600;">Date de renouvellement</div>
                <div style="font-size:17px;font-weight:700;color:#333333;margin-top:4px;">${dateFormatted}</div>
              </td>` : ''}
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 28px;font-size:15px;color:#555555;line-height:1.7;">
      ${isUrgent
        ? 'Votre abonnement TrackSmart expire très bientôt. Sans renouvellement, votre accès à l\'inventaire, aux rapports et aux alertes sera bloqué.'
        : 'Votre abonnement TrackSmart arrive bientôt à échéance. Pensez à anticiper le renouvellement pour éviter toute interruption de service.'}
    </p>

    <!-- CTA -->
    <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
      <tr>
        <td style="background:#111111;border-radius:12px;padding:14px 32px;">
          <a href="https://tracksmart.base44.app/profile" style="color:#C9A64C;font-weight:700;font-size:14px;text-decoration:none;letter-spacing:0.3px;">Renouveler mon abonnement →</a>
        </td>
      </tr>
    </table>

    <!-- What's at stake -->
    <table cellpadding="0" cellspacing="0" style="background:#f9f9f7;border-radius:12px;padding:20px 24px;margin:0 0 24px;width:100%;">
      <tr>
        <td>
          <p style="margin:0 0 12px;font-size:12px;font-weight:700;color:#888888;text-transform:uppercase;letter-spacing:0.5px;">Accès inclus dans votre abonnement</p>
          <table cellpadding="0" cellspacing="0" width="100%">
            ${['Gestion des stocks & DLC', 'Alertes et rappels automatiques', 'Rapports hebdomadaires & trimestriels', 'Gestion des commandes fournisseurs'].map(item => `
            <tr>
              <td style="padding:4px 0;">
                <span style="color:#C9A64C;font-weight:700;margin-right:8px;">✓</span>
                <span style="font-size:13px;color:#555555;">${item}</span>
              </td>
            </tr>`).join('')}
          </table>
        </td>
      </tr>
    </table>

    <p style="margin:0;font-size:13px;color:#aaaaaa;line-height:1.6;">
      Une question ? Contactez-nous à <a href="mailto:support@tracksmart.com" style="color:#C9A64C;font-weight:600;text-decoration:none;">support@tracksmart.com</a>
    </p>`;

  return buildEmailHtml({ title: 'Rappel abonnement TrackSmart', accentColor, bodyContent, userId });
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
    const shopName = user.shop_name || user.full_name || 'votre boutique';
    const renewalDate = getNextRenewalDate(user.subscription_start_date);

    let subType = null;
    let urgency = 'normal';

    // Guard: never send "0 days" reminder (subscription was just started/renewed)
    if (daysLeft === null || daysLeft <= 0) {
      // skip — renewal is today or not set
    } else if (daysLeft <= 3 && !lastReminder.includes(`sub_3d-${thisMonth}`)) {
      subType = 'reminder_3d';
      urgency = 'urgent';
    } else if (daysLeft <= 7 && daysLeft > 3 && !lastReminder.includes(`sub_7d-${thisMonth}`)) {
      subType = 'reminder_7d';
    } else if (daysLeft <= 14 && daysLeft > 7 && !lastReminder.includes(`sub_14d-${thisMonth}`)) {
      subType = 'reminder_14d';
    }

    if (subType) {
      const plainMessage = urgency === 'urgent'
        ? `Votre abonnement TrackSmart expire dans ${daysLeft} jour(s). Sans renouvellement, votre accès sera bloqué.`
        : daysLeft <= 7
          ? `Rappel : votre abonnement TrackSmart expire dans ${daysLeft} jours. Merci d'anticiper le renouvellement.`
          : `Votre abonnement TrackSmart arrive bientôt à échéance (${daysLeft} jours). Merci de prévoir le renouvellement.`;

      await base44.entities.Notification.create({
        user_email: user.email,
        type: subType,
        message: plainMessage,
        read: false,
        sent_at: new Date().toISOString(),
      });

      const htmlBody = subscriptionReminderEmail({ shopName, daysLeft, renewalDate, userId: user.id, urgency });

      await base44.integrations.Core.SendEmail({
        to: user.email,
        subject: urgency === 'urgent'
          ? `⚠️ TrackSmart — Renouvellement dans ${daysLeft} jour${daysLeft > 1 ? 's' : ''}`
          : `TrackSmart — Rappel abonnement (${daysLeft} jours restants)`,
        body: htmlBody,
      });
      const tag = subType === 'reminder_3d' ? 'sub_3d' : subType === 'reminder_7d' ? 'sub_7d' : 'sub_14d';
      await base44.auth.updateMe({ last_reminder_sent: `${tag}-${thisMonth}` });
    }
  }

}

export async function checkAndSendWeeklyReport(user, products) {
  if (!user || !user.email) return;
  if (user.role === 'admin' || user.email === 'admin@tracksmart.com') return;

  const today = format(new Date(), 'yyyy-MM-dd');
  const lastReport = user.last_weekly_report || '';

  // Don't send until account is at least 7 days old
  if (user.created_date) {
    const accountAgeDays = differenceInDays(new Date(), new Date(user.created_date));
    if (accountAgeDays < 7) return;
  }

  // Only send once per week
  const thisWeek = getWeekKey(new Date());
  if (lastReport && getWeekKey(new Date(lastReport)) === thisWeek) return;

  const { getProductStatus, getDaysRemaining } = await import('@/lib/productUtils');

  const shopName = user.shop_name || user.full_name || 'votre boutique';

  // ── Expired products (for loss calculation)
  const expired = products.filter(p => getProductStatus(p.expiration_date) === 'expired');
  const totalLoss = expired.reduce((sum, p) => sum + ((p.quantity_thrown || 0) * (p.price_chf || 0)), 0);

  // ── Upcoming expirations bucketed
  const urgent = []; // <= 3 days
  const bientot = []; // 4–7 days
  for (const p of products) {
    if (!p.expiration_date) continue;
    const d = getDaysRemaining(p.expiration_date);
    if (d < 0) continue;
    if (d <= 3) urgent.push(p);
    else if (d <= 7) bientot.push(p);
  }

  if (expired.length === 0 && urgent.length === 0 && bientot.length === 0) return;

  // ── In-app notification
  await base44.entities.Notification.create({
    user_email: user.email,
    type: 'weekly_report',
    message: `Rapport hebdomadaire — ${expired.length} expiré(s), ${urgent.length} urgent(s), ${bientot.length} bientôt.`,
    read: false,
    sent_at: new Date().toISOString(),
  });

  // ── Build product row helper
  const buildProductRow = (p, showDays = false) => {
    const d = showDays ? getDaysRemaining(p.expiration_date) : null;
    const color = d !== null ? (d <= 3 ? '#dc2626' : '#d97706') : '#888888';
    const bg = d !== null ? (d <= 3 ? '#fef2f2' : '#fffbeb') : '#f5f5f5';
    return `
      <tr>
        <td style="padding:9px 0;border-bottom:1px solid #f0f0f0;">
          <span style="font-size:13px;color:#333333;font-weight:500;">${p.name}</span>
          ${p.rayon ? `<span style="font-size:11px;color:#aaaaaa;margin-left:6px;">Rayon ${p.rayon}</span>` : ''}
        </td>
        <td style="padding:9px 0;border-bottom:1px solid #f0f0f0;text-align:right;white-space:nowrap;">
          ${showDays && d !== null
            ? `<span style="background:${bg};color:${color};font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;">${d === 0 ? "Aujourd'hui" : `${d}j`}</span>`
            : `<span style="font-size:13px;color:#888888;">${p.price_chf ? `CHF ${((p.quantity_thrown || 0) * p.price_chf).toFixed(2)}` : '—'}</span>`
          }
        </td>
      </tr>`;
  };

  const expiredRows = expired.slice(0, 10).map(p => buildProductRow(p, false)).join('');
  const urgentRows = urgent.slice(0, 10).map(p => buildProductRow(p, true)).join('');
  const bientotRows = bientot.slice(0, 10).map(p => buildProductRow(p, true)).join('');

  const sectionBlock = (title, list, rows, accentColor, badgeBg, badgeBorder) => {
    if (list.length === 0) return '';
    return `
      <p style="margin:0 0 10px;font-size:13px;font-weight:700;color:${accentColor};text-transform:uppercase;letter-spacing:0.5px;">${title} — ${list.length} produit${list.length > 1 ? 's' : ''}</p>
      <table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 28px;border:1px solid ${badgeBorder};border-radius:12px;background:${badgeBg};padding:0 16px;">
        ${rows}
        ${list.length > 10 ? `<tr><td colspan="2" style="padding:8px 0;"><span style="font-size:12px;color:#aaaaaa;">…et ${list.length - 10} autre(s) produit(s)</span></td></tr>` : ''}
      </table>`;
  };

  const weeklyHtmlBody = buildEmailHtml({
    title: 'Rapport hebdomadaire TrackSmart',
    accentColor: '#C9A64C',
    userId: user.id,
    bodyContent: `
      <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#C9A64C;letter-spacing:0.5px;text-transform:uppercase;">Rapport hebdomadaire</p>
      <h1 style="margin:0 0 8px;font-size:24px;font-weight:800;color:#111111;">Bilan de la semaine</h1>
      <p style="margin:0 0 28px;font-size:14px;color:#888888;">${shopName}</p>

      <!-- KPIs -->
      <table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 32px;">
        <tr>
          <td width="33%" style="padding-right:6px;">
            <div style="background:#fef2f2;border-radius:12px;padding:14px;text-align:center;">
              <div style="font-size:26px;font-weight:800;color:#dc2626;">${expired.length}</div>
              <div style="font-size:10px;color:#dc2626;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-top:3px;">Expirés</div>
            </div>
          </td>
          <td width="33%" style="padding-right:6px;">
            <div style="background:#fff7ed;border-radius:12px;padding:14px;text-align:center;">
              <div style="font-size:26px;font-weight:800;color:#ea580c;">${urgent.length}</div>
              <div style="font-size:10px;color:#ea580c;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-top:3px;">Urgents ≤ 3j</div>
            </div>
          </td>
          <td width="33%">
            <div style="background:#fffbeb;border-radius:12px;padding:14px;text-align:center;">
              <div style="font-size:26px;font-weight:800;color:#b45309;">${bientot.length}</div>
              <div style="font-size:10px;color:#b45309;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;margin-top:3px;">Bientôt ≤ 7j</div>
            </div>
          </td>
        </tr>
      </table>

      ${totalLoss > 0 ? `
      <div style="background:#f9f9f7;border-radius:12px;padding:16px 20px;margin:0 0 28px;text-align:center;">
        <div style="font-size:11px;color:#aaaaaa;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Pertes estimées cette semaine</div>
        <div style="font-size:28px;font-weight:800;color:#111111;">CHF ${totalLoss.toFixed(2)}</div>
      </div>` : ''}

      ${sectionBlock('🚨 Produits expirés', expired, expiredRows, '#dc2626', '#fff8f8', '#fecaca')}
      ${sectionBlock('⚠️ Expirent très bientôt (≤ 3 jours)', urgent, urgentRows, '#ea580c', '#fff7ed', '#fed7aa')}
      ${sectionBlock('📋 À surveiller cette semaine (≤ 7 jours)', bientot, bientotRows, '#d97706', '#fffdf5', '#fde68a')}

      <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
        <tr>
          <td style="background:#111111;border-radius:12px;padding:14px 32px;">
            <a href="https://tracksmart.base44.app/dashboard" style="color:#C9A64C;font-weight:700;font-size:14px;text-decoration:none;letter-spacing:0.3px;">Voir mon tableau de bord →</a>
          </td>
        </tr>
      </table>

      <p style="margin:0;font-size:12px;color:#aaaaaa;">Une question ? <a href="mailto:support@tracksmart.com" style="color:#C9A64C;text-decoration:none;font-weight:600;">support@tracksmart.com</a></p>
    `
  });

  await base44.integrations.Core.SendEmail({
    to: user.email,
    subject: `TrackSmart — Rapport hebdomadaire · ${shopName}`,
    body: weeklyHtmlBody,
  });

  await base44.auth.updateMe({ last_weekly_report: today });
}

function getWeekKey(date) {
  const d = new Date(date);
  const startOfYear = new Date(d.getFullYear(), 0, 1);
  const week = Math.ceil(((d - startOfYear) / 86400000 + startOfYear.getDay() + 1) / 7);
  return `${d.getFullYear()}-W${week}`;
}