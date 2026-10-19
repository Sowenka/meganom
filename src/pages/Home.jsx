import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MetaTags } from '@/components/seo/MetaTags';
import { SchemaOrg } from '@/components/seo/SchemaOrg';
import { motion, AnimatePresence, useInView, useReducedMotion } from 'framer-motion';
import {
  FiFeather, FiAnchor, FiSun, FiDroplet, FiTruck, FiGlobe,
  FiChevronLeft, FiChevronRight,
} from 'react-icons/fi';
import { toast } from 'sonner';
import { useRooms } from '@/hooks/useRooms';
import { useAuth } from '@/hooks/useAuth';
import { cn, formatPrice } from '@/lib/utils';
import { SEASON_OPEN } from '@/lib/constants';
import { StableText } from '@/components/ui';

// ─── useCountUp ──────────────────────────────────────────────────────────────
function useCountUp(target, duration = 1400, shouldStart = false, prefersReduced = false) {
  const numericTarget = parseFloat(target);
  const formatted = !isNaN(numericTarget)
    ? (numericTarget % 1 !== 0 ? numericTarget.toFixed(1) : numericTarget)
    : 0;
  const [count, setCount] = useState(prefersReduced ? formatted : 0);
  useEffect(() => {
    if (prefersReduced) { setCount(formatted); return; }
    if (!shouldStart) return;
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
  }, [shouldStart, target, duration, prefersReduced]);
  return count;
}

