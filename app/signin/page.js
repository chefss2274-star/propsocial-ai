'use client';

import { useState } from 'react';
import { Sparkles, Mail, Loader2, CheckCircle2 } from 'lucide-react';
import { getBrowserSupabase } from '../../lib/supabase/client';

export default function SignInPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle' | 'sending' | 'sent' | 'error'
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('sending');
    setError(null);

    const supabase = getBrowserSupabase();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      setError(error.message);
      setStatus('error');
    } else {
      setStatus('sent');
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.10),transparent_55%)]"
      />
      <div className="relative w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl">
        <div className="mb-5 flex items-center justify-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/20">
            <Sparkles className="h-5 w-5 text-slate-950" strokeWidth={2.5} />
          </div>
          <h1 className="text-base font-semibold tracking-tight">
            PropSocial <span className="text-emerald-400">AI</span>
          </h1>
        </div>

        {status === 'sent' ? (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/30">
              <CheckCircle2 className="h-6 w-6 text-emerald-300" />
            </div>
            <h2 className="text-lg font-semibold">Check your email</h2>
            <p className="mt-2 text-sm text-slate-400">
              We sent a magic link to <span className="text-slate-200">{email}</span>.
              Click it to sign in.
            </p>
            <button
              type="button"
              onClick={() => {
                setStatus('idle');
                setEmail('');
              }}
              className="mt-5 text-xs text-emerald-400 hover:text-emerald-300"
            >
              Use a different email →
            </button>
          </div>
        ) : (
          <>
            <h2 className="text-center text-xl font-semibold">Sign in</h2>
            <p className="mt-1 text-center text-sm text-slate-400">
              We&apos;ll email you a magic link — no password.
            </p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-3">
              <label className="block">
                <span className="text-xs text-slate-400">Email</span>
                <div className="relative mt-1">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@brokerage.com"
                    disabled={status === 'sending'}
                    className="w-full rounded-lg border border-slate-800 bg-slate-950/60 py-2 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                  />
                </div>
              </label>
              <button
                type="submit"
                disabled={status === 'sending' || !email}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-emerald-300 disabled:opacity-70"
              >
                {status === 'sending' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                  </>
                ) : (
                  'Send magic link'
                )}
              </button>
              {error && (
                <p className="text-center text-xs text-rose-300">{error}</p>
              )}
            </form>
          </>
        )}
      </div>
    </main>
  );
}
