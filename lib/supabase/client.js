import { createBrowserClient } from '@supabase/ssr';

// Browser-side singleton so we don't create a new client on every render.
let cached;

export function getBrowserSupabase() {
  if (cached) return cached;
  cached = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  return cached;
}
