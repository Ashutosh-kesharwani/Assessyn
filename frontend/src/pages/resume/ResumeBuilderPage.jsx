import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Copy, Download, Code, ExternalLink,
  Sparkles, Check, ChevronRight, Terminal, ArrowUpRight,
  Sliders, Target, Layout, ShieldCheck, CheckCircle2,
  Layers, Cpu, Zap, Eye, CheckCheck
} from 'lucide-react';
import toast from 'react-hot-toast';

// ── 100% Guaranteed 1-Page Jake Gutierrez ATS Spec (Anonymous Dummy Data) ───
export const OVERLEAF_LATEX_SOURCE = `%-------------------------
% Resume in Latex
% Author : Jake Gutierrez
% License : MIT
%------------------------

\\documentclass[a4paper,11pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{fontawesome}
\\usepackage{tabularx}
\\input{glyphtounicode}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

% Adjust margins
\\addtolength{\\oddsidemargin}{-0.6in}
\\addtolength{\\evensidemargin}{-0.6in}
\\addtolength{\\textwidth}{1.2in}
\\addtolength{\\topmargin}{-0.9in}
\\addtolength{\\textheight}{1.6in}

\\urlstyle{same}

\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Sections formatting
\\titleformat{\\section}{
  \\vspace{-5pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-6pt}]

% ATS Friendly
\\pdfgentounicode=1

%---------------------------------
% Custom Commands
%---------------------------------

\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-1pt}\\item
  \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
    \\textbf{#1} & #2\\\\
    \\textit{\\small#3} & \\textit{\\small #4}\\\\
  \\end{tabular*}\\vspace{-5pt}
}

\\newcommand{\\resumeSubSubheading}[2]{
  \\item
  \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
    \\textit{\\small#1} &
    \\textit{\\small #2}\\\\
  \\end{tabular*}\\vspace{-5pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
  \\item
  \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
    \\small#1 & #2\\\\
  \\end{tabular*}\\vspace{-5pt}
}

\\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}\\vspace{-4pt}}

\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}

\\newcommand{\\resumeSubHeadingListStart}{
\\begin{itemize}[leftmargin=0.15in,label={}]}

\\newcommand{\\resumeSubHeadingListEnd}{
\\end{itemize}}

\\newcommand{\\resumeItemListStart}{
\\begin{itemize}}

\\newcommand{\\resumeItemListEnd}{
\\end{itemize}\\vspace{-5pt}}

%-------------------------------------------
%%%%%% RESUME STARTS HERE %%%%%%%%%%%%%%%%%%%
%-------------------------------------------

\\begin{document}

%-----------HEADING-----------

\\begin{center}
{\\Huge \\scshape Alex J. Mercer}\\\\
\\vspace{2pt}

Bengaluru, Karnataka, India

\\vspace{4pt}

\\small
\\href{tel:+919876543210}{
\\raisebox{-0.1\\height}\\faPhone\\
\\underline{+91-98765-43210}}
~
\\href{mailto:alex.mercer.dev@example.com}{
\\raisebox{-0.2\\height}\\faEnvelope\\
\\underline{alex.mercer.dev@example.com}}
~
\\href{https://www.linkedin.com/in/alex-mercer-dev/}{
\\raisebox{-0.2\\height}\\faLinkedinSquare\\
\\underline{LinkedIn}}
~
\\href{https://github.com/alex-mercer-dev}{
\\raisebox{-0.2\\height}\\faGithub\\
\\underline{GitHub}}
~
\\href{https://alexmercer.dev}{
\\raisebox{-0.2\\height}\\faGlobe\\
\\underline{Portfolio}}

\\end{center}

\\vspace{-11pt}

%-----------SUMMARY-----------

\\section{Professional Summary}
\\vspace{1pt}
Software Engineer with hands-on experience in Python, JavaScript, and Object-Oriented Programming (OOP), developing scalable software using REST APIs, SQL/NoSQL databases, and modern engineering practices. Skilled in debugging, Agile development, Git collaboration, and writing clean, maintainable code.

\\vspace{-9pt}

%-----------EXPERIENCE-----------
\\section{Experience}
\\resumeSubHeadingListStart

\\resumeSubheading
{Junior Associate -- IT}{Jun 2025 -- Jul 2026}
{TechNova Solutions Pvt. Ltd.}{Bengaluru, India}

\\resumeItemListStart

\\resumeItem{Debugged REST APIs and SQL queries in a production Ruby on Rails MVC application, resolving defects and ensuring reliable shipment data.}

\\resumeItem{Worked with cross-functional Agile teams using Git and Jira to analyze issues, support testing, and deploy production-ready fixes.}

\\resumeItemListEnd

\\resumeSubheading
{Freelance Full Stack Developer (Project-Based)}{2023 -- Present}
{Self-Employed}{Remote}

\\resumeItemListStart

\\resumeItem{Designed and developed scalable software applications end-to-end, implementing REST APIs, backend logic, and efficient database models per client requirements.}

\\resumeItem{Built maintainable backend services using Node.js and MongoDB following modular architecture and clean coding practices.}

\\resumeItemListEnd

\\resumeSubHeadingListEnd
\\vspace{-11pt}

%-----------PROJECTS-----------
\\section{Projects}

\\resumeSubHeadingListStart

\\resumeProjectHeading
{\\textbf{Clinical Decision Support System (CDSS)}
$|$
\\emph{Python, Scikit-learn, NumPy, Pandas}}{2025}

\\resumeItemListStart

\\resumeItem{Developed a Python-based healthcare prediction application using Scikit-learn, NumPy, and Pandas for data preprocessing and classification model training.}

\\resumeItem{Integrated ML models with a web app via REST APIs for real-time predictions; secured \\textbf{Top 10} at National Hackathon.}

\\resumeItemListEnd

\\resumeProjectHeading
{\\textbf{Cravio -- Food Ordering Platform}
\\href{https://cravio-demo.example.dev}{\\raisebox{-0.1\\height}\\faExternalLink}
$|$
\\emph{React.js, Node.js, Express.js, MongoDB, JWT, Stripe}}{2026}

\\resumeItemListStart

\\resumeItem{Developed scalable software components and secure REST APIs using modular backend architecture and optimized database operations.}

\\resumeItem{Engineered JWT-based role access control with HttpOnly cookies and integrated Stripe payments with admin analytics dashboards.}

\\resumeItemListEnd

\\resumeProjectHeading
{\\textbf{DevVerse -- Personal Portfolio}
\\href{https://alexmercer.dev}{\\raisebox{-0.1\\height}\\faExternalLink}
$|$
\\emph{React.js, Vite, Tailwind CSS, Three.js, Framer Motion}}{2025}

\\resumeItemListStart

\\resumeItem{Designed a responsive developer portfolio using reusable React components and modern frontend development practices.}

\\resumeItemListEnd

\\resumeSubHeadingListEnd

\\vspace{-11pt}

%-----------TECHNICAL SKILLS-----------
\\section{Technical Skills}

\\begin{itemize}[leftmargin=0.15in, label={}, itemsep=-3pt]
\\small{\\item{

\\textbf{Languages}{: Python, JavaScript, C++, SQL} \\\\

\\textbf{Software Engineering}{: OOP, MVC, REST APIs, Software Design Principle, Debugging, Problem Solving} \\\\

\\textbf{Backend}{: Node.js, Express.js, JWT, bcrypt} \\\\

\\textbf{Machine Learning}{: Scikit-learn, NumPy, Pandas} \\\\

\\textbf{Databases}{: MySQL, MongoDB, Mongoose} \\\\

\\textbf{Tools}{: Git version control, GitHub, Jira, Postman}

}}
\\end{itemize}

\\vspace{-11pt}

%-----------ACHIEVEMENTS-----------
\\section{Achievements}
\\begin{itemize}[leftmargin=0.15in, itemsep=-3pt]

\\item \\textbf{National Innovation Hackathon (2024)} -- Secured a \\textbf{Top 10} position for developing an AI-assisted Clinical Decision Support System.

\\item \\textbf{Software Delivery} -- Successfully designed, developed, and deployed multiple production-ready software solutions for freelance clients.

\\end{itemize}

\\vspace{-10pt}

%-----------CERTIFICATIONS-----------
\\section{Certifications}

\\small Web Development -- Premier Institute ~$|$~ Machine Learning -- Tech Academy ~$|$~ MongoDB Certified

\\vspace{-5pt}

%-----------EDUCATION-----------
\\section{Education}
\\resumeSubHeadingListStart

\\resumeSubheading
{Apex Technical University}{2021 -- 2025}
{Bachelor of Technology, Computer Science and Engineering}{CGPA: 7.5 / 10.0}

\\resumeSubHeadingListEnd

%-------------------------------------------
\\end{document}`;

