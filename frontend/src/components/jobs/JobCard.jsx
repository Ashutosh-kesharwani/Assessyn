import React from 'react';
import { MapPin, Banknote, Building2, ExternalLink, ArrowUpRight } from 'lucide-react';
import Button from '@/components/ui/Button';
import { KatanaIcon } from '@/components/ui/ShinobiIcons';

// Highlight matched keywords
const HighlightText = ({ text, query }) => {
  if (!query || typeof text !== 'string') return <>{text}</>;
  
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return (
    <>
      {parts.map((part, i) => 
        part.toLowerCase() === query.toLowerCase() 
          ? <span key={i} className="bg-brand-500/30 text-brand-200 px-1 py-0.5 rounded font-bold">{part}</span> 
          : part
      )}
    </>
  );
};

export default function JobCard({ job, onClick, searchQuery = '' }) {
  const { title, company, location, salary, summary, apply_url, url } = job;
  const applicationLink = apply_url || url;

  return (
    <article 
      onClick={onClick}
      className="p-6 rounded-3xl bg-surface/90 backdrop-blur-2xl border border-subtle hover:border-brand-500/50 hover:bg-surface transition-all duration-300 flex flex-col justify-between group shadow-lg relative overflow-hidden cursor-pointer"
    >
      {/* Top Katana Edge Sheen */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-400/30 to-transparent pointer-events-none" />

      <div className="space-y-4">
        {/* Header: Title & Company */}
        <div className="space-y-1">
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-lg sm:text-xl font-display font-black text-white group-hover:text-brand-300 transition-colors line-clamp-1 leading-snug">
              <HighlightText text={title} query={searchQuery} />
            </h3>
            <div className="p-2 rounded-xl bg-surface border border-subtle text-secondary group-hover:text-white group-hover:border-brand-500/40 transition-colors flex-shrink-0">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>

          <p className="flex items-center gap-1.5 text-secondary text-xs sm:text-sm font-semibold">
            <Building2 className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
            <HighlightText text={company} query={searchQuery} />
          </p>
        </div>

        {/* Metadata Chips: Location & Salary */}
        <div className="flex flex-wrap gap-2 text-xs font-mono">
          {location && (
            <span className="flex items-center gap-1.5 bg-surface text-secondary px-3 py-1 rounded-xl border border-subtle text-[11px] font-semibold">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              <span className="truncate max-w-[160px]"><HighlightText text={location} query={searchQuery} /></span>
            </span>
          )}
          {salary && (
            <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-3 py-1 rounded-xl text-[11px] font-bold">
              <Banknote className="w-3.5 h-3.5" />
              <span>{salary}</span>
            </span>
          )}
        </div>

        {/* Description */}
        <p className="text-secondary text-xs sm:text-sm line-clamp-2 leading-relaxed font-medium">
          <HighlightText text={summary || 'No description provided in market feed.'} query={searchQuery} />
        </p>
      </div>

      {/* Action Strip */}
      <div className="pt-5 mt-5 border-t border-subtle" onClick={(e) => e.stopPropagation()}>
        <a
          href={applicationLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-surface border border-subtle hover:border-brand-500/50 hover:bg-brand-500/15 text-white font-bold text-xs transition-all duration-200"
        >
          <span>Apply to Organization</span>
          <ExternalLink className="w-3.5 h-3.5 text-brand-400" />
        </a>
      </div>
    </article>
  );
}
