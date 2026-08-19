import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { userId, action } = await req.json();

    if (!userId || !action) {
      return Response.json({ error: 'Missing userId or action' }, { status: 400 });
    }

    // Must be admin
    const caller = await base44.auth.me();
    if (!caller || caller.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    if (action === 'approve') {
      // Set subscription_status to active with a start date of today
      await base44.asServiceRole.entities.User.update(userId, {
        subscription_status: 'active',
        subscription_start_date: new Date().toISOString().split('T')[0],
        access_approved: true,
      });

      // Notify the user they're approved
      const users = await base44.asServiceRole.entities.User.filter({ id: userId });
      const targetUser = users[0];
      if (targetUser?.email) {
        const emailHtml = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"/><title>Accès approuvé</title></head>
<body style="margin:0;padding:0;background:#f0efeb;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0efeb;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.10);max-width:560px;">
        <tr><td style="background:#111111;padding:28px 40px;">
          <table cellpadding="0" cellspacing="0"><tr>
            <td style="background:#C9A64C;border-radius:10px;padding:8px 16px;">
              <span style="color:#000000;font-weight:800;font-size:15px;">TrackSmart Retail</span>
              <span style="color:rgba(0,0,0,0.35);font-size:11px;margin-left:6px;">Retail</span>
            </td>
          </tr></table>
        </td></tr>
        <tr><td style="height:3px;background:linear-gradient(90deg,#16a34a,#16a34aaa);"></td></tr>
        <tr><td style="padding:36px 40px 0;">
          <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#16a34a;letter-spacing:0.5px;text-transform:uppercase;">✓ Accès confirmé</p>
          <h1 style="margin:0 0 20px;font-size:24px;font-weight:800;color:#111111;">Bienvenue sur TrackSmart Retail ! 🎉</h1>
          <p style="margin:0 0 20px;font-size:15px;color:#555555;line-height:1.7;">
            Bonjour <strong>${targetUser.full_name || targetUser.email}</strong>,<br/><br/>
            Bonne nouvelle ! Votre accès à <strong>TrackSmart Retail</strong> a été <strong style="color:#16a34a;">validé</strong>. Vous pouvez dès maintenant vous connecter et commencer à gérer vos produits.
          </p>
          <table cellpadding="0" cellspacing="0" width="100%" style="margin:0 0 28px;">
            <tr>
              <td style="background:#f0fdf4;border-radius:14px;padding:20px 24px;border-left:4px solid #16a34a;">
                <p style="margin:0;font-size:14px;color:#166534;line-height:1.6;">
                  🚀 Cliquez sur le bouton ci-dessous pour accéder à votre tableau de bord et démarrer le suivi de vos produits.
                </p>
              </td>
            </tr>
          </table>
          <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
            <tr><td style="background:#111111;border-radius:12px;padding:14px 32px;">
              <a href="https://tracksmart.base44.app/dashboard" style="color:#C9A64C;font-weight:700;font-size:14px;text-decoration:none;">Accéder à mon espace →</a>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="background:#f9f9f7;border-top:1px solid #eeeeee;padding:22px 40px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#aaaaaa;">© ${new Date().getFullYear()} TNO Studio · TrackSmart Retail · support@tracksmart.com</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

        await base44.integrations.Core.SendEmail({
          to: targetUser.email,
          subject: '✓ TrackSmart Retail — Votre accès a été approuvé !',
          body: emailHtml,
        });
      }

      return Response.json({ success: true, action: 'approved' });

    } else if (action === 'reject') {
      await base44.asServiceRole.entities.User.update(userId, {
        subscription_status: 'blocked',
        access_approved: false,
      });

      const users = await base44.asServiceRole.entities.User.filter({ id: userId });
      const targetUser = users[0];
      if (targetUser?.email) {
        const emailHtml = `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"/><title>Accès refusé</title></head>
<body style="margin:0;padding:0;background:#f0efeb;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0efeb;padding:40px 0;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 8px 40px rgba(0,0,0,0.10);max-width:560px;">
        <tr><td style="background:#111111;padding:28px 40px;">
          <table cellpadding="0" cellspacing="0"><tr>
            <td style="background:#C9A64C;border-radius:10px;padding:8px 16px;">
              <span style="color:#000000;font-weight:800;font-size:15px;">TrackSmart Retail</span>
              <span style="color:rgba(0,0,0,0.35);font-size:11px;margin-left:6px;">Retail</span>
            </td>
          </tr></table>
        </td></tr>
        <tr><td style="height:3px;background:linear-gradient(90deg,#dc2626,#dc2626aa);"></td></tr>
        <tr><td style="padding:36px 40px 0;">
          <p style="margin:0 0 8px;font-size:13px;font-weight:600;color:#dc2626;letter-spacing:0.5px;text-transform:uppercase;">Accès refusé</p>
          <h1 style="margin:0 0 20px;font-size:24px;font-weight:800;color:#111111;">Demande non approuvée</h1>
          <p style="margin:0 0 28px;font-size:15px;color:#555555;line-height:1.7;">
            Bonjour <strong>${targetUser.full_name || targetUser.email}</strong>,<br/><br/>
            Votre demande d'accès à TrackSmart Retail n'a pas pu être approuvée pour le moment. Pour toute question, contactez-nous directement.
          </p>
          <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
            <tr><td style="background:#111111;border-radius:12px;padding:14px 32px;">
              <a href="mailto:support@tracksmart.com" style="color:#C9A64C;font-weight:700;font-size:14px;text-decoration:none;">Contacter le support →</a>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="background:#f9f9f7;border-top:1px solid #eeeeee;padding:22px 40px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#aaaaaa;">© ${new Date().getFullYear()} TNO Studio · TrackSmart Retail · support@tracksmart.com</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

        await base44.integrations.Core.SendEmail({
          to: targetUser.email,
          subject: 'TrackSmart Retail — Demande d\'accès non approuvée',
          body: emailHtml,
        });
      }

      return Response.json({ success: true, action: 'rejected' });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('handleUserApproval error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});