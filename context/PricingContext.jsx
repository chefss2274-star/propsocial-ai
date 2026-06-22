'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getBrowserSupabase } from '../lib/supabase/client';

const PricingContext = createContext(null);
const ACTIVE_STATUSES = new Set(['trialing', 'active']);
const IS_DEV = process.env.NODE_ENV !== 'production';

export function PricingProvider({ children }) {
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [user, setUser] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(null);
  // Local-only override exposed by the dev bypass buttons in PricingModal.
  // In production builds this stays null forever — the buttons render gated.
  const [devTier, setDevTier] = useState(null);

  useEffect(() => {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      setAuthLoading(false);
      return;
    }

    const supabase = getBrowserSupabase();
    let mounted = true;

    const hydrate = async () => {
      const {
        data: { user: u }
      } = await supabase.auth.getUser();
      if (!mounted) return;
      setUser(u ?? null);

      if (u) {
        const { data } = await supabase
          .from('subscriptions')
          .select('tier, status, current_period_end, trial_end')
          .eq('user_id', u.id)
          .maybeSingle();
        if (mounted) setSubscription(data ?? null);
      } else {
        setSubscription(null);
      }
      if (mounted) setAuthLoading(false);
    };

    hydrate();

    const {
      data: { subscription: authSub }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) {
        setUser(null);
        setSubscription(null);
        setAuthLoading(false);
      } else {
        hydrate();
      }
    });

    return () => {
      mounted = false;
      authSub?.unsubscribe();
    };
  }, []);

  const realTier = useMemo(() => {
    if (!subscription) return null;
    if (!ACTIVE_STATUSES.has(subscription.status)) return null;
    return subscription.tier;
  }, [subscription]);

  // Dev override wins in non-production builds; in prod realTier is always
  // the source of truth.
  const tier = IS_DEV ? devTier ?? realTier : realTier;

  const value = useMemo(
    () => ({
      user,
      subscription,
      authLoading,
      isAuthenticated: !!user,
      isSubscribed: tier !== null,
      isPro: tier === 'pro',
      tier,
      devTier,
      setDevTier,
      isDev: IS_DEV,
      showPricingModal,
      setShowPricingModal,
      checkoutLoading,
      setCheckoutLoading
    }),
    [user, subscription, authLoading, tier, devTier, showPricingModal, checkoutLoading]
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
