import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BrainCircuit, Sparkles, FileText, BarChart3, ArrowRight, CheckCircle,
  Briefcase, Mic, ShieldCheck, Zap, Award, Terminal, Flame, Compass,
  Sword, Target, ChevronRight, Activity, Cpu, Star, Layers,
  Volume2, Play, Code2, Users, Check, HelpCircle, ChevronDown,
  Menu, X, Globe
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import ThemeToggle from '@/components/common/ThemeToggle';
import ParticleCanvas from '@/components/ui/ParticleCanvas';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card from '@/components/ui/Card';
import AssessynLogo from '@/components/common/AssessynLogo';
import LandingNavbar from '@/components/navigation/LandingNavbar';
import { ShurikenIcon, KunaiIcon, KatanaIcon, ScrollIcon, DojoIcon } from '@/components/ui/ShinobiIcons';

const MOCK_CATEGORIES = [
  {
    id: 'sysdesign',
    label: 'System Design',
    question: 'How do you design a real-time collaborative code editor supporting 50k concurrent users with CRDTs and WebSocket failover?',
    candidateAnswer: 'I would use Yjs CRDTs over distributed WebSocket clusters, partitioning channels via Redis Pub/Sub with persistent raft logs in ScyllaDB.',
    score: 98,
    metrics: { clarity: '99%', technicalDepth: '98%', speed: '1.2s' },
  },
  {
    id: 'concurrency',
    label: 'Concurrency & Go',
    question: 'How do you prevent goroutine leaks and race conditions in high-throughput worker pool pipelines using context cancellation?',
    candidateAnswer: 'I bind all spawned worker routines to parent context cancellation channels, using sync.WaitGroup and bounded buffered channels.',
    score: 96,
    metrics: { clarity: '95%', technicalDepth: '97%', speed: '0.9s' },
  },
  {
    id: 'behavioral',
    label: 'STAR Behavioral',
    question: 'Describe a production outage where you had to push a critical patch under strict SLA constraints without staging verification.',
    candidateAnswer: 'During a Redis sentinel split-brain incident, I spearheaded our containment protocol by isolating failing replicas and triggering blue-green fallback.',
    score: 95,
    metrics: { clarity: '98%', technicalDepth: '92%', speed: '1.4s' },
  },
];

const BENTO_FEATURES = [
  {
    title: 'Surgical ATS Resume Deconstruction',
    desc: 'Deep semantic analysis extracts and parses your real repository contributions, framework proficiencies, and architectural achievements.',
    badge: 'Semantic Intelligence',
    colSpan: 'lg:col-span-7',
    gradient: 'from-brand-500/10 to-violet-500/10',
    type: 'resume',
  },
  {
    title: 'Sub-Second Voice Transcription',
    desc: 'Speak naturally. Our speech-to-text pipeline streams your verbal answers live with zero lag and audio noise reduction.',
    badge: 'Live Audio HUD',
    colSpan: 'lg:col-span-5',
    gradient: 'from-emerald-500/10 to-teal-500/10',
    type: 'voice',
  },
  {
    title: 'Multi-Dimensional Score Matrix',
    desc: 'Instant diagnostic feedback across 6 core pillars: System Architecture, Algorithmic Rigor, Communication, STAR alignment, and Edge Cases.',
    badge: 'Deterministic Grading',
    colSpan: 'lg:col-span-5',
    gradient: 'from-amber-500/10 to-orange-500/10',
    type: 'matrix',
  },
  {
    title: 'Live Market Job Synchronization',
    desc: 'Synced directly with real job board postings. Generate targeted simulations matching the exact hiring criteria of top tier companies.',
    badge: 'Live Adzuna Sync',
    colSpan: 'lg:col-span-7',
    gradient: 'from-cyan-500/10 to-blue-500/10',
    type: 'jobs',
  },
];

