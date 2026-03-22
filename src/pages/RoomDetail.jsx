import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FiArrowLeft, FiArrowRight, FiCheck, FiMaximize, FiUsers, FiCalendar, FiClock, FiX } from 'react-icons/fi';
import PropTypes from 'prop-types';
import { useRoom } from '@/hooks/useRooms';
import { formatPrice } from '@/lib/utils';

// ─── Lightbox ────────────────────────────────────────────────────────────────
function Lightbox({ images, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') setCurrent((i) => (i + 1) % images.length);
      if (e.key === 'ArrowLeft') setCurrent((i) => (i - 1 + images.length) % images.length);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [images.length, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        aria-label="Close"
      >
        <FiX className="h-5 w-5" />
      </button>
      <img
        src={images[current].url}
        alt={images[current].alt ?? ''}
        className="max-h-[90vh] max-w-[90vw] object-contain"
        onClick={(e) => e.stopPropagation()}
      />
      {images.length > 1 && (
        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
          {images.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
              className={`h-1.5 rounded-full transition-all ${i === current ? 'w-6 bg-white' : 'w-1.5 bg-white/40'}`}
              aria-label={`Photo ${i + 1}`}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}

Lightbox.propTypes = {
  images: PropTypes.arrayOf(PropTypes.shape({ url: PropTypes.string, alt: PropTypes.string })).isRequired,
  startIndex: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
};

// ─── Room Carousel ────────────────────────────────────────────────────────────
function RoomCarousel({ images, onOpenLightbox }) {
  const [current, setCurrent] = useState(0);
  const touchStartX = useRef(null);

  const prev = () => setCurrent((i) => (i - 1 + images.length) % images.length);
  const next = () => setCurrent((i) => (i + 1) % images.length);

  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) diff > 0 ? next() : prev();
    touchStartX.current = null;
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-bg-dark">
      {/* Images */}
      <div
        className="relative h-72 cursor-pointer sm:h-96"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onClick={() => onOpenLightbox(current)}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key={current}
            src={images[current].url}
            alt={images[current].alt ?? ''}
            loading="lazy"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </AnimatePresence>

        {/* Counter */}
        <div className="absolute left-4 top-4 rounded-full bg-black/40 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
          {current + 1} / {images.length}
        </div>
      </div>

      {/* Arrows */}
      <button
        type="button"
        onClick={prev}
        aria-label="Previous photo"
        className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-primary shadow-md transition-colors hover:bg-white"
      >
        <FiArrowLeft className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={next}
        aria-label="Next photo"
        className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-primary shadow-md transition-colors hover:bg-white"
      >
        <FiArrowRight className="h-4 w-4" />
      </button>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 py-3">
        {images.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setCurrent(i)}
            aria-label={`Photo ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${
              i === current ? 'w-5 bg-accent' : 'w-1.5 bg-bg-dark'
            } h-1.5`}
          />
        ))}
      </div>
    </div>
  );
}

