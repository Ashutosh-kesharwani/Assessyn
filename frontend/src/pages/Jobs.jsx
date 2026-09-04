import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, AlertTriangle, Briefcase, Sparkles, Globe, ShieldCheck } from 'lucide-react';
import SearchBar from '../components/jobs/SearchBar';
import FiltersPanel from '../components/jobs/FiltersPanel';
import JobsList from '../components/jobs/JobsList';
import JobDetailsDrawer from '../components/jobs/JobDetailsDrawer';
import { useJobs } from '../hooks/useJobs';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { DojoIcon, KatanaIcon, ShurikenIcon, ScrollIcon } from '@/components/ui/ShinobiIcons';

export default function JobsPage() {
  const [selectedJob, setSelectedJob] = useState(null);

  const [searchParams, setSearchParams] = useState({
    q: '',
    where: '',
    page: 1,
    experience: '',
    salaryMin: 0,
    jobType: '',
  });

  const { data, isLoading, isError, error, isPlaceholderData } = useJobs(searchParams);

  const jobs = data?.data || [];
  const totalPages = data?.meta?.totalPages || 1;
  const isFallback = data?._cache?.fallback || false;

  const handleSearch = (newSearch) => {
    setSearchParams((prev) => ({ ...prev, ...newSearch, page: 1 }));
  };

  const handleFilterApply = (newFilters) => {
    setSearchParams((prev) => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page) => {
    setSearchParams((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <main className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* ── 1. Tactical Command Header ──────────────────────────── */}
      <header className="p-6 sm:p-8 lg:p-10 rounded-3xl bg-surface/90 backdrop-blur-2xl border border-subtle flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden shadow-2xl">
        {/* Top Katana Edge Sheen */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-400/50 to-transparent pointer-events-none" />

        <div className="space-y-2.5 max-w-2xl relative z-10">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-brand-500/15 border border-brand-500/30 text-brand-300 text-xs font-mono font-bold uppercase tracking-wider">
              <Briefcase className="w-4 h-4 text-brand-400" />
              <span>MARKETPLACE INTELLIGENCE // ADZUNA SYNC</span>
            </span>
            <span className="text-xs font-mono text-secondary px-2.5 py-1 rounded-xl bg-surface border border-subtle font-semibold">
              Live Verified Feed
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight leading-tight">
            Live Engineering Job Board
          </h1>

          <p className="text-secondary text-xs sm:text-sm leading-relaxed max-w-xl font-medium">
            Discover verified engineering opportunities worldwide with real-time keyword compatibility matching.
          </p>
        </div>

        <div className="flex-shrink-0 relative z-10">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-surface border border-subtle text-xs font-mono text-secondary">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white font-bold">{data?.meta?.totalJobs || jobs.length || 0}</span>
            <span>Active Roles</span>
          </span>
        </div>
      </header>

      {/* ── 2. Search Bar Component ───────────────────────────── */}
      <section aria-label="Job Search Bar">
        <SearchBar
          onSearch={handleSearch}
          initialQuery={searchParams.q}
          initialLocation={searchParams.where}
          isFetching={isLoading || isPlaceholderData}
        />
      </section>

      {/* ── Fallback Warning ──────────────────────────────────── */}
      {isFallback && !isError && (
        <aside className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-amber-400" />
          <div className="text-xs font-mono">
            <h4 className="font-bold text-white uppercase">Live Search Cached</h4>
            <p className="mt-0.5 text-amber-200">Serving cached opportunities for high-speed offline simulation.</p>
          </div>
        </aside>
      )}

      {/* ── 3. Main Filter & List Layout ──────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Filters Sidebar */}
        <div className="w-full lg:w-72 flex-shrink-0">
          <FiltersPanel
            filters={{
              experience: searchParams.experience,
              salaryMin: searchParams.salaryMin,
              jobType: searchParams.jobType,
            }}
            onApply={handleFilterApply}
          />
        </div>

        {/* Jobs List Section */}
        <section aria-label="Job Results" className="w-full flex-1">
          {isError ? (
            <div className="p-8 text-center rounded-3xl bg-rose-500/10 border border-rose-500/30 space-y-3">
              <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
              <p className="font-bold text-white text-sm font-mono">{error?.response?.data?.message || 'Failed to fetch live jobs feed. Please try again.'}</p>
            </div>
          ) : (
            <JobsList
              jobs={jobs}
              loading={isLoading || isPlaceholderData}
              page={searchParams.page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              onSelectJob={setSelectedJob}
              searchQuery={searchParams.q}
            />
          )}
        </section>
      </div>

      {/* Job Details Drawer overlay */}
      {selectedJob && (
        <JobDetailsDrawer
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      )}
    </main>
  );
}
