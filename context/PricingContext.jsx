'use client';

import { createContext, useContext, useState, useMemo } from 'react';

const PricingContext = createContext(null);

export function PricingProvider({ children }) {
  const [showPricingModal, setShowPricingModal] = useState(false);
  // Tier model: null = unauthenticated/unsubscribed, otherwise 'starter' | 'pro'.
  // In production, hydrate this from your auth session / Stripe customer lookup
  // (e.g. inside a server component or via SWR against /api/me).
  const [tier, setTier] = useState(null);
  const [checkoutLoading, setCheckoutLoading] = useState(null); // 'starter' | 'pro' | null

  const value = useMemo(
    () => ({
      showPricingModal,
      setShowPricingModal,
      tier,
      setTier,
      isSubscribed: tier !== null,
      isPro: tier === 'pro',
      checkoutLoading,
      setCheckoutLoading
    }),
    [showPricingModal, tier, checkoutLoading]
  );

  return <PricingContext.Provider value={value}>{children}</PricingContext.Provider>;
}

export function usePricing() {
  const ctx = useContext(PricingContext);
  if (!ctx) {
    throw new Error('usePricing must be used within a <PricingProvider>');
  }
  return ctx;
}
