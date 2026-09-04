import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  BellRing, Plus, Search, Filter, Trash2, Edit3, Eye,
  Clock, CheckCircle2, AlertTriangle, Sparkles, X,
  Radio, RefreshCw, Calendar, ExternalLink, ShieldAlert,
  Flame, Scroll, Zap, Home, Flower2
} from 'lucide-react';
import {
  getAdminNotifications,
  createAdminBroadcast,
  updateAdminBroadcast,
  deleteAdminBroadcast
} from '@/services/admin.service';
import { KatanaIcon, ShurikenIcon, KunaiIcon, ScrollIcon, DojoIcon } from '@/components/ui/ShinobiIcons';
import Button from '@/components/ui/Button';
import { ConfirmDeleteModal } from '@/components/shared';
import ShinobiDateTimePicker from '@/components/ui/ShinobiDateTimePicker';
import toast from 'react-hot-toast';

export const NOTIFICATION_CATEGORIES = [
  {
    id: 'high_alert',
    name: 'High Alert',
    defaultLabel: 'Clan High Alert',
    color: '#ef4444',
    bg: 'bg-rose-500/15',
    border: 'border-rose-500/35',
    text: 'text-rose-300',
    icon: Flame,
    element: 'Fire & Steel (火)',
  },
  {
    id: 'important',
    name: 'Important Directive',
    defaultLabel: 'Scroll Directive',
    color: '#f59e0b',
    bg: 'bg-amber-500/15',
    border: 'border-amber-500/35',
    text: 'text-amber-300',
    icon: ScrollIcon,
    element: 'Solar Aura (金)',
  },
  {
    id: 'update',
    name: 'Secret Release',
    defaultLabel: 'Technique Update',
    color: '#06b6d4',
    bg: 'bg-cyan-500/15',
    border: 'border-cyan-500/35',
    text: 'text-cyan-300',
    icon: Zap,
    element: 'Void & Shadow (影)',
  },
  {
    id: 'maintenance',
    name: 'Dojo Maintenance',
    defaultLabel: 'Dojo Maintenance',
    color: '#10b981',
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-500/35',
    text: 'text-emerald-300',
    icon: DojoIcon,
    element: 'Nature & Bamboo (木)',
  },
  {
    id: 'announcement',
    name: 'General Proclamation',
    defaultLabel: 'Dojo Proclamation',
    color: '#ec4899',
    bg: 'bg-pink-500/15',
    border: 'border-pink-500/35',
    text: 'text-pink-300',
    icon: Flower2,
    element: 'Floral Harmony (花)',
  },
];

