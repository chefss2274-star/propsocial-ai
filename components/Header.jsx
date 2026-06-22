'use client';

import { Sparkles, Bell, Search, LogIn, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePricing } from '../context/PricingContext';

export default function Header() {
  const { user, isAuthenticated, authLoading, tier } = usePricing();

  const initials = user?.email
    ? user.email
        .split('@')[0]
        .split(/[._-]/)
        .slice(0, 2)
        .map((s) => s[0]?.toUpperCase() ?? '')
        .join('') || user.email[0].toUpperCase()
    : 'AR';

  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/20">
            <Sparkles className="h-5 w-5 text-slate-950" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-semibold tracking-tight text-slate-100">
              PropSocial <span className="text-emerald-400">AI</span>
            </h1>
            <p className="hidden sm:block text-[11px] text-slate-500">Social copy for real estate</p>
          </div>
        </div>

        <div className="relative hidden md:flex flex-1 max-w-md mx-8">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search listings, posts, drafts…"
            className="w-full rounded-lg border border-slate-800 bg-slate-900/60 py-2 pl-9 pr-4 text-sm text-slate-200 placeholder:text-slate-500 focus:border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
          />
        </div>

        <div className="flex items-center gap-3">
          {!authLoading && isAuthenticated && (
            <button className="relative rounded-md p-2 text-slate-400 transition hover:bg-slate-900/60 hover:text-slate-100">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-emerald-400" />
            </button>
          )}

          {authLoading ? (
            <div className="h-8 w-24 animate-pulse rounded-md bg-slate-900/60" />
          ) : isAuthenticated ? (
            <div className="flex items-center gap-2.5 border-l border-slate-800 pl-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-700 text-xs font-bold text-slate-950">
                {initials}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-medium leading-tight text-slate-200">
                  {user.email}
                </p>
                <p className="text-[10px] text-slate-500">
                  {tier === 'pro' ? 'Pro plan' : tier === 'starter' ? 'Starter plan' : 'No subscription'}
                </p>
              </div>
              <form action="/auth/signout" method="post">
                <button
                  type="submit"
                  title="Sign out"
                  aria-label="Sign out"
                  className="rounded-md p-1.5 text-slate-500 transition hover:bg-slate-900/60 hover:text-slate-200"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/signin"
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:border-slate-600 hover:bg-slate-800"
            >
              <LogIn className="h-3.5 w-3.5" />
              Sign in
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
