import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Default 5 Top-Tier LLM Models Available for User BYOK (Bring Your Own Key) & Auto-Routing
export const DEFAULT_LLM_MODELS = [
  {
    id: 'gemini-1.5-pro',
    name: 'Google Gemini 1.5 Pro / Flash',
    provider: 'Google AI Studio',
    tag: 'DEFAULT PRIMARY',
    color: '#38bdf8',
    badge: 'Ultra Fast / 1M Context',
    description: 'High speed multimodal intelligence and large context analysis',
    placeholder: 'AIzaSy...',
    docsUrl: 'https://aistudio.google.com/app/apikey',
    apiKey: '',
    isActive: true,
    priority: 1,
    status: 'idle', // 'idle' | 'testing' | 'active' | 'rate_limited' | 'quota_depleted'
    rpmLimit: '15 RPM Free / Unlimited Pro',
    callsCount: 0,
  },
  {
    id: 'gpt-4o',
    name: 'OpenAI GPT-4o / 4o-mini',
    provider: 'OpenAI',
    tag: 'ADVANCED LOGIC',
    color: '#10a37f',
    badge: 'Deep Reasoning',
    description: 'Premier coding, architectural reasoning and STAR STAR behavioral parsing',
    placeholder: 'sk-proj-...',
    docsUrl: 'https://platform.openai.com/api-keys',
    apiKey: '',
    isActive: true,
    priority: 2,
    status: 'idle',
    rpmLimit: 'Custom Tier Rate Limits',
    callsCount: 0,
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Anthropic Claude 3.5 Sonnet',
    provider: 'Anthropic',
    tag: 'CODE SAGE',
    color: '#d97706',
    badge: 'Top Code & Tone',
    description: 'Gold-standard code generation, nuance detection and system architecture',
    placeholder: 'sk-ant-api03-...',
    docsUrl: 'https://console.anthropic.com/settings/keys',
    apiKey: '',
    isActive: false,
    priority: 3,
    status: 'idle',
    rpmLimit: 'Tier-based RPM',
    callsCount: 0,
  },
  {
    id: 'groq-llama-3',
    name: 'Groq Llama 3.3 70B Versatile',
    provider: 'Groq Cloud',
    tag: 'ULTRA LOW LATENCY',
    color: '#f97316',
    badge: '750 Tokens/sec',
    description: 'Lightning-fast real-time speech response generation with sub-second latency',
    placeholder: 'gsk_...',
    docsUrl: 'https://console.groq.com/keys',
    apiKey: '',
    isActive: false,
    priority: 4,
    status: 'idle',
    rpmLimit: '30 RPM Free',
    callsCount: 0,
  },
  {
    id: 'deepseek-v3',
    name: 'DeepSeek V3 / R1 Reasoner',
    provider: 'DeepSeek AI',
    tag: 'ALGO SPECIALIST',
    color: '#3b82f6',
    badge: 'Competitive Math & Code',
    description: 'Deep chain-of-thought verification for DSA, complex logic, and edge cases',
    placeholder: 'sk-...',
    docsUrl: 'https://platform.deepseek.com/api_keys',
    apiKey: '',
    isActive: false,
    priority: 5,
    status: 'idle',
    rpmLimit: 'Standard DeepSeek Tier',
    callsCount: 0,
  },
];

