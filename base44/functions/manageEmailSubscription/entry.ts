import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { action, userId } = await req.json();

    if (!action || !userId) {
      return Response.json({ error: 'Missing action or userId' }, { status: 400 });
    }

    // Try to get the authenticated user
    let callerUser = null;
    try {
      callerUser = await base44.auth.me();
    } catch (_) {
      // unauthenticated — allowed only for unsubscribe action (email link clicks)
    }

    // If authenticated, only allow users to modify their own subscription,
    // or allow admins to modify anyone's.
    if (callerUser) {
      if (callerUser.role !== 'admin' && callerUser.id !== userId) {
        return Response.json({ error: 'Forbidden' }, { status: 403 });
      }
    } else {
      // Unauthenticated callers may only unsubscribe (not resubscribe)
      if (action !== 'unsubscribe') {
        return Response.json({ error: 'Authentication required' }, { status: 401 });
      }
    }

    const unsubscribed = action === 'unsubscribe';
    await base44.asServiceRole.entities.User.update(userId, { email_unsubscribed: unsubscribed });

    return Response.json({ success: true, unsubscribed });
  } catch (error) {
    console.error('manageEmailSubscription error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});