const FAQS = [
  {
    q: 'Is Assessyn completely free to use?',
    a: 'Yes, 100% free. Assessyn uses Google Gemini 3.6 Flash without requiring credit cards or charging paywalls for interview simulations, resume parsing, or job board matches.',
  },
  {
    q: 'What is the Shinobi Meditative Soundscape & how does it help?',
    a: 'Each of our 5 elemental themes includes a custom-crafted, 100% royalty-free 30-second seamless meditative soundscape (such as Bamboo rain & Shakuhachi flute, Koto harp, and 432Hz/528Hz Solfeggio frequencies). Designed based on acoustic cognitive science to soothe interview anxiety and induce a calm, focused mindset. You can mute, adjust volume, or switch themes anytime via the floating Shinobi Sound Orb at the bottom-right.',
  },
  {
    q: 'How does the voice simulation work?',
    a: 'We leverage your browser’s high-precision Speech Recognition API with real-time streaming, allowing you to answer verbally under realistic hiring conditions with zero delay.',
  },
  {
    q: 'Can I generate questions for specific companies and roles?',
    a: 'Yes. You can paste any real job description, specify experience level (Entry to Lead/Executive), and link your resume so Gemini tailors questions directly to your history.',
  },
  {
    q: 'How does the theme switcher work?',
    a: 'Assessyn features 5 curated nature and shinobi themes (Shadow Shinobi, Forest Jade, Blood Maple, Night Sakura, Solar Blade) fully driven by dynamic CSS variables and interactive water-ripple canvas physics.',
  },
];

