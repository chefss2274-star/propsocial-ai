import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerUser } from '../../../../lib/auth';
import { getServerSupabase } from '../../../../lib/supabase/server';

// Initialize once per Lambda cold start. When STRIPE_SECRET_KEY is missing
// in *development* we fall back to a stub URL so local UI flows still work;
// in *production* a missing key is a hard error so the user never silently
// gets redirected to a non-existent /checkout/mock page.
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' })
  : null;

const IS_PROD = process.env.NODE_ENV === 'production';

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  const { tier } = body ?? {};

  if (tier !== 'starter' && tier !== 'pro') {
    return NextResponse.json({ error: 'invalid_tier' }, { status: 400 });
  }

  const user = await getServerUser();
  if (!user) {
    return NextResponse.json(
      { error: 'unauthenticated', message: 'Sign in before starting checkout.' },
      { status: 401 }
    );
  }

  // Server-side resolution of the price ID. NEXT_PUBLIC_ env vars are readable
  // from the server too, so this works without exposing anything new — and
  // the API becomes the single source of truth for both the price lookup and
  // the secret key check.
  const priceId =
    tier === 'starter'
      ? process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID
      : process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID;

  if (!priceId || typeof priceId !== 'string' || !priceId.startsWith('price_')) {
    return NextResponse.json(
      {
        error: 'missing_price_id',
        message: `NEXT_PUBLIC_STRIPE_${tier.toUpperCase()}_PRICE_ID is not set on the server, or doesn't look like a Stripe price ID ("price_..."). Add it in Vercel → Project → Settings → Environment Variables, then redeploy.`
      },
      { status: 400 }
    );
  }

  if (!stripe) {
    if (IS_PROD) {
      console.error('[stripe/checkout] STRIPE_SECRET_KEY missing at runtime.');
      return NextResponse.json(
        {
          error: 'server_misconfigured',
          message:
            'Stripe is not configured on this deployment (STRIPE_SECRET_KEY missing). Set it in Vercel → Project → Settings → Environment Variables, then trigger a new deploy.'
        },
        { status: 500 }
      );
    }
    // Dev fallback so the UI flow still completes locally without a Stripe key.
    const url = `/checkout/mock?tier=${tier}&priceId=${encodeURIComponent(priceId)}`;
    return NextResponse.json({ url, stub: true });
  }

  // Prefer the URL Next.js built from the incoming request — works in both
  // Vercel preview and prod deployments, and on localhost.
  const origin =
    new URL(request.url).origin ||
    process.env.NEXT_PUBLIC_APP_URL ||
    'http://localhost:3000';

  // Reuse an existing Stripe customer if we've created one for this user
  // before — avoids duplicate customer records on re-subscription.
  const supabase = getServerSupabase();
  const { data: existingSub } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .maybeSingle();

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],

      // Bind this checkout to the authenticated Supabase user. The webhook
      // reads `client_reference_id` to know which user the resulting
      // subscription belongs to.
      client_reference_id: user.id,
      ...(existingSub?.stripe_customer_id
        ? { customer: existingSub.stripe_customer_id }
        : { customer_email: user.email }),

      // 7-day free trial enforced server-side so the hosted Checkout page
      // matches the "7-day free trial" promise on the pricing modal cards.
      subscription_data: {
        trial_period_days: 7,
        metadata: { tier, user_id: user.id }
      },

      // Always collect a card up-front so the trial converts to a real
      // charge automatically on day 8 unless the user cancels first.
      payment_method_collection: 'always',

      allow_promotion_codes: true,
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/canceled`,
      metadata: { tier, user_id: user.id }
    });

    if (!session?.url) {
      console.error('[stripe/checkout] Session created without a url', session);
      return NextResponse.json(
        { error: 'stripe_no_url', message: 'Stripe did not return a checkout URL.' },
        { status: 502 }
      );
    }

    return NextResponse.json({ url: session.url, id: session.id });
  } catch (err) {
    console.error('[stripe/checkout] session creation failed', err);
    return NextResponse.json(
      {
        error: 'stripe_error',
        message: err?.message ?? 'Unknown Stripe error',
        code: err?.code,
        type: err?.type
      },
      { status: 500 }
    );
  }
}
