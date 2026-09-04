import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const DEFAULT_SHINOBI_SOUNDSCAPES = {
  shadow: {
    id: 'shadow',
    title: 'Kage 432Hz Theta Mist',
    subtitle: 'Deep meditative night wind & calming Solfeggio 432Hz frequencies',
    src: '/sounds/themes/shadow.wav',
    color: '#a855f7',
    themeName: 'Shadow Shinobi',
    element: 'Void & Shadow (影)',
    isCustom: false,
  },
  forest: {
    id: 'forest',
    title: 'Jade Bamboo Rain Zen',
    subtitle: 'Soothing bamboo grove rainfall & meditative Shakuhachi flute',
    src: '/sounds/themes/forest.wav',
    color: '#10b981',
    themeName: 'Forest Jade',
    element: 'Nature & Bamboo (木)',
    isCustom: false,
  },
  maple: {
    id: 'maple',
    title: 'Blood Maple Hearth Zen',
    subtitle: 'Gentle grounding heartbeat pulse & tranquil hearth embers',
    src: '/sounds/themes/maple.wav',
    color: '#f43f5e',
    themeName: 'Blood Maple',
    element: 'Fire & Steel (火)',
    isCustom: false,
  },
  sakura: {
    id: 'sakura',
    title: 'Night Sakura Mindful Koto',
    subtitle: 'Peaceful Japanese Koto harp & tranquil midnight breeze',
    src: '/sounds/themes/sakura.wav',
    color: '#ec4899',
    themeName: 'Night Sakura',
    element: 'Floral Harmony (花)',
    isCustom: false,
  },
  gold: {
    id: 'gold',
    title: 'Solar 528Hz Temple Bowl',
    subtitle: 'Imperial bronze singing bowl & harmonic 528Hz Solfeggio meditation',
    src: '/sounds/themes/gold.wav',
    color: '#f59e0b',
    themeName: 'Solar Blade',
    element: 'Solar Aura (金)',
    isCustom: false,
  },
};

// Backwards-compatible alias for existing imports
export const SHINOBI_SOUNDSCAPES = DEFAULT_SHINOBI_SOUNDSCAPES;

// Singleton Audio Engine for seamless crossfade and loop handling
class ShinobiAudioEngine {
  constructor() {
    this.audioA = null;
    this.audioB = null;
    this.activePlayer = 'A';
    this.currentThemeId = null;
    this.currentSrc = null;
    this.fadeInterval = null;
    this.isInitialized = false;
  }

  init() {
    if (this.isInitialized || typeof window === 'undefined') return;
    this.audioA = new Audio();
    this.audioB = new Audio();

    this.audioA.loop = true;
    this.audioB.loop = true;
    this.audioA.preload = 'auto';
    this.audioB.preload = 'auto';

    this.isInitialized = true;
  }

  getActive() {
    this.init();
    return this.activePlayer === 'A' ? this.audioA : this.audioB;
  }

  getInactive() {
    this.init();
    return this.activePlayer === 'A' ? this.audioB : this.audioA;
  }

  playTrack(track, volume, isMuted) {
    this.init();
    const targetVolume = isMuted ? 0 : volume;

    // If exact same track URL is already loaded
    if (this.currentSrc === track.src) {
      const active = this.getActive();
      active.volume = targetVolume;
      if (!isMuted && active.paused) {
        active.play().catch(() => {});
      } else if (isMuted && !active.paused) {
        active.pause();
      }
      return;
    }

    const currentActive = this.getActive();
    const nextPlayer = this.getInactive();

    // Prepare next track
    nextPlayer.src = track.src;
    nextPlayer.volume = 0;

    if (!isMuted) {
      nextPlayer.play().then(() => {
        this.crossfade(currentActive, nextPlayer, targetVolume);
      }).catch((err) => {
        console.log('🔇 [Shinobi Audio] Autoplay pending user gesture:', err.message);
      });
    } else {
      nextPlayer.volume = 0;
      currentActive.pause();
    }

    this.activePlayer = this.activePlayer === 'A' ? 'B' : 'A';
    this.currentThemeId = track.id;
    this.currentSrc = track.src;
  }

