'use client';

import { useState } from 'react';
import { UploadCloud, Link2, Film, FileVideo } from 'lucide-react';

export default function InputTabs({ textInput, setTextInput }) {
  const [activeTab, setActiveTab] = useState('video');
  const [fileName, setFileName] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) setFileName(file.name);
  };

  const handlePick = (e) => {
    const file = e.target.files?.[0];
    if (file) setFileName(file.name);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/40">
      <div className="flex border-b border-slate-800">
        <TabButton
          icon={Film}
          label="Video Upload"
          active={activeTab === 'video'}
          onClick={() => setActiveTab('video')}
        />
        <TabButton
          icon={Link2}
          label="Paste Link / Details"
          active={activeTab === 'text'}
          onClick={() => setActiveTab('text')}
        />
      </div>

      <div className="p-5 sm:p-6">
        {activeTab === 'video' ? (
          <label
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition ${
              dragOver
                ? 'border-emerald-400 bg-emerald-500/5'
                : 'border-slate-700 bg-slate-950/40 hover:border-slate-600 hover:bg-slate-950/60'
            }`}
          >
            <input
              type="file"
              accept="video/*"
              onChange={handlePick}
              className="sr-only"
            />
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20">
              {fileName ? (
                <FileVideo className="h-7 w-7 text-emerald-400" />
              ) : (
                <UploadCloud className="h-7 w-7 text-emerald-400" />
              )}
            </div>
            {fileName ? (
              <>
                <p className="text-sm font-medium text-slate-200">{fileName}</p>
                <p className="mt-1 text-xs text-slate-500">
                  Ready to analyze — drop another file to replace
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-slate-200">
                  Drag &amp; drop your property video
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  MP4, MOV, or WebM · up to 500MB
                </p>
                <span className="mt-4 rounded-lg border border-emerald-500/30 px-4 py-2 text-xs font-medium text-emerald-300 transition hover:bg-emerald-500/10">
                  Browse files
                </span>
              </>
            )}
          </label>
        ) : (
          <div>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Paste a Zillow/Redfin link, or describe the property: bedrooms, bathrooms, square footage, neighborhood, standout features…"
              rows={8}
              className="w-full resize-none rounded-xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-sm leading-relaxed text-slate-200 placeholder:text-slate-500 focus:border-emerald-500/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
            />
            <div className="mt-2 flex justify-between text-xs text-slate-500">
              <span className="tabular-nums">{textInput.length} characters</span>
              <span className="hidden sm:inline">
                Tip: include MLS#, lot size, and recent upgrades for sharper copy
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-1 items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition ${
        active
          ? 'bg-slate-900/60 text-emerald-300'
          : 'text-slate-500 hover:text-slate-300'
      }`}
    >
      <Icon className="h-4 w-4" />
      {label}
      {active && (
        <span className="absolute inset-x-6 -bottom-px h-0.5 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500" />
      )}
    </button>
  );
}
