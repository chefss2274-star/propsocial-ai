import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize once per Lambda cold start. When STRIPE_SECRET_KEY is missing
// (typical during local UI work) the route falls back to a mock URL so the
// frontend flow still completes end-to-end.
const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2024-06-20' })
  : null;

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

  if (!priceId || typeof priceId !== 'string') {
    return NextResponse.json(
      {
        error: 'missing_price_id',
        hint: `Set NEXT_PUBLIC_STRIPE_${tier.toUpperCase()}_PRICE_ID in .env.local`
      },
      { status: 400 }
    );
  }

  if (!stripe) {
    // Local dev fallback — surface a stub URL so the modal redirect still works.
    const url = `/checkout/mock?tier=${tier}&priceId=${encodeURIComponent(priceId)}`;
    return NextResponse.json({ url, stub: true });
  }

  const origin =
    request.headers.get('origin') ??
    process.env.NEXT_PUBLIC_APP_URL ??
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

      // Skips card collection during the trial when Stripe allows it, so
      // sandbox + live both render the same trial-first hosted experience.
      payment_method_collection: 'if_required',

      allow_promotion_codes: true,
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?canceled=true`,
      metadata: { tier }
    });

    return NextResponse.json({ url: session.url, id: session.id });
  } catch (err) {
    console.error('Stripe checkout session error', err);
    return NextResponse.json(
      { error: 'stripe_error', message: err?.message ?? 'unknown' },
      { status: 500 }
    );
  }
}
