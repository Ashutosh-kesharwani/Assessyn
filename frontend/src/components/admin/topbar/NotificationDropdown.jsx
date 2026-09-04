/**
 * components/admin/topbar/NotificationDropdown.jsx
 *
 * Shinobi Tactical Notification drawer.
 */

import { useState, useRef, useEffect } from 'react';
import { Bell, Users, Briefcase, AlertCircle, CheckCheck, X } from 'lucide-react';
import { ShurikenIcon, KatanaIcon } from '@/components/ui/ShinobiIcons';

const DEMO_NOTIFICATIONS = [
  {
    id: 1,
    type: 'user',
    icon: Users,
    iconColor: 'text-brand-400',
    iconBg: 'bg-brand-500/10',
    title: 'Candidate Registered',
    message: 'New candidate initialized dossier credentials',
    time: '2 min ago',
    read: false,
  },
  {
    id: 2,
    type: 'interview',
    icon: KatanaIcon,
    iconColor: 'text-rose-400',
    iconBg: 'bg-rose-500/10',
    title: 'Simulation Complete',
    message: 'Mock interview completed with 94% score',
    time: '15 min ago',
    read: false,
  },
  {
    id: 3,
    type: 'alert',
    icon: ShurikenIcon,
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/10',
    title: 'AI Scraper Active',
    message: 'Automated job scanner scraped new opportunities',
    time: '1 hr ago',
    read: true,
  },
];

export default function NotificationDropdown() {
  const [open, setOpen]            = useState(false);
  const [notifications, setNotifs] = useState(DEMO_NOTIFICATIONS);
  const dropdownRef                = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = () => {
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const dismiss = (id) => {
    setNotifs((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        id="admin-notifications-btn"
        onClick={() => setOpen(!open)}
        className="relative w-8 h-8 rounded-xl bg-surface border border-subtle
                   flex items-center justify-center text-secondary
                   hover:text-white hover:border-brand-500/40
                   transition-all duration-200 cursor-pointer"
        aria-label="Notifications"
      >
        <Bell size={15} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full
                           bg-[var(--accent-primary)] text-white text-[8.5px] font-mono font-bold
                           flex items-center justify-center shadow-glow">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="
          absolute right-0 top-full mt-2.5 w-84 sm:w-96
          bg-[#0c0c17] border border-white/15 rounded-2xl shadow-[0_25px_70px_rgba(0,0,0,0.95)]
          overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-150
        ">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#111122] border-b border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-white font-mono font-bold text-xs uppercase tracking-wider">System Alerts</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-brand-500/25 border border-brand-500/40 text-brand-300 text-[10px] font-mono font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="flex items-center gap-1 text-[10.5px] font-mono text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <CheckCheck size={12} />
                <span>Mark read</span>
              </button>
            )}
          </div>

          {/* Notification items */}
          <div className="max-h-80 overflow-y-auto divide-y divide-white/10 scrollbar-thin bg-[#0c0c17]">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs font-mono">
                No active system alerts.
              </div>
            ) : (
              notifications.map((n) => {
                const Icon = n.icon;
                return (
                  <div
                    key={n.id}
                    className={`flex items-start gap-3 px-4 py-3.5 transition-colors ${
                      n.read ? 'bg-[#0c0c17]/95 hover:bg-[#121226]' : 'bg-[#131327] hover:bg-[#191934]'
                    }`}
                  >
                    <div className={`p-2 rounded-xl ${n.iconBg} ${n.iconColor} flex-shrink-0 mt-0.5 border border-white/5`}>
                      <Icon size={14} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-white text-xs font-bold font-mono truncate">{n.title}</p>
                        <span className="text-[9.5px] text-secondary font-mono whitespace-nowrap">{n.time}</span>
                      </div>
                      <p className="text-secondary text-[11px] font-sans mt-0.5 leading-snug">{n.message}</p>
                    </div>

                    <button
                      onClick={() => dismiss(n.id)}
                      className="text-secondary hover:text-white transition-colors cursor-pointer p-0.5"
                    >
                      <X size={12} />
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
