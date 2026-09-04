import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, onPageChange }) {
  if (!totalPages || totalPages <= 1) return null;

  return (
    <nav 
      aria-label="Job search pagination" 
      className="flex items-center justify-center gap-3 mt-8 mb-12"
    >
      {/* Previous Button */}
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
        aria-label="Go to previous page"
        aria-disabled={page === 1}
        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-subtle bg-surface text-secondary hover:text-white hover:border-brand-500/40 disabled:opacity-40 disabled:hover:border-subtle disabled:cursor-not-allowed font-mono text-xs font-bold transition-all cursor-pointer shadow-sm"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Previous</span>
      </button>

      {/* Current Page Indicator */}
      <div 
        className="text-white font-mono text-xs font-bold px-4 py-2 rounded-xl bg-surface border border-subtle min-w-[120px] text-center" 
        aria-live="polite"
      >
        Page {page} of {totalPages}
      </div>

      {/* Next Button */}
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
        aria-label="Go to next page"
        aria-disabled={page === totalPages}
        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-subtle bg-surface text-secondary hover:text-white hover:border-brand-500/40 disabled:opacity-40 disabled:hover:border-subtle disabled:cursor-not-allowed font-mono text-xs font-bold transition-all cursor-pointer shadow-sm"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
}
