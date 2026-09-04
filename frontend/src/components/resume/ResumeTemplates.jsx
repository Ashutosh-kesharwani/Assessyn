import { Mail, Phone, MapPin, Globe, Github, Linkedin, ExternalLink, Award, Sparkles, BookOpen, Layers, Briefcase, GraduationCap, Code } from 'lucide-react';
import { EditableText, EditableLink, EditableBulletList, SectionAddButton, ResumeReadOnlyContext } from './InlineEditable';

/**
 * ══════════════════════════════════════════════════════════════════════
 * 📄 10 TOP WHITE PROFESSIONAL ATS RESUME TEMPLATES CATALOG
 * 100% Pure White Background · High-Contrast Ink · 0 Circus Colors
 * Tailored from Freshers to Staff/Executives
 * ══════════════════════════════════════════════════════════════════════
 */
export const RESUME_TEMPLATES_CATALOG = [
  {
    id: 'fresher_ats',
    name: 'Fresher & College Graduate ATS Standard',
    tag: 'EDUCATION & PROJECTS FIRST',
    badge: 'FRESHER / ENTRY-LEVEL',
    description: 'Optimized for campus grads and entry-level talent. Prioritizes degree, coursework, capstone projects, and tech skills.',
    category: 'Fresher',
    previewColor: '#0f172a',
  },
  {
    id: 'experienced_swe',
    name: 'Experienced Software Engineer (SDE-II / Senior)',
    tag: 'QUANTIFIED IMPACT METRICS',
    badge: 'SENIOR ENGINEER',
    description: 'Gold standard single-column ATS layout. Emphasizes production experience, latency reduction, and microservices.',
    category: 'Experienced',
    previewColor: '#1e293b',
  },
  {
    id: 'tech_lead_staff',
    name: 'Staff Engineer & Technical Lead',
    tag: 'ARCHITECTURAL LEADERSHIP',
    badge: 'STAFF / PRINCIPAL',
    description: 'Tailored for tech leaders demonstrating cross-functional delivery, system scale, engineering RFCs, and mentoring.',
    category: 'Leadership',
    previewColor: '#334155',
  },
  {
    id: 'ivy_harvard',
    name: 'Harvard & Ivy League Classic (Serif)',
    tag: 'ENTERPRISE & TIER-1 FIRMS',
    badge: 'HARVARD STANDARD',
    description: 'Prestigious serif typography favored by Fortune 500 enterprises, investment banks, and top consulting firms.',
    category: 'Executive',
    previewColor: '#09090b',
  },
  {
    id: 'modern_latex',
    name: 'Modern Minimalist (Overleaf / LaTeX Style)',
    tag: 'PRISTINE SINGLE COLUMN',
    badge: 'TECH FAVORITE',
    description: 'Clean typographic layout with small-caps section headers and maximum signal-to-noise ratio.',
    category: 'Minimal',
    previewColor: '#18181b',
  },
  {
    id: 'product_manager',
    name: 'Product Manager & Business Analyst',
    tag: 'OKRS, RETENTION & REVENUE',
    badge: 'PRODUCT / BIZ',
    description: 'Focuses on user acquisition, feature roadmaps, North Star metrics, customer conversion, and sprint management.',
    category: 'Product',
    previewColor: '#27272a',
  },
  {
    id: 'data_ai_ml',
    name: 'Data Scientist & AI / ML Specialist',
    tag: 'LLMS, EVALS & MODEL SCALE',
    badge: 'AI / DATA',
    description: 'Specialized layout showcasing PyTorch model training, RAG pipelines, accuracy benchmarks, and Kaggle/research links.',
    category: 'Data & AI',
    previewColor: '#0f172a',
  },
  {
    id: 'devops_cloud',
    name: 'DevOps, Cloud & SRE Architect',
    tag: 'KUBERNETES & 99.99% UPTIME',
    badge: 'CLOUD / SRE',
    description: 'Pure professional white format highlighting AWS/GCP infrastructure, Terraform, CI/CD automation, and zero-downtime SLAs.',
    category: 'DevOps',
    previewColor: '#1e293b',
  },
  {
    id: 'compact_single_page',
    name: 'High-Density 1-Page Maximum Impact',
    tag: '100% SINGLE-PAGE FIT',
    badge: 'COMPACT 1-PAGE',
    description: 'Engineered with compact vertical margins to fit 5+ years of comprehensive experience on a single pristine A4 sheet.',
    category: 'Compact',
    previewColor: '#334155',
  },
  {
    id: 'creative_tech',
    name: 'Modern Developer Showcase & Open Source',
    tag: 'PROJECT DEMOS & REPOS',
    badge: 'DEVELOPER SHOWCASE',
    description: 'Highlights live demo URLs, GitHub repositories, technical blog links, and open-source contributions.',
    category: 'Showcase',
    previewColor: '#09090b',
  },
];

export const INITIAL_RESUME_DATA = {
  personalInfo: {
    fullName: 'Alex Reynolds',
    title: 'Senior Distributed Systems & Backend Engineer',
    email: 'alex.reynolds@example.com',
    phone: '+1 (555) 234-5678',
    location: 'San Francisco, CA (Open to Remote)',
    website: 'https://alexreynolds.dev',
    websiteLabel: 'alexreynolds.dev',
    github: 'https://github.com/alexreynolds',
    githubLabel: 'github.com/alexreynolds',
    linkedin: 'https://linkedin.com/in/alexreynolds',
    linkedinLabel: 'linkedin.com/in/alexreynolds',
  },
  summary:
    'High-performance Senior Distributed Systems Engineer with 6+ years architecting fault-tolerant microservices in Go, Node.js, and Java. Proven track record reducing P99 latency by 42% and scaling event pipelines to 100k+ req/sec using Apache Kafka, Redis Cluster, and PostgreSQL with 99.99% uptime compliance.',
  skills: {
    languages: ['Go', 'TypeScript', 'Python', 'Rust', 'Java', 'SQL'],
    frameworks: ['Node.js / Express', 'gRPC & Protobuf', 'Next.js', 'Gin / Fiber', 'Spring Boot'],
    infrastructure: ['Kubernetes (EKS)', 'Docker', 'AWS (EC2, S3, RDS)', 'Terraform', 'CI/CD (GitHub Actions)'],
    databases: ['PostgreSQL', 'Redis Cluster', 'Apache Kafka', 'MongoDB', 'Elasticsearch'],
  },
  experience: [
    {
      id: 'exp_1',
      role: 'Staff Platform Engineer',
      company: 'CloudScale Technologies',
      location: 'San Francisco, CA',
      period: '2022 - Present',
      bullets: [
        'Architected a distributed payment ledger in Go processing $45M+ daily transactional volume with idempotency and zero double-writes.',
        'Migrated legacy monolithic REST endpoints to gRPC microservices, reducing inter-service network latency from 140ms to 12ms (P99).',
        'Engineered multi-region Redis Cluster cache-aside strategy, offloading 85% read traffic from primary PostgreSQL instances.',
        'Mentored a high-performing squad of 8 engineers, instituting RFC design reviews and automated chaos engineering testing.',
      ],
    },
    {
      id: 'exp_2',
      role: 'Senior Backend Engineer',
      company: 'FinTrack Global',
      location: 'New York, NY',
      period: '2020 - 2022',
      bullets: [
        'Designed real-time event streaming pipeline with Apache Kafka handling 65,000 events/sec with zero message loss.',
        'Optimized composite database indices and partitioned audit tables, dropping average query execution times by 68%.',
        'Implemented OAuth 2.0 / OpenID Connect security gateway protecting 30+ internal microservices with rate limiting.',
      ],
    },
    {
      id: 'exp_3',
      role: 'Software Engineer',
      company: 'Nexus Software',
      location: 'Boston, MA',
      period: '2018 - 2020',
      bullets: [
        'Built full-stack analytics dashboards in React and Node.js serving 250k monthly active users.',
        'Automated Docker build pipelines, cutting staging deployment cycles from 45 minutes to 6 minutes.',
      ],
    },
  ],
  projects: [
    {
      id: 'proj_1',
      name: 'ChronosStream — Low-Latency Distributed Ledger',
      tech: 'Go, Kafka, PostgreSQL, Redis, Docker',
      link: 'github.com/alexreynolds/chronos-stream',
      url: 'https://github.com/alexreynolds/chronos-stream',
      bullets: [
        'High-throughput distributed ledger with Raft consensus and RocksDB state storage handling 50k transactions/sec with ACID guarantees.',
      ],
    },
    {
      id: 'proj_2',
      name: 'SentinelGuard — gRPC Sliding Window Rate Limiter',
      tech: 'Go, gRPC, Redis Lua, Envoy Proxy',
      link: 'github.com/alexreynolds/sentinel-guard',
      url: 'https://github.com/alexreynolds/sentinel-guard',
      bullets: [
        'Sub-2ms rate-limiting security mesh using atomic Redis Lua scripts with L1 local in-memory caching fallback.',
      ],
    },
  ],
  education: [
    {
      id: 'edu_1',
      degree: 'B.S. in Computer Science',
      institution: 'University of California, Berkeley',
      location: 'Berkeley, CA',
      period: '2014 - 2018',
      score: 'GPA: 3.88 / 4.0',
      details: 'Magna Cum Laude · Honors in Distributed Systems & Operating Systems',
    },
  ],
};

