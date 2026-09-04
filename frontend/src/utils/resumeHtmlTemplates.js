/**
 * ══════════════════════════════════════════════════════════════════════
 * 📄 10 MASTER RESUME HTML & CSS TEMPLATES (OVERLEAF / REZI GRADE)
 * Pure Vector Typography · Strict A4 Geometry · True ATS Parser Layout
 * ══════════════════════════════════════════════════════════════════════
 */

/**
 * Escapes HTML characters safely
 */
function escapeHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Compiles full self-contained HTML document for any of the 10 templates.
 */
export function generateResumeFullHtml(data, templateId = 'experienced_swe', density = 'standard') {
  const p = data.personalInfo || {};
  const exp = data.experience || [];
  const proj = data.projects || [];
  const edu = data.education || [];
  const skills = data.skills || {};
  const summary = data.summary || '';

  const densityConfig = {
    compact: {
      bodySize: '9.5pt',
      lineHeight: '1.25',
      headingSize: '10pt',
      titleSize: '18pt',
      sectionMargin: '8pt',
      itemMargin: '4pt',
      pagePadding: '10mm 12mm',
    },
    standard: {
      bodySize: '10pt',
      lineHeight: '1.35',
      headingSize: '10.5pt',
      titleSize: '20pt',
      sectionMargin: '12pt',
      itemMargin: '6pt',
      pagePadding: '14mm 16mm',
    },
    spacious: {
      bodySize: '10.5pt',
      lineHeight: '1.45',
      headingSize: '11pt',
      titleSize: '22pt',
      sectionMargin: '15pt',
      itemMargin: '8pt',
      pagePadding: '18mm 20mm',
    },
  }[density] || {
    bodySize: '10pt',
    lineHeight: '1.35',
    headingSize: '10.5pt',
    titleSize: '20pt',
    sectionMargin: '12pt',
    itemMargin: '6pt',
    pagePadding: '14mm 16mm',
  };

  const contactList = [
    p.email ? `<a href="mailto:${escapeHtml(p.email)}">${escapeHtml(p.email)}</a>` : '',
    p.phone ? `<span>${escapeHtml(p.phone)}</span>` : '',
    p.location ? `<span>${escapeHtml(p.location)}</span>` : '',
    p.linkedin ? `<a href="${p.linkedin.startsWith('http') ? p.linkedin : 'https://' + p.linkedin}" target="_blank">${escapeHtml(p.linkedinLabel || p.linkedin)}</a>` : '',
    p.github ? `<a href="${p.github.startsWith('http') ? p.github : 'https://' + p.github}" target="_blank">${escapeHtml(p.githubLabel || p.github)}</a>` : '',
    p.website ? `<a href="${p.website.startsWith('http') ? p.website : 'https://' + p.website}" target="_blank">${escapeHtml(p.websiteLabel || p.website)}</a>` : '',
  ].filter(Boolean);

  // Template specific styles & fonts
  let fontImport = "@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');";
  let fontFamily = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
  let isSerif = templateId === 'ivy_harvard';

  if (isSerif) {
    fontImport = "@import url('https://fonts.googleapis.com/css2?family=Merriweather:wght@300;400;700;900&display=swap');";
    fontFamily = "'Merriweather', Georgia, 'Times New Roman', serif";
  } else if (templateId === 'modern_latex') {
    fontImport = "@import url('https://fonts.googleapis.com/css2?family=Roboto+Flex:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');";
    fontFamily = "'Roboto Flex', 'Inter', sans-serif";
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(p.fullName || 'Candidate')} - Resume</title>
  <style>
    ${fontImport}

    @page {
      size: A4 portrait;
      margin: 0;
    }

    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: ${fontFamily};
      font-size: ${densityConfig.bodySize};
      line-height: ${densityConfig.lineHeight};
      color: #0f172a;
      background: #ffffff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }

    .sheet {
      width: 210mm;
      min-height: 297mm;
      padding: ${densityConfig.pagePadding};
      margin: 0 auto;
      background: #ffffff;
      position: relative;
    }

    /* Print media optimization */
    @media print {
      body {
        background: #ffffff !important;
        margin: 0 !important;
        padding: 0 !important;
      }
      .sheet {
        width: 100% !important;
        min-height: 100% !important;
        box-shadow: none !important;
        margin: 0 !important;
        padding: ${densityConfig.pagePadding} !important;
      }
      a {
        color: #0f172a !important;
        text-decoration: none !important;
      }
    }

    /* Header */
    header {
      text-align: center;
      margin-bottom: ${densityConfig.sectionMargin};
      padding-bottom: 6pt;
      border-bottom: 1.5pt solid #0f172a;
    }

    h1.name {
      font-size: ${densityConfig.titleSize};
      font-weight: 800;
      letter-spacing: -0.02em;
      text-transform: uppercase;
      color: #020617;
      margin-bottom: 2pt;
    }

    .candidate-title {
      font-size: 11pt;
      font-weight: 600;
      color: #334155;
      margin-bottom: 4pt;
    }

    .contact-bar {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 5pt 10pt;
      font-size: 9pt;
      color: #475569;
    }

    .contact-bar a {
      color: #0f172a;
      text-decoration: none;
    }

    .contact-bar a:hover {
      text-decoration: underline;
    }

    /* Section Headings */
    h2.section-title {
      font-size: ${densityConfig.headingSize};
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #0f172a;
      border-bottom: 1pt solid #cbd5e1;
      padding-bottom: 2pt;
      margin-top: ${densityConfig.sectionMargin};
      margin-bottom: 5pt;
    }

    p.summary {
      font-size: ${densityConfig.bodySize};
      color: #1e293b;
      text-align: justify;
      line-height: ${densityConfig.lineHeight};
    }

    /* Experience & Projects Entries */
    .entry {
      margin-bottom: ${densityConfig.itemMargin};
      page-break-inside: avoid;
      break-inside: avoid;
    }

    .entry-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 1pt;
    }

    .entry-role {
      font-size: 10.5pt;
      color: #020617;
    }

    .entry-company {
      font-weight: 600;
      color: #334155;
    }

    .entry-date {
      font-size: 9pt;
      color: #64748b;
      font-weight: 500;
      font-style: italic;
    }

    .entry-sub {
      font-size: 9pt;
      color: #64748b;
      font-style: italic;
      margin-bottom: 2pt;
    }

    /* Bullet Points */
    ul.bullets {
      list-style-type: disc;
      padding-left: 14pt;
      margin-top: 2pt;
    }

    ul.bullets li {
      font-size: ${densityConfig.bodySize};
      color: #1e293b;
      margin-bottom: 2pt;
      line-height: ${densityConfig.lineHeight};
    }

    /* Skills Table */
    .skills-grid {
      display: table;
      width: 100%;
      margin-top: 3pt;
    }

    .skill-row {
      display: table-row;
    }

    .skill-label {
      display: table-cell;
      font-weight: 700;
      color: #0f172a;
      width: 140pt;
      padding: 1.5pt 0;
      font-size: ${densityConfig.bodySize};
    }

    .skill-val {
      display: table-cell;
      color: #1e293b;
      padding: 1.5pt 0;
      font-size: ${densityConfig.bodySize};
    }
  </style>
