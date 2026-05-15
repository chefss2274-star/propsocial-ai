import Link from 'next/link';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'You\'re in · PropSocial AI'
};

export default function SuccessPage({ searchParams }) {
  const sessionId = searchParams?.session_id;

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.12),transparent_55%)]"
      />
      <div className="relative max-w-lg rounded-2xl border border-emerald-500/30 bg-slate-900/60 p-8 text-center shadow-2xl shadow-emerald-500/10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 ring-1 ring-emerald-500/30">
          <CheckCircle2 className="h-7 w-7 text-emerald-300" />
        </div>
        <h1 className="mt-5 text-2xl font-bold tracking-tight">
          You&apos;re in. Trial active.
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Your 7-day free trial has started. We won&apos;t charge your card until
          the trial ends — cancel anytime before then to avoid billing.
        </p>
        {sessionId && (
          <p className="mt-4 break-all rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-[11px] text-slate-500">
            Session: <span className="font-mono text-slate-400">{sessionId}</span>
          </p>
        )}
        <Link
          href="/"
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-emerald-300"
        >
          Start generating posts
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </main>
  );
}
