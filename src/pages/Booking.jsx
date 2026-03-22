import { forwardRef, useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  FiCalendar, FiUsers, FiMaximize, FiCheckCircle,
  FiMinus, FiPlus, FiPhone,
} from 'react-icons/fi';
import PropTypes from 'prop-types';
import { differenceInCalendarDays, format, addDays, parseISO, isValid } from 'date-fns';
import { ru as ruLocale, enUS } from 'date-fns/locale';
import { useRooms } from '@/hooks/useRooms';
import { createBooking } from '@/services/booking.service';
import { bookingSchema } from '@/lib/validators';
import { formatPrice, cn } from '@/lib/utils';
import { Input, PhoneInput, Textarea } from '@/components/ui';

// ─── DateField ────────────────────────────────────────────────────────────────
const DateField = forwardRef(function DateField({ label, error, ...rest }, ref) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-text">{label}</label>
      <input
        ref={ref}
        type="date"
        className={cn(
          'rounded-lg border border-bg-dark bg-white px-4 py-2.5 text-text transition-colors',
          'focus:border-accent focus:outline-none',
          '[&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:hover:opacity-80',
          error && 'border-error focus:border-error',
        )}
        {...rest}
      />
    </div>
  );
});

DateField.propTypes = {
  label: PropTypes.string.isRequired,
  error: PropTypes.string,
};

// ─── GuestCounter ─────────────────────────────────────────────────────────────
function GuestCounter({ value, max, onChange }) {
  return (
    <div className="inline-flex items-center overflow-hidden rounded-lg border border-bg-dark bg-white">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        aria-label="Уменьшить"
        className="flex h-11 w-11 items-center justify-center text-primary transition-colors hover:bg-bg disabled:cursor-not-allowed disabled:opacity-40"
      >
        <FiMinus className="h-4 w-4" />
      </button>
      <span className="w-14 text-center text-base font-medium text-text">{value}</span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        aria-label="Увеличить"
        className="flex h-11 w-11 items-center justify-center text-primary transition-colors hover:bg-bg disabled:cursor-not-allowed disabled:opacity-40"
      >
        <FiPlus className="h-4 w-4" />
      </button>
    </div>
  );
}

GuestCounter.propTypes = {
  value: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
};

// ─── SectionDivider ───────────────────────────────────────────────────────────
function SectionDivider({ children }) {
  return (
    <div className="my-8 flex items-center gap-4">
      <div className="h-px flex-1 bg-bg-dark" />
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
        {children}
      </span>
      <div className="h-px flex-1 bg-bg-dark" />
    </div>
  );
}