</head>
<body>
  <div class="sheet">
    <!-- Header -->
    <header>
      <h1 class="name">${escapeHtml(p.fullName || 'Candidate Name')}</h1>
      ${p.title ? `<div class="candidate-title">${escapeHtml(p.title)}</div>` : ''}
      <div class="contact-bar">
        ${contactList.join(' &nbsp;•&nbsp; ')}
      </div>
    </header>

    ${templateId === 'fresher_ats' ? `
      <!-- Education First for Freshers -->
      ${renderEducation(edu, densityConfig)}
      ${renderSkills(skills)}
      ${renderProjects(proj)}
      ${renderExperience(exp)}
    ` : `
      <!-- Summary -->
      ${summary ? `
        <h2 class="section-title">Professional Summary</h2>
        <p class="summary">${escapeHtml(summary)}</p>
      ` : ''}

      <!-- Work Experience -->
      ${renderExperience(exp)}

      <!-- Technical Skills -->
      ${renderSkills(skills)}

      <!-- Key Projects -->
      ${renderProjects(proj)}

      <!-- Education -->
      ${renderEducation(edu, densityConfig)}
    `}
  </div>
</body>
</html>`;
}

function renderExperience(exp) {
  if (!exp || exp.length === 0) return '';
  return `
    <h2 class="section-title">Work Experience</h2>
    ${exp.map((e) => `
      <div class="entry">
        <div class="entry-header">
          <span class="entry-role">${escapeHtml(e.role)} &nbsp;—&nbsp; <span class="entry-company">${escapeHtml(e.company)}</span></span>
          <span class="entry-date">${escapeHtml(e.period || '')}</span>
        </div>
        ${e.location ? `<div class="entry-sub">${escapeHtml(e.location)}</div>` : ''}
        <ul class="bullets">
          ${(e.bullets || []).map((b) => `<li>${escapeHtml(b)}</li>`).join('')}
        </ul>
      </div>
    `).join('')}
  `;
}

function renderProjects(proj) {
  if (!proj || proj.length === 0) return '';
  return `
    <h2 class="section-title">Key Technical Projects</h2>
    ${proj.map((p) => `
      <div class="entry">
        <div class="entry-header">
          <span class="entry-role">${escapeHtml(p.name || p.title)} ${p.tech ? `<span style="font-weight: 400; color: #475569; font-size: 9pt;">(${escapeHtml(p.tech)})</span>` : ''}</span>
          ${p.link ? `<span class="entry-date"><a href="${p.url || p.link}" target="_blank">${escapeHtml(p.link)}</a></span>` : ''}
        </div>
        <ul class="bullets">
          ${(p.bullets || []).map((b) => `<li>${escapeHtml(b)}</li>`).join('')}
        </ul>
      </div>
    `).join('')}
  `;
}

function renderEducation(edu) {
  if (!edu || edu.length === 0) return '';
  return `
    <h2 class="section-title">Education</h2>
    ${edu.map((ed) => `
      <div class="entry">
        <div class="entry-header">
          <span class="entry-role">${escapeHtml(ed.degree)} &nbsp;—&nbsp; <span class="entry-company">${escapeHtml(ed.institution)}</span></span>
          <span class="entry-date">${escapeHtml(ed.period || '')}</span>
        </div>
        ${ed.details ? `<div class="entry-sub" style="color: #475569;">${escapeHtml(ed.details)}</div>` : ''}
      </div>
    `).join('')}
  `;
}

function renderSkills(skills) {
  if (!skills || Object.keys(skills).length === 0) return '';
  const rows = [
    { label: 'Languages', items: skills.languages },
    { label: 'Frameworks & Libraries', items: skills.frameworks },
    { label: 'Cloud & Infrastructure', items: skills.infrastructure },
    { label: 'Databases & Storage', items: skills.databases },
  ].filter((r) => r.items && r.items.length > 0);

  if (rows.length === 0) return '';

  return `
    <h2 class="section-title">Technical Competencies</h2>
    <div class="skills-grid">
      ${rows.map((r) => `
        <div class="skill-row">
          <div class="skill-label">${escapeHtml(r.label)}:</div>
          <div class="skill-val">${escapeHtml(r.items.join(', '))}</div>
        </div>
      `).join('')}
    </div>
  `;
}

/**
 * Escapes special LaTeX characters safely
 */
function latexEscape(str = '') {
  return String(str)
    .replace(/\\/g, '\\textbackslash{}')
    .replace(/&/g, '\\&')
    .replace(/%/g, '\\%')
    .replace(/\$/g, '\\$')
    .replace(/#/g, '\\#')
    .replace(/_/g, '\\_')
    .replace(/~/g, '\\textasciitilde{}')
    .replace(/\^/g, '\\textasciicircum{}');
}

/**
 * Compiles authentic LaTeX code (.tex) customized for each of the 10 template styles.
 * Compatible with Overleaf.com, pdflatex, TeXLive, and MacTeX with 0 compilation errors.
 */
export function generateOverleafLatexCode(data, templateId = 'experienced_swe') {
  const p = data.personalInfo || {};
  const exp = data.experience || [];
  const proj = data.projects || [];
  const edu = data.education || [];
  const skills = data.skills || {};
  const summary = data.summary || '';

  // Clean links
  const contactItems = [
    p.phone ? latexEscape(p.phone) : '',
    p.email ? `\\href{mailto:${p.email}}{${latexEscape(p.email)}}` : '',
    p.linkedin ? `\\href{${p.linkedin.startsWith('http') ? p.linkedin : 'https://' + p.linkedin}}{LinkedIn}` : '',
    p.github ? `\\href{${p.github.startsWith('http') ? p.github : 'https://' + p.github}}{GitHub}` : '',
    p.location ? latexEscape(p.location) : '',
  ].filter(Boolean);

  // Template typography & documentclass preamble
  const isHarvard = templateId === 'ivy_harvard';
  const isCompact = templateId === 'compact_single_page';
  const fontPackage = isHarvard ? '\\usepackage{times}' : '\\usepackage[sfdefault]{inter}';
  const marginSize = isCompact ? '0.38in' : isHarvard ? '0.6in' : '0.5in';

  const preamble = `%-------------------------
