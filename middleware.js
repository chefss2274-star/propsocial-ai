import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

// Refreshes the Supabase auth cookie on every request so Server Components
// see a fresh session. Required by @supabase/ssr — without this, server-side
// `auth.getUser()` calls grow stale.

export async function middleware(request) {
  let response = NextResponse.next({ request });

  // Skip cleanly when Supabase isn't configured yet (e.g. during early local
  // dev before env vars are in place).
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return response;
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        }
      }
    }
  );

  // IMPORTANT: do not skip this getUser() call. It refreshes the auth token.
  await supabase.auth.getUser();
  return response;
}

export const config = {
  matcher: [
    // Apply to everything except static assets and the Stripe webhook (which
    // is signature-verified, doesn't need Supabase, and must not have its
    // raw body touched).
    '/((?!_next/static|_next/image|favicon.ico|api/stripe/webhook|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)'
  ]
};
