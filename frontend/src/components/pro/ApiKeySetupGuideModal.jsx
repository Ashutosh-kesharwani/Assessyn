import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ExternalLink, Check, Copy, HelpCircle, X, Sparkles, Key, CheckCircle2,
  ChevronRight, ArrowRight, ShieldCheck, Zap, Info, Terminal, Globe, Lock
} from 'lucide-react';
import toast from 'react-hot-toast';

export const API_SETUP_GUIDES = [
  {
    id: 'gemini-1.5-pro',
    name: 'Google Gemini 1.5 Pro / Flash',
    provider: 'Google AI Studio',
    isFree: true,
    freeBadge: '100% FREE (NO CREDIT CARD)',
    color: '#38bdf8',
    portalUrl: 'https://aistudio.google.com/app/apikey',
    difficulty: 'Super Easy (1 Min)',
    steps: [
      {
        stepNum: '01',
        title: 'Open Google AI Studio',
        instruction: 'Click the portal button below to open Google AI Studio in a new tab.',
        actionLabel: 'Open Google AI Studio ↗',
        url: 'https://aistudio.google.com/app/apikey',
      },
      {
        stepNum: '02',
        title: 'Sign In with Any Google Account',
        instruction: 'Use your regular Gmail or Google Workspace account. No credit card is required.',
      },
      {
        stepNum: '03',
        title: 'Click "Create API Key"',
        instruction: 'Click the blue "Create API key in new project" button at the top of the dashboard.',
      },
      {
        stepNum: '04',
        title: 'Copy & Paste into Assessyn Dojo',
        instruction: 'Click the copy icon next to your newly generated key (starts with "AIzaSy...") and paste it into the Gemini slot.',
      },
    ],
  },
  {
    id: 'groq-llama-3',
    name: 'Groq Llama 3.3 70B Versatile',
    provider: 'Groq Cloud',
    isFree: true,
    freeBadge: '100% FREE & ULTRA FAST (750 Tokens/Sec)',
    color: '#f97316',
    portalUrl: 'https://console.groq.com/keys',
    difficulty: 'Instant (30 Seconds)',
    steps: [
      {
        stepNum: '01',
        title: 'Launch Groq Console',
        instruction: 'Open the Groq Cloud developer portal.',
        actionLabel: 'Open Groq Console ↗',
        url: 'https://console.groq.com/keys',
      },
      {
        stepNum: '02',
        title: '1-Click Login with Google/GitHub',
        instruction: 'Select "Continue with Google" or "Continue with GitHub" for instant access with zero billing setup.',
      },
      {
        stepNum: '03',
        title: 'Click "Create API Key"',
        instruction: 'Enter a name (e.g. "Assessyn-Dojo") and click "Submit".',
      },
      {
        stepNum: '04',
        title: 'Copy & Activate',
        instruction: 'Copy your secret key (starts with "gsk_...") and paste it in Assessyn for blazing sub-second voice interactions.',
      },
    ],
  },
  {
    id: 'gpt-4o',
    name: 'OpenAI GPT-4o / GPT-4o-mini',
    provider: 'OpenAI Platform',
    isFree: false,
    freeBadge: 'Pay-As-You-Go ($5 Free Credits on signup)',
    color: '#10a37f',
    portalUrl: 'https://platform.openai.com/api-keys',
    difficulty: 'Easy (2 Mins)',
    steps: [
      {
        stepNum: '01',
        title: 'Open OpenAI Developer Platform',
        instruction: 'Navigate to OpenAI API keys management portal.',
        actionLabel: 'Open OpenAI Platform ↗',
        url: 'https://platform.openai.com/api-keys',
      },
      {
        stepNum: '02',
        title: 'Log In or Sign Up',
        instruction: 'Log in with your existing ChatGPT account or register a new one.',
      },
      {
        stepNum: '03',
        title: 'Create New Secret Key',
        instruction: 'Click the "+ Create new secret key" button, give it a name like "Assessyn AI", and click Create.',
      },
      {
        stepNum: '04',
        title: 'Copy Secret Key Immediately',
        instruction: 'Copy the key (starts with "sk-proj-...") right away as it is only shown once, then paste into Assessyn.',
      },
    ],
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Anthropic Claude 3.5 Sonnet',
    provider: 'Anthropic Console',
    isFree: false,
    freeBadge: 'Premier Architectural Reasoning',
    color: '#d97706',
    portalUrl: 'https://console.anthropic.com/settings/keys',
    difficulty: 'Easy (2 Mins)',
    steps: [
      {
        stepNum: '01',
        title: 'Open Anthropic Console',
        instruction: 'Visit the Anthropic API developer dashboard.',
        actionLabel: 'Open Anthropic Console ↗',
        url: 'https://console.anthropic.com/settings/keys',
      },
      {
        stepNum: '02',
        title: 'Sign In / Verify Account',
        instruction: 'Sign in with your email or Google account and complete basic phone verification.',
      },
      {
        stepNum: '03',
        title: 'Generate Secret Key',
        instruction: 'Navigate to "API Keys" in settings and click "Create Key".',
      },
      {
        stepNum: '04',
        title: 'Paste into Assessyn',
        instruction: 'Paste the key (starts with "sk-ant-api03-...") to unlock Claude\'s gold-standard code evaluations.',
      },
    ],
  },
  {
    id: 'deepseek-v3',
    name: 'DeepSeek V3 / R1 Reasoner',
    provider: 'DeepSeek Platform',
    isFree: false,
    freeBadge: 'Ultra Low Cost & Elite Math/DSA Logic',
    color: '#3b82f6',
    portalUrl: 'https://platform.deepseek.com/api_keys',
    difficulty: 'Easy (1 Min)',
    steps: [
      {
        stepNum: '01',
        title: 'Open DeepSeek API Portal',
        instruction: 'Visit DeepSeek\'s official developer platform.',
        actionLabel: 'Open DeepSeek Portal ↗',
        url: 'https://platform.deepseek.com/api_keys',
      },
      {
        stepNum: '02',
        title: 'Log In or Register',
        instruction: 'Sign up with email or Google in seconds.',
      },
      {
        stepNum: '03',
        title: 'Create Key',
        instruction: 'Click "Create API Key" under API Keys tab.',
      },
      {
        stepNum: '04',
        title: 'Activate in Dojo',
        instruction: 'Copy your DeepSeek key and paste it to enjoy competitive DSA chain-of-thought verification.',
      },
    ],
  },
];

