import { useController } from 'react-hook-form';
import { IMaskInput } from 'react-imask';
import PropTypes from 'prop-types';
import { cn } from '@/lib/utils';

export function PhoneInput({ label, error, className, name, control, ...rest }) {
  const inputId = name;

  const {
    field: { onChange, value },
  } = useController({ name, control, defaultValue: '' });

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-text">
          {label}
        </label>
      )}
      <IMaskInput
        id={inputId}
        mask="+{7} (000) 000-00-00"
        value={value}
        unmask={false}
        onAccept={(val) => onChange(val)}
        placeholder="+7 (___) ___-__-__"
        type="tel"
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
}

PhoneInput.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  className: PropTypes.string,
  name: PropTypes.string.isRequired,
  control: PropTypes.object.isRequired,
};
