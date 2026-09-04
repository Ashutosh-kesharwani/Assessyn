import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Edit3, Trash2, Shield, DollarSign, Check, X,
  FileText, Award, Calendar, Percent, Loader2, Sparkles, LayoutGrid, CheckCircle,
  Eye, RefreshCw, Flame, Crown, Lock, ArrowRight, Tag, Save
} from 'lucide-react';
import {
  getAdminPlans, getAdminPlanStats, createAdminPlan, updateAdminPlan, deleteAdminPlan
} from '@/services/admin.service';
import { CATEGORY_STYLES } from '@/pages/subscription/PricingPage';
import toast from 'react-hot-toast';

const CATEGORY_OPTIONS = [
  { id: 'quick_test', label: '⚡ Quick Test // Trial Pass (e.g. ₹50 / 7-Day)' },
  { id: 'most_popular', label: '🗡️ Most Popular // Shinobi Choice (e.g. ₹299 / Month)' },
  { id: 'economical', label: '💎 Economical // Pocket Saver (e.g. ₹1,299 / 6-Month)' },
  { id: 'long_term', label: '👑 Long Term // VIP Max Savings (e.g. ₹2,199 / 1-Year)' },
  { id: 'general', label: '🥋 Genin Standard // Starter Plan' },
];

// ─── Interactive Plan Form Modal with Live Square Card Preview ─────────────
function PlanFormModal({ plan, onSave, onClose }) {
  const [form, setForm] = useState({
    name:         plan?.name || '',
    code:         plan?.code || (plan ? '' : `plan_${Date.now()}`),
    subtitle:     plan?.subtitle || '',
    price:        plan?.price !== undefined ? plan.price : 299,
    durationDays: plan?.durationDays || 30,
    category:     plan?.category || 'most_popular',
    badgeText:    plan?.badgeText || '',
    savingsText:  plan?.savingsText || '',
    ctaText:      plan?.ctaText || 'Unlock Plan',
    accentColor:  plan?.accentColor || '#10b981',
    sortOrder:    plan?.sortOrder !== undefined ? plan.sortOrder : 1,
    isPublished:  plan?.isPublished !== undefined ? plan.isPublished : true,
  });

  // Local feature bullet list management
  const [features, setFeatures] = useState(
    plan?.features?.length > 0
      ? plan.features
      : [
          '⚡ Unlimited AI Mock Simulations',
          '🤖 5 Multi-LLM BYOK Cascade Access',
          '📄 10 ATS Resume Templates & PDF Export',
          '🌐 10 Live Developer Portfolio Styles',
        ]
  );
  const [newFeature, setNewFeature] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.price < 0) return toast.error('Price cannot be negative.');
    if (!form.name.trim()) return toast.error('Plan name is required.');

    setSaving(true);
    try {
      const payload = {
        ...form,
        features,
      };

      if (plan?._id) {
        await updateAdminPlan(plan._id, payload);
      } else {
        await createAdminPlan(payload);
      }
      toast.success('Subscription plan specifications saved.');
      onSave();
      onClose();
    } catch {
      toast.error('Error saving subscription plan details.');
    } finally {
      setSaving(false);
    }
  };

  const addFeature = () => {
    const f = newFeature.trim();
    if (f && !features.includes(f)) {
      setFeatures(p => [...p, f]);
      setNewFeature('');
    }
  };

  const removeFeature = (idx) => {
    setFeatures(p => p.filter((_, i) => i !== idx));
  };

  const currentCategoryStyle = CATEGORY_STYLES[form.category] || CATEGORY_STYLES.general;
  const CategoryIcon = currentCategoryStyle.icon;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#101322] border border-subtle rounded-3xl p-6 sm:p-8 w-full max-w-5xl shadow-2xl space-y-6 my-8 max-h-[92vh] overflow-y-auto scrollbar-thin">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-subtle pb-4">
          <div>
            <span className="text-[10px] font-mono font-extrabold text-brand-400 uppercase tracking-widest block">
              // PLAN FORGE CONTROLLER
            </span>
            <h3 className="text-white font-display font-black text-xl mt-0.5">
              {plan ? `Edit Plan: ${plan.name}` : 'Forge New Subscription Plan'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-surface border border-subtle text-secondary hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Form Controls (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* 1. Category Preset Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold uppercase text-secondary block">
                Plan Category & Style Preset*
              </label>
              <select
                className="w-full p-3 rounded-xl bg-surface border border-subtle text-white text-xs font-mono focus:border-brand-500 focus:outline-none"
                value={form.category}
                onChange={(e) => setForm(p => ({ ...p, category: e.target.value }))}
              >
                {CATEGORY_OPTIONS.map(c => (
                  <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Plan Name */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase text-secondary block">
                  Plan Display Name*
                </label>
                <input
                  className="w-full p-3 rounded-xl bg-surface border border-subtle text-white text-xs font-sans focus:border-brand-500 focus:outline-none"
                  value={form.name}
                  onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Pro Shinobi Monthly Mastery"
                  required
                />
              </div>

              {/* Unique Slug Code */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase text-secondary block">
                  Slug Code (ID)
                </label>
                <input
                  className="w-full p-3 rounded-xl bg-surface border border-subtle text-white text-xs font-mono focus:border-brand-500 focus:outline-none"
                  value={form.code}
                  onChange={(e) => setForm(p => ({ ...p, code: e.target.value }))}
                  placeholder="e.g. pro_monthly_299"
                />
              </div>

              {/* Price (INR) */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase text-secondary block">
                  Price (₹ INR)*
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  className="w-full p-3 rounded-xl bg-surface border border-subtle text-white text-xs font-mono focus:border-brand-500 focus:outline-none font-bold"
                  value={form.price}
                  onChange={(e) => setForm(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))}
                  required
                />
              </div>

              {/* Duration in Days */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase text-secondary block">
                  Duration (Days)*
                </label>
                <input
                  type="number"
                  min="1"
                  className="w-full p-3 rounded-xl bg-surface border border-subtle text-white text-xs font-mono focus:border-brand-500 focus:outline-none"
                  value={form.durationDays}
                  onChange={(e) => setForm(p => ({ ...p, durationDays: parseInt(e.target.value) || 30 }))}
                  required
                />
              </div>

              {/* Sort Order */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase text-secondary block">
                  Display Order
                </label>
                <input
                  type="number"
                  className="w-full p-3 rounded-xl bg-surface border border-subtle text-white text-xs font-mono focus:border-brand-500 focus:outline-none"
                  value={form.sortOrder}
                  onChange={(e) => setForm(p => ({ ...p, sortOrder: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            {/* Subtitle / Short Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold uppercase text-secondary block">
                Subtitle / Pitch Text
              </label>
              <input
                className="w-full p-3 rounded-xl bg-surface border border-subtle text-white text-xs font-sans focus:border-brand-500 focus:outline-none"
                value={form.subtitle}
                onChange={(e) => setForm(p => ({ ...p, subtitle: e.target.value }))}
                placeholder="e.g. Our flagship membership for active job hunters facing technical rounds."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Badge Text */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase text-secondary block">
                  Top Badge Callout
                </label>
                <input
                  className="w-full p-3 rounded-xl bg-surface border border-subtle text-white text-xs font-mono focus:border-brand-500 focus:outline-none"
                  value={form.badgeText}
                  onChange={(e) => setForm(p => ({ ...p, badgeText: e.target.value }))}
                  placeholder="e.g. MOST POPULAR // SHINOBI CHOICE"
                />
              </div>

              {/* Savings Text */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono font-bold uppercase text-secondary block">
                  Savings Badge (e.g. Save 40%)
                </label>
                <input
                  className="w-full p-3 rounded-xl bg-surface border border-subtle text-white text-xs font-mono focus:border-brand-500 focus:outline-none"
                  value={form.savingsText}
                  onChange={(e) => setForm(p => ({ ...p, savingsText: e.target.value }))}
                  placeholder="e.g. Save 28% or ₹7/Day"
                />
              </div>
            </div>

            {/* CTA Button Text */}
            <div className="space-y-1.5">
              <label className="text-xs font-mono font-bold uppercase text-secondary block">
                CTA Button Text
              </label>
              <input
                className="w-full p-3 rounded-xl bg-surface border border-subtle text-white text-xs font-sans focus:border-brand-500 focus:outline-none"
                value={form.ctaText}
                onChange={(e) => setForm(p => ({ ...p, ctaText: e.target.value }))}
                placeholder="e.g. Unlock Pro Monthly"
              />
            </div>

            {/* Dynamic Bullet Points Manager */}
            <div className="pt-2 border-t border-subtle space-y-2.5">
              <label className="text-xs font-mono font-bold uppercase text-secondary block">
                Included Features & Bullet Points ({features.length})
              </label>
              <div className="flex gap-2">
                <input
                  className="flex-1 p-3 rounded-xl bg-surface border border-subtle text-white text-xs font-sans focus:border-brand-500 focus:outline-none"
                  placeholder="e.g. 5-Model Multi-LLM BYOK Cascade Access"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                />
                <button
                  type="button"
                  onClick={addFeature}
                  className="px-4 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-mono font-bold text-xs flex-shrink-0 cursor-pointer"
                >
                  Add
                </button>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto scrollbar-thin pr-1">
                {features.map((f, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-surface border border-subtle text-xs text-slate-200">
                    <span className="truncate pr-2">{f}</span>
                    <button
                      type="button"
                      onClick={() => removeFeature(idx)}
                      className="text-secondary hover:text-rose-400 transition-colors p-1 cursor-pointer"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Publish Checkbox */}
            <div className="flex items-center pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => setForm(p => ({ ...p, isPublished: e.target.checked }))}
                  className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500"
                />
                <span className="text-white text-xs font-mono font-bold">
                  Publish Plan Immediately (Live on `/pricing`)
                </span>
              </label>
            </div>
          </div>

          {/* Right Column: Live Square Card Preview (5 Cols) */}
          <div className="lg:col-span-5 space-y-3">
            <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-slate-400 block">
              // LIVE SQUARE CARD PREVIEW (AS SEEN BY USER)
            </span>

            <div
              className={`rounded-3xl border ${currentCategoryStyle.cardBorder} ${currentCategoryStyle.cardGlow} p-6 flex flex-col justify-between h-[480px] shadow-2xl relative overflow-hidden`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-mono font-black uppercase tracking-wider border flex items-center gap-1.5 ${currentCategoryStyle.badgeClass}`}>
                    <CategoryIcon className="w-3 h-3" />
                    <span>{form.badgeText || currentCategoryStyle.badge}</span>
                  </span>
                  {form.savingsText && (
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-mono font-bold">
                      {form.savingsText}
                    </span>
                  )}
                </div>

                <div>
                  <h4 className="text-lg font-display font-black text-white truncate">
                    {form.name || 'Untitled Plan'}
                  </h4>
                  <p className="text-[10.5px] font-mono text-secondary mt-0.5 leading-snug line-clamp-2">
                    {form.subtitle || 'Short description of your plan benefits.'}
                  </p>
                </div>

                <div className="pt-2 border-t border-subtle flex items-baseline gap-1">
                  <span className="text-xs font-mono text-secondary">₹</span>
                  <span className={`text-3xl font-display font-black ${currentCategoryStyle.priceColor}`}>
                    {form.price}
                  </span>
                  <span className="text-[11px] font-mono text-secondary">
                    / {form.durationDays}d
                  </span>
                </div>
              </div>

              {/* Features List */}
              <div className="flex-1 my-3 py-2 border-y border-subtle/70 overflow-y-auto max-h-[160px] scrollbar-thin space-y-2 pr-1">
                {features.map((bullet, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-[11px] text-slate-200">
                    <CheckCircle className={`w-3.5 h-3.5 ${currentCategoryStyle.checkColor} flex-shrink-0 mt-0.5`} />
                    <span className="leading-snug">{bullet}</span>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <div className="space-y-2 pt-1">
                <div
                  className={`w-full py-2.5 px-4 rounded-xl font-display font-black text-xs text-center flex items-center justify-center gap-1.5 ${currentCategoryStyle.btnGradient}`}
                >
                  <span>{form.ctaText || 'Unlock Plan'}</span>
                  <ArrowRight size={14} />
                </div>
                <div className="flex items-center justify-center gap-1 text-[9.5px] font-mono text-secondary">
                  <Lock size={10} className="text-emerald-400" />
                  <span>256-Bit SSL · PayU Verified</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions Footer */}
          <div className="lg:col-span-12 flex items-center justify-end gap-3 pt-4 border-t border-subtle">
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-5 rounded-xl bg-surface border border-subtle text-secondary hover:text-white text-xs font-mono font-bold cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="py-3 px-7 rounded-xl bg-gradient-to-r from-brand-500 to-violet-600 hover:from-brand-600 hover:to-violet-700 text-white font-display font-black text-xs tracking-wide shadow-lg shadow-brand-500/25 transition-all cursor-pointer flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>{saving ? 'Publishing Plan...' : 'Save & Publish Plan'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Main Admin Subscription Management Page ───────────────────────────────
export default function AdminSubscriptionPage() {
  const [plans, setPlans] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editingPlan, setEditingPlan] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [plansRes, statsRes] = await Promise.all([
        getAdminPlans({ limit: 50 }),
        getAdminPlanStats(),
      ]);
      setPlans(plansRes?.data?.plans || []);
      setStats(statsRes?.data || null);
    } catch {
      toast.error('Failed to load subscription dashboard metrics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to archive "${name}"?`)) return;
    try {
      await deleteAdminPlan(id);
      toast.success('Plan archived successfully.');
      loadData();
    } catch {
      toast.error('Could not archive plan.');
    }
  };

  const handleCreateNew = () => {
    setEditingPlan(null);
    setIsModalOpen(true);
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      {/* Header Banner */}
      <header className="p-6 sm:p-8 rounded-3xl bg-surface/90 backdrop-blur-2xl border border-subtle flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/40 text-[10px] font-mono font-black uppercase tracking-wider flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5" />
              <span>DYNAMIC SUBSCRIPTION ENGINE</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-white">
            Subscription Plans & Pricing Manager
          </h1>
          <p className="text-xs sm:text-sm text-secondary font-mono max-w-2xl">
            Create, edit, and categorize membership plans across 5 distinct presets. All changes reflect live on the user pricing page.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateNew}
          className="py-3 px-5 rounded-2xl bg-gradient-to-r from-brand-500 to-violet-600 hover:from-brand-600 hover:to-violet-700 text-white font-display font-black text-xs tracking-wide shadow-lg shadow-brand-500/25 transition-all cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>Forge New Plan</span>
        </button>
      </header>

      {/* Metric Telemetry Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-surface border border-subtle flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-secondary font-bold">Total Plans</span>
            <p className="text-2xl font-display font-black text-white">{stats?.totalPlans || plans.length}</p>
          </div>
          <div className="p-3 rounded-xl bg-brand-500/10 text-brand-400 border border-brand-500/20">
            <LayoutGrid size={20} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-subtle flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-secondary font-bold">Published Live</span>
            <p className="text-2xl font-display font-black text-emerald-400">{stats?.activePlans || plans.filter(p => p.isPublished).length}</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle size={20} />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-subtle flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-secondary font-bold">Active Pro Subscribers</span>
            <p className="text-2xl font-display font-black text-purple-400">{stats?.premiumUsers || 0}</p>
          </div>
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Crown size={20} />
          </div>
        </div>
      </div>

      {/* Plans Grid Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-display font-black text-white">
            Active Catalog ({plans.length} Plans)
          </h2>
          <button
            type="button"
            onClick={loadData}
            className="p-2 rounded-xl bg-surface border border-subtle text-secondary hover:text-white transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-mono"
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((p) => {
            const style = CATEGORY_STYLES[p.category] || CATEGORY_STYLES.general;
            const Icon = style.icon;

            return (
              <div
                key={p._id || p.code}
                className={`p-6 rounded-3xl border ${style.cardBorder} bg-surface/90 flex flex-col justify-between space-y-4 shadow-lg relative group`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-mono font-black uppercase border flex items-center gap-1 ${style.badgeClass}`}>
                      <Icon size={12} />
                      <span>{p.category || 'general'}</span>
                    </span>
                    <span className={`text-[10px] font-mono font-bold ${p.isPublished ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {p.isPublished ? '● LIVE' : '○ DRAFT'}
                    </span>
                  </div>

                  <h3 className="text-lg font-display font-black text-white truncate">
                    {p.name}
                  </h3>
                  <p className="text-xs font-mono text-secondary leading-snug line-clamp-2">
                    {p.subtitle || 'No description provided.'}
                  </p>

                  <div className="pt-2 border-t border-subtle flex items-baseline gap-1">
                    <span className="text-xs font-mono text-secondary">₹</span>
                    <span className={`text-3xl font-display font-black ${style.priceColor}`}>
                      {p.price}
                    </span>
                    <span className="text-xs font-mono text-secondary">
                      / {p.durationDays}d
                    </span>
                  </div>

                  {/* Features pill summary */}
                  <div className="pt-2 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 font-bold uppercase block">
                      Features ({p.features?.length || 0}):
                    </span>
                    <ul className="text-xs text-secondary space-y-1">
                      {p.features?.slice(0, 3).map((f, i) => (
                        <li key={i} className="truncate flex items-center gap-1.5">
                          <span className="w-1 h-1 rounded-full bg-brand-400" />
                          <span>{f}</span>
                        </li>
                      ))}
                      {p.features?.length > 3 && (
                        <li className="text-[10px] font-mono text-brand-400">
                          +{p.features.length - 3} more items...
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-subtle">
                  <button
                    type="button"
                    onClick={() => handleEdit(p)}
                    className="flex-1 py-2 px-3 rounded-xl bg-surface border border-subtle hover:border-brand-500 text-brand-300 hover:text-white text-xs font-mono font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Edit3 size={13} />
                    <span>Edit Plan</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(p._id, p.name)}
                    className="p-2 rounded-xl bg-surface border border-subtle hover:border-rose-500 text-secondary hover:text-rose-400 transition-colors cursor-pointer"
                    title="Archive Plan"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <PlanFormModal
          plan={editingPlan}
          onSave={loadData}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
}
