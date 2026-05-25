import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const ADMIN_EMAIL = 'talia.odjou@gmail.com';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Prevent admins from triggering this
    if (user.role === 'admin') {
      return Response.json({ skipped: true });
    }

    // Mark user as "notified" so we don't send twice
    if (user.admin_notified) {
      return Response.json({ skipped: true, reason: 'already notified' });
    }

    const appBaseUrl = 'https://tracksmart.base44.app';
    const approveUrl = `${appBaseUrl}/admin-portal?action=approve&uid=${user.id}`;
    const rejectUrl  = `${appBaseUrl}/admin-portal?action=reject&uid=${user.id}`;
    const today = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    const joinedAt = new Date().toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });

    const emailHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Nouvelle demande d'accès</title>
</head>
<body style="margin:0;padding:0;background:#f0efeb;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0efeb;padding:40px 0;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.10);max-width:580px;">

        <!-- Header -->
        <tr>
          <td style="background:#111111;padding:28px 40px;">
            <table cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td>
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="background:#C9A64C;border-radius:10px;padding:8px 16px;">
                        <span style="color:#000000;font-weight:800;font-size:15px;letter-spacing:0.5px;">TrackSmart</span>
                        <span style="color:rgba(0,0,0,0.35);font-size:11px;font-weight:500;margin-left:6px;">Retail</span>
                      </td>
                    </tr>
                  </table>
                </td>
                <td style="text-align:right;">
                  <div style="font-size:11px;color:rgba(255,255,255,0.4);text-transform:uppercase;letter-spacing:0.5px;">Demande d'accès</div>
                  <div style="font-size:12px;color:rgba(255,255,255,0.6);margin-top:2px;">${today}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Orange bar -->
        <tr><td style="height:3px;background:linear-gradient(90deg,#f59e0b,#f59e0baa);"></td></tr>

        <!-- Body -->
        <tr>
          <td style="padding:36px 40px 0;">

            <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#f59e0b;letter-spacing:0.5px;text-transform:uppercase;">🔔 Nouvelle demande</p>
            <h1 style="margin:0 0 24px;font-size:24px;font-weight:800;color:#111111;line-height:1.2;">
              Un nouvel utilisateur demande l'accès
            </h1>

            <!-- User info card -->
            <table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 32px;">
              <tr>
                <td style="background:#f9f9f7;border-radius:14px;padding:24px 28px;border-left:4px solid #C9A64C;">
                  <table cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td style="padding-bottom:12px;">
                        <span style="font-size:11px;font-weight:700;color:#C9A64C;text-transform:uppercase;letter-spacing:0.5px;">Nom complet</span><br/>
                        <span style="font-size:16px;font-weight:700;color:#111111;margin-top:4px;display:block;">${user.full_name || '—'}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding-bottom:12px;border-top:1px solid #eeeeee;padding-top:12px;">
                        <span style="font-size:11px;font-weight:700;color:#888888;text-transform:uppercase;letter-spacing:0.5px;">Email</span><br/>
                        <span style="font-size:14px;color:#333333;margin-top:4px;display:block;">${user.email}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="border-top:1px solid #eeeeee;padding-top:12px;">
                        <span style="font-size:11px;font-weight:700;color:#888888;text-transform:uppercase;letter-spacing:0.5px;">Première connexion</span><br/>
                        <span style="font-size:14px;color:#333333;margin-top:4px;display:block;">${joinedAt}</span>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 28px;font-size:15px;color:#555555;line-height:1.7;">
              Cette personne vient de se connecter pour la première fois à TrackSmart. <strong>Souhaitez-vous lui accorder l'accès ?</strong>
            </p>

            <!-- Action buttons -->
            <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
              <tr>
                <td style="padding-right:12px;">
                  <a href="${approveUrl}" style="display:inline-block;background:#16a34a;border-radius:12px;padding:14px 28px;color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;letter-spacing:0.3px;">
                    ✓ Accepter l'accès
                  </a>
                </td>
                <td>
                  <a href="${rejectUrl}" style="display:inline-block;background:#dc2626;border-radius:12px;padding:14px 28px;color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;letter-spacing:0.3px;">
                    ✕ Refuser l'accès
                  </a>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 32px;font-size:12px;color:#aaaaaa;line-height:1.7;background:#f9f9f7;border-radius:10px;padding:14px 18px;">
              💡 <strong>Note :</strong> Cliquer sur "Accepter" activera automatiquement l'abonnement de cet utilisateur. Cliquer sur "Refuser" bloquera son accès à l'application.
            </p>

          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9f9f7;border-top:1px solid #eeeeee;padding:22px 40px;text-align:center;">
            <p style="margin:0;font-size:12px;color:#aaaaaa;">© ${new Date().getFullYear()} TNO Studio · TrackSmart Retail</p>
            <p style="margin:6px 0 0;font-size:12px;color:#cccccc;">support@tracksmart.com</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

    // 1. Notify admin
    await base44.integrations.Core.SendEmail({
      to: ADMIN_EMAIL,
      subject: `🔔 TrackSmart — Nouvelle demande d'accès : ${user.full_name || user.email}`,
      body: emailHtml,
    });

    // 2. Send "pending" confirmation to the user
    const pendingHtml = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"/><title>Demande en cours</title></head>