// ─── SectionReveal ───────────────────────────────────────────────────────────
function SectionReveal({ children, className, delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  const prefersReduced = useReducedMotion();
  return (
    <motion.div
      ref={ref}
      initial={prefersReduced ? false : { opacity: 0, y: 32 }}
      animate={prefersReduced ? {} : (isInView ? { opacity: 1, y: 0 } : {})}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ─── StatItem ─────────────────────────────────────────────────────────────────
function StatItem({ value, suffix, label, delay, shouldStart }) {
  const prefersReduced = useReducedMotion();
  const count = useCountUp(value, 1400, shouldStart, prefersReduced);
  return (
    <motion.div
      initial={prefersReduced ? false : { opacity: 0, y: 24 }}
      animate={prefersReduced ? {} : (shouldStart ? { opacity: 1, y: 0 } : {})}
      transition={{ duration: 0.5, delay }}
      className="flex flex-col items-center gap-2 py-4"
    >
      <span className="font-serif text-5xl font-bold text-accent tabular-nums">
        {count}{suffix}
      </span>
      <span className="text-xs uppercase tracking-widest text-white/75">{label}</span>
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
  const { isAuthenticated } = useAuth();
  const prefersReducedMotion = useReducedMotion();
  const reviews = t('reviews.items', { returnObjects: true });

  // Testimonial slider
  const [activeReview, setActiveReview] = useState(0);
  useEffect(() => {
    if (prefersReducedMotion) return; // respect user preference
    const timer = setInterval(() => {
      setActiveReview((i) => (i + 1) % reviews.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [reviews.length, prefersReducedMotion]);

  // Booking bar state
  const today = new Date().toISOString().split('T')[0];
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [guests, setGuests] = useState(2);

  const handleCheckAvailability = () => {
    if (!checkIn) {
      toast.error(t('home.booking.errors.noCheckin'));
      return;
    }
    if (!checkOut) {
      toast.error(t('home.booking.errors.noCheckout'));
      return;
    }
    if (checkIn < today) {
      toast.error(t('home.booking.errors.pastCheckin'));
      return;
    }
    if (checkOut <= checkIn) {
      toast.error(t('home.booking.errors.checkoutOrder'));
      return;
    }
    const nights = Math.round((new Date(checkOut) - new Date(checkIn)) / 86_400_000);
    if (nights > 90) {
      toast.error(t('home.booking.errors.tooLong'));
      return;
    }
    if (guests < 1 || guests > 15) {
      toast.error(t('home.booking.errors.guestsRange'));
      return;
    }

    const params = new URLSearchParams();
    params.set('checkIn', checkIn);
    params.set('checkOut', checkOut);
    params.set('guests', guests);
    const roomsUrl = `/rooms?${params.toString()}`;

    // Сезон закрыт: регистрация недоступна — просто открываем каталог (просмотр разрешён).
    if (!isAuthenticated && SEASON_OPEN) {
      navigate(`/auth/register?redirect=${encodeURIComponent(roomsUrl)}`);
      return;
    }

    navigate(roomsUrl);
  };

  // Rooms data
  const { data: rooms, isLoading: roomsLoading } = useRooms({ isActive: true });

  // Booking section ref for scroll-to
  const bookingRef = useRef(null);
  const scrollToBooking = () => {
    bookingRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Мобильная плавающая CTA видна только на участке между hero и формой бронирования:
  // выше - на экране своя кнопка в hero, ниже - уже видна сама форма и подвал,
  // которые она перекрывала бы. Состояние пересчитывается на каждом скролле,
  // поэтому при возврате вверх кнопка появляется снова.
  const heroCtaRef = useRef(null);
  const [showStickyCta, setShowStickyCta] = useState(false);

  useEffect(() => {
    const update = () => {
      const heroCta = heroCtaRef.current;
      const booking = bookingRef.current;
      if (!heroCta || !booking) return;
      // Считаем по фактической геометрии: IntersectionObserver не различает
      // «форма ещё ниже экрана» и «форма уже осталась выше» - в обоих случаях
      // пересечения нет, и переход между ними не порождает события.
      const heroCtaGone = heroCta.getBoundingClientRect().bottom <= 0;
      const bookingReached = booking.getBoundingClientRect().top <= window.innerHeight * 0.85;
      setShowStickyCta(heroCtaGone && !bookingReached);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    // Картинки выше догружаются и сдвигают секции без всякого скролла,
    // поэтому одних событий scroll недостаточно.
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(document.body);

    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      resizeObserver.disconnect();
    };
  }, []);

  // Stats counter trigger
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true, margin: '-60px' });

  // Rooms carousel drag-to-scroll (desktop) + arrow navigation
  const carouselRef = useRef(null);
  const scrollCarousel = (dir) => {
    const el = carouselRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 320, behavior: 'smooth' });
  };
  const dragState = useRef({ active: false, startX: 0, scrollLeft: 0, moved: false });

  const onCarouselMouseDown = (e) => {
    const el = carouselRef.current;
    if (!el) return;
    dragState.current = { active: true, startX: e.pageX - el.offsetLeft, scrollLeft: el.scrollLeft, moved: false };
    el.style.cursor = 'grabbing';
  };

  const onCarouselMouseMove = (e) => {
    const s = dragState.current;
    if (!s.active) return;
    e.preventDefault();
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = (x - s.startX) * 1.2;
    if (Math.abs(walk) > 4) s.moved = true;
    carouselRef.current.scrollLeft = s.scrollLeft - walk;
  };

  const onCarouselMouseUp = () => {
    dragState.current.active = false;
    if (carouselRef.current) carouselRef.current.style.cursor = 'grab';
  };

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
      <MetaTags
        title="Гостиница у мыса Меганом - домики у моря рядом с Судаком, Крым"
        description="Гостиница «Меганом» у мыса Меганом - домики у моря в 8 км от Судака, Крым. 8 номеров и домиков с бассейном, садом и виноградником. Бесплатный трансфер до пляжа. Онлайн-бронирование."
        path="/"
      />
      <SchemaOrg schema={{
        '@context': 'https://schema.org',
        '@type': 'LodgingBusiness',
        '@id': 'https://meganom-eco.ru/#lodging',
        name: 'Меганом Эко-дом',
        alternateName: 'Meganom Eco House',
        url: 'https://meganom-eco.ru',
        description: 'Гостиница у мыса Меганом в Крыму, 8 км от Судака. Домики и номера с бассейном, садом и виноградником.',
        image: [
          'https://meganom-eco.ru/gallery/088.webp',
          'https://meganom-eco.ru/gallery/023.webp',
        ],
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Байкальская ул., 28',
          addressLocality: 'с. Миндальное',
          addressRegion: 'Республика Крым',
          postalCode: '298026',
          addressCountry: 'RU',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 44.835724,
          longitude: 35.048184,
        },
        hasMap: 'https://yandex.ru/maps/?pt=35.048184,44.835724&z=17',
        priceRange: '₽₽',
        currenciesAccepted: 'RUB',
        paymentAccepted: 'Cash, Credit Card',
        checkinTime: '14:00',
        checkoutTime: '12:00',
        numberOfRooms: 8,
        areaServed: 'Судак, Крым',
        tourBookingPage: 'https://meganom-eco.ru/booking',
        openingHoursSpecification: {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
          opens: '00:00',
          closes: '23:59',
        },
        amenityFeature: [
          { '@type': 'LocationFeatureSpecification', name: 'Бассейн', value: true },
          { '@type': 'LocationFeatureSpecification', name: 'Wi-Fi', value: true },
          { '@type': 'LocationFeatureSpecification', name: 'Парковка', value: true },
          { '@type': 'LocationFeatureSpecification', name: 'Барбекю', value: true },
          { '@type': 'LocationFeatureSpecification', name: 'Сад', value: true },
          { '@type': 'LocationFeatureSpecification', name: 'Виноградник', value: true },
          { '@type': 'LocationFeatureSpecification', name: 'Кондиционер', value: true },
        ],
      }} />
      {/* ── 1. HERO ─────────────────────────────────────────────────────── */}
      <section className="relative flex h-[100svh] items-center overflow-hidden">
        <img
          src={`${import.meta.env.BASE_URL}gallery/023.webp`}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
          fetchPriority="high"
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
              className="mb-6 whitespace-pre-line font-serif text-[2.5rem] font-bold italic leading-[1.15] text-white sm:text-5xl md:text-6xl lg:text-7xl"
            >
              {t('home.hero.title')}
            </motion.h1>

            <motion.p
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.5 }}
              className="mb-10 max-w-xl text-base leading-relaxed text-white/80 sm:text-xl"
            >
              {t('home.hero.subtitle')}
            </motion.p>

            <motion.div
              ref={heroCtaRef}
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.5 }}
            >
              <button
                onClick={scrollToBooking}
                className="inline-flex items-center gap-2 rounded-full border border-white px-8 py-3 text-sm font-medium uppercase tracking-widest text-white transition-all duration-300 hover:bg-white hover:text-primary cursor-pointer"
              >
                <StableText tKey="home.hero.cta" />
              </button>
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
            {!prefersReducedMotion ? (
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
                className="h-2 w-1 rounded-full bg-white/60"
              />
            ) : (
              <div className="h-2 w-1 rounded-full bg-white/60" />
            )}
          </div>
        </motion.div>
      </section>

      {/* ── 2. WELCOME ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white py-24">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none text-[8rem] font-bold uppercase leading-none text-primary opacity-[0.04] md:text-[14rem]"
        >
          {t('watermarks.meganom')}
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
              alt="Территория эко-комплекса Меганом - сад и зона отдыха у мыса Меганом в Крыму"
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
                    <StableText tKey={`home.activities.items.${key}`} />
                  </span>
                </motion.div>
              ))}
            </div>

            <Link
              to="/about"
              className="mt-2 inline-flex w-fit items-center gap-2 rounded-full border border-primary px-8 py-3 text-sm font-medium uppercase tracking-widest text-primary transition-all duration-300 hover:bg-primary hover:text-white"
            >
              <StableText tKey="home.activities.cta" />
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
          {/* Heading - constrained */}
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

          {/* Carousel - centered, scrollable on overflow, draggable on desktop */}
          <div className="relative">
            <button
              onClick={() => scrollCarousel(-1)}
              aria-label="Предыдущие номера"
              className="absolute left-4 top-1/2 z-10 -translate-y-1/2 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-primary/20 bg-white shadow-md text-primary transition-colors hover:bg-primary hover:text-white"
            >
              <FiChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scrollCarousel(1)}
              aria-label="Следующие номера"
              className="absolute right-4 top-1/2 z-10 -translate-y-1/2 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-primary/20 bg-white shadow-md text-primary transition-colors hover:bg-primary hover:text-white"
            >
              <FiChevronRight className="h-5 w-5" />
            </button>
          <div
            ref={carouselRef}
            className="cursor-grab overflow-x-auto pb-6 select-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            onMouseDown={onCarouselMouseDown}
            onMouseMove={onCarouselMouseMove}
            onMouseUp={onCarouselMouseUp}
            onMouseLeave={onCarouselMouseUp}
          >
          <div className="mx-auto flex w-fit gap-5 px-6 md:px-12">
            {roomsLoading
              ? Array.from({ length: 3 }, (_, i) => <RoomSkeleton key={i} />)
              : rooms.map((room) => {
                  const coverImg =
                    room.room_images?.find((img) => img.is_cover)?.url ??
                    room.room_images?.[0]?.url;
                  return (
                    <div
                      key={room.id}
                      className="w-[300px] shrink-0 cursor-pointer overflow-hidden rounded-xl border border-bg-dark bg-white shadow-sm transition-shadow duration-300 hover:shadow-xl"
                      onClick={() => { if (!dragState.current.moved) navigate(`/rooms/${room.slug}`); }}
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
                          {t(`rooms.types.${room.room_type}`, { defaultValue: room.room_type })}
                        </p>
                        {(() => {
                          const dashIdx = room.title.indexOf(' - ');
                          const name = dashIdx !== -1 ? room.title.slice(0, dashIdx) : room.title;
                          const sub  = dashIdx !== -1 ? room.title.slice(dashIdx + 3) : null;
                          return (
                            <div className="mb-3">
                              <h3 className="font-serif text-xl font-bold leading-tight text-primary">
                                {name}
                              </h3>
                              {sub && (
                                <p className="font-serif text-xl font-bold leading-tight text-primary">{sub}</p>
                              )}
                            </div>
                          );
                        })()}
                        <p className="mb-4 text-sm font-medium text-text-muted">
                          {formatPrice(room.price_per_night)}{' '}
                          <span className="text-xs">{t('common.perNight')}</span>
                        </p>
                        <Link
                          to={`/rooms/${room.slug}`}
                          className="inline-flex items-center gap-1 text-sm font-medium text-primary transition-colors duration-200 hover:text-accent"
                          onClick={(e) => { if (dragState.current.moved) e.preventDefault(); }}
                        >
                          {t('home.rooms.details')}
                          <FiChevronRight className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
          </div>
          </div>
          </div>
        </section>
      )}

      {/* ── 6. TESTIMONIAL ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-bg-dark py-24">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none text-[8rem] font-bold uppercase leading-none text-primary opacity-[0.04] md:text-[14rem]"
        >
          {t('watermarks.sea')}
        </span>
        <SectionReveal className="relative mx-auto max-w-4xl px-6 text-center">
          <span className="mb-3 inline-block text-xs uppercase tracking-[0.2em] text-accent">
            {t('home.testimonial.tagline')}
          </span>
          <h2 className="mb-16 font-serif text-3xl font-bold text-primary md:text-4xl">
            {t('home.testimonial.title')}
          </h2>

          <div className="relative min-h-[260px] sm:min-h-[200px] md:min-h-[160px]">
            <span
              aria-hidden="true"
              className="absolute -top-8 left-0 select-none font-serif text-9xl leading-none text-accent/20"
            >
              &ldquo;
            </span>
            <span
              aria-hidden="true"
              className="absolute -bottom-8 right-0 select-none font-serif text-9xl leading-none text-accent/20"
            >
              &rdquo;
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
                    {reviews[activeReview].author}, {reviews[activeReview].date}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-10 flex items-center justify-center gap-4">
            <button
              onClick={() => setActiveReview((i) => (i - 1 + reviews.length) % reviews.length)}
              aria-label="Предыдущий отзыв"
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-primary/30 text-primary transition-colors hover:bg-primary hover:text-white"
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
                    className={`h-2 cursor-pointer rounded-full transition-all duration-300 ${
                      i === activeReview ? 'w-6 bg-accent' : 'w-2 bg-primary/20'
                    }`}
                  />
                ))}
            </div>
            <button
              onClick={() => setActiveReview((i) => (i + 1) % reviews.length)}
              aria-label="Следующий отзыв"
              className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-primary/30 text-primary transition-colors hover:bg-primary hover:text-white"
            >
              <FiChevronRight className="h-4 w-4" />
            </button>
          </div>
        </SectionReveal>
      </section>

      {/* ── 7. BOOKING BAR ───────────────────────────────────────────────── */}
      {/* scroll-mt компенсирует фиксированную шапку, иначе заголовок уезжает под неё.
          Значения совпадают с отступом контента в MainLayout (баннер закрытого сезона выше). */}
      <section
        ref={bookingRef}
        id="booking"
        className={cn('bg-primary py-16', SEASON_OPEN ? 'scroll-mt-20' : 'scroll-mt-28')}
      >
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
                <label htmlFor="booking-checkin" className="text-xs uppercase tracking-[0.15em] text-white/50">
                  {t('home.booking.checkin')}
                </label>
                <input
                  id="booking-checkin"
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
                <label htmlFor="booking-checkout" className="text-xs uppercase tracking-[0.15em] text-white/50">
                  {t('home.booking.checkout')}
                </label>
                <input
                  id="booking-checkout"
                  type="date"
                  min={checkIn || today}
                  value={checkOut}
                  onChange={(e) => setCheckOut(e.target.value)}
                  className="border-b border-white/30 bg-transparent pb-2 font-serif text-2xl text-white outline-none transition-colors focus:border-accent [color-scheme:dark]"
                />
              </div>

              <div className="hidden h-12 w-px bg-white/10 lg:block" aria-hidden="true" />

              <div className="flex flex-1 flex-col gap-2">
                <label htmlFor="booking-guests" className="text-xs uppercase tracking-[0.15em] text-white/50">
                  {t('home.booking.guests')}
                </label>
                <input
                  id="booking-guests"
                  type="number"
                  min={1}
                  max={15}
                  value={guests}
                  onFocus={(e) => e.target.select()}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val > 15) { toast.error(t('home.booking.maxGuests')); return; }
                    setGuests(Math.max(1, Math.min(15, val)));
                  }}
                  className="border-b border-white/30 bg-transparent pb-2 font-serif text-2xl text-white outline-none transition-colors focus:border-accent [color-scheme:dark]"
                />
              </div>

              <button
                onClick={handleCheckAvailability}
                className="shrink-0 rounded-full bg-accent px-8 py-3.5 text-sm font-medium uppercase tracking-widest text-white transition-colors hover:bg-accent-warm"
              >
                <StableText tKey="home.booking.cta" />
              </button>
            </div>
          </SectionReveal>
        </div>
      </section>
      {/* ── STICKY MOBILE CTA ───────────────────────────────────────────── */}
      <AnimatePresence>
        {showStickyCta && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-0 left-0 right-0 z-40 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden"
          >
            <button
              onClick={scrollToBooking}
              className="w-full rounded-full bg-accent py-3.5 text-sm font-medium uppercase tracking-widest text-white shadow-lg transition-colors hover:bg-accent-warm cursor-pointer"
            >
              <StableText tKey="home.hero.cta" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
