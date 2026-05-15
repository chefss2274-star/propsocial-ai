'use client';

import {
  LayoutDashboard,
  History,
  FileText,
  BookOpen,
  BarChart3,
  Settings
} from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Generator', active: true },
  { icon: History, label: 'History' },
  { icon: FileText, label: 'Templates' },
  { icon: BookOpen, label: 'Brand Voice' },
  { icon: BarChart3, label: 'Analytics' },
  { icon: Settings, label: 'Settings' }
];

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex w-60 shrink-0 flex-col border-r border-slate-800/80 bg-slate-950/40 p-4">
      <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        Workspace
      </p>
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                item.active
                  ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                  : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="font-medium">{item.label}</span>
              {item.active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-400" />
              )}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto rounded-xl border border-slate-800 bg-slate-900/60 p-4">
        <p className="text-xs font-semibold text-slate-200">Monthly usage</p>
        <p className="mt-0.5 text-[11px] text-slate-500">42 of 100 generations</p>
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
          <div className="h-full w-[42%] rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600" />
        </div>
        <button className="mt-3 text-xs font-medium text-emerald-400 transition hover:text-emerald-300">
          Upgrade to Studio →
        </button>
      </div>
    </aside>
  );
}
