import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useInView } from 'framer-motion';
import { FiMapPin, FiStar, FiGrid, FiHome, FiUsers, FiMaximize } from 'react-icons/fi';

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

const sectionPhotos = {
  territory: '008.webp',
  services:  '083.webp',
  nearby:    '015.webp',
};

const sectionIcons = {
  territory: FiGrid,
  services:  FiStar,
  nearby:    FiMapPin,
};

export default function About() {
  const { t } = useTranslation();

  const territory = t('about.territory.items', { returnObjects: true });
  const services  = t('about.services.items',  { returnObjects: true });
  const nearby    = t('about.nearby.items',     { returnObjects: true });
  const roomTypes = t('about.rooms.types',      { returnObjects: true });

  const sections = [
    { key: 'territory', items: territory },
    { key: 'services',  items: services  },
    { key: 'nearby',    items: nearby    },
  ];

  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative flex h-[55vh] items-center justify-center overflow-hidden">
        <img
          src={`${import.meta.env.BASE_URL}gallery/001.webp`}
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
            {t('about.subtitle')}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif text-5xl font-bold italic text-white md:text-6xl"
          >
            {t('about.title')}
          </motion.h1>
        </div>
      </section>

      {/* ── DESCRIPTION ───────────────────────────────────────────────────── */}
      <section className="bg-white py-24">
        <SectionReveal className="mx-auto max-w-3xl px-6 text-center">
          <span className="mb-3 block text-xs font-medium uppercase tracking-[0.2em] text-accent">
            {t('home.welcome.tagline')}
          </span>
          <h2 className="mb-6 font-serif text-4xl font-bold text-primary">
            {t('home.welcome.title')}
          </h2>
          <p className="text-lg leading-relaxed text-text-muted">
            {t('about.description')}
          </p>
          <div className="mt-8 inline-flex flex-col items-center gap-1 rounded-2xl border border-accent/30 bg-accent/5 px-6 py-3 sm:flex-row sm:gap-3 sm:rounded-full sm:py-2.5">
            <div className="flex items-center gap-2">
              <FiStar className="h-4 w-4 shrink-0 text-accent" />
              <span className="whitespace-nowrap font-semibold text-text">
                {t('reviews.rating')} / {t('reviews.ratingMax')}
              </span>
            </div>
            <span className="whitespace-nowrap text-sm text-text-muted">
              — {t('reviews.reviewCount')} ({t('reviews.source')})
            </span>
          </div>
        </SectionReveal>
      </section>

      {/* ── INFO SECTIONS (alternating) ────────────────────────────────────── */}
      {sections.map(({ key, items }, index) => {
        const Icon = sectionIcons[key];
        const photo = sectionPhotos[key];
        const isReversed = index % 2 !== 0;

        return (
          <section key={key} className={`py-20 ${isReversed ? 'bg-bg-dark' : 'bg-bg'}`}>
            <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-2 lg:items-center">
              <SectionReveal
                delay={0}
                className={`overflow-hidden rounded-2xl ${isReversed ? 'lg:order-2' : ''}`}
              >
                <img
                  src={`${import.meta.env.BASE_URL}gallery/${photo}`}
                  alt=""
                  loading="lazy"
                  className="h-[420px] w-full object-cover"
                />
              </SectionReveal>

              <SectionReveal delay={0.15} className={`flex flex-col gap-5 ${isReversed ? 'lg:order-1' : ''}`}>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
                    {t(`about.${key}.title`)}
                  </span>
                </div>

                <h2 className="font-serif text-3xl font-bold text-primary md:text-4xl">
                  {t(`about.${key}.title`)}
                </h2>

                <ul className="flex flex-col gap-3">
                  {Array.isArray(items) && items.map((item, i) => (
                    <motion.li
                      key={i}
                      initial={{ opacity: 0, x: -12 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.04 * i }}
                      className="flex items-start gap-3 text-text-muted"
                    >
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                      {item}
                    </motion.li>
                  ))}
                </ul>
              </SectionReveal>
            </div>
          </section>
        );
      })}

      {/* ── ROOM TYPES ────────────────────────────────────────────────────── */}
      <section className="bg-primary py-20">
        <div className="mx-auto max-w-7xl px-6">
          <SectionReveal className="mb-12 text-center">
            <span className="mb-3 block text-xs font-medium uppercase tracking-[0.2em] text-accent-warm">
              {t('home.rooms.tagline')}
            </span>
            <h2 className="font-serif text-4xl font-bold text-white">
              {t('about.rooms.title')}
            </h2>
          </SectionReveal>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.isArray(roomTypes) && roomTypes.map((room, i) => (
              <SectionReveal key={i} delay={i * 0.07}>
                <div className="rounded-xl border border-white/10 bg-white/5 p-6 transition-colors hover:bg-white/10">
                  <FiHome className="mb-4 h-5 w-5 text-accent" />
                  <p className="mb-3 font-semibold text-white">{room.name}</p>
                  <div className="flex gap-5 text-sm text-white/60">
                    <span className="flex items-center gap-1.5">
                      <FiMaximize className="h-3.5 w-3.5" /> {room.area}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <FiUsers className="h-3.5 w-3.5" /> {room.capacity}
                    </span>
                  </div>
                </div>
              </SectionReveal>
            ))}
          </div>

          <p className="mt-10 text-center text-sm text-white/40">
            {t('about.allRoomsInclude')}
          </p>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="bg-bg-dark py-20">
        <SectionReveal className="mx-auto max-w-2xl px-6 text-center">
          <span className="mb-3 block text-xs font-medium uppercase tracking-[0.2em] text-accent">
            {t('home.booking.tagline')}
          </span>
          <h2 className="mb-4 font-serif text-4xl font-bold text-primary">
            {t('home.booking.title')}
          </h2>
          <p className="mb-8 text-lg text-text-muted">
            {t('about.description').split('.')[0]}.
          </p>
          <Link
            to="/booking"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-3 font-medium text-white transition-colors hover:bg-accent-warm"
          >
            {t('nav.booking')}
          </Link>
        </SectionReveal>
      </section>
    </>
  );
}
