import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { FiLock } from 'react-icons/fi';
import { Input, PhoneInput, Button } from '@/components/ui';
import { ConsentCheckbox } from '@/components/ConsentCheckbox';
import { registerSchema } from '@/lib/validators';
import { signUp } from '@/services/auth.service';
import { SEASON_OPEN } from '@/lib/constants';

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const raw = searchParams.get('redirect') || '';
  const redirect = raw.startsWith('/') && !raw.startsWith('//') ? raw : '';

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', phone: '', password: '', confirmPassword: '', consentPd: false },
  });

  const onInvalid = useCallback((fieldErrors) => {
    // Show consentPd error last so other field errors take priority
    const order = ['fullName', 'email', 'phone', 'password', 'confirmPassword', 'consentPd'];
    const firstError =
      order.map((k) => fieldErrors[k]).find((e) => e?.message) ??
      Object.values(fieldErrors).find((e) => e?.message);
    if (firstError) toast.error(firstError.message);
  }, []);

  async function onSubmit(data) {
    try {
      const result = await signUp(data);
      if (result.pending) {
        toast.success(t('auth.register.checkEmail'));
        const verifyUrl = `/auth/verify?email=${encodeURIComponent(data.email)}${redirect ? `&redirect=${encodeURIComponent(redirect)}` : ''}`;
        navigate(verifyUrl);
      }
    } catch (err) {
      toast.error(err.message || t('auth.register.errorGeneral'));
    }
  }

  if (!SEASON_OPEN) {
    return (
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <FiLock className="h-6 w-6" />
        </div>
        <h1 className="mb-3 font-serif text-2xl font-bold text-primary">
          {t('season.register.title')}
        </h1>
        <p className="mb-7 text-sm leading-relaxed text-text-muted">
          {t('season.register.text')}
        </p>
        <Link
          to="/contacts"
          className="inline-flex w-full items-center justify-center rounded-lg bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-warm"
        >
          {t('season.register.cta')}
        </Link>
        <div className="mt-4 border-t border-bg-dark pt-4">
          <Link
            to="/auth/login"
            className="text-sm text-text-muted transition-colors hover:text-primary"
          >
            {t('season.register.backToLogin')}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <h1 className="mb-6 text-center font-serif text-2xl font-bold text-primary">
        {t('auth.register.title')}
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        className="flex flex-col gap-4"
        noValidate
      >
        <Input
          label={t('auth.register.fullName')}
          placeholder={t('auth.register.fullNamePlaceholder')}
          error={errors.fullName?.message}
          required
          {...register('fullName')}
        />
        <Input
          label={t('auth.register.email')}
          type="email"
          placeholder={t('auth.register.emailPlaceholder')}
          error={errors.email?.message}
          required
          {...register('email')}
        />
        <PhoneInput
          label={t('auth.register.phone')}
          name="phone"
          control={control}
          error={errors.phone?.message}
          required
        />
        <Input
          label={t('auth.register.password')}
          type="password"
          placeholder={t('auth.register.passwordPlaceholder')}
          error={errors.password?.message}
          required
          {...register('password')}
        />
        <Input
          label={t('auth.register.confirmPassword')}
          type="password"
          placeholder={t('auth.register.confirmPasswordPlaceholder')}
          error={errors.confirmPassword?.message}
          required
          {...register('confirmPassword')}
        />

        <ConsentCheckbox field={register('consentPd')} error={errors.consentPd?.message} />

        <Button type="submit" loading={isSubmitting} className="mt-2 w-full">
          {isSubmitting ? t('auth.register.submitting') : t('auth.register.submit')}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-muted">
        {t('auth.register.hasAccount')}{' '}
        <Link to="/auth/login" className="font-medium text-primary hover:text-primary-light">
          {t('auth.register.login')}
        </Link>
      </p>

      <div className="mt-4 border-t border-bg-dark pt-4 text-center">
        <Link to="/" className="text-sm text-text-muted transition-colors hover:text-primary">
          {t('auth.login.backToHome')}
        </Link>
      </div>
    </>
  );
}
