import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const { name, email, message } = await req.json();

    if (!name || !email || !message) {
      return Response.json({ error: 'Tous les champs sont requis.' }, { status: 400 });
    }

    const base44 = createClientFromRequest(req);
    const adminEmail = Deno.env.get("ADMIN_EMAIL") || 'talia.odjou@gmail.com';

    await base44.asServiceRole.integrations.Core.SendEmail({
      to: adminEmail,
      subject: `📬 TrackSmart Retail — Nouveau message de ${name}`,
      body: `<!DOCTYPE html>
<html lang="fr">
<body style="margin:0;padding:0;font-family:sans-serif;background:#f5f5f5;">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;">
    <div style="background:#0f0f0f;padding:24px 32px;">
      <span style="color:#C9A64C;font-weight:800;">TrackSmart Retail</span>
      <span style="color:rgba(255,255,255,0.4);font-size:13px;margin-left:8px;">Retail</span>
    </div>
    <div style="padding:32px;">
      <h1 style="margin:0 0 24px;font-size:22px;color:#111;">Nouveau message de contact</h1>
      <table cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:24px;">
        <tr><td style="padding:8px 0;color:#666;font-size:14px;"><strong>Nom :</strong> ${name}</td></tr>
        <tr><td style="padding:8px 0;color:#666;font-size:14px;"><strong>Email :</strong> ${email}</td></tr>
        <tr><td style="padding:8px 0;color:#666;font-size:14px;"><strong>Message :</strong></td></tr>
        <tr><td style="padding:12px;background:#f9f9f7;border-radius:8px;font-size:14px;color:#333;line-height:1.6;">${message.replace(/\n/g, '<br/>')}</td></tr>
      </table>
    </div>
  </div>
</body>
</html>`,
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('sendContactMessage error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});