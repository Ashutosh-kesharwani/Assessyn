import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Volume2,
  VolumeX,
  Sparkles,
  Sliders,
  Radio,
  Music,
  Check,
  ChevronUp,
  X
} from 'lucide-react';
import { useThemeStore } from '@/store/themeStore';
import { useSoundStore, SHINOBI_SOUNDSCAPES } from '@/store/soundStore';
import toast from 'react-hot-toast';

/**
 * =========================================================================
 * 🗡️ SHINOBI SOUND ORB // 忍音 (GLOBAL AMBIENT SOUNDSCAPE CONTROLLER)
 * =========================================================================
 * 
 * - Responsive floating widget visible globally across all routes:
 *   Landing, Login, Register, Dashboard, Profile, Dojo Arena.
 * - Synchronizes ambient audio seamlessly with each active Shinobi elemental theme:
 *     • Shadow Shinobi -> Kage Shadow Mist (Shamisen & Night Wind)
 *     • Forest Jade    -> Jade Bamboo Grove (Shakuhachi Flute & Rain)
 *     • Blood Maple    -> Blood Maple Taiko (War Taiko Drum & Katana Flame)
 *     • Night Sakura   -> Night Sakura Zen (Koto Harp & Midnight Breeze)
 *     • Solar Blade    -> Solar Temple Rin (Imperial Bell & Golden Gong)
 * - 100% legal, royalty-free 30s lossless audio loops with smooth crossfading.
 * =========================================================================
 */
