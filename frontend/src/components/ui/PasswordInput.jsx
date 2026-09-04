import { useState, forwardRef } from 'react';
import { Lock, Eye, EyeOff, AlertCircle } from 'lucide-react';

/**
 * =========================================================================
 * 🔐 REUSABLE PASSWORD INPUT COMPONENT
 * =========================================================================
 * - Show / Hide password visibility toggle
 * - Clean Shinobi / Katana styling matching the design system
 * - Compatible with react-hook-form (via ref forwarding) & standard props
 * - Optional password strength indicator
 * =========================================================================
 */
const PasswordInput = forwardRef(({
  label,
  error,
  icon: Icon = Lock,
  placeholder = '••••••••••••',
  className = '',
  wrapperClassName = '',
  id,
  required = false,
  showStrength = false,
  value,
  helperText,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  // Compute simple strength if requested
  const currentVal = value || props.defaultValue || '';
  const getStrength = (val) => {
    if (!val || typeof val !== 'string') return { score: 0, label: 'Empty', color: 'bg-slate-700' };
    let score = 0;
    if (val.length >= 8) score++;
    if (/[A-Z]/.test(val)) score++;
    if (/[0-9]/.test(val)) score++;
    if (/[^A-Za-z0-9]/.test(val)) score++;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score === 2) return { score: 2, label: 'Moderate', color: 'bg-amber-500' };
    if (score === 3) return { score: 3, label: 'Strong', color: 'bg-emerald-500' };
    return { score: 4, label: 'Very Strong', color: 'bg-brand-400' };
  };

  const strength = showStrength ? getStrength(currentVal) : null;

  return (
    <div className={`space-y-1.5 ${wrapperClassName}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label
            htmlFor={inputId}
            className="block text-xs font-mono font-extrabold uppercase tracking-wider text-secondary"
          >
            <span>{label}</span>
            {required && <span className="text-rose-400 ml-1">*</span>}
          </label>
          {showStrength && strength && currentVal.length > 0 && (
            <span className={`text-[10px] font-mono font-bold ${
              strength.score <= 1 ? 'text-rose-400' : strength.score === 2 ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {strength.label}
            </span>
          )}
        </div>
      )}

      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-4 text-secondary pointer-events-none flex items-center justify-center">
            <Icon className="w-4 h-4 text-brand-400/80" />
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          required={required}
          value={value}
          className={`w-full ${Icon ? 'pl-11' : 'pl-4'} pr-11 py-3.5 rounded-2xl bg-surface border border-subtle text-white placeholder-secondary/60 text-xs sm:text-sm font-mono focus:outline-none focus:border-brand-500/80 focus:ring-1 focus:ring-brand-500/30 transition-all ${
            error ? '!border-rose-500/70 !ring-1 !ring-rose-500/30' : ''
          } ${className}`}
          {...props}
        />

        {/* Visibility Toggle Button */}
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute right-3.5 p-1.5 rounded-xl text-secondary hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          title={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <EyeOff className="w-4 h-4 text-brand-300" />
          ) : (
            <Eye className="w-4 h-4 text-secondary hover:text-white" />
          )}
        </button>
      </div>

      {/* Password Strength Meter (Optional) */}
      {showStrength && currentVal.length > 0 && (
        <div className="flex gap-1.5 pt-1">
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                step <= strength.score ? strength.color : 'bg-surface border border-subtle'
              }`}
            />
          ))}
        </div>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <p className="text-[10.5px] font-mono text-secondary leading-snug">
          {helperText}
        </p>
      )}

      {/* Error Message */}
      {error && (
        <p className="text-xs font-mono text-rose-400 font-bold flex items-center gap-1.5 pt-0.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{typeof error === 'string' ? error : error?.message}</span>
        </p>
      )}
    </div>
  );
});

PasswordInput.displayName = 'PasswordInput';
export default PasswordInput;
