import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check, X, Sparkles, ShieldCheck, Zap, Lock, CreditCard, ArrowRight,
  HelpCircle, Star, Award, Layers, Cpu, FileText, Briefcase, RefreshCw,
  Clock, Flame, CheckCircle2, BookOpen, Crown, ChevronDown, CheckCircle
} from 'lucide-react';
import { useProStore, PRO_PLANS_CATALOG } from '@/store/proStore';
import { paymentAPI } from '@/services/api';
import PayUCheckoutModal from '@/components/pro/PayUCheckoutModal';
import ApiKeySetupGuideModal from '@/components/pro/ApiKeySetupGuideModal';
import { DojoIcon, KatanaIcon, ShurikenIcon, ScrollIcon, KunaiIcon } from '@/components/ui/ShinobiIcons';
import toast from 'react-hot-toast';

export const CATEGORY_STYLES = {
  quick_test: {
    badge: 'QUICK TEST // TRIAL PASS',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    cardBorder: 'border-amber-500/40 hover:border-amber-400',
    cardGlow: 'bg-gradient-to-b from-amber-950/40 via-surface to-surface shadow-amber-500/10',
    priceColor: 'text-amber-400',
    btnGradient: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 shadow-amber-500/20',
    icon: Flame,
    checkColor: 'text-amber-400',
  },
  most_popular: {
    badge: 'TOP SHINOBI CHOICE // MOST POPULAR',
    badgeClass: 'bg-emerald-500/25 text-emerald-300 border-emerald-500/50 ring-1 ring-emerald-500/30',
    cardBorder: 'border-emerald-500/60 hover:border-emerald-400 ring-2 ring-emerald-500/30',
    cardGlow: 'bg-gradient-to-b from-emerald-950/50 via-surface to-surface shadow-emerald-500/20',
    priceColor: 'text-emerald-400',
    btnGradient: 'bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-600 hover:to-teal-600 text-slate-950 shadow-emerald-500/30',
    icon: KatanaIcon,
    checkColor: 'text-emerald-400',
  },
  economical: {
    badge: 'ECONOMICAL // POCKET SAVER',
    badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    cardBorder: 'border-cyan-500/40 hover:border-cyan-400',
    cardGlow: 'bg-gradient-to-b from-cyan-950/40 via-surface to-surface shadow-cyan-500/10',
    priceColor: 'text-cyan-400',
    btnGradient: 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white shadow-cyan-500/20',
    icon: ShurikenIcon,
    checkColor: 'text-cyan-400',
  },
  long_term: {
    badge: 'LONG TERM // VIP MAX SAVINGS',
    badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    cardBorder: 'border-purple-500/40 hover:border-purple-400',
    cardGlow: 'bg-gradient-to-b from-purple-950/50 via-surface to-surface shadow-purple-500/15',
    priceColor: 'text-purple-400',
    btnGradient: 'bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700 text-white shadow-purple-500/20',
    icon: Crown,
    checkColor: 'text-purple-400',
  },
  general: {
    badge: 'GENIN STANDARD // STARTER',
    badgeClass: 'bg-slate-700/40 text-slate-300 border-slate-600',
    cardBorder: 'border-subtle hover:border-slate-500',
    cardGlow: 'bg-surface shadow-sm',
    priceColor: 'text-white',
    btnGradient: 'bg-surface hover:bg-slate-800 border border-subtle text-white',
    icon: ShieldCheck,
    checkColor: 'text-slate-400',
  },
};

