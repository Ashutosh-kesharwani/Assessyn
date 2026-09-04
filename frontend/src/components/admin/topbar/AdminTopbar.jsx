/**
 * components/admin/topbar/AdminTopbar.jsx
 *
 * Shinobi Admin Top Navigation Bar.
 * Composed of:
 *  - Left: Mobile hamburger menu + Breadcrumb trail
 *  - Right: AI Cluster Active status + Shinobi ThemeToggle + NotificationDropdown + UserMenu
 */

import { Menu, Activity } from 'lucide-react';
import Breadcrumb from './Breadcrumb';
import NotificationDropdown from './NotificationDropdown';
import UserMenu from './UserMenu';
import ThemeToggle from '@/components/common/ThemeToggle';

export default function AdminTopbar({ onMenuClick }) {
  return (
    <header className="
      flex items-center justify-between
      px-4 sm:px-6 h-16 flex-shrink-0
      bg-surface/90 backdrop-blur-xl
      border-b border-subtle relative z-20
    ">
      {/* ── Left section ──────────────────────────────────────── */}
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile hamburger */}
        <button
          id="admin-mobile-menu-btn"
          onClick={onMenuClick}
          className="lg:hidden w-8 h-8 rounded-xl bg-surface border border-subtle
                     flex items-center justify-center text-secondary
                     hover:text-white hover:border-brand-500/40 transition-all cursor-pointer"
          aria-label="Open sidebar"
        >
          <Menu size={16} />
        </button>

        {/* Dynamic Breadcrumbs */}
        <Breadcrumb />
      </div>

      {/* ── Right section ─────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        {/* Active AI Cluster Pulse */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-surface border border-subtle text-[10px] font-mono font-bold text-secondary">
          <Activity className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span className="text-white">COMMAND ONLINE</span>
        </div>

        {/* Universal Shinobi Theme Selector */}
        <ThemeToggle />

        {/* Notification bell */}
        <NotificationDropdown />

        {/* Admin User Profile menu */}
        <UserMenu />
      </div>
    </header>
  );
}