  crossfade(fromAudio, toAudio, targetVolume, duration = 400) {
    if (this.fadeInterval) clearInterval(this.fadeInterval);

    const steps = 15;
    const stepTime = duration / steps;
    const startFromVol = fromAudio.volume;
    let step = 0;

    this.fadeInterval = setInterval(() => {
      step++;
      const progress = step / steps;

      fromAudio.volume = Math.max(0, startFromVol * (1 - progress));
      toAudio.volume = Math.min(1, targetVolume * progress);

      if (step >= steps) {
        clearInterval(this.fadeInterval);
        fromAudio.pause();
        fromAudio.currentTime = 0;
        toAudio.volume = targetVolume;
      }
    }, stepTime);
  }

  setVolume(volume, isMuted) {
    this.init();
    const target = isMuted ? 0 : volume;
    if (this.audioA) this.audioA.volume = target;
    if (this.audioB) this.audioB.volume = target;
  }

  stop() {
    this.init();
    if (this.audioA) {
      this.audioA.pause();
      this.audioA.currentTime = 0;
    }
    if (this.audioB) {
      this.audioB.pause();
      this.audioB.currentTime = 0;
    }
  }
}

export const audioEngine = new ShinobiAudioEngine();

export const useSoundStore = create(
  persist(
    (set, get) => ({
      isMuted: true, // Start muted for respectful UX; 1 click enables ambiance across app
      volume: 0.55,
      isPlaying: false,
      customSounds: {}, // Stores custom sounds received from backend

      getEffectiveTrack: (themeId) => {
        const custom = get().customSounds?.[themeId];
        const def = DEFAULT_SHINOBI_SOUNDSCAPES[themeId] || DEFAULT_SHINOBI_SOUNDSCAPES.shadow;

        if (custom && custom.isCustom && custom.src) {
          return {
            ...def,
            src: custom.src,
            title: custom.title || def.title,
            subtitle: custom.subtitle || def.subtitle,
            isCustom: true,
            updatedAt: custom.updatedAt,
          };
        }
        return def;
      },

      toggleMute: (themeId = 'shadow') => {
        const nextMuted = !get().isMuted;
        set({ isMuted: nextMuted, isPlaying: !nextMuted });

        const track = get().getEffectiveTrack(themeId);
        audioEngine.setVolume(get().volume, nextMuted);
        audioEngine.playTrack(track, get().volume, nextMuted);
      },

      setVolume: (val, themeId = 'shadow') => {
        const clamped = Math.max(0, Math.min(1, val));
        set({ volume: clamped });
        audioEngine.setVolume(clamped, get().isMuted);
      },

      syncThemeAudio: (themeId) => {
        const { volume, isMuted } = get();
        const track = get().getEffectiveTrack(themeId);
        audioEngine.playTrack(track, volume, isMuted);
      },

      // Fetch dynamic custom sounds configured by Admin
      fetchThemeSounds: async (activeThemeId = 'shadow') => {
        try {
          const res = await fetch('/api/theme-sounds');
          if (!res.ok) return;
          const data = await res.json();
          if (data.success && data.sounds) {
            set({ customSounds: data.sounds });

            // If audio is currently playing, re-sync with potentially updated audio
            const state = get();
            if (!state.isMuted) {
              const effective = state.getEffectiveTrack(activeThemeId);
              audioEngine.playTrack(effective, state.volume, false);
            }
          }
        } catch (err) {
          // Gracefully fallback to default soundscapes on network or offline error
          console.debug('[SoundStore] Using built-in meditative loops:', err.message);
        }
      },
    }),
    {
      name: 'assessyn_sound_settings',
      partialize: (state) => ({
        isMuted: state.isMuted,
        volume: state.volume,
      }),
    }
  )
);
