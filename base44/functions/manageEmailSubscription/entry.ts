import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { action, userId } = await req.json();

    // action = "unsubscribe" | "resubscribe"
    // For unsubscribe: userId is the user's id (passed as token in email link)
    // We use service role to update any user

    if (!action || !userId) {
      return Response.json({ error: 'Missing action or userId' }, { status: 400 });
    }

    const unsubscribed = action === 'unsubscribe';
    await base44.asServiceRole.entities.User.update(userId, { email_unsubscribed: unsubscribed });

    return Response.json({ success: true, unsubscribed });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});