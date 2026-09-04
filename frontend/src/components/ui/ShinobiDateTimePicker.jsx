import { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight,
  Check, X
} from 'lucide-react';

const DAYS_OF_WEEK = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

/**
 * Format Date object to local datetime-local string (YYYY-MM-DDTHH:mm)
 */
export function toLocalISOString(date) {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function ShinobiDateTimePicker({
  value,
  onChange,
  label,
  accentColor = 'brand', // 'brand' | 'emerald' | 'rose'
  minDate,
  disablePast = true, // Automatically disable past dates
  disabled = false,
}) {
  const [isOpen, setIsOpen] = useState(false);

  // Parsed current date/time from prop value or now
  const parsedDate = useMemo(() => {
    const d = value ? new Date(value) : new Date();
    return isNaN(d.getTime()) ? new Date() : d;
  }, [value]);

  // Calendar navigation state
  const [viewYear, setViewYear] = useState(parsedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsedDate.getMonth());

  // Temp draft state while picking
  const [selectedDay, setSelectedDay] = useState(parsedDate.getDate());
  const [selectedHour, setSelectedHour] = useState(parsedDate.getHours() % 12 || 12);
  const [selectedMinute, setSelectedMinute] = useState(parsedDate.getMinutes());
  const [selectedPeriod, setSelectedPeriod] = useState(parsedDate.getHours() >= 12 ? 'PM' : 'AM');

  // Baseline minimum timestamp (Start of day)
  const now = useMemo(() => new Date(), [isOpen]);
  const todayStart = useMemo(() => {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  }, [now]);

  const minTime = useMemo(() => {
    let base = disablePast ? todayStart : 0;
    if (minDate) {
      const m = new Date(minDate);
      if (!isNaN(m.getTime())) {
        const mStart = new Date(m.getFullYear(), m.getMonth(), m.getDate()).getTime();
        base = Math.max(base, mStart);
      }
    }
    return base;
  }, [minDate, disablePast, todayStart]);

  // Sync internal draft when prop value changes or modal opens
  useEffect(() => {
    const d = value ? new Date(value) : new Date();
    if (!isNaN(d.getTime())) {
      setViewYear(d.getFullYear());
      setViewMonth(d.getMonth());
      setSelectedDay(d.getDate());
      setSelectedHour(d.getHours() % 12 || 12);
      setSelectedMinute(d.getMinutes());
      setSelectedPeriod(d.getHours() >= 12 ? 'PM' : 'AM');
    }
  }, [value, isOpen]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Days in current view month
  const daysInMonth = useMemo(() => {
    return new Date(viewYear, viewMonth + 1, 0).getDate();
  }, [viewYear, viewMonth]);

  // First day of week index for month
  const firstDayOfWeek = useMemo(() => {
    return new Date(viewYear, viewMonth, 1).getDay();
  }, [viewYear, viewMonth]);

  // Check if previous month navigation should be disabled
  const isPrevMonthDisabled = useMemo(() => {
    if (!disablePast && !minDate) return false;
    const currentViewMonthStart = new Date(viewYear, viewMonth, 1).getTime();
    const minD = new Date(minTime);
    const minMonthStart = new Date(minD.getFullYear(), minD.getMonth(), 1).getTime();
    return currentViewMonthStart <= minMonthStart;
  }, [disablePast, minDate, minTime, viewYear, viewMonth]);

  // Month navigation
  const prevMonth = (e) => {
    e?.stopPropagation();
    if (isPrevMonthDisabled) return;
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = (e) => {
    e?.stopPropagation();
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Convert 12h + AM/PM to 24h
  const get24Hour = (hour12, period) => {
    let h = hour12 % 12;
    if (period === 'PM') h += 12;
    return h;
  };

  // Apply chosen datetime
  const handleApply = (e) => {
    e?.stopPropagation();
    const hours24 = get24Hour(selectedHour, selectedPeriod);
    const resultDate = new Date(viewYear, viewMonth, selectedDay, hours24, selectedMinute, 0, 0);

    if ((disablePast || minDate) && resultDate.getTime() < minTime) {
      onChange(toLocalISOString(new Date(minTime)));
    } else {
      onChange(toLocalISOString(resultDate));
    }
    setIsOpen(false);
  };

  // Preset quick setters
  const setQuickPreset = (type, e) => {
    e?.stopPropagation();
    const baseDate = minDate && new Date(minDate) > now ? new Date(minDate) : now;
    if (type === 'now') {
      onChange(toLocalISOString(baseDate));
      setIsOpen(false);
    } else if (type === 'plus1d') {
      const target = new Date(baseDate.getTime() + 24 * 60 * 60 * 1000);
      onChange(toLocalISOString(target));
      setIsOpen(false);
    } else if (type === 'plus7d') {
      const target = new Date(baseDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      onChange(toLocalISOString(target));
      setIsOpen(false);
    }
  };

  const accentStyles = {
    brand: {
      btn: 'hover:border-brand-500/50 focus:border-brand-500/60',
      activeBg: 'bg-brand-500 text-white font-black shadow-lg shadow-brand-500/40',
      ring: 'ring-brand-500',
    },
    emerald: {
      btn: 'hover:border-emerald-500/50 focus:border-emerald-500/60',
      activeBg: 'bg-emerald-500 text-slate-950 font-black shadow-lg shadow-emerald-500/40',
      ring: 'ring-emerald-500',
    },
    rose: {
      btn: 'hover:border-rose-500/50 focus:border-rose-500/60',
      activeBg: 'bg-rose-500 text-white font-black shadow-lg shadow-rose-500/40',
      ring: 'ring-rose-500',
    },
  }[accentColor] || accentStyles.brand;

  const displayFormatted = useMemo(() => {
    if (!value) return 'Select Date & Time';
    const d = new Date(value);
    if (isNaN(d.getTime())) return 'Select Date & Time';
    return d.toLocaleString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  }, [value]);

  return (
    <div className="font-mono">
      {label && (
        <label className="block text-[10.5px] font-extrabold uppercase text-secondary mb-1">
          {label}
        </label>
      )}

      {/* ── Trigger Input Button (Stays inside form cleanly) ── */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(true)}
        className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl bg-[#0d0d1a] border border-white/10 text-xs text-white transition-all cursor-pointer shadow-sm ${accentStyles.btn} ${
          isOpen ? 'ring-1 border-white/30' : ''
        }`}
      >
        <div className="flex items-center gap-2 truncate">
          <CalendarIcon size={14} className="text-secondary shrink-0" />
          <span className="font-sans font-medium text-white truncate text-[12px]">
            {displayFormatted}
          </span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Clock size={12} className="text-secondary" />
          <span className="text-[10px] font-mono text-secondary uppercase">Pick</span>
        </div>
      </button>

      {/* ── Dedicated Square Calendar Dialog (Rendered via Portal to prevent layout breaking) ── */}
      {isOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none animate-in fade-in duration-150"
            onClick={() => setIsOpen(false)}
          >
            {/* Square Modal Container */}
            <div
              className="
                w-full max-w-[360px] sm:max-w-[380px]
                bg-[#0d0d1c] border border-white/20 rounded-3xl
                shadow-[0_25px_80px_rgba(0,0,0,0.98)]
                p-5 relative z-10 flex flex-col justify-between
                animate-in zoom-in-95 duration-150
              "
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header: Month / Year Navigation & Close */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <button
                  type="button"
                  onClick={prevMonth}
                  disabled={isPrevMonthDisabled}
                  className="p-2 rounded-xl text-secondary hover:text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed"
                  title={isPrevMonthDisabled ? 'Past months disabled' : 'Previous Month'}
                >
                  <ChevronLeft size={16} />
                </button>

                <div className="flex items-center gap-2">
                  <CalendarIcon size={14} className="text-secondary" />
                  <span className="text-sm font-display font-black text-white tracking-wide">
                    {MONTH_NAMES[viewMonth]} {viewYear}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={nextMonth}
                    className="p-2 rounded-xl text-secondary hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                    title="Next Month"
                  >
                    <ChevronRight size={16} />
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-xl text-secondary hover:text-white hover:bg-white/10 transition-colors cursor-pointer ml-1"
                    title="Close"
                  >
                    <X size={15} />
                  </button>
                </div>
              </div>

              {/* Days of Week Header */}
              <div className="grid grid-cols-7 gap-1 text-center py-2 text-[10.5px] font-bold text-secondary uppercase">
                {DAYS_OF_WEEK.map((d) => (
                  <div key={d}>{d}</div>
                ))}
              </div>

              {/* Square Days Grid */}
              <div className="grid grid-cols-7 gap-1 my-1">
                {/* Empty slots for month start offset */}
                {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square w-full" />
                ))}

                {/* Days of the month */}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const cellTimestamp = new Date(viewYear, viewMonth, day).getTime();
                  const isPast = (disablePast || Boolean(minDate)) && cellTimestamp < minTime;

                  const isSelected =
                    !isPast &&
                    selectedDay === day &&
                    viewMonth === parsedDate.getMonth() &&
                    viewYear === parsedDate.getFullYear();

                  const isToday =
                    now.getDate() === day &&
                    now.getMonth() === viewMonth &&
                    now.getFullYear() === viewYear;

                  return (
                    <button
                      key={day}
                      type="button"
                      disabled={isPast}
                      onClick={() => {
                        if (!isPast) setSelectedDay(day);
                      }}
                      className={`aspect-square w-full rounded-xl text-xs font-mono flex items-center justify-center transition-all ${
                        isPast
                          ? 'text-slate-600/35 bg-white/[0.01] line-through cursor-not-allowed select-none'
                          : isSelected
                          ? accentStyles.activeBg
                          : isToday
                          ? 'bg-white/10 text-brand-300 border border-brand-500/40 font-black cursor-pointer'
                          : 'text-slate-200 hover:bg-white/10 hover:text-white font-bold cursor-pointer'
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>

              {/* ── Time Picker Section ── */}
              <div className="mt-3 pt-3 border-t border-white/10 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-secondary uppercase flex items-center gap-1.5">
                    <Clock size={12} /> Select Time
                  </span>

                  {/* AM / PM Toggle */}
                  <div className="inline-flex rounded-xl bg-surface border border-subtle p-0.5 text-[10px]">
                    <button
                      type="button"
                      onClick={() => setSelectedPeriod('AM')}
                      className={`px-3 py-1 rounded-lg transition-colors font-bold cursor-pointer ${
                        selectedPeriod === 'AM'
                          ? 'bg-brand-500 text-white shadow-sm'
                          : 'text-secondary hover:text-white'
                      }`}
                    >
                      AM
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPeriod('PM')}
                      className={`px-3 py-1 rounded-lg transition-colors font-bold cursor-pointer ${
                        selectedPeriod === 'PM'
                          ? 'bg-brand-500 text-white shadow-sm'
                          : 'text-secondary hover:text-white'
                      }`}
                    >
                      PM
                    </button>
                  </div>
                </div>

                {/* Hour & Minute Selectors */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <select
                      value={selectedHour}
                      onChange={(e) => setSelectedHour(Number(e.target.value))}
                      className="px-3 py-1.5 rounded-xl bg-surface border border-subtle text-white font-mono font-bold text-xs focus:outline-none focus:border-brand-500 cursor-pointer"
                    >
                      {Array.from({ length: 12 }).map((_, i) => {
                        const h = i + 1;
                        return (
                          <option key={h} value={h}>
                            {String(h).padStart(2, '0')}
                          </option>
                        );
                      })}
                    </select>

                    <span className="text-white font-black">:</span>

                    <select
                      value={selectedMinute}
                      onChange={(e) => setSelectedMinute(Number(e.target.value))}
                      className="px-3 py-1.5 rounded-xl bg-surface border border-subtle text-white font-mono font-bold text-xs focus:outline-none focus:border-brand-500 cursor-pointer"
                    >
                      {Array.from({ length: 12 }).map((_, i) => {
                        const m = i * 5;
                        return (
                          <option key={m} value={m}>
                            {String(m).padStart(2, '0')}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Presets */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={(e) => setQuickPreset('now', e)}
                      className="px-2.5 py-1.5 rounded-xl bg-surface hover:bg-white/10 text-[10px] text-secondary hover:text-white border border-subtle cursor-pointer font-bold transition-colors"
                    >
                      Now
                    </button>
                    <button
                      type="button"
                      onClick={(e) => setQuickPreset('plus1d', e)}
                      className="px-2.5 py-1.5 rounded-xl bg-surface hover:bg-white/10 text-[10px] text-secondary hover:text-white border border-subtle cursor-pointer font-bold transition-colors"
                    >
                      +1d
                    </button>
                  </div>
                </div>
              </div>

              {/* ── Footer Actions ── */}
              <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 rounded-xl bg-surface hover:bg-white/5 border border-subtle text-secondary hover:text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleApply}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-bold text-xs shadow-md shadow-brand-500/20 transition-all cursor-pointer"
                >
                  <Check size={13} />
                  <span>Apply Date & Time</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
