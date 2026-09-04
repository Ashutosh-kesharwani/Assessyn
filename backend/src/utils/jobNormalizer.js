const CURRENCY_MAP = {
  gb: 'GBP', us: 'USD', au: 'AUD', ca: 'CAD',
  in: 'INR', de: 'EUR', fr: 'EUR', nl: 'EUR',
  nz: 'NZD', sg: 'SGD', za: 'ZAR', ru: 'RUB',
};

// ─── Skills Dictionary ────────────────────────────────────────────────────────
const SKILLS_DICT = [
  // Languages
  ['Python',         /\bpython\b/i],
  ['JavaScript',     /\bjavascript\b|\bjs\b/i],
  ['TypeScript',     /\btypescript\b|\bts\b/i],
  ['Java',           /\bjava\b(?!script)/i],
  ['C#',             /\bc#\b|\bdotnet\b|\.net\b/i],
  ['C++',            /\bc\+\+\b|\bcpp\b/i],
  ['Go',             /\bgolang\b|\b(?<![a-z])go(?![a-z])\b/i],
  ['Rust',           /\brust\b/i],
  ['Kotlin',         /\bkotlin\b/i],
  ['Swift',          /\bswift\b/i],
  ['Ruby',           /\bruby\b/i],
  ['PHP',            /\bphp\b/i],
  ['Scala',          /\bscala\b/i],
  ['R',              /\br\b(?=\s+programming|\s+language|\s+developer)/i],
  ['Dart',           /\bdart\b/i],
  ['Elixir',         /\belixir\b/i],

  // Frontend frameworks / libraries
  ['React',          /\breact(?:\.js)?\b/i],
  ['Vue.js',         /\bvue(?:\.js)?\b/i],
  ['Angular',        /\bangular(?:\.js)?\b/i],
  ['Svelte',         /\bsvelte\b/i],
  ['Next.js',        /\bnext(?:\.js)?\b/i],
  ['Nuxt.js',        /\bnuxt(?:\.js)?\b/i],
  ['Redux',          /\bredux\b/i],
  ['Tailwind CSS',   /\btailwind\b/i],
  ['HTML',           /\bhtml5?\b/i],
  ['CSS',            /\bcss3?\b|\bsass\b|\bscss\b/i],

  // Backend frameworks / runtimes
  ['Node.js',        /\bnode(?:\.js)?\b/i],
  ['Express.js',     /\bexpress(?:\.js)?\b/i],
  ['Django',         /\bdjango\b/i],
  ['FastAPI',        /\bfastapi\b/i],
  ['Flask',          /\bflask\b/i],
  ['Spring Boot',    /\bspring\s*boot\b/i],
  ['Spring',         /\bspring\b(?!\s*boot)/i],
  ['Laravel',        /\blaravel\b/i],
  ['Rails',          /\bruby\s+on\s+rails\b|\brails\b/i],
  ['NestJS',         /\bnest(?:\.js)?\b/i],

  // Databases
  ['PostgreSQL',     /\bpostgresql\b|\bpostgres\b|\bpg\b/i],
  ['MySQL',          /\bmysql\b/i],
  ['MongoDB',        /\bmongodb\b|\bmongo\b/i],
  ['Redis',          /\bredis\b/i],
  ['Elasticsearch',  /\belasticsearch\b/i],
  ['Cassandra',      /\bcassandra\b/i],
  ['DynamoDB',       /\bdynamodb\b/i],
  ['SQLite',         /\bsqlite\b/i],
  ['Oracle',         /\boracle\s*db\b|\boracle\b/i],
  ['SQL',            /\bsql\b/i],
  ['NoSQL',          /\bnosql\b/i],

  // Cloud & DevOps
  ['AWS',            /\baws\b|\bamazon\s+web\s+services\b/i],
  ['GCP',            /\bgcp\b|\bgoogle\s+cloud\b/i],
  ['Azure',          /\bazure\b|\bmicrosoft\s+azure\b/i],
  ['Docker',         /\bdocker\b/i],
  ['Kubernetes',     /\bkubernetes\b|\bk8s\b/i],
  ['Terraform',      /\bterraform\b/i],
  ['Ansible',        /\bansible\b/i],
  ['Jenkins',        /\bjenkins\b/i],
  ['GitHub Actions', /\bgithub\s+actions\b/i],
  ['GitLab CI',      /\bgitlab\s+ci\b/i],
  ['CI/CD',          /\bci\/cd\b|\bcontinuous\s+integration\b/i],
  ['Linux',          /\blinux\b|\bubuntu\b|\bdebian\b/i],
  ['Nginx',          /\bnginx\b/i],

  // Data / ML / AI
  ['TensorFlow',     /\btensorflow\b/i],
  ['PyTorch',        /\bpytorch\b/i],
  ['Pandas',         /\bpandas\b/i],
  ['NumPy',          /\bnumpy\b/i],
  ['Scikit-learn',   /\bscikit[\s-]learn\b|\bsklearn\b/i],
  ['Spark',          /\bapache\s+spark\b|\bpyspark\b|\bspark\b/i],
  ['Hadoop',         /\bhadoop\b/i],
  ['Kafka',          /\bkafka\b/i],
  ['Airflow',        /\bairflow\b/i],
  ['dbt',            /\bdbt\b/i],
  ['Machine Learning', /\bmachine\s+learning\b|\bml\b(?!\s*ops)/i],
  ['Deep Learning',  /\bdeep\s+learning\b/i],
  ['NLP',            /\bnlp\b|\bnatural\s+language\s+processing\b/i],
  ['LLM',            /\bllm\b|\blarge\s+language\s+model/i],
  ['MLOps',          /\bmlops\b/i],

  // APIs & architecture
  ['REST API',       /\brest(?:ful)?\s*api\b|\brest\b/i],
  ['GraphQL',        /\bgraphql\b/i],
  ['gRPC',           /\bgrpc\b/i],
  ['WebSocket',      /\bwebsocket\b/i],
  ['Microservices',  /\bmicroservices?\b/i],

  // Mobile
  ['React Native',   /\breact\s+native\b/i],
  ['Flutter',        /\bflutter\b/i],
  ['iOS',            /\bios\b|\bswift\s+ui\b/i],
  ['Android',        /\bandroid\b/i],

  // Testing
  ['Jest',           /\bjest\b/i],
  ['Pytest',         /\bpytest\b/i],
  ['Selenium',       /\bselenium\b/i],
  ['Cypress',        /\bcypress\b/i],

  // Misc
  ['Git',            /\bgit\b/i],
  ['Agile',          /\bagile\b|\bscrum\b|\bkanban\b/i],
  ['Blockchain',     /\bblockchain\b|\bweb3\b|\bsolidity\b/i],
];

const HTML_ENTITIES = [
  [/&amp;/g,   '&'],
  [/&lt;/g,    '<'],
  [/&gt;/g,    '>'],
  [/&quot;/g,  '"'],
  [/&#39;/g,   "'"],
  [/&nbsp;/g,  ' '],
  [/&ndash;/g, '–'],
  [/&mdash;/g, '—'],
  [/&hellip;/g,'…'],
  [/&bull;/g,  '•'],
];

export function stripHtml(str) {
  if (!str) return '';
  let s = str;

  for (const [pattern, replacement] of HTML_ENTITIES) {
    s = s.replace(pattern, replacement);
  }

  s = s.replace(/<\/?(p|div|br|li|ul|ol|h[1-6]|blockquote|section|article)[^>]*>/gi, '\n');
  s = s.replace(/<[^>]+>/g, '');
  s = s.replace(/[\u200B\u200C\u200D\u00AD\uFEFF]/g, '');
  s = s.replace(/[ \t]{2,}/g, ' ');
  s = s.replace(/\n{3,}/g, '\n\n');

  return s.trim();
}

function cleanShort(str) {
  if (!str || typeof str !== 'string') return null;
  const cleaned = str
    .replace(/[\u200B\u200C\u200D\u00AD\uFEFF]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return cleaned || null;
}

const KEEP_UPPER = new Set(['UK', 'US', 'EU', 'UAE', 'USA', 'IT', 'AI', 'HR', 'PR', 'QA', 'CTO', 'CEO', 'CFO', 'COO']);

function titleCase(str) {
  if (!str) return null;
  return str
    .toLowerCase()
    .replace(/\b\w+/g, (word) =>
      KEEP_UPPER.has(word.toUpperCase())
        ? word.toUpperCase()
        : word.charAt(0).toUpperCase() + word.slice(1)
    );
}

function parseSalary(raw) {
  if (raw === null || raw === undefined || raw === '') return null;
  const num = parseFloat(String(raw).replace(/[,\s]/g, ''));
  return isNaN(num) || num <= 0 ? null : Math.round(num);
}

function parsePostedAt(raw) {
  if (!raw) return null;
  try {
    const d = new Date(raw);
    if (isNaN(d.getTime())) return null;
    return d.toISOString();
  } catch {
    return null;
  }
}

export function extractSkills(text) {
  if (!text) return [];

  const found = new Set();
  for (const [displayName, regex] of SKILLS_DICT) {
    if (regex.test(text)) {
      found.add(displayName);
    }
  }

  return [...found].sort();
}

export function normalizeJob(raw, country = 'gb') {
  const countryKey = (country || 'gb').toLowerCase();

  const id          = String(raw.id ?? '');
  const title       = cleanShort(raw.title)   ?? '';
  const company     = titleCase(cleanShort(raw.company?.display_name));
  const location    = titleCase(cleanShort(raw.location?.display_name));
  const description = stripHtml(raw.description ?? '');
  const url         = cleanShort(raw.redirect_url) ?? null;

  const salary_min      = parseSalary(raw.salary_min);
  const salary_max      = parseSalary(raw.salary_max);
  const salary_currency = CURRENCY_MAP[countryKey] ?? 'GBP';

  const posted_at = parsePostedAt(raw.created);
  const skills = extractSkills(`${title} ${description}`);

  const category = cleanShort(raw.category?.label) ?? null;
  const contract = cleanShort(raw.contract_type)   ?? null;

  return {
    id,
    title,
    company,
    location,
    salary_min,
    salary_max,
    description,
    skills,
    posted_at,
    source  : 'adzuna',
    url,
    category,
    contract,
    salary_currency,
  };
}

export function normalizeJobs(rawJobs, country = 'gb') {
  if (!Array.isArray(rawJobs)) return [];
  return rawJobs
    .filter((raw) => raw && raw.id)
    .map((raw) => normalizeJob(raw, country));
}

export default { normalizeJob, normalizeJobs, extractSkills, stripHtml };
