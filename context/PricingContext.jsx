'use client';

import { createContext, useContext, useState } from 'react';

const PricingContext = createContext(null);

export function PricingProvider({ children }) {
  const [showPricingModal, setShowPricingModal] = useState(false);
  // Replace `isSubscribed` with a real auth/subscription check (NextAuth session,
  // Stripe customer lookup, etc.) once auth is wired up. Defaulting to false so
  // every Generate click triggers the paywall during local development.
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(null); // 'starter' | 'pro' | null

  const value = {
    showPricingModal,
    setShowPricingModal,
    isSubscribed,
    setIsSubscribed,
    checkoutLoading,
    setCheckoutLoading
  };

  return <PricingContext.Provider value={value}>{children}</PricingContext.Provider>;
}

export function usePricing() {
  const ctx = useContext(PricingContext);
  if (!ctx) {
    throw new Error('usePricing must be used within a <PricingProvider>');
  }
  return ctx;
}
