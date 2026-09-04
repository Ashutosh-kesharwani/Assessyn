import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Lock, Save, Loader2, CheckCircle, ShieldCheck, Zap,
  KeyRound, Shield, AlertCircle, Sparkles, CheckCircle2, Camera,
  Moon, Leaf, Flame, Flower2, Award, Check, RefreshCw, Trash2, UploadCloud,
  Crown, CreditCard, Cpu, ArrowRight, FileText, Globe, Smartphone, Music
} from 'lucide-react';
import { userAPI } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { useProStore } from '@/store/proStore';
import { useThemeStore } from '@/store/themeStore';
import { useSoundStore, SHINOBI_SOUNDSCAPES } from '@/store/soundStore';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { THEMES } from '@/components/common/ThemeToggle';
import { DojoIcon, KatanaIcon, ShurikenIcon, ScrollIcon, KunaiIcon } from '@/components/ui/ShinobiIcons';
import { signInWithGoogle } from '@/config/firebase';
import ProfilePhoneModal from '@/components/profile/ProfilePhoneModal';
import SecurityPassphraseCard from '@/components/profile/SecurityPassphraseCard';

// Shinobi Preset Vector Archetypes
const AVATAR_PRESETS = [
  {
    id: 'archetype_shadow',
    label: 'Shadow Assassin',
    tag: 'STEALTH',
    icon: ShurikenIcon,
    themeColor: '#a855f7',
    bg: 'from-purple-900/60 to-purple-950/90',
    border: 'border-purple-500/40',
    textColor: 'text-purple-300',
  },
  {
    id: 'archetype_blade',
    label: 'Katana Master',
    tag: 'ASSAULT',
    icon: KatanaIcon,
    themeColor: '#f43f5e',
    bg: 'from-rose-900/60 to-rose-950/90',
    border: 'border-rose-500/40',
    textColor: 'text-rose-300',
  },
  {
    id: 'archetype_jade',
    label: 'Jade Vanguard',
    tag: 'RECON',
    icon: KunaiIcon,
    themeColor: '#10b981',
    bg: 'from-emerald-900/60 to-emerald-950/90',
    border: 'border-emerald-500/40',
    textColor: 'text-emerald-300',
  },
  {
    id: 'archetype_scroll',
    label: 'Grand Sage',
    tag: 'INTELLIGENCE',
    icon: ScrollIcon,
    themeColor: '#ec4899',
    bg: 'from-pink-900/60 to-pink-950/90',
    border: 'border-pink-500/40',
    textColor: 'text-pink-300',
  },
  {
    id: 'archetype_dojo',
    label: 'Dojo Grandmaster',
    tag: 'COMMAND',
    icon: DojoIcon,
    themeColor: '#f59e0b',
    bg: 'from-amber-900/60 to-amber-950/90',
    border: 'border-amber-500/40',
    textColor: 'text-amber-300',
  },
];

