import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { FiUser, FiMail, FiCalendar, FiLogOut } from 'react-icons/fi';
import { Input, PhoneInput, Button } from '@/components/ui';
import { profileSchema } from '@/lib/validators';
import { useAuth } from '@/hooks/useAuth';
import { getProfile, updateProfile, signOut } from '@/services/auth.service';
import { getUserBookings } from '@/services/booking.service';
import { formatPrice, formatDate } from '@/lib/utils';

export default function Profile() {
  const { t } = useTranslation();
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: '', phone: '' },
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth/login');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    getProfile(user.id)
      .then((p) => {
        if (p) {
          setProfile(p);
          reset({ fullName: p.full_name || '', phone: p.phone || '' });
        }
      })
      .catch(() => {});
    getUserBookings(user.id)
      .then(setBookings)
      .catch(() => {});
  }, [user, reset]);

  const onInvalid = useCallback((fieldErrors) => {
    const firstError = Object.values(fieldErrors).find((e) => e?.message);
    if (firstError) toast.error(firstError.message);
  }, []);

  async function onSubmit(data) {
    try {
      const updated = await updateProfile(user.id, {
        full_name: data.fullName,
        phone: data.phone || null,
      });
      setProfile(updated);
      setIsEditing(false);
      toast.success(t('profile.updateSuccess'));
    } catch {
      toast.error(t('profile.updateError'));
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
      toast.success(t('profile.signOutSuccess'));
      navigate('/');
    } catch {
      toast.error(t('profile.signOutError'));
    }
  }

  if (authLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  const bookingStatuses = {
    pending: t('profile.bookings.pending'),
    confirmed: t('profile.bookings.confirmed'),
    cancelled: t('profile.bookings.cancelled'),
    completed: t('profile.bookings.completed'),
  };

  const bookingStatusColors = {
    confirmed: 'bg-success/10 text-success',
    cancelled: 'bg-error/10 text-error',
    pending: 'bg-warning/10 text-warning',
    completed: 'bg-primary/10 text-primary',
  };

  return (
    <section className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="mb-8 font-serif text-4xl font-bold text-primary">
        {t('profile.title')}
      </h1>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Profile card */}
        <div className="rounded-2xl border border-bg-dark bg-white p-6 shadow-sm lg:col-span-1">
          <div className="mb-6 flex flex-col items-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
              <FiUser className="h-8 w-8" />
            </div>
            <h2 className="mt-4 text-lg font-semibold text-text">
              {profile?.full_name || t('profile.guest')}
            </h2>
            <p className="flex items-center gap-1.5 text-sm text-text-muted">
              <FiMail className="h-3.5 w-3.5" />
              {user.email}
            </p>
          </div>

          {!isEditing ? (
            <div className="flex flex-col gap-3">
              <div className="text-sm">
                <span className="text-text-muted">{t('profile.phone')}: </span>
                <span className="text-text">{profile?.phone || t('common.notSpecified')}</span>
              </div>
              <div className="text-sm">
                <span className="text-text-muted">{t('profile.registrationDate')}: </span>
                <span className="text-text">
                  {profile?.created_at ? formatDate(profile.created_at) : '—'}
                </span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="mt-2"
                onClick={() => setIsEditing(true)}
              >
                {t('profile.editProfile')}
              </Button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit(onSubmit, onInvalid)}
              className="flex flex-col gap-4"
              noValidate
            >
              <Input
                label={t('profile.name')}
                placeholder={t('profile.namePlaceholder')}
                error={errors.fullName?.message}
                {...register('fullName')}
              />
              <PhoneInput
                label={t('profile.phone')}
                name="phone"
                control={control}
                error={errors.phone?.message}
              />
              <div className="flex gap-2">
                <Button type="submit" size="sm" loading={isSubmitting}>
                  {t('common.save')}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsEditing(false);
                    reset({ fullName: profile?.full_name || '', phone: profile?.phone || '' });
                  }}
                >
                  {t('common.cancel')}
                </Button>
              </div>
            </form>
          )}

          <button
            type="button"
            onClick={handleSignOut}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-error/20 px-4 py-2 text-sm text-error transition-colors hover:bg-error/5"
          >
            <FiLogOut className="h-4 w-4" />
            {t('profile.signOut')}
          </button>
        </div>

        {/* Bookings */}
        <div className="lg:col-span-2">
          <h2 className="mb-4 font-serif text-2xl font-bold text-primary">
            {t('profile.bookings.title')}
          </h2>

          {bookings.length === 0 ? (
            <div className="rounded-2xl border border-bg-dark bg-white p-8 text-center">
              <FiCalendar className="mx-auto mb-3 h-10 w-10 text-text-muted" />
              <p className="text-text-muted">{t('profile.bookings.empty')}</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="rounded-2xl border border-bg-dark bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-semibold text-text">
                        {booking.rooms?.title || t('profile.bookings.room')}
                      </h3>
                      <p className="mt-1 text-sm text-text-muted">
                        {formatDate(booking.check_in)} — {formatDate(booking.check_out)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">
                        {formatPrice(booking.total_price)}
                      </p>
                      <span className={
                        'mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ' +
                        (bookingStatusColors[booking.status] || 'bg-bg-dark text-text-muted')
                      }>
                        {bookingStatuses[booking.status] || booking.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
