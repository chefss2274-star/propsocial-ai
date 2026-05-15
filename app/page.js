'use client';

import { useState } from 'react';
import { AlertCircle } from 'lucide-react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import InputTabs from '../components/InputTabs';
import OptionsPanel from '../components/OptionsPanel';
import GenerateButton from '../components/GenerateButton';
import ResultsGrid from '../components/ResultsGrid';
import PricingModal from '../components/PricingModal';
import { usePricing } from '../context/PricingContext';
import { buildVariations } from '../lib/mockData';

export default function HomePage() {
  const [textInput, setTextInput] = useState('');
  const [propertyType, setPropertyType] = useState('Single Family');
  const [city, setCity] = useState('Austin, TX');
  const [tone, setTone] = useState('Balanced');
  const [streaming, setStreaming] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const [variations, setVariations] = useState(null);
  const [error, setError] = useState(null);
  const { isSubscribed, tier, setShowPricingModal } = usePricing();

  const handleGenerate = async () => {
    // Paywall gate: unauthenticated / unsubscribed users see the pricing modal
    // instead of triggering a generation. Once they pick a plan (or use a
    // Demo Mode bypass), `isSubscribed` flips to true and this passes through.
    if (!isSubscribed) {
      setShowPricingModal(true);
      return;
    }

    if (!textInput || textInput.trim().length < 5) {
      setError('Add property details or paste a listing link before generating.');
      return;
    }

    setError(null);
    setStreaming(true);
    setHasResults(false);
    setVariations(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyNotes: textInput,
          propertyType,
          city,
          tone,
          tier
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.message || data?.hint || data?.error || 'Generation failed.');
      }

      setVariations(buildVariations(data.variations));
      setHasResults(true);
    } catch (err) {
      console.error('Generate request failed', err);
      setError(err?.message ?? 'Something went wrong. Please try again.');
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(16,185,129,0.10),transparent_55%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent"
      />

      <Header />

      <div className="relative flex">
        <Sidebar />

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-8">
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-300">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              {tier === 'pro'
                ? 'Pro tier · Luxury tone protocol active'
                : tier === 'starter'
                  ? 'Starter tier · Core variations active'
                  : 'New — Multi-platform variant generation'}
            </span>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-100 sm:text-3xl">
              Turn one listing into{' '}
              <span className="bg-gradient-to-r from-emerald-300 to-emerald-500 bg-clip-text text-transparent">
                three scroll-stopping posts.
              </span>
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              Drop in a property video or paste the details — we&apos;ll write the
              Professional, Hype, and Community angles for you in seconds.
            </p>
          </div>

          <div className="space-y-5">
            <InputTabs textInput={textInput} setTextInput={setTextInput} />

            <OptionsPanel
              propertyType={propertyType}
              setPropertyType={setPropertyType}
              city={city}
              setCity={setCity}
              tone={tone}
              setTone={setTone}
            />

            <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                Outputs are drafts. Always review for MLS &amp; fair housing compliance.
              </p>
              <GenerateButton onClick={handleGenerate} loading={streaming} />
            </div>

            {error && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-rose-300" />
                <div className="flex-1">
                  <p className="font-medium text-rose-100">Generation failed</p>
                  <p className="mt-0.5 text-xs text-rose-200/80">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-xs text-rose-300 hover:text-rose-100"
                >
                  Dismiss
                </button>
              </div>
            )}
          </div>

          <div className="mt-10">
            <ResultsGrid
              variations={variations}
              streaming={streaming}
              hasResults={hasResults}
            />
          </div>
        </main>
      </div>

      <PricingModal />
    </div>
  );
}