<body style="margin:0;padding:0;background:#f0efeb;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0efeb;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.10);max-width:560px;">
        <tr><td style="background:#111111;padding:28px 40px;">
          <table cellpadding="0" cellspacing="0"><tr>
            <td style="background:#C9A64C;border-radius:10px;padding:8px 16px;">
              <span style="color:#000000;font-weight:800;font-size:15px;">TrackSmart</span>
              <span style="color:rgba(0,0,0,0.35);font-size:11px;margin-left:6px;">Retail</span>
            </td>
          </tr></table>
        </td></tr>
        <tr><td style="height:3px;background:linear-gradient(90deg,#f59e0b,#f59e0baa);"></td></tr>
        <tr><td style="padding:36px 40px 0;">
          <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#f59e0b;letter-spacing:0.5px;text-transform:uppercase;">⏳ Demande reçue</p>
          <h1 style="margin:0 0 20px;font-size:24px;font-weight:800;color:#111111;">Votre demande est en cours de traitement</h1>
          <p style="margin:0 0 24px;font-size:15px;color:#555555;line-height:1.7;">
            Bonjour <strong>${user.full_name || user.email}</strong>,<br/><br/>
            Nous avons bien reçu votre demande d'accès à <strong>TrackSmart Retail</strong>. Elle est actuellement en cours d'examen par notre équipe.
          </p>
          <table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 28px;">
            <tr>
              <td style="background:#fefce8;border-radius:14px;padding:20px 24px;border-left:4px solid #f59e0b;">
                <p style="margin:0;font-size:14px;color:#92400e;line-height:1.6;">
                  🕐 <strong>Vous recevrez un email de confirmation dans les 10 prochaines minutes</strong> vous donnant accès à votre espace TrackSmart.
                </p>
              </td>
            </tr>
          </table>
          <p style="margin:0 0 32px;font-size:14px;color:#888888;line-height:1.6;">
            Si vous n'avez pas reçu de réponse passé ce délai, n'hésitez pas à contacter notre support.
          </p>
        </td></tr>
        <tr><td style="background:#f9f9f7;border-top:1px solid #eeeeee;padding:22px 40px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#aaaaaa;">© ${new Date().getFullYear()} TNO Studio · TrackSmart Retail</p>
          <p style="margin:6px 0 0;font-size:12px;color:#cccccc;">support@tracksmart.com</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: '⏳ TrackSmart — Votre demande d\'accès est en cours de traitement',
      body: pendingHtml,
    });

    // Mark user so we don't notify twice
    await base44.auth.updateMe({ admin_notified: true });

    return Response.json({ success: true });
  } catch (error) {
    console.error('notifyNewUser error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});