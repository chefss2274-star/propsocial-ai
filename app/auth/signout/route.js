import { NextResponse } from 'next/server';
import { getServerSupabase } from '../../../lib/supabase/server';

export async function POST(request) {
  const supabase = getServerSupabase();
  await supabase.auth.signOut();
  // 303 forces a GET on the redirect target — works correctly when the
  // form posts here from any page.
  return NextResponse.redirect(new URL('/', request.url), { status: 303 });
}
