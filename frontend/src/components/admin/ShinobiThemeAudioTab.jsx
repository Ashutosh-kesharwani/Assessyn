import { useState, useRef, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  UploadCloud,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Music,
  FileAudio,
  AlertCircle,
  ExternalLink,
  Loader2,
  Save,
  Radio
} from 'lucide-react';
import { uploadThemeSound, resetThemeSound } from '@/services/admin.service';
import { useSoundStore, DEFAULT_SHINOBI_SOUNDSCAPES } from '@/store/soundStore';
import toast from 'react-hot-toast';

const THEME_ITEMS = [
  {
    id: 'shadow',
    name: 'Shadow Shinobi',
    kanji: '影',
    desc: 'Obsidian black & cyber violet',
    color: '#a855f7',
    defaultMeta: DEFAULT_SHINOBI_SOUNDSCAPES.shadow,
  },
  {
    id: 'forest',
    name: 'Forest Jade',
    kanji: '木',
    desc: 'Deep bamboo & emerald green',
    color: '#10b981',
    defaultMeta: DEFAULT_SHINOBI_SOUNDSCAPES.forest,
  },
  {
    id: 'maple',
    name: 'Blood Maple',
    kanji: '火',
    desc: 'Charcoal & katana crimson',
    color: '#f43f5e',
    defaultMeta: DEFAULT_SHINOBI_SOUNDSCAPES.maple,
  },
  {
    id: 'sakura',
    name: 'Night Sakura',
    kanji: '花',
    desc: 'Midnight plum & neon rose',
    color: '#ec4899',
    defaultMeta: DEFAULT_SHINOBI_SOUNDSCAPES.sakura,
  },
  {
    id: 'gold',
    name: 'Solar Blade',
    kanji: '金',
    desc: 'Molten onyx & imperial gold',
    color: '#f59e0b',
    defaultMeta: DEFAULT_SHINOBI_SOUNDSCAPES.gold,
  },
];