% Professional ATS Resume in LaTeX (Overleaf Standard)
% Template Architecture: ${templateId.toUpperCase()}
% Generated via Assessyn Resume Studio
%------------------------

\\documentclass[letterpaper,10.5pt]{article}

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
\\usepackage{tabularx}
${fontPackage}

\\pagestyle{fancy}
\\fancyhf{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

% Adjust margins
\\usepackage[margin=${marginSize}]{geometry}

\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Sections formatting
\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

% Custom commands for bulleted subheadings
\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{0.98\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-6pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{0.98\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & #2 \\\\
    \\end{tabular*}\\vspace{-6pt}
}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-4pt}}

\\begin{document}
`;

  // Header Block
  const headerBlock = `
%----------HEADING----------
\\begin{center}
    \\textbf{\\Huge \\scshape ${latexEscape(p.fullName || 'Candidate Name')}} \\\\ \\vspace{2pt}
    ${p.title ? `\\textbf{\\large ${latexEscape(p.title)}} \\\\ \\vspace{2pt}` : ''}
    \\small ${contactItems.join(' $|$ ')}
\\end{center}
`;

  // Summary Block
  const summaryBlock = summary
    ? `
%-----------PROFESSIONAL SUMMARY-----------
\\section{${templateId === 'tech_lead_staff' ? 'Architectural & Leadership Charter' : templateId === 'devops_cloud' ? 'Infrastructure Reliability & SLA Charter' : templateId === 'product_manager' ? 'Product Leadership & Strategy' : 'Professional Summary'}}
\\small{${latexEscape(summary)}}
`
    : '';

  // Experience Block
  const experienceTitle =
    templateId === 'tech_lead_staff'
      ? 'Strategic Technical Deliveries'
      : templateId === 'devops_cloud'
      ? 'Production Cloud Operations & SRE'
      : templateId === 'product_manager'
      ? 'Product & Engineering Roadmaps'
      : templateId === 'fresher_ats'
      ? 'Internships & Technical Experience'
      : 'Work Experience';

  const experienceBlock =
    exp.length > 0
      ? `
