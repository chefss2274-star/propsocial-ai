'use client';

import { Home, MapPin, Target, ChevronDown } from 'lucide-react';

const propertyTypes = [
  'Single Family',
  'Condo',
  'Luxury',
  'Townhouse',
  'Multi-Family'
];

const cities = [
  'Austin, TX',
  'Miami, FL',
  'Denver, CO',
  'Seattle, WA',
  'Nashville, TN',
  'Phoenix, AZ',
  'Brooklyn, NY'
];

const tones = ['Balanced', 'Aspirational', 'Data-driven'];

export default function OptionsPanel({
  propertyType,
  setPropertyType,
  city,
  setCity,
  tone,
  setTone
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5">
      <div className="mb-4 flex items-baseline justify-between">
        <h3 className="text-sm font-semibold text-slate-200">Generation options</h3>
        <span className="text-[11px] text-slate-500">Tune each variation</span>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field
          label="Property type"
          icon={Home}
          value={propertyType}
          onChange={setPropertyType}
          options={propertyTypes}
        />
        <Field
          label="Target city"
          icon={MapPin}
          value={city}
          onChange={setCity}
          options={cities}
        />
        <Field
          label="Tone bias"
          icon={Target}
          value={tone}
          onChange={setTone}
          options={tones}
        />
      </div>
    </div>
  );
}

function Field({ label, icon: Icon, value, onChange, options }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-slate-400">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </span>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full cursor-pointer appearance-none rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2.5 pr-9 text-sm text-slate-200 transition hover:border-slate-700 focus:border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
        >
          {options.map((o) => (
            <option key={o} value={o} className="bg-slate-900 text-slate-200">
              {o}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
      </div>
    </label>
  );
}
