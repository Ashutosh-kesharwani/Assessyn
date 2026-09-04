import { forwardRef } from 'react';
import { AlertCircle } from 'lucide-react';

const Textarea = forwardRef(({
  label,
  error,
  helperText,
  className = '',
  wrapperClassName = '',
  id,
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

      <textarea
        ref={ref}
        id={inputId}
        required={required}
        className={`form-textarea ${error ? '!border-red-500/60 !ring-1 !ring-red-500/30' : ''} ${className}`}
        {...props}
      />

      <div className="flex items-center justify-between text-xs">
        {error ? (
          <p className="form-error !mt-0">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p className="text-slate-500">{helperText}</p>
        ) : <span />}
      </div>
    </div>
  );
});

Textarea.displayName = 'Textarea';
export default Textarea;
