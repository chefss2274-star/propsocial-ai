'use client';

import { Download } from 'lucide-react';
import ResultCard from './ResultCard';
import { VARIATION_TEMPLATES, buildVariations, MOCK_CONTENT } from '../lib/mockData';

export default function ResultsGrid({ variations, streaming, hasResults }) {
  if (!streaming && !hasResults) return null;

  // During streaming we render skeleton placeholders, so the displayed text
  // doesn't matter — but each card still needs its presentation metadata.
  const display = variations ?? buildVariations(streaming ? {} : MOCK_CONTENT);
  // Guarantee three cards in the canonical order even if the API omits a key.
  const ordered = VARIATION_TEMPLATES.map(
    (tpl) => display.find((v) => v.id === tpl.id) ?? { ...tpl, content: '' }
  );

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
        {ordered.map((v, i) => (
          <ResultCard key={v.id} variation={v} streaming={streaming} delay={i * 200} />
        ))}
      </div>
    </section>
  );
}
