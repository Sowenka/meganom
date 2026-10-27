import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Input, Button } from '@/components/ui';
import { getPendingPassword, verifyEmail } from '@/services/auth.service';
import { useAuthStore } from '@/store/useAuthStore';
import { safeRedirect } from '@/lib/utils';

const verifySchema = z.object({
  code: z
    .string({ required_error: 'Введите код подтверждения' })
    .length(6, 'Код должен содержать 6 цифр')
    .regex(/^\d{6}$/, 'Код должен состоять из 6 цифр'),
  password: z.string().min(1, 'Введите пароль, указанный при регистрации'),
});

export default function Verify() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || '';
  const redirect = safeRedirect(searchParams.get('redirect'), '/profile');
  const setUser = useAuthStore((s) => s.setUser);
  // Сразу после регистрации пароль уже известен; после перезагрузки страницы его спросим.
  const pendingPassword = getPendingPassword(email);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(verifySchema),
    defaultValues: { code: '', password: pendingPassword },
  });

  const onInvalid = useCallback((fieldErrors) => {
    const firstError = Object.values(fieldErrors).find((e) => e?.message);
    if (firstError) toast.error(firstError.message);
  }, []);

  async function onSubmit(data) {
    try {
      const result = await verifyEmail({ email, code: data.code, password: data.password });
      setUser(result.user, result.token);
      toast.success(t('auth.verify.success'));
      navigate(redirect);
    } catch (err) {
      toast.error(err.message || t('auth.verify.errorGeneral'));
    }
  }

  return (
    <>
      <h1 className="mb-2 text-center font-serif text-2xl font-bold text-primary">
        {t('auth.verify.title')}
      </h1>
      {email && (
        <p className="mb-6 text-center text-sm text-text-muted">
          {t('auth.verify.subtitle', { email })}
        </p>
      )}

      <form
        onSubmit={handleSubmit(onSubmit, onInvalid)}
        className="flex flex-col gap-4"
        noValidate
      >
        <Input
          label={t('auth.verify.code')}
          placeholder={t('auth.verify.codePlaceholder')}
          maxLength={6}
          inputMode="numeric"
          autoComplete="one-time-code"
          error={errors.code?.message}
          className="text-center text-2xl font-bold tracking-widest"
          {...register('code')}
        />

        {!pendingPassword && (
          <Input
            type="password"
            label={t('auth.verify.password')}
            placeholder={t('auth.verify.passwordPlaceholder')}
            autoComplete="current-password"
            error={errors.password?.message}
            {...register('password')}
          />
        )}

        <Button type="submit" loading={isSubmitting} className="mt-2 w-full">
          {isSubmitting ? t('auth.verify.submitting') : t('auth.verify.submit')}
        </Button>
      </form>

      <div className="mt-4 border-t border-bg-dark pt-4 text-center">
        <Link to="/auth/register" className="text-sm text-text-muted transition-colors hover:text-primary">
          Зарегистрироваться снова
        </Link>
      </div>
    </>
  );
}
