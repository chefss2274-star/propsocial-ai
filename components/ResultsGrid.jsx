'use client';

import { Download } from 'lucide-react';
import ResultCard from './ResultCard';
import { mockVariations } from '../lib/mockData';

export default function ResultsGrid({ streaming, hasResults }) {
  if (!streaming && !hasResults) return null;

  return (
    <section>
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-100">Generated variations</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            3 distinct angles, tuned to where your audience lives
          </p>
        </div>
        {hasResults && !streaming && (
          <button className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-400 transition hover:text-emerald-300">
            <Download className="h-3.5 w-3.5" />
            Save all to Library
          </button>
        )}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        {mockVariations.map((v, i) => (
          <ResultCard key={v.id} variation={v} streaming={streaming} delay={i * 200} />
        ))}
      </div>
    </section>
  );
}
