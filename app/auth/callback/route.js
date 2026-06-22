import { NextResponse } from 'next/server';
import { getServerSupabase } from '../../../lib/supabase/server';

// Supabase calls this back with `?code=...` after the user clicks the magic
// link in their email. We exchange the code for a session cookie and bounce
// them to the dashboard (or wherever `next` says).
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = getServerSupabase();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error('[auth/callback] exchange failed', error);
  }

  return NextResponse.redirect(`${origin}/signin?error=callback_failed`);
}
