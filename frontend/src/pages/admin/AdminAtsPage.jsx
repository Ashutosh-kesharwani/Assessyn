/**
 * pages/admin/AdminAtsPage.jsx
 *
 * Shinobi ATS Engine Command Hub.
 * Manages neural parsing thresholds, keyword extraction sensitivity, and score benchmarks.
 */

import { Target, CheckCircle2, ShieldCheck, Sparkles, FileText, Activity } from 'lucide-react';
import { ScrollIcon, KatanaIcon, DojoIcon } from '@/components/ui/ShinobiIcons';
import Button from '@/components/ui/Button';

export default function AdminAtsPage() {
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-8 font-sans">
      {/* ── Header ───────────────────────────────────────────── */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-brand-500/15 border border-brand-500/30 text-brand-300 text-[10px] font-mono font-black uppercase tracking-wider mb-1">
            <ScrollIcon className="w-3.5 h-3.5 text-brand-400" />
            <span>NEURAL ATS PIPELINE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight">ATS Management Hub</h1>
          <p className="text-secondary text-xs sm:text-sm font-mono mt-0.5">
            Neural resume parsing calibration, skills taxonomy mapping, and matching thresholds
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-subtle text-xs font-mono font-bold text-white shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>ATS Engine v3.4 Active</span>
          </span>
        </div>
      </header>

      {/* ── Metric Cards ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-surface/95 backdrop-blur-2xl border border-subtle shadow-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-secondary text-xs font-mono font-bold uppercase">Parsing Precision</span>
            <Target className="w-4 h-4 text-brand-400" />
          </div>
          <p className="text-3xl font-display font-black text-white">98.4%</p>
          <p className="text-[10px] text-emerald-400 font-mono">Neural extraction confidence</p>
        </div>

        <div className="p-5 rounded-xl bg-surface/95 backdrop-blur-2xl border border-subtle shadow-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-secondary text-xs font-mono font-bold uppercase">Average Parse Time</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-3xl font-display font-black text-white">1.2s</p>
          <p className="text-[10px] text-secondary font-mono">PDF / DOCX streaming latency</p>
        </div>

        <div className="p-5 rounded-xl bg-surface/95 backdrop-blur-2xl border border-subtle shadow-md space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-secondary text-xs font-mono font-bold uppercase">Skills Taxonomy</span>
            <ScrollIcon className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-display font-black text-white">4,850+</p>
          <p className="text-[10px] text-secondary font-mono">Recognized tech competencies</p>
        </div>
      </div>

      {/* ── Calibration Panel ─────────────────────────────────── */}
      <section aria-label="ATS Engine Controls" className="p-6 rounded-xl bg-surface/95 backdrop-blur-2xl border border-subtle shadow-xl space-y-5">
        <header className="border-b border-subtle pb-3">
          <h3 className="text-white font-display font-bold text-base">ATS Calibration & Thresholds</h3>
          <p className="text-secondary text-xs font-mono mt-0.5">
            Configure matching sensitivity for candidate resume recommendations
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 font-mono text-xs">
          <div className="p-4 rounded-lg bg-surface border border-subtle space-y-2">
            <label className="text-white font-bold block uppercase tracking-wider text-[11px]">
              Minimum Match Score Threshold
            </label>
            <p className="text-secondary text-[11px]">Candidates scoring above this threshold receive automated interview invitations.</p>
            <div className="flex items-center gap-3 pt-2">
              <input type="range" min="50" max="95" defaultValue="75" className="flex-1 accent-[var(--accent-primary)] cursor-pointer" />
              <span className="px-2.5 py-1 rounded bg-surface border border-subtle text-white font-bold">75%</span>
            </div>
          </div>

          <div className="p-4 rounded-lg bg-surface border border-subtle space-y-2">
            <label className="text-white font-bold block uppercase tracking-wider text-[11px]">
              Semantic Keyword Weighting
            </label>
            <p className="text-secondary text-[11px]">Adjust AI embedding weight relative to exact keyword matching.</p>
            <div className="flex items-center gap-3 pt-2">
              <input type="range" min="10" max="90" defaultValue="60" className="flex-1 accent-[var(--accent-primary)] cursor-pointer" />
              <span className="px-2.5 py-1 rounded bg-surface border border-subtle text-white font-bold">60%</span>
            </div>
          </div>
        </div>

        <footer className="pt-2 flex justify-end">
          <Button variant="primary" size="md" icon={KatanaIcon} className="py-2 px-5 text-xs font-mono uppercase tracking-wider">
            <span>Save ATS Parameters</span>
          </Button>
        </footer>
      </section>
    </div>
  );
}
