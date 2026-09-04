import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Briefcase, FileText, Sliders, Sparkles,
  ChevronRight, ChevronLeft, Check, Target, Zap,
  Building2, Layers, Cpu, Compass, ShieldCheck, Clock
} from 'lucide-react';
import { interviewAPI, resumeAPI } from '@/services/api';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { DojoIcon, KatanaIcon, ShurikenIcon, ScrollIcon } from '@/components/ui/ShinobiIcons';

const STEPS = [
  { id: 0, title: 'Position Specs', sub: 'Role & Description' },
  { id: 1, title: 'Calibration', sub: 'Tier & Categories' },
  { id: 2, title: 'Resume Dossier', sub: 'Semantic Grounding' },
  { id: 3, title: 'Deploy Arena', sub: 'Review & Launch' },
];

const EXPERIENCE_LEVELS = [
  { value: 'entry', label: 'Entry Level', sub: '0–2 years', tag: 'NOVICE' },
  { value: 'mid', label: 'Mid Level', sub: '3–5 years', tag: 'OPERATIVE' },
  { value: 'senior', label: 'Senior Tier', sub: '5–8 years', tag: 'VETERAN' },
  { value: 'lead', label: 'Lead / Staff', sub: '8+ years', tag: 'MASTER' },
  { value: 'executive', label: 'Executive', sub: 'Director / VP', tag: 'COMMANDER' },
];

const QUESTION_TYPES = [
  { value: 'technical', label: 'Technical Deep-Dive', desc: 'Algorithms, Data Structures & Concurrency' },
  { value: 'behavioral', label: 'STAR Behavioral', desc: 'Leadership, Conflict & High-Stakes Dilemmas' },
  { value: 'situational', label: 'System Architecture', desc: 'Scalability, Microservices & Reliability' },
  { value: 'hr', label: 'Culture & Motivation', desc: 'Values, Team Dynamics & Strategic Fit' },
];