export default function ShinobiSoundOrb() {
  const { theme } = useThemeStore();
  const { isMuted, volume, toggleMute, setVolume, syncThemeAudio, getEffectiveTrack, fetchThemeSounds } = useSoundStore();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const currentTrack = getEffectiveTrack ? getEffectiveTrack(theme) : (SHINOBI_SOUNDSCAPES[theme] || SHINOBI_SOUNDSCAPES.shadow);

  // Fetch dynamic custom sounds configured by Admin on startup
  useEffect(() => {
    if (fetchThemeSounds) {
      fetchThemeSounds(theme);
    }
  }, [theme, fetchThemeSounds]);

  // Sync track when elemental theme changes
  useEffect(() => {
    syncThemeAudio(theme);
  }, [theme, syncThemeAudio]);

  // Handle outside click for popup panel
  useEffect(() => {
    const handleOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const handleToggle = () => {
    toggleMute(theme);
    if (isMuted) {
      toast.success(`Shinobi Resonance awakened: ${currentTrack.title} 🗡️`, {
        icon: '🔊',
        duration: 2500,
      });
    } else {
      toast('Shinobi Resonance muted', { icon: '🔇', duration: 1500 });
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 flex items-center select-none"
      aria-label="Shinobi Global Ambient Audio"
    >
      {/* ── EXPANDABLE SOUND CONTROLLER PANEL ──────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="absolute bottom-16 right-0 w-72 sm:w-80 p-4 rounded-3xl bg-surface/95 backdrop-blur-2xl border border-brand-500/40 shadow-2xl space-y-3.5 z-50 overflow-hidden"
          >
            {/* Katana Edge Accent Line */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{
                background: `linear-gradient(90deg, transparent, ${currentTrack.color}, transparent)`,
              }}
            />

            {/* Panel Header */}
            <div className="flex items-center justify-between pb-2.5 border-b border-subtle">
              <div className="flex items-center gap-2">
                <span
                  className="w-2.5 h-2.5 rounded-full animate-pulse shadow-glow"
                  style={{ backgroundColor: currentTrack.color }}
                />
                <h4 className="text-xs font-display font-black text-white uppercase tracking-wider">
                  Shinobi Resonance // 忍音
                </h4>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-secondary hover:text-white hover:bg-surface-hover transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Current Track Info Card */}
            <div className="p-3 rounded-2xl bg-surface/80 border border-subtle space-y-1.5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span
                  className="text-[10px] font-mono font-extrabold uppercase px-2 py-0.5 rounded-md border"
                  style={{
                    color: currentTrack.color,
                    borderColor: `${currentTrack.color}40`,
                    backgroundColor: `${currentTrack.color}15`,
                  }}
                >
                  {currentTrack.element}
                </span>

                {/* Animated Equalizer Visualizer */}
                {!isMuted ? (
                  <div className="flex items-end gap-1 h-3.5 px-1">
                    {[0.8, 1.4, 0.6, 1.2, 0.9].map((dur, i) => (
                      <motion.span
                        key={i}
                        animate={{ height: ['20%', '100%', '35%', '90%', '20%'] }}
                        transition={{
                          duration: dur,
                          repeat: Infinity,
                          ease: 'easeInOut',
                        }}
                        className="w-1 rounded-full"
                        style={{ backgroundColor: currentTrack.color }}
                      />
                    ))}
                  </div>
                ) : (
                  <span className="text-[10px] font-mono text-secondary">MUTED</span>
                )}
              </div>

              <div className="text-xs font-bold text-white tracking-wide">
                {currentTrack.title}
              </div>
              <p className="text-[10.5px] font-mono text-secondary leading-snug">
                {currentTrack.subtitle}
              </p>
              <div className="text-[9.5px] font-mono text-secondary pt-0.5 opacity-75">
                30s Lossless Seamless Loop &bull; 100% Royalty-Free
              </div>
            </div>

            {/* Volume Slider Control */}
            <div className="space-y-1.5 pt-0.5">
              <div className="flex items-center justify-between text-[11px] font-mono font-bold">
                <span className="text-secondary">Master Volume</span>
                <span className="text-white">{Math.round(volume * 100)}%</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleToggle}
                  className="p-2 rounded-xl bg-surface hover:bg-surface-hover border border-subtle text-secondary hover:text-white transition-colors cursor-pointer"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4 text-rose-400" />
                  ) : (
                    <Volume2 className="w-4 h-4 text-emerald-400" />
                  )}
                </button>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value), theme)}
                  className="w-full h-1.5 rounded-lg appearance-none bg-surface cursor-pointer accent-brand-500 border border-subtle"
                />
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="pt-1">
              <button
                type="button"
                onClick={handleToggle}
                className="w-full py-2.5 rounded-xl font-mono text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all border"
                style={{
                  backgroundColor: isMuted ? `${currentTrack.color}15` : `${currentTrack.color}25`,
                  borderColor: `${currentTrack.color}50`,
                  color: isMuted ? '#fff' : currentTrack.color,
                }}
              >
                {isMuted ? (
                  <>
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Enable Shinobi Soundscape</span>
                  </>
                ) : (
                  <>
                    <VolumeX className="w-3.5 h-3.5" />
                    <span>Mute Ambient Sound</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── THE FLOATING SHINOBI SOUND ORB BUTTON ─────────────────────── */}
      <div className="relative group">
        {/* Pulsating Sonic Chakra Rings when playing */}
        {!isMuted && (
          <>
            <span
              className="absolute -inset-1.5 rounded-full opacity-60 animate-ping pointer-events-none"
              style={{ backgroundColor: `${currentTrack.color}30` }}
            />
            <span
              className="absolute -inset-1 rounded-full opacity-40 blur-xs pointer-events-none animate-pulse"
              style={{ backgroundColor: currentTrack.color }}
            />
          </>
        )}

        {/* The Main Circular Trigger */}
        <button
          type="button"
          onClick={handleToggle}
          onContextMenu={(e) => {
            e.preventDefault();
            setIsOpen((prev) => !prev);
          }}
          className={`relative flex items-center gap-2.5 p-2.5 sm:px-3 sm:py-2 rounded-full border backdrop-blur-xl transition-all duration-300 shadow-xl cursor-pointer ${
            isMuted
              ? 'bg-surface/85 border-subtle hover:border-slate-500 text-secondary hover:text-white'
              : 'bg-surface/95 text-white ring-1 shadow-lg'
          }`}
          style={{
            borderColor: isMuted ? undefined : `${currentTrack.color}70`,
            boxShadow: isMuted ? undefined : `0 0 20px ${currentTrack.color}30`,
          }}
          title={
            isMuted
              ? 'Shinobi Sound: Muted (Click to Enable Ambiance)'
              : `Shinobi Sound: ${currentTrack.title} (Click to Mute)`
          }
        >
          {/* Custom Shinobi Sonic Waves SVG Icon */}
          <div className="relative flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 transition-transform group-hover:scale-110"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: isMuted ? '#94a3b8' : currentTrack.color }}
            >
              {/* Central Biwa / Bell Node */}
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" fillOpacity={isMuted ? "0.1" : "0.3"} />

              {/* Soundwaves if active, slash if muted */}
              {!isMuted ? (
                <>
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </>
              ) : (
                <>
                  {/* Katana Slash Cutline */}
                  <line x1="23" y1="1" x2="1" y2="23" stroke="#f43f5e" strokeWidth="2.2" />
                </>
              )}
            </svg>
          </div>

          {/* Equalizer Wave Bars (Desktop) */}
          <div className="hidden sm:flex items-center gap-1">
            <span className="text-[11px] font-mono font-bold tracking-tight">
              {isMuted ? 'SOUND' : currentTrack.element.split(' ')[0]}
            </span>

            {!isMuted ? (
              <div className="flex items-end gap-0.5 h-3 ml-1">
                <span className="w-0.5 h-full rounded-full animate-pulse" style={{ backgroundColor: currentTrack.color }} />
                <span className="w-0.5 h-2 rounded-full animate-bounce" style={{ backgroundColor: currentTrack.color }} />
                <span className="w-0.5 h-3 rounded-full animate-pulse" style={{ backgroundColor: currentTrack.color }} />
              </div>
            ) : (
              <span className="text-[9.5px] font-mono text-secondary ml-0.5">OFF</span>
            )}
          </div>

          {/* Settings Panel Toggle Trigger Arrow */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen((prev) => !prev);
            }}
            className="p-1 rounded-full hover:bg-slate-800/80 transition-colors text-secondary hover:text-white"
            title="Adjust Shinobi Sound Settings"
          >
            <ChevronUp
              className={`w-3.5 h-3.5 transition-transform duration-200 ${
                isOpen ? 'rotate-180 text-brand-400' : ''
              }`}
            />
          </div>
        </button>
      </div>
    </div>
  );
}