export default function ApiKeySetupGuideModal({ isOpen, onClose, defaultProvider = 'gemini-1.5-pro' }) {
  const [selectedGuideId, setSelectedGuideId] = useState(defaultProvider);

  if (!isOpen) return null;

  const currentGuide =
    API_SETUP_GUIDES.find((g) => g.id === selectedGuideId) || API_SETUP_GUIDES[0];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-3xl bg-surface border border-brand-500/40 rounded-3xl shadow-2xl overflow-hidden z-10 my-8 max-h-[90vh] flex flex-col"
        >
          {/* Katana Edge Sheen */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand-400 to-transparent" />

          {/* Header */}
          <div className="p-6 sm:p-7 border-b border-subtle flex items-start justify-between bg-surface/90">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-3 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/40 text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>FOOLPROOF BYOK SETUP GUIDE</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                  Zero Coding Needed
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-display font-black text-white">
                How to Get & Connect Your AI Model Keys
              </h2>
              <p className="text-xs text-secondary font-mono">
                Select your provider below to follow the step-by-step visual roadmap with direct links.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-secondary hover:text-white hover:bg-surface border border-subtle transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Model Selector Tabs */}
          <div className="px-6 py-3 border-b border-subtle bg-surface flex items-center gap-2 overflow-x-auto scrollbar-none">
            {API_SETUP_GUIDES.map((g) => {
              const isSelected = selectedGuideId === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => setSelectedGuideId(g.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-2 border ${
                    isSelected
                      ? 'bg-brand-500/20 text-white border-brand-400 ring-2 ring-brand-500/30 shadow-md'
                      : 'bg-surface border-subtle text-secondary hover:text-white'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: g.color }}
                  />
                  <span>{g.provider}</span>
                  {g.isFree && (
                    <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-emerald-500/25 text-emerald-300">
                      FREE
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Guide Content Body */}
          <div className="p-6 sm:p-8 space-y-6 overflow-y-auto flex-1">
            {/* Provider Banner */}
            <div className="p-5 rounded-2xl bg-surface border border-subtle flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-display font-black text-white text-lg">{currentGuide.name}</h3>
                  <span
                    className="text-[10px] font-mono font-black px-2.5 py-0.5 rounded-full border"
                    style={{
                      color: currentGuide.color,
                      backgroundColor: `${currentGuide.color}15`,
                      borderColor: `${currentGuide.color}40`,
                    }}
                  >
                    {currentGuide.freeBadge}
                  </span>
                </div>
                <p className="text-xs font-mono text-secondary">
                  Estimated time to get key: <strong className="text-white">{currentGuide.difficulty}</strong>
                </p>
              </div>

              <a
                href={currentGuide.portalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-brand-500 to-violet-600 text-white font-display font-black text-xs tracking-wide shadow-md shadow-brand-500/20 hover:scale-105 transition-all cursor-pointer flex items-center justify-center gap-1.5 flex-shrink-0"
              >
                <span>Launch {currentGuide.provider} Console</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Step by step cards */}
            <div className="space-y-3.5">
              <span className="text-xs font-mono font-extrabold uppercase tracking-wider text-secondary block">
                Follow These 4 Simple Steps:
              </span>

              {currentGuide.steps.map((step, sIdx) => (
                <div
                  key={sIdx}
                  className="p-4 sm:p-5 rounded-2xl bg-surface/80 border border-subtle flex items-start gap-4 transition-colors hover:border-brand-500/40"
                >
                  <div className="w-8 h-8 rounded-xl bg-brand-500/20 text-brand-300 border border-brand-500/40 font-mono font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                    {step.stepNum}
                  </div>

                  <div className="space-y-1.5 flex-1">
                    <h4 className="text-sm font-display font-black text-white">{step.title}</h4>
                    <p className="text-xs font-mono text-secondary leading-relaxed">
                      {step.instruction}
                    </p>

                    {step.actionLabel && (
                      <div className="pt-1">
                        <a
                          href={step.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-brand-300 hover:text-white transition-colors"
                        >
                          <span>{step.actionLabel}</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Auto-Routing Failover Note */}
            <div className="p-4 rounded-2xl bg-brand-500/10 border border-brand-500/30 flex items-start gap-3">
              <Zap className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs font-mono text-brand-200 leading-relaxed">
                <strong className="text-white">Shinobi Chakra Auto-Failover Rule:</strong> Once you add this key, Assessyn will store it securely. If any model runs out of free requests (Error 429), your secondary key activates in under 850ms with zero manual work!
              </p>
            </div>
          </div>

          {/* Footer Action */}
          <div className="p-4 sm:p-5 border-t border-subtle bg-surface flex items-center justify-between">
            <span className="text-xs font-mono text-secondary">
              Keys are stored locally and encrypted per user session.
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-surface border border-brand-500/40 text-white hover:bg-brand-500/20 text-xs font-mono font-bold transition-all cursor-pointer"
            >
              Got It, Back to Dojo 🗡️
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
