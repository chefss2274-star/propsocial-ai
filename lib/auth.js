import { getServerSupabase } from './supabase/server';

// Statuses that mean the user has access to paid features right now.
// `trialing` is included because we offer a 7-day free trial.
export const ACTIVE_STATUSES = new Set(['trialing', 'active']);

export async function getServerUser() {
  const supabase = getServerSupabase();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  return user ?? null;
}

export async function getServerSubscription(userId) {
  if (!userId) return null;
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from('subscriptions')
    .select('tier, status, current_period_end, trial_end')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) {
    console.error('[auth] failed to load subscription', error);
    return null;
  }
  return data ?? null;
}

// Returns 'starter' | 'pro' | null. null means "no active subscription".
export function activeTier(subscription) {
  if (!subscription) return null;
  if (!ACTIVE_STATUSES.has(subscription.status)) return null;
  return subscription.tier;
}