export const PRO_PLANS_CATALOG = [
  {
    id: 'trial_7days_50',
    name: '7-Day Shinobi Combat Trial',
    tag: 'TRIAL PASS // ZERO RISK',
    badge: 'JUST ₹7/DAY',
    category: 'quick_test',
    price: 50,
    durationDays: 7,
    period: '7 days',
    discount: '90% OFF REGULAR',
    savings: '₹7 / Day',
    subtitle: 'Perfect for urgent interview prep this week. Test drive all 5 Multi-LLM models and ATS restructurer.',
    description: 'Perfect for urgent interview prep this week. Test drive all 5 Multi-LLM models and ATS restructurer.',
    bullets: [
      '7 Days of Unlimited AI Mock Sessions',
      '5-Model Multi-LLM BYOK & Smart Failover',
      '10 ATS Resume Templates + JD Restructurer',
      '10 Live Developer Portfolio Generators',
      'Time-Filtered Job Radar (Today, 2d, 4d, 7d)',
      'Dynamic 4-Week Career Sprint Roadmap',
    ],
    features: [
      '7 Days of Unlimited AI Mock Sessions',
      '5-Model Multi-LLM BYOK & Smart Failover',
      '10 ATS Resume Templates + JD Restructurer',
      '10 Live Developer Portfolio Generators',
      'Time-Filtered Job Radar (Today, 2d, 4d, 7d)',
      'Dynamic 4-Week Career Sprint Roadmap',
    ],
  },
  {
    id: 'pro_monthly_299',
    name: 'Pro Shinobi Monthly Mastery',
    tag: 'MOST POPULAR // MASTER CLASS',
    badge: 'BEST FOR ACTIVE JOB HUNT',
    category: 'most_popular',
    price: 299,
    durationDays: 30,
    period: 'month',
    discount: 'SAVE 60%',
    savings: 'Best Value',
    isPopular: true,
    subtitle: 'The definitive weapon for landing high-paying software engineering and tech leadership offers.',
    description: 'The definitive weapon for landing high-paying software engineering and tech leadership offers.',
    bullets: [
      '30 Days Unlimited AI Mock Interviews (System Design & STAR)',
      '5-Model BYOK Smart Routing Engine (Gemini, GPT-4o, Claude, Groq, DeepSeek)',
      'Zero Token Limit with Auto-Cascade Failover',
      'Full ATS Resume Deconstruction & STAR Rewriting',
      'Targeted Role-Specific Question & Model Answer Bank',
      'Fresh Job Radar with One-Click Platform Apply Links',
      'Dynamic 4-Week AI Career Preparation Roadmap',
      'Priority Sub-Second Speech-to-Text Transcription',
    ],
    features: [
      '30 Days Unlimited AI Mock Interviews (System Design & STAR)',
      '5-Model BYOK Smart Routing Engine (Gemini, GPT-4o, Claude, Groq, DeepSeek)',
      'Zero Token Limit with Auto-Cascade Failover',
      'Full ATS Resume Deconstruction & STAR Rewriting',
      'Targeted Role-Specific Question & Model Answer Bank',
      'Fresh Job Radar with One-Click Platform Apply Links',
      'Dynamic 4-Week AI Career Preparation Roadmap',
      'Priority Sub-Second Speech-to-Text Transcription',
    ],
  },
  {
    id: 'pro_6months_1299',
    name: '6-Month Jonin Veteran Pass',
    tag: 'VALUE PACK // 6 MONTHS',
    badge: 'SAVE 28% EXTRA',
    category: 'economical',
    price: 1299,
    durationDays: 180,
    period: '6 months',
    discount: '₹216/MONTH EFFECTIVE',
    savings: 'Save 28%',
    subtitle: 'Designed for engineers aiming for major mid-year appraisals, company switches, and FAANG/Tier-1 prep.',
    description: 'Designed for engineers aiming for major mid-year appraisals, company switches, and FAANG/Tier-1 prep.',
    bullets: [
      '180 Days of Continuous Pro Ninja Access',
      'All 5-Model Multi-LLM BYOK & Smart Routing Capabilities',
      'Unlimited ATS Resume Optimization for Multiple Target Roles',
      'Unlimited Portfolio Architecture Blueprints',
      'Lifetime Access to Future Model Integrations',
      'VIP Priority Support & Interview Feedback Grading',
    ],
    features: [
      '180 Days of Continuous Pro Ninja Access',
      'All 5-Model Multi-LLM BYOK & Smart Routing Capabilities',
      'Unlimited ATS Resume Optimization for Multiple Target Roles',
      'Unlimited Portfolio Architecture Blueprints',
      'Lifetime Access to Future Model Integrations',
      'VIP Priority Support & Interview Feedback Grading',
    ],
  },
  {
    id: 'pro_annual_2199',
    name: '1-Year Shadow Kage Grandmaster',
    tag: 'ULTIMATE VIP // 12 MONTHS',
    badge: 'BEST LIFETIME VALUE (SAVE 40%)',
    category: 'long_term',
    price: 2199,
    durationDays: 365,
    period: 'year',
    discount: 'JUST ₹183/MONTH',
    savings: 'Save 40%',
    subtitle: 'The ultimate all-inclusive pass for lifelong career supremacy, promotions, and continuous interview readiness.',
    description: 'The ultimate all-inclusive pass for lifelong career supremacy, promotions, and continuous interview readiness.',
    bullets: [
      '365 Days Unconditional Pro Ninja Privileges',
      'Unlimited 5-Model Multi-LLM BYOK & Zero-Downtime Auto-Routing',
      'Unlimited Multi-JD Resume Transformations',
      'Executive Leadership & System Design Question Banks',
      'All Future Pro AI Tools & Shinobi Themes Included',
      'Highest Priority Support & Dedicated Roadmap Guidance',
    ],
    features: [
      '365 Days Unconditional Pro Ninja Privileges',
      'Unlimited 5-Model Multi-LLM BYOK & Zero-Downtime Auto-Routing',
      'Unlimited Multi-JD Resume Transformations',
      'Executive Leadership & System Design Question Banks',
      'All Future Pro AI Tools & Shinobi Themes Included',
      'Highest Priority Support & Dedicated Roadmap Guidance',
    ],
  },
];

