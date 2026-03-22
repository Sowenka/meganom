import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';
import PropTypes from 'prop-types';

export function Logo({ className = '', dark = false }) {
  const { t } = useTranslation();

  return (
    <Link to="/" className={cn('flex items-center gap-3 no-underline', className)}>
      {/* Square with letter */}
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center border text-lg font-bold',
          dark
            ? 'border-primary/40 text-primary'
            : 'border-white/70 text-white',
        )}
      >
        {t('logo.letter')}
      </div>

      {/* Text block */}
      <div className="flex flex-col leading-none">
        <span
          className={cn(
            'mb-0.5 text-[9px] font-medium uppercase tracking-[0.25em]',
            dark ? 'text-primary/60' : 'text-white/60',
          )}
        >
          {t('logo.tagline')}
        </span>
        <span
          className={cn(
            'text-xl font-bold uppercase tracking-[0.12em]',
            dark ? 'text-primary' : 'text-white',
          )}
        >
          {t('logo.name')}
        </span>
      </div>
    </Link>
  );
}

Logo.propTypes = {
  className: PropTypes.string,
  dark: PropTypes.bool,
};