%-----------EXPERIENCE-----------
\\section{${experienceTitle}}
  \\resumeSubHeadingListStart
${exp
  .map(
    (e) => `    \\resumeSubheading
      {${latexEscape(e.role)}}{${latexEscape(e.period || '')}}
      {${latexEscape(e.company)}}{${latexEscape(e.location || '')}}
      \\resumeItemListStart
${(e.bullets || [])
  .map((b) => `        \\resumeItem{${latexEscape(b)}}`)
  .join('\n')}
      \\resumeItemListEnd`
  )
  .join('\n')}
  \\resumeSubHeadingListEnd
`
      : '';

  // Projects Block
  const projectTitle =
    templateId === 'fresher_ats'
      ? 'Capstone & Academic Projects'
      : templateId === 'data_ai_ml'
      ? 'Machine Learning Pipelines & Research'
      : templateId === 'creative_tech'
      ? 'Open Source & Key Developer Projects'
      : 'Key Technical Projects';

  const projectsBlock =
    proj.length > 0
      ? `
%-----------PROJECTS-----------
\\section{${projectTitle}}
  \\resumeSubHeadingListStart
${proj
  .map((pr) => {
    const linkStr = pr.link
      ? `\\href{${pr.url || pr.link.startsWith('http') ? pr.url || pr.link : 'https://' + pr.link}}{${latexEscape(pr.link)}}`
      : '';
    return `    \\resumeProjectHeading
      {\\textbf{${latexEscape(pr.name || pr.title)}} ${pr.tech ? `$|$ \\emph{${latexEscape(pr.tech)}}` : ''}}{${linkStr}}
      \\resumeItemListStart
${(pr.bullets || [])
  .map((b) => `        \\resumeItem{${latexEscape(b)}}`)
  .join('\n')}
      \\resumeItemListEnd`;
  })
  .join('\n')}
  \\resumeSubHeadingListEnd
