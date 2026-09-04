import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Briefcase, Clock, Trash2, Search, Target, Zap,
  ChevronRight, Filter, Sparkles, CheckCircle2, ShieldAlert,
  Layers, ArrowRight
} from 'lucide-react';
import { interviewAPI } from '@/services/api';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { ConfirmDeleteModal, ConfirmModal } from '@/components/shared';
import { DojoIcon, KatanaIcon, ShurikenIcon, ScrollIcon } from '@/components/ui/ShinobiIcons';

const STATUS_MAP = {
  draft: {
    label: 'DRAFT ARENA',
    color: 'bg-slate-500/10 text-slate-400 border-slate-500/25',
    dot: 'bg-slate-400',
  },
  ready: {
    label: 'CALIBRATED',
    color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    dot: 'bg-emerald-400',
  },
  in_progress: {
    label: 'IN PROGRESS',
    color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    dot: 'bg-cyan-400',
  },
  completed: {
    label: 'COMPLETED',
    color: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    dot: 'bg-purple-400',
  },
};

export default function InterviewListPage() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    interviewAPI.getAll()
      .then(({ data }) => {
        const list = data?.data?.interviews || data?.interviews || (Array.isArray(data?.data) ? data.data : []);
        setInterviews(Array.isArray(list) ? list : []);
      })
      .catch(() => toast.error('Failed to load combat missions'))
      .finally(() => setLoading(false));
  }, []);

  const openDeleteModal = (interview) => {
    setSelectedInterview(interview);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedInterview) return;
    setDeleting(true);
    try {
      await interviewAPI.delete(selectedInterview._id);
      setInterviews((prev) => prev.filter((i) => i._id !== selectedInterview._id));
      toast.success('Combat mission retired successfully');
      setModalOpen(false);
      setSelectedInterview(null);
    } catch {
      toast.error('Failed to retire combat mission');
    } finally {
      setDeleting(false);
    }
  };

  const filtered = interviews.filter((i) => {
    const matchesSearch =
      i.jobTitle?.toLowerCase().includes(search.toLowerCase()) ||
      i.company?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || i.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <main className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-16">
      {/* ── 1. Tactical Header Banner ──────────────────────────── */}
      <header className="p-6 sm:p-8 lg:p-10 rounded-3xl bg-surface/90 backdrop-blur-2xl border border-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden shadow-2xl">
        {/* Razor-sharp Katana Top Sheen */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-400/50 to-transparent pointer-events-none" />

        <div className="space-y-2.5 max-w-2xl relative z-10">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-brand-500/15 border border-brand-500/30 text-brand-300 text-xs font-mono font-bold uppercase tracking-wider">
              <KatanaIcon className="w-4 h-4 text-brand-400" />
              <span>COMBAT DOSSIERS // ACTIVE ARENAS</span>
            </span>
            <span className="text-xs font-mono text-secondary px-2.5 py-1 rounded-xl bg-surface border border-subtle font-semibold">
              {interviews.length} Missions Generated
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight leading-tight">
            Combat Simulation Arenas
          </h1>

          <p className="text-secondary text-xs sm:text-sm leading-relaxed max-w-xl font-medium">
            Manage your tailored interview simulation dossiers, configure role-specific tech stacks, and step into the AI arena.
          </p>
        </div>

        <div className="flex-shrink-0 relative z-10 w-full sm:w-auto">
          <Link to="/interviews/new" className="block sm:inline-block w-full sm:w-auto">
            <Button variant="primary" size="lg" icon={KatanaIcon} className="w-full sm:w-auto px-7 font-bold text-sm">
              <span>Launch New Simulation</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* ── 2. Search & Filter Telemetry Bar ───────────────────── */}
      <section aria-label="Mission Filters" className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-surface/80 backdrop-blur-xl border border-subtle shadow-md">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
          <input
            type="text"
            placeholder="Search missions by role title or company..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-subtle text-white placeholder-secondary text-xs sm:text-sm focus:outline-none focus:border-brand-500/60 font-medium transition-all"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Status Filter Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'ALL MISSIONS' },
            { id: 'ready', label: 'CALIBRATED' },
            { id: 'in_progress', label: 'IN PROGRESS' },
            { id: 'completed', label: 'COMPLETED' },
            { id: 'draft', label: 'DRAFTS' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold tracking-wider uppercase transition-all flex-shrink-0 cursor-pointer border ${
                statusFilter === tab.id
                  ? 'bg-brand-500/20 text-brand-300 border-brand-500/40 shadow-sm'
                  : 'bg-surface text-secondary border-subtle hover:text-white hover:border-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </section>

      {/* ── 3. Combat Missions Grid ────────────────────────────── */}
      {loading ? (
        <section aria-label="Loading Missions" className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-6 rounded-3xl bg-surface/70 border border-subtle animate-pulse space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-4 bg-surface rounded-lg w-1/3" />
                <div className="h-4 bg-surface rounded-lg w-1/5" />
              </div>
              <div className="h-6 bg-surface rounded-xl w-3/4" />
              <div className="h-4 bg-surface rounded-lg w-1/2" />
            </div>
          ))}
        </section>
      ) : filtered.length === 0 ? (
        <section aria-label="Empty State" className="p-12 sm:p-20 text-center rounded-3xl bg-surface/60 backdrop-blur-xl border border-dashed border-subtle space-y-5">
          <div className="p-4 bg-surface border border-subtle rounded-2xl w-16 h-16 mx-auto flex items-center justify-center text-brand-400 shadow-lg">
            <DojoIcon className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h2 className="text-lg sm:text-xl font-display font-black text-white">
              {search || statusFilter !== 'all' ? 'No matching combat missions' : 'No combat missions configured yet'}
            </h2>
            <p className="text-secondary text-xs sm:text-sm leading-relaxed">
              {search || statusFilter !== 'all'
                ? 'Try adjusting your search query or filter settings to find existing dossiers.'
                : 'Initiate your first targeted mock interview arena to train real-time speech and technical responses against AI.'}
            </p>
          </div>
          {!search && statusFilter === 'all' && (
            <div className="pt-3">
              <Link to="/interviews/new">
                <Button variant="primary" size="md" icon={KatanaIcon} className="px-7 font-bold">
                  <span>Launch First Mission</span>
                </Button>
              </Link>
            </div>
          )}
        </section>
      ) : (
        <section aria-label="Active Missions" className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {filtered.map((interview, idx) => {
            const statusInfo = STATUS_MAP[interview.status] || STATUS_MAP.draft;

            return (
              <motion.article
                key={interview._id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
                className="p-6 sm:p-7 rounded-3xl bg-surface/90 backdrop-blur-2xl border border-subtle hover:border-brand-500/50 hover:bg-surface transition-all duration-300 flex flex-col justify-between group shadow-lg relative overflow-hidden"
              >
                {/* Top Sheen Line */}
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-400/30 to-transparent pointer-events-none" />

                <div className="space-y-4">
                  {/* Top Metadata Header */}
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] font-mono font-extrabold text-slate-500 uppercase tracking-widest">
                      // ARENA-{String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono font-extrabold px-2.5 py-1 rounded-lg border ${statusInfo.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                      <span>{statusInfo.label}</span>
                    </span>
                  </div>

                  {/* Main Role & Company */}
                  <div className="space-y-1">
                    <h2 className="text-xl sm:text-2xl font-display font-black text-white group-hover:text-brand-300 transition-colors leading-snug">
                      {interview.jobTitle}
                    </h2>
                    {interview.company && (
                      <p className="text-xs sm:text-sm font-semibold text-secondary flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-slate-500" />
                        <span>{interview.company}</span>
                      </p>
                    )}
                  </div>

                  {/* Tactical Specs Tag Pill Cluster */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 font-mono text-xs">
                    <span className="px-2.5 py-1 rounded-lg bg-surface border border-subtle text-secondary font-bold text-[11px] uppercase">
                      {interview.experienceLevel} Tier
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-brand-500/10 border border-brand-500/20 text-brand-300 font-bold text-[11px]">
                      {interview.numberOfQuestions} Questions
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-surface border border-subtle text-secondary text-[11px] flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-500" />
                      <time dateTime={interview.createdAt}>
                        {new Date(interview.createdAt).toLocaleDateString()}
                      </time>
                    </span>
                  </div>
                </div>

                {/* Footer Action Strip */}
                <div className="flex items-center justify-between gap-3 pt-5 mt-5 border-t border-subtle">
                  <button
                    type="button"
                    onClick={() => openDeleteModal(interview)}
                    aria-label="Retire Combat Mission"
                    title="Retire Combat Mission"
                    className="px-3.5 py-2.5 rounded-2xl bg-surface border border-subtle text-secondary hover:text-rose-400 hover:border-rose-500/40 hover:bg-rose-500/10 transition-all duration-200 cursor-pointer group/del flex items-center gap-2 shadow-sm"
                  >
                    <Trash2 className="w-4 h-4 group-hover/del:scale-110 group-hover/del:rotate-6 transition-transform" />
                    <span className="text-xs font-mono font-bold hidden sm:inline">
                      Retire
                    </span>
                  </button>

                  <Link to={`/interviews/${interview._id}/session`} className="flex-1 max-w-[200px]">
                    <Button variant="primary" size="sm" icon={KatanaIcon} className="w-full font-bold">
                      <span>Enter Arena</span>
                    </Button>
                  </Link>
                </div>
              </motion.article>
            );
          })}
        </section>
      )}

      {/* ── 4. Shinobi Confirmation Modal ────────────────────── */}
      <ConfirmModal
        isOpen={modalOpen}
        onClose={() => {
          if (!deleting) {
            setModalOpen(false);
            setSelectedInterview(null);
          }
        }}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        title="Retire Combat Mission?"
        message="Are you sure you want to permanently decommission this simulation arena? All tailored questions and preliminary logs will be removed from your dossier."
        itemTitle={selectedInterview ? `${selectedInterview.jobTitle}${selectedInterview.company ? ` • ${selectedInterview.company}` : ''}` : ''}
        confirmText="Confirm & Retire"
        cancelText="Keep Dossier"
      />
    </main>
  );
}
