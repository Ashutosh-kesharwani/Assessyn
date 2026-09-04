export default function Card({
  children,
  variant = 'default',
  hover = false,
  className = '',
  ...props
}) {
  const variantClass = variant === 'glass' ? 'card-glass' : 'card';
  const hoverClass = hover ? 'card-hover' : '';

  return (
    <div className={`${variantClass} ${hoverClass} ${className}`} {...props}>
      {children}
    </div>
  );
}
