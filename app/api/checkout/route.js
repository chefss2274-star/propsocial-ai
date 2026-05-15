import { NextResponse } from 'next/server';

// Secure checkout redirect endpoint. The client POSTs { tier, priceId }; this
// route should create a Stripe Checkout Session server-side (so the secret key
// never leaves the server) and return { url } for the client to redirect to.
//
// Replacement sketch for the real implementation:
//
//   import Stripe from 'stripe';
//   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
//   const session = await stripe.checkout.sessions.create({
//     mode: 'subscription',
//     line_items: [{ price: priceId, quantity: 1 }],
//     success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
//     cancel_url: `${origin}/?canceled=true`,
//     allow_promotion_codes: true
//   });
//   return NextResponse.json({ url: session.url });

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
      { error: 'missing_price_id', hint: `Set NEXT_PUBLIC_STRIPE_${tier.toUpperCase()}_PRICE_ID in .env.local` },
      { status: 400 }
    );
  }

  // Stubbed redirect URL — swap for `session.url` from Stripe once wired up.
  const url = `/checkout/mock?tier=${tier}&priceId=${encodeURIComponent(priceId)}`;
  return NextResponse.json({ url, stub: true });
}