export default function PricingPage() {
  const { isPro, plan, toggleProStatus } = useProStore();
  const [plans, setPlans] = useState(PRO_PLANS_CATALOG);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState(PRO_PLANS_CATALOG[1]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    setLoadingPlans(true);
    paymentAPI.getPlans()
      .then(({ data }) => {
        if (data?.plans && data.plans.length > 0) {
          // Normalize dynamic plan fields for consistent display
          const formatted = data.plans.map((p) => ({
            id: p.code || `plan_${p._id}`,
            name: p.name,
            subtitle: p.subtitle || p.description || '',
            price: p.price,
            period: p.durationDays === 7 ? '7 days' : p.durationDays === 365 ? 'year' : p.durationDays === 180 ? '6 months' : 'month',
            durationDays: p.durationDays,
            badge: p.badgeText || (p.category === 'most_popular' ? 'MOST POPULAR' : ''),
            category: p.category || 'general',
            savings: p.savingsText || '',
            ctaText: p.ctaText || 'Unlock Plan',
            accentColor: p.accentColor || '#10b981',
            bullets: p.features && p.features.length > 0 ? p.features : [
              'Unlimited AI Mock Interviews',
              'Central High-Performance AI Router (Gemini + Groq)',
              '10 ATS Resume Templates + Restructurer',
              '10 Developer Portfolio Generators',
            ],
          }));
          setPlans(formatted);
          setSelectedPlanForCheckout(formatted[1] || formatted[0]);
        }
      })
      .catch((err) => {
        console.warn('Using default catalog fallback:', err);
      })
      .finally(() => setLoadingPlans(false));
  }, []);

  const handleChoosePlan = (planObj) => {
    setSelectedPlanForCheckout(planObj);
    setCheckoutOpen(true);
  };

  const PRICING_FAQS = [
    {
      q: 'Why should I pick the ₹50 7-Day Trial vs the ₹299 Monthly Plan?',
      a: 'The ₹50 7-Day Trial is an ultra low-risk starter pass designed for engineers with interviews coming up this week. The ₹299 Monthly Plan gives you 30 full days of continuous practice, unlimited multi-JD resume restructuring, and dynamic roadmap updates.',
    },
    {
      q: 'How does the 5-Model Multi-LLM BYOK auto-routing work?',
      a: 'As a Shinobi Pro member, you can enter API keys for Google Gemini, OpenAI GPT-4o, Anthropic Claude 3.5 Sonnet, Groq Llama 3, and DeepSeek. If your primary key exhausts its rate limit (429), Assessyn auto-cascades to your backup model with zero interruption in sub-second speed.',
    },
    {
      q: 'What if I do not have external AI API keys?',
      a: 'We built a 1-Minute Foolproof Visual Setup Guide right inside Assessyn with direct links! Groq and Google Gemini keys are 100% free with no credit card required.',
    },
    {
      q: 'Can I cancel my subscription anytime without hidden charges?',
      a: 'Yes, 100%! There are zero lock-ins or contracts. You can cancel with 1 click from your settings or enjoy your fixed-duration pass (₹50 / 7-days, 6-month, or 1-year) with zero auto-debit anxiety.',
    },
    {
      q: 'What payment methods does PayU support for Assessyn Pro?',
      a: 'PayU supports all Indian payment channels: Instant UPI (Google Pay, PhonePe, Paytm, BHIM), Credit/Debit cards (Visa, Mastercard, RuPay), Net Banking (50+ banks), and popular wallets with 256-bit SSL encryption.',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fade-in pb-16">
      {/* ── Test Mode Switcher Banner ──────────────────────────── */}
      <div className="p-4 rounded-2xl bg-surface border border-brand-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-400 animate-ping" />
          <span className="text-xs font-mono font-bold text-white">
            Simulate User Subscription State:
          </span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase ${
              isPro
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-700/50 text-slate-300 border border-slate-600'
            }`}
          >
            {isPro ? 'PRO SHINOBI ACTIVE' : 'FREE USER TIER'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            toggleProStatus();
            toast.success(
              !isPro
                ? 'Switched to Pro Shinobi Tier! All combat suites unlocked 🗡️'
                : 'Switched to Free Tier! Pro features locked.'
            );
          }}
          className="px-4 py-2 rounded-xl bg-surface border border-subtle hover:border-brand-400 text-brand-300 hover:text-white text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Toggle Mode: Switch to {!isPro ? 'Pro' : 'Free'}</span>
        </button>
      </div>

      {/* ── Hero Header ─────────────────────────────────────────── */}
      <header className="text-center space-y-4 max-w-3xl mx-auto relative pt-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-500/15 border border-brand-500/30 text-brand-300 text-xs font-mono font-black uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>FORGE YOUR COMBAT READINESS</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight leading-tight">
          Invest in Your Career Mastery. <br />
          <span className="bg-gradient-to-r from-brand-300 via-brand-400 to-violet-400 bg-clip-text text-transparent">
            Conquer Every Interview Round.
          </span>
        </h1>

        <p className="text-sm sm:text-base text-secondary font-mono max-w-2xl mx-auto leading-relaxed">
          From a low-barrier <strong className="text-amber-400">₹50 7-Day Sprint</strong> to our flagship <strong className="text-emerald-400">₹299 Monthly Mastery</strong>, equip yourself with unlimited AI mock interviews, 10 ATS resume templates, and 10 live portfolio builders.
        </p>

        <div className="pt-2 flex flex-wrap justify-center items-center gap-4">
          <button
            type="button"
            onClick={() => setGuideModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface border border-subtle hover:border-brand-400 text-brand-300 hover:text-white text-xs font-mono font-bold transition-all cursor-pointer shadow-sm"
          >
            <Cpu className="w-3.5 h-3.5 text-brand-400" />
            <span>1-Min Free API Key Setup Guide</span>
          </button>
        </div>
      </header>

      {/* ── SQUARE & BALANCED RESPONSIVE PRICING CARDS GRID ─────── */}
      <section aria-label="Dynamic Pricing Cards" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 items-stretch">
        {plans.map((p, idx) => {
          const style = CATEGORY_STYLES[p.category] || CATEGORY_STYLES.general;
          const CategoryIcon = style.icon;

          return (
            <motion.div
              key={p.id || idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
              className={`rounded-3xl border ${style.cardBorder} ${style.cardGlow} p-6 sm:p-7 flex flex-col justify-between h-full min-h-[500px] shadow-2xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-300`}
            >
              {/* Top Accent Sheen */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent opacity-60 pointer-events-none" />

              {/* 1. Header Section */}
              <div className="space-y-4">
                {/* Category Badge & Savings */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-[9.5px] font-mono font-black uppercase tracking-wider border flex items-center gap-1.5 ${style.badgeClass}`}>
                    <CategoryIcon className="w-3 h-3 flex-shrink-0" />
                    <span>{p.badge || style.badge}</span>
                  </span>
                  {p.savings && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                      {p.savings}
                    </span>
                  )}
                </div>

                {/* Plan Title & Subtitle */}
                <div>
                  <h3 className="text-xl font-display font-black text-white group-hover:text-brand-300 transition-colors">
                    {p.name}
                  </h3>
                  <p className="text-[11px] font-mono text-secondary mt-1 leading-snug min-h-[34px]">
                    {p.subtitle}
                  </p>
                </div>

                {/* Price Display */}
                <div className="pt-2 border-t border-subtle flex items-baseline gap-1.5">
                  <span className="text-sm font-mono text-secondary">₹</span>
                  <span className={`text-4xl sm:text-5xl font-display font-black ${style.priceColor} tracking-tight`}>
                    {p.price}
                  </span>
                  <span className="text-xs font-mono text-secondary">
                    / {p.period}
                  </span>
                </div>
              </div>

              {/* 2. Middle Section: Dynamic Self-Adjusting Bullet Points Container */}
              <div className="flex-1 my-4 py-3 border-y border-subtle/70 overflow-y-auto max-h-[220px] scrollbar-thin space-y-2.5 pr-1">
                <p className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-slate-400">
                  Included Arsenal:
                </p>
                {(p.bullets || p.features || []).map((bullet, bIdx) => (
                  <div key={bIdx} className="flex items-start gap-2.5 text-xs text-slate-200">
                    <CheckCircle className={`w-3.5 h-3.5 ${style.checkColor} flex-shrink-0 mt-0.5`} />
                    <span className="leading-snug text-[11.5px]">{bullet}</span>
                  </div>
                ))}
              </div>

              {/* 3. Bottom Section: Anchored CTA Button & Security Badge */}
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => handleChoosePlan(p)}
                  className={`w-full py-3.5 px-5 rounded-2xl font-display font-black text-xs sm:text-sm tracking-wide transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 ${style.btnGradient}`}
                >
                  <span>{p.ctaText || 'Unlock Plan'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-secondary text-center">
                  <Lock className="w-3 h-3 text-emerald-400" />
                  <span>256-Bit SSL · PayU Verified</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </section>

      {/* ── Feature Comparison Matrix ──────────────────────────── */}
      <section aria-label="Feature Comparison" className="p-6 sm:p-8 rounded-3xl bg-surface border border-subtle space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-subtle pb-4">
          <div>
            <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-brand-400">
              // ARSENAL COMPARISON
            </span>
            <h2 className="text-xl sm:text-2xl font-display font-black text-white mt-0.5">
              Compare All Membership Tiers
            </h2>
          </div>
          <span className="text-xs font-mono text-secondary">
            Transparent · No Hidden Charges
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-subtle text-secondary">
                <th className="py-3 px-4">Feature Capability</th>
                <th className="py-3 px-4 text-center">Free Genin (₹0)</th>
                <th className="py-3 px-4 text-center text-amber-400">₹50 Trial Pass</th>
                <th className="py-3 px-4 text-center text-emerald-400 font-black">Pro Monthly (₹299)</th>
                <th className="py-3 px-4 text-center text-purple-400">VIP Annual (₹2,199)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-subtle/50 text-slate-300">
              <tr>
                <td className="py-3 px-4 font-bold text-white">AI Mock Interview Sessions</td>
                <td className="py-3 px-4 text-center text-secondary">3 Sessions / Day</td>
                <td className="py-3 px-4 text-center text-emerald-400 font-bold">Unlimited (7 Days)</td>
                <td className="py-3 px-4 text-center text-emerald-400 font-bold">Unlimited (30 Days)</td>
                <td className="py-3 px-4 text-center text-purple-400 font-bold">Unlimited (365 Days)</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-white">5 Multi-LLM BYOK & Auto-Routing</td>
                <td className="py-3 px-4 text-center text-rose-400">✕</td>
                <td className="py-3 px-4 text-center text-emerald-400">✓ Enabled</td>
                <td className="py-3 px-4 text-center text-emerald-400">✓ Enabled</td>
                <td className="py-3 px-4 text-center text-purple-400">✓ VIP Priority Bandwidth</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-white">10 ATS Resume Templates</td>
                <td className="py-3 px-4 text-center text-secondary">1 Template</td>
                <td className="py-3 px-4 text-center text-emerald-400">All 10 Templates</td>
                <td className="py-3 px-4 text-center text-emerald-400">All 10 Templates</td>
                <td className="py-3 px-4 text-center text-purple-400">All 10 Templates</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-white">10 Developer Portfolio Generators</td>
                <td className="py-3 px-4 text-center text-secondary">1 Template</td>
                <td className="py-3 px-4 text-center text-emerald-400">All 10 Styles</td>
                <td className="py-3 px-4 text-center text-emerald-400">All 10 Styles</td>
                <td className="py-3 px-4 text-center text-purple-400">All 10 Styles</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-white">ATS Resume Restructurer Engine</td>
                <td className="py-3 px-4 text-center text-rose-400">✕</td>
                <td className="py-3 px-4 text-center text-emerald-400">✓ Included</td>
                <td className="py-3 px-4 text-center text-emerald-400">✓ Unlimited</td>
                <td className="py-3 px-4 text-center text-purple-400">✓ Unlimited</td>
              </tr>
              <tr>
                <td className="py-3 px-4 font-bold text-white">24h Fresh Time-Filtered Job Radar</td>
                <td className="py-3 px-4 text-center text-secondary">Standard Feed</td>
                <td className="py-3 px-4 text-center text-emerald-400">24h Radar</td>
                <td className="py-3 px-4 text-center text-emerald-400">24h Radar</td>
                <td className="py-3 px-4 text-center text-purple-400">24h Radar</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── FAQ Section ─────────────────────────────────────────── */}
      <section aria-label="Subscription FAQs" className="p-6 sm:p-8 rounded-3xl bg-surface border border-subtle space-y-5">
        <div className="flex items-center gap-3 pb-3 border-b border-subtle">
          <div className="p-2.5 rounded-2xl bg-brand-500/15 text-brand-400 border border-brand-500/30">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-black text-white text-lg sm:text-xl">
              Frequently Asked Questions
            </h3>
            <p className="text-xs font-mono text-secondary">
              Everything you need to know about Assessyn Pro & PayU billing
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {PRICING_FAQS.map((faq, index) => {
            const isOpen = openFaq === index;
            return (
              <div
                key={index}
                className="p-4 rounded-2xl bg-surface/80 border border-subtle transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : index)}
                  className="w-full flex items-center justify-between text-left cursor-pointer gap-3"
                >
                  <span className="font-display font-bold text-sm text-white">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-secondary transition-transform duration-200 flex-shrink-0 ${
                      isOpen ? 'rotate-180 text-brand-400' : ''
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <p className="text-xs font-mono text-secondary pt-3 leading-relaxed border-t border-subtle/50 mt-3">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── PayU Checkout Modal ─────────────────────────────────── */}
      <PayUCheckoutModal
        isOpen={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        selectedPlan={selectedPlanForCheckout}
      />

      {/* ── 1-Min API Key Guide Modal ───────────────────────────── */}
      <ApiKeySetupGuideModal
        isOpen={guideModalOpen}
        onClose={() => setGuideModalOpen(false)}
      />
    </div>
  );
}
