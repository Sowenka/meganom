import { useEffect, useState, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import PropTypes from 'prop-types';
import Cropper from 'react-easy-crop';
import { AnimatePresence, motion } from 'framer-motion';
import {
  FiLogOut, FiEdit2, FiCalendar, FiUsers,
  FiHome, FiPhone, FiMail, FiMoon, FiCamera, FiCheck, FiX,
} from 'react-icons/fi';
import { Input, PhoneInput, Button } from '@/components/ui';
import { profileSchema } from '@/lib/validators';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/useAuthStore';
import { getProfile, updateProfile, signOut, uploadAvatar } from '@/services/auth.service';
import { getUserBookings } from '@/services/booking.service';
import { formatPrice, formatDate, cn } from '@/lib/utils';

// ── Sub-components ─────────────────────────────────────────────────────────────

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <span className="mt-0.5 shrink-0 text-text-muted">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-text-muted">{label}</p>
        <p className="truncate text-text">{value}</p>
      </div>
    </div>
  );
}

InfoRow.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
};

function StatCard({ value, label }) {
  return (
    <div className="rounded-2xl border border-bg-dark bg-white p-4 text-center shadow-sm">
      <p className="font-serif text-2xl font-bold text-primary">{value}</p>
      <p className="mt-0.5 text-xs text-text-muted">{label}</p>
    </div>
  );
}

StatCard.propTypes = {
  value: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
};

// ── Status / payment configs ───────────────────────────────────────────────────

const STATUS_CONFIG = {
  pending:   { label: 'Ожидает подтверждения', cls: 'bg-warning/10 text-warning   border-warning/20' },
  confirmed: { label: 'Подтверждено',          cls: 'bg-success/10 text-success   border-success/20' },
  cancelled: { label: 'Отменено',              cls: 'bg-error/10   text-error     border-error/20'   },
  completed: { label: 'Завершено',             cls: 'bg-primary/10 text-primary   border-primary/20' },
};

const PAYMENT_CONFIG = {
  unpaid:   { label: 'Не оплачено', cls: 'text-warning'    },
  paid:     { label: 'Оплачено',    cls: 'text-success'    },
  refunded: { label: 'Возврат',     cls: 'text-text-muted' },
};

// ── Crop helpers ───────────────────────────────────────────────────────────────

async function getCroppedBlob(imageSrc, croppedAreaPixels) {
  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageSrc;
  });

  const canvas = document.createElement('canvas');
  const size = 400; // output size 400×400
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0, 0, size, size,
  );

  return new Promise((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', 0.92),
  );
}

// ── CropModal ──────────────────────────────────────────────────────────────────

function CropModal({ src, onConfirm, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm"
    >
      {/* Header */}
      <div className="relative mb-4 w-full max-w-sm px-4 text-center">
        <p className="text-sm font-medium text-white/70">Переместите и масштабируйте фото</p>
      </div>

      {/* Crop area */}
      <div className="relative h-72 w-72 overflow-hidden rounded-full shadow-2xl sm:h-80 sm:w-80">
        <Cropper
          image={src}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="round"
          showGrid={false}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
          style={{
            containerStyle: { borderRadius: '9999px' },
            mediaStyle: {},
          }}
        />
      </div>

      {/* Zoom slider */}
      <div className="mt-6 w-64">
        <input
          type="range"
          min={1}
          max={3}
          step={0.01}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="w-full cursor-pointer accent-accent"
        />
      </div>

      {/* Buttons */}
      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-white/20 text-white/70 transition-colors hover:border-white/40 hover:text-white"
        >
          <FiX className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => onConfirm(croppedAreaPixels)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-accent text-white transition-colors hover:bg-accent-warm"
        >
          <FiCheck className="h-5 w-5" />
        </button>
      </div>
    </motion.div>
  );
}

CropModal.propTypes = {
  src: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
};

// ── Main component ─────────────────────────────────────────────────────────────

