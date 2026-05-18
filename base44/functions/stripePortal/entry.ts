import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const customerId = user.stripe_customer_id;
    if (!customerId) {
      return Response.json({ error: 'No Stripe customer found' }, { status: 404 });
    }

    const { returnUrl } = await req.json().catch(() => ({}));

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl || 'https://tracksmart.base44.app/profile',
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Stripe portal error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});