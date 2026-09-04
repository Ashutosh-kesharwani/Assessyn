import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Moon, Sun, Sparkles, ChevronDown, Leaf, Flame, Flower2, Award, Volume2, VolumeX
} from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';
import { useSoundStore } from '@/store/soundStore';

export const THEMES = [
  {
    id: 'shadow',
    name: 'Shadow Shinobi',
    icon: Moon,
    desc: 'Obsidian black & cyber violet',
    color: '#a855f7',
  },
  {
    id: 'forest',
    name: 'Forest Jade',
    icon: Leaf,
    desc: 'Deep bamboo & emerald green',
    color: '#10b981',
  },
  {
    id: 'maple',
    name: 'Blood Maple',
    icon: Flame,
    desc: 'Charcoal & katana crimson',
    color: '#f43f5e',
  },
  {
    id: 'sakura',
    name: 'Night Sakura',
    icon: Flower2,
    desc: 'Midnight plum & neon rose',
    color: '#ec4899',
  },
  {
    id: 'gold',
    name: 'Solar Blade',
    icon: Award,
    desc: 'Molten onyx & imperial gold',
    color: '#f59e0b',
  },
];

export default function ThemeToggle({ className = '', showName = false }) {
  const { theme, setTheme } = useThemeStore();
  const { isMuted, toggleMute } = useSoundStore();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentTheme = THEMES.find((t) => t.id === theme) || THEMES[0];
  const CurrentIcon = currentTheme.icon;

  return (
    <div className={`relative shrink-0 ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center justify-center gap-1.5 ${showName ? 'px-2.5 sm:px-3 py-1.5' : 'w-9 h-9'} rounded-xl bg-surface border border-subtle
                    hover:border-brand-500/50 text-xs font-mono text-white transition-all cursor-pointer shadow-xs shrink-0 ${className}`}
        title="Switch Shinobi Elemental Theme"
      >
        <CurrentIcon className="w-4 h-4 shrink-0" style={{ color: currentTheme.color }} />
        {showName && <span className="hidden xl:inline font-semibold whitespace-nowrap">{currentTheme.name}</span>}
        {showName && <ChevronDown className={`w-3.5 h-3.5 text-secondary transition-transform duration-200 ${isOpen ? 'rotate-180 text-brand-400' : ''}`} />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute right-0 mt-2 w-64 p-2 rounded-2xl bg-surface border border-subtle
                       shadow-2xl z-[100] backdrop-blur-3xl"
          >
            <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-secondary border-b border-subtle mb-1 flex items-center justify-between">
              <span>Shinobi Palettes</span>
              <Sparkles className="w-3.5 h-3.5 text-brand-400" />
            </div>

            <div className="space-y-1">
              {THEMES.map((t) => {
                const Icon = t.icon;
                const isSelected = t.id === theme;

                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setTheme(t.id);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-start gap-3 p-2.5 rounded-xl text-left transition-all duration-150 cursor-pointer ${
                      isSelected
                        ? 'bg-brand-500/20 border border-brand-500/50 text-white'
                        : 'hover:bg-surface-hover text-slate-300 hover:text-white border border-transparent'
                    }`}
                  >
                    <div
                      className="p-1.5 rounded-lg mt-0.5 flex-shrink-0"
                      style={{ backgroundColor: `${t.color}25`, color: t.color }}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold flex items-center justify-between">
                        <span>{t.name}</span>
                        {isSelected && (
                          <span className="w-2 h-2 rounded-full bg-brand-400 shadow-sm" />
                        )}
                      </div>
                      <div className="text-[11px] text-secondary leading-tight mt-0.5 truncate font-normal">
                        {t.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Shinobi Resonance Audio Toggle */}
            <div className="pt-2 mt-1.5 border-t border-subtle flex items-center justify-between px-2.5 py-1">
              <div className="flex items-center gap-1.5 text-secondary">
                {isMuted ? (
                  <VolumeX className="w-3.5 h-3.5 text-secondary" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span className="text-[10px] font-mono font-bold uppercase">Shinobi Sound</span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleMute(theme);
                }}
                className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold cursor-pointer transition-colors border ${
                  !isMuted
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-surface hover:bg-slate-800 text-secondary border-subtle'
                }`}
              >
                {!isMuted ? 'PLAYING' : 'MUTED'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
