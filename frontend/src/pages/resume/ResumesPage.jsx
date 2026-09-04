import { useCallback, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, Trash2, Star, Loader2, CheckCircle,
  AlertCircle, ExternalLink, ChevronDown, ChevronUp,
  Cpu, Briefcase, Code2, GraduationCap, RefreshCw, X, ShieldCheck,
  CheckCircle2, Sparkles, Layers, FileCode
} from 'lucide-react';
import { resumeAPI } from '@/services/api';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { ConfirmDeleteModal } from '@/components/shared';
import ShinobiLoader from '@/components/ui/ShinobiLoader';
import { ScrollIcon, KatanaIcon, ShurikenIcon, DojoIcon } from '@/components/ui/ShinobiIcons';

const PARSE_STATUS = {
  pending: { label: 'PROCESSING', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30', dot: 'bg-amber-400' },
  parsed:  { label: 'SEMANTIC EXTRACTED', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', dot: 'bg-emerald-400' },
  failed:  { label: 'PARSE ERROR', color: 'bg-rose-500/15 text-rose-400 border-rose-500/30', dot: 'bg-rose-400' },
};

function ParsedSection({ icon: Icon, title, color, children }) {
  return (
    <div className="space-y-2">
      <div className={`flex items-center gap-2 text-xs font-mono font-extrabold uppercase tracking-wider ${color}`}>
        <Icon className="w-4 h-4" />
        <span>{title}</span>
      </div>
      {children}
    </div>
  );
}

function ReparseModal({ resume, jdInput, setJdInput, parsing, onConfirm, onClose }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !parsing) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [parsing, onClose]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 select-none font-sans">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={!parsing ? onClose : undefined}
        className="fixed inset-0 bg-black/85 backdrop-blur-md"
      />

      {/* Modal Dialog Box */}
      <motion.article
        initial={{ opacity: 0, scale: 0.94, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        className="w-full max-w-xl bg-[#0e0e1a] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-[0_25px_70px_rgba(0,0,0,0.95)] relative z-10 overflow-hidden space-y-5"
      >
        {/* Top Purple Edge Highlight */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-400/80 to-transparent pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-2xl bg-brand-500/15 text-brand-400 border border-brand-500/30 flex-shrink-0">
              <RefreshCw className={`w-5 h-5 ${parsing ? 'animate-spin' : ''}`} />
            </div>
            <div className="min-w-0">
              <h3 className="font-display font-black text-white text-base sm:text-lg tracking-tight">
                Re-scan against Job Description
              </h3>
              <p className="text-[11px] font-mono text-secondary truncate">
                Targeting: <span className="text-brand-300 font-semibold">{resume?.originalName}</span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={parsing}
            className="p-2 rounded-xl bg-white/5 border border-white/10 text-secondary hover:text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Description */}
        <p className="text-secondary text-xs sm:text-sm leading-relaxed font-sans">
          Paste a target job description below to extract high-relevance ATS keywords, missing competency pillars, and customized assessment vectors.
        </p>

        {/* Text Area */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-mono font-bold text-brand-300 uppercase tracking-wider">
            Job Specification / Requirements
          </label>
          <textarea
            rows={5}
            className="w-full p-4 rounded-2xl bg-[#090910] border border-white/10 text-white placeholder:text-white/30 text-xs sm:text-sm font-mono focus:outline-none focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/50 transition-all resize-none"
            placeholder="Paste targeted job specifications, role responsibilities, or required tech stack here..."
            value={jdInput}
            onChange={(e) => setJdInput(e.target.value)}
            disabled={parsing}
            autoFocus
          />
        </div>

        {/* Modal Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={parsing}
            className="font-bold text-xs px-4"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onConfirm}
            disabled={parsing || !jdInput.trim()}
            isLoading={parsing}
            icon={RefreshCw}
            className="font-bold text-xs px-5"
          >
            <span>{parsing ? 'Scanning Dossier...' : 'Re-Scan Dossier'}</span>
          </Button>
        </div>
      </motion.article>
    </div>,
    document.body
  );
}

function ParsedDataPanel({ resume, onOpenReparse }) {
  const raw = resume.parsedData;

  if (!raw) {
    return (
      <div className="mt-4 pt-4 border-t border-subtle">
        <p className="text-xs font-mono text-secondary text-center">
          Structured data not yet processed.{' '}
          <button
            type="button"
            onClick={() => onOpenReparse(resume)}
            className="text-brand-400 hover:text-brand-300 font-bold underline cursor-pointer ml-1"
          >
            Extract Semantic Profile &rarr;
          </button>
        </p>
      </div>
    );
  }

  // Handle both flat and nested schemas
  const d = raw.resume && (raw.resume.skills || raw.resume.experience || raw.resume.name) ? raw.resume : raw;
  const alignment = raw.target_alignment || d.target_alignment || null;
  const jd = raw.job_description || raw.jobDescription || d.job_description || d.jobDescription;

  return (
    <div className="mt-5 pt-5 border-t border-subtle space-y-5">
      {/* ── ATS & Job Description Intelligence Panel ── */}
      {alignment && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-[#121224] via-[#0d0d1a] to-[#0a0a14] border border-brand-500/30 shadow-xl space-y-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Header with Score & Fit Pill */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/10">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-brand-400 animate-pulse" />
                <span className="text-[11px] font-mono font-extrabold text-brand-400 uppercase tracking-wider">
                  ATS Match & Career Intelligence
                </span>
              </div>
              {alignment.target_role && (
                <p className="text-white text-sm font-bold tracking-tight">
                  Targeted: <span className="text-brand-300">{alignment.target_role}</span>
                </p>
              )}
            </div>

            {/* ATS Score & Rating Badge */}
            {alignment.ats_score !== undefined && alignment.ats_score !== null && (
              <div className="flex items-center gap-2.5">
                <div className="text-right">
                  <p className="text-[10px] font-mono text-secondary uppercase font-bold">ATS Score</p>
                  <p className="text-lg font-black font-display text-white">
                    <span className={alignment.ats_score >= 80 ? 'text-emerald-400' : alignment.ats_score >= 60 ? 'text-amber-400' : 'text-rose-400'}>
                      {alignment.ats_score}
                    </span>
                    <span className="text-xs text-secondary font-normal"> / 100</span>
                  </p>
                </div>
                {alignment.fit_rating && (
                  <span className={`text-[11px] font-mono font-bold px-3 py-1 rounded-xl border ${
                    alignment.fit_rating.toLowerCase().includes('strong')
                      ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                      : alignment.fit_rating.toLowerCase().includes('moderate')
                      ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                      : 'bg-rose-500/15 text-rose-400 border-rose-500/30'
                  }`}>
                    {alignment.fit_rating}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Executive Summary */}
          {alignment.summary && (
            <p className="text-xs text-slate-300 leading-relaxed font-sans bg-white/5 p-3 rounded-2xl border border-white/5">
              {alignment.summary}
            </p>
          )}

          {/* Matching Skills vs Missing Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {/* Matching Skills */}
            {Array.isArray(alignment.matching_skills) && alignment.matching_skills.length > 0 && (
              <div className="p-3 rounded-2xl bg-[#091510] border border-emerald-500/20 space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-emerald-400 uppercase">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Matching Strengths ({alignment.matching_skills.length})</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {alignment.matching_skills.map((s, i) => (
                    <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Missing Critical Skills */}
            {Array.isArray(alignment.missing_skills) && alignment.missing_skills.length > 0 && (
              <div className="p-3 rounded-2xl bg-[#1a0f12] border border-rose-500/20 space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-rose-400 uppercase">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Target Competency Gaps ({alignment.missing_skills.length})</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {alignment.missing_skills.map((s, i) => (
                    <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-300 border border-rose-500/30">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actionable Improvement Suggestions */}
          {Array.isArray(alignment.improvement_suggestions) && alignment.improvement_suggestions.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-brand-950/30 border border-brand-500/25 space-y-2">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-brand-300 uppercase">
                <ShieldCheck className="w-4 h-4 text-brand-400" />
                <span>Recommended Optimizations to Boost ATS Pass Rate:</span>
              </div>
              <ul className="space-y-1.5 pl-1">
                {alignment.improvement_suggestions.map((tip, i) => (
                  <li key={i} className="text-xs text-slate-300 flex items-start gap-2 leading-relaxed">
                    <span className="text-brand-400 font-bold font-mono mt-0.5">&bull;</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {d.name && (
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-secondary font-bold uppercase">Candidate Identified:</span>
          <span className="text-white font-black bg-brand-500/15 border border-brand-500/30 px-2.5 py-0.5 rounded-lg">
            {d.name}
          </span>
        </div>
      )}

      {/* Target Job Profile & Requirements if re-scanned against JD (fallback if alignment not present) */}
      {!alignment && jd && (jd.role || (Array.isArray(jd.required_skills) && jd.required_skills.length > 0)) && (
        <ParsedSection icon={Briefcase} title="Target Role Alignment" color="text-amber-400">
          <div className="p-3.5 rounded-2xl bg-surface border border-amber-500/20 text-xs space-y-2">
            {jd.role && (
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-secondary uppercase font-bold">Target Role:</span>
                <span className="text-amber-300 font-bold">{jd.role}</span>
              </div>
            )}
            {Array.isArray(jd.required_skills) && jd.required_skills.length > 0 && (
              <div>
                <span className="text-[10px] font-mono text-secondary uppercase block mb-1">Required Competencies:</span>
                <div className="flex flex-wrap gap-1">
                  {jd.required_skills.map((s, i) => (
                    <span key={i} className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/30">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </ParsedSection>
      )}

      {/* Skills */}
      {Array.isArray(d.skills) && d.skills.length > 0 && (
        <ParsedSection icon={Cpu} title="Technical Core & Frameworks" color="text-brand-400">
          <div className="flex flex-wrap gap-1.5 pt-1">
            {d.skills.map((s, i) => (
              <span
                key={i}
                className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-xl bg-surface border border-subtle text-brand-300 shadow-sm"
              >
                {s}
              </span>
            ))}
          </div>
        </ParsedSection>
      )}

      {/* Experience */}
      {Array.isArray(d.experience) && d.experience.length > 0 && (
        <ParsedSection icon={Briefcase} title="Career Chronology" color="text-cyan-400">
          <div className="space-y-2.5 pt-1">
            {d.experience.map((exp, i) => {
              const techList = exp.tech || exp.tech_stack || exp['tech stack'] || [];
              return (
                <div key={i} className="p-3.5 rounded-2xl bg-surface border border-subtle text-xs space-y-1.5">
                  <div className="flex justify-between items-start">
                    <p className="font-bold text-white">
                      {exp.role} {exp.company && <span className="text-secondary font-normal">&bull; {exp.company}</span>}
                    </p>
                    {exp.duration && <span className="text-[10px] font-mono text-secondary px-2 py-0.5 rounded bg-surface border border-subtle">{exp.duration}</span>}
                  </div>
                  {Array.isArray(techList) && techList.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {techList.map((t, j) => (
                        <span key={j} className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-surface text-slate-300 border border-subtle">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ParsedSection>
      )}

      {/* Projects */}
      {Array.isArray(d.projects) && d.projects.length > 0 && (
        <ParsedSection icon={Code2} title="Key Engineering Deliverables" color="text-emerald-400">
          <div className="space-y-2.5 pt-1">
            {d.projects.map((proj, i) => {
              const techList = proj['tech stack'] || proj.tech_stack || proj.tech || [];
              return (
                <div key={i} className="p-3.5 rounded-2xl bg-surface border border-subtle text-xs space-y-1.5">
                  <p className="font-bold text-white">{proj.title || 'Project'}</p>
                  {proj.description && <p className="text-secondary text-xs leading-relaxed">{proj.description}</p>}
                  {Array.isArray(techList) && techList.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {techList.map((t, j) => (
                        <span key={j} className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-md bg-surface text-emerald-300 border border-emerald-500/20">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ParsedSection>
      )}

      {/* Education */}
      {d.education && (
        <div className="text-xs font-mono p-3 rounded-2xl bg-surface border border-subtle flex items-center justify-between">
          <span className="text-secondary font-bold uppercase">Education / Credentials:</span>
          <span className="text-slate-200">{typeof d.education === 'string' ? d.education : JSON.stringify(d.education)}</span>
        </div>
      )}

      {/* Re-scan Trigger Button */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => onOpenReparse(resume)}
          className="inline-flex items-center gap-2 text-xs font-mono font-bold text-secondary hover:text-brand-300 transition-colors cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5 text-brand-400" />
          <span>Re-scan against Target Job Description</span>
        </button>
      </div>
    </div>
  );
}

export default function ResumesPage() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [expanded, setExpanded] = useState(null);

  // Deletion Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedResume, setSelectedResume] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Re-scan against Job Description Modal State
  const [reparseModalResume, setReparseModalResume] = useState(null);
  const [jdInput, setJdInput] = useState('');
  const [reparsing, setReparsing] = useState(false);

  const fetchResumes = () => {
    resumeAPI.getAll()
      .then(({ data }) => {
        const list = data?.data?.resumes || data?.resumes || (Array.isArray(data?.data) ? data.data : []);
        setResumes(Array.isArray(list) ? list.filter(Boolean) : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(fetchResumes, []);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (resumes.length >= 5) {
      toast.error('Maximum limit of 5 resumes reached. Please delete an existing resume before uploading a new one.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('resume', file);

    try {
      const { data } = await resumeAPI.upload(formData);
      const newResume = data?.data?.resume || data?.resume || (data?.data?._id ? data.data : null);
      if (newResume && newResume._id) {
        setResumes((prev) => [newResume, ...prev.filter((r) => r?._id !== newResume._id)]);
        toast.success(`"${file.name}" uploaded and parsed with AI! 🗡️`);
        setExpanded(newResume._id);
      } else {
        fetchResumes();
        toast.success(`"${file.name}" uploaded successfully! 🗡️`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [resumes.length]);

  const isAtLimit = resumes.length >= 5;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    },
    maxFiles: 1,
    disabled: uploading || isAtLimit,
  });

  const openDeleteModal = (resume) => {
    setSelectedResume(resume);
    setModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedResume) return;
    setDeleting(true);
    try {
      await resumeAPI.delete(selectedResume._id);
      setResumes((prev) => prev.filter((r) => r?._id !== selectedResume._id));
      if (expanded === selectedResume._id) setExpanded(null);
      toast.success('Resume dossier deleted successfully');
      setModalOpen(false);
      setSelectedResume(null);
    } catch {
      toast.error('Failed to delete resume dossier');
    } finally {
      setDeleting(false);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await resumeAPI.setDefault(id);
      setResumes((prev) => prev.map((r) => ({ ...r, isDefault: r?._id === id })));
      toast.success('Primary resume updated');
    } catch {
      toast.error('Failed to update default');
    }
  };

  const handleReparse = async (id, jobDescription) => {
    const toastId = toast.loading('Gemini is parsing semantic attributes...');
    try {
      const { data } = await resumeAPI.parse(id, jobDescription);
      const parsedData = data?.data?.parsedData || data?.parsedData;
      setResumes((prev) =>
        prev.map((r) => r?._id === id ? { ...r, parsedData, isParsed: true, parseStatus: 'parsed' } : r)
      );
      setExpanded(id);
      toast.success('Profile refreshed!', { id: toastId });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Parsing failed.', { id: toastId });
      throw err;
    }
  };

  if (loading) {
    return (
      <ShinobiLoader
        tag="INTELLIGENCE DOSSIER // ATS SCANNER"
        title="Loading Resume Profiles..."
        subtitle="Extracting semantic career vectors and ATS parsing metrics..."
      />
    );
  }

  return (
    <main className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* ── 1. Tactical Header Banner ──────────────────────────── */}
      <header className="p-6 sm:p-8 lg:p-10 rounded-3xl bg-surface/90 backdrop-blur-2xl border border-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden shadow-2xl">
        {/* Top Katana Edge Sheen */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-400/50 to-transparent pointer-events-none" />

        <div className="space-y-2.5 max-w-2xl relative z-10">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-brand-500/15 border border-brand-500/30 text-brand-300 text-xs font-mono font-bold uppercase tracking-wider">
              <ScrollIcon className="w-4 h-4 text-brand-400" />
              <span>INTELLIGENCE DOSSIER // ATS SCANNER</span>
            </span>
            <span className="text-xs font-mono text-secondary px-2.5 py-1 rounded-xl bg-surface border border-subtle font-semibold">
              {resumes.length} Dossiers On File
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight leading-tight">
            Warrior Resume Dossiers
          </h1>

          <p className="text-secondary text-xs sm:text-sm leading-relaxed max-w-xl font-medium">
            Upload and scan your resume dossier so Assessyn AI tailors mock interview arenas and job matches to your verified background.
          </p>
        </div>

        <div className="flex-shrink-0 relative z-10">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-surface border border-subtle text-xs font-mono text-secondary">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-white font-bold">ATS Semantic V2</span>
          </span>
        </div>
      </header>

      {/* ── 2. Shinobi Dropzone HUD ───────────────────────────── */}
      <section aria-label="Upload Resume Dossier">
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all duration-300 bg-surface/80 backdrop-blur-2xl relative overflow-hidden shadow-xl
            ${isAtLimit
              ? 'border-amber-500/40 bg-amber-500/5 cursor-not-allowed'
              : isDragActive
              ? 'border-brand-500 bg-brand-500/15 shadow-glow cursor-pointer'
              : 'border-subtle hover:border-brand-500/60 hover:bg-surface cursor-pointer'}
            ${uploading ? 'opacity-60 cursor-not-allowed' : ''}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-4 relative z-10">
            {uploading ? (
              <div className="w-14 h-14 rounded-2xl bg-surface border border-brand-500/40 flex items-center justify-center animate-spin text-brand-400 shadow-glow">
                <ShurikenIcon className="w-8 h-8" />
              </div>
            ) : isAtLimit ? (
              <div className="p-4 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 shadow-md">
                <ScrollIcon className="w-8 h-8" />
              </div>
            ) : (
              <div className={`p-4 rounded-2xl transition-transform duration-300 group-hover:scale-110 ${
                isDragActive
                  ? 'bg-brand-500/30 text-white'
                  : 'bg-surface border border-subtle text-brand-400 shadow-md'
              }`}>
                <ScrollIcon className="w-8 h-8" />
              </div>
            )}

            <div className="space-y-1">
              <p className="font-display font-black text-white text-base sm:text-lg">
                {uploading
                  ? 'Analyzing Document Architecture & Semantic Vectors...'
                  : isAtLimit
                  ? 'Maximum 5 Resume Dossiers Reached'
                  : isDragActive
                  ? 'Release To Deposit Dossier'
                  : 'Deposit Resume Dossier For AI Calibration'}
              </p>
              <p className="text-secondary text-xs sm:text-sm font-medium">
                {isAtLimit ? (
                  <span className="text-amber-300 font-bold">
                    You have reached the 5-resume limit. Delete an existing dossier below to upload a new one.
                  </span>
                ) : (
                  <>
                    Drag and drop your file here, or{' '}
                    <span className="text-brand-300 font-bold underline underline-offset-4">browse local files</span>
                  </>
                )}
              </p>
            </div>

            <div className="flex items-center gap-3 text-[10.5px] font-mono text-secondary pt-1">
              <span className="px-2.5 py-0.5 rounded-md bg-surface border border-subtle">PDF</span>
              <span className="px-2.5 py-0.5 rounded-md bg-surface border border-subtle">DOC</span>
              <span className="px-2.5 py-0.5 rounded-md bg-surface border border-subtle">DOCX</span>
              <span>&bull;</span>
              <span>Maximum 5MB File Limit</span>
              <span>&bull;</span>
              <span className={`px-2.5 py-0.5 rounded-md font-bold ${isAtLimit ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-surface border border-subtle text-white'}`}>
                {resumes.length} / 5 Quota
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Resume Dossier Stream ─────────────────────────── */}
      <section aria-label="Resume Dossiers" className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-subtle">
          <h2 className="text-xs font-mono font-extrabold uppercase tracking-widest text-secondary">
            // ACTIVE PROFILE DOSSIERS
          </h2>
          <span className="text-xs font-mono text-secondary">
            <span className={isAtLimit ? 'text-amber-400 font-bold' : 'text-white font-bold'}>
              {resumes.length} / 5
            </span>{' '}
            {resumes.length === 1 ? 'Record' : 'Records'}
          </span>
        </div>

        {resumes.length === 0 ? (
          <div className="p-12 sm:p-20 text-center rounded-3xl bg-surface/60 backdrop-blur-xl border border-dashed border-subtle space-y-4 shadow-sm">
            <div className="p-4 bg-surface border border-subtle rounded-2xl w-16 h-16 mx-auto flex items-center justify-center text-brand-400 shadow-lg">
              <ScrollIcon className="w-8 h-8" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-lg font-display font-black text-white">No Resume Dossier Uploaded</h3>
              <p className="text-secondary text-xs leading-relaxed">
                Deposit your first resume above to activate automatic skill extraction and tailored interview scenarios.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {resumes.filter(Boolean).map((resume) => {
                const ps = PARSE_STATUS[resume?.parseStatus] || PARSE_STATUS.pending;
                const isOpen = expanded === resume?._id;

                return (
                  <motion.article
                    key={resume._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="p-6 sm:p-7 rounded-3xl bg-surface/90 backdrop-blur-2xl border border-subtle hover:border-brand-500/50 hover:bg-surface transition-all duration-300 space-y-4 shadow-lg relative overflow-hidden"
                  >
                    {/* Top Sheen */}
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-400/30 to-transparent pointer-events-none" />

                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-start gap-4 min-w-0">
                        <div className={`p-3 rounded-2xl flex-shrink-0 border shadow-md ${
                          resume.isDefault
                            ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                            : 'bg-brand-500/15 text-brand-400 border-brand-500/30'
                        }`}>
                          <ScrollIcon className="w-6 h-6" />
                        </div>

                        <div className="min-w-0 space-y-1.5">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <h3 className="font-display font-bold text-white text-base truncate leading-snug">
                              {resume.originalName}
                            </h3>
                            {resume.isDefault && (
                              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono font-extrabold px-2.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-400 uppercase tracking-wide">
                                <Star className="w-3 h-3 fill-amber-400" />
                                <span>PRIMARY DOSSIER</span>
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold px-2.5 py-0.5 rounded-md border ${ps.color}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${ps.dot} ${resume.parseStatus === 'pending' ? 'animate-ping' : ''}`} />
                              <span>{ps.label}</span>
                            </span>
                            {resume.fileSize && (
                              <span className="text-secondary text-[11px]">
                                {(resume.fileSize / 1024).toFixed(0)} KB
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Triggers */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {resume.parseStatus === 'parsed' && (
                          <button
                            type="button"
                            onClick={() => setExpanded(isOpen ? null : resume._id)}
                            className="p-2.5 rounded-xl bg-surface border border-subtle text-brand-300 hover:text-white hover:border-brand-500/50 transition-all cursor-pointer"
                            title={isOpen ? 'Collapse view' : 'Inspect parsed structure'}
                          >
                            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </button>
                        )}

                        {!resume.isDefault && (
                          <button
                            type="button"
                            onClick={() => handleSetDefault(resume._id)}
                            className="p-2.5 rounded-xl bg-surface border border-subtle text-secondary hover:text-amber-400 hover:border-amber-500/40 transition-all cursor-pointer"
                            title="Set as primary"
                          >
                            <Star className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => openDeleteModal(resume)}
                          className="p-2.5 rounded-xl bg-surface border border-subtle text-secondary hover:text-rose-400 hover:border-rose-500/40 transition-all cursor-pointer"
                          title="Delete resume dossier"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Expandable Parsed Structure */}
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <ParsedDataPanel
                            resume={resume}
                            onOpenReparse={(r) => {
                              setReparseModalResume(r);
                              setJdInput('');
                            }}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.article>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </section>

      {/* ── 4. Shinobi Delete Confirmation Modal ──────────────── */}
      <ConfirmDeleteModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedResume(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Retire Resume Dossier?"
        message="Are you sure you want to retire this resume dossier? This action will permanently remove extracted ATS competency pillars and custom interview vectors from your active profile."
        itemTitle={selectedResume?.originalName}
        confirmText="Retire Dossier"
        cancelText="Keep in Vault"
        isLoading={deleting}
      />

      {/* ── 5. Shinobi Re-scan against Job Description Modal ───────── */}
      <AnimatePresence>
        {reparseModalResume && (
          <ReparseModal
            resume={reparseModalResume}
            jdInput={jdInput}
            setJdInput={setJdInput}
            parsing={reparsing}
            onConfirm={async () => {
              setReparsing(true);
              try {
                await handleReparse(reparseModalResume._id, jdInput);
                setReparseModalResume(null);
                setJdInput('');
              } catch (err) {
                // error toasted in handleReparse
              } finally {
                setReparsing(false);
              }
            }}
            onClose={() => {
              if (!reparsing) {
                setReparseModalResume(null);
                setJdInput('');
              }
            }}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
