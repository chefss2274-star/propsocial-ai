import Link from 'next/link';
import { TestTube, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Stub checkout · PropSocial AI'
};

export default function MockCheckoutPage({ searchParams }) {
  const tier = searchParams?.tier ?? 'unknown';
  const priceId = searchParams?.priceId ?? '—';

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.10),transparent_55%)]"
      />
      <div className="relative max-w-lg rounded-2xl border border-amber-500/30 bg-slate-900/60 p-8 text-center shadow-2xl">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/15 ring-1 ring-amber-500/30">
          <TestTube className="h-5 w-5 text-amber-300" />
        </div>
        <h1 className="mt-5 text-xl font-semibold tracking-tight">Stub checkout</h1>
        <p className="mt-2 text-sm text-slate-400">
          You landed here because the server returned a placeholder URL — this is
          the dev-mode fallback when{' '}
          <code className="rounded bg-slate-800 px-1.5 py-0.5 text-xs">STRIPE_SECRET_KEY</code>{' '}
          is not set. In production this path should never be hit.
        </p>
        <dl className="mt-6 grid grid-cols-2 gap-2 text-left text-xs">
          <dt className="text-slate-500">Tier</dt>
          <dd className="font-mono text-slate-200">{tier}</dd>
          <dt className="text-slate-500">Price ID</dt>
          <dd className="truncate font-mono text-slate-200">{priceId}</dd>
        </dl>
        <Link
          href="/"
          className="mt-7 inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>
      </div>
    </main>
  );
}
