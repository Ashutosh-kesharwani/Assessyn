import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bell, CheckCheck, X, ExternalLink, Sparkles,
  Flame, Zap, Flower2, Clock
} from 'lucide-react';
import { notificationAPI } from '@/services/api';
import { ScrollIcon, DojoIcon } from '@/components/ui/ShinobiIcons';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';

const CATEGORY_MAP = {
  high_alert: {
    icon: Flame,
    color: '#ef4444',
    bg: 'bg-rose-500/15',
    border: 'border-rose-500/30',
    defaultLabel: 'Clan High Alert',
  },
  important: {
    icon: ScrollIcon,
    color: '#f59e0b',
    bg: 'bg-amber-500/15',
    border: 'border-amber-500/30',
    defaultLabel: 'Scroll Directive',
  },
  update: {
    icon: Zap,
    color: '#06b6d4',
    bg: 'bg-cyan-500/15',
    border: 'border-cyan-500/30',
    defaultLabel: 'Technique Update',
  },
  maintenance: {
    icon: DojoIcon,
    color: '#10b981',
    bg: 'bg-emerald-500/15',
    border: 'border-emerald-500/30',
    defaultLabel: 'Dojo Maintenance',
  },
  announcement: {
    icon: Flower2,
    color: '#ec4899',
    bg: 'bg-pink-500/15',
    border: 'border-pink-500/30',
    defaultLabel: 'Dojo Proclamation',
  },
};

function formatTimeAgo(dateString) {
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function UserNotificationDropdown() {
  const { user } = useAuthStore();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      const res = await notificationAPI.getAll();
      if (res.success) {
        setNotifications(res.notifications || []);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch {
      // Graceful silently
    }
  }, [user]);

  useEffect(() => {
    fetchNotifications();
    // Poll every 60 seconds for new broadcasts
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Handle outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  // Mark single notification as read
  const handleMarkRead = async (id, isRead) => {
    if (isRead) return;
    try {
      await notificationAPI.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // Ignored
    }
  };

  // Mark all notifications as read
  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;
    try {
      await notificationAPI.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('All directives marked as read.');
    } catch {
      toast.error('Failed to mark all as read.');
    }
  };

  // Dismiss notification for this candidate ONLY (via `x` button)
  const handleDismiss = async (e, id) => {
    e.stopPropagation();
    try {
      await notificationAPI.dismiss(id);
      const target = notifications.find((n) => n._id === id);
      if (target && !target.isRead) {
        setUnreadCount((c) => Math.max(0, c - 1));
      }
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      toast.success('Directive dismissed from your feed.');
    } catch {
      toast.error('Failed to dismiss notification.');
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ── Bell Button ──────────────────────────────────────── */}
      <button
        type="button"
        id="user-notifications-bell-btn"
        onClick={() => setOpen(!open)}
        className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-surface border border-subtle flex items-center justify-center text-secondary hover:text-white hover:border-brand-500/40 transition-all duration-200 cursor-pointer shadow-sm"
        aria-label="Directives & Notifications"
        title="Directives & System Broadcasts"
      >
        <Bell size={16} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-4 h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-mono font-black flex items-center justify-center shadow-lg shadow-rose-500/40 animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* ── Popover Drawer ────────────────────────────────────── */}
      {open && (
        <div className="
          absolute right-0 top-full mt-2.5 w-84 sm:w-96
          bg-[#0c0c17] border border-white/15 rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.95)]
          overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150 font-sans
        ">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#111122] border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-white font-mono font-bold text-xs uppercase tracking-wider">Scroll Directives</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-brand-500/25 border border-brand-500/40 text-brand-300 text-[10px] font-mono font-bold">
                  {unreadCount} unread
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-[10.5px] font-mono text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <CheckCheck size={12} />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List Container */}
          <div className="max-h-96 overflow-y-auto divide-y divide-white/10 scrollbar-thin bg-[#0c0c17]">
            {notifications.length === 0 ? (
              <div className="py-12 text-center text-slate-400 space-y-2">
                <div className="w-10 h-10 rounded-full bg-surface border border-subtle flex items-center justify-center mx-auto text-secondary">
                  <Bell size={16} />
                </div>
                <p className="text-xs font-mono">No active directives for your scroll.</p>
                <p className="text-[10.5px] text-slate-500 font-mono">Platform broadcasts will appear here.</p>
              </div>
            ) : (
              notifications.map((item) => {
                const catMeta = CATEGORY_MAP[item.category] || CATEGORY_MAP.update;
                const Icon = catMeta.icon;

                return (
                  <div
                    key={item._id}
                    onClick={() => handleMarkRead(item._id, item.isRead)}
                    className={`flex items-start gap-3 p-4 transition-all cursor-pointer group relative ${
                      item.isRead
                        ? 'bg-[#0c0c17]/95 opacity-80 hover:opacity-100 hover:bg-[#121226]'
                        : 'bg-[#14142a] hover:bg-[#1a1a36]'
                    }`}
                  >
                    {/* Unread indicator dot */}
                    {!item.isRead && (
                      <span className="absolute left-1.5 top-5 w-1.5 h-1.5 rounded-full bg-brand-400 shadow-glow" />
                    )}

                    {/* Category Icon */}
                    <div
                      className={`p-2 rounded-xl ${catMeta.bg} border ${catMeta.border} shrink-0 mt-0.5`}
                      style={{ color: catMeta.color }}
                    >
                      <Icon size={14} />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`text-[9.5px] font-mono font-extrabold uppercase px-1.5 py-0.2 rounded border ${catMeta.bg} ${catMeta.border} truncate`}
                          style={{ color: catMeta.color }}
                        >
                          {item.label || catMeta.defaultLabel}
                        </span>

                        <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1 shrink-0">
                          <Clock size={10} />
                          {formatTimeAgo(item.createdAt)}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-white leading-snug">
                        {item.title}
                      </h4>

                      <p className="text-[11.5px] text-slate-300 font-sans leading-relaxed">
                        {item.message}
                      </p>

                      {item.link && (
                        <div className="pt-1">
                          <a
                            href={item.link}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-[11px] text-brand-400 hover:text-brand-300 hover:underline font-mono font-bold"
                          >
                            <span>Open Directive Link</span>
                            <ExternalLink size={10} />
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Dismiss Button (x) -> Dismisses for this candidate ONLY */}
                    <button
                      type="button"
                      onClick={(e) => handleDismiss(e, item._id)}
                      className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer shrink-0 mt-0.5"
                      title="Dismiss for me"
                      aria-label="Dismiss notification"
                    >
                      <X size={13} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
