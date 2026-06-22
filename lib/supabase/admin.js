import { createClient } from '@supabase/supabase-js';

// Service-role Supabase client. Bypasses RLS. Server-only — never expose this
// or its key to the browser. Used by /api/stripe/webhook to insert and update
// subscription rows on behalf of users.
let cached;

export function getAdminSupabase() {
  if (cached) return cached;
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set');
  }
  cached = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    }
  );
  return cached;
}