export default function Profile() {
  const { t } = useTranslation();
  const { user, isLoading: authLoading } = useAuth();
  const clearUser = useAuthStore((s) => s.clearUser);
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarVersion, setAvatarVersion] = useState(1);
  const [cropSrc, setCropSrc] = useState(null);
  const fileInputRef = useRef(null);

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
    if (!authLoading && !user) navigate('/auth/login');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;

    getProfile()
      .then((p) => {
        if (p) {
          setProfile(p);
          reset({ fullName: p.full_name || p.name || '', phone: p.phone || '' });
        }
      })
      .catch(() => {});

    getUserBookings()
      .then(setBookings)
      .catch(() => {})
      .finally(() => setBookingsLoading(false));
  }, [user, reset]);

  const onInvalid = useCallback((fieldErrors) => {
    const firstError = Object.values(fieldErrors).find((e) => e?.message);
    if (firstError) toast.error(firstError.message);
  }, []);

  async function onSubmit(data) {
    try {
      const updated = await updateProfile({ name: data.fullName, phone: data.phone || '' });
      setProfile(updated);
      setIsEditing(false);
      toast.success(t('profile.updateSuccess'));
    } catch {
      toast.error(t('profile.updateError'));
    }
  }

  function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const reader = new FileReader();
    reader.onload = (ev) => setCropSrc(ev.target.result);
    reader.readAsDataURL(file);
  }

  async function handleCropConfirm(croppedAreaPixels) {
    if (!cropSrc || !croppedAreaPixels) return;
    const src = cropSrc;
    setCropSrc(null);

    let blob;
    try {
      blob = await getCroppedBlob(src, croppedAreaPixels);
    } catch {
      toast.error('Не удалось обработать фото');
      return;
    }

    const previewUrl = URL.createObjectURL(blob);
    setAvatarPreview(previewUrl);
    setAvatarUploading(true);

    try {
      const file = new File([blob], 'avatar.jpg', { type: 'image/jpeg' });
      const result = await uploadAvatar(file);
      setProfile((prev) => ({ ...prev, avatar_url: result.avatar_url }));
      setAvatarVersion((v) => v + 1);
      toast.success('Фото профиля обновлено');
    } catch (err) {
      toast.error(err.message || 'Не удалось загрузить фото');
    } finally {
      setAvatarPreview(null);
      setAvatarUploading(false);
      URL.revokeObjectURL(previewUrl);
    }
  }

  function handleCropCancel() {
    setCropSrc(null);
  }

  async function handleSignOut() {
    await signOut();
    clearUser();
    toast.success(t('profile.signOutSuccess'));
    navigate('/');
  }

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  const displayName = profile?.full_name || profile?.name || user.name || t('profile.guest');
  const initial = displayName.charAt(0).toUpperCase();

  const today = new Date().toISOString().split('T')[0];
  const upcoming = bookings.filter((b) => b.check_in >= today && b.status !== 'cancelled');
  const completed = bookings.filter((b) => b.status === 'completed');

  return (
    <section className="mx-auto max-w-5xl px-4 py-10 md:py-14">

      {/* Page header */}
      <div className="mb-8">
        <p className="text-sm font-medium uppercase tracking-widest text-accent">
          {t('profile.title')}
        </p>
        <h1 className="mt-1 font-serif text-3xl font-bold text-primary md:text-4xl">
          {displayName}
        </h1>
      </div>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-3 gap-3 md:gap-4">
        <StatCard value={bookings.length} label="Всего броней" />
        <StatCard value={upcoming.length} label="Предстоящих" />
        <StatCard value={completed.length} label="Завершённых" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">

        {/* ── User card ──────────────────────────────────────────────────────── */}
        <div className="lg:col-span-1">
          <div className="overflow-hidden rounded-2xl border border-bg-dark bg-white shadow-sm">

            {/* Avatar strip */}
            <div className="bg-primary px-6 py-8 text-center">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="group relative mx-auto block h-20 w-20 cursor-pointer"
                title="Изменить фото"
              >
                {(avatarPreview || profile?.avatar_url) ? (
                  <img
                    src={avatarPreview || `${profile.avatar_url}?v=${avatarVersion}`}
                    alt={displayName}
                    className="h-20 w-20 rounded-full object-cover ring-4 ring-white/20"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/15 text-3xl font-bold text-white ring-4 ring-white/20">
                    {initial}
                  </div>
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                  {avatarUploading
                    ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    : <FiCamera className="h-5 w-5 text-white" />
                  }
                </div>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <h2 className="mt-3 text-lg font-semibold text-white">{displayName}</h2>
              <p className="mt-0.5 text-xs text-white/50">Нажмите на фото чтобы изменить</p>
              <span className={cn(
                'mt-1.5 inline-block rounded-full px-3 py-0.5 text-xs font-medium text-white',
                user.role === 'admin' ? 'bg-accent/90' : 'bg-white/20',
              )}>
                {user.role === 'admin' ? 'Администратор' : 'Гость'}
              </span>
            </div>

            {/* Info / edit */}
            <div className="p-5">
              {!isEditing ? (
                <div className="flex flex-col gap-4">
                  <InfoRow icon={<FiMail className="h-4 w-4" />} label="Email" value={user.email} />
                  <InfoRow
                    icon={<FiPhone className="h-4 w-4" />}
                    label={t('profile.phone')}
                    value={profile?.phone || '—'}
                  />
                  <InfoRow
                    icon={<FiCalendar className="h-4 w-4" />}
                    label={t('profile.registrationDate')}
                    value={profile?.created_at ? formatDate(profile.created_at) : '—'}
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-1 w-full gap-2"
                    onClick={() => setIsEditing(true)}
                  >
                    <FiEdit2 className="h-3.5 w-3.5" />
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
                    <Button type="submit" size="sm" loading={isSubmitting} className="flex-1">
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

              <div className="mt-5 border-t border-bg-dark pt-4">
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm text-error transition-colors hover:bg-error/5"
                >
                  <FiLogOut className="h-4 w-4" />
                  {t('profile.signOut')}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Bookings ───────────────────────────────────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-serif text-2xl font-bold text-primary">
              {t('profile.bookings.title')}
            </h2>
            <Link
              to="/rooms"
              className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              <FiHome className="h-3.5 w-3.5" />
              Забронировать
            </Link>
          </div>

          {bookingsLoading ? (
            <div className="flex items-center justify-center rounded-2xl border border-bg-dark bg-white py-20">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="rounded-2xl border border-bg-dark bg-white p-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-bg-dark">
                <FiCalendar className="h-7 w-7 text-text-muted" />
              </div>
              <p className="mb-1 font-serif text-lg font-semibold text-primary">
                Ещё нет броней
              </p>
              <p className="mb-6 text-sm text-text-muted">
                {t('profile.bookings.empty')}
              </p>
              <Link
                to="/rooms"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
              >
                <FiHome className="h-4 w-4" />
                Выбрать домик
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {bookings.map((booking) => {
                const status = STATUS_CONFIG[booking.status] ?? {
                  label: booking.status,
                  cls: 'bg-bg-dark text-text-muted border-bg-dark',
                };
                const payment = PAYMENT_CONFIG[booking.payment_status];
                const bookingNum = booking.booking_number
                  ? `№${String(booking.booking_number).padStart(4, '0')}`
                  : `#${booking.id.substring(0, 8).toUpperCase()}`;
                const nights = booking.nights
                  || Math.round(
                    (new Date(booking.check_out) - new Date(booking.check_in)) / 86_400_000,
                  );

                return (
                  <div
                    key={booking.id}
                    className="overflow-hidden rounded-2xl border border-bg-dark bg-white shadow-sm"
                  >
                    {/* Card header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-bg-dark bg-bg px-5 py-3">
                      <div className="flex items-center gap-2">
                        <FiHome className="h-4 w-4 text-accent" />
                        <span className="font-semibold text-text">
                          {booking.room_title || t('profile.bookings.room')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-text-muted">Заказ {bookingNum}</span>
                        <span className={cn(
                          'rounded-full border px-2.5 py-0.5 text-xs font-medium',
                          status.cls,
                        )}>
                          {status.label}
                        </span>
                      </div>
                    </div>

                    {/* Card body */}
                    <div className="grid grid-cols-2 gap-4 p-5 sm:grid-cols-4">
                      <div>
                        <p className="mb-1 text-xs uppercase tracking-wider text-text-muted">
                          Заезд
                        </p>
                        <p className="font-medium text-text">{formatDate(booking.check_in)}</p>
                        <p className="text-xs text-text-muted">с 14:00</p>
                      </div>

                      <div>
                        <p className="mb-1 text-xs uppercase tracking-wider text-text-muted">
                          Выезд
                        </p>
                        <p className="font-medium text-text">{formatDate(booking.check_out)}</p>
                        <p className="text-xs text-text-muted">до 12:00</p>
                      </div>

                      <div>
                        <p className="mb-1 text-xs uppercase tracking-wider text-text-muted">
                          Детали
                        </p>
                        <p className="flex items-center gap-1 text-sm text-text">
                          <FiMoon className="h-3.5 w-3.5 text-accent" />
                          {nights} {nights === 1 ? 'ночь' : nights < 5 ? 'ночи' : 'ночей'}
                        </p>
                        <p className="flex items-center gap-1 text-sm text-text">
                          <FiUsers className="h-3.5 w-3.5 text-accent" />
                          {booking.guests_count} {booking.guests_count === 1 ? 'гость' : 'гостей'}
                        </p>
                      </div>

                      <div className="text-right sm:text-left">
                        <p className="mb-1 text-xs uppercase tracking-wider text-text-muted">
                          Сумма
                        </p>
                        <p className="font-serif text-lg font-bold text-primary">
                          {formatPrice(booking.total_price)}
                        </p>
                        {payment && (
                          <p className={cn('text-xs', payment.cls)}>{payment.label}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {cropSrc && (
          <CropModal
            src={cropSrc}
            onConfirm={handleCropConfirm}
            onCancel={handleCropCancel}
          />
        )}
      </AnimatePresence>
    </section>
  );
}
