import { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

const Input = forwardRef(({
  label,
  error,
  icon: Icon,
  className = '',
  wrapperClassName = '',
  id,
  type = 'text',
  required,
  ...props
}, ref) => {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={`space-y-1.5 ${wrapperClassName}`}>
      {label && (
        <label htmlFor={inputId} className="form-label flex items-center justify-between">
          <span>
            {label} {required && <span className="text-red-400">*</span>}
          </span>
        </label>
      )}

      <div className="relative">
        {Icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Icon className="w-4 h-4" />
          </div>
        )}

        <input
          ref={ref}
          id={inputId}
          type={type}
          required={required}
          className={`form-input ${Icon ? 'pl-10' : 'px-4'} ${error ? '!border-red-500/60 !ring-1 !ring-red-500/30' : ''} ${className}`}
          {...props}
        />
      </div>

      {error && (
        <p className="form-error">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{error}</span>
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
