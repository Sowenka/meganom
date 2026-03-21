import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/lib/utils';

export const Input = forwardRef(function Input(
  { label, error, className, id, ...rest },
  ref,
) {
  const inputId = id || rest.name;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium text-text"
        >
          {label}
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
        {...rest}
      />
    </div>
  );
});

Input.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  className: PropTypes.string,
  id: PropTypes.string,
};