RoomCarousel.propTypes = {
  images: PropTypes.arrayOf(PropTypes.shape({ url: PropTypes.string, alt: PropTypes.string })).isRequired,
  onOpenLightbox: PropTypes.func.isRequired,
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function RoomDetailSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-[50vh] bg-bg-dark" />
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <div className="h-4 w-24 rounded bg-bg-dark" />
            <div className="h-8 w-2/3 rounded bg-bg-dark" />
            <div className="h-4 w-full rounded bg-bg-dark" />
            <div className="h-4 w-5/6 rounded bg-bg-dark" />
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {Array.from({ length: 4 }, (_, i) => <div key={i} className="h-8 rounded-full bg-bg-dark" />)}
            </div>
          </div>
          <div className="h-64 rounded-2xl bg-bg-dark" />
        </div>
      </div>
    </div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function RoomDetail() {
  const { slug } = useParams();
  const { t } = useTranslation();
  const { data: room, isLoading } = useRoom(slug);
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const images = room?.room_images?.slice().sort((a, b) => a.sort_order - b.sort_order) ?? [];
  const coverImg = images.find((img) => img.is_cover)?.url ?? images[0]?.url;
  const amenities = Array.isArray(room?.amenities) ? room.amenities : [];

  useEffect(() => {
    if (room) document.title = `${room.title} — Меганом Эко-дом`;
  }, [room]);

  if (isLoading) return <RoomDetailSkeleton />;

  if (!room) {
    return (
      <section className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-6 text-center">
        <p className="font-serif text-3xl font-bold text-primary">{t('roomDetail.notFound')}</p>
        <p className="text-text-muted">{t('roomDetail.notFoundText')}</p>
        <Link to="/rooms" className="mt-2 inline-flex items-center gap-2 text-accent underline-offset-4 hover:underline">
          <FiArrowLeft className="h-4 w-4" />
          {t('roomDetail.backToRooms')}
        </Link>
      </section>
    );
  }

  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative flex h-[55vh] items-end overflow-hidden">
        {coverImg && (
          <img
            src={coverImg}
            alt={room.title}
            className="absolute inset-0 h-full w-full object-cover"
            loading="eager"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/40 to-transparent" />

        <div className="relative z-10 w-full px-6 pb-10">
          <div className="mx-auto max-w-7xl">
            <Link
              to="/rooms"
              className="mb-6 inline-flex items-center gap-2 text-sm text-white/70 transition-colors hover:text-white"
            >
              <FiArrowLeft className="h-4 w-4" />
              {t('roomDetail.backToRooms')}
            </Link>

            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="mb-3 inline-block rounded-full bg-accent/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-accent-warm backdrop-blur-sm">
                  {t(`rooms.types.${room.room_type}`, { defaultValue: room.room_type })}
                </span>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="font-serif text-3xl font-bold italic text-white sm:text-4xl md:text-5xl"
                >
                  {room.title}
                </motion.h1>
              </div>
              <div className="ml-auto shrink-0 rounded-2xl bg-white/10 px-6 py-3 text-right backdrop-blur-sm">
                <p className="text-xs text-white/60">{t('roomDetail.bookingCard.priceFrom')}</p>
                <p className="font-serif text-2xl font-bold text-white">
                  {formatPrice(room.price_per_night)}
                </p>
                <p className="text-xs text-white/60">{t('common.perNight')}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTENT ───────────────────────────────────────────────────────── */}
      <section className="bg-bg py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-[1fr_340px] lg:items-start">

            {/* ── LEFT ─────────────────────────────────────────────────── */}
            <div className="flex flex-col gap-10">

              {/* Stats row */}
              <div className="flex flex-wrap gap-6 border-b border-bg-dark pb-8">
                <div className="flex items-center gap-2 text-text-muted">
                  <FiUsers className="h-5 w-5 text-accent" />
                  <span>
                    {t('rooms.guests', { count: room.capacity })}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-text-muted">
                  <FiMaximize className="h-5 w-5 text-accent" />
                  <span>{room.area_sqm} м²</span>
                </div>
              </div>

              {/* Gallery carousel */}
              {images.length > 0 && (
                <RoomCarousel images={images} onOpenLightbox={setLightboxIndex} />
              )}

              {/* Description */}
              {(room.full_description || room.short_description) && (
                <div>
                  <p className="leading-relaxed text-text-muted">
                    {room.full_description ?? room.short_description}
                  </p>
                </div>
              )}

              {/* Amenities */}
              {amenities.length > 0 && (
                <div>
                  <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                    {t('roomDetail.amenities')}
                  </h2>
                  <ul className="grid gap-2 sm:grid-cols-2">
                    {amenities.map((item) => (
                      <li key={item} className="flex items-center gap-3 text-text-muted">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10">
                          <FiCheck className="h-3.5 w-3.5 text-accent" />
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* ── RIGHT: booking card (sticky) ─────────────────────────── */}
            <div className="lg:sticky lg:top-28">
              <div className="rounded-2xl border border-bg-dark bg-white p-8 shadow-sm">
                <h3 className="mb-6 font-serif text-xl font-bold text-primary">
                  {t('roomDetail.bookingCard.title')}
                </h3>

                <div className="mb-6 flex items-baseline gap-2">
                  <span className="font-serif text-3xl font-bold text-primary">
                    {formatPrice(room.price_per_night)}
                  </span>
                  <span className="text-sm text-text-muted">/ {t('common.perNight')}</span>
                </div>

                <div className="mb-6 space-y-3 border-t border-bg-dark pt-6 text-sm text-text-muted">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FiUsers className="h-4 w-4 text-accent" />
                      {t('roomDetail.capacity')}
                    </span>
                    <span className="font-medium text-text">
                      {t('rooms.guests', { count: room.capacity })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FiMaximize className="h-4 w-4 text-accent" />
                      {t('roomDetail.area')}
                    </span>
                    <span className="font-medium text-text">{room.area_sqm} м²</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FiClock className="h-4 w-4 text-accent" />
                      {t('common.checkinLabel')} / {t('common.checkoutLabel')}
                    </span>
                    <span className="font-medium text-text">
                      {t('common.checkinTime')} / {t('common.checkoutTime')}
                    </span>
                  </div>
                </div>

                <Link
                  to={`/booking?room=${room.slug}`}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3.5 font-medium text-white transition-colors hover:bg-accent-warm"
                >
                  <FiCalendar className="h-4 w-4 shrink-0" />
                  {t('roomDetail.bookingCard.cta')}
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── LIGHTBOX ──────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            images={images}
            startIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
}
