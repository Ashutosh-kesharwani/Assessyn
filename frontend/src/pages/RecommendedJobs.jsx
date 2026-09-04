import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Sparkles, MapPin, Banknote, Building2, ExternalLink, 
  Play, FileText, ArrowRight, ShieldCheck, Zap, X
} from 'lucide-react';
import { jobsAPI, resumeAPI } from '@/services/api';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ShinobiLoader from '@/components/ui/ShinobiLoader';
import { ShurikenIcon, KatanaIcon, DojoIcon, ScrollIcon } from '@/components/ui/ShinobiIcons';

export default function RecommendedJobs() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState([]);
  const [hasResume, setHasResume] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [startingInterviewId, setStartingInterviewId] = useState(null);
  const [questionsModal, setQuestionsModal] = useState({ open: false, title: '', company: '', questions: [] });

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    try {
      const { data: resData } = await resumeAPI.getAll();
      const userResumes = resData?.data?.resumes || resData?.resumes || (Array.isArray(resData?.data) ? resData.data : []);
      setResumes(Array.isArray(userResumes) ? userResumes.filter(Boolean) : []);

      if (userResumes.length === 0) {
        setHasResume(false);
        setJobs([]);
        setLoading(false);
        return;
      }
      setHasResume(true);

      const { data } = await jobsAPI.getRecommended();
      const recommendedList =
        data?.data?.results ||
        data?.results ||
        (Array.isArray(data?.data) ? data.data : []);
      setJobs(Array.isArray(recommendedList) ? recommendedList : []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleStartInterview = async (job) => {
    setStartingInterviewId(job.adzunaId || job._id);
    const toastId = toast.loading('Gemini is generating tailored mock questions...');

    try {
      const { data } = await jobsAPI.generateQuestionsDirect({
        jobTitle: job.title,
        jobDescription: job.description,
      });

      toast.success("Questions generated! 🗡️", { id: toastId });
      setQuestionsModal({
        open: true,
        title: job.title,
        company: job.company,
        questions: data?.data?.questions || data?.questions || [],
      });

    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to generate questions', { id: toastId });
    } finally {
      setStartingInterviewId(null);
    }
  };

  if (loading) {
    return (
      <ShinobiLoader
        tag="TALENT INTELLIGENCE // AI SMART MATCH"
        title="Synthesizing AI Smart Matches..."
        subtitle="Evaluating semantic resume vectors against active global engineering positions..."
      />
    );
  }

  return (
    <main className="max-w-7xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* ── 1. Tactical Command Header ──────────────────────────── */}
      <header className="p-6 sm:p-8 lg:p-10 rounded-3xl bg-surface/90 backdrop-blur-2xl border border-subtle flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden shadow-2xl">
        {/* Top Katana Sheen */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-400/50 to-transparent pointer-events-none" />

        <div className="space-y-2.5 max-w-2xl relative z-10">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-brand-500/15 border border-brand-500/30 text-brand-300 text-xs font-mono font-bold uppercase tracking-wider">
              <ShurikenIcon className="w-3.5 h-3.5" />
              <span>DETERMINISTIC TALENT COMPATIBILITY</span>
            </span>
            <span className="text-xs font-mono text-secondary px-2.5 py-1 rounded-xl bg-surface border border-subtle font-semibold">
              AI PRO MATCHED
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight leading-tight">
            AI Smart Matches
          </h1>

          <p className="text-secondary text-xs sm:text-sm leading-relaxed max-w-xl font-medium">
            Live engineering positions scored and ranked according to your parsed resume profile vectors.
          </p>
        </div>

        <div className="flex-shrink-0 relative z-10">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-surface border border-subtle text-xs font-mono text-secondary">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white font-bold">{jobs.length}</span>
            <span>Matched Positions</span>
          </span>
        </div>
      </header>

      {/* ── Empty State: No Resumes Uploaded ───────────────── */}
      {!hasResume && (
        <section className="p-10 sm:p-16 rounded-3xl bg-surface/90 backdrop-blur-2xl border border-dashed border-subtle flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-5 shadow-xl">
          <div className="p-4 bg-brand-500/15 text-brand-400 rounded-2xl border border-brand-500/30 shadow-lg">
            <ScrollIcon className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-display font-black text-white">No Active Resume Profile</h2>
            <p className="text-secondary text-xs sm:text-sm leading-relaxed max-w-sm">
              Smart matching requires your parsed resume skills to compute deterministic compatibility vectors.
            </p>
          </div>
          <Button variant="primary" size="md" icon={ScrollIcon} onClick={() => navigate('/resumes')} className="font-bold text-xs px-6">
            <span>Upload Resume Dossier</span>
          </Button>
        </section>
      )}

      {/* ── State: Resumes Uploaded but 0 Matches >= 60% ─────── */}
      {hasResume && jobs.length === 0 && (
        <section className="p-10 sm:p-16 rounded-3xl bg-surface/90 backdrop-blur-2xl border border-dashed border-subtle flex flex-col items-center justify-center text-center max-w-lg mx-auto space-y-5 shadow-xl">
          <div className="p-4 bg-amber-500/15 text-amber-400 rounded-2xl border border-amber-500/30 shadow-lg">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-xl font-display font-black text-white">No Matches &ge; 60% Found</h2>
            <p className="text-secondary text-xs sm:text-sm leading-relaxed max-w-sm">
              No live opportunities currently exceed the 60% compatibility threshold with your profile. Try scanning the live market board.
            </p>
          </div>
          <Button variant="secondary" size="md" icon={ShurikenIcon} onClick={() => navigate('/jobs')} className="font-bold text-xs px-6">
            <span>Browse Full Job Board</span>
          </Button>
        </section>
      )}

      {/* ── Recommended Jobs Grid ──────────────────────────── */}
      {hasResume && jobs.length > 0 && (
        <section aria-label="Smart Matched Roles" className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {jobs.map((job, idx) => {
            const isHighMatch = job.matchScore >= 80;
            return (
              <motion.article
                key={job.adzunaId || job._id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="p-6 sm:p-7 rounded-3xl bg-surface/90 backdrop-blur-2xl border border-subtle hover:border-brand-500/50 hover:bg-surface transition-all duration-300 flex flex-col justify-between group shadow-lg relative overflow-hidden"
              >
                {/* Top Katana Edge Sheen */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-400/30 to-transparent pointer-events-none" />

                <div className="space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="min-w-0 flex-1 space-y-1">
                      <h3 className="text-lg sm:text-xl font-display font-black text-white truncate group-hover:text-brand-300 transition-colors leading-snug">
                        {job.title}
                      </h3>
                      <p className="flex items-center gap-1.5 text-secondary text-xs sm:text-sm font-semibold">
                        <Building2 className="w-3.5 h-3.5 text-brand-400 flex-shrink-0" />
                        <span>{job.company}</span>
                      </p>
                    </div>

                    <span className={`px-3 py-1 rounded-xl text-xs font-mono font-extrabold border flex-shrink-0 ${
                      isHighMatch
                        ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                        : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                    }`}>
                      {job.matchScore}% MATCH
                    </span>
                  </div>

                  {/* Metadata Chips */}
                  <div className="flex flex-wrap gap-2 text-xs font-mono">
                    {job.location && (
                      <span className="flex items-center gap-1.5 bg-surface text-secondary px-3 py-1 rounded-xl border border-subtle text-[11px] font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" />
                        <span className="truncate max-w-[150px]">{job.location}</span>
                      </span>
                    )}
                    {(job.salaryMin || job.salaryMax) && (
                      <span className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-3 py-1 rounded-xl text-[11px] font-bold">
                        <Banknote className="w-3.5 h-3.5" />
                        &pound;{Math.round(job.salaryMin || job.salaryMax).toLocaleString()}
                      </span>
                    )}
                  </div>

                  <p className="text-secondary text-xs sm:text-sm line-clamp-3 leading-relaxed font-medium">
                    {job.description || 'No description provided in market feed.'}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-5 border-t border-subtle mt-5">
                  <a
                    href={job.redirectUrl || job.applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button variant="secondary" size="sm" icon={ExternalLink} className="w-full font-bold text-xs">
                      <span>View Role</span>
                    </Button>
                  </a>

                  <Button
                    variant="primary"
                    size="sm"
                    icon={KatanaIcon}
                    onClick={() => handleStartInterview(job)}
                    disabled={startingInterviewId !== null}
                    isLoading={startingInterviewId === (job.adzunaId || job._id)}
                    className="flex-1 font-bold text-xs"
                  >
                    <span>Practice Session</span>
                  </Button>
                </div>
              </motion.article>
            );
          })}
        </section>
      )}

      {/* ── Direct Questions Modal Overlay ─────────────────── */}
      {questionsModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-2xl p-6 sm:p-8 space-y-6 max-h-[85vh] flex flex-col justify-between bg-surface/95 backdrop-blur-2xl rounded-3xl border border-subtle shadow-2xl relative overflow-hidden">
            {/* Top Sheen */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-400/50 to-transparent pointer-events-none" />

            <div>
              <div className="flex items-center justify-between pb-4 border-b border-subtle">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-brand-500/15 rounded-2xl text-brand-400 border border-brand-500/30">
                    <KatanaIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-display font-black text-white">Targeted Assessment Scenarios</h3>
                    <p className="text-xs font-mono text-secondary">{questionsModal.title} &bull; {questionsModal.company}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setQuestionsModal({ open: false, title: '', company: '', questions: [] })}
                  className="p-2 rounded-xl bg-surface border border-subtle text-secondary hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 my-4 overflow-y-auto max-h-[48vh] pr-2">
                {questionsModal.questions.map((question, i) => (
                  <div
                    key={i}
                    className="flex gap-3.5 p-4 bg-surface border border-subtle rounded-2xl"
                  >
                    <div className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-xl bg-brand-500/15 text-brand-300 font-mono font-bold text-xs border border-brand-500/30">
                      0{i + 1}
                    </div>
                    <p className="text-xs sm:text-sm text-white leading-relaxed font-medium">
                      {question}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-subtle flex justify-end">
              <Button
                variant="primary"
                size="md"
                onClick={() => setQuestionsModal({ open: false, title: '', company: '', questions: [] })}
                className="font-bold text-xs px-6"
              >
                <span>Dismiss Intel</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
