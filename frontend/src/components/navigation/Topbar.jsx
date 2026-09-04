import { Menu, ChevronRight, Sparkles, Crown } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useProStore } from '@/store/proStore';
import { useLocation, Link } from 'react-router-dom';
import ThemeToggle from '@/components/common/ThemeToggle';
import ShinobiAvatar from '@/components/common/ShinobiAvatar';
import UserNotificationDropdown from './UserNotificationDropdown';

const PAGE_META = {
  '/dashboard': { title: 'Dojo Command Hub', category: 'DOJO' },
  '/interviews': { title: 'Combat Missions', category: 'INTERVIEWS' },
  '/interviews/new': { title: 'New Simulation Arena', category: 'AI STUDIO' },
  '/sessions': { title: 'Session Logs & Scores', category: 'HISTORY' },
  '/resumes': { title: 'ATS Resume Scanner', category: 'RESUMES' },
  '/resume-builder': { title: 'Overleaf ATS Resume Studio', category: 'RESUME FORGE' },
  '/portfolio-builder': { title: 'Developer Portfolio Forge', category: 'PORTFOLIO' },
  '/jobs': { title: 'Live Job Market', category: 'JOBS' },
  '/jobs/recommended': { title: 'AI Smart Matches', category: 'MATCHES' },
  '/pro-suite': { title: 'Pro AI Career Suite', category: 'PRO' },
  '/pricing': { title: 'Membership & Upgrades', category: 'PRO' },
  '/profile': { title: 'Warrior Profile & Settings', category: 'PROFILE' },
};

export default function Topbar({ onMenuClick }) {
  const { user } = useAuthStore();
  const { isPro } = useProStore();
  const { pathname } = useLocation();

  const meta = pathname.includes('/session')
    ? { title: 'Active Simulation Arena', category: 'ARENA' }
    : pathname.includes('/results')
    ? { title: 'Evaluation Telemetry & Score', category: 'RESULTS' }
    : PAGE_META[pathname] || { title: 'Dojo Workspace', category: 'DOJO' };

  return (
    <header className="h-14 bg-surface/90 backdrop-blur-2xl border-b border-subtle flex items-center justify-between px-3 sm:px-6 flex-shrink-0 z-20 shadow-sm relative">
      {/* ── Left Title & Category (Compact, Single-Line, Never Cut Off) ─ */}
      <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open Navigation"
          className="p-1.5 rounded-lg text-secondary hover:text-white hover:bg-surface border border-subtle lg:hidden transition-colors cursor-pointer shrink-0"
        >
          <Menu className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-secondary font-mono font-bold uppercase tracking-wider text-[9px] px-2 py-0.5 rounded-md bg-surface border border-subtle hidden sm:inline whitespace-nowrap shrink-0">
            {meta.category}
          </span>
          <ChevronRight className="w-3 h-3 text-secondary/50 hidden sm:inline shrink-0" />
          <h1 className="text-xs sm:text-sm font-display font-black text-white tracking-tight leading-none whitespace-nowrap shrink-0">
            {meta.title}
          </h1>
        </div>
      </div>

      {/* ── Right Actions: Super Compact, Symmetrical & Never Overflowing ── */}
      <div className="flex items-center gap-2 shrink-0 ml-auto">
        {/* Compact 5-LLM Engine Status Pill */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-400 font-bold whitespace-nowrap shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span>5-LLM</span>
        </div>

        {/* Compact Pro Badge or Upgrade CTA */}
        {isPro ? (
          <Link
            to="/pro-suite"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-500/20 border border-brand-500/40 text-brand-300 hover:text-white text-[10.5px] font-mono font-bold shadow-xs transition-all whitespace-nowrap shrink-0"
          >
            <Crown className="w-3 h-3 text-brand-400 shrink-0" />
            <span>PRO</span>
          </Link>
        ) : (
          <Link
            to="/pricing"
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-brand-500 to-violet-600 text-white text-[10.5px] font-display font-bold shadow-xs hover:scale-102 transition-all whitespace-nowrap shrink-0"
          >
            <Sparkles className="w-3 h-3 shrink-0" />
            <span>Upgrade</span>
          </Link>
        )}

        {/* 5-Theme Switcher (Icon Only Mode for Zero Clutter) */}
        <ThemeToggle showName={false} />

        {/* Shinobi Directives & Notifications Drawer */}
        <UserNotificationDropdown />

        {/* User Profile Dossier Pill (Fully Contained Inside Topbar) */}
        <div className="flex items-center gap-2 pl-2 sm:pl-2.5 border-l border-subtle shrink-0">
          <Link
            to="/profile"
            className="flex items-center gap-2 group cursor-pointer shrink-0"
            title={`${user?.name || 'Warrior'} • Profile & Settings`}
          >
            <div className="relative shrink-0">
              <ShinobiAvatar user={user} size="sm" className="w-8 h-8 group-hover:scale-105 transition-transform" />
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border-2 border-surface shadow-xs" />
            </div>

            <div className="hidden 2xl:block text-left space-y-0.5 shrink-0">
              <span className="block text-xs font-bold text-white leading-tight truncate max-w-[85px] group-hover:text-brand-300 transition-colors whitespace-nowrap">
                {user?.name?.split(' ')[0] || 'Warrior'}
              </span>
              <span className="block text-[9.5px] font-mono text-secondary capitalize leading-tight whitespace-nowrap">
                {user?.role || 'Candidate'}
              </span>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
