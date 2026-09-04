import React from 'react';
import { ShurikenIcon, KatanaIcon, KunaiIcon, ScrollIcon, DojoIcon } from '@/components/ui/ShinobiIcons';

export const ARCHETYPE_MAP = {
  archetype_shadow: {
    icon: ShurikenIcon,
    bg: 'from-purple-900/80 to-purple-950',
    border: 'border-purple-500/50',
    textColor: 'text-purple-300',
    color: '#a855f7',
  },
  archetype_blade: {
    icon: KatanaIcon,
    bg: 'from-rose-900/80 to-rose-950',
    border: 'border-rose-500/50',
    textColor: 'text-rose-300',
    color: '#f43f5e',
  },
  archetype_jade: {
    icon: KunaiIcon,
    bg: 'from-emerald-900/80 to-emerald-950',
    border: 'border-emerald-500/50',
    textColor: 'text-emerald-300',
    color: '#10b981',
  },
  archetype_scroll: {
    icon: ScrollIcon,
    bg: 'from-pink-900/80 to-pink-950',
    border: 'border-pink-500/50',
    textColor: 'text-pink-300',
    color: '#ec4899',
  },
  archetype_dojo: {
    icon: DojoIcon,
    bg: 'from-amber-900/80 to-amber-950',
    border: 'border-amber-500/50',
    textColor: 'text-amber-300',
    color: '#f59e0b',
  },
};

export default function ShinobiAvatar({
  user,
  avatar,
  size = 'md',
  className = '',
  showRing = true,
}) {
  const rawAvatar = avatar || user?.avatar || user?.photoUrl || (typeof window !== 'undefined' ? localStorage.getItem('assessyn_avatar') : '') || '';
  const effectiveAvatar =
    typeof rawAvatar === 'object' && rawAvatar !== null
      ? (rawAvatar.url || '')
      : (typeof rawAvatar === 'string' ? rawAvatar : '');
  const nameInitial = user?.name?.charAt(0).toUpperCase() || 'U';

  const sizeClasses = {
    xs: 'w-7 h-7 text-xs',
    sm: 'w-8 h-8 sm:w-9 sm:h-9 text-xs sm:text-sm',
    md: 'w-10 h-10 sm:w-11 sm:h-11 text-sm sm:text-base',
    lg: 'w-14 h-14 text-xl',
    xl: 'w-24 h-24 sm:w-28 sm:h-28 text-3xl sm:text-4xl',
  };

  const iconSizeClasses = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4 sm:w-4.5 sm:h-4.5',
    md: 'w-5 h-5 sm:w-6 sm:h-6',
    lg: 'w-7 h-7',
    xl: 'w-12 h-12',
  };

  const ringClasses = showRing ? 'border border-brand-500/40 shadow-sm' : '';
  const currentSizeClass = sizeClasses[size] || sizeClasses.md;
  const currentIconClass = iconSizeClasses[size] || iconSizeClasses.md;

  const archetype = ARCHETYPE_MAP[effectiveAvatar] || (!effectiveAvatar ? ARCHETYPE_MAP.archetype_blade : null);

  if (archetype) {
    const IconComponent = archetype.icon;
    return (
      <div
        className={`rounded-full bg-gradient-to-br ${archetype.bg} ${archetype.border} ${currentSizeClass} flex items-center justify-center flex-shrink-0 shadow-inner overflow-hidden select-none ${className}`}
      >
        <IconComponent className={`${currentIconClass} ${archetype.textColor} drop-shadow-sm`} />
      </div>
    );
  }

  if (effectiveAvatar && (effectiveAvatar.startsWith('http') || effectiveAvatar.startsWith('data:image'))) {
    return (
      <div
        className={`rounded-full bg-surface ${ringClasses} ${currentSizeClass} flex items-center justify-center flex-shrink-0 overflow-hidden select-none ${className}`}
      >
        <img
          src={effectiveAvatar}
          alt={user?.name || 'User Avatar'}
          className="w-full h-full object-cover rounded-full"
        />
      </div>
    );
  }

  const fallback = ARCHETYPE_MAP.archetype_blade;
  const FallbackIcon = fallback.icon;
  return (
    <div
      className={`rounded-full bg-gradient-to-br ${fallback.bg} ${fallback.border} ${currentSizeClass} flex items-center justify-center flex-shrink-0 shadow-inner overflow-hidden select-none ${className}`}
    >
      <FallbackIcon className={`${currentIconClass} ${fallback.textColor} drop-shadow-sm`} />
    </div>
  );
}
