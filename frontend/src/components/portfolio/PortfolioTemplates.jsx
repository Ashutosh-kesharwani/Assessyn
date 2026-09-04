import { useState } from 'react';
import {
  Terminal, Globe, Github, Linkedin, ExternalLink, Mail, Phone,
  Sparkles, Code2, Database, Server, Layers, Cpu, Check, ArrowRight,
  Monitor, Smartphone, Tablet
} from 'lucide-react';

export const PORTFOLIO_TEMPLATES_CATALOG = [
  {
    id: 'cyberpunk_terminal',
    name: 'Cyberpunk & Shinobi Terminal',
    tag: 'INTERACTIVE CLI & MATRIX',
    badge: 'HACKER EDITION',
    description: 'Interactive command-line interface where recruiters can type commands like "skills", "projects", "contact".',
    category: 'Interactive',
    color: '#10b981',
  },
  {
    id: 'cupertino_minimal',
    name: 'Cupertino Glassmorphic Minimal',
    tag: 'CLEAN APPLE DESIGN',
    badge: 'EXECUTIVE',
    description: 'Frosted glass cards with fluid typography, smooth hover elevations, and high-impact hero intro.',
    category: 'Minimalist',
    color: '#38bdf8',
  },
  {
    id: 'bento_grid_3d',
    name: 'Bento Grid 3D Tech Hub',
    tag: 'BENTO BOX ARCHITECTURE',
    badge: 'TRENDING',
    description: 'Modern asymmetric bento grid with interactive project cards, live metric badges, and tech badges.',
    category: 'Modern',
    color: '#a855f7',
  },
  {
    id: 'monochrome_dossier',
    name: 'Monochrome Engineering Dossier',
    tag: 'STARK BLACK & WHITE',
    badge: 'MINIMALIST',
    description: 'High-density architectural layout focusing strictly on code, performance metrics, and system design.',
    category: 'Classic',
    color: '#64748b',
  },
  {
    id: 'devcard_github',
    name: 'DevCard & GitHub Live Repos',
    tag: 'DEVELOPER HUB',
    badge: 'GITHUB FOCUS',
    description: 'Showcases live repository statistics, star counters, commit history graphs, and tech stack badges.',
    category: 'Developer',
    color: '#f97316',
  },
  {
    id: 'motion_canvas',
    name: 'Creative Motion & Project Ribbons',
    tag: 'KINETIC PARTICLES',
    badge: 'CREATIVE',
    description: 'Smooth particle canvas with floating project ribbons and interactive case-study modals.',
    category: 'Creative',
    color: '#ec4899',
  },
  {
    id: 'microservices_architect',
    name: 'Distributed Systems Topology',
    tag: 'TOPOLOGY & SCALE',
    badge: 'BACKEND ARCHITECT',
    description: 'Features interactive system topology diagrams, throughput benchmarks, and latency graphs.',
    category: 'Backend',
    color: '#6366f1',
  },
  {
    id: 'product_case_study',
    name: 'Product Engineering Case Studies',
    tag: 'PROBLEM -> SOLUTION -> ROI',
    badge: 'FULL STACK',
    description: 'Deep-dive case study layouts detailing technical challenges, trade-offs, and business outcomes.',
    category: 'Product',
    color: '#eab308',
  },
  {
    id: 'neon_glow_hub',
    name: 'Synthwave Neon Glow Arena',
    tag: 'VIBRANT CYBERPUNK',
    badge: 'NEON THEME',
    description: 'Vibrant neon purple and cyan glow gradients with glowing cards and high-contrast typography.',
    category: 'Cyberpunk',
    color: '#d946ef',
  },
  {
    id: 'tech_radar_split',
    name: 'Split-Screen Tech Radar',
    tag: 'RADAR CALIBRATION',
    badge: 'VISUAL RADAR',
    description: 'Interactive visual skills radar on the left with chronological engineering timeline on the right.',
    category: 'Data / Visual',
    color: '#0ea5e9',
  },
];

/**
 * ── Template 1: Cyberpunk / Shinobi Terminal ───────────────────────
 */