export default function ProfilePage() {
  const { user, updateUser } = useAuthStore();
  const { theme, setTheme } = useThemeStore();
  const { getEffectiveTrack } = useSoundStore();
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const getAvatarStr = (av) => (typeof av === 'object' && av !== null ? (av.url || '') : (typeof av === 'string' ? av : ''));
  const [activeAvatar, setActiveAvatar] = useState(() => getAvatarStr(user?.avatar) || (typeof window !== 'undefined' ? localStorage.getItem('assessyn_avatar') : '') || 'archetype_blade');
  const [pendingArchetype, setPendingArchetype] = useState(null);
  const [usernameInput, setUsernameInput] = useState(() => user?.username || '');
  const [usernameStatus, setUsernameStatus] = useState({ checking: false, available: null, message: '' });
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [isChangingEmail, setIsChangingEmail] = useState(false);
  const fileInputRef = useRef(null);

  // Sync activeAvatar and fields with user store if user changes
  useEffect(() => {
    if (user?.avatar !== undefined && user?.avatar !== null) {
      setActiveAvatar(getAvatarStr(user.avatar) || 'archetype_blade');
    }
    if (user?.username) {
      setUsernameInput(user.username);
    }
  }, [user]);

  // Username availability live check debounce
  useEffect(() => {
    if (!usernameInput || usernameInput === user?.username) {
      setUsernameStatus({ checking: false, available: null, message: '' });
      return;
    }

    const timer = setTimeout(async () => {
      setUsernameStatus({ checking: true, available: null, message: '' });
      try {
        const { data } = await userAPI.checkUsernameAvailability(usernameInput);
        if (data.available) {
          setUsernameStatus({ checking: false, available: true, message: 'Username is available!' });
        } else {
          setUsernameStatus({
            checking: false,
            available: false,
            message: data.message || 'Username already taken or invalid.',
          });
        }
      } catch {
        setUsernameStatus({ checking: false, available: null, message: '' });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [usernameInput, user?.username]);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      username: user?.username || '',
    },
  });

  useEffect(() => {
    if (user) {
      setValue('name', user.name || '');
      setValue('email', user.email || '');
      setValue('username', user.username || '');
    }
  }, [user, setValue]);

  // Handle Shinobi Theme Selection
  const handleThemeChange = (themeId) => {
    setTheme(themeId);
    toast.success(`Shinobi Theme switched to ${THEMES.find(t => t.id === themeId)?.name}! 🗡️`);
  };

  // Handle Cloudinary Image File Upload
  const handleAvatarFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Avatar file size must be under 5MB');
      return;
    }

    setUploadingAvatar(true);
    const toastId = toast.loading('Uploading avatar to Cloudinary...');
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const { data } = await userAPI.uploadAvatar(formData);
      const newAvatarUrl = data.avatar || data.user?.avatar;
      setActiveAvatar(newAvatarUrl);
      localStorage.setItem('assessyn_avatar', newAvatarUrl);
      updateUser({ avatar: newAvatarUrl });
      toast.success('Shinobi Avatar synced to Cloudinary! 🗡️', { id: toastId });
    } catch (err) {
      // Fallback: Local Base64 preview
      const reader = new FileReader();
      reader.onloadend = () => {
        const b64 = reader.result;
        setActiveAvatar(b64);
        localStorage.setItem('assessyn_avatar', b64);
        updateUser({ avatar: b64 });
        toast.success('Avatar updated locally! 🗡️', { id: toastId });
      };
      reader.readAsDataURL(file);
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Apply archetype change
  const applyArchetype = async (archetype) => {
    setActiveAvatar(archetype.id);
    localStorage.setItem('assessyn_avatar', archetype.id);
    updateUser({ avatar: archetype.id });
    setPendingArchetype(null);
    try {
      await userAPI.updateMe({ avatar: archetype.id });
      toast.success(`Active Archetype: ${archetype.label}! 🗡️`);
    } catch {
      toast.success(`Active Archetype: ${archetype.label}!`);
    }
  };

  // Handle Preset Archetype Selection with Confirmation
  const handleArchetypeSelect = (archetype) => {
    if (activeAvatar === archetype.id) return;
    setPendingArchetype(archetype);
  };

  // Handle Delete / Reset Avatar
  const handleDeleteAvatar = async () => {
    const toastId = toast.loading('Reverting to default Katana Master crest...');
    try {
      await userAPI.deleteAvatar();
    } catch {}
    setActiveAvatar('archetype_blade');
    localStorage.removeItem('assessyn_avatar');
    updateUser({ avatar: 'archetype_blade' });
    toast.success('Avatar reset to default Katana Master crest 🗡️', { id: toastId });
  };

  const onProfileSave = async (data) => {
    setSaving(true);
    try {
      const payload = { name: data.name };
      if (data.username && data.username !== user?.username) {
        payload.username = data.username;
      }

      const { data: res } = await userAPI.updateMe(payload);
      updateUser(res.user);
      toast.success('Operator credentials updated! 🗡️');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  // Handle Google Re-auth & Email Update
  const handleChangeEmailWithGoogle = async () => {
    setIsChangingEmail(true);
    const toastId = toast.loading('Opening Google Authentication...');
    try {
      const res = await signInWithGoogle();
      if (!res.success) {
        toast.error(res.message || 'Google authentication cancelled.', { id: toastId });
        return;
      }

      const googleEmail = res.user?.email;
      if (googleEmail === user?.email) {
        toast.success(`Your account is already verified with ${googleEmail}!`, { id: toastId });
        return;
      }

      toast.loading(`Linking and verifying ${googleEmail}...`, { id: toastId });
      const { data } = await userAPI.verifyUpdateEmail(res.idToken);
      if (data.success) {
        updateUser(data.user);
        setValue('email', data.user.email);
        toast.success(`Account email updated to ${data.user.email}! 🗡️`, { id: toastId });
      } else {
        toast.error(data.message || 'Email update failed.', { id: toastId });
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Failed to update email with Google.';
      toast.error(msg, { id: toastId });
    } finally {
      setIsChangingEmail(false);
    }
  };

  // Determine Shinobi Rank Tier
  const totalSessions = user?.totalSessions || 0;
  const rankTier = user?.role === 'admin'
    ? { title: 'SHADOW KAGE // GRANDMASTER', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40', rank: 'TIER S+' }
    : totalSessions >= 10
    ? { title: 'ANBU BLACK OPS // SPECIAL FORCES', badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40', rank: 'TIER 5' }
    : totalSessions >= 5
    ? { title: 'JONIN VETERAN // ELITE OPERATIVE', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', rank: 'TIER 4' }
    : totalSessions >= 2
    ? { title: 'CHUNIN // BATTLE TESTED', badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40', rank: 'TIER 3' }
    : { title: 'GENIN // DOJO RECRUIT', badge: 'bg-brand-500/20 text-brand-300 border-brand-500/40', rank: 'TIER 1' };

  // Render Avatar Content Helper
  const selectedArchetype = AVATAR_PRESETS.find((p) => p.id === activeAvatar);

  return (
    <main className="max-w-5xl mx-auto space-y-8 animate-fade-in pb-16">
      {/* ── 1. Centered Hero Stage with Rotating Shuriken Glow ── */}
      <header className="p-8 sm:p-12 rounded-3xl bg-surface/90 backdrop-blur-2xl border border-subtle flex flex-col items-center justify-center text-center relative overflow-hidden shadow-2xl space-y-6">
        {/* Top Katana Edge Sheen */}
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-brand-400/60 to-transparent pointer-events-none" />

        {/* ── Rotating Shuriken Holographic Avatar Cockpit ─────── */}
        <div className="relative flex items-center justify-center pt-3">
          {/* Ambient Mesh Glow */}
          <div className="absolute w-56 h-56 bg-[var(--accent-primary)]/20 rounded-full blur-3xl pointer-events-none animate-pulse" />

          {/* Outer Dashed Compass Radar Ring */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 16, repeat: Infinity, ease: 'linear' }}
            className="absolute w-44 h-44 sm:w-52 sm:h-52 rounded-full border border-dashed border-brand-400/25 flex items-center justify-center pointer-events-none"
          >
            <div className="w-2 h-2 rounded-full bg-brand-400 absolute top-0 -translate-y-1/2 shadow-glow" />
            <div className="w-2 h-2 rounded-full bg-brand-400 absolute bottom-0 translate-y-1/2 shadow-glow" />
          </motion.div>

          {/* ── THE BIG ROTATING SHINOBI SHURIKEN BEHIND AVATAR ──── */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 5, repeat: Infinity, ease: 'linear' }}
            className="absolute flex items-center justify-center pointer-events-none"
          >
            <svg
              viewBox="0 0 100 100"
              className="w-36 h-36 sm:w-44 sm:h-44 drop-shadow-[0_0_25px_var(--accent-primary)] opacity-85"
            >
              <defs>
                <linearGradient id="profileShurikenBlade" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="50%" stopColor="var(--accent-primary)" />
                  <stop offset="100%" stopColor="#0a0a0f" />
                </linearGradient>
                <linearGradient id="profileShurikenEdge" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--accent-primary)" />
                  <stop offset="100%" stopColor="#ffffff" />
                </linearGradient>
              </defs>

              {/* 4 Curved Aerodynamic Shinobi Razor Blades */}
              <path
                d="M50 4 C55 28 72 45 96 50 C72 55 55 72 50 96 C45 72 28 55 4 50 C28 45 45 28 50 4 Z"
                fill="url(#profileShurikenBlade)"
                stroke="url(#profileShurikenEdge)"
                strokeWidth="1.5"
              />

              {/* Inner Slashing Sheen Facets */}
              <path
                d="M50 18 L59 41 L82 50 L59 59 L50 82 L41 59 L18 50 L41 41 Z"
                fill="var(--accent-primary)"
                fillOpacity="0.4"
              />
            </svg>
          </motion.div>

          {/* ── Central Profile Avatar Container ───────────────── */}
          <div className="relative z-10">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full bg-surface/95 border-2 border-brand-500/70 shadow-2xl flex items-center justify-center text-white font-display font-black text-4xl overflow-hidden relative group">
              {activeAvatar ? (
                selectedArchetype ? (
                  <div className={`w-full h-full bg-gradient-to-br ${selectedArchetype.bg} flex items-center justify-center shadow-inner`}>
                    <selectedArchetype.icon className={`w-12 h-12 ${selectedArchetype.textColor} drop-shadow-md`} />
                  </div>
                ) : (
                  <img
                    src={activeAvatar}
                    alt="User Avatar"
                    className="w-full h-full object-cover"
                  />
                )
              ) : (
                <div className="w-full h-full bg-surface flex items-center justify-center text-white">
                  <span>{user?.name?.charAt(0).toUpperCase() || 'U'}</span>
                </div>
              )}

              {/* Hover Quick Edit Action Overlay */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute inset-0 bg-black/70 backdrop-blur-xs flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white cursor-pointer"
                title="Upload Cloudinary Avatar"
              >
                {uploadingAvatar ? (
                  <Loader2 className="w-6 h-6 animate-spin text-brand-400" />
                ) : (
                  <>
                    <Camera className="w-5 h-5 text-brand-300 mb-0.5" />
                    <span className="text-[9px] font-mono font-bold uppercase">Replace</span>
                  </>
                )}
              </button>
            </div>

            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarFileChange}
            />

            {/* Operator Active Status Pill */}
            <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-surface border border-subtle text-[9px] font-mono font-black text-emerald-400 uppercase tracking-widest shadow-md whitespace-nowrap">
              OPERATOR ACTIVE
            </span>
          </div>
        </div>

        {/* ── Centered Name, Rank Tier & Badges ───────────────── */}
        <div className="space-y-3 max-w-xl mx-auto pt-2 z-10">
          <div className="space-y-1">
            <h1 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight leading-tight">
              {user?.name || 'Shinobi Candidate'}
            </h1>
            <p className="text-secondary text-xs sm:text-sm font-mono">{user?.email}</p>
          </div>

          {/* Shinobi Rank Tier Tag */}
          <div className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
            <span className={`inline-flex items-center gap-2 px-3.5 py-1 rounded-xl border text-xs font-mono font-extrabold tracking-wider ${rankTier.badge}`}>
              <KatanaIcon className="w-3.5 h-3.5" />
              <span>{rankTier.title}</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface border border-subtle text-xs font-mono text-secondary font-bold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Verified Account</span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-surface border border-subtle text-xs font-mono text-secondary font-bold">
              <DojoIcon className="w-3.5 h-3.5 text-brand-400" />
              <span className="text-white">{totalSessions}</span> Missions Completed
            </span>
          </div>

          {/* Avatar Management Quick Bar (Replace / Delete) */}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-1.5 rounded-xl bg-surface border border-subtle hover:border-brand-500/50 text-white hover:bg-brand-500/10 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <UploadCloud className="w-3.5 h-3.5 text-brand-400" />
              <span>Upload Custom Photo</span>
            </button>

            {activeAvatar && (
              <button
                type="button"
                onClick={handleDeleteAvatar}
                className="px-3.5 py-1.5 rounded-xl bg-surface border border-subtle hover:border-rose-500/50 text-secondary hover:text-rose-400 hover:bg-rose-500/10 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                <span>Remove Avatar</span>
              </button>
            )}
          </div>
        </div>

        {/* ── Preset Avatar Archetypes Grid ───────────────────── */}
        <div className="pt-4 z-10 border-t border-subtle w-full max-w-xl">
          <p className="text-[10.5px] font-mono font-bold uppercase tracking-widest text-secondary mb-3">
            Select Shinobi Archetype Emblem
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {AVATAR_PRESETS.map((preset) => {
              const isSelected = activeAvatar === preset.id;
              const IconComponent = preset.icon;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleArchetypeSelect(preset)}
                  className={`p-3 rounded-2xl border text-center transition-all duration-200 flex flex-col items-center justify-between gap-2 cursor-pointer shadow-sm group ${
                    isSelected
                      ? `bg-surface border-brand-400 ring-2 ring-brand-500/40 shadow-lg`
                      : 'bg-surface/70 border-subtle hover:border-slate-600 hover:bg-surface'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl bg-gradient-to-br ${preset.bg} border ${preset.border} flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform`}
                  >
                    <IconComponent className={`w-5 h-5 ${preset.textColor}`} />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-[11px] font-display font-black text-white truncate max-w-[80px]">
                      {preset.label}
                    </p>
                    <span className="text-[9px] font-mono font-extrabold text-secondary uppercase block">
                      {preset.tag}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* ── 2. Shinobi Elemental Theme Selector ───────────────── */}
      <section aria-label="Shinobi Elemental Themes" className="p-6 sm:p-8 rounded-3xl bg-surface/90 backdrop-blur-2xl border border-subtle shadow-xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-subtle">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-brand-500/15 text-brand-400 border border-brand-500/30">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display font-bold text-white text-base">Shinobi Elemental Themes</h2>
              <p className="text-[10.5px] font-mono text-secondary">Switch dynamic HUD colors and katana sheens across the entire workspace</p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-extrabold text-secondary uppercase">
            // PALETTE MATRIX
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {THEMES.map((themeItem) => {
            const isActive = theme === themeItem.id;
            const ThemeIcon = themeItem.icon;
            return (
              <button
                key={themeItem.id}
                type="button"
                onClick={() => handleThemeChange(themeItem.id)}
                className={`p-4 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between space-y-3 cursor-pointer relative overflow-hidden group ${
                  isActive
                    ? 'bg-surface border-brand-400 ring-2 ring-brand-500/30 shadow-lg'
                    : 'bg-surface/70 border-subtle hover:border-slate-600 hover:bg-surface'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div
                    className="w-7 h-7 rounded-xl flex items-center justify-center text-white"
                    style={{ backgroundColor: `${themeItem.color}25`, border: `1px solid ${themeItem.color}50` }}
                  >
                    <ThemeIcon className="w-4 h-4" style={{ color: themeItem.color }} />
                  </div>
                  {isActive && (
                    <span className="p-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-xs font-display font-black text-white group-hover:text-brand-300 transition-colors">
                    {themeItem.name}
                  </h3>
                  <p className="text-[10.5px] font-mono text-secondary leading-snug mt-0.5">
                    {themeItem.desc}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-subtle/50 text-[9.5px] font-mono" style={{ color: themeItem.color }}>
                    <Music className="w-2.5 h-2.5 shrink-0" />
                    <span className="truncate">{(getEffectiveTrack ? getEffectiveTrack(themeItem.id) : SHINOBI_SOUNDSCAPES[themeItem.id])?.title || 'Resonance'}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ── 3. Personal Information Form ───────────────────────── */}
      <section aria-label="Personal Information" className="p-6 sm:p-8 rounded-3xl bg-surface/90 backdrop-blur-2xl border border-subtle shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-subtle">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-brand-500/15 text-brand-400 border border-brand-500/30">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display font-bold text-white text-base">Operator Credentials</h2>
              <p className="text-[10.5px] font-mono text-secondary">Candidate name and public identity</p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-extrabold text-secondary uppercase">
            // CRED-01
          </span>
        </div>

        <form onSubmit={handleSubmit(onProfileSave)} className="space-y-5">
          {/* Identity & Provider Status Bar */}
          <div className="flex flex-wrap items-center gap-2.5 p-3 rounded-2xl bg-surface border border-subtle">
            <span className="text-[10.5px] font-mono text-secondary uppercase font-bold">
              Identity Provider:
            </span>
            <span className="px-2.5 py-0.5 rounded-lg bg-brand-500/20 text-brand-300 border border-brand-500/30 text-[10.5px] font-mono font-bold uppercase">
              {user?.authProvider || 'password'}
            </span>
            {user?.emailVerified && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                <CheckCircle2 className="w-3 h-3" />
                <span>Email Verified</span>
              </span>
            )}
            {user?.phoneVerified && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                <CheckCircle2 className="w-3 h-3" />
                <span>Phone Verified</span>
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Display Name */}
            <div className="space-y-2">
              <label className="block text-xs font-mono font-extrabold uppercase tracking-wider text-secondary">
                Full Display Name
              </label>
              <input
                type="text"
                className="w-full p-4 rounded-2xl bg-surface border border-subtle text-white placeholder-secondary text-xs sm:text-sm font-medium focus:outline-none focus:border-brand-500/60 transition-all font-sans"
                placeholder="Enter your full operator name..."
                {...register('name', { required: 'Full name is required', minLength: { value: 2, message: 'Minimum 2 characters required' } })}
              />
              {errors.name && (
                <p className="text-xs font-mono text-rose-400 font-bold flex items-center gap-1.5 pt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.name.message}</span>
                </p>
              )}
            </div>

            {/* Unique Username Handle */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-mono font-extrabold uppercase tracking-wider text-secondary">
                  Unique Username Handle
                </label>
                {usernameStatus.checking && (
                  <span className="text-[10px] font-mono text-brand-300 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    <span>Checking...</span>
                  </span>
                )}
                {usernameStatus.available === true && (
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Available</span>
                  </span>
                )}
                {usernameStatus.available === false && (
                  <span className="text-[10px] font-mono text-rose-400 flex items-center gap-1 font-bold">
                    <AlertCircle className="w-3 h-3" />
                    <span>Unavailable</span>
                  </span>
                )}
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-400 font-mono font-bold text-sm">
                  @
                </span>
                <input
                  type="text"
                  className="w-full pl-8 pr-4 py-4 rounded-2xl bg-surface border border-subtle text-white placeholder-secondary text-xs sm:text-sm font-mono focus:outline-none focus:border-brand-500/60 transition-all"
                  placeholder="shinobi_warrior"
                  {...register('username', {
                    pattern: {
                      value: /^[a-z0-9_]{3,30}$/,
                      message: 'Username must be 3-30 lowercase alphanumeric characters or underscores',
                    },
                  })}
                  onChange={(e) => {
                    const cleanVal = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
                    setValue('username', cleanVal);
                    setUsernameInput(cleanVal);
                  }}
                />
              </div>
              {errors.username && (
                <p className="text-xs font-mono text-rose-400 font-bold flex items-center gap-1.5 pt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>{errors.username.message}</span>
                </p>
              )}
            </div>
          </div>

          {/* Identity Credentials (Email & Phone Verification Actions) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
            {/* Account Email */}
            <div className="space-y-3 p-4 sm:p-5 rounded-2xl bg-surface/80 border border-subtle flex flex-col justify-between shadow-inner">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono font-extrabold uppercase tracking-wider text-secondary">
                    Account Email Address
                  </label>
                  {user?.emailVerified ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Verified</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold">
                      <AlertCircle className="w-3 h-3" />
                      <span>Unverified</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2.5 py-2.5 px-3.5 rounded-xl bg-surface/90 border border-subtle font-mono text-xs text-white break-all">
                  <Mail className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                  <span>{user?.email || 'No email registered'}</span>
                </div>
                <p className="text-[10.5px] font-mono text-secondary leading-snug">
                  Must be unique across all accounts. Google sign-in verifies ownership before updating.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleChangeEmailWithGoogle}
                  disabled={isChangingEmail}
                  className="w-full py-2.5 px-3 rounded-xl bg-surface hover:bg-slate-800 border border-subtle hover:border-brand-500/50 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                >
                  {isChangingEmail ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-400" />
                      <span>Authenticating Google...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                      <span>Change Email via Google</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Account Phone */}
            <div className="space-y-3 p-4 sm:p-5 rounded-2xl bg-surface/80 border border-subtle flex flex-col justify-between shadow-inner">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-mono font-extrabold uppercase tracking-wider text-secondary">
                    Verified Mobile Number
                  </label>
                  {user?.phoneVerified ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono font-bold">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Verified</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-500/15 text-amber-400 border border-amber-500/30 text-[10px] font-mono font-bold">
                      <AlertCircle className="w-3 h-3" />
                      <span>Unverified</span>
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2.5 py-2.5 px-3.5 rounded-xl bg-surface/90 border border-subtle font-mono text-xs text-white">
                  <Smartphone className="w-3.5 h-3.5 text-brand-400 shrink-0" />
                  <span>{user?.phone || 'No mobile number connected'}</span>
                </div>
                <p className="text-[10.5px] font-mono text-secondary leading-snug">
                  Must be unique across all accounts. OTP verification confirms active phone ownership.
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsPhoneModalOpen(true)}
                  className="w-full py-2.5 px-3 rounded-xl bg-surface hover:bg-slate-800 border border-subtle hover:border-brand-500/50 text-white font-mono text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <Smartphone className="w-3.5 h-3.5 text-brand-400" />
                  <span>{user?.phone ? 'Update / Re-verify Mobile' : 'Connect Mobile Number'}</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={KatanaIcon}
              disabled={saving}
              isLoading={saving}
              className="px-7 font-bold text-xs"
            >
              <span>Save Credentials</span>
            </Button>
          </div>
        </form>
      </section>

      {/* ── 4. Security Passphrase Section (Set or Update) ───── */}
      <SecurityPassphraseCard />

      {/* ── 5. Pro Ninja Membership & Multi-LLM Engine Status ── */}
      <section aria-label="Pro Ninja Membership" className="p-6 sm:p-8 rounded-3xl bg-surface/90 backdrop-blur-2xl border border-brand-500/40 shadow-xl space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-subtle">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-brand-500/15 text-brand-400 border border-brand-500/30">
              <Crown className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-display font-bold text-white text-base">Pro Ninja Membership & BYOK</h2>
              <p className="text-[10.5px] font-mono text-secondary">Unlimited AI mock sessions and 5-model auto-routing engine</p>
            </div>
          </div>
          <span className="text-[10px] font-mono font-extrabold text-brand-300 uppercase">
            // PRO-01
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-5 rounded-2xl bg-surface border border-subtle space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-extrabold uppercase text-secondary">Current Plan</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
                Active Tier
              </span>
            </div>
            <div className="text-2xl font-display font-black text-white">
              Assessyn Pro Ninja
            </div>
            <p className="text-xs font-mono text-secondary leading-relaxed">
              ₹299/month · Unlimited missions, Resume Restructurer, and fresh time-filtered radar.
            </p>
            <div className="pt-2">
              <Link
                to="/pricing"
                className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-brand-300 hover:text-white transition-colors"
              >
                <span>View Billing & Receipts</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-surface border border-subtle space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-extrabold uppercase text-secondary">5-Model Auto-Routing</span>
              <span className="px-2.5 py-0.5 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/40 text-[10px] font-mono font-bold">
                Smart Failover
              </span>
            </div>
            <div className="text-2xl font-display font-black text-white">
              BYOK Node Manager
            </div>
            <p className="text-xs font-mono text-secondary leading-relaxed">
              Configure OpenAI, Claude, Groq, DeepSeek, and Gemini keys with automatic quota failover.
            </p>
            <div className="pt-2 flex flex-wrap gap-2">
              <Link
                to="/pro-suite"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-500/20 hover:bg-brand-500/30 border border-brand-500/40 text-brand-300 text-xs font-mono font-bold transition-all"
              >
                <Cpu className="w-3.5 h-3.5 text-brand-400" />
                <span>BYOK Keys</span>
              </Link>
              <Link
                to="/resume-builder"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface hover:bg-brand-500/10 border border-subtle text-secondary hover:text-white text-xs font-mono font-bold transition-all"
              >
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>10 Resumes</span>
              </Link>
              <Link
                to="/portfolio-builder"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface hover:bg-brand-500/10 border border-subtle text-secondary hover:text-white text-xs font-mono font-bold transition-all"
              >
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                <span>10 Portfolios</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Archetype Avatar Override Confirmation Modal ────── */}
      <AnimatePresence>
        {pendingArchetype && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              className="w-full max-w-md bg-surface/95 border border-brand-500/50 rounded-2xl p-6 shadow-2xl space-y-5 relative overflow-hidden"
            >
              {/* Katana Edge Sheen */}
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-brand-400 to-transparent pointer-events-none" />

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/40 flex items-center justify-center text-brand-300">
                  <KatanaIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-display font-black text-white">
                    Update Profile Avatar?
                  </h3>
                  <p className="text-xs font-mono text-secondary">
                    Shinobi Archetype Switch
                  </p>
                </div>
              </div>

              {/* Preview Comparison */}
              <div className="p-4 rounded-xl bg-surface-secondary/70 border border-subtle flex items-center justify-around">
                <div className="flex flex-col items-center gap-1.5">
                  {(() => {
                    const currArch = AVATAR_PRESETS.find(p => p.id === activeAvatar);
                    if (currArch) {
                      return (
                        <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${currArch.bg} border-2 ${currArch.border} flex items-center justify-center`}>
                          <currArch.icon className={`w-7 h-7 ${currArch.textColor}`} />
                        </div>
                      );
                    }
                    const avatarUrl = typeof activeAvatar === 'object' && activeAvatar !== null ? (activeAvatar.url || '') : activeAvatar;
                    if (typeof avatarUrl === 'string' && (avatarUrl.startsWith('http') || avatarUrl.startsWith('data:image'))) {
                      return (
                        <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-subtle">
                          <img src={avatarUrl} alt="Current" className="w-full h-full object-cover" />
                        </div>
                      );
                    }
                    return (
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-900/60 to-rose-950/90 border-2 border-rose-500/40 flex items-center justify-center">
                        <KatanaIcon className="w-7 h-7 text-rose-300" />
                      </div>
                    );
                  })()}
                  <span className="text-[10px] font-mono text-secondary uppercase font-bold">
                    {AVATAR_PRESETS.find(p => p.id === activeAvatar)?.label || 'Current Avatar'}
                  </span>
                </div>

                <ArrowRight className="w-5 h-5 text-brand-400" />

                <div className="flex flex-col items-center gap-1.5">
                  <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${pendingArchetype.bg} border-2 ${pendingArchetype.border} flex items-center justify-center`}>
                    <pendingArchetype.icon className={`w-7 h-7 ${pendingArchetype.textColor}`} />
                  </div>
                  <span className="text-[10px] font-mono text-brand-300 uppercase font-bold">{pendingArchetype.label}</span>
                </div>
              </div>

              <p className="text-xs font-mono text-secondary leading-relaxed">
                Your active profile avatar will be switched to the <strong className="text-white">{pendingArchetype.label}</strong> shinobi archetype. Are you sure you want to proceed?
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setPendingArchetype(null)}
                  className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-secondary hover:text-white hover:bg-surface-hover transition-colors cursor-pointer"
                >
                  Keep Current Avatar
                </button>
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  icon={KatanaIcon}
                  onClick={() => applyArchetype(pendingArchetype)}
                  className="px-4 py-2 font-bold text-xs"
                >
                  Confirm & Update
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Mobile Phone Verification & Update Modal */}
      <ProfilePhoneModal
        isOpen={isPhoneModalOpen}
        onClose={() => setIsPhoneModalOpen(false)}
        currentPhone={user?.phone}
        onSuccess={(updatedUser) => {
          updateUser(updatedUser);
        }}
      />
    </main>
  );
}
