import Link from 'next/link';
import { XCircle, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Checkout canceled · PropSocial AI'
};

export default function CanceledPage() {
  return (
    <main className="relative flex min-h-screen items-center justify-center bg-slate-950 px-4 text-slate-100">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.06),transparent_55%)]"
      />
      <div className="relative max-w-lg rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center shadow-2xl">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 ring-1 ring-slate-700">
          <XCircle className="h-5 w-5 text-slate-400" />
        </div>
        <h1 className="mt-5 text-xl font-semibold tracking-tight">Checkout canceled</h1>
        <p className="mt-2 text-sm text-slate-400">
          No worries — nothing was charged. Pick a plan whenever you&apos;re ready.
        </p>
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
