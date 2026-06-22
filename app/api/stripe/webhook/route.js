import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getAdminSupabase } from '../../../../lib/supabase/admin';

// Stripe webhook handler. Verifies the HMAC signature, then upserts the
// subscription row in Supabase. Uses the service-role client so RLS doesn't
// block writes on behalf of the user.
//
// Stripe Dashboard → Developers → Webhooks → Add endpoint:
//   URL:     https://YOUR-DOMAIN/api/stripe/webhook
//   Events:  checkout.session.completed
//            customer.subscription.updated
//            customer.subscription.deleted
//
// Copy the signing secret into STRIPE_WEBHOOK_SECRET (Vercel env vars).

export const runtime = 'nodejs';
// Don't try to body-parse this; we need the raw text for signature verification.
export const dynamic = 'force-dynamic';

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' })
  : null;

function toIsoSeconds(seconds) {
  return seconds ? new Date(seconds * 1000).toISOString() : null;
}

export async function POST(request) {
  if (!stripe) {
    return NextResponse.json(
      { error: 'server_misconfigured', message: 'STRIPE_SECRET_KEY missing.' },
      { status: 500 }
    );
  }
  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json(
      { error: 'server_misconfigured', message: 'STRIPE_WEBHOOK_SECRET missing.' },
      { status: 500 }
    );
  }

  const rawBody = await request.text();
  const sig = request.headers.get('stripe-signature');

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('[stripe/webhook] signature verification failed', err?.message);
    return NextResponse.json({ error: 'invalid_signature' }, { status: 400 });
  }

  const admin = getAdminSupabase();

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.client_reference_id || session.metadata?.user_id;
        const customerId =
          typeof session.customer === 'string' ? session.customer : session.customer?.id;
        const subscriptionId =
          typeof session.subscription === 'string'
            ? session.subscription
            : session.subscription?.id;
        const tier = session.metadata?.tier;

        if (!userId || !subscriptionId || !tier) {
          console.error('[stripe/webhook] checkout.session.completed missing fields', {
            userId,
            subscriptionId,
            tier
          });
          break;
        }

        // Pull the subscription so we have authoritative status + period info.
        const sub = await stripe.subscriptions.retrieve(subscriptionId);

        const { error } = await admin
          .from('subscriptions')
          .upsert(
            {
              user_id: userId,
              stripe_customer_id: customerId,
              stripe_subscription_id: subscriptionId,
              tier,
              status: sub.status,
              current_period_end: toIsoSeconds(sub.current_period_end),
              trial_end: toIsoSeconds(sub.trial_end)
            },
            { onConflict: 'user_id' }
          );
        if (error) {
          console.error('[stripe/webhook] upsert failed', error);
          return NextResponse.json({ error: 'db_error' }, { status: 500 });
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const tier = sub.metadata?.tier;

        const updates = {
          status: sub.status,
          current_period_end: toIsoSeconds(sub.current_period_end),
          trial_end: toIsoSeconds(sub.trial_end)
        };
        if (tier) updates.tier = tier;

        const { error } = await admin
          .from('subscriptions')
          .update(updates)
          .eq('stripe_subscription_id', sub.id);
        if (error) {
          console.error('[stripe/webhook] update failed', error);
          return NextResponse.json({ error: 'db_error' }, { status: 500 });
        }
        break;
      }

      default:
        // Ignore other event types — Stripe still expects a 200.
        break;
    }
  } catch (err) {
    console.error('[stripe/webhook] handler error', err);
    return NextResponse.json(
      { error: 'handler_error', message: err?.message ?? 'unknown' },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}
