import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Input, Button } from '@/components/ui';
import { loginSchema } from '@/lib/validators';
import { signIn } from '@/services/auth.service';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onInvalid = useCallback((fieldErrors) => {
    const firstError = Object.values(fieldErrors).find((e) => e?.message);
    if (firstError) toast.error(firstError.message);
  }, []);

  async function onSubmit(data) {
    try {
      await signIn(data);
      toast.success(t('auth.login.success'));
      navigate('/profile');
    } catch (err) {
      const msg = err?.message === 'Invalid login credentials'
        ? t('auth.login.errorInvalidCredentials')
        : t('auth.login.errorGeneral');
      toast.error(msg);
    }
  }

  return (
    <>
      <h1 className="mb-6 text-center font-serif text-2xl font-bold text-primary">
        {t('auth.login.title')}
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        className="flex flex-col gap-4"
        noValidate
      >
        <Input
          label={t('auth.login.email')}
          type="email"
          placeholder={t('auth.login.emailPlaceholder')}
          error={errors.email?.message}
          {...register('email')}
        />
        <Input
          label={t('auth.login.password')}
          type="password"
          placeholder={t('auth.login.passwordPlaceholder')}
          error={errors.password?.message}
          {...register('password')}
        />

        <Button type="submit" loading={isSubmitting} className="mt-2 w-full">
          {isSubmitting ? t('auth.login.submitting') : t('auth.login.submit')}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-text-muted">
        {t('auth.login.noAccount')}{' '}
        <Link to="/auth/register" className="font-medium text-primary hover:text-primary-light">
          {t('auth.login.register')}
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