export default function ShinobiThemeAudioTab({ themeSounds = {}, onRefreshSettings }) {
  const { fetchThemeSounds } = useSoundStore();

  // Local state for each theme form
  const [formData, setFormData] = useState({});
  const [selectedFiles, setSelectedFiles] = useState({});
  const [uploadingTheme, setUploadingTheme] = useState(null);
  const [resettingTheme, setResettingTheme] = useState(null);

  // In-admin audio preview player state
  const [playingTheme, setPlayingTheme] = useState(null);
  const audioPreviewRef = useRef(null);

  // Initialize form state from incoming settings
  useEffect(() => {
    const initial = {};
    THEME_ITEMS.forEach((t) => {
      const cfg = themeSounds[t.id] || {};
      initial[t.id] = {
        customUrl: cfg.customUrl || '',
        customTitle: cfg.customTitle || '',
        customSubtitle: cfg.customSubtitle || '',
        isCustom: cfg.isCustom || false,
      };
    });
    setFormData(initial);
  }, [themeSounds]);

  // Audio preview playback handler
  const handleTogglePreview = (themeId) => {
    const themeMeta = THEME_ITEMS.find((t) => t.id === themeId);
    const custom = formData[themeId];
    const src = custom?.isCustom && custom?.customUrl ? custom.customUrl : themeMeta.defaultMeta.src;

    if (playingTheme === themeId) {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
      }
      setPlayingTheme(null);
      return;
    }

    if (audioPreviewRef.current) {
      audioPreviewRef.current.pause();
    }

    const audio = new Audio(src);
    audioPreviewRef.current = audio;
    audio.volume = 0.7;

    audio.play().then(() => {
      setPlayingTheme(themeId);
    }).catch((err) => {
      toast.error('Preview error: ' + err.message);
      setPlayingTheme(null);
    });

    audio.onended = () => {
      setPlayingTheme(null);
    };
  };

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      if (audioPreviewRef.current) {
        audioPreviewRef.current.pause();
      }
    };
  }, []);

  // Handle file select
  const handleFileChange = (themeId, file) => {
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      toast.error('Audio file must be under 15MB');
      return;
    }
    setSelectedFiles((prev) => ({ ...prev, [themeId]: file }));
  };

  // Upload or save custom audio
  const handleSaveTheme = async (themeId) => {
    const themeForm = formData[themeId] || {};
    const file = selectedFiles[themeId];

    if (!file && !themeForm.customUrl) {
      toast.error('Please select an audio file to upload or enter a custom audio URL.');
      return;
    }

    setUploadingTheme(themeId);
    const toastId = toast.loading(`Uploading & applying custom sound for ${themeId}...`);

    try {
      const data = new FormData();
      if (file) {
        data.append('audio', file);
      }
      if (themeForm.customUrl) {
        data.append('customUrl', themeForm.customUrl);
      }
      if (themeForm.customTitle) {
        data.append('customTitle', themeForm.customTitle);
      }
      if (themeForm.customSubtitle) {
        data.append('customSubtitle', themeForm.customSubtitle);
      }

      await uploadThemeSound(themeId, data);
      toast.success(`Shinobi theme audio for ${themeId} applied globally! 🗡️`, { id: toastId });

      // Clear selected file
      setSelectedFiles((prev) => ({ ...prev, [themeId]: null }));

      // Refresh settings and global audio store
      if (onRefreshSettings) onRefreshSettings();
      if (fetchThemeSounds) fetchThemeSounds();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to upload audio.';
      toast.error(msg, { id: toastId });
    } finally {
      setUploadingTheme(null);
    }
  };

  // Reset theme audio to default built-in loop
  const handleResetTheme = async (themeId) => {
    setResettingTheme(themeId);
    const toastId = toast.loading(`Reverting ${themeId} to built-in meditative loop...`);

    try {
      await resetThemeSound(themeId);
      toast.success(`${themeId} reverted to default built-in loop! 🧘`, { id: toastId });

      // Clear selected file and form
      setSelectedFiles((prev) => ({ ...prev, [themeId]: null }));

      if (onRefreshSettings) onRefreshSettings();
      if (fetchThemeSounds) fetchThemeSounds();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to reset theme.';
      toast.error(msg, { id: toastId });
    } finally {
      setResettingTheme(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Banner Header ─────────────────────────────────────── */}
      <div className="card p-6 rounded-3xl bg-gradient-to-r from-brand-500/15 via-violet-500/10 to-transparent border border-brand-500/30 space-y-2">
        <div className="flex items-center gap-2 text-brand-300 text-xs font-mono font-bold uppercase tracking-wider">
          <Music className="w-4 h-4 text-brand-400" />
          <span>Shinobi Elemental Audio // 忍音 Studio</span>
        </div>
        <h2 className="text-xl font-display font-black text-white">
          Global Theme Ambient Audio Configuration
        </h2>
        <p className="text-xs font-mono text-secondary max-w-3xl leading-relaxed">
          Upload custom meditative audio files (.mp3, .wav, .ogg, .m4a up to 15MB) or direct CDN links for any of the 5 Shinobi themes. When saved, the custom sound instantly takes effect globally for all candidates and visitors. Built-in 30-second meditative soundscapes remain the default fallback.
        </p>
      </div>

      {/* ── 5 Themes Configuration Grid ───────────────────────── */}
      <div className="space-y-5">
        {THEME_ITEMS.map((t) => {
          const cfg = formData[t.id] || {};
          const isCustom = cfg.isCustom && cfg.customUrl;
          const isPreviewing = playingTheme === t.id;
          const isSaving = uploadingTheme === t.id;
          const isResetting = resettingTheme === t.id;
          const selectedFile = selectedFiles[t.id];

          return (
            <div
              key={t.id}
              className="card p-5 sm:p-6 rounded-3xl border border-subtle bg-surface/80 backdrop-blur-xl hover:border-brand-500/30 transition-all duration-200 space-y-4"
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-subtle">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center font-black text-base border shadow-sm"
                    style={{
                      backgroundColor: `${t.color}20`,
                      borderColor: `${t.color}50`,
                      color: t.color,
                    }}
                  >
                    {t.kanji}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-display font-black text-white">{t.name}</h3>
                      <span className="text-[10px] font-mono text-secondary">({t.id})</span>
                    </div>
                    <p className="text-[11px] font-mono text-secondary">{t.desc}</p>
                  </div>
                </div>

                {/* Status & Preview Button */}
                <div className="flex items-center gap-2.5 self-start sm:self-auto">
                  {/* Status Badge */}
                  {isCustom ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono font-bold">
                      <Sparkles className="w-3 h-3 text-cyan-400" />
                      <span>Custom Audio Active</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-mono font-bold">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      <span>Built-in Meditative Loop</span>
                    </span>
                  )}

                  {/* Play / Pause Preview Button */}
                  <button
                    type="button"
                    onClick={() => handleTogglePreview(t.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                      isPreviewing
                        ? 'bg-brand-500 text-white border-brand-400 shadow-md shadow-brand-500/30 animate-pulse'
                        : 'bg-surface hover:bg-surface-hover border-subtle text-white'
                    }`}
                    title={isPreviewing ? 'Stop Preview' : 'Play & Listen Audio'}
                  >
                    {isPreviewing ? (
                      <>
                        <Pause className="w-3.5 h-3.5" />
                        <span>Stop</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 text-brand-400" />
                        <span>Preview</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Source & Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
                {/* Left Column: Active Source & File Upload */}
                <div className="space-y-3 p-4 rounded-2xl bg-surface border border-subtle/80">
                  <div className="text-[11px] font-bold text-white flex items-center justify-between">
                    <span>Active Audio Source</span>
                    {isCustom ? (
                      <a
                        href={cfg.customUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-brand-400 hover:underline inline-flex items-center gap-1"
                      >
                        <span>Open File</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    ) : (
                      <span className="text-[10px] text-secondary">Default: {t.defaultMeta.src}</span>
                    )}
                  </div>

                  {/* Upload File Input */}
                  <div className="space-y-1.5">
                    <label className="block text-[10.5px] font-extrabold uppercase text-secondary">
                      Upload New Audio File (.mp3, .wav, .ogg, .m4a)
                    </label>
                    <div className="flex items-center gap-2">
                      <label className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl bg-surface border border-dashed border-subtle hover:border-brand-500/50 transition-colors cursor-pointer text-secondary hover:text-white truncate">
                        <UploadCloud className="w-4 h-4 text-brand-400 shrink-0" />
                        <span className="text-xs truncate">
                          {selectedFile ? selectedFile.name : 'Choose audio file...'}
                        </span>
                        <input
                          type="file"
                          accept="audio/*,.mp3,.wav,.ogg,.m4a"
                          onChange={(e) => handleFileChange(t.id, e.target.files?.[0])}
                          className="hidden"
                        />
                      </label>
                      {selectedFile && (
                        <span className="text-[10px] text-emerald-400 font-bold shrink-0">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Or Direct URL Input */}
                  <div className="space-y-1">
                    <label className="block text-[10.5px] font-extrabold uppercase text-secondary">
                      Or External Audio URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com/audio.mp3"
                      value={cfg.customUrl || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          [t.id]: { ...prev[t.id], customUrl: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl bg-surface border border-subtle text-white placeholder-secondary text-xs focus:outline-none focus:border-brand-500/60"
                    />
                  </div>
                </div>

                {/* Right Column: Title & Subtitle Customization */}
                <div className="space-y-3 p-4 rounded-2xl bg-surface border border-subtle/80">
                  <div className="text-[11px] font-bold text-white">Track Information Display</div>

                  <div className="space-y-1">
                    <label className="block text-[10.5px] font-extrabold uppercase text-secondary">
                      Display Title
                    </label>
                    <input
                      type="text"
                      placeholder={t.defaultMeta.title}
                      value={cfg.customTitle || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          [t.id]: { ...prev[t.id], customTitle: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl bg-surface border border-subtle text-white placeholder-secondary text-xs focus:outline-none focus:border-brand-500/60"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-[10.5px] font-extrabold uppercase text-secondary">
                      Display Subtitle / Mood
                    </label>
                    <input
                      type="text"
                      placeholder={t.defaultMeta.subtitle}
                      value={cfg.customSubtitle || ''}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          [t.id]: { ...prev[t.id], customSubtitle: e.target.value },
                        }))
                      }
                      className="w-full px-3 py-2 rounded-xl bg-surface border border-subtle text-white placeholder-secondary text-xs focus:outline-none focus:border-brand-500/60"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="flex items-center justify-end gap-3 pt-2">
                {isCustom && (
                  <button
                    type="button"
                    onClick={() => handleResetTheme(t.id)}
                    disabled={isResetting || isSaving}
                    className="px-4 py-2 rounded-xl bg-surface hover:bg-rose-500/10 border border-subtle hover:border-rose-500/30 text-secondary hover:text-rose-400 text-xs font-mono font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {isResetting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <RotateCcw className="w-3.5 h-3.5" />
                    )}
                    <span>Reset to Default Loop</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleSaveTheme(t.id)}
                  disabled={isSaving || isResetting}
                  className="px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Applying...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      <span>Save & Apply Globally</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