/* ──────────────────────────────────────────────────────────────────────
   HELPER: Generic State Updaters for In-Place Live Editing
   ────────────────────────────────────────────────────────────────────── */
function createUpdaters(data, onUpdate) {
  if (!onUpdate) {
    return {
      updatePersonal: () => {},
      updateSummary: () => {},
      updateSkillCategory: () => {},
      updateExperience: () => {},
      deleteExperience: () => {},
      addExperience: () => {},
      updateProject: () => {},
      deleteProject: () => {},
      addProject: () => {},
      updateEducation: () => {},
      deleteEducation: () => {},
      addEducation: () => {},
    };
  }

  return {
    updatePersonal: (field, val) => {
      onUpdate((prev) => ({
        ...prev,
        personalInfo: { ...prev.personalInfo, [field]: val },
      }));
    },
    updateSummary: (val) => {
      onUpdate((prev) => ({ ...prev, summary: val }));
    },
    updateSkillCategory: (cat, list) => {
      onUpdate((prev) => ({
        ...prev,
        skills: { ...prev.skills, [cat]: list },
      }));
    },
    updateExperience: (id, field, val) => {
      onUpdate((prev) => ({
        ...prev,
        experience: prev.experience.map((e) => (e.id === id ? { ...e, [field]: val } : e)),
      }));
    },
    deleteExperience: (id) => {
      onUpdate((prev) => ({
        ...prev,
        experience: prev.experience.filter((e) => e.id !== id),
      }));
    },
    addExperience: () => {
      onUpdate((prev) => ({
        ...prev,
        experience: [
          ...prev.experience,
          {
            id: `exp_${Date.now()}`,
            role: 'Software Engineer',
            company: 'Tech Enterprise Inc.',
            location: 'City, State',
            period: '2023 - Present',
            bullets: ['Led development of core business microservice serving 100k+ active users.'],
          },
        ],
      }));
    },
    updateProject: (id, field, val) => {
      onUpdate((prev) => ({
        ...prev,
        projects: prev.projects.map((p) => (p.id === id ? { ...p, [field]: val } : p)),
      }));
    },
    deleteProject: (id) => {
      onUpdate((prev) => ({
        ...prev,
        projects: prev.projects.filter((p) => p.id !== id),
      }));
    },
    addProject: () => {
      onUpdate((prev) => ({
        ...prev,
        projects: [
          ...prev.projects,
          {
            id: `proj_${Date.now()}`,
            name: 'New High-Impact Project',
            tech: 'React, Node.js, PostgreSQL',
            link: 'github.com/project',
            url: 'https://github.com',
            bullets: ['Architected scalable full-stack web application with responsive UI.'],
          },
        ],
      }));
    },
    updateEducation: (id, field, val) => {
      onUpdate((prev) => ({
        ...prev,
        education: prev.education.map((ed) => (ed.id === id ? { ...ed, [field]: val } : ed)),
      }));
    },
    deleteEducation: (id) => {
      onUpdate((prev) => ({
        ...prev,
        education: prev.education.filter((ed) => ed.id !== id),
      }));
    },
    addEducation: () => {
      onUpdate((prev) => ({
        ...prev,
        education: [
          ...prev.education,
          {
            id: `edu_${Date.now()}`,
            degree: 'Degree in Field',
            institution: 'University Name',
            location: 'Location',
            period: '2020 - 2024',
            score: 'GPA: 3.8',
            details: 'Coursework: Data Structures, Algorithms, Computer Architecture',
          },
        ],
      }));
    },
  };
}

/* ──────────────────────────────────────────────────────────────────────
   TEMPLATE 1: Fresher & College Graduate ATS Standard
   ────────────────────────────────────────────────────────────────────── */
