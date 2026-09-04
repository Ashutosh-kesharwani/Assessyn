import React, { memo } from 'react';
import JobCard from './JobCard';
import Pagination from './Pagination';
import { Briefcase, SearchX } from 'lucide-react';
import { DojoIcon } from '@/components/ui/ShinobiIcons';

// ─── Skeleton Loader Component ─────────────────────────────────────────────
const JobSkeleton = () => (
  <div className="bg-surface/80 border border-subtle rounded-3xl p-6 h-full flex flex-col animate-pulse space-y-4">
    <div className="h-6 bg-surface rounded-xl w-3/4"></div>
    <div className="h-4 bg-surface rounded-lg w-1/3"></div>
    
    <div className="flex gap-2">
      <div className="h-6 bg-surface rounded-lg w-24"></div>
      <div className="h-6 bg-surface rounded-lg w-28"></div>
    </div>
    
    <div className="space-y-2 flex-grow">
      <div className="h-3.5 bg-surface rounded-lg w-full"></div>
      <div className="h-3.5 bg-surface rounded-lg w-5/6"></div>
    </div>
    
    <div className="pt-4 border-t border-subtle">
      <div className="h-10 bg-surface rounded-xl w-full"></div>
    </div>
  </div>
);

// ─── Main JobsList Component (Memoized) ────────────────────────────────────
const JobsList = memo(({ jobs = [], loading = false, page, totalPages, onPageChange, onSelectJob, searchQuery = '' }) => {
  
  // 1. Initial Loading State (Skeleton Loaders)
  if (loading && jobs.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        {[...Array(6)].map((_, i) => (
          <JobSkeleton key={i} />
        ))}
      </div>
    );
  }

  // 2. Empty State (Shinobi Glass Card)
  if (!loading && jobs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 sm:p-20 text-center bg-surface/90 backdrop-blur-2xl rounded-3xl border border-dashed border-subtle shadow-xl space-y-4">
        <div className="p-4 bg-surface border border-subtle rounded-2xl w-16 h-16 flex items-center justify-center text-brand-400 shadow-lg">
          <DojoIcon className="w-8 h-8" />
        </div>
        <div className="space-y-1.5 max-w-md mx-auto">
          <h3 className="text-lg sm:text-xl font-display font-black text-white">No Matching Roles Found</h3>
          <p className="text-secondary text-xs sm:text-sm leading-relaxed">
            No live engineering positions matched your current query or filter matrix. Try broadening your keywords or clearing selected filters.
          </p>
        </div>
      </div>
    );
  }

  // 3. Render Jobs Grid
  return (
    <div className="w-full relative">
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6 mb-8 transition-opacity duration-300 ${loading ? 'opacity-60 grayscale-[0.2]' : 'opacity-100'}`}>
        {jobs.map((job, idx) => (
          <JobCard 
            key={job.id || idx} 
            job={job} 
            onClick={() => onSelectJob && onSelectJob(job)}
            searchQuery={searchQuery}
          />
        ))}
      </div>

      {/* Embedded Pagination */}
      {totalPages > 1 && (
        <Pagination 
          page={page} 
          totalPages={totalPages} 
          onPageChange={onPageChange} 
        />
      )}
    </div>
  );
});

JobsList.displayName = 'JobsList';

export default JobsList;
