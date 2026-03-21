import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  FiFeather, FiAnchor, FiSun, FiDroplet, FiTruck, FiGlobe,
  FiChevronLeft, FiChevronRight,
} from 'react-icons/fi';
import { useRooms } from '@/hooks/useRooms';
import { formatPrice } from '@/lib/utils';
import { ROOM_TYPES } from '@/lib/constants';

// ─── useCountUp ──────────────────────────────────────────────────────────────
function useCountUp(target, duration = 1400, shouldStart = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!shouldStart) return;
    const numericTarget = parseFloat(target);
    if (isNaN(numericTarget)) return;
    const start = performance.now();
    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * numericTarget;
      setCount(numericTarget % 1 !== 0 ? current.toFixed(1) : Math.floor(current));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [shouldStart, target, duration]);
  return count;
}

// ─── SectionReveal ───────────────────────────────────────────────────────────
function SectionReveal({ children, className, delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
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

// ─── StatItem ─────────────────────────────────────────────────────────────────
function StatItem({ value, suffix, label, delay, shouldStart }) {
  const count = useCountUp(value, 1400, shouldStart);
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={shouldStart ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      className="flex flex-col items-center gap-2 py-4"
    >
      <span className="font-serif text-5xl font-bold text-accent tabular-nums">
        {count}{suffix}
      </span>
      <span className="text-xs uppercase tracking-widest text-white/60">{label}</span>
    </motion.div>
  );
}

// ─── RoomSkeleton ─────────────────────────────────────────────────────────────
function RoomSkeleton() {
  return (
    <div className="min-w-[280px] animate-pulse overflow-hidden rounded-xl border border-bg-dark bg-white sm:min-w-[320px]">
      <div className="h-56 bg-bg-dark" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-1/3 rounded bg-bg-dark" />
        <div className="h-4 w-3/4 rounded bg-bg-dark" />
        <div className="mt-4 h-3 w-1/2 rounded bg-bg-dark" />
      </div>
    </div>
  );
}

// ─── Home ────────────────────────────────────────────────────────────────────
export default function Home() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const reviews = t('reviews.items', { returnObjects: true });

  // Testimonial slider
  const [activeReview, setActiveReview] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveReview((i) => (i + 1) % reviews.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [reviews.length]);

  // Booking bar state
  const today = new Date().toISOString().split('T')[0];
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);

  const handleCheckAvailability = () => {
    const params = new URLSearchParams();
    if (checkIn) params.set('checkIn', checkIn);
    if (checkOut) params.set('checkOut', checkOut);
    params.set('guests', guests);
    navigate(`/booking?${params.toString()}`);
  };

  // Rooms from Supabase
  const { data: rooms, isLoading: roomsLoading } = useRooms({ isActive: true });

  // Stats counter trigger
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, margin: '-60px' });

  const activities = [
    { key: 'banya', Icon: FiFeather },
    { key: 'fishing', Icon: FiAnchor },
    { key: 'bbq', Icon: FiSun },
    { key: 'pool', Icon: FiDroplet },
    { key: 'transfer', Icon: FiTruck },
    { key: 'wine', Icon: FiGlobe },
  ];

  const stats = [
    { value: 500, suffix: '+', labelKey: 'home.stats.guests' },
    { value: 10, suffix: '', labelKey: 'home.stats.rooms' },
    { value: 4.7, suffix: '', labelKey: 'home.stats.rating' },
    { value: 5, suffix: '', labelKey: 'home.stats.years' },
  ];

  return (
    <>
      {/* ── 1. HERO ─────────────────────────────────────────────────────── */}
      <section className="relative flex h-screen items-center overflow-hidden">
        <img
          src={`${import.meta.env.BASE_URL}gallery/023.webp`}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-primary/65" />

        <div className="relative z-10 mx-auto w-full max-w-7xl px-6 py-32 md:px-12">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.15 } } }}
            className="max-w-2xl"
          >
            <motion.span
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.5 }}
              className="mb-4 inline-block text-xs font-medium uppercase tracking-[0.2em] text-accent-warm"
            >
              {t('home.hero.tag')}
            </motion.span>

            <motion.h1
              variants={{ hidden: { opacity: 0, y: 24 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="mb-6 whitespace-pre-line font-serif text-5xl font-bold italic leading-tight text-white md:text-6xl lg:text-7xl"
            >
              {t('home.hero.title')}
            </motion.h1>

            <motion.p
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.5 }}
              className="mb-10 max-w-xl text-xl leading-relaxed text-white/80"
            >
              {t('home.hero.subtitle')}
            </motion.p>

            <motion.div
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.5 }}
            >
              <Link
                to="/rooms"
                className="inline-flex items-center gap-2 rounded-full border border-white px-8 py-3 text-sm font-medium uppercase tracking-widest text-white transition-all duration-300 hover:bg-white hover:text-primary"
              >
                {t('home.hero.cta')}
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          aria-hidden="true"
        >
          <div className="flex h-10 w-6 items-start justify-center rounded-full border border-white/40 p-1.5">
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="h-2 w-1 rounded-full bg-white/60"
            />
          </div>
        </motion.div>
      </section>

      {/* ── 2. WELCOME ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white py-24">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none text-[8rem] font-bold uppercase leading-none text-primary opacity-[0.04] md:text-[14rem]"
        >
          МЕГАНОМ
        </span>
        <SectionReveal className="relative mx-auto max-w-2xl px-6 text-center">
          <span className="mb-3 inline-block text-xs uppercase tracking-[0.2em] text-accent">
            {t('home.welcome.tagline')}
          </span>
          <h2 className="mb-6 font-serif text-4xl font-bold text-primary md:text-5xl">
            {t('home.welcome.title')}
          </h2>
          <p className="mb-10 text-lg leading-relaxed text-text-muted">
            {t('home.welcome.text')}
          </p>
          <Link
            to="/about"
            className="inline-flex items-center gap-2 rounded-full border border-primary px-8 py-3 text-sm font-medium uppercase tracking-widest text-primary transition-all duration-300 hover:bg-primary hover:text-white"
          >
            {t('home.welcome.cta')}
          </Link>
        </SectionReveal>
      </section>

      {/* ── 3. ACTIVITIES ───────────────────────────────────────────────── */}
      <section className="py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-2 lg:items-center">
          <SectionReveal className="overflow-hidden rounded-2xl">
            <img
              src={`${import.meta.env.BASE_URL}gallery/008.webp`}
              alt=""
              loading="lazy"
              className="h-[480px] w-full object-cover"
            />
          </SectionReveal>

          <SectionReveal delay={0.1} className="flex flex-col gap-6">
            <span className="text-xs uppercase tracking-[0.2em] text-accent">
              {t('home.activities.tagline')}
            </span>
            <h2 className="font-serif text-4xl font-bold text-primary md:text-5xl">
              {t('home.activities.title')}
            </h2>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {activities.map(({ key, Icon }, idx) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.07 }}
                  className="flex items-center gap-3 rounded-xl border border-bg-dark bg-bg p-3"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10">
                    <Icon className="h-4 w-4 text-accent" />
                  </div>
                  <span className="text-sm font-medium text-text">
                    {t(`home.activities.items.${key}`)}
                  </span>
                </motion.div>
              ))}
            </div>

            <Link
              to="/about"
              className="mt-2 inline-flex w-fit items-center gap-2 rounded-full border border-primary px-8 py-3 text-sm font-medium uppercase tracking-widest text-primary transition-all duration-300 hover:bg-primary hover:text-white"
            >
              {t('home.activities.cta')}
            </Link>
          </SectionReveal>
        </div>
      </section>

      {/* ── 4. STATS ─────────────────────────────────────────────────────── */}
      <section ref={statsRef} className="bg-primary py-16">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 px-6 md:grid-cols-4">
          {stats.map(({ value, suffix, labelKey }, idx) => (
            <StatItem
              key={labelKey}
              value={value}
              suffix={suffix}
              label={t(labelKey)}
              delay={idx * 0.1}
              shouldStart={statsInView}
            />
          ))}
        </div>
      </section>

      {/* ── 5. ROOMS ─────────────────────────────────────────────────────── */}
      {(roomsLoading || (rooms && rooms.length > 0)) && (
        <section className="overflow-hidden py-20">
          {/* Heading — constrained */}
          <SectionReveal className="mx-auto mb-10 max-w-7xl px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-accent">
                  {t('home.rooms.tagline')}
                </span>
                <h2 className="font-serif text-4xl font-bold text-primary md:text-5xl">
                  {t('home.rooms.title')}
                </h2>
              </div>
              <Link
                to="/rooms"
                className="inline-flex shrink-0 items-center gap-2 rounded-full border border-primary px-6 py-2.5 text-sm font-medium uppercase tracking-widest text-primary transition-all duration-300 hover:bg-primary hover:text-white"
              >
                {t('home.rooms.cta')}
              </Link>
            </div>
          </SectionReveal>

          {/* Carousel — full viewport width scroll */}
          <div className="flex gap-5 overflow-x-auto px-6 pb-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:px-12">
            {roomsLoading
              ? Array.from({ length: 3 }, (_, i) => <RoomSkeleton key={i} />)
              : rooms.map((room) => {
                  const coverImg =
                    room.room_images?.find((img) => img.is_cover)?.url ??
                    room.room_images?.[0]?.url;
                  return (
                    <motion.div
                      key={room.id}
                      whileHover={{ y: -4 }}
                      transition={{ duration: 0.25 }}
                      className="w-[300px] shrink-0 overflow-hidden rounded-xl border border-bg-dark bg-white shadow-sm"
                    >
                      <div className="h-52 overflow-hidden">
                        {coverImg ? (
                          <img
                            src={coverImg}
                            alt={room.title}
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
                          />
                        ) : (
                          <div className="h-full bg-bg-dark" />
                        )}
                      </div>
                      <div className="p-5">
                        <p className="mb-1 text-xs uppercase tracking-widest text-accent">
                          {ROOM_TYPES[room.room_type] ?? room.room_type}
                        </p>
                        <h3 className="mb-3 font-serif text-xl font-bold text-primary">
                          {room.title}
                        </h3>
                        <p className="mb-4 text-sm font-medium text-text-muted">
                          {formatPrice(room.price_per_night)}{' '}
                          <span className="text-xs">{t('common.perNight')}</span>
                        </p>
                        <Link
                          to={`/rooms/${room.slug}`}
                          className="inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
                        >
                          {t('home.rooms.details')}
                          <FiChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </motion.div>
                  );
                })}
            {/* right edge spacer */}
            <div className="w-6 shrink-0 md:w-12" aria-hidden="true" />
          </div>
        </section>
      )}

      {/* ── 6. TESTIMONIAL ───────────────────────────────────────────────── */}
      <section className="bg-bg-dark py-24">
        <SectionReveal className="mx-auto max-w-4xl px-6 text-center">
          <span className="mb-3 inline-block text-xs uppercase tracking-[0.2em] text-accent">
            {t('home.testimonial.tagline')}
          </span>
          <h2 className="mb-16 font-serif text-3xl font-bold text-primary md:text-4xl">
            {t('home.testimonial.title')}
          </h2>

          <div className="relative min-h-[180px]">
            <span
              aria-hidden="true"
              className="absolute -top-8 left-0 select-none font-serif text-9xl leading-none text-accent/20"
            >
              &ldquo;
            </span>
            <AnimatePresence mode="wait">
              {Array.isArray(reviews) && reviews[activeReview] && (
                <motion.div
                  key={activeReview}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.4 }}
                >
                  <p className="font-serif text-xl italic leading-relaxed text-primary md:text-2xl">
                    {reviews[activeReview].text}
                  </p>
                  <p className="mt-6 text-xs uppercase tracking-[0.2em] text-text-muted">
                    — {reviews[activeReview].author}, {reviews[activeReview].date}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-10 flex items-center justify-center gap-4">
            <button
              onClick={() => setActiveReview((i) => (i - 1 + reviews.length) % reviews.length)}
              aria-label="Предыдущий отзыв"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 text-primary transition-colors hover:bg-primary hover:text-white"
            >
              <FiChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex gap-2">
              {Array.isArray(reviews) &&
                reviews.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveReview(i)}
                    aria-label={`Отзыв ${i + 1}`}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === activeReview ? 'w-6 bg-accent' : 'w-2 bg-primary/20'
                    }`}
                  />
                ))}
            </div>
            <button
              onClick={() => setActiveReview((i) => (i + 1) % reviews.length)}
              aria-label="Следующий отзыв"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/30 text-primary transition-colors hover:bg-primary hover:text-white"
            >
              <FiChevronRight className="h-4 w-4" />
            </button>
          </div>
        </SectionReveal>
      </section>

      {/* ── 7. BOOKING BAR ───────────────────────────────────────────────── */}
      <section className="bg-primary py-16">
        <div className="mx-auto max-w-5xl px-6">
          <SectionReveal>
            <div className="mb-10 text-center">
              <span className="mb-2 block text-xs uppercase tracking-[0.2em] text-accent-warm">
                {t('home.booking.tagline')}
              </span>
              <h2 className="font-serif text-3xl font-bold text-white">
                {t('home.booking.title')}
              </h2>
            </div>

            <div className="flex flex-col items-stretch gap-6 rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm lg:flex-row lg:items-end">
              <div className="flex flex-1 flex-col gap-2">
                <label className="text-xs uppercase tracking-[0.15em] text-white/50">
                  {t('home.booking.checkin')}
                </label>
                <input
                  type="date"
                  min={today}
                  value={checkIn}
                  onChange={(e) => {
                    setCheckIn(e.target.value);
                    if (checkOut && e.target.value >= checkOut) setCheckOut('');
                  }}
                  className="border-b border-white/30 bg-transparent pb-2 font-serif text-2xl text-white outline-none transition-colors focus:border-accent [color-scheme:dark]"
                />
              </div>

              <div className="hidden h-12 w-px bg-white/10 lg:block" aria-hidden="true" />

              <div className="flex flex-1 flex-col gap-2">
                <label className="text-xs uppercase tracking-[0.15em] text-white/50">
                  {t('home.booking.checkout')}
                </label>
                <input
                  type="date"
                  min={checkIn || today}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="border-b border-white/30 bg-transparent pb-2 font-serif text-2xl text-white outline-none transition-colors focus:border-accent [color-scheme:dark]"
                />
              </div>

              <div className="hidden h-12 w-px bg-white/10 lg:block" aria-hidden="true" />

              <div className="flex flex-1 flex-col gap-2">
                <label className="text-xs uppercase tracking-[0.15em] text-white/50">
                  {t('home.booking.guests')}
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={guests}
                  onChange={(e) =>
                    setGuests(Math.max(1, Math.min(10, Number(e.target.value))))
                  }
                  className="border-b border-white/30 bg-transparent pb-2 font-serif text-2xl text-white outline-none transition-colors focus:border-accent [color-scheme:dark]"
                />
              </div>

              <button
                onClick={handleCheckAvailability}
                className="shrink-0 rounded-full bg-accent px-8 py-3.5 text-sm font-medium uppercase tracking-widest text-white transition-colors hover:bg-accent-warm"
              >
                {t('home.booking.cta')}
              </button>
            </div>
          </SectionReveal>
        </div>
      </section>
    </>
  );
}
