'use client';

import { Sparkles, Loader2 } from 'lucide-react';

export default function GenerateButton({ onClick, loading }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="group relative inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 px-8 py-3.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:from-emerald-400 hover:to-emerald-300 hover:shadow-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-80 sm:w-auto"
    >
      <span
        aria-hidden
        className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-400 opacity-0 blur-lg transition group-hover:opacity-40"
      />
      <span className="relative flex items-center gap-2">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Streaming variations…
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Generate Social Posts
            <kbd className="ml-1 rounded bg-slate-950/20 px-1.5 py-0.5 text-[10px] tracking-wide">
              ⌘↵
            </kbd>
          </>
        )}
      </span>
    </button>
  );
}
