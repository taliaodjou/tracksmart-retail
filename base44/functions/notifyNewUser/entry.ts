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
    const year = new Date().getFullYear();
    const today = new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
    const joinedAt = new Date().toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });

    const positionLabels = { owner: 'Propriétaire', manager: 'Responsable / Manager', employee: 'Employé(e)' };
    const businessLabels = {
      supermarche: 'Supermarché / Grande surface', epicerie: 'Épicerie / Alimentation générale',
      boulangerie: 'Boulangerie / Pâtisserie', boucherie: 'Boucherie / Charcuterie',
      pharmacie: 'Pharmacie / Parapharmacie', restaurant: 'Restaurant / Traiteur',
      cafe_bar: 'Café / Bar', autre: 'Autre',
    };
    const langLabel = user.preferred_lang === 'en' ? '🇬🇧 English' : '🇫🇷 Français';
    const positionLabel = positionLabels[user.user_position] || user.user_position || '—';
    const businessLabel = businessLabels[user.business_type] || user.business_type || '—';
    const location = [user.city, user.country].filter(Boolean).join(', ') || '—';

    // Build profile rows dynamically
    const profileRows = [
      { label: 'Nom complet', value: user.full_name || '—', highlight: true },
      { label: 'Email', value: user.email },
      { label: 'Poste', value: positionLabel },
      { label: 'Type de commerce', value: businessLabel },
      { label: 'Localisation', value: location },
      { label: 'Langue', value: langLabel },
      { label: 'Première connexion', value: joinedAt },
    ];

    const profileRowsHtml = profileRows.map((row, i) => `
      <tr>
        <td style="padding:${i === 0 ? '0' : '12px'} 0 12px;${i > 0 ? 'border-top:1px solid #eeeeee;' : ''}">
          <span style="font-size:10px;font-weight:700;color:${row.highlight ? '#C9A64C' : '#999999'};text-transform:uppercase;letter-spacing:0.6px;">${row.label}</span><br/>
          <span style="font-size:${row.highlight ? '17px' : '14px'};font-weight:${row.highlight ? '700' : '500'};color:${row.highlight ? '#111111' : '#333333'};margin-top:3px;display:block;">${row.value}</span>
        </td>
      </tr>`).join('');

    const emailHtml = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>Nouvelle demande d'accès — TrackSmart</title>
