import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import { cn } from '@/lib/utils';
import { OPERATOR } from '@/data/legal';

/**
 * Реквизиты оператора персональных данных (152-ФЗ).
 * Единый блок для Политики конфиденциальности и Согласия - источник данных
 * один: OPERATOR из `src/data/legal.js`. Незаполненные поля не выводятся.
 */
export function OperatorDetails({ className }) {
  const { t } = useTranslation();

  const rows = [
    [t('legal.operatorName'), OPERATOR.brand],
    [t('legal.operatorLegalForm'), OPERATOR.legalForm],
    [t('legal.operatorFullName'), OPERATOR.fullName],
    [t('legal.operatorInn'), OPERATOR.inn],
    [t('legal.operatorOgrn'), OPERATOR.ogrn],
    [t('legal.operatorAddress'), OPERATOR.address],
  ].filter(([, value]) => Boolean(value));

  // Пока регистрационные данные не заполнены, документ должен честно это указывать.
  const registrationPending = !OPERATOR.fullName || !OPERATOR.inn || !OPERATOR.ogrn;

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <ul className="flex list-none flex-col gap-1 pl-0">
        {rows.map(([label, value]) => (
          <li key={label}>
            <strong className="text-text">{label}:</strong> {value}
          </li>
        ))}
        <li>
          <strong className="text-text">{t('legal.operatorEmail')}:</strong>{' '}
          <a
            href={`mailto:${OPERATOR.email}`}
            className="text-accent transition-colors hover:text-primary"
          >
            {OPERATOR.email}
          </a>
        </li>
        {OPERATOR.phone && (
          <li>
            <strong className="text-text">{t('legal.operatorPhone')}:</strong>{' '}
            <a
              href={OPERATOR.phoneHref}
              className="text-accent transition-colors hover:text-primary"
            >
              {OPERATOR.phone}
            </a>
          </li>
        )}
      </ul>
      {registrationPending && (
        <p className="text-sm text-text-muted/80">{t('legal.operatorPending')}</p>
      )}
    </div>
  );
}

OperatorDetails.propTypes = {
  className: PropTypes.string,
};
