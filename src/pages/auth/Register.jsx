import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Input, Button } from '@/components/ui';
import { registerSchema } from '@/lib/validators';
import { signUp } from '@/services/auth.service';

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' },
  });

  const onInvalid = useCallback((fieldErrors) => {
    const firstError = Object.values(fieldErrors).find((e) => e?.message);
    if (firstError) toast.error(firstError.message);
  }, []);

  async function onSubmit(data) {
    try {
      const result = await signUp(data);
      if (result.user && !result.session) {
        toast.success(t('auth.register.successConfirm'));
        navigate('/auth/login');
      } else {
        toast.success(t('auth.register.success'));
        navigate('/profile');
      }
    } catch (err) {
      const msg = err?.message === 'User already registered'
        ? t('auth.register.errorAlreadyRegistered')
        : t('auth.register.errorGeneral');
      toast.error(msg);
    }
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
          {...register('fullName')}
        />
        <Input
          label={t('auth.register.email')}
          type="email"
          placeholder={t('auth.register.emailPlaceholder')}
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label={t('auth.register.password')}
          type="password"
          placeholder={t('auth.register.passwordPlaceholder')}
          error={errors.password?.message}
          {...register('password')}
        />
        <Input
          label={t('auth.register.confirmPassword')}
          type="password"
          placeholder={t('auth.register.confirmPasswordPlaceholder')}
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />

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
          На главную
        </Link>
      </div>
    </>
  );
}
