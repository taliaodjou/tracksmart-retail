import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY'));

Deno.serve(async (req) => {
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  const body = await req.text();

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return new Response('Webhook Error', { status: 400 });
  }

  const base44 = createClientFromRequest(req);

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.base44_user_id;
        if (!userId) break;

        // Activate subscription
        await base44.asServiceRole.entities.User.update(userId, {
          subscription_status: 'active',
          subscription_start_date: new Date().toISOString().split('T')[0],
          stripe_customer_id: session.customer,
        });
        console.log(`Subscription activated for user ${userId}`);
        break;
      }

      case 'customer.subscription.deleted':
      case 'customer.subscription.paused': {
        const sub = event.data.object;
        const customerId = sub.customer;
        // Find user by stripe_customer_id
        const users = await base44.asServiceRole.entities.User.filter({ stripe_customer_id: customerId });
        if (users.length > 0) {
          await base44.asServiceRole.entities.User.update(users[0].id, {
            subscription_status: 'inactive',
          });
          console.log(`Subscription deactivated for customer ${customerId}`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customerId = invoice.customer;
        const users = await base44.asServiceRole.entities.User.filter({ stripe_customer_id: customerId });
        if (users.length > 0) {
          await base44.asServiceRole.entities.User.update(users[0].id, {
            subscription_status: 'inactive',
          });
          console.log(`Payment failed, subscription deactivated for customer ${customerId}`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object;
        const customerId = sub.customer;
        const isActive = sub.status === 'active' || sub.status === 'trialing';
        const users = await base44.asServiceRole.entities.User.filter({ stripe_customer_id: customerId });
        if (users.length > 0) {
          await base44.asServiceRole.entities.User.update(users[0].id, {
            subscription_status: isActive ? 'active' : 'inactive',
          });
          console.log(`Subscription updated for customer ${customerId}: ${sub.status}`);
        }
        break;
      }
    }
  } catch (err) {
    console.error('Webhook handler error:', err.message);
  }

  return Response.json({ received: true });
});