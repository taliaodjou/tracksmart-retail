import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { pin } = await req.json();
    const correctPin = Deno.env.get('ADMIN_PORTAL_PIN');

    if (!correctPin) {
      console.error('ADMIN_PORTAL_PIN secret is not set');
      return Response.json({ error: 'Server configuration error' }, { status: 500 });
    }

    if (pin === correctPin) {
      return Response.json({ success: true });
    } else {
      return Response.json({ success: false, error: 'Invalid PIN' }, { status: 401 });
    }
  } catch (error) {
    console.error('verifyAdminPin error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});