const HOW_TO_STEPS = [
  {
    step: '01',
    title: 'Copy LaTeX Source',
    desc: 'Click "Copy LaTeX Code" or "Download .tex" to grab the single-page source file.',
  },
  {
    step: '02',
    title: 'Open Overleaf.com',
    desc: 'Go to Overleaf.com in your browser (free instant sign-in or login).',
    link: 'https://www.overleaf.com/project',
  },
  {
    step: '03',
    title: 'New Blank Project',
    desc: 'Click "+ New Project" ➔ "Blank Project" and name your resume.',
  },
  {
    step: '04',
    title: 'Paste into main.tex',
    desc: 'Select all existing sample text in main.tex, delete it, and paste your code.',
  },
  {
    step: '05',
    title: 'Click "Recompile"',
    desc: 'Press "Recompile" (Ctrl+Enter). Exact 1-page vector ATS PDF is instantly generated!',
  },
];

const UPCOMING_STUDIO_FEATURES = [
  {
    icon: Sliders,
    title: 'Visual In-Place Canvas Editor',
    desc: 'Double-click any section on the paper sheet to edit text, dates, and bullets with instant two-way synchronization.',
    badge: 'LIVE CANVAS',
    badgeColor: 'text-brand-400 bg-brand-500/10 border-brand-500/30',
  },
  {
    icon: Target,
    title: 'AI Semantic ATS Matcher',
    desc: 'Paste target Job Descriptions to generate a 0-100% keyword match gauge, bullet point metrics grader, and missing skill suggestions.',
    badge: 'AI OPTIMIZER',
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  },
  {
    icon: Layout,
    title: '10 Pure White ATS Architectures',
    desc: 'Switch between tailored archetypes: Fresher College Grad, Senior Distributed SWE, Staff Tech Lead, Harvard Ivy, DevOps SRE, and ML Specialist.',
    badge: '10 ARCHITECTURES',
    badgeColor: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
  },
  {
    icon: Zap,
    title: 'Instant High-Res Multi-Exporters',
    desc: 'One-click compiled native Microsoft Word (.docx) binary, 192 DPI vector A4 PDF with exact page budget cutoff, and Overleaf .tex.',
    badge: 'MULTI-FORMAT',
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  },
];

