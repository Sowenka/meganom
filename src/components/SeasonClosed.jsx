import { Link } from 'react-router-dom';
import { FiLock } from 'react-icons/fi';
import PropTypes from 'prop-types';
import { cn } from '@/lib/utils';

// Декоративный «призрак» формы под стеклом — только визуальный фон, не интерактивный.
function FormGhost() {
  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_360px] lg:items-start">
      <div className="space-y-5">
        <div className="h-7 w-56 rounded-lg bg-bg-dark/70" />
        <div className="h-12 w-full rounded-lg bg-bg-dark/50" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-12 rounded-lg bg-bg-dark/50" />
          <div className="h-12 rounded-lg bg-bg-dark/50" />
        </div>
        <div className="h-12 w-44 rounded-lg bg-bg-dark/50" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-12 rounded-lg bg-bg-dark/50" />
          <div className="h-12 rounded-lg bg-bg-dark/50" />
        </div>
        <div className="h-24 w-full rounded-lg bg-bg-dark/50" />
        <div className="h-12 w-full rounded-xl bg-accent/40" />
      </div>
      <div className="rounded-2xl border border-bg-dark bg-white p-6 shadow-sm">
        <div className="mb-5 h-6 w-32 rounded bg-bg-dark/60" />
        <div className="mb-4 h-40 w-full rounded-xl bg-bg-dark/40" />
        <div className="mb-2 h-4 w-3/4 rounded bg-bg-dark/40" />
        <div className="mb-6 h-4 w-1/2 rounded bg-bg-dark/40" />
        <div className="h-12 w-full rounded-xl bg-accent/40" />
      </div>
    </div>
  );
}

/**
 * Заглушка «сезон закрыт» в стиле glassmorphism: размытый призрак формы на фоне
 * и матовая стеклянная карточка с сообщением и кнопкой поверх него.
 */
export function SeasonClosed({ badge, title, text, ctaLabel, ctaTo, className }) {
  return (
    <div className={cn('relative isolate max-h-[640px] min-h-[480px] overflow-hidden rounded-3xl', className)}>
      {/* Размытый фон — без взаимодействия и скрыт от скринридера */}
      <div aria-hidden className="pointer-events-none select-none opacity-60 blur-sm">
        <FormGhost />
      </div>

      {/* Матовая стеклянная карточка */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-md rounded-3xl border border-white/50 bg-white/65 p-8 text-center shadow-xl backdrop-blur-xl sm:p-10">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <FiLock className="h-6 w-6" />
          </div>
          {badge && (
            <span className="mb-3 inline-block rounded-full border border-accent/50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              {badge}
            </span>
          )}
          <h2 className="mb-3 font-serif text-2xl font-bold text-primary">{title}</h2>
          <p className="mb-7 text-sm leading-relaxed text-text-muted">{text}</p>
          <Link
            to={ctaTo}
            className="inline-flex items-center justify-center rounded-full bg-accent px-7 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-warm"
          >
            {ctaLabel}
          </Link>
        </div>
      </div>
    </div>
  );
}

SeasonClosed.propTypes = {
  badge: PropTypes.string,
  title: PropTypes.string.isRequired,
  text: PropTypes.string.isRequired,
  ctaLabel: PropTypes.string.isRequired,
  ctaTo: PropTypes.string.isRequired,
  className: PropTypes.string,
};
