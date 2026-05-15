'use client';

import { useEffect, useState } from 'react';
import { X, Check, Loader2, Sparkles, Crown, Zap, AlertCircle } from 'lucide-react';
import { usePricing } from '../context/PricingContext';

const STARTER_FEATURES = [
  'Paste Zillow & Redfin listing links',
  '3 core post variations (Professional / Hype / Community)',
  'One-click copy & character-count utilities',
  '20 generations per month',
  'Standard email support'
];

const PRO_FEATURES = [
  'Everything in Starter',
  'Video transcription & scene analysis',
  'Email newsletter long-form output',
  'Luxury & ultra-luxury tone packs',
  'Unlimited generations',
  'Priority support + brand voice training'
];

export default function PricingModal() {
  const {
    showPricingModal,
    setShowPricingModal,
    setTier,
    checkoutLoading,
    setCheckoutLoading
  } = usePricing();
  const [checkoutError, setCheckoutError] = useState(null);

  // Esc-to-close + body scroll lock while modal is open.
  useEffect(() => {
    if (!showPricingModal) return;
    const onKey = (e) => {
      if (e.key === 'Escape') setShowPricingModal(false);
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [showPricingModal, setShowPricingModal]);

  if (!showPricingModal) return null;

  const handleCheckout = async (tier) => {
    setCheckoutError(null);
    setCheckoutLoading(tier);

    // Price ID validation and Stripe credential validation both live on the
    // server now (see /api/stripe/checkout). The client just sends the tier
    // and trusts the API to either return a redirect URL or a descriptive
    // error message.
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier })
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data?.message || data?.error || `Checkout API returned ${res.status}`);
      }

      // Only redirect to absolute URLs (real Stripe) or our own /checkout/mock
      // stub path. Anything else is a bug — fail loudly instead of 404'ing.
      if (typeof data?.url === 'string' && /^(https?:\/\/|\/checkout\/mock)/.test(data.url)) {
        window.location.href = data.url;
        return;
      }
      throw new Error('Checkout server did not return a valid URL.');
    } catch (err) {
      console.error('[checkout] request failed', err);
      setCheckoutError(err?.message ?? 'Checkout request failed.');
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleDemoBypass = (asTier) => {
    setTier(asTier);
    setShowPricingModal(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pricing-modal-title"
      onClick={() => !checkoutLoading && setShowPricingModal(false)}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md animate-in fade-in"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-slate-800 bg-slate-900/95 shadow-2xl shadow-emerald-500/10"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/40 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.12),transparent_60%)]"
        />

        <button
          onClick={() => setShowPricingModal(false)}
          disabled={!!checkoutLoading}
          className="absolute right-4 top-4 z-10 rounded-md p-2 text-slate-400 transition hover:bg-slate-800 hover:text-slate-100 disabled:opacity-40"
          aria-label="Close pricing"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="relative px-6 pb-6 pt-10 text-center sm:px-8">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-300">
            <Sparkles className="h-3 w-3" />
            Pick a plan to start generating
          </span>
          <h2
            id="pricing-modal-title"
            className="mt-4 text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl"
          >
            Sell more listings, post in{' '}
            <span className="bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent">
              half the time.
            </span>
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-slate-400">
            Both plans start with a 7-day free trial. Cancel anytime — no charges
            if you cancel before the trial ends.
          </p>
        </div>

        <div className="relative grid gap-4 px-6 pb-6 sm:px-8 md:grid-cols-2">
          <TierCard
            name="PropSocial Starter"
            tagline="Solo agents getting started with social"
            price="19.99"
            icon={Zap}
            features={STARTER_FEATURES}
            ctaLabel="Choose Starter"
            ctaTier="starter"
            loading={checkoutLoading === 'starter'}
            disabled={!!checkoutLoading}
            onSelect={() => handleCheckout('starter')}
          />
          <TierCard
            name="PropSocial Pro"
            tagline="Top producers running daily content"
            price="49.99"
            icon={Crown}
            features={PRO_FEATURES}
            ctaLabel="Upgrade to Pro"
            ctaTier="pro"
            popular
            loading={checkoutLoading === 'pro'}
            disabled={!!checkoutLoading}
            onSelect={() => handleCheckout('pro')}
          />
        </div>

        {checkoutError && (
          <div
            role="alert"
            className="mx-6 mb-4 flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200 sm:mx-8"
          >
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
            <div className="flex-1">
              <p className="font-medium text-rose-100">Checkout couldn&apos;t start</p>
              <p className="mt-0.5 text-xs text-rose-200/80">{checkoutError}</p>
            </div>
            <button
              onClick={() => setCheckoutError(null)}
              className="text-xs text-rose-300 hover:text-rose-100"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="relative flex flex-col items-center justify-between gap-3 border-t border-slate-800 bg-slate-950/40 px-6 py-5 sm:flex-row sm:px-8">
          <p className="text-[11px] text-slate-500">
            Secure checkout powered by Stripe · SSL encrypted · we never store
            card details.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-wider text-slate-600">
              Dev bypass
            </span>
            <button
              onClick={() => handleDemoBypass('starter')}
              disabled={!!checkoutLoading}
              className="rounded-md border border-slate-700 px-2.5 py-1 text-[11px] font-medium text-slate-300 transition hover:border-slate-600 hover:text-slate-100 disabled:opacity-40"
            >
              Demo as Starter
            </button>
            <button
              onClick={() => handleDemoBypass('pro')}
              disabled={!!checkoutLoading}
              className="rounded-md border border-emerald-500/40 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-medium text-emerald-300 transition hover:bg-emerald-500/20 disabled:opacity-40"
            >
              Demo as Pro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function TierCard({
  name,
  tagline,
  price,
  icon: Icon,
  features,
  ctaLabel,
  ctaTier,
  popular,
  loading,
  disabled,
  onSelect
}) {
  return (
    <div
      className={`relative flex flex-col rounded-xl border p-6 transition ${
        popular
          ? 'border-emerald-500/40 bg-slate-950/70 ring-1 ring-emerald-500/20'
          : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
      }`}
    >
      {popular && (
        <span className="absolute -top-3 right-6 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-950 shadow-lg shadow-emerald-500/30">
          <Crown className="h-3 w-3" />
          Top Producer
        </span>
      )}

      <div className="mb-1 flex items-center gap-2">
        <Icon className={`h-4 w-4 ${popular ? 'text-emerald-300' : 'text-slate-400'}`} />
        <h3 className="text-sm font-semibold text-slate-100">{name}</h3>
      </div>
      <p className="text-xs text-slate-500">{tagline}</p>

      <div className="mt-5 flex items-baseline gap-1">
        <span className="text-3xl font-bold text-slate-100">${price}</span>
        <span className="text-sm text-slate-500">/mo</span>
      </div>

      <ul className="mt-6 flex-1 space-y-2.5">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
            <span
              className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                popular ? 'bg-emerald-500/15 text-emerald-300' : 'bg-slate-800 text-slate-400'
              }`}
            >
              <Check className="h-3 w-3" strokeWidth={3} />
            </span>
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={onSelect}
        disabled={disabled}
        data-tier={ctaTier}
        className={`mt-6 inline-flex items-center justify-center gap-2 rounded-lg px-5 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
          popular
            ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-emerald-300'
            : 'border border-slate-700 bg-slate-900 text-slate-100 hover:border-slate-600 hover:bg-slate-800'
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Redirecting to checkout…
          </>
        ) : (
          ctaLabel
        )}
      </button>
    </div>
  );
}