export default function ResumeBuilderPage() {
  const [copied, setCopied] = useState(false);

  // Copy LaTeX code to clipboard
  const handleCopyCode = () => {
    navigator.clipboard.writeText(OVERLEAF_LATEX_SOURCE);
    setCopied(true);
    toast.success('📋 Overleaf LaTeX (.tex) code copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  // Download .tex file
  const handleDownloadTex = () => {
    const blob = new Blob([OVERLEAF_LATEX_SOURCE], { type: 'text/x-tex;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'Alex_Mercer_Software_Engineer_Resume.tex';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('💾 Downloaded Alex_Mercer_Software_Engineer_Resume.tex!');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 animate-fade-in pb-20 px-3 sm:px-6">
      {/* ── Top Header HUD (Fully Responsive) ───────────────────────── */}
      <header className="p-5 sm:p-8 rounded-3xl bg-surface/90 backdrop-blur-2xl border border-subtle shadow-xl relative overflow-hidden flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1.5">
              <Code className="w-3.5 h-3.5" />
              <span>OVERLEAF LATEX · EXACT 1-PAGE ATS SPEC</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 text-[10px] font-mono font-bold flex items-center gap-1">
              <CheckCheck size={11} className="text-emerald-400" />
              <span>100% Single Page Guaranteed</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight">
            Overleaf ATS Resume Studio
          </h1>
          <p className="text-xs sm:text-sm text-secondary font-mono leading-relaxed">
            Standard single-page Software Engineer ATS architecture. Calibrated to compile strictly on 1 page in Overleaf pdflatex. Preview the live resume, copy or download the code, and compile instantly.
          </p>
        </div>

        {/* Action Buttons (Full-Width on Mobile, Inline Row on Desktop) */}
        <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <button
            type="button"
            onClick={handleCopyCode}
            className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-surface border border-subtle hover:border-brand-400 text-brand-300 hover:text-white text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-2.5 shadow-sm"
          >
            {copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5 text-brand-400" />}
            <span>{copied ? 'Copied Code!' : 'Copy LaTeX Code'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadTex}
            className="w-full sm:w-auto py-2.5 px-4 rounded-xl bg-surface border border-subtle hover:border-emerald-400 text-emerald-300 hover:text-white text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-2.5 shadow-sm"
          >
            <Download className="w-5 h-5 text-emerald-400" />
            <span>Download .tex</span>
          </button>

          <a
            href="https://www.overleaf.com/project"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-gradient-to-r from-brand-500 to-indigo-600 hover:from-brand-600 hover:to-indigo-700 text-white font-display font-black text-xs tracking-wide shadow-lg shadow-brand-500/25 transition-all cursor-pointer flex items-center justify-center gap-2.5"
          >
            <span>Compile on Overleaf</span>
            <ArrowUpRight className="w-5 h-5" />
          </a>
        </div>
      </header>

      {/* ── 5-STEP OVERLEAF GUIDE (Responsive Grid) ────────────────── */}
      <section className="p-5 sm:p-7 rounded-3xl bg-surface/80 border border-subtle shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-subtle pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-brand-500/20 text-brand-300 flex items-center justify-center font-mono font-black text-xs">
              01
            </div>
            <h2 className="font-display font-black text-white text-sm sm:text-base">
              How to Generate Your 1-Page PDF on Overleaf (5 Simple Steps)
            </h2>
          </div>
          <a
            href="https://www.overleaf.com/project"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-mono text-brand-300 hover:text-white flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Open Overleaf Editor</span>
            <ExternalLink size={12} />
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-1">
          {HOW_TO_STEPS.map((s, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-[#090915] border border-subtle space-y-2 flex flex-col justify-between"
            >
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 inline-block">
                  STEP {s.step}
                </span>
                <h3 className="text-xs font-display font-bold text-white leading-snug">
                  {s.title}
                </h3>
                <p className="text-[11px] font-mono text-secondary leading-relaxed">
                  {s.desc}
                </p>
              </div>
              {s.link && (
                <a
                  href={s.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10.5px] font-mono font-bold text-emerald-400 hover:underline inline-flex items-center gap-1 pt-2"
                >
                  <span>Go to Overleaf</span>
                  <ArrowUpRight size={11} />
                </a>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* ── 1. FIRST: VISUAL RESUME A4 DOCUMENT (100% Synced & Proportional) ── */}
      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 px-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <h2 className="text-xs sm:text-sm font-mono font-extrabold uppercase tracking-wider text-white">
              1. Visual Resume Preview (100% Synced With LaTeX Source)
            </h2>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 font-bold">
            Guaranteed Single Page · Overleaf Spec
          </span>
        </div>

        {/* Clean Paper Viewport Container */}
        <div className="w-full rounded-3xl p-2 sm:p-6 md:p-8 bg-[#05060b] border border-subtle shadow-inner flex justify-center">
          {/* Fluid Paper Card: 100% responsive on phones, max-w-[780px] on desktop */}
          <div
            id="a4-resume-sheet"
            className="w-full max-w-[780px] bg-white text-slate-900 p-5 sm:p-8 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.85)] rounded-2xl sm:rounded-sm border border-slate-200 font-serif selection:bg-blue-100"
            style={{ fontFamily: "'Georgia', 'Times New Roman', serif" }}
          >
            {/* Header */}
            <div className="text-center pb-2 border-b border-slate-900 space-y-1">
              <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-wide text-slate-950">
                Alex J. Mercer
              </h1>
              <p className="text-xs text-slate-600 font-sans">Bengaluru, Karnataka, India</p>
              <div className="flex flex-wrap justify-center items-center gap-1.5 sm:gap-2.5 text-[10.5px] sm:text-[11px] text-slate-700 pt-1 font-sans">
                <a href="tel:+919876543210" className="hover:underline text-slate-900">+91-98765-43210</a>
                <span>•</span>
                <a href="mailto:alex.mercer.dev@example.com" className="hover:underline text-slate-900">
                  alex.mercer.dev@example.com
                </a>
                <span>•</span>
                <a href="https://www.linkedin.com/in/alex-mercer-dev/" target="_blank" rel="noreferrer" className="hover:underline text-blue-700 font-medium">
                  LinkedIn
                </a>
                <span>•</span>
                <a href="https://github.com/alex-mercer-dev" target="_blank" rel="noreferrer" className="hover:underline text-slate-900 font-medium">
                  GitHub
                </a>
                <span>•</span>
                <a href="https://alexmercer.dev" target="_blank" rel="noreferrer" className="hover:underline text-blue-700 font-medium">
                  Portfolio
                </a>
              </div>
            </div>

            {/* Professional Summary */}
            <div className="mt-3.5 space-y-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-0.5">
                Professional Summary
              </h2>
              <p className="text-[11px] text-slate-800 leading-relaxed text-justify">
                Software Engineer with hands-on experience in Python, JavaScript, and Object-Oriented Programming (OOP), developing scalable software using REST APIs, SQL/NoSQL databases, and modern engineering practices. Skilled in debugging, Agile development, Git collaboration, and writing clean, maintainable code.
              </p>
            </div>

            {/* Experience */}
            <div className="mt-3.5 space-y-2.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-0.5">
                Experience
              </h2>

              <div className="space-y-0.5">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline text-xs font-bold text-slate-950">
                  <span>Junior Associate — IT</span>
                  <span className="font-normal italic text-[11px] text-slate-600">Jun 2025 — Jul 2026</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline text-[11px] italic text-slate-700">
                  <span>TechNova Solutions Pvt. Ltd.</span>
                  <span>Bengaluru, India</span>
                </div>
                <ul className="list-disc list-inside text-[11px] text-slate-800 space-y-0.5 pt-0.5 pl-1">
                  <li>Debugged REST APIs and SQL queries in a production Ruby on Rails MVC application, resolving defects and ensuring reliable shipment data.</li>
                  <li>Worked with cross-functional Agile teams using Git and Jira to analyze issues, support testing, and deploy production-ready fixes.</li>
                </ul>
              </div>

              <div className="space-y-0.5 pt-1">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline text-xs font-bold text-slate-950">
                  <span>Freelance Full Stack Developer (Project-Based)</span>
                  <span className="font-normal italic text-[11px] text-slate-600">2023 — Present</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline text-[11px] italic text-slate-700">
                  <span>Self-Employed</span>
                  <span>Remote</span>
                </div>
                <ul className="list-disc list-inside text-[11px] text-slate-800 space-y-0.5 pt-0.5 pl-1">
                  <li>Designed and developed scalable software applications end-to-end, implementing REST APIs, backend logic, and efficient database models per client requirements.</li>
                  <li>Built maintainable backend services using Node.js and MongoDB following modular architecture and clean coding practices.</li>
                </ul>
              </div>
            </div>

            {/* Projects */}
            <div className="mt-3.5 space-y-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-0.5">
                Projects
              </h2>

              <div className="space-y-0.5">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline text-xs">
                  <span className="font-bold text-slate-950">
                    Clinical Decision Support System (CDSS) <span className="font-normal italic text-slate-600 text-[10.5px]">— Python, Scikit-learn, NumPy, Pandas</span>
                  </span>
                  <span className="italic text-[10.5px] text-slate-600">2025</span>
                </div>
                <ul className="list-disc list-inside text-[11px] text-slate-800 space-y-0.5 pl-1">
                  <li>Developed a Python-based healthcare prediction application using Scikit-learn, NumPy, and Pandas for data preprocessing and classification model training.</li>
                  <li>Integrated ML models with a web app via REST APIs for real-time predictions; secured <strong>Top 10</strong> at National Hackathon.</li>
                </ul>
              </div>

              <div className="space-y-0.5 pt-1">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline text-xs">
                  <span className="font-bold text-slate-950">
                    Cravio — Food Ordering Platform <span className="font-normal italic text-slate-600 text-[10.5px]">— React.js, Node.js, Express.js, MongoDB, JWT, Stripe</span>
                  </span>
                  <span className="italic text-[10.5px] text-slate-600">2026</span>
                </div>
                <ul className="list-disc list-inside text-[11px] text-slate-800 space-y-0.5 pl-1">
                  <li>Developed scalable software components and secure REST APIs using modular backend architecture and optimized database operations.</li>
                  <li>Engineered JWT-based role access control with HttpOnly cookies and integrated Stripe payments with admin analytics dashboards.</li>
                </ul>
              </div>

              <div className="space-y-0.5 pt-1">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline text-xs">
                  <span className="font-bold text-slate-950">
                    DevVerse — Personal Portfolio <span className="font-normal italic text-slate-600 text-[10.5px]">— React.js, Vite, Tailwind CSS, Three.js, Framer Motion</span>
                  </span>
                  <span className="italic text-[10.5px] text-slate-600">2025</span>
                </div>
                <ul className="list-disc list-inside text-[11px] text-slate-800 space-y-0.5 pl-1">
                  <li>Designed a responsive developer portfolio using reusable React components and modern frontend development practices.</li>
                </ul>
              </div>
            </div>

            {/* Technical Skills */}
            <div className="mt-3.5 space-y-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-0.5">
                Technical Skills
              </h2>
              <div className="text-[10.5px] sm:text-[11px] text-slate-800 space-y-0.5 pt-0.5">
                <p><strong>Languages:</strong> Python, JavaScript, C++, SQL</p>
                <p><strong>Software Engineering:</strong> OOP, MVC, REST APIs, Software Design Principle, Debugging, Problem Solving</p>
                <p><strong>Backend:</strong> Node.js, Express.js, JWT, bcrypt</p>
                <p><strong>Machine Learning:</strong> Scikit-learn, NumPy, Pandas</p>
                <p><strong>Databases:</strong> MySQL, MongoDB, Mongoose</p>
                <p><strong>Tools:</strong> Git version control, GitHub, Jira, Postman</p>
              </div>
            </div>

            {/* Achievements */}
            <div className="mt-3.5 space-y-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-0.5">
                Achievements
              </h2>
              <ul className="list-disc list-inside text-[11px] text-slate-800 space-y-0.5 pl-1 pt-0.5">
                <li><strong>National Innovation Hackathon (2024)</strong> — Secured a <strong>Top 10</strong> position for developing an AI-assisted Clinical Decision Support System.</li>
                <li><strong>Software Delivery</strong> — Successfully designed, developed, and deployed multiple production-ready software solutions for freelance clients.</li>
              </ul>
            </div>

            {/* Certifications */}
            <div className="mt-3.5 space-y-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-0.5">
                Certifications
              </h2>
              <p className="text-[10.5px] sm:text-[11px] text-slate-800 pt-0.5">
                Web Development — Premier Institute &nbsp;|&nbsp; Machine Learning — Tech Academy &nbsp;|&nbsp; MongoDB Certified
              </p>
            </div>

            {/* Education (Only Degree - School Removed) */}
            <div className="mt-3.5 space-y-1">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-0.5">
                Education
              </h2>

              <div className="space-y-0.5">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline text-xs font-bold text-slate-950">
                  <span>Apex Technical University</span>
                  <span className="font-normal italic text-[11px] text-slate-600">2021 — 2025</span>
                </div>
                <div className="flex justify-between items-baseline text-[11px] text-slate-700">
                  <span>Bachelor of Technology, Computer Science and Engineering</span>
                  <span className="font-semibold">CGPA: 7.5 / 10.0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. SECOND: OVERLEAF LATEX SOURCE CODE (Responsive) ─────── */}
      <section className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs sm:text-sm font-mono font-extrabold uppercase tracking-wider text-white">
              2. Overleaf LaTeX Source Code (main.tex)
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyCode}
              className="text-xs font-mono font-bold text-brand-300 hover:text-white flex items-center gap-1.5 cursor-pointer py-1.5 px-3 rounded-lg bg-surface border border-subtle"
            >
              {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} className="text-brand-400" />}
              <span>{copied ? 'Copied!' : 'Copy Code'}</span>
            </button>
            <a
              href="https://www.overleaf.com/project"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono font-bold text-emerald-400 hover:underline flex items-center gap-1.5 py-1.5 px-2"
            >
              <span>Open Overleaf</span>
              <ArrowUpRight size={16} />
            </a>
          </div>
        </div>

        <div className="rounded-3xl bg-[#06060e] border border-subtle shadow-2xl p-4 sm:p-6 space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-subtle pb-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-[11px] sm:text-xs font-mono text-secondary ml-1 sm:ml-2">
                main.tex · pdflatex (1-Page Fit)
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-mono text-emerald-400 font-bold">
              Ready to Paste in Overleaf
            </span>
          </div>

          <textarea
            readOnly
            rows={18}
            value={OVERLEAF_LATEX_SOURCE}
            className="w-full bg-transparent border-0 text-emerald-300 font-mono text-[11px] sm:text-xs leading-relaxed resize-none focus:outline-none select-all p-1"
          />
        </div>
      </section>

      {/* ── 3. FUTURE INTERACTIVE STUDIO BLUEPRINT (Responsive UI Teaser) ── */}
      <section className="space-y-4 pt-4 border-t border-subtle">
        <div className="space-y-1.5 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="px-3 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/40 text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>FUTURE STUDIO ROADMAP · COMING IN NEXT RELEASE</span>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-display font-black text-white tracking-tight">
            Next-Gen Interactive Resume Studio Blueprint
          </h2>
          <p className="text-xs sm:text-sm text-secondary font-mono max-w-3xl">
            Currently in engineering. Here is how candidates will be able to customize, live-edit, and auto-calibrate their resumes directly on the platform:
          </p>
        </div>

        {/* 4 Feature Architecture Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {UPCOMING_STUDIO_FEATURES.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-surface/90 border border-subtle hover:border-slate-600 transition-all space-y-2.5 flex flex-col justify-between shadow-lg relative overflow-hidden"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white">
                      <Icon size={18} className="text-brand-400" />
                    </div>
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${feat.badgeColor}`}>
                      {feat.badge}
                    </span>
                  </div>
                  <h3 className="font-display font-black text-sm text-white">
                    {feat.title}
                  </h3>
                  <p className="text-[11px] font-mono text-secondary leading-relaxed">
                    {feat.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-subtle/50 flex items-center gap-1 text-[10px] font-mono text-slate-400">
                  <CheckCircle2 size={11} className="text-emerald-400" />
                  <span>Architecture Verified</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Interactive Simulated Preview Dashboard Wireframe */}
        <div className="p-5 sm:p-7 rounded-3xl bg-gradient-to-b from-[#0e0e1c] to-[#080812] border border-subtle shadow-2xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-subtle pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-brand-400" />
              <span className="text-xs font-mono font-bold uppercase text-white tracking-wider">
                Simulated Studio Interface Preview
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>ATS Score Engine: 96% Optimal</span>
            </div>
          </div>

          {/* Wireframe Mock Header Bar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-surface border border-subtle space-y-1">
              <span className="text-[10px] font-mono uppercase text-secondary">Target Role Calibrator</span>
              <p className="text-xs font-bold text-white">Senior Distributed Backend Engineer</p>
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
                <div className="bg-emerald-500 h-1.5 rounded-full w-[96%]" />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-surface border border-subtle space-y-1">
              <span className="text-[10px] font-mono uppercase text-secondary">A4 Physical Page Budget</span>
              <p className="text-xs font-bold text-emerald-300">Exact 1 Page (100% Fit · No Overflow)</p>
              <span className="text-[10px] font-mono text-secondary">Auto-fit spacing engine</span>
            </div>

            <div className="p-3.5 rounded-xl bg-surface border border-subtle space-y-1">
              <span className="text-[10px] font-mono uppercase text-secondary">Export Pipeline</span>
              <p className="text-xs font-bold text-white">Direct Vector PDF · Word (.docx) · .tex</p>
              <span className="text-[10px] font-mono text-brand-300">Sub-second compilation</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
