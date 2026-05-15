import { NextResponse } from 'next/server';
import Stripe from 'stripe';

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

  const { tier, priceId } = body ?? {};

  if (tier !== 'starter' && tier !== 'pro') {
    return NextResponse.json({ error: 'invalid_tier' }, { status: 400 });
  }

  if (!priceId || typeof priceId !== 'string' || !priceId.startsWith('price_')) {
    return NextResponse.json(
      {
        error: 'missing_price_id',
        message: `NEXT_PUBLIC_STRIPE_${tier.toUpperCase()}_PRICE_ID is not set or has an unexpected format. Stripe price IDs start with "price_". After updating env vars in Vercel, redeploy so the frontend bundle picks up the new value.`
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

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],

      // 7-day free trial enforced server-side so the hosted Checkout page
      // matches the "7-day free trial" promise on the pricing modal cards.
      subscription_data: {
        trial_period_days: 7,
        metadata: { tier }
      },

      // Skips card collection during the trial when Stripe allows it.
      payment_method_collection: 'if_required',

      allow_promotion_codes: true,
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/canceled`,
      metadata: { tier }
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
