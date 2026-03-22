import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

/**
 * StableText — keeps button width equal to RU text length regardless of active language.
 * Uses CSS grid stacking: invisible RU spacer + visible current-language text in same cell.
 */
export function StableText({ tKey }) {
  const { t, i18n } = useTranslation();
  const ruText = i18n.getFixedT('ru')(tKey);
  return (
    <span className="inline-grid justify-items-center">
      <span className="invisible col-start-1 row-start-1 select-none" aria-hidden>{ruText}</span>
      <span className="col-start-1 row-start-1">{t(tKey)}</span>
    </span>
  );
}

StableText.propTypes = { tKey: PropTypes.string.isRequired };

const variants = {
  primary:
    'bg-primary text-white hover:bg-primary-light active:bg-primary',
  secondary:
    'bg-accent text-white hover:bg-accent-warm active:bg-accent',
  ghost:
    'bg-transparent text-primary hover:bg-primary/5 active:bg-primary/10',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-base',
  lg: 'px-7 py-3.5 text-lg',
};

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  className,
  children,
  ...props
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="h-4 w-4 animate-spin"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </button>
  );
}

Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};
