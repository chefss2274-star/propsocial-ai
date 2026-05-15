'use client';

import { useState } from 'react';
import { Copy, Check, RefreshCw, Briefcase, Zap, Users } from 'lucide-react';

const iconMap = { Briefcase, Zap, Users };

const accentMap = {
  sky: {
    border: 'border-sky-500/30',
    ring: 'hover:ring-sky-500/20',
    dot: 'bg-sky-400',
    text: 'text-sky-300',
    bg: 'bg-sky-500/10',
    glow: 'from-sky-500/10'
  },
  fuchsia: {
    border: 'border-fuchsia-500/30',
    ring: 'hover:ring-fuchsia-500/20',
    dot: 'bg-fuchsia-400',
    text: 'text-fuchsia-300',
    bg: 'bg-fuchsia-500/10',
    glow: 'from-fuchsia-500/10'
  },
  emerald: {
    border: 'border-emerald-500/30',
    ring: 'hover:ring-emerald-500/20',
    dot: 'bg-emerald-400',
    text: 'text-emerald-300',
    bg: 'bg-emerald-500/10',
    glow: 'from-emerald-500/10'
  }
};

export default function ResultCard({ variation, streaming, delay = 0 }) {
  const [copied, setCopied] = useState(false);
  const Icon = iconMap[variation.icon];
  const a = accentMap[variation.accent];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(variation.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API blocked (insecure context); no-op.
    }
  };

  return (
    <div
      className={`group relative flex flex-col overflow-hidden rounded-2xl border ${a.border} bg-slate-900/40 backdrop-blur transition hover:bg-slate-900/60 hover:ring-1 ${a.ring}`}
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b ${a.glow} to-transparent opacity-60`}
      />

      <div className="relative flex items-center justify-between border-b border-slate-800 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${a.bg}`}>
            {Icon && <Icon className={`h-4 w-4 ${a.text}`} />}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-100">{variation.title}</h3>
            <p className="text-[11px] text-slate-500">{variation.platform}</p>
          </div>
        </div>
        <span className={`flex items-center gap-1.5 text-[10px] uppercase tracking-wider ${a.text}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${a.dot} ${streaming ? 'animate-pulse' : ''}`} />
          {streaming ? 'Drafting' : 'Ready'}
        </span>
      </div>

      <div className="relative flex-1 px-5 py-4">
        {streaming ? (
          <StreamingSkeleton delay={delay} />
        ) : (
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-300">
            {variation.content}
          </pre>
        )}
      </div>

      <div className="relative flex items-center justify-between border-t border-slate-800 bg-slate-950/40 px-5 py-3">
        <span className="text-[11px] tabular-nums text-slate-500">
          {streaming ? '—' : `${variation.content.length} chars`}
        </span>
        <div className="flex items-center gap-2">
          <button
            disabled={streaming}
            className="rounded-md p-1.5 text-slate-400 transition hover:bg-slate-800 hover:text-slate-200 disabled:opacity-40"
            title="Regenerate this variation"
            aria-label="Regenerate"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={handleCopy}
            disabled={streaming}
            className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition disabled:opacity-40 ${
              copied
                ? 'bg-emerald-500/15 text-emerald-300'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" /> Copied
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" /> Copy
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function StreamingSkeleton({ delay = 0 }) {
  const widths = [100, 92, 78, 95, 60, 88, 72];
  return (
    <div className="space-y-2.5">
      {widths.map((w, i) => (
        <div
          key={i}
          className="h-3 animate-pulse rounded bg-slate-800/80"
          style={{ width: `${w}%`, animationDelay: `${i * 120 + delay}ms` }}
        />
      ))}
    </div>
  );
}