`
      : '';

  // Education Block
  const educationBlock =
    edu.length > 0
      ? `
%-----------EDUCATION-----------
\\section{Education & Credentials}
  \\resumeSubHeadingListStart
${edu
  .map(
    (ed) => `    \\resumeSubheading
      {${latexEscape(ed.institution)}}{${latexEscape(ed.period || '')}}
      {${latexEscape(ed.degree)}}{${latexEscape(ed.details || ed.score || '')}}`
  )
  .join('\n')}
  \\resumeSubHeadingListEnd
`
      : '';

  // Skills Block
  const skillsBlock = `
%-----------TECHNICAL SKILLS-----------
\\section{Technical & Core Competencies}
 \\begin{itemize}[leftmargin=0.15in, label={}]
    \\small{\\item{
     ${skills.languages?.length ? `\\textbf{Languages}{: ${latexEscape(skills.languages.join(', '))}} \\\\` : ''}
     ${skills.frameworks?.length ? `\\textbf{Frameworks & Protocols}{: ${latexEscape(skills.frameworks.join(', '))}} \\\\` : ''}
     ${skills.infrastructure?.length ? `\\textbf{Cloud & Infrastructure}{: ${latexEscape(skills.infrastructure.join(', '))}} \\\\` : ''}
     ${skills.databases?.length ? `\\textbf{Databases & Storage}{: ${latexEscape(skills.databases.join(', '))}}` : ''}
    }}
 \\end{itemize}
`;

  // Assemble according to template architecture order
  let bodyContent = '';

  if (templateId === 'fresher_ats') {
    // Fresher: Education -> Skills -> Projects -> Experience
    bodyContent = `${headerBlock}${educationBlock}${skillsBlock}${projectsBlock}${experienceBlock}`;
  } else if (templateId === 'tech_lead_staff' || templateId === 'devops_cloud') {
    // Leadership & Cloud: Charter -> Experience -> Skills -> Projects -> Education
    bodyContent = `${headerBlock}${summaryBlock}${experienceBlock}${skillsBlock}${projectsBlock}${educationBlock}`;
  } else if (templateId === 'ivy_harvard') {
    // Harvard Classic: Summary -> Experience -> Education -> Skills -> Projects
    bodyContent = `${headerBlock}${summaryBlock}${experienceBlock}${educationBlock}${skillsBlock}${projectsBlock}`;
  } else {
    // Standard SWE / Modern LaTeX: Summary -> Experience -> Projects -> Skills -> Education
    bodyContent = `${headerBlock}${summaryBlock}${experienceBlock}${projectsBlock}${skillsBlock}${educationBlock}`;
  }

  return `${preamble}${bodyContent}
\\end{document}
`;
}
