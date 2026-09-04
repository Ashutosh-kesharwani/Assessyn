import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, MapPin, Banknote, Building2, Calendar, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { jobsAPI } from '../../services/api';
import Button from '@/components/ui/Button';

export default function JobDetailsDrawer({ job, onClose }) {
  useEffect(() => {
    if (job) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [job]);

  const { data: detailData, isLoading } = useQuery({
    queryKey: ['job', job?.id],
    queryFn: async () => {
      if (!job?.id) return null;
      const res = await jobsAPI.getById(job.id);
      return res.data?.data;
    },
    enabled: !!job?.id,
    staleTime: 10 * 60 * 1000,
  });

  if (!job) return null;

  const displayJob = { ...job, ...detailData };
  const applicationLink = displayJob.apply_url || displayJob.url;
  const postedDate = displayJob.posted_at ? new Date(displayJob.posted_at).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric'
  }) : 'Recently';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
          aria-hidden="true"
        />

        {/* Drawer Panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 260 }}
          className="relative w-full max-w-2xl bg-surface/95 backdrop-blur-2xl shadow-2xl flex flex-col border-l border-subtle h-full z-10"
        >
          {/* Top Sheen */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-400/50 to-transparent pointer-events-none" />

          {/* Header */}
          <div className="flex-shrink-0 p-6 sm:p-8 border-b border-subtle flex justify-between items-start bg-surface relative">
            <div className="pr-10 space-y-1.5">
              <span className="text-[10px] font-mono font-extrabold text-brand-400 uppercase tracking-widest block">
                // POSITION DOSSIER
              </span>
              <h2 className="text-xl sm:text-2xl font-display font-black text-white leading-tight">
                {displayJob.title}
              </h2>
              <div className="flex items-center gap-2 text-sm font-semibold text-secondary">
                <Building2 className="w-4 h-4 text-brand-400" />
                <span>{displayJob.company}</span>
              </div>
            </div>
            
            <button 
              onClick={onClose}
              className="p-2.5 rounded-xl bg-surface border border-subtle text-secondary hover:text-white hover:border-slate-600 transition-colors cursor-pointer"
              aria-label="Close drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
            {/* Quick Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {displayJob.location && (
                <div className="bg-surface p-4 rounded-2xl border border-subtle space-y-1">
                  <div className="text-[10px] font-mono font-extrabold text-secondary uppercase flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>Location</span>
                  </div>
                  <div className="font-bold text-white text-xs sm:text-sm truncate">{displayJob.location}</div>
                </div>
              )}
              {displayJob.salary && (
                <div className="bg-emerald-500/10 border border-emerald-500/25 p-4 rounded-2xl space-y-1">
                  <div className="text-[10px] font-mono font-extrabold text-emerald-400 uppercase flex items-center gap-1.5">
                    <Banknote className="w-3.5 h-3.5" />
                    <span>Salary</span>
                  </div>
                  <div className="font-black text-emerald-300 text-xs sm:text-sm truncate">{displayJob.salary}</div>
                </div>
              )}
              <div className="bg-surface p-4 rounded-2xl border border-subtle space-y-1">
                <div className="text-[10px] font-mono font-extrabold text-secondary uppercase flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500" />
                  <span>Posted</span>
                </div>
                <div className="font-bold text-white text-xs sm:text-sm">{postedDate}</div>
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-3">
              <h3 className="text-sm font-mono font-extrabold text-white uppercase tracking-wider pb-2 border-b border-subtle">
                Role Description & Specifications
              </h3>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12 text-secondary space-y-3">
                  <Loader2 className="w-6 h-6 animate-spin text-brand-400" />
                  <p className="text-xs font-mono">Fetching complete job specifications...</p>
                </div>
              ) : (
                <div className="text-secondary text-xs sm:text-sm leading-relaxed whitespace-pre-line font-medium">
                  {displayJob.description || displayJob.summary || 'No detailed description provided.'}
                </div>
              )}
            </div>
          </div>

          {/* Footer Action */}
          <div className="p-6 border-t border-subtle bg-surface flex items-center justify-between gap-4">
            <Button variant="secondary" size="md" onClick={onClose} className="font-bold text-xs">
              <span>Close Dossier</span>
            </Button>
            
            {applicationLink && (
              <a
                href={applicationLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button variant="primary" size="md" icon={ExternalLink} className="w-full font-bold text-xs">
                  <span>Apply on Adzuna Partner</span>
                </Button>
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