export function FresherStandardTemplate({ data, onUpdate }) {
  const u = createUpdaters(data, onUpdate);

  return (
    <div className="bg-white text-slate-900 font-sans p-8 sm:p-10 max-w-4xl mx-auto shadow-sm text-xs leading-relaxed space-y-4">
      {/* Header */}
      <header className="border-b-2 border-slate-900 pb-3 text-center space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 uppercase">
          <EditableText value={data.personalInfo.fullName} onChange={(v) => u.updatePersonal('fullName', v)} />
        </h1>
        <p className="font-semibold text-slate-700 text-sm">
          <EditableText value={data.personalInfo.title} onChange={(v) => u.updatePersonal('title', v)} />
        </p>
        <div className="flex flex-wrap justify-center items-center gap-2 text-[11px] text-slate-600 pt-1">
          <EditableText value={data.personalInfo.email} onChange={(v) => u.updatePersonal('email', v)} />
          <span>•</span>
          <EditableText value={data.personalInfo.phone} onChange={(v) => u.updatePersonal('phone', v)} />
          <span>•</span>
          <EditableText value={data.personalInfo.location} onChange={(v) => u.updatePersonal('location', v)} />
          <span>•</span>
          <EditableLink
            label={data.personalInfo.linkedinLabel || data.personalInfo.linkedin}
            url={data.personalInfo.linkedin}
            onChange={({ label, url }) => {
              u.updatePersonal('linkedin', url);
              u.updatePersonal('linkedinLabel', label);
            }}
          />
          <span>•</span>
          <EditableLink
            label={data.personalInfo.githubLabel || data.personalInfo.github}
            url={data.personalInfo.github}
            onChange={({ label, url }) => {
              u.updatePersonal('github', url);
              u.updatePersonal('githubLabel', label);
            }}
          />
        </div>
      </header>

      {/* 1. Education (Fresher Priority) */}
      <section className="space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5">
          Education & Credentials
        </h2>
        {data.education?.map((edu) => (
          <div key={edu.id} className="space-y-0.5">
            <div className="flex justify-between items-baseline font-bold text-slate-900">
              <span className="text-[12.5px]">
                <EditableText value={edu.degree} onChange={(v) => u.updateEducation(edu.id, 'degree', v)} />
              </span>
              <span className="text-slate-600 font-normal text-[11px]">
                <EditableText value={edu.period} onChange={(v) => u.updateEducation(edu.id, 'period', v)} />
              </span>
            </div>
            <div className="flex justify-between text-slate-700 text-[11.5px]">
              <span className="font-semibold">
                <EditableText value={edu.institution} onChange={(v) => u.updateEducation(edu.id, 'institution', v)} />
              </span>
              <span className="text-slate-600 italic">
                <EditableText value={edu.score || edu.location} onChange={(v) => u.updateEducation(edu.id, 'score', v)} />
              </span>
            </div>
            <p className="text-slate-600 text-[11px]">
              <EditableText value={edu.details} onChange={(v) => u.updateEducation(edu.id, 'details', v)} />
            </p>
          </div>
        ))}
      </section>

      {/* 2. Technical Skills Matrix */}
      <section className="space-y-1.5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5">
          Technical Skills
        </h2>
        <div className="space-y-1 text-[11.5px] text-slate-800">
          <p>
            <strong className="text-slate-950 font-bold">Languages:</strong>{' '}
            <EditableText
              value={data.skills.languages?.join(', ')}
              onChange={(v) => u.updateSkillCategory('languages', v.split(',').map((s) => s.trim()))}
            />
          </p>
          <p>
            <strong className="text-slate-950 font-bold">Frameworks & Libraries:</strong>{' '}
            <EditableText
              value={data.skills.frameworks?.join(', ')}
              onChange={(v) => u.updateSkillCategory('frameworks', v.split(',').map((s) => s.trim()))}
            />
          </p>
          <p>
            <strong className="text-slate-950 font-bold">Databases & Tools:</strong>{' '}
            <EditableText
              value={data.skills.databases?.join(', ')}
              onChange={(v) => u.updateSkillCategory('databases', v.split(',').map((s) => s.trim()))}
            />
          </p>
        </div>
      </section>

      {/* 3. Academic & Capstone Projects */}
      <section className="space-y-3">
        <div className="flex justify-between items-center border-b border-slate-300 pb-0.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Key Technical Projects
          </h2>
          <SectionAddButton label="+ Add Project" onClick={u.addProject} />
        </div>
        {data.projects?.map((proj) => (
          <div key={proj.id} className="space-y-1">
            <div className="flex justify-between items-baseline font-bold text-slate-900">
              <span className="text-[12px]">
                <EditableText value={proj.name} onChange={(v) => u.updateProject(proj.id, 'name', v)} />
              </span>
              <EditableLink
                label={proj.link}
                url={proj.url || proj.link}
                className="text-[11px] font-normal text-blue-700"
                onChange={({ label, url }) => {
                  u.updateProject(proj.id, 'link', label);
                  u.updateProject(proj.id, 'url', url);
                }}
              />
            </div>
            <p className="text-slate-600 text-[10.5px] italic">
              <strong>Tech Stack:</strong>{' '}
              <EditableText value={proj.tech} onChange={(v) => u.updateProject(proj.id, 'tech', v)} />
            </p>
            <EditableBulletList
              bullets={proj.bullets}
              onChange={(bullets) => u.updateProject(proj.id, 'bullets', bullets)}
              bulletClassName="text-slate-700 text-[11.5px]"
            />
          </div>
        ))}
      </section>

      {/* 4. Internships & Experience */}
      <section className="space-y-3">
        <div className="flex justify-between items-center border-b border-slate-300 pb-0.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Work Experience & Internships
          </h2>
          <SectionAddButton label="+ Add Role" onClick={u.addExperience} />
        </div>
        {data.experience?.map((exp) => (
          <div key={exp.id} className="space-y-1">
            <div className="flex justify-between items-baseline font-bold text-slate-900">
              <span className="text-[12px]">
                <EditableText value={exp.role} onChange={(v) => u.updateExperience(exp.id, 'role', v)} />
                {' — '}
                <span className="font-semibold text-slate-700">
                  <EditableText value={exp.company} onChange={(v) => u.updateExperience(exp.id, 'company', v)} />
                </span>
              </span>
              <span className="text-slate-600 font-normal text-[11px]">
                <EditableText value={exp.period} onChange={(v) => u.updateExperience(exp.id, 'period', v)} />
              </span>
            </div>
            <EditableBulletList
              bullets={exp.bullets}
              onChange={(bullets) => u.updateExperience(exp.id, 'bullets', bullets)}
              bulletClassName="text-slate-700 text-[11.5px]"
            />
          </div>
        ))}
      </section>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   TEMPLATE 2: Experienced Software Engineer (SDE-II / Senior)
   ────────────────────────────────────────────────────────────────────── */
export function ExperiencedSweTemplate({ data, onUpdate }) {
  const u = createUpdaters(data, onUpdate);

  return (
    <div className="bg-white text-stone-900 font-sans p-8 sm:p-10 max-w-4xl mx-auto shadow-sm text-xs leading-relaxed space-y-4">
      {/* Header */}
      <header className="border-b-2 border-stone-900 pb-3 space-y-1">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-950 uppercase tracking-tight">
              <EditableText value={data.personalInfo.fullName} onChange={(v) => u.updatePersonal('fullName', v)} />
            </h1>
            <p className="font-bold text-stone-700 text-sm">
              <EditableText value={data.personalInfo.title} onChange={(v) => u.updatePersonal('title', v)} />
            </p>
          </div>
          <div className="text-left sm:text-right text-[11px] text-stone-600 space-y-0.5">
            <div>
              <EditableText value={data.personalInfo.email} onChange={(v) => u.updatePersonal('email', v)} />
              {' | '}
              <EditableText value={data.personalInfo.phone} onChange={(v) => u.updatePersonal('phone', v)} />
            </div>
            <div>
              <EditableText value={data.personalInfo.location} onChange={(v) => u.updatePersonal('location', v)} />
              {' | '}
              <EditableLink
                label={data.personalInfo.linkedinLabel || 'LinkedIn'}
                url={data.personalInfo.linkedin}
                onChange={({ label, url }) => {
                  u.updatePersonal('linkedin', url);
                  u.updatePersonal('linkedinLabel', label);
                }}
              />
              {' | '}
              <EditableLink
                label={data.personalInfo.githubLabel || 'GitHub'}
                url={data.personalInfo.github}
                onChange={({ label, url }) => {
                  u.updatePersonal('github', url);
                  u.updatePersonal('githubLabel', label);
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Summary */}
      <section className="space-y-1">
        <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900 border-b border-stone-300 pb-0.5">
          Professional Summary
        </h2>
        <p className="text-stone-700 text-[11.5px] leading-relaxed text-justify">
          <EditableText value={data.summary} onChange={u.updateSummary} multiline={true} />
        </p>
      </section>

      {/* Work Experience */}
      <section className="space-y-3">
        <div className="flex justify-between items-center border-b border-stone-300 pb-0.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900">
            Work Experience
          </h2>
          <SectionAddButton label="+ Add Position" onClick={u.addExperience} />
        </div>
        {data.experience?.map((exp) => (
          <div key={exp.id} className="space-y-1">
            <div className="flex justify-between items-baseline font-bold text-stone-950">
              <span className="text-[12.5px]">
                <EditableText value={exp.role} onChange={(v) => u.updateExperience(exp.id, 'role', v)} />
                {' — '}
                <span className="font-semibold text-stone-700">
                  <EditableText value={exp.company} onChange={(v) => u.updateExperience(exp.id, 'company', v)} />
                </span>
              </span>
              <span className="text-stone-600 font-normal text-[11px]">
                <EditableText value={exp.period} onChange={(v) => u.updateExperience(exp.id, 'period', v)} />
              </span>
            </div>
            <div className="text-[10.5px] text-stone-500 italic">
              <EditableText value={exp.location} onChange={(v) => u.updateExperience(exp.id, 'location', v)} />
            </div>
            <EditableBulletList
              bullets={exp.bullets}
              onChange={(bullets) => u.updateExperience(exp.id, 'bullets', bullets)}
              bulletClassName="text-stone-800 text-[11.5px]"
            />
          </div>
        ))}
      </section>

      {/* Technical Skills */}
      <section className="space-y-1.5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900 border-b border-stone-300 pb-0.5">
          Technical & Architectural Competencies
        </h2>
        <div className="space-y-1 text-[11.5px] text-stone-800">
          <p>
            <strong className="text-stone-950 font-bold">Languages:</strong>{' '}
            <EditableText
              value={data.skills.languages?.join(', ')}
              onChange={(v) => u.updateSkillCategory('languages', v.split(',').map((s) => s.trim()))}
            />
          </p>
          <p>
            <strong className="text-stone-950 font-bold">Frameworks & Protocols:</strong>{' '}
            <EditableText
              value={data.skills.frameworks?.join(', ')}
              onChange={(v) => u.updateSkillCategory('frameworks', v.split(',').map((s) => s.trim()))}
            />
          </p>
          <p>
            <strong className="text-stone-950 font-bold">Cloud & Infrastructure:</strong>{' '}
            <EditableText
              value={data.skills.infrastructure?.join(', ')}
              onChange={(v) => u.updateSkillCategory('infrastructure', v.split(',').map((s) => s.trim()))}
            />
          </p>
          <p>
            <strong className="text-stone-950 font-bold">Databases & Distributed Systems:</strong>{' '}
            <EditableText
              value={data.skills.databases?.join(', ')}
              onChange={(v) => u.updateSkillCategory('databases', v.split(',').map((s) => s.trim()))}
            />
          </p>
        </div>
      </section>

      {/* Education */}
      <section className="space-y-2">
        <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900 border-b border-stone-300 pb-0.5">
          Education
        </h2>
        {data.education?.map((edu) => (
          <div key={edu.id} className="flex justify-between items-baseline text-stone-900 text-[11.5px]">
            <div>
              <strong className="text-stone-950">
                <EditableText value={edu.degree} onChange={(v) => u.updateEducation(edu.id, 'degree', v)} />
              </strong>
              {' — '}
              <EditableText value={edu.institution} onChange={(v) => u.updateEducation(edu.id, 'institution', v)} />
            </div>
            <span className="text-stone-600 text-[11px]">
              <EditableText value={edu.period} onChange={(v) => u.updateEducation(edu.id, 'period', v)} />
            </span>
          </div>
        ))}
      </section>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   TEMPLATE 3: Staff Engineer & Technical Lead
   ────────────────────────────────────────────────────────────────────── */
export function TechLeadStaffTemplate({ data, onUpdate }) {
  const u = createUpdaters(data, onUpdate);

  return (
    <div className="bg-white text-zinc-900 font-sans p-8 sm:p-10 max-w-4xl mx-auto shadow-sm text-xs leading-relaxed space-y-4">
      {/* Header */}
      <header className="border-b border-zinc-400 pb-3 flex justify-between items-end">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 tracking-tight">
            <EditableText value={data.personalInfo.fullName} onChange={(v) => u.updatePersonal('fullName', v)} />
          </h1>
          <p className="font-bold text-zinc-700 text-sm">
            <EditableText value={data.personalInfo.title} onChange={(v) => u.updatePersonal('title', v)} />
          </p>
        </div>
        <div className="text-right text-[11px] text-zinc-600 space-y-0.5 font-mono">
          <div>
            <EditableText value={data.personalInfo.email} onChange={(v) => u.updatePersonal('email', v)} />
            {' · '}
            <EditableText value={data.personalInfo.phone} onChange={(v) => u.updatePersonal('phone', v)} />
          </div>
          <div>
            <EditableText value={data.personalInfo.location} onChange={(v) => u.updatePersonal('location', v)} />
          </div>
        </div>
      </header>

      {/* Leadership Profile */}
      <section className="space-y-1">
        <h2 className="text-[11px] font-mono font-bold uppercase tracking-widest text-zinc-950 border-b border-zinc-300 pb-0.5">
          // LEADERSHIP & ARCHITECTURAL CHARTER
        </h2>
        <p className="text-zinc-800 text-[11.5px] leading-relaxed">
          <EditableText value={data.summary} onChange={u.updateSummary} multiline={true} />
        </p>
      </section>

      {/* Leadership Experience */}
      <section className="space-y-3.5">
        <div className="flex justify-between items-center border-b border-zinc-300 pb-0.5">
          <h2 className="text-[11px] font-mono font-bold uppercase tracking-widest text-zinc-950">
            // LEADERSHIP & TECHNICAL DELIVERIES
          </h2>
          <SectionAddButton label="+ Add Role" onClick={u.addExperience} />
        </div>
        {data.experience?.map((exp) => (
          <div key={exp.id} className="space-y-1">
            <div className="flex justify-between items-baseline">
              <span className="font-bold text-zinc-950 text-xs">
                <EditableText value={exp.role} onChange={(v) => u.updateExperience(exp.id, 'role', v)} />
                {' @ '}
                <span className="text-zinc-700">
                  <EditableText value={exp.company} onChange={(v) => u.updateExperience(exp.id, 'company', v)} />
                </span>
              </span>
              <span className="text-zinc-600 font-mono text-[11px]">
                <EditableText value={exp.period} onChange={(v) => u.updateExperience(exp.id, 'period', v)} />
              </span>
            </div>
            <EditableBulletList
              bullets={exp.bullets}
              onChange={(bullets) => u.updateExperience(exp.id, 'bullets', bullets)}
              bulletClassName="text-zinc-800 text-[11.5px]"
            />
          </div>
        ))}
      </section>

      {/* Technical Systems Matrix */}
      <section className="space-y-1.5">
        <h2 className="text-[11px] font-mono font-bold uppercase tracking-widest text-zinc-950 border-b border-zinc-300 pb-0.5">
          // SYSTEMS & TECHNOLOGICAL STACK
        </h2>
        <div className="grid grid-cols-2 gap-2 text-[11.5px] text-zinc-800">
          <div>
            <strong className="text-zinc-950">Core Systems:</strong>{' '}
            <EditableText
              value={data.skills.languages?.join(', ')}
              onChange={(v) => u.updateSkillCategory('languages', v.split(',').map((s) => s.trim()))}
            />
          </div>
          <div>
            <strong className="text-zinc-950">Infrastructure:</strong>{' '}
            <EditableText
              value={data.skills.infrastructure?.join(', ')}
              onChange={(v) => u.updateSkillCategory('infrastructure', v.split(',').map((s) => s.trim()))}
            />
          </div>
        </div>
      </section>

      {/* Education */}
      <section className="space-y-1">
        <h2 className="text-[11px] font-mono font-bold uppercase tracking-widest text-zinc-950 border-b border-zinc-300 pb-0.5">
          // CREDENTIALS & EDUCATION
        </h2>
        {data.education?.map((edu) => (
          <div key={edu.id} className="flex justify-between text-[11.5px] text-zinc-800">
            <span>
              <strong>
                <EditableText value={edu.degree} onChange={(v) => u.updateEducation(edu.id, 'degree', v)} />
              </strong>
              {', '}
              <EditableText value={edu.institution} onChange={(v) => u.updateEducation(edu.id, 'institution', v)} />
            </span>
            <span className="font-mono text-zinc-600 text-[11px]">
              <EditableText value={edu.period} onChange={(v) => u.updateEducation(edu.id, 'period', v)} />
            </span>
          </div>
        ))}
      </section>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   TEMPLATE 4: Harvard & Ivy League Classic (Serif)
   ────────────────────────────────────────────────────────────────────── */
export function IvyHarvardTemplate({ data, onUpdate }) {
  const u = createUpdaters(data, onUpdate);

  return (
    <div className="bg-white text-black font-serif p-8 sm:p-10 max-w-4xl mx-auto shadow-sm text-xs leading-relaxed space-y-4">
      {/* Header */}
      <header className="border-b border-black pb-3 text-center space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold uppercase tracking-wide text-black">
          <EditableText value={data.personalInfo.fullName} onChange={(v) => u.updatePersonal('fullName', v)} />
        </h1>
        <p className="italic text-stone-800 text-sm">
          <EditableText value={data.personalInfo.title} onChange={(v) => u.updatePersonal('title', v)} />
        </p>
        <div className="text-[11px] text-stone-700 space-x-2 pt-1 font-sans">
          <span>
            <EditableText value={data.personalInfo.location} onChange={(v) => u.updatePersonal('location', v)} />
          </span>
          <span>·</span>
          <span>
            <EditableText value={data.personalInfo.email} onChange={(v) => u.updatePersonal('email', v)} />
          </span>
          <span>·</span>
          <span>
            <EditableText value={data.personalInfo.phone} onChange={(v) => u.updatePersonal('phone', v)} />
          </span>
        </div>
      </header>

      {/* Summary */}
      <section className="space-y-1">
        <h2 className="text-xs font-bold uppercase tracking-widest text-black border-b border-stone-400 pb-0.5">
          Executive Summary
        </h2>
        <p className="text-stone-800 text-[12px] leading-relaxed text-justify">
          <EditableText value={data.summary} onChange={u.updateSummary} multiline={true} />
        </p>
      </section>

      {/* Experience */}
      <section className="space-y-3">
        <div className="flex justify-between items-center border-b border-stone-400 pb-0.5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-black">
            Professional Experience
          </h2>
          <SectionAddButton label="+ Add Experience" onClick={u.addExperience} />
        </div>
        {data.experience?.map((exp) => (
          <div key={exp.id} className="space-y-1">
            <div className="flex justify-between items-baseline font-bold text-black">
              <span className="text-[12.5px]">
                <EditableText value={exp.role} onChange={(v) => u.updateExperience(exp.id, 'role', v)} />
                {', '}
                <span className="italic font-normal">
                  <EditableText value={exp.company} onChange={(v) => u.updateExperience(exp.id, 'company', v)} />
                </span>
              </span>
              <span className="text-stone-700 font-sans text-[11px]">
                <EditableText value={exp.period} onChange={(v) => u.updateExperience(exp.id, 'period', v)} />
              </span>
            </div>
            <EditableBulletList
              bullets={exp.bullets}
              onChange={(bullets) => u.updateExperience(exp.id, 'bullets', bullets)}
              bulletClassName="text-stone-900 text-[11.5px]"
            />
          </div>
        ))}
      </section>

      {/* Education */}
      <section className="space-y-1.5">
        <h2 className="text-xs font-bold uppercase tracking-widest text-black border-b border-stone-400 pb-0.5">
          Education
        </h2>
        {data.education?.map((edu) => (
          <div key={edu.id} className="flex justify-between text-[12px] text-stone-900">
            <div>
              <strong>
                <EditableText value={edu.institution} onChange={(v) => u.updateEducation(edu.id, 'institution', v)} />
              </strong>
              {' — '}
              <span className="italic">
                <EditableText value={edu.degree} onChange={(v) => u.updateEducation(edu.id, 'degree', v)} />
              </span>
            </div>
            <span className="font-sans text-stone-700 text-[11px]">
              <EditableText value={edu.period} onChange={(v) => u.updateEducation(edu.id, 'period', v)} />
            </span>
          </div>
        ))}
      </section>

      {/* Skills */}
      <section className="space-y-1">
        <h2 className="text-xs font-bold uppercase tracking-widest text-black border-b border-stone-400 pb-0.5">
          Technical & Core Expertise
        </h2>
        <p className="text-stone-800 text-[11.5px] leading-relaxed">
          <strong>Languages & Architecture:</strong>{' '}
          <EditableText
            value={data.skills.languages?.join(', ')}
            onChange={(v) => u.updateSkillCategory('languages', v.split(',').map((s) => s.trim()))}
          />
          {'; '}
          <strong>Platforms & Cloud:</strong>{' '}
          <EditableText
            value={data.skills.infrastructure?.join(', ')}
            onChange={(v) => u.updateSkillCategory('infrastructure', v.split(',').map((s) => s.trim()))}
          />
        </p>
      </section>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   TEMPLATE 5: Modern Minimalist (Overleaf / LaTeX Style)
   ────────────────────────────────────────────────────────────────────── */
export function ModernLatexTemplate({ data, onUpdate }) {
  const u = createUpdaters(data, onUpdate);

  return (
    <div className="bg-white text-neutral-900 font-sans p-8 sm:p-10 max-w-4xl mx-auto shadow-sm text-xs leading-relaxed space-y-3.5">
      {/* Header */}
      <header className="text-center space-y-1 pb-2 border-b border-neutral-900">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-950">
          <EditableText value={data.personalInfo.fullName} onChange={(v) => u.updatePersonal('fullName', v)} />
        </h1>
        <div className="flex flex-wrap justify-center gap-3 text-[11px] text-neutral-600">
          <EditableText value={data.personalInfo.email} onChange={(v) => u.updatePersonal('email', v)} />
          <span>|</span>
          <EditableText value={data.personalInfo.phone} onChange={(v) => u.updatePersonal('phone', v)} />
          <span>|</span>
          <EditableText value={data.personalInfo.location} onChange={(v) => u.updatePersonal('location', v)} />
          <span>|</span>
          <EditableLink
            label={data.personalInfo.linkedinLabel || 'LinkedIn'}
            url={data.personalInfo.linkedin}
            onChange={({ label, url }) => {
              u.updatePersonal('linkedin', url);
              u.updatePersonal('linkedinLabel', label);
            }}
          />
        </div>
      </header>

      {/* Experience */}
      <section className="space-y-3">
        <div className="flex justify-between items-center border-b border-neutral-300 pb-0.5">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-neutral-950">
            EXPERIENCE
          </h2>
          <SectionAddButton label="+ Add Role" onClick={u.addExperience} />
        </div>
        {data.experience?.map((exp) => (
          <div key={exp.id} className="space-y-1">
            <div className="flex justify-between items-baseline font-bold text-neutral-950 text-xs">
              <span>
                <EditableText value={exp.role} onChange={(v) => u.updateExperience(exp.id, 'role', v)} />
                {' | '}
                <span className="font-normal text-neutral-700">
                  <EditableText value={exp.company} onChange={(v) => u.updateExperience(exp.id, 'company', v)} />
                </span>
              </span>
              <span className="font-normal text-neutral-600 text-[11px]">
                <EditableText value={exp.period} onChange={(v) => u.updateExperience(exp.id, 'period', v)} />
              </span>
            </div>
            <EditableBulletList
              bullets={exp.bullets}
              onChange={(bullets) => u.updateExperience(exp.id, 'bullets', bullets)}
              bulletClassName="text-neutral-800 text-[11.5px]"
            />
          </div>
        ))}
      </section>

      {/* Projects */}
      <section className="space-y-2.5">
        <div className="flex justify-between items-center border-b border-neutral-300 pb-0.5">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-neutral-950">
            PROJECTS
          </h2>
          <SectionAddButton label="+ Add Project" onClick={u.addProject} />
        </div>
        {data.projects?.map((proj) => (
          <div key={proj.id} className="space-y-0.5">
            <div className="flex justify-between items-baseline font-bold text-neutral-950">
              <span className="text-[12px]">
                <EditableText value={proj.name} onChange={(v) => u.updateProject(proj.id, 'name', v)} />
                <span className="font-normal text-neutral-600 text-[11px]">
                  {' — '}
                  <EditableText value={proj.tech} onChange={(v) => u.updateProject(proj.id, 'tech', v)} />
                </span>
              </span>
              <EditableLink
                label={proj.link}
                url={proj.url || proj.link}
                className="text-[11px] font-normal text-neutral-700 hover:text-blue-700"
                onChange={({ label, url }) => {
                  u.updateProject(proj.id, 'link', label);
                  u.updateProject(proj.id, 'url', url);
                }}
              />
            </div>
            <EditableBulletList
              bullets={proj.bullets}
              onChange={(bullets) => u.updateProject(proj.id, 'bullets', bullets)}
              bulletClassName="text-neutral-800 text-[11.5px]"
            />
          </div>
        ))}
      </section>

      {/* Technical Skills */}
      <section className="space-y-1">
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-neutral-950 border-b border-neutral-300 pb-0.5">
          TECHNICAL SKILLS
        </h2>
        <div className="text-[11.5px] text-neutral-800 space-y-0.5">
          <p>
            <strong>Languages:</strong>{' '}
            <EditableText
              value={data.skills.languages?.join(', ')}
              onChange={(v) => u.updateSkillCategory('languages', v.split(',').map((s) => s.trim()))}
            />
          </p>
          <p>
            <strong>Technologies & Cloud:</strong>{' '}
            <EditableText
              value={data.skills.infrastructure?.join(', ')}
              onChange={(v) => u.updateSkillCategory('infrastructure', v.split(',').map((s) => s.trim()))}
            />
          </p>
        </div>
      </section>

      {/* Education */}
      <section className="space-y-1">
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-neutral-950 border-b border-neutral-300 pb-0.5">
          EDUCATION
        </h2>
        {data.education?.map((edu) => (
          <div key={edu.id} className="flex justify-between text-[11.5px] text-neutral-800">
            <span>
              <strong>
                <EditableText value={edu.institution} onChange={(v) => u.updateEducation(edu.id, 'institution', v)} />
              </strong>
              {', '}
              <EditableText value={edu.degree} onChange={(v) => u.updateEducation(edu.id, 'degree', v)} />
            </span>
            <span className="text-neutral-600 text-[11px]">
              <EditableText value={edu.period} onChange={(v) => u.updateEducation(edu.id, 'period', v)} />
            </span>
          </div>
        ))}
      </section>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   TEMPLATE 6: Product Manager & Business Analyst
   ────────────────────────────────────────────────────────────────────── */
export function ProductManagerTemplate({ data, onUpdate }) {
  const u = createUpdaters(data, onUpdate);

  return (
    <div className="bg-white text-slate-900 font-sans p-8 sm:p-10 max-w-4xl mx-auto shadow-sm text-xs leading-relaxed space-y-4">
      <header className="border-b-2 border-slate-800 pb-3 flex justify-between items-end">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950">
            <EditableText value={data.personalInfo.fullName} onChange={(v) => u.updatePersonal('fullName', v)} />
          </h1>
          <p className="font-semibold text-slate-700 text-sm">
            <EditableText value="Senior Technical Product Manager" onChange={(v) => u.updatePersonal('title', v)} />
          </p>
        </div>
        <div className="text-right text-[11px] text-slate-600 space-y-0.5">
          <p>
            <EditableText value={data.personalInfo.email} onChange={(v) => u.updatePersonal('email', v)} />
            {' · '}
            <EditableText value={data.personalInfo.phone} onChange={(v) => u.updatePersonal('phone', v)} />
          </p>
          <p>
            <EditableText value={data.personalInfo.location} onChange={(v) => u.updatePersonal('location', v)} />
          </p>
        </div>
      </header>

      {/* Product Vision */}
      <section className="space-y-1">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5">
          Product Leadership & Strategy
        </h2>
        <p className="text-slate-700 text-[11.5px] leading-relaxed">
          <EditableText value={data.summary} onChange={u.updateSummary} multiline={true} />
        </p>
      </section>

      {/* Experience */}
      <section className="space-y-3">
        <div className="flex justify-between items-center border-b border-slate-300 pb-0.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Product & Engineering Leadership
          </h2>
          <SectionAddButton label="+ Add Role" onClick={u.addExperience} />
        </div>
        {data.experience?.map((exp) => (
          <div key={exp.id} className="space-y-1">
            <div className="flex justify-between items-baseline font-bold text-slate-900">
              <span className="text-xs">
                <EditableText value={exp.role} onChange={(v) => u.updateExperience(exp.id, 'role', v)} />
                {' — '}
                <span className="font-semibold text-slate-700">
                  <EditableText value={exp.company} onChange={(v) => u.updateExperience(exp.id, 'company', v)} />
                </span>
              </span>
              <span className="text-slate-600 font-normal text-[11px]">
                <EditableText value={exp.period} onChange={(v) => u.updateExperience(exp.id, 'period', v)} />
              </span>
            </div>
            <EditableBulletList
              bullets={exp.bullets}
              onChange={(bullets) => u.updateExperience(exp.id, 'bullets', bullets)}
              bulletClassName="text-slate-700 text-[11.5px]"
            />
          </div>
        ))}
      </section>

      {/* Competencies */}
      <section className="space-y-1">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5">
          Core Competencies & Product Stack
        </h2>
        <p className="text-slate-800 text-[11.5px]">
          <strong>Product Analytics:</strong> Mixpanel, Amplitude, Segment, SQL, Google Analytics · <strong>Methods:</strong> Scrum/Agile, OKR Frameworks, User Research, A/B Testing, Sprint Roadmapping
        </p>
      </section>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   TEMPLATE 7: Data Scientist & AI / ML Specialist
   ────────────────────────────────────────────────────────────────────── */
export function DataAiMlTemplate({ data, onUpdate }) {
  const u = createUpdaters(data, onUpdate);

  return (
    <div className="bg-white text-slate-900 font-sans p-8 sm:p-10 max-w-4xl mx-auto shadow-sm text-xs leading-relaxed space-y-4">
      <header className="border-b border-slate-900 pb-3 text-center space-y-1">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 uppercase">
          <EditableText value={data.personalInfo.fullName} onChange={(v) => u.updatePersonal('fullName', v)} />
        </h1>
        <p className="font-semibold text-slate-700 text-sm">
          <EditableText value="Staff AI & Machine Learning Scientist" onChange={(v) => u.updatePersonal('title', v)} />
        </p>
        <div className="flex flex-wrap justify-center gap-2 text-[11px] text-slate-600 pt-1">
          <EditableText value={data.personalInfo.email} onChange={(v) => u.updatePersonal('email', v)} />
          <span>•</span>
          <EditableText value={data.personalInfo.location} onChange={(v) => u.updatePersonal('location', v)} />
          <span>•</span>
          <EditableLink
            label="Kaggle / GitHub"
            url={data.personalInfo.github}
            onChange={({ label, url }) => u.updatePersonal('github', url)}
          />
        </div>
      </header>

      {/* Research & Modeling Summary */}
      <section className="space-y-1">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5">
          Model Engineering & Research Focus
        </h2>
        <p className="text-slate-700 text-[11.5px] leading-relaxed">
          <EditableText value={data.summary} onChange={u.updateSummary} multiline={true} />
        </p>
      </section>

      {/* Experience */}
      <section className="space-y-3">
        <div className="flex justify-between items-center border-b border-slate-300 pb-0.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Applied AI & Machine Learning Experience
          </h2>
          <SectionAddButton label="+ Add Role" onClick={u.addExperience} />
        </div>
        {data.experience?.map((exp) => (
          <div key={exp.id} className="space-y-1">
            <div className="flex justify-between items-baseline font-bold text-slate-900">
              <span className="text-xs">
                <EditableText value={exp.role} onChange={(v) => u.updateExperience(exp.id, 'role', v)} />
                {' — '}
                <span className="font-semibold text-slate-700">
                  <EditableText value={exp.company} onChange={(v) => u.updateExperience(exp.id, 'company', v)} />
                </span>
              </span>
              <span className="text-slate-600 font-normal text-[11px]">
                <EditableText value={exp.period} onChange={(v) => u.updateExperience(exp.id, 'period', v)} />
              </span>
            </div>
            <EditableBulletList
              bullets={exp.bullets}
              onChange={(bullets) => u.updateExperience(exp.id, 'bullets', bullets)}
              bulletClassName="text-slate-700 text-[11.5px]"
            />
          </div>
        ))}
      </section>

      {/* AI Stack */}
      <section className="space-y-1">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-0.5">
          AI & Machine Learning Infrastructure
        </h2>
        <p className="text-slate-800 text-[11.5px]">
          <strong>Deep Learning:</strong> PyTorch, JAX, HuggingFace Transformers, TensorRT, vLLM · <strong>Data Systems:</strong> Apache Spark, Ray Cluster, Databricks, PostgreSQL (pgvector), Pinecone, Milvus
        </p>
      </section>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   TEMPLATE 8: DevOps, Cloud & SRE Architect (Clean White Format)
   ────────────────────────────────────────────────────────────────────── */
export function DevOpsCloudTemplate({ data, onUpdate }) {
  const u = createUpdaters(data, onUpdate);

  return (
    <div className="bg-white text-stone-900 font-sans p-8 sm:p-10 max-w-4xl mx-auto shadow-sm text-xs leading-relaxed space-y-4">
      <header className="border-b-2 border-stone-800 pb-3 flex justify-between items-end">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-950 uppercase tracking-tight">
            <EditableText value={data.personalInfo.fullName} onChange={(v) => u.updatePersonal('fullName', v)} />
          </h1>
          <p className="font-bold text-stone-700 text-sm">
            <EditableText value="Lead DevOps & Cloud SRE Architect" onChange={(v) => u.updatePersonal('title', v)} />
          </p>
        </div>
        <div className="text-right text-[11px] text-stone-600 font-mono">
          <p>
            <EditableText value={data.personalInfo.email} onChange={(v) => u.updatePersonal('email', v)} />
          </p>
          <p>
            <EditableText value={data.personalInfo.location} onChange={(v) => u.updatePersonal('location', v)} />
            {' | SLA: 99.99%'}
          </p>
        </div>
      </header>

      {/* Mission */}
      <section className="space-y-1">
        <h2 className="text-xs font-mono font-bold uppercase text-stone-900 border-b border-stone-300 pb-0.5">
          Infrastructure Reliability Charter
        </h2>
        <p className="text-stone-700 text-[11.5px]">
          <EditableText value={data.summary} onChange={u.updateSummary} multiline={true} />
        </p>
      </section>

      {/* Cloud Deployments */}
      <section className="space-y-3">
        <div className="flex justify-between items-center border-b border-stone-300 pb-0.5">
          <h2 className="text-xs font-mono font-bold uppercase text-stone-900">
            Cloud Platform & Production Operations
          </h2>
          <SectionAddButton label="+ Add Role" onClick={u.addExperience} />
        </div>
        {data.experience?.map((exp) => (
          <div key={exp.id} className="space-y-1">
            <div className="flex justify-between items-baseline font-bold text-stone-950">
              <span className="text-xs">
                <EditableText value={exp.role} onChange={(v) => u.updateExperience(exp.id, 'role', v)} />
                {' @ '}
                <EditableText value={exp.company} onChange={(v) => u.updateExperience(exp.id, 'company', v)} />
              </span>
              <span className="font-mono text-stone-600 text-[11px]">
                <EditableText value={exp.period} onChange={(v) => u.updateExperience(exp.id, 'period', v)} />
              </span>
            </div>
            <EditableBulletList
              bullets={exp.bullets}
              onChange={(bullets) => u.updateExperience(exp.id, 'bullets', bullets)}
              bulletClassName="text-stone-800 text-[11.5px]"
            />
          </div>
        ))}
      </section>

      {/* Cloud Stack */}
      <section className="space-y-1">
        <h2 className="text-xs font-mono font-bold uppercase text-stone-900 border-b border-stone-300 pb-0.5">
          Cloud Toolchain & SRE Arsenal
        </h2>
        <p className="text-stone-800 text-[11.5px]">
          <strong>Cloud / Infra:</strong> Kubernetes, Docker, Terraform, Helm, AWS (EKS, VPC, CloudWatch), Prometheus, Grafana, Datadog
        </p>
      </section>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   TEMPLATE 9: Compact 1-Page Maximum Impact
   ────────────────────────────────────────────────────────────────────── */
export function CompactSinglePageTemplate({ data, onUpdate }) {
  const u = createUpdaters(data, onUpdate);

  return (
    <div className="bg-white text-slate-900 font-sans p-6 sm:p-8 max-w-4xl mx-auto shadow-sm text-[11px] leading-snug space-y-2.5">
      {/* Header */}
      <header className="border-b border-slate-900 pb-1.5 flex justify-between items-baseline">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-950 uppercase tracking-tight">
            <EditableText value={data.personalInfo.fullName} onChange={(v) => u.updatePersonal('fullName', v)} />
          </h1>
          <p className="font-bold text-slate-700 text-xs">
            <EditableText value={data.personalInfo.title} onChange={(v) => u.updatePersonal('title', v)} />
          </p>
        </div>
        <div className="text-right text-[10px] text-slate-600 space-y-0.5">
          <p>
            <EditableText value={data.personalInfo.email} onChange={(v) => u.updatePersonal('email', v)} />
            {' | '}
            <EditableText value={data.personalInfo.phone} onChange={(v) => u.updatePersonal('phone', v)} />
          </p>
          <p>
            <EditableText value={data.personalInfo.location} onChange={(v) => u.updatePersonal('location', v)} />
          </p>
        </div>
      </header>

      {/* Summary */}
      <section className="space-y-0.5">
        <h2 className="text-[10.5px] font-bold uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-0.5">
          Profile Summary
        </h2>
        <p className="text-slate-800 text-[10.5px]">
          <EditableText value={data.summary} onChange={u.updateSummary} multiline={true} />
        </p>
      </section>

      {/* Experience */}
      <section className="space-y-2">
        <div className="flex justify-between items-center border-b border-slate-300 pb-0.5">
          <h2 className="text-[10.5px] font-bold uppercase tracking-wider text-slate-950">
            Work Experience
          </h2>
          <SectionAddButton label="+ Add" onClick={u.addExperience} />
        </div>
        {data.experience?.map((exp) => (
          <div key={exp.id} className="space-y-0.5">
            <div className="flex justify-between items-baseline font-bold text-slate-950">
              <span>
                <EditableText value={exp.role} onChange={(v) => u.updateExperience(exp.id, 'role', v)} />
                {' — '}
                <span className="font-semibold text-slate-700">
                  <EditableText value={exp.company} onChange={(v) => u.updateExperience(exp.id, 'company', v)} />
                </span>
              </span>
              <span className="text-slate-500 font-normal text-[10px]">
                <EditableText value={exp.period} onChange={(v) => u.updateExperience(exp.id, 'period', v)} />
              </span>
            </div>
            <EditableBulletList
              bullets={exp.bullets}
              onChange={(bullets) => u.updateExperience(exp.id, 'bullets', bullets)}
              bulletClassName="text-slate-800 text-[10.5px]"
            />
          </div>
        ))}
      </section>

      {/* Skills */}
      <section className="space-y-0.5">
        <h2 className="text-[10.5px] font-bold uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-0.5">
          Skills & Technologies
        </h2>
        <p className="text-slate-800 text-[10.5px]">
          <strong>Tech:</strong> {data.skills.languages?.join(', ')}, {data.skills.infrastructure?.join(', ')}, {data.skills.databases?.join(', ')}
        </p>
      </section>

      {/* Education */}
      <section className="space-y-0.5">
        <h2 className="text-[10.5px] font-bold uppercase tracking-wider text-slate-950 border-b border-slate-300 pb-0.5">
          Education
        </h2>
        {data.education?.map((edu) => (
          <div key={edu.id} className="flex justify-between text-[10.5px] text-slate-800">
            <span>
              <strong>
                <EditableText value={edu.degree} onChange={(v) => u.updateEducation(edu.id, 'degree', v)} />
              </strong>
              {', '}
              <EditableText value={edu.institution} onChange={(v) => u.updateEducation(edu.id, 'institution', v)} />
            </span>
            <span className="text-slate-600 text-[10px]">
              <EditableText value={edu.period} onChange={(v) => u.updateEducation(edu.id, 'period', v)} />
            </span>
          </div>
        ))}
      </section>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────────────
   TEMPLATE 10: Creative / Modern Developer Showcase
   ────────────────────────────────────────────────────────────────────── */
export function CreativeTechTemplate({ data, onUpdate }) {
  const u = createUpdaters(data, onUpdate);

  return (
    <div className="bg-white text-stone-900 font-sans p-8 sm:p-10 max-w-4xl mx-auto shadow-sm text-xs leading-relaxed space-y-4">
      {/* Header */}
      <header className="border-b-2 border-stone-900 pb-3 flex flex-col sm:flex-row justify-between sm:items-end gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-stone-950 uppercase tracking-tight">
            <EditableText value={data.personalInfo.fullName} onChange={(v) => u.updatePersonal('fullName', v)} />
          </h1>
          <p className="font-bold text-stone-700 text-sm">
            <EditableText value={data.personalInfo.title} onChange={(v) => u.updatePersonal('title', v)} />
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-[11px] text-stone-700 font-mono">
          <EditableLink
            label="🌐 Portfolio"
            url={data.personalInfo.website}
            onChange={({ label, url }) => u.updatePersonal('website', url)}
          />
          <span>·</span>
          <EditableLink
            label="🐙 GitHub"
            url={data.personalInfo.github}
            onChange={({ label, url }) => u.updatePersonal('github', url)}
          />
          <span>·</span>
          <EditableLink
            label="💼 LinkedIn"
            url={data.personalInfo.linkedin}
            onChange={({ label, url }) => u.updatePersonal('linkedin', url)}
          />
        </div>
      </header>

      {/* Bio */}
      <section className="space-y-1">
        <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900 border-b border-stone-300 pb-0.5">
          Engineering Philosophy
        </h2>
        <p className="text-stone-800 text-[11.5px] leading-relaxed">
          <EditableText value={data.summary} onChange={u.updateSummary} multiline={true} />
        </p>
      </section>

      {/* Projects Showcase */}
      <section className="space-y-3">
        <div className="flex justify-between items-center border-b border-stone-300 pb-0.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900">
            Open Source & Key Software Projects
          </h2>
          <SectionAddButton label="+ Add Project" onClick={u.addProject} />
        </div>
        {data.projects?.map((proj) => (
          <div key={proj.id} className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-1">
            <div className="flex justify-between items-baseline font-bold text-stone-950">
              <span className="text-[12px]">
                <EditableText value={proj.name} onChange={(v) => u.updateProject(proj.id, 'name', v)} />
              </span>
              <EditableLink
                label={proj.link}
                url={proj.url || proj.link}
                className="text-[11px] font-mono text-blue-700"
                onChange={({ label, url }) => {
                  u.updateProject(proj.id, 'link', label);
                  u.updateProject(proj.id, 'url', url);
                }}
              />
            </div>
            <p className="text-stone-600 text-[10.5px] font-mono">
              Stack: <EditableText value={proj.tech} onChange={(v) => u.updateProject(proj.id, 'tech', v)} />
            </p>
            <EditableBulletList
              bullets={proj.bullets}
              onChange={(bullets) => u.updateProject(proj.id, 'bullets', bullets)}
              bulletClassName="text-stone-800 text-[11.5px]"
            />
          </div>
        ))}
      </section>

      {/* Experience */}
      <section className="space-y-3">
        <div className="flex justify-between items-center border-b border-stone-300 pb-0.5">
          <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900">
            Professional Experience
          </h2>
          <SectionAddButton label="+ Add Role" onClick={u.addExperience} />
        </div>
        {data.experience?.map((exp) => (
          <div key={exp.id} className="space-y-1">
            <div className="flex justify-between items-baseline font-bold text-stone-950">
              <span className="text-xs">
                <EditableText value={exp.role} onChange={(v) => u.updateExperience(exp.id, 'role', v)} />
                {' — '}
                <span className="font-semibold text-stone-700">
                  <EditableText value={exp.company} onChange={(v) => u.updateExperience(exp.id, 'company', v)} />
                </span>
              </span>
              <span className="text-stone-600 font-normal text-[11px]">
                <EditableText value={exp.period} onChange={(v) => u.updateExperience(exp.id, 'period', v)} />
              </span>
            </div>
            <EditableBulletList
              bullets={exp.bullets}
              onChange={(bullets) => u.updateExperience(exp.id, 'bullets', bullets)}
              bulletClassName="text-stone-800 text-[11.5px]"
            />
          </div>
        ))}
      </section>
    </div>
  );
}

/**
 * ══════════════════════════════════════════════════════════════════════
 * 🎯 Universal Template Dispatcher
 * Renders any of the 10 White Professional ATS Templates
 * ══════════════════════════════════════════════════════════════════════
 */
export default function UniversalResumeRenderer({ templateId, data, onUpdate, density = 'standard', readOnly = false }) {
  const densityStyles = {
    compact: '[&_section]:space-y-1.5 [&_ul]:space-y-0.5 [&_h1]:text-2xl [&_h2]:text-[11px] [&_p]:text-[10.5px] [&_li]:text-[10.5px] leading-tight',
    standard: '[&_section]:space-y-3 [&_ul]:space-y-1 [&_h1]:text-3xl [&_h2]:text-xs [&_p]:text-[11.5px] [&_li]:text-[11.5px] leading-relaxed',
    spacious: '[&_section]:space-y-4 [&_ul]:space-y-1.5 [&_h1]:text-4xl [&_h2]:text-[13px] [&_p]:text-xs [&_li]:text-xs leading-normal',
  }[density] || '';

  const renderContent = () => {
    switch (templateId) {
      case 'fresher_ats':
        return <FresherStandardTemplate data={data} onUpdate={onUpdate} />;
      case 'tech_lead_staff':
        return <TechLeadStaffTemplate data={data} onUpdate={onUpdate} />;
      case 'ivy_harvard':
        return <IvyHarvardTemplate data={data} onUpdate={onUpdate} />;
      case 'modern_latex':
        return <ModernLatexTemplate data={data} onUpdate={onUpdate} />;
      case 'product_manager':
        return <ProductManagerTemplate data={data} onUpdate={onUpdate} />;
      case 'data_ai_ml':
        return <DataAiMlTemplate data={data} onUpdate={onUpdate} />;
      case 'devops_cloud':
        return <DevOpsCloudTemplate data={data} onUpdate={onUpdate} />;
      case 'compact_single_page':
        return <CompactSinglePageTemplate data={data} onUpdate={onUpdate} />;
      case 'creative_tech':
        return <CreativeTechTemplate data={data} onUpdate={onUpdate} />;
      case 'experienced_swe':
      default:
        return <ExperiencedSweTemplate data={data} onUpdate={onUpdate} />;
    }
  };

  return (
    <ResumeReadOnlyContext.Provider value={readOnly}>
      <div className={`w-full transition-all duration-150 ${densityStyles}`}>
        {renderContent()}
      </div>
    </ResumeReadOnlyContext.Provider>
  );
}
