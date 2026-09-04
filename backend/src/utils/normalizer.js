const ABBREVIATIONS = [
  // Languages & runtimes
  [/\bJS\b/g,          'JavaScript'],
  [/\bTS\b/g,          'TypeScript'],
  [/\bPY\b/g,          'Python'],
  [/\bRB\b/g,          'Ruby'],
  [/\bGO\b(?!\s*lang)/gi, 'Golang'],
  [/\bRS\b/g,          'Rust'],
  [/\bKT\b/g,          'Kotlin'],
  [/\bSW\b/g,          'Swift'],

  // Frameworks & libraries
  [/\bRJS\b/g,         'React.js'],
  [/\bVJS\b/g,         'Vue.js'],
  [/\bNJS\b/g,         'Node.js'],
  [/\bNEXT\b(?!\.\s*js)/gi, 'Next.js'],
  [/\bEXP\b/g,         'Express.js'],

  // Cloud & DevOps
  [/\bAWS\b/g,         'Amazon Web Services'],
  [/\bGCP\b/g,         'Google Cloud Platform'],
  [/\bAZ\b/g,          'Microsoft Azure'],
  [/\bK8S\b/gi,        'Kubernetes'],
  [/\bK8\b/gi,         'Kubernetes'],
  [/\bCI\/CD\b/gi,     'Continuous Integration and Continuous Delivery'],
  [/\bIaC\b/g,         'Infrastructure as Code'],

  // Databases
  [/\bPG\b/g,          'PostgreSQL'],
  [/\bMDB\b/g,         'MongoDB'],
  [/\bMSSQL\b/g,       'Microsoft SQL Server'],
  [/\bSQLite\b/gi,     'SQLite'],

  // Protocols & concepts
  [/\bREST\b/g,        'REST API'],
  [/\bGQL\b/g,         'GraphQL'],
  [/\bOOP\b/g,         'Object-Oriented Programming'],
  [/\bFP\b/g,          'Functional Programming'],
  [/\bTDD\b/g,         'Test-Driven Development'],
  [/\bBDD\b/g,         'Behavior-Driven Development'],
  [/\bDDD\b/g,         'Domain-Driven Design'],
  [/\bMVC\b/g,         'Model-View-Controller'],
  [/\bAPI\b/g,         'API'],
  [/\bSDK\b/g,         'SDK'],
  [/\bLLM\b/g,         'Large Language Model'],
  [/\bNLP\b/g,         'Natural Language Processing'],
  [/\bML\b/g,          'Machine Learning'],
  [/\bAI\b/g,          'Artificial Intelligence'],
  [/\bDL\b/g,          'Deep Learning'],
  [/\bRAG\b/g,         'Retrieval-Augmented Generation'],

  // Common resume abbreviations
  [/\byrs?\b/gi,       'years'],
  [/\bmos?\b/gi,       'months'],
  [/\bsr\.?\b/gi,      'Senior'],
  [/\bjr\.?\b/gi,      'Junior'],
  [/\bmgr\.?\b/gi,     'Manager'],
  [/\bdev\.?\b/gi,     'Developer'],
  [/\beng\.?\b/gi,     'Engineer'],
  [/\barch\.?\b/gi,    'Architect'],
  [/\bswe\b/gi,        'Software Engineer'],
  [/\bpm\b/gi,         'Project Manager'],
  [/\bpo\b/gi,         'Product Owner'],
  [/\bui\b/gi,         'User Interface'],
  [/\bux\b/gi,         'User Experience'],
  [/\bqa\b/gi,         'Quality Assurance'],
  [/\bdba\b/gi,        'Database Administrator'],
];

const NOISE_RULES = [
  [/[\uFEFF\u200B\u200C\u200D\u00AD]/g, ''],
  [/^[\s\-_=*•·.]{3,}$/gm, ''],
  [/^[\s]*[•●◦▸▹►▷◆◇■□✓✔✗✘\-–—]+\s*/gm, ''],
  [/\(\s*\)|\[\s*\]|\{\s*\}/g, ''],
  [/[\w.+-]+@[\w-]+\.[a-z]{2,}/gi, '[email]'],
  [/(\+?\d[\d\s\-().]{7,}\d)/g, '[phone]'],
  [/https?:\/\/\S+/gi, '[url]'],
  [/([!?.,;:\-_=*])\1{2,}/g, '$1'],
  [/[^\x00-\x7F]/g, ' '],
  [/[ \t]{2,}/g, ' '],
  [/(\r?\n){3,}/g, '\n\n'],
];

const PROTECTED_TOKENS = [
  /\b(Node\.js|React\.js|Vue\.js|Next\.js|Express\.js|Angular\.js|Svelte\.js)\b/gi,
  /\.(ts|tsx|js|jsx|py|rb|go|rs|java|cs|cpp|c|sh|yaml|yml|json|env)\b/gi,
  /\b(JSON|YAML|TOML|HTML|CSS|SCSS|SASS|DOM|SQL|NoSQL|GraphQL|gRPC|OAuth|JWT|CORS|CSRF|XSS|HTTPS|HTTP|WebSocket|WebRTC|WASM)\b/gi,
  /\b(ES\d+|ECMAScript|v\d[\d.]*)\b/gi,
];

export function normalizeText(text) {
  if (!text || typeof text !== 'string') return '';

  let t = text;

  for (const [pattern, replacement] of NOISE_RULES) {
    t = t.replace(pattern, replacement);
  }

  const placeholders = [];
  for (const tokenPattern of PROTECTED_TOKENS) {
    t = t.replace(tokenPattern, (match) => {
      const idx = placeholders.length;
      placeholders.push(match);
      return `__PROTECTED_${idx}__`;
    });
  }

  for (const [pattern, expansion] of ABBREVIATIONS) {
    t = t.replace(pattern, expansion);
  }

  placeholders.forEach((original, idx) => {
    t = t.replace(`__PROTECTED_${idx}__`, original);
  });

  t = t
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join('\n')
    .trim();

  return t;
}

export function normalizeChunks(chunks) {
  return chunks
    .map((chunk) => ({
      ...chunk,
      content: normalizeText(chunk.content),
    }))
    .filter((chunk) => chunk.content.length > 0);
}

export default { normalizeText, normalizeChunks };
