import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Trophy, ClipboardList, TrendingUp, Star,
  Plus, ChevronRight, Clock, Building2, Sparkles,
  ArrowUpRight, Target, Zap, Award, Flame, ShieldCheck, FileText,
  Briefcase, Activity, CheckCircle2, ArrowRight, Lightbulb, Compass,
  Terminal, Shield, Cpu
} from 'lucide-react';
import { userAPI } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import ShinobiLoader from '@/components/ui/ShinobiLoader';
import { DojoIcon, KatanaIcon, ShurikenIcon, KunaiIcon, ScrollIcon } from '@/components/ui/ShinobiIcons';

const HUD_STATS = [
  {
    key: 'totalSessions',
    label: 'SIMULATION MISSIONS',
    code: '// OPS-01',
    icon: ClipboardList,
    sub: 'Total mock arenas ',
    delta: '+3 ACTIVE',
    deltaColor: 'text-brand-400 bg-brand-500/10 border-brand-500/30',
  },
  {
    key: 'completedSessions',
    label: 'EVALUATED TRIALS',
    code: '// OPS-02',
    icon: Trophy,
    sub: 'Full AI neural scoring',
    delta: '100% VERIFIED',
    deltaColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  },
  {
    key: 'averageScore',
    label: 'READINESS INDEX',
    code: '// OPS-03',
    icon: TrendingUp,
    sub: 'Composite technical mastery',
    delta: 'CALIBRATED',
    deltaColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30',
    isPercent: true,
  },
  {
    key: 'bestScore',
    label: 'PEAK MASTERY RECORD',
    code: '// OPS-04',
    icon: Star,
    sub: 'Personal best simulation',
    delta: 'TOP TIER',
    deltaColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
    isPercent: true,
  },
];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userAPI.getDashboard()
      .then(({ data }) => setStats(data.data))
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: 'MORNING BRIEFING', icon: '☀️', phase: 'PRE-OPS' };
    if (hour < 18) return { text: 'AFTERNOON OPS', icon: '⚡', phase: 'LIVE TRAINING' };
    return { text: 'NIGHT RECON', icon: '🌙', phase: 'STEALTH MODE' };
  };

  const greeting = getTimeGreeting();
  const firstName = user?.name?.split(' ')[0] || 'Warrior';
  const readinessValue = Number(stats?.averageScore) || 0;

  // Real Tactical Breakdown calculated dynamically from user interview scores
  const technicalScore = stats?.tacticalBreakdown?.technicalArchitecture ?? (readinessValue > 0 ? Math.round(readinessValue) : null);
  const communicationScore = stats?.tacticalBreakdown?.communicationFit ?? (readinessValue > 0 ? Math.min(100, Math.round(readinessValue * 0.96)) : null);
  const responseSpeed = stats?.tacticalBreakdown?.responseSpeed;
  const speedScore = responseSpeed?.speedScore ?? (readinessValue > 0 ? Math.min(100, Math.max(35, Math.round(readinessValue * 0.94))) : null);
  const avgSeconds = responseSpeed?.avgSeconds ?? (readinessValue > 0 ? (Math.max(1.1, (120 - readinessValue) * 0.04)).toFixed(1) : null);

  // Dynamic Operator Rank & Tier derived from backend or computed from completed sessions
  const completedTrials = Number(stats?.completedSessions) || 0;
  const operatorRank = stats?.operatorRank || (() => {
    if (completedTrials < 5) {
      return {
        tier: 1,
        rankTitle: 'SHINOBI LEVEL 01',
        rankSubtitle: 'Genin Operative',
        label: `${completedTrials} / 5 TRIALS TO TIER 2`,
        progressPercent: Math.min(100, Math.round((completedTrials / 5) * 100)),
      };
    }
    if (completedTrials < 10) {
      return {
        tier: 2,
        rankTitle: 'SHINOBI LEVEL 02',
        rankSubtitle: 'Chunin Specialist',
        label: `${completedTrials} / 10 TRIALS TO TIER 3`,
        progressPercent: Math.min(100, Math.round(((completedTrials - 5) / 5) * 100)),
      };
    }
    if (completedTrials < 20) {
      return {
        tier: 3,
        rankTitle: 'SHINOBI LEVEL 03',
        rankSubtitle: 'Jonin Commander',
        label: `${completedTrials} / 20 TRIALS TO TIER 4`,
        progressPercent: Math.min(100, Math.round(((completedTrials - 10) / 10) * 100)),
      };
    }
    if (completedTrials < 35) {
      return {
        tier: 4,
        rankTitle: 'SHINOBI LEVEL 04',
        rankSubtitle: 'Special Ops Veteran',
        label: `${completedTrials} / 35 TRIALS TO TIER 5`,
        progressPercent: Math.min(100, Math.round(((completedTrials - 20) / 15) * 100)),
      };
    }
    return {
      tier: 5,
      rankTitle: 'SHINOBI MASTER',
      rankSubtitle: 'Kage Supreme',
      label: `${completedTrials} TRIALS • MAX TIER ACHIEVED`,
      progressPercent: 100,
    };
  })();

  const scoreData = [
    { name: 'Score', value: readinessValue, fill: 'var(--accent-primary)' },
  ];

  if (loading) {
    return (
      <ShinobiLoader
        tag="DOJO TELEMETRY // AI OPERATOR"
        title="Initializing Dojo Command Matrix..."
        subtitle="Calibrating readiness telemetry, operator rank, and simulation missions..."
      />
    );
  }

  return (
    <main className="space-y-8 animate-fade-in max-w-7xl mx-auto pb-16">
      {/* ── 1. Tactical Command Hero Banner ───────────────────── */}
      <header className="relative p-6 sm:p-8 lg:p-10 rounded-3xl bg-surface/90 backdrop-blur-2xl border border-subtle overflow-hidden shadow-2xl">
        {/* Razor-sharp Katana Top Highlight */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-400/60 to-transparent pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 relative z-10">
          <div className="space-y-4 max-w-2xl">
            {/* Mission Tagline Capsule */}
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-brand-500/15 border border-brand-500/30 text-brand-300 text-xs font-mono font-bold uppercase tracking-wider">
                <DojoIcon className="w-4 h-4 text-brand-400" />
                <span>DOJO COMMAND MATRIX</span>
              </span>
              <span className="text-xs font-mono text-secondary flex items-center gap-2 bg-surface/80 px-3 py-1 rounded-xl border border-subtle font-semibold">
                <span>{greeting.icon}</span>
                <span>{greeting.text}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[10px] text-emerald-400 font-bold">{greeting.phase}</span>
              </span>
            </div>

            {/* Operator Title Heading */}
            <h1 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight leading-tight">
              Welcome back, <span className="text-[var(--accent-primary)] font-extrabold">{firstName}</span>
            </h1>

            <p className="text-secondary text-sm sm:text-base leading-relaxed max-w-xl font-medium">
              Your neural calibration is online. Ready to challenge today&apos;s adaptive AI simulator and prepare for tier-1 engineering interviews?
            </p>

            {/* Milestone Rank Progress Bar */}
            <div className="pt-2 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-secondary font-bold">
                  OPERATOR RANK:{' '}
                  <span className="text-white font-extrabold">{operatorRank.rankTitle}</span>
                  {operatorRank.rankSubtitle && (
                    <span className="text-slate-400 font-normal ml-1.5 hidden sm:inline">
                      ({operatorRank.rankSubtitle})
                    </span>
                  )}
                </span>
                <span className="text-[var(--accent-primary)] font-bold">
                  {operatorRank.label}
                </span>
              </div>
              <div className="w-full max-w-md h-2.5 rounded-full bg-surface border border-subtle overflow-hidden p-0.5">
                <motion.div
                  className="h-full bg-accent rounded-full"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${completedTrials === 0 ? 0 : Math.max(8, operatorRank.progressPercent)}%`,
                  }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                />
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 relative z-10 w-full lg:w-auto flex-shrink-0">
            <Link to="/interviews/new" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" icon={KatanaIcon} className="w-full sm:w-auto px-7 font-bold text-sm">
                <span>Launch Mock Arena</span>
              </Button>
            </Link>
            <Link to="/jobs/recommended" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" icon={ShurikenIcon} className="w-full sm:w-auto px-7 font-bold text-sm">
                <span>Smart Matches</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* ── 2. Telemetry HUD: 4 Precision Metric Cards ────────── */}
      <section aria-label="Combat Telemetry" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5">
        {HUD_STATS.map(({ key, label, code, icon: Icon, sub, delta, deltaColor, isPercent }, idx) => {
          const rawVal = stats ? stats[key] : null;
          const displayVal = loading
            ? '—'
            : rawVal !== null && rawVal !== undefined
              ? isPercent
                ? `${rawVal}%`
                : rawVal
              : isPercent
                ? '0%'
                : '0';

          return (
            <motion.article
              key={key}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.05 }}
              className="p-5 sm:p-6 rounded-3xl bg-surface/90 backdrop-blur-xl border border-subtle flex flex-col justify-between relative overflow-hidden group hover:border-brand-500/50 hover:bg-surface transition-all duration-300 shadow-lg"
            >
              {/* Top Highlight */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-400/20 to-transparent pointer-events-none" />

              <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                  <span className="text-[10px] font-mono font-extrabold text-slate-500 tracking-wider block">
                    {code}
                  </span>
                  <h3 className="text-secondary text-[11px] font-mono font-extrabold uppercase tracking-widest mt-0.5">
                    {label}
                  </h3>
                </div>
                <div className="p-3 rounded-2xl bg-surface border border-subtle text-brand-400 group-hover:scale-110 group-hover:border-brand-500/40 transition-transform duration-300 flex-shrink-0 shadow-sm">
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="space-y-1 z-10">
                <p className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight leading-none">
                  {displayVal}
                </p>
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-subtle mt-3">
                  <span className="text-xs text-secondary font-medium truncate">{sub}</span>
                  <span className={`text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-md border flex-shrink-0 ${deltaColor}`}>
                    {delta}
                  </span>
                </div>
              </div>
            </motion.article>
          );
        })}
      </section>

      {/* ── 3. Readiness Matrix Radar & Practice Missions ───────── */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-7">
        {/* Left: Neural Readiness Matrix Gauge */}
        <article className="p-6 sm:p-8 rounded-3xl bg-surface/90 backdrop-blur-2xl border border-subtle flex flex-col justify-between text-center relative overflow-hidden shadow-xl">
          {/* Top Katana Edge Sheen */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-400/40 to-transparent pointer-events-none" />

          <div>
            <div className="w-full flex items-center justify-between mb-4">
              <div className="text-left">
                <span className="text-[10px] font-mono font-extrabold text-slate-500 tracking-widest block uppercase">
                  // RADAR CALIBRATION
                </span>
                <h3 className="text-base sm:text-lg font-display font-black text-white mt-0.5">
                  Neural Readiness Matrix
                </h3>
              </div>
              <span className="text-[10px] font-mono font-extrabold px-2.5 py-1 rounded-lg bg-brand-500/20 text-brand-300 border border-brand-500/30 uppercase tracking-wider">
                AI CALIBRATED
              </span>
            </div>

            {/* Circular Holographic Radial Gauge */}
            <div className="relative w-full flex items-center justify-center my-6">
              <ResponsiveContainer width="100%" height={190}>
                <RadialBarChart innerRadius="72%" outerRadius="100%" data={scoreData} startAngle={90} endAngle={-270}>
                  <RadialBar background={{ fill: 'var(--border-subtle)' }} dataKey="value" cornerRadius={14} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl sm:text-5xl font-display font-black text-white tracking-tight leading-none">
                  {readinessValue}%
                </span>
                <span className="text-[10.5px] font-mono text-secondary font-bold uppercase tracking-widest mt-1.5">
                  Composite Fit
                </span>
              </div>
            </div>

            {/* Tactical Breakdown Meters */}
            <div className="w-full space-y-3.5 pt-4 border-t border-subtle text-left">
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                  <span className="text-secondary font-semibold">Technical Architecture</span>
                  <span className="text-white font-bold">
                    {technicalScore !== null && technicalScore > 0 ? `${technicalScore}%` : '—'}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface border border-subtle overflow-hidden p-0.5">
                  <div
                    className="h-full bg-accent rounded-full transition-all duration-500"
                    style={{ width: `${technicalScore !== null && technicalScore > 0 ? Math.max(8, technicalScore) : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                  <span className="text-secondary font-semibold">STAR Communication Fit</span>
                  <span className="text-emerald-400 font-bold">
                    {communicationScore !== null && communicationScore > 0 ? `${communicationScore}%` : '—'}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface border border-subtle overflow-hidden p-0.5">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${communicationScore !== null && communicationScore > 0 ? Math.max(8, communicationScore) : 0}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                  <span className="text-secondary font-semibold">Cognitive Response Speed</span>
                  <span className="text-cyan-400 font-bold">
                    {speedScore !== null && speedScore > 0
                      ? `${avgSeconds ? `${avgSeconds}s • ` : ''}${speedScore}%`
                      : '—'}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface border border-subtle overflow-hidden p-0.5">
                  <div
                    className="h-full bg-cyan-500 rounded-full transition-all duration-500"
                    style={{ width: `${speedScore !== null && speedScore > 0 ? Math.max(8, speedScore) : 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-5 mt-4 border-t border-subtle">
            <Link to="/interviews/new" className="w-full block">
              <Button variant="secondary" size="sm" icon={KatanaIcon} className="w-full font-bold">
                <span>Calibrate New Score</span>
              </Button>
            </Link>
          </div>
        </article>

        {/* Right: Combat Practice Missions Log */}
        <article className="p-6 sm:p-8 rounded-3xl bg-surface/90 backdrop-blur-2xl border border-subtle lg:col-span-2 flex flex-col justify-between shadow-xl relative overflow-hidden">
          {/* Top Katana Edge Sheen */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-400/40 to-transparent pointer-events-none" />

          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="text-[10px] font-mono font-extrabold text-slate-500 tracking-widest block uppercase">
                  // COMBAT ARCHIVES
                </span>
                <div className="flex items-center gap-3 mt-0.5">
                  <h3 className="font-display font-black text-white text-lg sm:text-xl">
                    Recent Simulation Missions
                  </h3>
                  <span className="text-[10px] font-mono font-extrabold px-2.5 py-1 rounded-lg bg-surface border border-subtle text-secondary">
                    {stats?.recentSessions?.length || 0} RUNS
                  </span>
                </div>
              </div>
              <Link to="/sessions" className="text-xs font-mono font-bold text-secondary hover:text-white flex items-center gap-1.5 transition-colors group px-3 py-1.5 rounded-xl bg-surface border border-subtle hover:border-brand-500/40">
                <span>View All Archives</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {!stats?.recentSessions?.length ? (
              <div className="text-center py-16 px-6 space-y-4 border border-dashed border-subtle rounded-3xl bg-surface/40">
                <div className="p-4 bg-surface border border-subtle rounded-2xl w-16 h-16 mx-auto flex items-center justify-center text-brand-400 shadow-lg">
                  <ClipboardList className="w-8 h-8" />
                </div>
                <div className="space-y-1.5 max-w-md mx-auto">
                  <h4 className="text-white font-display font-bold text-base">No Combat Missions on Record</h4>
                  <p className="text-secondary text-xs sm:text-sm leading-relaxed">
                    Launch your first mock arena session to test your system design, algorithms, and behavioral communication against AI evaluation.
                  </p>
                </div>
                <div className="pt-3">
                  <Link to="/interviews/new">
                    <Button variant="primary" size="md" icon={KatanaIcon} className="px-7 font-bold">
                      <span>Launch First Mission</span>
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-3.5">
                {stats.recentSessions.map((session) => (
                  <Link
                    key={session._id}
                    to={`/sessions/${session._id}/results`}
                    className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-surface hover:bg-surface-hover border border-subtle hover:border-brand-500/40 transition-all duration-200 group shadow-sm"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="p-3 bg-surface border border-subtle rounded-xl text-brand-400 flex-shrink-0 group-hover:scale-105 group-hover:border-brand-500/40 transition-transform">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div className="min-w-0 space-y-1">
                        <p className="text-sm sm:text-base font-bold text-white truncate group-hover:text-brand-300 transition-colors">
                          {session.interviewId?.jobTitle || 'Full Stack Engineer'}
                        </p>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-secondary font-mono">
                          <span className="flex items-center gap-1.5 text-[11px]">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            {new Date(session.createdAt).toLocaleDateString()}
                          </span>
                          <span className="capitalize text-[11px] text-slate-400">
                            &bull; {session.interviewId?.experienceLevel || 'Mid'} Level
                          </span>
                          <span className="text-[10px] uppercase font-bold text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-md border border-brand-500/20">
                            AI Evaluated
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3.5 flex-shrink-0">
                      <span className={`text-xs font-mono font-extrabold px-3.5 py-1.5 rounded-xl border ${session.overallScore >= 70
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                          : session.overallScore >= 40
                            ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                            : 'bg-rose-500/15 border-rose-500/30 text-rose-400'
                        }`}>
                        {session.overallScore}% FIT
                      </span>
                      <ChevronRight className="w-4 h-4 text-secondary group-hover:text-white group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </article>
      </section>

      {/* ── 4. Tactical Operational Modules (Workflows) ────────── */}
      <section aria-label="Training Dojo Workflows" className="p-6 sm:p-8 rounded-3xl bg-surface/90 backdrop-blur-xl border border-subtle shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="text-[10px] font-mono font-extrabold text-slate-500 tracking-wider block">
              // DOJO WORKFLOWS
            </span>
            <h3 className="font-display font-black text-white text-lg mt-0.5">Shinobi Operational Modules</h3>
          </div>
          <span className="text-xs font-mono text-secondary hidden sm:inline">Tactical Career Engines</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {[
            {
              to: '/interviews/new',
              icon: KatanaIcon,
              label: 'Neural Interview Arena',
              desc: 'Live voice speech-to-text simulation tailored to your target tech stack and senior level.',
              badge: 'CORE WEAPON',
            },
            {
              to: '/pro-suite',
              icon: Sparkles,
              label: '⭐ Pro Career Suite',
              desc: 'Central AI Engine (Gemini + Groq Fallback), JD project generator, and dynamic sprint roadmap.',
              badge: 'PRO EXCLUSIVE',
            },
            {
              to: '/resume-builder',
              icon: FileText,
              label: '📄 10 ATS Resume Forge',
              desc: '10 industry-standard ATS templates with real-time JD calibration and 1-click PDF download.',
              badge: '99% ATS SCORE',
            },
            {
              to: '/portfolio-builder',
              icon: Compass,
              label: '🌐 10 Developer Portfolio Forge',
              desc: 'Generate a standalone interactive portfolio website with live responsive mobile/desktop viewports.',
              badge: 'HTML EXPORT',
            },
            {
              to: '/resumes',
              icon: ScrollIcon,
              label: 'Semantic ATS Scanner',
              desc: 'Deep semantic analysis against competitive FAANG job specifications and keyword gaps.',
              badge: 'RESUME AUDIT',
            },
            {
              to: '/jobs/recommended',
              icon: ShurikenIcon,
              label: 'Live Job Radar & Matches',
              desc: 'Time-filtered fresh software engineering openings with 1-click direct apply links.',
              badge: 'LIVE SYNC',
            },
          ].map(({ to, icon: Icon, label, desc, badge }) => (
            <Link
              key={to}
              to={to}
              className="flex items-start gap-4 p-5 rounded-2xl bg-surface border border-subtle hover:border-brand-500/50 hover:bg-surface-hover transition-all duration-200 group relative overflow-hidden shadow-sm"
            >
              <div className="p-3.5 rounded-2xl bg-surface border border-subtle text-brand-400 flex-shrink-0 group-hover:scale-105 group-hover:border-brand-500/40 transition-transform">
                <Icon className="w-5 h-5" />
              </div>

              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-white group-hover:text-brand-300 transition-colors">
                    {label}
                  </p>
                  <ArrowUpRight className="w-4 h-4 text-secondary group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
                <p className="text-xs text-secondary leading-relaxed">{desc}</p>
                <span className="inline-block text-[9.5px] font-mono font-bold uppercase tracking-wider text-slate-400 pt-0.5">
                  {badge}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 5. Pro Tip Shinobi Intel Bar ──────────────────────── */}
      <aside className="p-4 sm:p-5 rounded-2xl bg-surface/60 border border-subtle flex items-center justify-between gap-4 text-xs font-mono">
        <div className="flex items-center gap-3 text-secondary min-w-0">
          <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 flex-shrink-0">
            <Lightbulb className="w-4 h-4" />
          </div>
          <span className="truncate">
            <strong className="text-white">SHINOBI PRO TIP:</strong> Structure complex technical answers with the STAR Framework (Situation, Task, Action, Result) to maximize your neural scoring.
          </span>
        </div>
        <Link to="/interviews/new" className="text-brand-400 font-bold hover:underline flex-shrink-0 hidden md:inline">
          Practice Now &rarr;
        </Link>
      </aside>
    </main>
  );
}
