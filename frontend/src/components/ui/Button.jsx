import { forwardRef, isValidElement } from 'react';
import { Loader2 } from 'lucide-react';

const Button = forwardRef(({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  className = '',
  icon: Icon,
  iconPosition = 'left',
  ...props
}, ref) => {
  const sizeClasses = {
    sm: 'px-4 py-2 text-xs rounded-xl font-semibold',
    md: 'px-6 py-3 text-sm rounded-xl font-bold',
    lg: 'px-8 py-4 text-base rounded-2xl font-extrabold',
  };

  const iconSizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7',
  };

  const variantClasses = {
    primary: 'btn-style-filled',
    secondary: 'btn-style-outline-fill',
    ghost: 'btn-style-ghost',
    danger: 'btn-danger',
    glass: 'btn-style-glass',
  };

  const currentIconSize = iconSizeClasses[size] || iconSizeClasses.md;

  const renderIcon = (IconComponent) => {
    if (!IconComponent) return null;
    if (isValidElement(IconComponent)) return IconComponent;
    const Component = IconComponent;
    return <Component className={currentIconSize} />;
  };

  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || isLoading}
      className={`group relative inline-flex items-center justify-center gap-3 select-none overflow-hidden cursor-pointer transition-all duration-300 active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none ${sizeClasses[size] || sizeClasses.md} ${variantClasses[variant] || variantClasses.primary} ${className}`}
      {...props}
    >
      {/* ── Slide Color Fill Background (for outline variant) ─ */}
      {variant === 'secondary' && (
        <span className="btn-slide-fill" aria-hidden="true" />
      )}

      {/* ── Metallic Shimmer Slash (for already filled variant) ── */}
      {variant === 'primary' && (
        <span className="btn-filled-slash" aria-hidden="true" />
      )}

      {/* ── Icon Left ────────────────────────────────────────── */}
      {isLoading ? (
        <Loader2 className={`${currentIconSize} animate-spin text-current flex-shrink-0 relative z-10`} />
      ) : (
        Icon && iconPosition === 'left' && (
          <span className="relative z-10 flex-shrink-0 flex items-center justify-center transition-transform duration-300">
            {renderIcon(Icon)}
          </span>
        )
      )}

      {/* ── Text Content ─────────────────────────────────────── */}
      <span className="relative z-10 flex items-center gap-2 tracking-tight font-[inherit]">{children}</span>

      {/* ── Icon Right ───────────────────────────────────────── */}
      {!isLoading && Icon && iconPosition === 'right' && (
        <span className="relative z-10 flex-shrink-0 flex items-center justify-center transition-transform duration-300">
          {renderIcon(Icon)}
        </span>
      )}
    </button>
  );
});

Button.displayName = 'Button';
export default Button;
