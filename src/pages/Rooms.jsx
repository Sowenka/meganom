import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useInView } from 'framer-motion';
import { FiUsers, FiMaximize, FiCheck, FiCalendar } from 'react-icons/fi';
import { useRooms } from '@/hooks/useRooms';
import { formatPrice } from '@/lib/utils';
import { ROOM_TYPES } from '@/lib/constants';

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
  const { data: rooms, isLoading } = useRooms({ isActive: true });

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
        <div className="relative z-10 px-6 text-center">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4 inline-block text-xs font-medium uppercase tracking-[0.2em] text-accent-warm"
          >
            Варианты размещения
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif text-5xl font-bold italic text-white md:text-6xl"
          >
            Наши номера
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-3 text-sm text-white/60"
          >
            {rooms?.length ?? 4} вида размещения · эко-домики из натурального дерева
          </motion.p>
        </div>
      </section>

      {/* ── INTRO ─────────────────────────────────────────────────────────── */}
      <section className="bg-white py-16">
        <SectionReveal className="mx-auto max-w-2xl px-6 text-center">
          <span className="mb-3 block text-xs font-medium uppercase tracking-[0.2em] text-accent">
            {t('home.welcome.tagline')}
          </span>
          <h2 className="mb-4 font-serif text-3xl font-bold text-primary">
            Уютно как дома, красиво как в природе
          </h2>
          <p className="text-base leading-relaxed text-text-muted">
            Каждый домик построен из натурального дерева и вписан в ландшафт у мыса Меганом.
            Выберите размещение, которое подходит вам по площади и бюджету.
          </p>
        </SectionReveal>
      </section>

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

                return (
                  <SectionReveal key={room.id} delay={idx * 0.08} className="h-full">
                    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-bg-dark bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg">

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
                        <div className="absolute left-4 top-4">
                          <span className="rounded-full bg-primary/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-accent-warm backdrop-blur-sm">
                            {ROOM_TYPES[room.room_type] ?? room.room_type}
                          </span>
                        </div>
                        {/* Price badge */}
                        <div className="absolute bottom-4 right-4">
                          <span className="rounded-full bg-white/95 px-4 py-1.5 text-sm font-bold text-primary shadow-md backdrop-blur-sm">
                            {formatPrice(room.price_per_night)}
                            <span className="ml-1 text-xs font-normal text-text-muted">/ ночь</span>
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="flex flex-1 flex-col p-6">
                        <h2 className="mb-2 font-serif text-2xl font-bold text-primary">
                          {room.title}
                        </h2>
                        <p className="mb-5 text-base leading-relaxed text-text-muted">
                          {room.short_description}
                        </p>

                        {/* Stats */}
                        <div className="mb-5 flex items-center gap-6 border-b border-bg-dark pb-5 text-base text-text-muted">
                          <span className="flex items-center gap-2">
                            <FiUsers className="h-4 w-4 text-accent" />
                            {room.capacity} {room.capacity === 1 ? 'гость' : room.capacity < 5 ? 'гостя' : 'гостей'}
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
                        <div className="mt-auto flex items-center gap-3">
                          <Link
                            to={`/booking?room=${room.slug}`}
                            className="flex flex-1 items-center justify-center gap-2 rounded-full bg-accent py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-warm"
                          >
                            <FiCalendar className="h-4 w-4" />
                            Забронировать
                          </Link>
                          <Link
                            to={`/rooms/${room.slug}`}
                            className="flex-1 rounded-full border border-primary py-2.5 text-center text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-white"
                          >
                            Подробнее
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
            Не нашли подходящий вариант?
          </h2>
          <p className="mb-8 text-lg text-white/60">
            Свяжитесь с нами — поможем подобрать размещение под ваши пожелания и бюджет.
          </p>
          <Link
            to="/contacts"
            className="inline-flex items-center gap-2 rounded-full border border-white/60 px-8 py-3 font-medium text-white transition-colors hover:bg-white hover:text-primary"
          >
            Связаться с нами
          </Link>
        </SectionReveal>
      </section>
    </>
  );
}
