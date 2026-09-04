import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, TrendingUp, ThumbsUp, Target, Lightbulb,
  BookOpen, ChevronDown, ChevronUp, CheckCircle,
  RotateCcw, ArrowLeft, Star, Award, ShieldCheck, Zap,
  Clock, Building2, CheckCircle2, ChevronRight, MessageSquare
} from 'lucide-react';
import { sessionAPI } from '@/services/api';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell
} from 'recharts';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ShinobiLoader from '@/components/ui/ShinobiLoader';
import { DojoIcon, KatanaIcon, ShurikenIcon, ScrollIcon } from '@/components/ui/ShinobiIcons';

// Custom High-Contrast Recharts Tooltip
const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const val = payload[0].value;
    const isHigh = val >= 7;
    const isMedium = val >= 4;
    return (
      <div className="p-3.5 rounded-2xl bg-surface border border-subtle shadow-2xl text-xs font-mono space-y-1.5 backdrop-blur-2xl">
        <p className="font-extrabold text-white text-[11px] uppercase tracking-wider">
          Scenario {label}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-secondary text-[11px]">Score:</span>
          <span className={`text-sm font-black font-display ${isHigh ? 'text-emerald-400' : isMedium ? 'text-amber-400' : 'text-rose-400'}`}>
            {val} / 10
          </span>
        </div>
        <span className={`inline-block text-[9.5px] font-extrabold uppercase px-2 py-0.5 rounded-md border ${
          isHigh
            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
            : isMedium
            ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
            : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
        }`}>
          {isHigh ? 'OPTIMAL FIT' : isMedium ? 'ACCEPTABLE' : 'RECALIBRATE'}
        </span>
      </div>
    );
  }
  return null;
};