export default function NewInterviewPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [selectedTypes, setSelectedTypes] = useState(['technical', 'behavioral']);
  const [experienceLevel, setExperienceLevel] = useState('mid');
  const [isCreating, setIsCreating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { numberOfQuestions: 5 }
  });

  const jobTitle = watch('jobTitle');
  const jobDescription = watch('jobDescription');
  const company = watch('company');
  const numberOfQuestions = watch('numberOfQuestions') || 5;

  useEffect(() => {
    resumeAPI.getAll()
      .then(({ data }) => {
        const resumeList = data?.data?.resumes || data?.resumes || (Array.isArray(data?.data) ? data.data : []);
        setResumes(Array.isArray(resumeList) ? resumeList.filter(Boolean) : []);
        const defaultResume = resumeList.find((r) => r?.isDefault);
        if (defaultResume) setSelectedResume(defaultResume._id);
      })
      .catch(() => {});
  }, []);

  const toggleType = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type)
        ? prev.length > 1 ? prev.filter((t) => t !== type) : prev
        : [...prev, type]
    );
  };

  const onSubmit = async (formData) => {
    setIsCreating(true);
    try {
      const { data: createData } = await interviewAPI.create({
        ...formData,
        experienceLevel,
        questionTypes: selectedTypes,
        resumeId: selectedResume,
      });
      const interviewId = createData?.data?.interview?._id || createData?.interview?._id;
      if (!interviewId) throw new Error('Interview ID missing in server response');

      setIsGenerating(true);
      toast.loading('Gemini 3.6 Neural Core is forging role questions...', { id: 'gen' });

      await interviewAPI.generateQuestions(interviewId);

      toast.success('Simulation Arena calibrated! Entering arena...', { id: 'gen' });
      navigate(`/interviews/${interviewId}/session`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to initialize session arena', { id: 'gen' });
    } finally {
      setIsCreating(false);
      setIsGenerating(false);
    }
  };

  const canProceed = () => {
    if (step === 0) return jobTitle?.trim().length > 0 && jobDescription?.trim().length >= 50;
    return true;
  };

  return (
    <main className="max-w-4xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* ── 1. Tactical Command Header ──────────────────────────── */}
      <header className="p-6 sm:p-8 rounded-3xl bg-surface/90 backdrop-blur-2xl border border-subtle relative overflow-hidden shadow-2xl">
        {/* Top Katana Sheen */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-400/50 to-transparent pointer-events-none" />

        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-brand-500/15 border border-brand-500/30 text-brand-300 text-xs font-mono font-bold uppercase tracking-wider">
              <KatanaIcon className="w-4 h-4 text-brand-400" />
              <span>SIMULATION CALIBRATOR // MULTI-MODAL ARENA</span>
            </span>
            <span className="text-xs font-mono text-secondary px-2.5 py-1 rounded-xl bg-surface border border-subtle hidden sm:inline">
              Gemini 3.6 Neural Engine
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight leading-tight">
            Configure Mock Arena
          </h1>

          <p className="text-secondary text-xs sm:text-sm leading-relaxed max-w-2xl font-medium">
            Define target role parameters, experience calibration, and ground questions in your verified resume dossier.
          </p>
        </div>
      </header>

      {/* ── 2. Stepper Progress HUD ─────────────────────────────── */}
      <nav aria-label="Wizard Steps" className="p-4 sm:p-5 rounded-2xl bg-surface/80 backdrop-blur-xl border border-subtle shadow-md">
        <ol className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {STEPS.map((s, i) => (
            <li
              key={s.id}
              className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all ${
                i === step
                  ? 'bg-brand-500/15 border-brand-500/40 shadow-sm'
                  : i < step
                  ? 'bg-surface border-emerald-500/30 text-emerald-400'
                  : 'bg-surface border-subtle text-slate-500'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-black flex-shrink-0 ${
                  i < step
                    ? 'bg-emerald-500 text-white'
                    : i === step
                    ? 'bg-accent text-white shadow-sm'
                    : 'bg-surface text-slate-500 border border-subtle'
                }`}
              >
                {i < step ? <Check className="w-3.5 h-3.5" /> : `0${i + 1}`}
              </div>
              <div className="min-w-0">
                <p className={`text-xs font-bold leading-tight truncate ${i === step ? 'text-white' : i < step ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {s.title}
                </p>
                <p className="text-[10px] text-secondary font-mono truncate hidden sm:block">
                  {s.sub}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </nav>

      {/* ── 3. Step Panels Form ─────────────────────────────────── */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <AnimatePresence mode="wait">
          {/* ── Step 0: Position Specs ──────────────────────────── */}
          {step === 0 && (
            <motion.section
              key="step0"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="p-6 sm:p-8 rounded-3xl bg-surface/90 backdrop-blur-2xl border border-subtle space-y-6 shadow-xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 border-b border-subtle">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-brand-500/15 border border-brand-500/30 rounded-2xl text-brand-400 flex-shrink-0">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-display font-black text-white">
                      Target Position Specifications
                    </h2>
                    <p className="text-xs text-secondary font-mono mt-0.5">Define target role and technical domain</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-extrabold px-2.5 py-1 rounded-lg bg-surface border border-subtle text-secondary uppercase">
                  Phase 01 / 04
                </span>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-mono font-extrabold uppercase tracking-wider text-secondary mb-2">
                    Target Job Title *
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-2xl bg-surface border border-subtle text-white placeholder-secondary text-sm focus:outline-none focus:border-brand-500/60 font-medium transition-all"
                    placeholder="e.g. Senior Full Stack Engineer, Cloud Solutions Architect..."
                    {...register('jobTitle', { required: 'Job title is required' })}
                  />
                  {errors.jobTitle && (
                    <p className="text-rose-400 text-xs font-mono mt-1.5">{errors.jobTitle.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-mono font-extrabold uppercase tracking-wider text-secondary mb-2">
                    Target Company / Organization (Optional)
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 rounded-2xl bg-surface border border-subtle text-white placeholder-secondary text-sm focus:outline-none focus:border-brand-500/60 font-medium transition-all"
                    placeholder="e.g. Google, Stripe, Microsoft, OpenAI, Stealth Startup..."
                    {...register('company')}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-mono font-extrabold uppercase tracking-wider text-secondary">
                      Job Description Specifications *
                    </label>
                    <span className="text-[11px] font-mono text-secondary">
                      (min. 50 chars &bull; <strong className="text-white">{jobDescription?.length ?? 0}</strong>/5000)
                    </span>
                  </div>
                  <textarea
                    rows={6}
                    className="w-full p-4 rounded-2xl bg-surface border border-subtle text-white placeholder-secondary text-xs sm:text-sm focus:outline-none focus:border-brand-500/60 font-medium transition-all leading-relaxed"
                    placeholder="Paste the job requirements, tech stack details, and core responsibilities. AI synthesizes semantic requirements to generate scenario-grounded interview dilemmas..."
                    {...register('jobDescription', {
                      required: 'Job description is required',
                      minLength: { value: 50, message: 'Please provide at least 50 characters of job details' },
                    })}
                  />
                  {errors.jobDescription && (
                    <p className="text-rose-400 text-xs font-mono mt-1.5">{errors.jobDescription.message}</p>
                  )}
                </div>
              </div>
            </motion.section>
          )}

          {/* ── Step 1: Calibration ─────────────────────────────── */}
          {step === 1 && (
            <motion.section
              key="step1"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="p-6 sm:p-8 rounded-3xl bg-surface/90 backdrop-blur-2xl border border-subtle space-y-6 shadow-xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 border-b border-subtle">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-violet-500/15 border border-violet-500/30 rounded-2xl text-violet-400 flex-shrink-0">
                    <Sliders className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-display font-black text-white">
                      Interview Calibration & Formats
                    </h2>
                    <p className="text-xs text-secondary font-mono mt-0.5">Configure seniority level and question depth</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-extrabold px-2.5 py-1 rounded-lg bg-surface border border-subtle text-secondary uppercase">
                  Phase 02 / 04
                </span>
              </div>

              <div className="space-y-6">
                {/* Experience Tier Selector */}
                <div>
                  <label className="block text-xs font-mono font-extrabold uppercase tracking-wider text-secondary mb-3">
                    Seniority Calibration Tier
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {EXPERIENCE_LEVELS.map(({ value, label, sub, tag }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setExperienceLevel(value)}
                        className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer relative overflow-hidden group ${
                          experienceLevel === value
                            ? 'border-brand-500 bg-brand-500/15 text-white shadow-md'
                            : 'border-subtle bg-surface hover:border-slate-600 text-secondary'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className={`text-xs font-bold ${experienceLevel === value ? 'text-white' : 'text-slate-300'}`}>
                            {label}
                          </p>
                          <span className={`text-[9px] font-mono font-extrabold px-1.5 py-0.5 rounded ${
                            experienceLevel === value ? 'bg-brand-500/30 text-brand-300' : 'bg-surface border border-subtle text-slate-500'
                          }`}>
                            {tag}
                          </span>
                        </div>
                        <p className="text-[10.5px] text-secondary font-mono">{sub}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Question Type Toggles */}
                <div>
                  <label className="block text-xs font-mono font-extrabold uppercase tracking-wider text-secondary mb-3">
                    Assessment Domains (Select at least 1)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {QUESTION_TYPES.map(({ value, label, desc }) => {
                      const isSelected = selectedTypes.includes(value);
                      return (
                        <button
                          key={value}
                          type="button"
                          onClick={() => toggleType(value)}
                          className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3.5 ${
                            isSelected
                              ? 'bg-brand-500/15 border-brand-500/40 text-white shadow-sm'
                              : 'bg-surface border-subtle hover:border-slate-700 text-secondary'
                          }`}
                        >
                          <div className={`w-5 h-5 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            isSelected ? 'bg-brand-500 text-white' : 'border border-subtle bg-surface'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5" />}
                          </div>
                          <div className="min-w-0">
                            <p className={`text-xs font-bold leading-snug ${isSelected ? 'text-white' : 'text-slate-300'}`}>
                              {label}
                            </p>
                            <p className="text-[10.5px] text-secondary mt-0.5 leading-relaxed font-mono">
                              {desc}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Number of Questions Slider */}
                <div className="p-5 rounded-2xl bg-surface border border-subtle space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-white block">
                        Simulation Question Count
                      </span>
                      <span className="text-[11px] text-secondary font-mono">Approx. {numberOfQuestions * 3} minutes total runtime</span>
                    </div>
                    <span className="text-base font-mono font-black text-brand-400 px-3 py-1 rounded-xl bg-brand-500/15 border border-brand-500/30">
                      {numberOfQuestions} Questions
                    </span>
                  </div>
                  <input
                    type="range"
                    min="3"
                    max="12"
                    step="1"
                    className="w-full accent-[var(--accent-primary)] cursor-pointer h-2 bg-surface rounded-lg"
                    {...register('numberOfQuestions', { valueAsNumber: true })}
                  />
                  <div className="flex justify-between text-[10px] font-mono text-secondary">
                    <span>3 (RAPID WARMUP)</span>
                    <span>7 (STANDARD MOCK)</span>
                    <span>12 (COMPREHENSIVE ARENA)</span>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {/* ── Step 2: Resume Context ──────────────────────────── */}
          {step === 2 && (
            <motion.section
              key="step2"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="p-6 sm:p-8 rounded-3xl bg-surface/90 backdrop-blur-2xl border border-subtle space-y-6 shadow-xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 border-b border-subtle">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-2xl text-emerald-400 flex-shrink-0">
                    <ScrollIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-display font-black text-white">
                      Link Resume Dossier
                    </h2>
                    <p className="text-xs text-secondary font-mono mt-0.5">Ground AI inquiries in your verified career history</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-extrabold px-2.5 py-1 rounded-lg bg-surface border border-subtle text-secondary uppercase">
                  Phase 03 / 04
                </span>
              </div>

              <div className="space-y-3.5">
                {/* No Resume Option */}
                <button
                  type="button"
                  onClick={() => setSelectedResume(null)}
                  className={`w-full p-4 sm:p-5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    !selectedResume
                      ? 'border-brand-500 bg-brand-500/15 text-white shadow-sm'
                      : 'border-subtle bg-surface hover:border-slate-700 text-secondary'
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="p-2.5 rounded-xl bg-surface border border-subtle text-secondary flex-shrink-0">
                      <Target className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white leading-tight">General Role Practice (No Resume)</p>
                      <p className="text-xs text-secondary mt-0.5 font-mono">Questions formulated strictly from position specifications</p>
                    </div>
                  </div>
                  {!selectedResume && (
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-400 shadow-brand flex-shrink-0" />
                  )}
                </button>

                {/* Uploaded Resumes */}
                {resumes.map((r) => {
                  const isSelected = selectedResume === r._id;
                  return (
                    <button
                      key={r._id}
                      type="button"
                      onClick={() => setSelectedResume(r._id)}
                      className={`w-full p-4 sm:p-5 rounded-2xl border text-left transition-all cursor-pointer flex items-center justify-between gap-4 ${
                        isSelected
                          ? 'border-brand-500 bg-brand-500/15 text-white shadow-sm'
                          : 'border-subtle bg-surface hover:border-slate-700 text-secondary'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                          isSelected ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30' : 'bg-surface border border-subtle text-slate-500'
                        }`}>
                          <ScrollIcon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0 space-y-1">
                          <p className="text-sm font-bold text-white truncate">{r.originalName}</p>
                          <div className="flex items-center gap-2 text-xs font-mono text-secondary">
                            <span className="text-[11px] text-emerald-400 font-bold">
                              {r.parseStatus === 'parsed' ? 'Semantic Profile Extracted' : 'Ready'}
                            </span>
                            {r.isDefault && (
                              <span className="text-[9.5px] font-extrabold px-1.5 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30 uppercase">
                                Default Dossier
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {isSelected && (
                        <span className="w-2.5 h-2.5 rounded-full bg-brand-400 shadow-brand flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.section>
          )}

          {/* ── Step 3: Deploy Arena ────────────────────────────── */}
          {step === 3 && (
            <motion.section
              key="step3"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
              className="p-6 sm:p-8 rounded-3xl bg-surface/90 backdrop-blur-2xl border border-subtle space-y-6 shadow-xl relative overflow-hidden"
            >
              <div className="flex items-center justify-between pb-4 border-b border-subtle">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-500/15 border border-amber-500/30 rounded-2xl text-amber-400 flex-shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-display font-black text-white">
                      Review & Deploy Arena
                    </h2>
                    <p className="text-xs text-secondary font-mono mt-0.5">Verify parameters before initializing AI simulator</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono font-extrabold px-2.5 py-1 rounded-lg bg-surface border border-subtle text-secondary uppercase">
                  Phase 04 / 04
                </span>
              </div>

              {/* Review Overview Table */}
              <div className="p-5 rounded-2xl bg-surface border border-subtle space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-2.5 border-b border-subtle">
                  <span className="text-secondary uppercase">Target Role</span>
                  <span className="font-bold text-white font-sans text-sm">{jobTitle}</span>
                </div>
                <div className="flex items-center justify-between pb-2.5 border-b border-subtle">
                  <span className="text-secondary uppercase">Target Company</span>
                  <span className="font-bold text-white">{company || 'Universal Practice Arena'}</span>
                </div>
                <div className="flex items-center justify-between pb-2.5 border-b border-subtle">
                  <span className="text-secondary uppercase">Seniority Level</span>
                  <span className="font-bold text-brand-300 capitalize">{experienceLevel} Tier</span>
                </div>
                <div className="flex items-center justify-between pb-2.5 border-b border-subtle">
                  <span className="text-secondary uppercase">Question Challenge</span>
                  <span className="font-bold text-emerald-400">{numberOfQuestions} Adaptive Scenarios</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-secondary uppercase">Resume Grounding</span>
                  <span className="font-bold text-white">
                    {resumes.find((r) => r._id === selectedResume)?.originalName || 'No resume linked'}
                  </span>
                </div>
              </div>

              {/* Neural Synthesis Banner */}
              <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-start gap-3.5">
                <div className="p-2 rounded-xl bg-brand-500/20 text-brand-400 flex-shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
                <p className="text-xs text-secondary leading-relaxed font-mono">
                  <strong className="text-white">GEMINI 3.6 NEURAL SYNTHESIS:</strong> Real-time voice simulation with live response transcription and comprehensive feedback calibrated after final answer submission.
                </p>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* ── 4. Navigation Action Buttons ─────────────────────── */}
        <footer className="flex items-center justify-between pt-2">
          <Button
            type="button"
            variant="secondary"
            size="md"
            icon={ChevronLeft}
            onClick={() => setStep((s) => s - 1)}
            disabled={step === 0}
            className={`font-bold ${step === 0 ? 'invisible' : ''}`}
          >
            <span>Previous Phase</span>
          </Button>

          {step < STEPS.length - 1 ? (
            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
              className="font-bold px-7"
            >
              <span>Next Phase</span>
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              type="submit"
              variant="primary"
              size="lg"
              icon={KatanaIcon}
              disabled={isCreating || isGenerating}
              isLoading={isCreating || isGenerating}
              className="font-bold px-8"
            >
              <span>Deploy Simulation Arena</span>
            </Button>
          )}
        </footer>
      </form>
    </main>
  );
}
