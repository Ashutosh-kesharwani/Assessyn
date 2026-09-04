export default function Badge({
  children,
  variant = 'brand',
  icon: Icon,
  className = '',
  ...props
}) {
  const variantClasses = {
    brand: 'badge-brand',
    success: 'badge-success',
    warning: 'badge-warning',
    danger: 'badge-danger',
    slate: 'badge-slate',
  };

  return (
    <span className={`badge ${variantClasses[variant] || variantClasses.brand} ${className}`} {...props}>
      {Icon && <Icon className="w-3 h-3 flex-shrink-0" />}
      <span>{children}</span>
    </span>
  );
}