export default function SessionResultPage() {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedAnswer, setExpandedAnswer] = useState(0);

  useEffect(() => {
    sessionAPI.getById(id)
      .then(({ data }) => setSession(data?.data?.session || data?.session))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <ShinobiLoader
        tag="NEURAL EVALUATION // GEMINI AI"
        title="Synthesizing AI Evaluation Telemetry..."
        subtitle="Analyzing speech transcripts, competency dimensions, and STAR response vectors..."
      />
    );
  }

  if (!session) {
    return (
      <main className="p-12 text-center space-y-4 max-w-lg mx-auto">
        <p className="text-secondary text-sm font-mono">Mock session dossier not found.</p>
        <Link to="/sessions">
          <Button variant="secondary" size="md" icon={ArrowLeft}>
            <span>Back to Performance History</span>
          </Button>
        </Link>
      </main>
    );
  }

  const score = session.overallScore ?? 0;
  const isOptimal = score >= 70;
  const isMid = score >= 40 && score < 70;

  const scoreLabel = isOptimal
    ? 'EXCELLENT MASTERY // S-TIER CALIBRATION'
    : isMid
    ? 'SOLID FOUNDATION // TIER 2 OPERATIVE'
    : 'CALIBRATION REQUIRED // NOVICE ARENA';

  const scoreBadgeColor = isOptimal
    ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
    : isMid
    ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
    : 'bg-rose-500/15 border-rose-500/30 text-rose-400';

  // Radar chart data by category
  const categoryScores = {};
  session.answers?.forEach((a) => {
    const cat = session.interviewId?.questions?.find(
      (q) => q._id === a.questionId?.toString()
    )?.category || 'General';
    if (!categoryScores[cat]) categoryScores[cat] = { scores: [], name: cat.replace('_', ' ') };
    if (a.aiScore !== null) categoryScores[cat].scores.push(a.aiScore);
  });

  const radarData = Object.values(categoryScores).map((c) => ({
    subject: c.name.toUpperCase(),
    score: c.scores.length
      ? Math.round((c.scores.reduce((a, b) => a + b, 0) / (c.scores.length * 10)) * 100)
      : 0,
  }));

  const barData = (session.answers || []).map((a, i) => ({
    name: `Q${i + 1}`,
    score: a.aiScore ?? 0,
  }));

  return (
    <main className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* ── Top Back Navigation ────────────────────────────────── */}
      <nav aria-label="Breadcrumb" className="flex items-center justify-between">
        <Link to="/sessions">
          <Button variant="secondary" size="sm" icon={ArrowLeft} className="font-bold text-xs">
            <span>Back to Performance Logs</span>
          </Button>
        </Link>
        <span className="text-[10px] font-mono font-extrabold text-secondary uppercase tracking-widest px-3 py-1 rounded-xl bg-surface border border-subtle hidden sm:inline">
          Dossier ID: {session._id?.slice(-8)}
        </span>
      </nav>

      {/* ── 1. Hero Evaluation Header ──────────────────────────── */}
      <header className="p-6 sm:p-10 rounded-3xl bg-surface/95 backdrop-blur-2xl border border-subtle text-center relative overflow-hidden shadow-2xl space-y-7">
        {/* Top Katana Edge Sheen */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-400/60 to-transparent pointer-events-none" />

        {/* Ambient Radial Mesh Background */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[var(--accent-primary)]/10 rounded-full blur-3xl pointer-events-none" />

        {/* Holographic Circular Score Badge */}
        <div className="flex justify-center relative z-10">
          <div className="relative">
            <div className="w-36 h-36 rounded-3xl bg-surface border-2 border-brand-500/40 shadow-2xl flex flex-col items-center justify-center p-4 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-400 to-transparent pointer-events-none" />
              <span className="text-5xl sm:text-6xl font-display font-black text-white tracking-tight leading-none">
                {score}%
              </span>
              <span className="text-[10.5px] font-mono font-extrabold uppercase tracking-widest text-secondary mt-1.5">
                READINESS
              </span>
            </div>
            <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3.5 py-0.5 rounded-full bg-surface border border-subtle text-[9.5px] font-mono font-black text-emerald-400 uppercase tracking-widest shadow-md whitespace-nowrap">
              AI PRO EVALUATED
            </span>
          </div>
        </div>

        {/* Title & Metadata */}
        <div className="space-y-2.5 max-w-2xl mx-auto relative z-10">
          <div className="flex justify-center">
            <span className={`inline-flex items-center gap-1.5 text-[11px] font-mono font-extrabold px-3.5 py-1 rounded-xl border shadow-sm ${scoreBadgeColor}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              <span>{scoreLabel}</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-white tracking-tight leading-tight">
            {session.interviewId?.jobTitle || 'Engineering Evaluation Report'}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono text-secondary pt-1">
            {session.interviewId?.company && (
              <span className="font-bold text-white flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-brand-400" />
                <span>{session.interviewId.company}</span>
              </span>
            )}
            <span>&bull;</span>
            <span className="text-white font-semibold">{session.answers?.length || 0} Challenge Scenarios</span>
            <span>&bull;</span>
            <span className="capitalize text-slate-300 font-semibold">{session.interviewId?.experienceLevel || 'Mid'} Level</span>
          </div>
        </div>

        {/* AI Executive Feedback Narrative */}
        {session.overallFeedback && (
          <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-subtle max-w-2xl mx-auto text-left relative overflow-hidden shadow-sm z-10">
            <div className="flex items-center gap-2 text-brand-400 text-xs font-mono font-extrabold uppercase tracking-wider mb-2">
              <Zap className="w-4 h-4" />
              <span>Executive AI Coach Analysis</span>
            </div>
            <p className="text-secondary text-xs sm:text-sm leading-relaxed font-medium">
              {session.overallFeedback}
            </p>
          </div>
        )}

        {/* Action Triggers */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-2 relative z-10">
          <Link to="/interviews/new">
            <Button variant="primary" size="md" icon={KatanaIcon} className="px-7 font-bold">
              <span>Practice Again</span>
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="secondary" size="md" icon={DojoIcon} className="px-7 font-bold">
              <span>Dojo Command Hub</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* ── 2. Strengths & Target Calibration Areas ───────────── */}
      <section aria-label="Strengths and Calibration Areas" className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {/* Key Strengths */}
        <article className="p-6 sm:p-7 rounded-3xl bg-surface/90 backdrop-blur-xl border border-subtle space-y-4 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-subtle">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <ThumbsUp className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-display font-bold text-white text-base">Key Strengths Identified</h2>
                <p className="text-[10.5px] font-mono text-secondary">Demonstrated technical mastery</p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              VERIFIED
            </span>
          </div>

          {session.strengths?.length ? (
            <ul className="space-y-2.5">
              {session.strengths.map((s, i) => (
                <li key={i} className="flex items-start gap-3 text-xs text-secondary leading-relaxed p-3 rounded-2xl bg-surface border border-subtle">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span className="text-white font-medium">{s}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-secondary text-xs font-mono p-4 rounded-xl bg-surface border border-subtle text-center">
              No specific strength highlights recorded.
            </p>
          )}
        </article>

        {/* Target Calibration Areas */}
        <article className="p-6 sm:p-7 rounded-3xl bg-surface/90 backdrop-blur-xl border border-subtle space-y-4 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-subtle">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-amber-500/15 text-amber-400 border border-amber-500/30">
                <Target className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-display font-bold text-white text-base">Target Areas for Calibration</h2>
                <p className="text-[10.5px] font-mono text-secondary">High-priority growth vectors</p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30">
              PRIORITY
            </span>
          </div>

          {session.areasForImprovement?.length ? (
            <ul className="space-y-2.5">
              {session.areasForImprovement.map((a, i) => (
                <li key={i} className="flex items-start gap-3 text-xs text-secondary leading-relaxed p-3 rounded-2xl bg-surface border border-subtle">
                  <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                  <span className="text-white font-medium">{a}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-secondary text-xs font-mono p-4 rounded-xl bg-surface border border-subtle text-center">
              Maintain current calibration standards.
            </p>
          )}
        </article>
      </section>

      {/* ── 3. Visual Performance Radar & Bar Charts ───────────── */}
      <section aria-label="Performance Visualizations" className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
        {radarData.length > 2 && (
          <article className="p-6 sm:p-7 rounded-3xl bg-surface/90 backdrop-blur-xl border border-subtle space-y-4 shadow-lg">
            <div className="flex items-center justify-between pb-2 border-b border-subtle">
              <div className="flex items-center gap-2.5">
                <Star className="w-4 h-4 text-brand-400" />
                <h3 className="font-display font-bold text-white text-base">Competency Domain Radar</h3>
              </div>
              <span className="text-[10px] font-mono font-extrabold text-secondary uppercase">
                RADAR MATRIX
              </span>
            </div>
            <div className="w-full flex items-center justify-center pt-2">
              <ResponsiveContainer width="100%" height={240}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--border-subtle)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-secondary)', fontSize: 10, fontWeight: 700 }} />
                  <Radar name="Score" dataKey="score" stroke="var(--accent-primary)" fill="var(--accent-primary)" fillOpacity={0.25} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </article>
        )}

        <article className="p-6 sm:p-7 rounded-3xl bg-surface/90 backdrop-blur-xl border border-subtle space-y-4 shadow-lg">
          <div className="flex items-center justify-between pb-2 border-b border-subtle">
            <div className="flex items-center gap-2.5">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              <h3 className="font-display font-bold text-white text-base">Score Breakdown Per Scenario</h3>
            </div>
            <span className="text-[10px] font-mono font-extrabold text-secondary uppercase">
              SCALE 0-10
            </span>
          </div>
          <div className="w-full flex items-center justify-center pt-2">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={barData} barSize={28}>
                <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 11, fontWeight: 700 }} />
                <YAxis domain={[0, 10]} tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.04)' }}
                  content={<CustomBarTooltip />}
                />
                <Bar dataKey="score" radius={[8, 8, 0, 0]}>
                  {barData.map((entry, i) => (
                    <Cell key={i} fill={entry.score >= 7 ? '#10b981' : entry.score >= 4 ? '#f59e0b' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>
      </section>

      {/* ── 4. Detailed Scenario Transcript & AI Coach Diagnosis ── */}
      <section aria-label="Detailed Scenario Review" className="p-6 sm:p-8 rounded-3xl bg-surface/90 backdrop-blur-2xl border border-subtle space-y-5 shadow-xl">
        <div className="flex items-center justify-between pb-4 border-b border-subtle">
          <div>
            <span className="text-[10px] font-mono font-extrabold text-slate-500 uppercase tracking-widest block">
              // COMPLETE EVALUATION LOGS
            </span>
            <h2 className="text-lg sm:text-xl font-display font-black text-white mt-0.5">
              Detailed Scenario Transcripts & AI Diagnosis
            </h2>
          </div>
          <span className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-surface border border-subtle text-secondary">
            {session.answers?.length || 0} Scenarios
          </span>
        </div>

        <div className="space-y-3.5">
          {session.answers?.map((answer, i) => {
            const isExpanded = expandedAnswer === i;
            const itemScore = answer.aiScore ?? 0;
            const scoreColor = itemScore >= 7 ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30' : itemScore >= 4 ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' : 'text-rose-400 bg-rose-500/10 border-rose-500/30';

            return (
              <div
                key={i}
                className="border border-subtle rounded-2xl overflow-hidden bg-surface transition-all"
              >
                <button
                  type="button"
                  onClick={() => setExpandedAnswer(isExpanded ? null : i)}
                  className="w-full flex items-center justify-between p-4 sm:p-5 hover:bg-surface-hover transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="w-8 h-8 rounded-xl bg-surface border border-subtle text-brand-300 flex items-center justify-center text-xs font-mono font-bold flex-shrink-0">
                      0{i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate leading-snug">
                        {answer.questionText}
                      </p>
                      {answer.skipped && (
                        <span className="text-[10px] font-mono font-bold text-amber-400 mt-0.5 inline-block">
                          Skipped Scenario
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 flex-shrink-0 ml-3">
                    <span className={`text-xs font-mono font-extrabold px-2.5 py-1 rounded-lg border ${scoreColor}`}>
                      {itemScore}/10
                    </span>
                    <div className="p-1 rounded-lg bg-surface border border-subtle text-secondary">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="border-t border-subtle p-5 sm:p-6 space-y-4 bg-surface/50"
                    >
                      {answer.answerText && (
                        <div>
                          <p className="text-[10px] font-mono font-extrabold text-secondary mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                            <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                            <span>Candidate Transcript</span>
                          </p>
                          <p className="text-white text-xs sm:text-sm leading-relaxed bg-surface p-4 rounded-2xl border border-subtle font-medium">
                            {answer.answerText}
                          </p>
                        </div>
                      )}

                      {answer.aiFeedback && (
                        <div className="p-4 sm:p-5 rounded-2xl bg-brand-500/10 border border-brand-500/30 space-y-1">
                          <p className="text-[10px] font-mono font-extrabold text-brand-300 uppercase tracking-wider flex items-center gap-1.5">
                            <Zap className="w-3.5 h-3.5 text-brand-400" />
                            <span>AI Coach Technical Feedback</span>
                          </p>
                          <p className="text-secondary text-xs sm:text-sm leading-relaxed font-medium">
                            {answer.aiFeedback}
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
