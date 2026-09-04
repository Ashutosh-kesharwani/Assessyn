import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Terminal, Target, FileText, Sparkles, HelpCircle,
  Menu, X, Globe, Sword, LogOut, ArrowRight
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import toast from 'react-hot-toast';
import ThemeToggle from '@/components/common/ThemeToggle';
import Button from '@/components/ui/Button';
import AssessynLogo from '@/components/common/AssessynLogo';
import { ShurikenIcon, DojoIcon } from '@/components/ui/ShinobiIcons';

export default function LandingNavbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogoClick = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    logout();
    toast.success('Signed out successfully');
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="fixed top-0 w-full z-50 py-3 px-3 sm:px-6">
      <div className="max-w-7xl mx-auto h-16 sm:h-18 bg-glass backdrop-blur-2xl border border-subtle rounded-2xl px-3.5 sm:px-6 flex items-center justify-between shadow-2xl transition-all relative">
        {/* Subtle Katana Edge Highlight */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-400/40 to-transparent pointer-events-none rounded-t-2xl" />

        {/* Brand Logo & Logotype */}
        <Link to="/" onClick={handleLogoClick} className="flex items-center cursor-pointer shrink-0">
          <AssessynLogo className="w-8 h-8 sm:w-9 sm:h-9" />
        </Link>

        {/* Center Navlinks (Visible on lg+ screens, strictly single line) */}
        <nav className="hidden lg:flex items-center gap-0.5 sm:gap-1 p-1 rounded-full bg-surface/80 border border-subtle backdrop-blur-md shadow-inner shrink-0">
          {/* Main Purpose of Application: AI Interview */}
          {isAuthenticated ? (
            <Link
              to="/interviews/new"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11.5px] font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all group whitespace-nowrap"
            >
              <Sword className="w-3.5 h-3.5 text-emerald-400 transition-transform group-hover:rotate-12" />
              <span>AI Interview</span>
            </Link>
          ) : (
            <a
              href="#simulator"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11.5px] font-bold text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all group whitespace-nowrap"
            >
              <Sword className="w-3.5 h-3.5 text-emerald-400 transition-transform group-hover:rotate-12" />
              <span>AI Interview</span>
            </a>
          )}

          <a
            href="#features"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11.5px] font-semibold text-secondary hover:text-white hover:bg-surface-hover transition-all group whitespace-nowrap"
          >
            <Target className="w-3.5 h-3.5 text-brand-400 transition-transform group-hover:scale-110" />
            <span>Capabilities</span>
          </a>

          <Link
            to="/resume-builder"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11.5px] font-semibold text-secondary hover:text-white hover:bg-surface-hover transition-all group whitespace-nowrap"
          >
            <FileText className="w-3.5 h-3.5 text-cyan-400" />
            <span>Resume Studio</span>
          </Link>

          <Link
            to="/pricing"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11.5px] font-semibold text-brand-300 hover:text-white hover:bg-surface-hover transition-all group whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            <span>Plans (₹50)</span>
          </Link>

          <a
            href="#faqs"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11.5px] font-semibold text-secondary hover:text-white hover:bg-surface-hover transition-all group whitespace-nowrap"
          >
            <HelpCircle className="w-3.5 h-3.5 text-amber-400 transition-transform group-hover:scale-110" />
            <span>FAQ</span>
          </a>
        </nav>

        {/* Right Actions: Identical 2-Button Symmetrical Layout in Both States */}
        <div className="hidden lg:flex items-center gap-2.5 shrink-0">
          <ThemeToggle />

          {isAuthenticated ? (
            /* Signed In: [ThemeToggle] [Sign Out] [Enter Dojo] */
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="px-3.5 text-xs font-mono font-bold text-secondary hover:text-rose-400 hover:bg-rose-500/10 cursor-pointer"
              >
                Sign Out
              </Button>

              <Link to="/dashboard">
                <Button variant="primary" size="sm" icon={DojoIcon} className="px-3.5 font-bold shadow-lg shadow-brand-500/25">
                  <span>Enter Dojo</span>
                </Button>
              </Link>
            </div>
          ) : (
            /* Signed Out: [ThemeToggle] [Sign In] [Enter Dojo] */
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="px-3.5 text-xs font-mono font-bold cursor-pointer">
                  Sign In
                </Button>
              </Link>

              <Link to="/register">
                <Button variant="primary" size="sm" icon={ShurikenIcon} className="px-3.5 font-bold shadow-lg shadow-brand-500/25">
                  <span>Enter Dojo</span>
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile & Tablet Actions (< lg): Theme + Menu Toggle */}
        <div className="flex lg:hidden items-center gap-2 shrink-0">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-xl bg-surface border border-subtle text-secondary hover:text-white transition-colors cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile & Tablet Animated Drawer Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="max-w-7xl mx-auto mt-2 p-5 bg-surface/95 backdrop-blur-2xl border border-subtle rounded-2xl shadow-2xl space-y-4 lg:hidden"
          >
            <nav className="flex flex-col space-y-1">
              {/* Primary feature: AI Interview */}
              {isAuthenticated ? (
                <Link
                  to="/interviews/new"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl text-sm font-bold text-emerald-400 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Sword className="w-4 h-4 text-emerald-400" />
                    <span>AI Interview Arena</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Live
                  </span>
                </Link>
              ) : (
                <a
                  href="#simulator"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between p-3 rounded-xl text-sm font-bold text-emerald-400 hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Sword className="w-4 h-4 text-emerald-400" />
                    <span>AI Interview Arena</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Demo
                  </span>
                </a>
              )}

              <a
                href="#features"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl text-sm font-bold text-secondary hover:text-white hover:bg-white/5 transition-colors"
              >
                <Target className="w-4 h-4 text-brand-400" />
                <span>Capabilities</span>
              </a>

              <Link
                to="/resume-builder"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl text-sm font-bold text-secondary hover:text-white hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-4 h-4 text-cyan-400" />
                  <span>Resume Studio</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  ATS Spec
                </span>
              </Link>

              <Link
                to="/portfolio-builder"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl text-sm font-bold text-secondary hover:text-white hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Globe className="w-4 h-4 text-indigo-400" />
                  <span>Portfolio Forge</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Soon
                </span>
              </Link>

              <Link
                to="/pricing"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between p-3 rounded-xl text-sm font-bold text-brand-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-4 h-4 text-brand-400" />
                  <span>Plans & Pricing</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-brand-500/20 text-brand-300 border border-brand-500/30">
                  From ₹50
                </span>
              </Link>

              <a
                href="#faqs"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-3 p-3 rounded-xl text-sm font-bold text-secondary hover:text-white hover:bg-white/5 transition-colors"
              >
                <HelpCircle className="w-4 h-4 text-amber-400" />
                <span>FAQ</span>
              </a>
            </nav>

            {/* Bottom 2-Button Grid (Symmetrical in Both Auth States) */}
            <div className="pt-3 border-t border-subtle">
              {isAuthenticated ? (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full py-2.5 rounded-xl border border-subtle text-xs font-mono font-bold text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    Sign Out
                  </button>
                  <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="primary" size="md" icon={DojoIcon} className="w-full">
                      <span>Enter Dojo</span>
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="secondary" size="md" className="w-full">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="primary" size="md" icon={ShurikenIcon} className="w-full">
                      <span>Enter Dojo</span>
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