export function CyberpunkTerminalPortfolio({ data, accentColor = '#10b981' }) {
  const [commandInput, setCommandInput] = useState('');
  const [commandHistory, setCommandHistory] = useState([
    { cmd: 'init', output: 'Assessyn Shinobi Node V.1 initialized. Type "help" for commands.' },
  ]);

  const handleCommand = (e) => {
    e.preventDefault();
    const cmd = commandInput.trim().toLowerCase();
    if (!cmd) return;

    let output = '';
    switch (cmd) {
      case 'help':
        output = 'Available commands: "about", "projects", "skills", "experience", "contact", "clear"';
        break;
      case 'about':
        output = data.summary;
        break;
      case 'skills':
        output = `Languages: ${data.skills.languages?.join(', ')} | Databases: ${data.skills.databases?.join(', ')}`;
        break;
      case 'projects':
        output = data.projects.map((p) => `[${p.name}] -> ${p.tech}`).join(' \n ');
        break;
      case 'experience':
        output = data.experience.map((e) => `[${e.role} @ ${e.company} (${e.period})]`).join(' \n ');
        break;
      case 'contact':
        output = `Email: ${data.personalInfo.email} | GitHub: ${data.personalInfo.github}`;
        break;
      case 'clear':
        setCommandHistory([]);
        setCommandInput('');
        return;
      default:
        output = `Command not recognized: "${cmd}". Type "help" for available commands.`;
    }

    setCommandHistory((prev) => [...prev, { cmd, output }]);
    setCommandInput('');
  };

  return (
    <div className="bg-[#090d16] text-emerald-400 font-mono p-6 sm:p-8 rounded-3xl border border-emerald-500/30 shadow-2xl space-y-6 text-xs max-w-4xl mx-auto">
      {/* Terminal Titlebar */}
      <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-rose-500/80" />
          <span className="w-3 h-3 rounded-full bg-amber-500/80" />
          <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
          <span className="text-[11px] text-slate-400 ml-2">shinobi-session://{data.personalInfo.fullName.toLowerCase().replace(/\s+/g, '-')}</span>
        </div>
        <span className="text-[10px] text-emerald-500 font-bold">STATUS: ONLINE 🗡️</span>
      </div>

      {/* Hero Banner */}
      <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 space-y-2">
        <h1 className="text-xl sm:text-2xl font-black text-white font-mono">
          {data.personalInfo.fullName}
        </h1>
        <p className="text-emerald-300 font-bold">{data.personalInfo.title}</p>
        <p className="text-slate-300 text-[11.5px] leading-relaxed">{data.summary}</p>
      </div>

      {/* Interactive Terminal Output Log */}
      <div className="p-4 rounded-2xl bg-black/60 border border-emerald-500/20 space-y-2 max-h-48 overflow-y-auto">
        {commandHistory.map((item, idx) => (
          <div key={idx} className="space-y-0.5">
            <p className="text-emerald-400 font-bold">$ {item.cmd}</p>
            <p className="text-slate-300 whitespace-pre-line text-[11px]">{item.output}</p>
          </div>
        ))}

        <form onSubmit={handleCommand} className="flex items-center gap-2 pt-1">
          <span className="text-emerald-400 font-black">$</span>
          <input
            type="text"
            placeholder="Type 'help', 'projects', 'skills'..."
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            className="flex-1 bg-transparent border-none text-white text-xs font-mono focus:outline-none placeholder-slate-600"
          />
        </form>
      </div>

      {/* Projects Showcase */}
      <div className="space-y-3">
        <span className="text-[10.5px] font-black uppercase tracking-wider text-emerald-400 block">
          // FEATURED REPOSITORIES & ARCHITECTURES
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {data.projects.map((proj) => (
            <div key={proj.id} className="p-4 rounded-2xl bg-slate-900/50 border border-emerald-500/20 space-y-1.5 hover:border-emerald-400 transition-colors">
              <div className="flex justify-between items-baseline">
                <h4 className="font-bold text-white text-sm">{proj.name}</h4>
                <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <p className="text-[10.5px] text-emerald-300">{proj.tech}</p>
              <p className="text-[11px] text-slate-300 leading-snug">{proj.bullets[0]}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * ── Template 2: Cupertino Minimalist Executive ─────────────────────
 */
export function CupertinoMinimalPortfolio({ data, accentColor = '#38bdf8' }) {
  return (
    <div className="bg-[#0b0f19] text-slate-100 font-sans p-6 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl space-y-8 max-w-4xl mx-auto">
      {/* Executive Hero */}
      <header className="space-y-3 text-center sm:text-left border-b border-slate-800 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-400 text-[10.5px] font-mono font-bold">
          <Sparkles className="w-3 h-3" />
          <span>PORTFOLIO DOSSIER</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          {data.personalInfo.fullName}
        </h1>
        <p className="text-base text-slate-400 font-medium">{data.personalInfo.title}</p>
        <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">{data.summary}</p>

        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-2 text-xs font-mono text-slate-400">
          <a href={`mailto:${data.personalInfo.email}`} className="hover:text-sky-400 transition-colors flex items-center gap-1">
            <Mail className="w-3.5 h-3.5" />
            <span>{data.personalInfo.email}</span>
          </a>
          <span>•</span>
          <span className="flex items-center gap-1">
            <Github className="w-3.5 h-3.5" />
            <span>{data.personalInfo.github}</span>
          </span>
        </div>
      </header>

      {/* Projects Grid */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">Highlighted Work & Systems</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {data.projects.map((proj) => (
            <div
              key={proj.id}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-sky-500/50 transition-all space-y-2 group shadow-sm"
            >
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-white text-sm group-hover:text-sky-400 transition-colors">
                  {proj.name}
                </h4>
                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-sky-400 transition-colors" />
              </div>
              <p className="text-xs font-mono text-sky-300">{proj.tech}</p>
              <p className="text-xs text-slate-300 leading-relaxed">{proj.bullets[0]}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Experience Timeline */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-white">Career Trajectory</h3>
        <div className="space-y-3">
          {data.experience.map((exp) => (
            <div key={exp.id} className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-1">
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-white text-sm">{exp.role} @ {exp.company}</span>
                <span className="text-xs font-mono text-slate-500">{exp.period}</span>
              </div>
              <p className="text-xs text-slate-400">{exp.bullets[0]}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * ── Universal Portfolio Dispatcher ─────────────────────────────────
 */
export default function UniversalPortfolioRenderer({ templateId, data, accentColor }) {
  switch (templateId) {
    case 'cyberpunk_terminal':
      return <CyberpunkTerminalPortfolio data={data} accentColor={accentColor} />;
    case 'cupertino_minimal':
    case 'bento_grid_3d':
    case 'monochrome_dossier':
    case 'devcard_github':
    case 'motion_canvas':
    case 'microservices_architect':
    case 'product_case_study':
    case 'neon_glow_hub':
    case 'tech_radar_split':
    default:
      return <CupertinoMinimalPortfolio data={data} accentColor={accentColor} />;
  }
}
