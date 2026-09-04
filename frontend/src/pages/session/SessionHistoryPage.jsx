import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  History, Clock, ChevronRight, Building2, Trophy,
  Target, Zap, Award, TrendingUp, Activity, CheckCircle2,
  Calendar, ArrowRight, ArrowLeft
} from 'lucide-react';
import { sessionAPI } from '@/services/api';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { DojoIcon, KatanaIcon, ShurikenIcon, ScrollIcon } from '@/components/ui/ShinobiIcons';

const STATUS_MAP = {
  completed: {
    label: 'COMPLETED',
    color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    dot: 'bg-emerald-400',
  },
  in_progress: {
    label: 'IN PROGRESS',
    color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30',
    dot: 'bg-cyan-400',
  },
  started: {
    label: 'INITIALIZED',
    color: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    dot: 'bg-amber-400',
  },
  abandoned: {
    label: 'ABANDONED',
    color: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    dot: 'bg-rose-400',
  },
};

export default function SessionHistoryPage() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchSessions = (p = 1) => {
    setLoading(true);
    sessionAPI.getAll({ page: p, limit: 10 })
      .then(({ data }) => {
        const list = data?.data?.sessions || data?.sessions || (Array.isArray(data?.data) ? data.data : []);
        setSessions(Array.isArray(list) ? list : []);
        setTotalPages(data?.data?.totalPages || data?.totalPages || 1);
        setPage(p);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const completedSessions = sessions.filter((s) => s.status === 'completed' && s.overallScore != null);
  const averageScore = completedSessions.length
    ? Math.round(completedSessions.reduce((acc, s) => acc + s.overallScore, 0) / completedSessions.length)
    : 0;
  const bestScore = completedSessions.length
    ? Math.max(...completedSessions.map((s) => s.overallScore))
    : 0;

  return (
    <main className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-16">
      {/* ── 1. Tactical Command Header Banner ──────────────────── */}
      <header className="p-6 sm:p-8 lg:p-10 rounded-3xl bg-surface/90 backdrop-blur-2xl border border-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden shadow-2xl">
        {/* Top Katana Edge Sheen */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-400/50 to-transparent pointer-events-none" />

        <div className="space-y-2.5 max-w-2xl relative z-10">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-brand-500/15 border border-brand-500/30 text-brand-300 text-xs font-mono font-bold uppercase tracking-wider">
              <History className="w-4 h-4 text-brand-400" />
              <span>COMBAT ARCHIVES // PERFORMANCE LOGS</span>
            </span>
            <span className="text-xs font-mono text-secondary px-2.5 py-1 rounded-xl bg-surface border border-subtle font-semibold">
              Telemetry Records
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight leading-tight">
            Performance Logs & Scores
          </h1>

          <p className="text-secondary text-xs sm:text-sm leading-relaxed max-w-xl font-medium">
            Review your historical AI assessment evaluations, technical STAR breakdowns, and readiness progress over time.
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

      {/* ── 2. Performance Summary Telemetry Grid ──────────────── */}
      {!loading && sessions.length > 0 && (
        <section aria-label="Performance Telemetry" className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          <article className="p-5 sm:p-6 rounded-3xl bg-surface/90 backdrop-blur-xl border border-subtle flex items-center justify-between relative overflow-hidden shadow-md">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-extrabold text-slate-500 uppercase tracking-widest block">
                // ARCHIVE TOTAL
              </span>
              <p className="text-3xl font-display font-black text-white">{sessions.length}</p>
              <p className="text-xs text-secondary font-medium">Total logged simulation trials</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-surface border border-subtle text-brand-400">
              <History className="w-5 h-5" />
            </div>
          </article>

          <article className="p-5 sm:p-6 rounded-3xl bg-surface/90 backdrop-blur-xl border border-subtle flex items-center justify-between relative overflow-hidden shadow-md">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-extrabold text-slate-500 uppercase tracking-widest block">
                // AVERAGE FIT
              </span>
              <p className="text-3xl font-display font-black text-white">
                {averageScore > 0 ? `${averageScore}%` : '—'}
              </p>
              <p className="text-xs text-secondary font-medium">Average across completed trials</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-surface border border-subtle text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
          </article>

          <article className="p-5 sm:p-6 rounded-3xl bg-surface/90 backdrop-blur-xl border border-subtle flex items-center justify-between relative overflow-hidden shadow-md">
            <div className="space-y-1">
              <span className="text-[10px] font-mono font-extrabold text-slate-500 uppercase tracking-widest block">
                // PEAK RECORD
              </span>
              <p className="text-3xl font-display font-black text-white">
                {bestScore > 0 ? `${bestScore}%` : '—'}
              </p>
              <p className="text-xs text-secondary font-medium">Personal best AI readiness score</p>
            </div>
            <div className="p-3.5 rounded-2xl bg-surface border border-subtle text-amber-400">
              <Trophy className="w-5 h-5" />
            </div>
          </article>
        </section>
      )}

      {/* ── 3. Session Stream Logs ─────────────────────────────── */}
      {loading ? (
        <section aria-label="Loading Logs" className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="p-6 rounded-3xl bg-surface/70 border border-subtle animate-pulse space-y-4">
              <div className="flex items-center justify-between">
                <div className="h-5 bg-surface rounded-lg w-1/3" />
                <div className="h-5 bg-surface rounded-lg w-1/6" />
              </div>
              <div className="h-4 bg-surface rounded-lg w-1/2" />
            </div>
          ))}
        </section>
      ) : sessions.length === 0 ? (
        <section aria-label="Empty State" className="p-12 sm:p-20 text-center rounded-3xl bg-surface/60 backdrop-blur-xl border border-dashed border-subtle space-y-5">
          <div className="p-4 bg-surface border border-subtle rounded-2xl w-16 h-16 mx-auto flex items-center justify-center text-brand-400 shadow-lg">
            <DojoIcon className="w-8 h-8" />
          </div>
          <div className="space-y-1.5 max-w-md mx-auto">
            <h2 className="text-lg sm:text-xl font-display font-black text-white">
              No Combat Simulations Logged Yet
            </h2>
            <p className="text-secondary text-xs sm:text-sm leading-relaxed">
              Step into the simulation arena and complete your first mock interview to unlock real-time speech analytics and detailed score reports.
            </p>
          </div>
          <div className="pt-3">
            <Link to="/interviews/new">
              <Button variant="primary" size="md" icon={KatanaIcon} className="px-7 font-bold">
                <span>Launch First Mission</span>
              </Button>
            </Link>
          </div>
        </section>
      ) : (
        <section aria-label="Simulation Logs" className="space-y-4">
          {sessions.map((session, idx) => {
            const statusInfo = STATUS_MAP[session.status] || STATUS_MAP.started;
            const score = session.overallScore;

            return (
              <motion.article
                key={session._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: idx * 0.03 }}
              >
                <Link
                  to={session.status === 'completed' ? `/sessions/${session._id}/results` : '#'}
                  className={`p-5 sm:p-6 rounded-3xl bg-surface/90 backdrop-blur-2xl border border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-5 transition-all duration-300 group shadow-lg relative overflow-hidden ${session.status === 'completed'
                      ? 'hover:border-brand-500/50 hover:bg-surface cursor-pointer'
                      : 'opacity-85'
                    }`}
                >
                  {/* Top Sheen Line */}
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-400/30 to-transparent pointer-events-none" />

                  <div className="flex items-start gap-4 min-w-0">
                    <div className="p-3.5 bg-surface border border-subtle rounded-2xl text-brand-400 flex-shrink-0 group-hover:scale-105 group-hover:border-brand-500/40 transition-transform shadow-sm">
                      <Building2 className="w-5 h-5" />
                    </div>

                    <div className="space-y-1.5 min-w-0">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h2 className="text-base sm:text-lg font-display font-bold text-white group-hover:text-brand-300 transition-colors leading-snug truncate">
                          {session.interviewId?.jobTitle || 'Engineering Assessment'}
                        </h2>
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-lg border ${statusInfo.color}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusInfo.dot}`} />
                          <span>{statusInfo.label}</span>
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-secondary font-mono">
                        {session.interviewId?.company && (
                          <span className="font-semibold text-white">
                            {session.interviewId.company}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          <time dateTime={session.createdAt}>
                            {new Date(session.createdAt).toLocaleDateString('en-US', {
                              month: 'short', day: 'numeric', year: 'numeric'
                            })}
                          </time>
                        </span>
                        {session.totalTimeTaken > 0 && (
                          <span className="text-slate-400">
                            &bull; ~{Math.ceil(session.totalTimeTaken / 60)} mins runtime
                          </span>
                        )}
                        <span className="capitalize text-slate-400">
                          &bull; {session.interviewId?.experienceLevel || 'Mid'} Level
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Score & Forward Trigger */}
                  <div className="flex items-center gap-4 flex-shrink-0 justify-between sm:justify-end border-t sm:border-t-0 border-subtle pt-3 sm:pt-0">
                    {score !== null && score !== undefined ? (
                      <div className="flex flex-col items-center justify-center text-center min-w-[110px]">
                        <span className={`inline-flex items-center justify-center text-base sm:text-lg font-display font-black px-3.5 py-1.5 rounded-2xl border ${
                          score >= 70
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                            : score >= 40
                            ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                            : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                        }`}>
                          {score}% FIT
                        </span>
                        <p className="text-[9.5px] font-mono font-bold text-secondary uppercase tracking-widest mt-1 text-center">
                          Neural Score
                        </p>
                      </div>
                    ) : (
                      <span className="text-xs font-mono text-slate-500 px-3 py-1 rounded-xl bg-surface border border-subtle">
                        INCOMPLETE
                      </span>
                    )}

                    {session.status === 'completed' && (
                      <div className="p-2 rounded-xl bg-surface border border-subtle text-secondary group-hover:text-white group-hover:border-brand-500/40 group-hover:translate-x-0.5 transition-all">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </Link>
              </motion.article>
            );
          })}
        </section>
      )}

      {/* ── 4. Pagination Controls ─────────────────────────────── */}
      {totalPages > 1 && (
        <nav aria-label="Pagination Navigation" className="flex items-center justify-center gap-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            icon={ArrowLeft}
            onClick={() => fetchSessions(page - 1)}
            disabled={page === 1}
            className="font-bold text-xs"
          >
            <span>Previous</span>
          </Button>

          <span className="text-xs font-mono font-bold text-secondary px-3 py-1.5 rounded-xl bg-surface border border-subtle">
            Page {page} of {totalPages}
          </span>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => fetchSessions(page + 1)}
            disabled={page === totalPages}
            className="font-bold text-xs"
          >
            <span>Next</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </nav>
      )}
    </main>
  );
}
