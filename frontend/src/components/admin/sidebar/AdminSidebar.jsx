/**
 * components/admin/sidebar/AdminSidebar.jsx
 *
 * Shinobi Admin Navigation Sidebar.
 * Features:
 *  - Grouped tactical navigation (Main, AI Tools, Finance, System)
 *  - Collapsible icon-only mode with floating tooltips
 *  - Animated active state with Shinobi theme glow
 *  - Admin Dossier card with ShinobiAvatar and rank tier
 */

import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Briefcase, MessageSquare, FileText,
  Target, CreditCard, DollarSign, BarChart2, Settings,
  Shield, Crown, LogOut, RefreshCw, Terminal, BellRing,
} from 'lucide-react';
import { useAdminAuth } from '@/context';
import AssessynLogo from '@/components/common/AssessynLogo';
import ShinobiAvatar from '@/components/common/ShinobiAvatar';
import { KatanaIcon, ShurikenIcon } from '@/components/ui/ShinobiIcons';

// ─── Navigation Config ───────────────────────────────────────────
const NAV_GROUPS = [
  {
    label: 'Command',
    items: [
      { to: '/admin',            label: 'Dashboard',    icon: LayoutDashboard, end: true },
      { to: '/admin/users',      label: 'Users Matrix',  icon: Users,           permission: 'view:users' },
      { to: '/admin/jobs',       label: 'Jobs Board',    icon: Briefcase,       permission: 'view:jobs' },
      { to: '/admin/interviews', label: 'Interviews',    icon: MessageSquare,   permission: 'view:templates' },
      { to: '/admin/resumes',    label: 'ATS Resumes',   icon: FileText,        permission: 'view:users' },
    ],
  },
  {
    label: 'AI Dojo Engine',
    items: [
      { to: '/admin/ats',        label: 'ATS Scanner',   icon: Target,          permission: 'view:templates' },
      { to: '/admin/prompts',    label: 'Prompt Studio', icon: FileText,        permission: 'view:prompts' },
    ],
  },
  {
    label: 'Monetization',
    items: [
      { to: '/admin/subscription', label: 'Subscriptions', icon: CreditCard,     permission: 'view:settings' },
      { to: '/admin/payments',     label: 'Payments & Fees', icon: DollarSign,     permission: 'view:payments' },
    ],
  },
  {
    label: 'System Arena',
    items: [
      { to: '/admin/scraper',         label: 'Job Scraper',    icon: RefreshCw,  permission: 'view:scraper' },
      { to: '/admin/logs',            label: 'Audit Logs',     icon: Terminal,   permission: 'view:logs' },
      { to: '/admin/analytics',       label: 'Analytics',      icon: BarChart2,  permission: 'view:analytics' },
      { to: '/admin/notifications',   label: 'Broadcasts',     icon: BellRing,   permission: 'view:settings' },
      { to: '/admin/settings',        label: 'Settings',       icon: Settings,   permission: 'view:settings' },
    ],
  },
];

// ─── Single Nav Item ──────────────────────────────────────────────
function NavItem({ to, label, icon: Icon, end, collapsed, onClick }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        `relative flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-mono font-bold
         transition-all duration-200 group select-none
         ${collapsed ? 'justify-center px-2' : ''}
         ${isActive
           ? 'bg-brand-500/20 text-white border border-brand-500/35 shadow-sm'
           : 'text-secondary hover:text-white hover:bg-surface/80 border border-transparent'
         }`
      }
    >
      {({ isActive }) => (
        <>
          {/* Active left bar accent */}
          {isActive && (
            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-4 bg-[var(--accent-primary)] rounded-r-full shadow-glow" />
          )}
          <Icon
            size={16}
            className={`flex-shrink-0 transition-transform duration-200
              ${isActive ? 'text-brand-400 scale-105' : 'text-secondary group-hover:text-white group-hover:scale-110'}`}
          />
          {!collapsed && (
            <span className="truncate">{label}</span>
          )}
          {/* Tooltip on collapsed */}
          {collapsed && (
            <div className="
              absolute left-full ml-3 px-2.5 py-1 rounded-lg
              bg-surface border border-subtle text-white text-[11px] font-mono font-bold
              pointer-events-none opacity-0 group-hover:opacity-100
              transition-opacity duration-150 whitespace-nowrap z-50 shadow-xl
            ">
              {label}
            </div>
          )}
        </>
      )}
    </NavLink>
  );
}

// ─── Sidebar Component ────────────────────────────────────────────
export default function AdminSidebar({ collapsed, onNavClick }) {
  const { admin, isSuperAdmin, adminLogout, hasPermission } = useAdminAuth();

  const handleLogout = async () => {
    await adminLogout();
    window.location.href = '/admin/login';
  };

  return (
    <div className="flex flex-col h-full justify-between overflow-hidden">
      {/* ── Brand Header ───────────────────────────────────────── */}
      <header className={`p-4 border-b border-subtle flex items-center ${collapsed ? 'justify-center' : 'justify-between'} flex-shrink-0`}>
        <NavLink to="/admin" className="flex items-center gap-2 group cursor-pointer">
          <AssessynLogo className="w-8 h-8" showText={!collapsed} />
        </NavLink>
        {!collapsed && (
          <span className="px-2 py-0.5 rounded-md bg-brand-500/15 border border-brand-500/30 text-brand-300 text-[9px] font-mono font-black uppercase tracking-wider">
            ADMIN
          </span>
        )}
      </header>

      {/* ── Navigation List ────────────────────────────────────── */}
      <nav aria-label="Admin Navigation" className="flex-1 overflow-y-auto p-3 space-y-4 scrollbar-thin">
        {NAV_GROUPS.map((group) => {
          // Filter items based on permissions
          const visibleItems = group.items.filter(
            (item) => !item.permission || hasPermission(item.permission)
          );
          if (visibleItems.length === 0) return null;

          return (
            <section key={group.label} className="space-y-1">
              {!collapsed && (
                <h2 className="px-3 text-[10px] font-mono font-extrabold text-secondary uppercase tracking-widest">
                  {group.label}
                </h2>
              )}
              {collapsed && (
                <div className="w-6 h-[1px] bg-subtle mx-auto my-2" />
              )}
              <ul className="space-y-0.5">
                {visibleItems.map((item) => (
                  <li key={item.to}>
                    <NavItem
                      to={item.to}
                      label={item.label}
                      icon={item.icon}
                      end={item.end}
                      collapsed={collapsed}
                      onClick={onNavClick}
                    />
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </nav>

      {/* ── User Footer & Dossier Card ─────────────────────────── */}
      <footer className="p-3 border-t border-subtle bg-surface/50 space-y-2.5 flex-shrink-0">
        {!collapsed ? (
          <div className="flex items-center justify-between p-2 rounded-xl bg-surface border border-subtle">
            <div className="flex items-center gap-2.5 min-w-0">
              <ShinobiAvatar user={admin} size="sm" />
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate leading-tight font-display">{admin?.name || 'Admin'}</p>
                <p className="text-[10px] text-brand-400 truncate leading-tight font-mono font-black uppercase">
                  {isSuperAdmin ? 'SHADOW KAGE' : 'ANBU ADMIN'}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-secondary hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors cursor-pointer flex-shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleLogout}
            title="Sign Out"
            className="w-full flex items-center justify-center p-2 rounded-xl text-secondary hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        )}
      </footer>
    </div>
  );
}