SectionDivider.propTypes = { children: PropTypes.node.isRequired };

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function Booking() {
  const { t, i18n } = useTranslation();
  const [searchParams] = useSearchParams();
  const [submitted, setSubmitted] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);

  const { data: rooms, isLoading: roomsLoading } = useRooms({ isActive: true });

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      roomId: '',
      checkIn: '',
      checkOut: '',
      guestsCount: 2,
      guestName: '',
      guestEmail: '',
      guestPhone: '',
      specialRequests: '',
    },
  });

  const watchRoomId = watch('roomId');
  const watchCheckIn = watch('checkIn');
  const watchCheckOut = watch('checkOut');
  const watchGuests = watch('guestsCount');

  useEffect(() => {
    document.title = `${t('bookingPage.heroTitle')} — Меганом Эко-дом`;
  }, [t]);

  // Pre-select room from URL ?room=slug
  useEffect(() => {
    if (!rooms?.length) return;
    const slug = searchParams.get('room');
    if (!slug) return;
    const room = rooms.find((r) => r.slug === slug);
    if (room) setValue('roomId', room.id);
  }, [rooms, searchParams, setValue]);

  const selectedRoom = rooms?.find((r) => r.id === watchRoomId);
  const coverImg =
    selectedRoom?.room_images?.find((img) => img.is_cover)?.url ??
    selectedRoom?.room_images?.[0]?.url;

  const today = format(new Date(), 'yyyy-MM-dd');
  const minCheckout = watchCheckIn
    ? format(addDays(parseISO(watchCheckIn), 1), 'yyyy-MM-dd')
    : format(addDays(new Date(), 1), 'yyyy-MM-dd');

  const nights =
    watchCheckIn && watchCheckOut && watchCheckOut > watchCheckIn
      ? differenceInCalendarDays(parseISO(watchCheckOut), parseISO(watchCheckIn))
      : 0;
  const total = selectedRoom && nights > 0 ? nights * selectedRoom.price_per_night : 0;

  const dateLocale = i18n.language === 'ru' ? ruLocale : enUS;
  const fmtDate = (str) => {
    if (!str) return '';
    const d = parseISO(str);
    return isValid(d) ? format(d, 'd MMM yyyy', { locale: dateLocale }) : '';
  };

  const onSubmit = async (data) => {
    try {
      await createBooking({ ...data, nights, total });
      setBookingResult({ ...data, nights, total, selectedRoom });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      toast.error(err.message || 'Ошибка при отправке заявки');
    }
  };

  const onError = (errs) => {
    const order = ['roomId', 'checkIn', 'checkOut', 'guestsCount', 'guestName', 'guestEmail', 'specialRequests'];
    const first = order.find((f) => errs[f]);
    if (first) toast.error(errs[first].message);
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (submitted && bookingResult) {
    return (
      <section className="min-h-[70vh] bg-bg py-24">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mx-auto max-w-lg px-6 text-center"
        >
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
            <FiCheckCircle className="h-8 w-8 text-success" />
          </div>
          <h1 className="mb-3 font-serif text-3xl font-bold text-primary">
            {t('bookingPage.successTitle')}
          </h1>
          <p className="mb-8 leading-relaxed text-text-muted">
            {t('bookingPage.successText')}
          </p>

          {/* Booking summary */}
          <div className="mb-6 rounded-2xl border border-bg-dark bg-white p-6 text-left">
            {bookingResult.selectedRoom && (
              <p className="mb-2 font-semibold text-primary">
                {bookingResult.selectedRoom.title}
              </p>
            )}
            {bookingResult.checkIn && bookingResult.checkOut && (
              <p className="text-sm text-text-muted">
                {fmtDate(bookingResult.checkIn)} → {fmtDate(bookingResult.checkOut)}
              </p>
            )}
            <p className="text-sm text-text-muted">
              {t('bookingPage.nights', { count: bookingResult.nights })}
            </p>
            {bookingResult.total > 0 && (
              <p className="mt-3 font-serif text-xl font-bold text-primary">
                {formatPrice(bookingResult.total)}
              </p>
            )}
          </div>

          <p className="mb-1 text-sm text-text-muted">{t('bookingPage.successPhone')}</p>
          <a
            href={`tel:${t('contacts.info.phone1').replace(/\D/g, '+').replace('++', '+')}`}
            className="mb-8 block font-medium text-accent hover:underline"
          >
            {t('contacts.info.phone1')}
          </a>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Link
              to="/rooms"
              className="rounded-full border border-primary px-8 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-white"
            >
              {t('bookingPage.backToRooms')}
            </Link>
            <button
              type="button"
              onClick={() => { setSubmitted(false); setBookingResult(null); }}
              className="rounded-full bg-accent px-8 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-warm"
            >
              {t('bookingPage.newBooking')}
            </button>
          </div>
        </motion.div>
      </section>
    );
  }

  // ── Form ────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative flex h-[55vh] items-center justify-center overflow-hidden">
        <img
          src={`${import.meta.env.BASE_URL}gallery/103.webp`}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-primary/70" />
        <div className="relative z-10 px-6 text-center">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4 inline-block text-xs font-medium uppercase tracking-[0.2em] text-accent-warm"
          >
            {t('bookingPage.heroTagline')}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif text-5xl font-bold italic text-white md:text-6xl"
          >
            {t('bookingPage.heroTitle')}
          </motion.h1>
        </div>
      </section>

      {/* ── CONTENT ───────────────────────────────────────────────────────── */}
      <section className="bg-bg py-16">
        <div className="mx-auto max-w-7xl px-6">
          <form onSubmit={handleSubmit(onSubmit, onError)} noValidate>
            <div className="grid gap-12 lg:grid-cols-[1fr_360px] lg:items-start">

              {/* ── LEFT: form ────────────────────────────────────────────── */}
              <div>
                <h2 className="mb-8 font-serif text-2xl font-bold text-primary">
                  {t('bookingPage.formTitle')}
                </h2>

                {/* Room selector */}
                <div className="mb-6 flex flex-col gap-1.5">
                  <label htmlFor="roomId" className="text-sm font-medium text-text">
                    {t('bookingPage.selectRoom')}
                  </label>
                  <select
                    id="roomId"
                    {...register('roomId')}
                    className={cn(
                      'rounded-lg border border-bg-dark bg-white px-4 py-2.5 text-text transition-colors',
                      'focus:border-accent focus:outline-none',
                      errors.roomId && 'border-error',
                    )}
                  >
                    <option value="">{t('bookingPage.selectRoomPlaceholder')}</option>
                    {roomsLoading ? (
                      <option disabled>Загрузка…</option>
                    ) : (
                      rooms?.map((room) => (
                        <option key={room.id} value={room.id}>
                          {room.title} — {formatPrice(room.price_per_night)} / {t('common.perNight')}
                        </option>
                      ))
                    )}
                  </select>

                  {/* Room mini-preview */}
                  {selectedRoom && (
                    <div className="mt-2 flex items-center gap-4 rounded-xl border border-bg-dark bg-white p-3">
                      {coverImg && (
                        <img
                          src={coverImg}
                          alt={selectedRoom.title}
                          className="h-16 w-24 shrink-0 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <p className="text-sm font-semibold text-primary">{selectedRoom.title}</p>
                        <div className="mt-1 flex flex-wrap gap-3 text-xs text-text-muted">
                          <span className="flex items-center gap-1">
                            <FiUsers className="h-3.5 w-3.5 text-accent" />
                            {t('bookingPage.capacity', { count: selectedRoom.capacity })}
                          </span>
                          <span className="flex items-center gap-1">
                            <FiMaximize className="h-3.5 w-3.5 text-accent" />
                            {selectedRoom.area_sqm} м²
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Dates */}
                <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <DateField
                    label={t('bookingPage.checkin')}
                    min={today}
                    {...register('checkIn')}
                  />
                  <DateField
                    label={t('bookingPage.checkout')}
                    min={minCheckout}
                    {...register('checkOut')}
                  />
                </div>

                {/* Guests */}
                <div className="mb-6 flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text">
                    {t('bookingPage.guests')}
                  </label>
                  <GuestCounter
                    value={watchGuests}
                    max={selectedRoom?.capacity ?? 10}
                    onChange={(v) => setValue('guestsCount', v, { shouldValidate: true })}
                  />
                </div>

                <SectionDivider>{t('bookingPage.guestDataTitle')}</SectionDivider>

                {/* Name + Email */}
                <div className="mb-4 grid gap-4 sm:grid-cols-2">
                  <Input
                    label={t('bookingPage.guestName')}
                    placeholder={t('bookingPage.guestNamePlaceholder')}
                    error={errors.guestName?.message}
                    {...register('guestName')}
                  />
                  <Input
                    label={t('bookingPage.guestEmail')}
                    type="email"
                    placeholder={t('bookingPage.guestEmailPlaceholder')}
                    error={errors.guestEmail?.message}
                    {...register('guestEmail')}
                  />
                </div>

                {/* Phone */}
                <div className="mb-4">
                  <PhoneInput
                    label={t('bookingPage.guestPhone')}
                    name="guestPhone"
                    control={control}
                  />
                </div>

                {/* Special requests */}
                <Textarea
                  label={t('bookingPage.specialRequests')}
                  placeholder={t('bookingPage.specialRequestsPlaceholder')}
                  rows={3}
                  error={errors.specialRequests?.message}
                  {...register('specialRequests')}
                />

                {/* Mobile submit */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3.5 font-medium text-white transition-colors hover:bg-accent-warm disabled:opacity-60 lg:hidden"
                >
                  <FiCalendar className="h-4 w-4 shrink-0" />
                  {isSubmitting ? t('bookingPage.submitting') : t('bookingPage.submit')}
                </button>
              </div>

              {/* ── RIGHT: sticky summary ──────────────────────────────── */}
              <div className="lg:sticky lg:top-28">
                <div className="rounded-2xl border border-bg-dark bg-white p-6 shadow-sm">
                  <h3 className="mb-5 font-serif text-xl font-bold text-primary">
                    {t('bookingPage.summaryTitle')}
                  </h3>

                  {!selectedRoom ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <FiCalendar className="mb-3 h-8 w-8 text-bg-dark" />
                      <p className="text-sm text-text-muted">{t('bookingPage.noRoomSelected')}</p>
                    </div>
                  ) : (
                    <>
                      {/* Room card */}
                      {coverImg && (
                        <div className="mb-4 overflow-hidden rounded-xl">
                          <img
                            src={coverImg}
                            alt={selectedRoom.title}
                            className="h-44 w-full object-cover"
                          />
                        </div>
                      )}
                      <p className="mb-0.5 font-semibold text-primary">{selectedRoom.title}</p>
                      <p className="mb-5 text-sm text-text-muted">
                        {formatPrice(selectedRoom.price_per_night)}{' '}
                        <span className="text-xs">/ {t('common.perNight')}</span>
                      </p>

                      {nights > 0 ? (
                        <>
                          {/* Dates summary */}
                          <div className="mb-4 space-y-2 rounded-lg bg-bg px-4 py-3 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="text-text-muted">{t('bookingPage.checkin')}</span>
                              <span className="font-medium text-text">{fmtDate(watchCheckIn)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-text-muted">{t('bookingPage.checkout')}</span>
                              <span className="font-medium text-text">{fmtDate(watchCheckOut)}</span>
                            </div>
                            <div className="border-t border-bg-dark pt-2 text-xs text-text-muted">
                              {t('bookingPage.nights', { count: nights })}
                            </div>
                          </div>

                          {/* Price breakdown */}
                          <div className="mb-5 space-y-2 text-sm">
                            <div className="flex justify-between text-text-muted">
                              <span>
                                {formatPrice(selectedRoom.price_per_night)} × {nights}
                              </span>
                              <span>{formatPrice(total)}</span>
                            </div>
                            <div className="flex justify-between border-t border-bg-dark pt-2 font-bold text-primary">
                              <span>{t('bookingPage.total')}</span>
                              <span className="font-serif text-lg">{formatPrice(total)}</span>
                            </div>
                          </div>
                        </>
                      ) : (
                        <p className="mb-5 rounded-lg bg-bg px-4 py-3 text-sm text-text-muted">
                          {t('bookingPage.selectDateFirst')}
                        </p>
                      )}
                    </>
                  )}

                  {/* Desktop submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="hidden w-full items-center justify-center gap-2 rounded-xl bg-accent py-3.5 font-medium text-white transition-colors hover:bg-accent-warm disabled:opacity-60 lg:flex"
                  >
                    <FiCalendar className="h-4 w-4 shrink-0" />
                    {isSubmitting ? t('bookingPage.submitting') : t('bookingPage.submit')}
                  </button>

                  {/* Help */}
                  <div className="mt-5 border-t border-bg-dark pt-4 text-center">
                    <p className="text-xs text-text-muted">{t('bookingPage.helpText')}</p>
                    <a
                      href={`tel:${t('contacts.info.phone1')}`}
                      className="mt-1 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
                    >
                      <FiPhone className="h-3.5 w-3.5" />
                      {t('contacts.info.phone1')}
                    </a>
                  </div>
                </div>
              </div>

            </div>
          </form>
        </div>
      </section>
    </>
  );
}
