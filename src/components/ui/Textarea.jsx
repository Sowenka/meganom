import { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/lib/utils';

export const Textarea = forwardRef(function Textarea(
  { label, error, className, id, rows = 5, ...rest },
  ref,
) {
  const textareaId = id || rest.name;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={textareaId}
          className="text-sm font-medium text-text"
        >
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={textareaId}
        rows={rows}
        className={cn(
          'rounded-lg border border-bg-dark bg-white px-4 py-2.5 text-text transition-colors',
          'placeholder:text-text-muted',
          'focus:border-accent focus:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'resize-y',
          error && 'border-error focus:border-error',
          className,
        )}
        aria-invalid={error ? 'true' : undefined}
        {...rest}
      />
    </div>
  );
});

Textarea.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  className: PropTypes.string,
  id: PropTypes.string,
  rows: PropTypes.number,
};
