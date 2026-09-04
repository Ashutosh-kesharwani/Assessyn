import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, Check, RefreshCw } from 'lucide-react';
import Button from '@/components/ui/Button';

export default function FiltersPanel({ filters, onApply }) {
  const [draftFilters, setDraftFilters] = useState(filters || {
    experience: '',
    salaryMin: 0,
    jobType: '',
  });

  useEffect(() => {
    if (filters) {
      setDraftFilters(filters);
    }
  }, [filters]);

  const handleChange = (key, value) => {
    setDraftFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = () => {
    if (onApply) {
      onApply(draftFilters);
    }
  };

  const handleReset = () => {
    const reset = { experience: '', salaryMin: 0, jobType: '' };
    setDraftFilters(reset);
    if (onApply) onApply(reset);
  };

  return (
    <aside className="p-6 rounded-3xl bg-surface/90 backdrop-blur-2xl border border-subtle space-y-6 shadow-xl sticky top-6">
      <div className="flex items-center justify-between pb-4 border-b border-subtle">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-brand-500/15 text-brand-400 border border-brand-500/30">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <h2 className="font-display font-black text-white text-base">Market Filters</h2>
        </div>
        <button
          type="button"
          onClick={handleReset}
          className="text-[11px] font-mono font-bold text-secondary hover:text-white transition-colors cursor-pointer"
        >
          Reset
        </button>
      </div>

      <div className="space-y-5">
        {/* Experience Level */}
        <div>
          <label className="block text-xs font-mono font-extrabold uppercase tracking-wider text-secondary mb-2">
            Experience Level
          </label>
          <select
            value={draftFilters.experience}
            onChange={(e) => handleChange('experience', e.target.value)}
            className="w-full p-3 rounded-xl bg-surface border border-subtle text-white text-xs font-medium focus:outline-none focus:border-brand-500/60 transition-all cursor-pointer font-mono"
          >
            <option value="">Any Experience</option>
            <option value="junior">Junior (0–2 yrs)</option>
            <option value="mid">Mid-Level (3–5 yrs)</option>
            <option value="senior">Senior (5+ yrs)</option>
          </select>
        </div>

        {/* Min Salary Range Slider */}
        <div className="p-4 rounded-2xl bg-surface border border-subtle space-y-2.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-mono font-extrabold uppercase tracking-wider text-secondary">
              Min Salary
            </label>
            <span className="text-xs font-mono font-black text-emerald-400">
              {draftFilters.salaryMin > 0 ? `$${parseInt(draftFilters.salaryMin).toLocaleString()}+` : 'Any'}
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="200000"
            step="10000"
            value={draftFilters.salaryMin}
            onChange={(e) => handleChange('salaryMin', e.target.value)}
            className="w-full h-2 rounded-lg accent-[var(--accent-primary)] cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-secondary">
            <span>$0</span>
            <span>$200k+</span>
          </div>
        </div>

        {/* Job Type Options */}
        <div>
          <label className="block text-xs font-mono font-extrabold uppercase tracking-wider text-secondary mb-2.5">
            Employment Mode
          </label>
          <div className="grid grid-cols-1 gap-2">
            {[
              { value: '', label: 'Any Format' },
              { value: 'full_time', label: 'Full-Time Position' },
              { value: 'part_time', label: 'Part-Time' },
              { value: 'contract', label: 'Contract / Freelance' },
            ].map((type) => {
              const isSelected = draftFilters.jobType === type.value;
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleChange('jobType', type.value)}
                  className={`p-3 rounded-xl text-left text-xs font-mono font-bold border transition-all flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-brand-500/15 border-brand-500/40 text-brand-300 shadow-sm'
                      : 'bg-surface border-subtle text-secondary hover:text-white hover:border-slate-700'
                  }`}
                >
                  <span>{type.label}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-brand-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Apply Filters Trigger */}
        <div className="pt-2">
          <Button
            type="button"
            variant="primary"
            size="md"
            onClick={handleApply}
            className="w-full font-bold text-xs"
          >
            <span>Apply Filter Matrix</span>
          </Button>
        </div>
      </div>
    </aside>
  );
}