function toLocalInputString(dateObj) {
  const d = new Date(dateObj);
  if (isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function calculateDurationText(startStr, endStr) {
  if (!startStr || !endStr) return null;
  const start = new Date(startStr).getTime();
  const end = new Date(endStr).getTime();
  if (isNaN(start) || isNaN(end)) return null;

  const diffMs = end - start;
  if (diffMs <= 0) {
    return { isValid: false, text: 'End Date & Time must be strictly after Start Date & Time!' };
  }

  const totalMinutes = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  let parts = [];
  if (days > 0) parts.push(`${days} Day${days > 1 ? 's' : ''}`);
  if (hours > 0) parts.push(`${hours} Hour${hours > 1 ? 's' : ''}`);
  if (minutes > 0 || parts.length === 0) parts.push(`${minutes} Min`);

  return { isValid: true, text: parts.join(', '), totalMinutes, days, hours };
}

function getScheduleBadge(scheduledAt, expiresAt) {
  const now = Date.now();
  const start = new Date(scheduledAt).getTime();
  const end = new Date(expiresAt).getTime();

  if (start > now) {
    const diffHours = Math.ceil((start - now) / 3600000);
    return {
      status: 'scheduled',
      label: diffHours < 24 ? `Starts in ${diffHours}h` : `Starts in ${Math.ceil(diffHours / 24)}d`,
      bg: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    };
  }

  if (end <= now) {
    return {
      status: 'expired',
      label: 'Expired',
      bg: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    };
  }

  const remainingHours = Math.ceil((end - now) / 3600000);
  return {
    status: 'live',
    label: remainingHours < 24 ? `Live: ${remainingHours}h left` : `Live: ${Math.ceil(remainingHours / 24)}d left`,
    bg: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  };
}

export default function AdminNotificationsPage() {
  const [data, setData] = useState({ notifications: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Delete Confirmation State (Shared Modal)
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const [form, setForm] = useState({
    title: '',
    message: '',
    category: 'update',
    label: '',
    targetTheme: 'all',
    link: '',
    scheduleType: 'now', // 'now' | 'custom'
    scheduledAt: '',
    expiryType: 'days', // 'days' | 'custom'
    durationDays: 7,
    expiresAt: '',
  });

  const fetchBroadcasts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getAdminNotifications({
        page,
        limit: 15,
        search,
        category: categoryFilter,
        status: statusFilter,
      });
      setData(res || { notifications: [], total: 0 });
    } catch (err) {
      toast.error('Failed to load broadcasts: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryFilter, statusFilter]);

  useEffect(() => {
    fetchBroadcasts();
  }, [fetchBroadcasts]);

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingItem(null);
    const now = new Date();
    // Default start right now
    const future = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    setForm({
      title: '',
      message: '',
      category: 'update',
      label: 'Technique Update',
      targetTheme: 'all',
      link: '',
      scheduledAt: toLocalInputString(now),
      expiresAt: toLocalInputString(future),
    });
    setModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (item) => {
    setEditingItem(item);
    setForm({
      title: item.title || '',
      message: item.message || '',
      category: item.category || 'update',
      label: item.label || '',
      targetTheme: item.targetTheme || 'all',
      link: item.link || '',
      scheduledAt: item.scheduledAt ? toLocalInputString(item.scheduledAt) : toLocalInputString(item.createdAt || new Date()),
      expiresAt: item.expiresAt ? toLocalInputString(item.expiresAt) : toLocalInputString(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
    });
    setModalOpen(true);
  };

  // Submit create or edit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.message.trim()) {
      toast.error('Please enter both announcement title and message.');
      return;
    }

    if (!form.scheduledAt || !form.expiresAt) {
      toast.error('Please pick both Start Date & Time and End Date & Time.');
      return;
    }

    const startDate = new Date(form.scheduledAt);
    const endDate = new Date(form.expiresAt);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      toast.error('Invalid Date/Time values provided.');
      return;
    }

    if (endDate <= startDate) {
      toast.error('End Date & Time (Expiration) must be strictly after the Start Date & Time!');
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading(editingItem ? 'Updating announcement...' : 'Publishing announcement...');

    try {
      const payload = {
        title: form.title.trim(),
        message: form.message.trim(),
        category: form.category,
        label: form.label.trim(),
        targetTheme: form.targetTheme,
        link: form.link.trim(),
        scheduledAt: startDate.toISOString(),
        expiresAt: endDate.toISOString(),
      };

      if (editingItem) {
        await updateAdminBroadcast(editingItem._id, payload);
        toast.success('Broadcast updated globally! 🗡️', { id: toastId });
      } else {
        await createAdminBroadcast(payload);
        toast.success('Broadcast scheduled & published live! 📜', { id: toastId });
      }

      setModalOpen(false);
      fetchBroadcasts();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Operation failed.';
      toast.error(msg, { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  // Confirm delete handler (Shared Modal)
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    const toastId = toast.loading('Deleting announcement globally...');
    try {
      await deleteAdminBroadcast(deleteTarget._id);
      toast.success('Broadcast deleted globally.', { id: toastId });
      setDeleteTarget(null);
      fetchBroadcasts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete announcement.', { id: toastId });
    } finally {
      setDeleting(false);
    }
  };

  // Toggle active status
  const handleToggleActive = async (item) => {
    try {
      await updateAdminBroadcast(item._id, { isActive: !item.isActive });
      toast.success(`Announcement ${!item.isActive ? 'activated' : 'paused'}.`);
      fetchBroadcasts();
    } catch (err) {
      toast.error('Failed to toggle status: ' + err.message);
    }
  };

  const selectedCategoryMeta = useMemo(() => {
    return NOTIFICATION_CATEGORIES.find((c) => c.id === form.category) || NOTIFICATION_CATEGORIES[0];
  }, [form.category]);

  const durationMeta = useMemo(() => {
    return calculateDurationText(form.scheduledAt, form.expiresAt);
  }, [form.scheduledAt, form.expiresAt]);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12 font-sans">
      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-brand-500/15 border border-brand-500/30 text-brand-300 text-[10px] font-mono font-black uppercase tracking-wider mb-1">
            <BellRing className="w-3 h-3" />
            <span>GLOBAL DISPATCH // 忍告 DOJO</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-display font-black text-white tracking-tight">
            Broadcasts & Directives
          </h1>
          <p className="text-secondary text-xs sm:text-sm font-mono mt-0.5">
            Publish real-time system alerts, technique directives, and announcements with custom expiration scheduling
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto">
          <button
            onClick={fetchBroadcasts}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-surface border border-subtle text-secondary text-xs font-mono font-bold hover:text-white hover:border-brand-500/40 transition-all cursor-pointer"
            title="Refresh list"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </button>

          <Button
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={handleOpenCreate}
            className="font-bold text-xs shadow-md shadow-brand-500/20"
          >
            <span>New Broadcast</span>
          </Button>
        </div>
      </div>

      {/* ── Filter Bar ───────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-2xl bg-surface/90 border border-subtle">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary" />
          <input
            type="text"
            placeholder="Search by title, message, label..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface border border-subtle text-xs text-white placeholder-secondary focus:outline-none focus:border-brand-500/60 font-mono"
          />
        </div>

        {/* Category Filter */}
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-xl bg-surface border border-subtle text-xs text-white focus:outline-none focus:border-brand-500/60 font-mono cursor-pointer"
        >
          <option value="all">All Shinobi Categories</option>
          {NOTIFICATION_CATEGORIES.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name} ({cat.element})
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-xl bg-surface border border-subtle text-xs text-white focus:outline-none focus:border-brand-500/60 font-mono cursor-pointer"
        >
          <option value="all">All Lifecycles</option>
          <option value="active">Active & Live</option>
          <option value="expired">Expired Lifecycles</option>
          <option value="inactive">Paused / Inactive</option>
        </select>
      </div>

      {/* ── Broadcasts List ──────────────────────────────────── */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-5 h-28 bg-surface/40 animate-pulse rounded-2xl border border-subtle" />
          ))}
        </div>
      ) : data.notifications.length === 0 ? (
        <div className="card p-12 text-center rounded-3xl border border-subtle bg-surface/50 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center mx-auto">
            <BellRing size={20} />
          </div>
          <h3 className="text-base font-display font-bold text-white">No Broadcast Announcements Found</h3>
          <p className="text-xs font-mono text-secondary max-w-sm mx-auto">
            Click "New Broadcast" to deploy a global shinobi directive, release note, or alert to all candidates.
          </p>
          <Button variant="primary" size="sm" icon={Plus} onClick={handleOpenCreate}>
            Publish First Broadcast
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {data.notifications.map((item) => {
            const catMeta = NOTIFICATION_CATEGORIES.find((c) => c.id === item.category) || NOTIFICATION_CATEGORIES[0];
            const Icon = catMeta.icon;
            const isLive = item.isActive && !item.isExpired;

            return (
              <div
                key={item._id}
                className="card p-4 sm:p-5 rounded-2xl border border-subtle bg-surface/90 hover:border-brand-500/40 transition-all space-y-3 shadow-md"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  {/* Left: Category Icon & Title */}
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2.5 rounded-xl ${catMeta.bg} border ${catMeta.border} flex-shrink-0 mt-0.5`}
                      style={{ color: catMeta.color }}
                    >
                      <Icon size={16} />
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Custom Label Pill */}
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-extrabold uppercase border ${catMeta.bg} ${catMeta.border}`}
                          style={{ color: catMeta.color }}
                        >
                          {item.label || catMeta.defaultLabel}
                        </span>

                        {/* Theme Target */}
                        {item.targetTheme && item.targetTheme !== 'all' && (
                          <span className="px-2 py-0.5 rounded-md bg-surface border border-subtle text-secondary text-[10px] font-mono">
                            Theme: {item.targetTheme}
                          </span>
                        )}

                        {/* Status Badge */}
                        {isLive ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live Now
                          </span>
                        ) : item.isExpired ? (
                          <span className="px-2 py-0.5 rounded-md bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[10px] font-mono font-bold">
                            Expired
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-surface border border-subtle text-secondary text-[10px] font-mono font-bold">
                            Paused
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-display font-black text-white tracking-tight">{item.title}</h3>
                    </div>
                  </div>

                  {/* Right: Metrics & Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {/* Impressions */}
                    <div className="text-right font-mono text-[11px] text-secondary pr-2 hidden md:block">
                      <div>Reads: <span className="text-white font-bold">{item.readCount}</span></div>
                      <div>Dismissed: <span className="text-slate-400">{item.dismissedCount}</span></div>
                    </div>

                    {/* Toggle Active Button */}
                    <button
                      type="button"
                      onClick={() => handleToggleActive(item)}
                      className="px-2.5 py-1.5 rounded-xl bg-surface hover:bg-surface-hover border border-subtle text-secondary hover:text-white text-xs font-mono font-bold transition-all cursor-pointer"
                      title={item.isActive ? 'Pause broadcast' : 'Activate broadcast'}
                    >
                      {item.isActive ? 'Pause' : 'Activate'}
                    </button>

                    {/* Edit Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(item)}
                      className="p-2 rounded-xl bg-surface hover:bg-surface-hover border border-subtle text-secondary hover:text-brand-400 transition-all cursor-pointer"
                      title="Edit broadcast"
                    >
                      <Edit3 size={13} />
                    </button>

                    {/* Delete Button (Opens Shared ConfirmDeleteModal) */}
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(item)}
                      className="p-2 rounded-xl bg-surface hover:bg-rose-500/10 border border-subtle hover:border-rose-500/30 text-secondary hover:text-rose-400 transition-all cursor-pointer"
                      title="Delete globally"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Message Body */}
                <p className="text-xs text-secondary/90 font-sans leading-relaxed pl-1 sm:pl-10">
                  {item.message}
                </p>

                {/* Footer Info: Start and End timeline */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-secondary pt-2.5 border-t border-subtle/50 sm:pl-10">
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                    <span className="flex items-center gap-1.5 text-emerald-300 font-bold">
                      <Clock size={12} className="text-emerald-400" />
                      Starts: {new Date(item.scheduledAt || item.createdAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                    </span>

                    <span className="flex items-center gap-1.5 text-rose-300 font-bold">
                      <Calendar size={12} className="text-rose-400" />
                      Ends: {new Date(item.expiresAt).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                    </span>

                    {/* Schedule Badge */}
                    {(() => {
                      const badge = getScheduleBadge(item.scheduledAt || item.createdAt, item.expiresAt);
                      return (
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-extrabold border ${badge.bg}`}>
                          {badge.label}
                        </span>
                      );
                    })()}
                  </div>

                  {item.link && (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-brand-400 hover:text-brand-300 hover:underline font-bold"
                    >
                      <span>Directive Link</span>
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Create / Edit Modal ───────────────────────────────── */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
          <div className="bg-[#0e0e1a] border border-white/15 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#121224]">
              <div className="flex items-center gap-2">
                <BellRing className="w-4 h-4 text-brand-400" />
                <h2 className="text-base font-display font-black text-white">
                  {editingItem ? 'Edit Shinobi Broadcast' : 'Publish Global Shinobi Broadcast'}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-xl text-secondary hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto flex-1 font-mono text-xs">
              {/* Category Selector */}
              <div className="space-y-2">
                <label className="block text-[11px] font-extrabold uppercase text-secondary">
                  Category & Chakra Style
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {NOTIFICATION_CATEGORIES.map((cat) => {
                    const CatIcon = cat.icon;
                    const isSelected = form.category === cat.id;

                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setForm((p) => ({
                            ...p,
                            category: cat.id,
                            label: p.label && p.label !== selectedCategoryMeta.defaultLabel ? p.label : cat.defaultLabel,
                          }));
                        }}
                        className={`p-2.5 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                          isSelected
                            ? `${cat.bg} ${cat.border} ring-1`
                            : 'bg-surface border-subtle hover:border-white/20'
                        }`}
                        style={{ ringColor: isSelected ? cat.color : 'transparent' }}
                      >
                        <div
                          className={`p-1.5 rounded-lg ${cat.bg} border ${cat.border} shrink-0`}
                          style={{ color: cat.color }}
                        >
                          <CatIcon size={13} />
                        </div>
                        <div className="truncate">
                          <p className="text-[11px] font-bold text-white truncate">{cat.name}</p>
                          <p className="text-[9.5px] text-secondary truncate">{cat.element}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title & Custom Label Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-[11px] font-extrabold uppercase text-secondary">
                    Announcement Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dojo Update: Multi-LLM Arena Now Live"
                    value={form.title}
                    onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-subtle text-white text-xs placeholder-secondary focus:outline-none focus:border-brand-500/60"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-extrabold uppercase text-secondary">
                    Custom Label Name
                  </label>
                  <input
                    type="text"
                    placeholder={selectedCategoryMeta.defaultLabel}
                    value={form.label}
                    onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-subtle text-white text-xs placeholder-secondary focus:outline-none focus:border-brand-500/60"
                  />
                </div>
              </div>

              {/* Message */}
              <div className="space-y-1">
                <label className="block text-[11px] font-extrabold uppercase text-secondary">
                  Message Content *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Enter the detailed announcement message displayed in candidate topbars..."
                  value={form.message}
                  onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl bg-surface border border-subtle text-white text-xs placeholder-secondary focus:outline-none focus:border-brand-500/60 font-sans leading-relaxed"
                />
              </div>

              {/* ── Chakra Schedule & Timeline: Exact Start & End Date/Time ── */}
              <div className="p-4 rounded-2xl bg-[#111124] border border-white/15 space-y-3.5 shadow-inner">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
                  <div className="text-[11.5px] font-bold text-white flex items-center gap-2">
                    <Calendar size={14} className="text-brand-400" />
                    <span className="uppercase tracking-wider">Broadcast Schedule (Start Date & End Date)</span>
                  </div>

                  {durationMeta && (
                    <span
                      className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border self-start sm:self-auto ${
                        durationMeta.isValid
                          ? 'bg-brand-500/20 text-brand-300 border-brand-500/35'
                          : 'bg-rose-500/20 text-rose-300 border-rose-500/35'
                      }`}
                    >
                      {durationMeta.isValid ? `⏱️ Active for: ${durationMeta.text}` : durationMeta.text}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* START DATE & TIME */}
                  <div className="p-3 rounded-xl bg-[#0c0c17] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10.5px] font-extrabold uppercase text-emerald-300 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        Start Time (Kab Live Hogi) *
                      </label>
                      <button
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, scheduledAt: toLocalInputString(new Date()) }))}
                        className="text-[10px] font-mono text-brand-400 hover:text-white underline cursor-pointer"
                      >
                        Right Now
                      </button>
                    </div>

                    <ShinobiDateTimePicker
                      value={form.scheduledAt}
                      onChange={(val) => setForm((p) => ({ ...p, scheduledAt: val }))}
                      accentColor="emerald"
                      disablePast={true}
                    />

                    {form.scheduledAt && (
                      <p className="text-[10px] text-slate-400 font-sans truncate">
                        Starts: {new Date(form.scheduledAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    )}
                  </div>

                  {/* END DATE & TIME */}
                  <div className="p-3 rounded-xl bg-[#0c0c17] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10.5px] font-extrabold uppercase text-rose-300 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-400" />
                        End Time (Kab Hategi) *
                      </label>
                    </div>

                    <ShinobiDateTimePicker
                      value={form.expiresAt}
                      onChange={(val) => setForm((p) => ({ ...p, expiresAt: val }))}
                      accentColor="rose"
                      disablePast={true}
                      minDate={form.scheduledAt || new Date()}
                    />

                    {form.expiresAt && (
                      <p className="text-[10px] text-slate-400 font-sans truncate">
                        Expires: {new Date(form.expiresAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                      </p>
                    )}
                  </div>
                </div>

                {/* Quick Add Days to End Date */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-white/5 text-[10.5px]">
                  <span className="text-secondary font-mono">Quick Set End Time from Start:</span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[
                      { label: '+1 Day', days: 1 },
                      { label: '+3 Days', days: 3 },
                      { label: '+7 Days', days: 7 },
                      { label: '+14 Days', days: 14 },
                      { label: '+30 Days', days: 30 },
                    ].map((btn) => (
                      <button
                        key={btn.days}
                        type="button"
                        onClick={() => {
                          const base = form.scheduledAt ? new Date(form.scheduledAt) : new Date();
                          const newEnd = new Date(base.getTime() + btn.days * 24 * 60 * 60 * 1000);
                          setForm((p) => ({ ...p, expiresAt: toLocalInputString(newEnd) }));
                        }}
                        className="px-2.5 py-1 rounded-lg bg-surface hover:bg-brand-500/20 border border-subtle hover:border-brand-500/40 text-secondary hover:text-white transition-all cursor-pointer font-mono font-bold text-[10px]"
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Target Theme & Action Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[11px] font-extrabold uppercase text-secondary">
                    Target Shinobi Theme
                  </label>
                  <select
                    value={form.targetTheme}
                    onChange={(e) => setForm((p) => ({ ...p, targetTheme: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-subtle text-white text-xs focus:outline-none focus:border-brand-500/60 cursor-pointer"
                  >
                    <option value="all">All Themes (Global Broadcast)</option>
                    <option value="shadow">Shadow Shinobi (影)</option>
                    <option value="forest">Forest Jade (木)</option>
                    <option value="maple">Blood Maple (火)</option>
                    <option value="sakura">Night Sakura (花)</option>
                    <option value="gold">Solar Blade (金)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-extrabold uppercase text-secondary">
                    Optional Action Link URL
                  </label>
                  <input
                    type="text"
                    placeholder="/interviews/new or https://..."
                    value={form.link}
                    onChange={(e) => setForm((p) => ({ ...p, link: e.target.value }))}
                    className="w-full px-3 py-2 rounded-xl bg-surface border border-subtle text-white text-xs placeholder-secondary focus:outline-none focus:border-brand-500/60"
                  />
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="space-y-1.5 pt-2">
                <label className="block text-[10.5px] uppercase text-brand-300 font-extrabold">
                  Candidate Topbar Live Preview
                </label>
                <div className="p-3.5 rounded-2xl bg-[#0c0c17] border border-white/15 flex items-start gap-3 shadow-lg">
                  <div
                    className={`p-2 rounded-xl ${selectedCategoryMeta.bg} border ${selectedCategoryMeta.border} shrink-0`}
                    style={{ color: selectedCategoryMeta.color }}
                  >
                    {(() => {
                      const IconPreview = selectedCategoryMeta.icon;
                      return <IconPreview size={14} />;
                    })()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span
                        className={`text-[9.5px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded border ${selectedCategoryMeta.bg} ${selectedCategoryMeta.border}`}
                        style={{ color: selectedCategoryMeta.color }}
                      >
                        {form.label || selectedCategoryMeta.defaultLabel}
                      </span>
                      <span className="text-[10px] text-secondary">Just now</span>
                    </div>
                    <p className="text-xs font-bold text-white truncate">{form.title || 'Announcement Title'}</p>
                    <p className="text-[11px] text-secondary font-sans mt-0.5 leading-snug line-clamp-2">
                      {form.message || 'Announcement message preview will appear here for candidates.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface hover:bg-white/5 border border-subtle text-secondary hover:text-white text-xs font-mono font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={submitting}
                  className="font-bold text-xs shadow-md shadow-brand-500/20"
                >
                  {submitting ? 'Submitting...' : editingItem ? 'Save Changes' : 'Publish Broadcast'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Shared Delete Confirmation Modal ────────────────── */}
      <ConfirmDeleteModal
        isOpen={Boolean(deleteTarget)}
        onClose={() => !deleting && setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        loading={deleting}
        title="Delete Global Broadcast Directive?"
        message={`Are you sure you want to permanently delete broadcast "${deleteTarget?.title}"? This directive will be deleted globally and removed immediately for all candidates across the platform.`}
        itemTitle={deleteTarget?.title}
        confirmText="Confirm Delete"
        cancelText="Keep Broadcast"
      />
    </div>
  );
}