export default function LandingPage() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState(MOCK_CATEGORIES[0]);
  const [openFaq, setOpenFaq] = useState(null);

  const handleLogoClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-app text-primary overflow-x-hidden relative select-none">
      {/* ── GPU Particle & Touch Water Ripple Physics Canvas ──── */}
      <ParticleCanvas />

      {/* ── Innovative Floating Shinobi Capsule Navbar ─────────── */}
      <LandingNavbar />

      {/* ── 1. Hero Section ────────────────────────────────────── */}
      <section className="relative pt-36 pb-20 px-6 overflow-hidden">
        {/* Ambient glow mesh */}
        <div className="absolute top-28 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-brand-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-7 relative z-10">
          {/* Tagline Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/30 text-brand-300 text-xs font-bold shadow-sm"
          >
            <Sparkles className="w-4 h-4 text-brand-400" />
            <span>Assess Skills. Unlock Potential.</span>
            <span className="w-1 h-1 rounded-full bg-brand-400/60" />
            <span className="text-secondary font-mono text-[11px] font-normal">Zen Meditative Dojo Audio</span>
          </motion.div>

          {/* Main Display Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-display font-black text-white leading-[1.08] tracking-tight"
          >
            Precision AI Simulation for <br />
            <span className="gradient-text">High-Stakes Interviews</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-sm sm:text-lg text-secondary max-w-2xl mx-auto leading-relaxed font-normal"
          >
            Train with an intelligent, multi-modal AI interviewer. Master real-time verbal answers, complex architectural dilemmas, and instant diagnostic scorecards.
          </motion.p>

          {/* Action CTAs with Assassin Shadow Backdrop */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative pt-4 flex flex-col items-center justify-center"
          >


            {/* Buttons Group */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10 w-full sm:w-auto">
              <Link to="/register" className="w-full sm:w-auto">
                <Button variant="primary" size="lg" icon={KatanaIcon} className="w-full sm:w-auto text-sm px-8">
                  <span>Start Free Mock Interview</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <Link to="/jobs" className="w-full sm:w-auto">
                <Button variant="secondary" size="lg" icon={KunaiIcon} className="w-full sm:w-auto text-sm px-8">
                  <span>Explore Matched Jobs</span>
                </Button>
              </Link>
            </div>
          </motion.div>

          {/* Guarantees */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-secondary pt-2">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> 100% Free Open Platform
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-brand-400" /> Real-Time Voice Waveform Stream
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-cyan-400" /> Powered by Gemini 3.6 Flash
            </span>
          </div>
        </div>

        {/* ── 2. Interactive Live Simulation Playground ───────────── */}
        <div id="simulator" className="max-w-5xl mx-auto mt-16 relative z-10">
          <div className="card-glass p-6 sm:p-8 rounded-3xl border border-subtle shadow-2xl space-y-6">
            {/* Category Selector Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-subtle">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-wider text-white">Live AI Simulator Arena</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {MOCK_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveTab(cat)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${activeTab.id === cat.id
                      ? 'bg-brand-500/20 text-brand-300 border border-brand-500/40 shadow-sm'
                      : 'bg-surface text-secondary border border-subtle hover:text-white'
                      }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Active Challenge HUD Prompt */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <span className="text-[11px] font-mono text-brand-300 font-bold flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5" /> AI Interviewer Prompt:
                  </span>
                  <p className="text-sm sm:text-base text-white font-medium bg-surface p-4 rounded-2xl border border-subtle leading-relaxed">
                    &ldquo;{activeTab.question}&rdquo;
                  </p>
                </div>

                {/* Candidate Voice Transcription */}
                <div className="p-4 rounded-2xl bg-surface border border-subtle space-y-2">
                  <div className="flex items-center justify-between text-xs text-secondary">
                    <span className="flex items-center gap-1.5 text-brand-400 font-bold">
                      <Mic className="w-3.5 h-3.5 text-red-400 animate-pulse" /> Live Speech Transcription
                    </span>
                    <span className="font-mono text-emerald-400 font-semibold">Streaming 60fps</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 font-mono italic leading-relaxed">
                    &ldquo;{activeTab.candidateAnswer}&rdquo;
                  </p>
                </div>

                {/* Real-Time Diagnostic Scorecard */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                  <div className="p-3 rounded-2xl bg-surface border border-subtle text-center">
                    <span className="text-[10px] text-secondary font-bold uppercase tracking-wider block">AI Readiness</span>
                    <span className="text-lg font-mono font-black text-emerald-400">{activeTab.score}%</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-surface border border-subtle text-center">
                    <span className="text-[10px] text-secondary font-bold uppercase tracking-wider block">Clarity Score</span>
                    <span className="text-lg font-mono font-black text-brand-300">{activeTab.metrics.clarity}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-surface border border-subtle text-center">
                    <span className="text-[10px] text-secondary font-bold uppercase tracking-wider block">Tech Depth</span>
                    <span className="text-lg font-mono font-black text-violet-400">{activeTab.metrics.technicalDepth}</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-surface border border-subtle text-center">
                    <span className="text-[10px] text-secondary font-bold uppercase tracking-wider block">Latency</span>
                    <span className="text-lg font-mono font-black text-cyan-400">{activeTab.metrics.speed}</span>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* ── 3. High-Impact Bento Grid Capabilities ─────────────── */}
      <section id="features" className="py-24 px-6 relative z-10">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <span className="badge badge-brand">Precision Architecture</span>
            <h2 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight">
              Engineered to make you <span className="gradient-text">unbeatable</span>
            </h2>
            <p className="text-secondary text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
              Every feature is built around the modern hiring rubric. Automated ATS parsing, realistic voice pressure, and instant deterministic analytics.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {BENTO_FEATURES.map((bento, idx) => (
              <motion.article
                key={bento.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className={`card p-7 sm:p-8 rounded-3xl ${bento.colSpan} bg-gradient-to-br ${bento.gradient} border border-subtle hover:border-brand-500/50 transition-all duration-300 flex flex-col justify-between space-y-6 group`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-surface border border-subtle text-secondary">
                    {bento.badge}
                  </span>
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl sm:text-2xl font-display font-bold text-white group-hover:text-brand-300 transition-colors">
                    {bento.title}
                  </h3>
                  <p className="text-secondary text-xs sm:text-sm leading-relaxed">
                    {bento.desc}
                  </p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* ── 4. Comparison Table: Traditional vs Assessyn ───────── */}
      <section className="py-20 px-6 bg-surface/50 border-y border-subtle relative z-10">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="badge badge-brand">Comparative Advantage</span>
            <h2 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight">
              Traditional Prep vs. Assessyn AI
            </h2>
            <p className="text-secondary text-xs sm:text-sm">
              Why memorizing generic flashcards fails in modern technical evaluations.
            </p>
          </div>

          <div className="card rounded-3xl overflow-hidden border border-subtle">
            <div className="grid grid-cols-3 p-4 sm:p-6 bg-surface border-b border-subtle text-xs font-bold text-secondary uppercase tracking-wider">
              <span>Capability</span>
              <span className="text-slate-500">Generic Interview Prep</span>
              <span className="text-brand-300">Assessyn AI Studio</span>
            </div>

            <div className="divide-y divide-subtle text-xs sm:text-sm">
              {[
                { feature: 'Role-Specific Question Formulation', old: 'Generic LeetCode lists', modern: 'Targeted to JD and Resume' },
                { feature: 'Real-Time Voice Speech Stream', old: 'No verbal practice', modern: 'Live Speech-to-Text HUD' },
                { feature: 'Granular STAR Evaluation', old: 'Manual guesswork', modern: 'Automated Diagnostic Matrix' },
                { feature: 'Live Job Board Synchronization', old: 'Disconnected', modern: 'Direct Adzuna Job Sync' },
                { feature: 'Cost & Access', old: '$49 – $199/month subscriptions', modern: '100% Free Unconditional' },
              ].map((row, i) => (
                <div key={i} className="grid grid-cols-3 p-4 sm:p-5 items-center hover:bg-surface-hover transition-colors">
                  <span className="font-semibold text-white">{row.feature}</span>
                  <span className="text-slate-500">{row.old}</span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1.5">
                    <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    {row.modern}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 4.5. Assessyn Pro Ninja (₹299/mo) Showcase ─────────── */}
      <section className="py-16 px-6 relative z-10">
        <div className="max-w-5xl mx-auto card-glass p-8 sm:p-12 rounded-3xl border border-brand-500/40 relative overflow-hidden shadow-2xl">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/40 text-xs font-mono font-bold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>UNLIMITED 5-MODEL MULTI-LLM SUITE</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-display font-black text-white">
                Assessyn Pro Ninja — ₹299 / Month
              </h2>
              <p className="text-xs sm:text-sm font-mono text-secondary max-w-xl">
                Unlock custom API keys for Gemini, GPT-4o, Claude 3.5, Groq, and DeepSeek with intelligent auto-failover, AI Resume Restructuring for target JDs, portfolio architectures, and time-filtered fresh job radar.
              </p>
            </div>

            <div className="flex flex-col items-center gap-3 flex-shrink-0">
              <Link to="/pricing">
                <Button variant="primary" size="lg" icon={KatanaIcon} className="px-8 font-bold">
                  <span>Explore Pro Plans (₹299/mo)</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
              <span className="text-[11px] font-mono text-secondary">PayU Production Secured · Cancel Anytime</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 5. Frequently Asked Questions Accordion ────────────── */}
      <section id="faqs" className="py-24 px-6 relative z-10">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <span className="badge badge-brand">Questions & Answers</span>
            <h2 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={i} className="card rounded-2xl overflow-hidden border border-subtle">
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left font-bold text-sm sm:text-base text-white hover:bg-surface-hover transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-secondary transition-transform duration-200 ${isOpen ? 'rotate-180 text-brand-300' : ''}`} />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden border-t border-subtle bg-surface"
                      >
                        <div className="p-5 text-xs sm:text-sm text-secondary leading-relaxed">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 6. Final Callout Portal ────────────────────────────── */}
      <section className="py-24 px-6 relative z-10">
        <div className="max-w-4xl mx-auto card-glass p-10 sm:p-14 text-center rounded-3xl relative overflow-hidden border border-brand-500/40 shadow-2xl">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-brand-500/20 rounded-full blur-3xl pointer-events-none" />

          <h2 className="text-3xl sm:text-5xl font-display font-black text-white mb-4 relative z-10 tracking-tight">
            Ready to Unlock Your Potential?
          </h2>

          <p className="text-secondary text-xs sm:text-base max-w-lg mx-auto mb-8 relative z-10 leading-relaxed">
            Join thousands of engineers and professionals training with assassin precision to conquer their next hiring round.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <Link to="/register" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" icon={ShurikenIcon} className="w-full sm:w-auto px-9 text-sm">
                <span>Enter Training Arena Free</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 7. Footer ───────────────────────────────────────────── */}
      <footer className="py-10 px-6 border-t border-subtle text-xs text-secondary relative z-10 pb-20 sm:pb-12">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center text-center gap-3.5">
          <button
            type="button"
            onClick={handleLogoClick}
            className="flex items-center gap-3 cursor-pointer hover:opacity-90 transition-opacity"
          >
            <AssessynLogo className="w-8 h-8" showText={true} />
          </button>
          <div className="text-secondary text-xs font-mono">
            &copy; {new Date().getFullYear()} Assessyn AI Studio &bull; Precision Engineered &bull; All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
