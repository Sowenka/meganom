import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';

/**
 * Чекбокс согласия на обработку персональных данных для форм (152-ФЗ).
 * `field` - результат register('consentPd') из react-hook-form.
 */
export function ConsentCheckbox({ field, error, id = 'consentPd' }) {
  const { t } = useTranslation();

  return (
    <div>
      <label htmlFor={id} className="flex cursor-pointer items-start gap-3 text-sm text-text-muted">
        <input
          id={id}
          type="checkbox"
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer accent-accent"
          {...field}
        />
        <span className="leading-snug">
          {t('common.consent.prefix')}{' '}
          <Link
            to="/consent"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent transition-colors hover:text-accent-warm"
          >
            {t('common.consent.consentLink')}
          </Link>{' '}
          {t('common.consent.middle')}{' '}
          <Link
            to="/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent transition-colors hover:text-accent-warm"
          >
            {t('common.consent.policyLink')}
          </Link>
          .
        </span>
      </label>
      {error && <p className="mt-1.5 text-xs text-error">{error}</p>}
    </div>
  );
}

ConsentCheckbox.propTypes = {
  field: PropTypes.object.isRequired,
  error: PropTypes.string,
  id: PropTypes.string,
};
