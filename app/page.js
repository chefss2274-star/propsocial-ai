'use client';

import { useState } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import InputTabs from '../components/InputTabs';
import OptionsPanel from '../components/OptionsPanel';
import GenerateButton from '../components/GenerateButton';
import ResultsGrid from '../components/ResultsGrid';
import PricingModal from '../components/PricingModal';
import { usePricing } from '../context/PricingContext';

export default function HomePage() {
  const [textInput, setTextInput] = useState('');
  const [propertyType, setPropertyType] = useState('Single Family');
  const [city, setCity] = useState('Austin, TX');
  const [tone, setTone] = useState('Balanced');
  const [streaming, setStreaming] = useState(false);
  const [hasResults, setHasResults] = useState(false);
  const { isSubscribed, setShowPricingModal } = usePricing();

  const handleGenerate = () => {
    // Paywall gate: unauthenticated / unsubscribed users see the pricing modal
    // instead of triggering a generation. Once they pick a plan (or use the
    // Demo Mode bypass), `isSubscribed` flips to true and this passes through.
    if (!isSubscribed) {
      setShowPricingModal(true);
      return;
    }

    setStreaming(true);
    setHasResults(false);
    // Simulated streaming delay so the loading state is visible before the
    // mock variations populate. Replace with a real fetch() to your API route.
    setTimeout(() => {
      setStreaming(false);
      setHasResults(true);
    }, 1800);
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
              New — Multi-platform variant generation
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
          </div>

          <div className="mt-10">
            <ResultsGrid streaming={streaming} hasResults={hasResults} />
          </div>
        </main>
      </div>

      <PricingModal />
    </div>
  );
}
