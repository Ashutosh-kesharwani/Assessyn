import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx } from 'clsx';
import {
  ClipboardList, FileText, History, User, LogOut, X, Briefcase, Sparkles,
  ShieldCheck, ChevronRight, Zap, Crown, CreditCard, Cpu, Globe
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useProStore } from '@/store/proStore';
import AssessynLogo from '@/components/common/AssessynLogo';
import { DojoIcon, KatanaIcon, ShurikenIcon, KunaiIcon } from '@/components/ui/ShinobiIcons';
import toast from 'react-hot-toast';

const NAV_GROUPS = [
  {
    title: '// 01 DOJO COMMAND',
    items: [
      { to: '/dashboard', icon: DojoIcon, label: 'Dojo Command Hub' },
      { to: '/interviews', icon: ClipboardList, label: 'Combat Missions' },
      { to: '/interviews/new', icon: KatanaIcon, label: 'New Mock Session', isHot: true },
      { to: '/sessions', icon: History, label: 'Session History & Logs' },
    ],
  },
  {
    title: '// 02 PRO NINJA SUITE',
    items: [
      { to: '/pro-suite', icon: Crown, label: 'Pro Career Suite', isPro: true, isHot: true },
      { to: '/resume-builder', icon: FileText, label: '10 ATS Resume Forge', isPro: true, isNew: true },
      { to: '/portfolio-builder', icon: Globe, label: '10 Portfolio Forge', isPro: true, isNew: true },
      { to: '/pricing', icon: CreditCard, label: 'Membership Plans (From ₹50)' },
    ],
  },
  {
    title: '// 03 COMBAT INTEL',
    items: [
      { to: '/jobs/recommended', icon: ShurikenIcon, label: 'Smart Matches', isNew: true },
      { to: '/jobs', icon: Briefcase, label: 'Live Job Board' },
      { to: '/resumes', icon: FileText, label: 'Resumes & ATS Scanner' },
    ],
  },
  {
    title: '// 04 WARRIOR DOSSIER',
    items: [
      { to: '/profile', icon: User, label: 'Profile & Settings' },
    ],
  },
];

export default function Sidebar({ isOpen, onClose }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Signed out successfully');
    navigate('/login');
  };

  return (
    <>
      {/* ── Desktop Sidebar ─────────────────────────────────────── */}
      <aside
        aria-label="Main Navigation"
        className="hidden lg:flex flex-col w-68 bg-surface border-r border-subtle z-30 select-none flex-shrink-0 relative"
      >
        <SidebarContent user={user} onLogout={handleLogout} />
      </aside>

      {/* ── Mobile Drawer ───────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/75 backdrop-blur-md z-40 lg:hidden"
            />

            {/* Slide-in Drawer */}
            <motion.aside
              aria-label="Mobile Navigation"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed left-0 top-0 z-50 h-full w-80 bg-surface border-r border-subtle flex flex-col lg:hidden shadow-2xl backdrop-blur-3xl"
            >
              <div className="absolute top-5 right-5 z-10">
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close Navigation"
                  className="p-2.5 rounded-xl text-secondary hover:text-white hover:bg-surface border border-subtle transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <SidebarContent user={user} onLogout={handleLogout} onNavClick={onClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function SidebarContent({ user, onLogout, onNavClick }) {
  return (
    <div className="flex flex-col h-full justify-between">
      {/* ── Top Header & Navigation ─────────────────────────────── */}
      <div className="flex flex-col min-h-0">
        {/* Generous Padding Brand Header */}
        <header className="px-6 py-6 border-b border-subtle flex items-center bg-surface relative">
          <NavLink
            to="/"
            onClick={() => {
              if (onNavClick) onNavClick();
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center cursor-pointer group"
          >
            <AssessynLogo className="w-10 h-10" showText={true} />
          </NavLink>
        </header>

        {/* ── Navigation Sections ───────────────────────────────── */}
        <nav className="px-4 py-5 space-y-6 overflow-y-auto max-h-[calc(100vh-240px)]">
          {NAV_GROUPS.map((group) => (
            <div key={group.title} className="space-y-1.5">
              <div className="px-3 text-[9.5px] font-mono font-extrabold uppercase tracking-[0.18em] text-slate-400 mb-2">
                {group.title}
              </div>

              <ul className="space-y-1">
                {group.items.map(({ to, icon: Icon, label, isHot, isNew }) => (
                  <li key={to}>
                    <NavLink
                      to={to}
                      onClick={onNavClick}
                      end={to === '/dashboard'}
                      className={({ isActive }) =>
                        clsx(
                          'relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 group',
                          isActive
                            ? 'bg-brand-500/15 text-white border border-brand-500/40'
                            : 'text-secondary hover:text-white hover:bg-surface border border-transparent'
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon
                            className={clsx(
                              'w-5 h-5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110',
                              isActive ? 'text-brand-400' : 'text-secondary group-hover:text-white'
                            )}
                          />

                          <span className="flex-1 truncate tracking-tight">{label}</span>

                          {isHot && (
                            <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-brand-500/25 text-brand-300 border border-brand-500/40 uppercase tracking-tight">
                              AI
                            </span>
                          )}

                          {isNew && (
                            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                          )}
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* ── Sidebar Footer (Pro Banner & Sign Out Action) ──── */}
      <footer className="p-4 border-t border-subtle bg-surface space-y-3">
        {/* Pro Status / Upgrade Mini Card */}
        <NavLink
          to="/pricing"
          onClick={onNavClick}
          className="block p-3 rounded-2xl bg-gradient-to-br from-brand-500/15 via-violet-500/10 to-transparent border border-brand-500/30 hover:border-brand-500/60 transition-all cursor-pointer group shadow-sm"
        >
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9.5px] font-mono font-black uppercase text-brand-300 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-brand-400" />
              <span>PRO NINJA // ₹299/MO</span>
            </span>
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-brand-500/30 text-brand-200">
              Central AI
            </span>
          </div>
          <p className="text-[11px] font-mono text-secondary group-hover:text-white transition-colors">
            AI Resume & Unlimited Mock Missions
          </p>
        </NavLink>

        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold text-secondary hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all cursor-pointer group"
        >
          <LogOut className="w-4 h-4 text-secondary group-hover:text-rose-400 transition-colors" />
          <span className="tracking-tight">Sign Out</span>
        </button>
      </footer>
    </div>
  );
}
