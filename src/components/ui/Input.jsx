import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/lib/utils';

export const Input = forwardRef(function Input(
  { label, error, className, id, required, ...rest },
  ref,
) {
  const inputId = id || rest.name;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="flex items-center gap-1 text-sm font-medium text-text"
        >
          {label}
          {required && <span className="text-accent" aria-hidden="true">*</span>}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={cn(
          'rounded-lg border border-bg-dark bg-white px-4 py-2.5 text-text transition-colors',
          'placeholder:text-text-muted',
          'focus:border-accent focus:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-error focus:border-error',
          className,
        )}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={error ? `${inputId}-error` : undefined}
        {...rest}
      />
      {error && (
        <p id={`${inputId}-error`} className="text-xs text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
});

Input.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  className: PropTypes.string,
  id: PropTypes.string,
  required: PropTypes.bool,
};
