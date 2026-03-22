import { useRef, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { StableText } from '@/components/ui';
import { motion, useInView } from 'framer-motion';
import { FiUsers, FiMaximize, FiCheck, FiCalendar, FiX } from 'react-icons/fi';
import { useRooms } from '@/hooks/useRooms';
import { formatPrice, formatDate } from '@/lib/utils';

function SectionReveal({ children, className, delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function RoomCardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-bg-dark bg-white">
      <div className="h-64 bg-bg-dark" />
      <div className="space-y-3 p-6">
        <div className="h-3 w-1/4 rounded bg-bg-dark" />
        <div className="h-5 w-2/3 rounded bg-bg-dark" />
        <div className="h-3 w-full rounded bg-bg-dark" />
        <div className="h-3 w-4/5 rounded bg-bg-dark" />
        <div className="mt-4 flex gap-2">
          <div className="h-7 w-16 rounded-full bg-bg-dark" />
          <div className="h-7 w-16 rounded-full bg-bg-dark" />
          <div className="h-7 w-20 rounded-full bg-bg-dark" />
        </div>
      </div>
    </div>
  );
}

export default function Rooms() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: rooms, isLoading } = useRooms({ isActive: true });

  const checkIn  = searchParams.get('checkIn')  || '';
  const checkOut = searchParams.get('checkOut') || '';
  const guests   = parseInt(searchParams.get('guests') || '1', 10);
  const hasFilter = !!(checkIn && checkOut);

  const [availability, setAvailability] = useState({});
  const [availLoading, setAvailLoading]  = useState(false);

  useEffect(() => {
    if (!hasFilter) { setAvailability({}); return; }
    setAvailLoading(true);
    fetch(`/api/rooms/availability.php?check_in=${checkIn}&check_out=${checkOut}&guests=${guests}`)
      .then((r) => r.json())
      .then((d) => setAvailability(d.availability ?? {}))
      .catch(() => {})
      .finally(() => setAvailLoading(false));
  }, [checkIn, checkOut, guests, hasFilter]);

  function clearFilter() {
    setSearchParams({});
  }

  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative flex h-[55vh] items-center justify-center overflow-hidden">
        <img
          src={`${import.meta.env.BASE_URL}gallery/008.webp`}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-primary/65" />
        <div className="relative z-10 w-full px-6 text-center">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4 inline-block text-xs font-medium uppercase tracking-[0.2em] text-accent-warm"
          >
            {t('home.rooms.tagline')}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif text-3xl font-bold italic text-white sm:text-5xl md:text-6xl"
          >
            {t('home.rooms.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-3 text-sm text-white/60"
          >
            {t('rooms.heroSubtitle', { count: rooms?.length ?? 4 })}
          </motion.p>
        </div>
      </section>

      {/* ── FILTER BAR (показывается только если есть даты) ──────────────── */}
      {hasFilter && (
        <section className="border-b border-bg-dark bg-white px-6 py-4">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="font-medium text-primary">Поиск:</span>
              <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-primary">
                <FiCalendar className="h-3.5 w-3.5" />
                {formatDate(checkIn)} — {formatDate(checkOut)}
              </span>
              <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-primary">
                <FiUsers className="h-3.5 w-3.5" />
                {guests} {guests === 1 ? 'гость' : guests < 5 ? 'гостя' : 'гостей'}
              </span>
              {availLoading && (
                <span className="flex items-center gap-1.5 text-text-muted">
                  <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-accent border-t-transparent inline-block" />
                  Проверяем доступность...
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={clearFilter}
              className="flex items-center gap-1.5 rounded-full border border-bg-dark px-3 py-1 text-xs text-text-muted transition-colors hover:border-error/40 hover:text-error"
            >
              <FiX className="h-3.5 w-3.5" />
              Сбросить фильтр
            </button>
          </div>
        </section>
      )}

      {/* ── INTRO ─────────────────────────────────────────────────────────── */}
      {!hasFilter && (
      <section className="bg-white py-16">
        <SectionReveal className="mx-auto max-w-2xl px-6 text-center">
          <span className="mb-3 block text-xs font-medium uppercase tracking-[0.2em] text-accent">
            {t('home.welcome.tagline')}
          </span>
          <h2 className="mb-4 font-serif text-3xl font-bold text-primary">
            {t('rooms.introTagline')}
          </h2>
          <p className="text-base leading-relaxed text-text-muted">
            {t('rooms.introText')}
          </p>
        </SectionReveal>
      </section>
      )}

      {/* ── ROOM CARDS ────────────────────────────────────────────────────── */}
      <section className="bg-bg pb-24 pt-4">
        <div className="mx-auto max-w-7xl px-6">
          {isLoading ? (
            <div className="grid gap-8 sm:grid-cols-2">
              {Array.from({ length: 4 }, (_, i) => <RoomCardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2">
              {rooms?.map((room, idx) => {
                const coverImg =
                  room.room_images?.find((img) => img.is_cover)?.url ??
                  room.room_images?.[0]?.url;
                const amenities = Array.isArray(room.amenities) ? room.amenities : [];

                const avail = availability[room.id];
                const isAvailable      = !hasFilter || (avail?.available && avail?.enough_capacity);
                const isBooked         = hasFilter && avail && !avail.available;
                const notEnoughGuests  = hasFilter && avail && avail.available && !avail.enough_capacity;

                const bookingParams = new URLSearchParams();
                bookingParams.set('room', room.slug);
                if (checkIn)  bookingParams.set('checkIn', checkIn);
                if (checkOut) bookingParams.set('checkOut', checkOut);
                if (guests)   bookingParams.set('guests', String(guests));

                return (
                  <SectionReveal key={room.id} delay={idx * 0.08} className="h-full">
                    <div className={`group flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg ${isBooked || notEnoughGuests ? 'border-bg-dark opacity-70' : 'border-bg-dark'}`}>

                      {/* Image */}
                      <div className="relative h-64 shrink-0 overflow-hidden">
                        {coverImg ? (
                          <img
                            src={coverImg}
                            alt={room.title}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                          />
                        ) : (
                          <div className="h-full bg-bg-dark" />
                        )}
                        {/* Type badge */}
                        <div className="absolute left-4 top-4 flex flex-col gap-1.5">
                          <span className="rounded-full bg-primary/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-accent-warm backdrop-blur-sm">
                            {t(`rooms.types.${room.room_type}`, { defaultValue: room.room_type })}
                          </span>
                          {hasFilter && !availLoading && (
                            isBooked ? (
                              <span className="rounded-full bg-error/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white backdrop-blur-sm">
                                Занято
                              </span>
                            ) : notEnoughGuests ? (
                              <span className="rounded-full bg-warning/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white backdrop-blur-sm">
                                Мало мест
                              </span>
                            ) : avail ? (
                              <span className="rounded-full bg-success/90 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-white backdrop-blur-sm">
                                Свободно
                              </span>
                            ) : null
                          )}
                        </div>
                        {/* Price badge */}
                        <div className="absolute bottom-4 right-4">
                          <span className="rounded-full bg-white/95 px-4 py-1.5 text-sm font-bold text-primary shadow-md backdrop-blur-sm">
                            {formatPrice(room.price_per_night)}
                            <span className="ml-1 text-xs font-normal text-text-muted">/ {t('common.perNight')}</span>
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex flex-1 flex-col p-6">
                        <h2 className="mb-2 min-h-[4rem] font-serif text-2xl font-bold text-primary">
                          {room.title}
                        </h2>
                        <p className="mb-5 text-base leading-relaxed text-text-muted">
                          {room.short_description}
                        </p>

                        {/* Stats */}
                        <div className="mb-5 flex items-center gap-6 border-b border-bg-dark pb-5 text-base text-text-muted">
                          <span className="flex items-center gap-2">
                            <FiUsers className="h-4 w-4 text-accent" />
                            {t('rooms.guests', { count: room.capacity })}
                          </span>
                          <span className="flex items-center gap-2">
                            <FiMaximize className="h-4 w-4 text-accent" />
                            {room.area_sqm} м²
                          </span>
                        </div>

                        {/* Amenities */}
                        {amenities.length > 0 && (
                          <ul className="mb-6 flex flex-wrap gap-2">
                            {amenities.slice(0, 5).map((item) => (
                              <li
                                key={item}
                                className="flex items-center gap-1.5 rounded-full border border-bg-dark px-3 py-1.5 text-sm text-text-muted"
                              >
                                <FiCheck className="h-3.5 w-3.5 text-accent" />
                                {item}
                              </li>
                            ))}
                            {amenities.length > 5 && (
                              <li className="rounded-full border border-bg-dark px-3 py-1.5 text-sm text-text-muted">
                                +{amenities.length - 5}
                              </li>
                            )}
                          </ul>
                        )}

                        {/* Actions — прижаты к низу */}
                        <div className="mt-auto flex flex-col gap-3 sm:flex-row">
                          {isBooked || notEnoughGuests ? (
                            <span className="flex flex-1 items-center justify-center gap-2 rounded-full bg-bg-dark py-3 text-sm font-medium text-text-muted cursor-not-allowed">
                              {isBooked ? 'Занято на эти даты' : 'Недостаточно мест'}
                            </span>
                          ) : (
                            <Link
                              to={`/booking?${bookingParams.toString()}`}
                              className="flex items-center justify-center gap-2 rounded-full bg-accent py-3 text-sm font-medium text-white transition-colors hover:bg-accent-warm sm:flex-1"
                            >
                              <FiCalendar className="h-4 w-4 shrink-0" />
                              <StableText tKey="nav.booking" />
                            </Link>
                          )}
                          <Link
                            to={`/rooms/${room.slug}`}
                            className="rounded-full border border-primary py-3 text-center text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-white sm:flex-1"
                          >
                            <StableText tKey="home.rooms.details" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </SectionReveal>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="bg-primary py-20">
        <SectionReveal className="mx-auto max-w-2xl px-6 text-center">
          <span className="mb-3 block text-xs font-medium uppercase tracking-[0.2em] text-accent-warm">
            {t('home.booking.tagline')}
          </span>
          <h2 className="mb-4 font-serif text-4xl font-bold text-white">
            {t('rooms.ctaTitle')}
          </h2>
          <p className="mb-8 text-lg text-white/60">
            {t('rooms.ctaText')}
          </p>
          <Link
            to="/contacts"
            className="inline-flex items-center gap-2 rounded-full border border-white/60 px-8 py-3 font-medium text-white transition-colors hover:bg-white hover:text-primary"
          >
            <StableText tKey="rooms.ctaButton" />
          </Link>
        </SectionReveal>
      </section>
    </>
  );
}