export const useProStore = create(
  persist(
    (set, get) => ({
      // ── Membership State ──────────────────────────────────────
      isPro: true,
      selectedPlanId: 'pro_monthly_299',
      plan: {
        id: 'pro_monthly_299',
        name: 'Assessyn Pro Shinobi Monthly',
        price: 299,
        durationDays: 30,
        interval: 'month',
        currency: 'INR',
        symbol: '₹',
        activatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      },
      paymentHistory: [
        {
          id: 'TXN_' + Math.random().toString(36).substring(2, 10).toUpperCase(),
          gateway: 'PayU Production',
          amount: 299,
          currency: 'INR',
          status: 'SUCCESS',
          date: new Date().toISOString(),
          paymentMethod: 'UPI / PayU',
          invoiceUrl: '#',
        },
      ],

      // ── Multi-LLM API Models & Auto-Routing ────────────────────
      models: DEFAULT_LLM_MODELS,
      routingLogs: [],
      autoFailoverEnabled: true,

      // ── Actions ───────────────────────────────────────────────
      toggleProStatus: () => {
        set((state) => ({ isPro: !state.isPro }));
      },

      setProStatus: (status) => {
        set({ isPro: status });
      },

      setSelectedPlanId: (planId) => {
        set({ selectedPlanId: planId });
      },

      upgradeWithPayU: (paymentDetails) => {
        const catalogPlan =
          PRO_PLANS_CATALOG.find((p) => p.id === paymentDetails?.planId) ||
          PRO_PLANS_CATALOG[1]; // default 299

        const newTxn = {
          id: 'PAYU_' + Date.now().toString(36).toUpperCase(),
          gateway: 'PayU Production Gateway',
          amount: catalogPlan.price,
          currency: 'INR',
          status: 'SUCCESS',
          planName: catalogPlan.name,
          date: new Date().toISOString(),
          paymentMethod: paymentDetails?.paymentMethod || 'UPI / PayU',
          ...paymentDetails,
        };

        const durationDays = catalogPlan.durationDays || 30;

        set((state) => ({
          isPro: true,
          selectedPlanId: catalogPlan.id,
          paymentHistory: [newTxn, ...state.paymentHistory],
          plan: {
            ...catalogPlan,
            activatedAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString(),
          },
        }));
      },

      updateModelKey: (modelId, apiKey, isActive = true) => {
        set((state) => ({
          models: state.models.map((m) =>
            m.id === modelId ? { ...m, apiKey, isActive, status: apiKey ? 'active' : 'idle' } : m
          ),
        }));
      },

      toggleModelActive: (modelId) => {
        set((state) => ({
          models: state.models.map((m) =>
            m.id === modelId ? { ...m, isActive: !m.isActive } : m
          ),
        }));
      },

      reorderModels: (newOrderedModels) => {
        const updated = newOrderedModels.map((m, idx) => ({ ...m, priority: idx + 1 }));
        set({ models: updated });
      },

      resetModelKeysToDefault: () => {
        set({ models: DEFAULT_LLM_MODELS });
      },

      addRoutingLog: (log) => {
        const entry = {
          id: Date.now() + Math.random(),
          timestamp: new Date().toLocaleTimeString(),
          ...log,
        };
        set((state) => ({
          routingLogs: [entry, ...state.routingLogs.slice(0, 19)],
        }));
      },

      clearRoutingLogs: () => {
        set({ routingLogs: [] });
      },

      // ── Auto-Routing Engine Simulation ─────────────────────────
      executeAutoRoutedPrompt: async (prompt, simulatedFailureOnPrimary = false) => {
        const state = get();
        const activeModels = [...state.models]
          .filter((m) => m.isActive && (m.apiKey || m.id === 'gemini-1.5-pro'))
          .sort((a, b) => a.priority - b.priority);

        if (activeModels.length === 0) {
          throw new Error('No active LLM models configured. Please enable at least one model key.');
        }

        let selectedModel = activeModels[0];
        let usedFallback = false;

        // If primary key simulated exhaustion/failure
        if (simulatedFailureOnPrimary && activeModels.length > 1) {
          usedFallback = true;
          selectedModel = activeModels[1];

          state.addRoutingLog({
            type: 'FAILOVER',
            fromModel: activeModels[0].name,
            toModel: activeModels[1].name,
            reason: 'RateLimitExceeded (429) -> Auto switched to Priority #2',
            status: 'success',
          });
        } else {
          state.addRoutingLog({
            type: 'DIRECT_ROUTE',
            toModel: selectedModel.name,
            reason: 'Primary model healthy & available',
            status: 'success',
          });
        }

        // Increment usage count
        set((s) => ({
          models: s.models.map((m) =>
            m.id === selectedModel.id ? { ...m, callsCount: (m.callsCount || 0) + 1 } : m
          ),
        }));

        return {
          modelUsed: selectedModel,
          usedFallback,
          response: `[Generated using ${selectedModel.name} via Assessyn Smart Auto-Routing]`,
        };
      },
    }),
    {
      name: 'assessyn-pro-store',
      partialize: (state) => ({
        isPro: state.isPro,
        plan: state.plan,
        paymentHistory: state.paymentHistory,
        models: state.models,
        routingLogs: state.routingLogs,
        autoFailoverEnabled: state.autoFailoverEnabled,
      }),
    }
  )
);