</head>
<body style="margin:0;padding:0;background:#f0efeb;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0efeb;padding:48px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 12px 48px rgba(0,0,0,0.12);max-width:600px;">

        <!-- Header -->
        <tr>
          <td style="background:#0f0f0f;padding:32px 44px 28px;">
            <table cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td>
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="background:#C9A64C;border-radius:10px;padding:8px 18px;">
                        <span style="color:#000000;font-weight:800;font-size:15px;letter-spacing:0.3px;">TrackSmart</span>
                        <span style="color:rgba(0,0,0,0.3);font-size:11px;font-weight:500;margin-left:7px;letter-spacing:0.3px;">Retail</span>
                      </td>
                    </tr>
                  </table>
                  <p style="margin:10px 0 0;font-size:11px;color:rgba(255,255,255,0.3);letter-spacing:0.5px;text-transform:uppercase;">by TNO Studio</p>
                </td>
                <td style="text-align:right;vertical-align:top;">
                  <div style="display:inline-block;background:rgba(201,166,76,0.15);border:1px solid rgba(201,166,76,0.3);border-radius:20px;padding:5px 14px;">
                    <span style="font-size:11px;font-weight:600;color:#C9A64C;letter-spacing:0.5px;text-transform:uppercase;">Admin · Accès requis</span>
                  </div>
                  <div style="font-size:11px;color:rgba(255,255,255,0.35);margin-top:8px;">${today}</div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Gradient bar -->
        <tr><td style="height:3px;background:linear-gradient(90deg,#f59e0b 0%,#C9A64C 50%,#f59e0baa 100%);"></td></tr>

        <!-- Hero section -->
        <tr>
          <td style="padding:40px 44px 0;">
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#fef3c7;border-radius:12px;padding:10px 16px;margin-bottom:20px;display:inline-block;">
                  <span style="font-size:12px;font-weight:700;color:#92400e;text-transform:uppercase;letter-spacing:0.6px;">🔔 Nouvelle demande d'accès</span>
                </td>
              </tr>
            </table>
            <h1 style="margin:14px 0 10px;font-size:28px;font-weight:800;color:#111111;line-height:1.2;letter-spacing:-0.5px;">
              Un nouvel utilisateur<br/>souhaite rejoindre TrackSmart
            </h1>
            <p style="margin:0 0 32px;font-size:15px;color:#666666;line-height:1.7;">
              Un nouveau compte vient d'être créé. Consultez le profil ci-dessous et décidez d'accorder ou de refuser l'accès à la plateforme.
            </p>
          </td>
        </tr>

        <!-- Profile card -->
        <tr>
          <td style="padding:0 44px 32px;">
            <table cellpadding="0" cellspacing="0" width="100%" style="background:#fafaf8;border-radius:16px;padding:28px 32px;border:1px solid #eeeeee;">
              <tr><td>
                <table cellpadding="0" cellspacing="0" width="100%">
                  ${profileRowsHtml}
                </table>
              </td></tr>
            </table>
          </td>
        </tr>

        <!-- Divider -->
        <tr><td style="padding:0 44px;"><div style="height:1px;background:#f0f0f0;"></div></td></tr>

        <!-- Action section -->
        <tr>
          <td style="padding:32px 44px;">
            <p style="margin:0 0 20px;font-size:15px;font-weight:600;color:#111111;">Quelle action souhaitez-vous effectuer ?</p>
            <table cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding-right:12px;">
                  <a href="${approveUrl}" style="display:inline-block;background:#16a34a;border-radius:12px;padding:15px 32px;color:#ffffff;font-weight:700;font-size:14px;text-decoration:none;letter-spacing:0.3px;">
                    ✓ &nbsp;Accepter l'accès
                  </a>
                </td>
                <td>
                  <a href="${rejectUrl}" style="display:inline-block;background:#ffffff;border:2px solid #dc2626;border-radius:12px;padding:13px 30px;color:#dc2626;font-weight:700;font-size:14px;text-decoration:none;letter-spacing:0.3px;">
                    ✕ &nbsp;Refuser l'accès
                  </a>
                </td>
              </tr>
            </table>
            <table cellpadding="0" cellspacing="0" width="100%" style="margin-top:20px;">
              <tr>
                <td style="background:#f9f9f7;border-radius:10px;padding:14px 18px;border-left:3px solid #C9A64C;">
                  <p style="margin:0;font-size:12px;color:#888888;line-height:1.7;">
                    <strong style="color:#555555;">Accepter</strong> activera immédiatement l'abonnement et notifiera l'utilisateur par email.<br/>
                    <strong style="color:#555555;">Refuser</strong> bloquera l'accès et enverra un email d'information à l'utilisateur.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f5f5f3;border-top:1px solid #e8e8e5;padding:24px 44px;">
            <table cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td>
                  <p style="margin:0;font-size:12px;color:#aaaaaa;">© ${year} TNO Studio · TrackSmart Retail</p>
                </td>
                <td style="text-align:right;">
                  <a href="mailto:support@tracksmart.com" style="font-size:12px;color:#C9A64C;text-decoration:none;font-weight:600;">support@tracksmart.com</a>
                </td>
              </tr>
            </table>
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

    // 2. Send "pending" confirmation to the user (bilingual based on preferred_lang)
    const isEn = user.preferred_lang === 'en';
    const firstName = (user.full_name || user.email).split(' ')[0];
    const pendingHtml = `<!DOCTYPE html>
<html lang="${isEn ? 'en' : 'fr'}">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1.0"/>
  <title>${isEn ? 'Access request received — TrackSmart' : 'Demande d\'accès reçue — TrackSmart'}</title>
</head>
<body style="margin:0;padding:0;background:#f0efeb;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0efeb;padding:48px 0;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:24px;overflow:hidden;box-shadow:0 12px 48px rgba(0,0,0,0.12);max-width:580px;">

        <!-- Header -->
        <tr>
          <td style="background:#0f0f0f;padding:32px 44px 28px;">
            <table cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td>
                  <table cellpadding="0" cellspacing="0">
                    <tr>
                      <td style="background:#C9A64C;border-radius:10px;padding:8px 18px;">
                        <span style="color:#000000;font-weight:800;font-size:15px;letter-spacing:0.3px;">TrackSmart</span>
                        <span style="color:rgba(0,0,0,0.3);font-size:11px;font-weight:500;margin-left:7px;">Retail</span>
                      </td>
                    </tr>
                  </table>
                  <p style="margin:10px 0 0;font-size:11px;color:rgba(255,255,255,0.3);letter-spacing:0.5px;text-transform:uppercase;">by TNO Studio</p>
                </td>
                <td style="text-align:right;vertical-align:top;">
                  <div style="display:inline-block;background:rgba(245,158,11,0.15);border:1px solid rgba(245,158,11,0.3);border-radius:20px;padding:5px 14px;">
                    <span style="font-size:11px;font-weight:600;color:#f59e0b;letter-spacing:0.5px;text-transform:uppercase;">⏳ ${isEn ? 'Pending' : 'En attente'}</span>
                  </div>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Amber bar -->
        <tr><td style="height:3px;background:linear-gradient(90deg,#f59e0b 0%,#C9A64C 50%,#f59e0baa 100%);"></td></tr>

        <!-- Body -->
        <tr>
          <td style="padding:44px 44px 0;">
            <h1 style="margin:0 0 12px;font-size:26px;font-weight:800;color:#111111;line-height:1.2;letter-spacing:-0.3px;">
              ${isEn ? `Welcome to TrackSmart, ${firstName}!` : `Bienvenue sur TrackSmart, ${firstName} !`}
            </h1>
            <p style="margin:0 0 28px;font-size:15px;color:#666666;line-height:1.8;">
              ${isEn
                ? `Your access request has been received. Our team is reviewing your profile and you will receive a confirmation email <strong style="color:#111111;">shortly</strong>.`
                : `Votre demande d'accès a bien été reçue. Notre équipe examine votre profil et vous recevrez un email de confirmation <strong style="color:#111111;">sous peu</strong>.`}
            </p>

            <!-- Status card -->
            <table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 28px;">
              <tr>
                <td style="background:#fffbeb;border-radius:16px;padding:24px 28px;border:1px solid #fde68a;">
                  <table cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                      <td width="48" style="vertical-align:top;padding-right:16px;">
                        <div style="width:42px;height:42px;background:#f59e0b;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:20px;text-align:center;line-height:42px;">⏱</div>
                      </td>
                      <td style="vertical-align:top;">
                        <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:#92400e;">
                          ${isEn ? 'Your request is being reviewed' : 'Votre demande est en cours d\'examen'}
                        </p>
                        <p style="margin:0;font-size:13px;color:#a16207;line-height:1.6;">
                          ${isEn
                            ? 'You will receive an email with your access credentials as soon as your account is validated.'
                            : 'Vous recevrez un email dès que votre compte sera validé, vous permettant d\'accéder à votre espace TrackSmart.'}
                        </p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <!-- What to expect -->
            <p style="margin:0 0 14px;font-size:12px;font-weight:700;color:#999999;text-transform:uppercase;letter-spacing:0.6px;">
              ${isEn ? 'What you will get access to' : 'Ce à quoi vous aurez accès'}
            </p>
            <table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 36px;background:#fafaf8;border-radius:12px;padding:16px 20px;border:1px solid #eeeeee;">
              ${['Gestion des stocks & dates de péremption|Stock & expiration date management',
                 'Alertes automatiques & rapports|Automatic alerts & weekly reports',
                 'Gestion des commandes fournisseurs|Supplier order management',
                 'Tableaux de bord & analytiques|Dashboards & analytics'].map(pair => {
                const [fr2, en2] = pair.split('|');
                return `<tr><td style="padding:6px 0;">
                  <span style="color:#C9A64C;font-weight:800;margin-right:10px;">✓</span>
                  <span style="font-size:13px;color:#555555;">${isEn ? en2 : fr2}</span>
                </td></tr>`;
              }).join('')}
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f5f5f3;border-top:1px solid #e8e8e5;padding:24px 44px;">
            <table cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td>
                  <p style="margin:0;font-size:12px;color:#aaaaaa;">© ${year} TNO Studio · TrackSmart Retail</p>
                </td>
                <td style="text-align:right;">
                  <a href="mailto:support@tracksmart.com" style="font-size:12px;color:#C9A64C;text-decoration:none;font-weight:600;">support@tracksmart.com</a>
                </td>
              </tr>
            </table>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body></html>`;

    await base44.integrations.Core.SendEmail({
      to: user.email,
      subject: isEn
        ? '⏳ TrackSmart — Your access request is being reviewed'
        : '⏳ TrackSmart — Votre demande d\'accès est en cours de traitement',
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