import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { photos, categories } from '@/data/gallery';

// Visual rhythm: every Nth photo gets a different aspect ratio
function getAspectClass(index) {
  if (index % 11 === 0) return 'aspect-[4/3]';   // wide — landscape
  if (index % 7 === 3)  return 'aspect-[2/3]';   // tall — portrait
  if (index % 13 === 6) return 'aspect-[1/1]';   // square
  return 'aspect-[3/4]';                          // default portrait
}

// ── Lightbox ──────────────────────────────────────────────────────────────────
function Lightbox({ photo, onClose, onPrev, onNext, currentIndex, totalCount }) {
  const { t } = useTranslation();
  const progress = ((currentIndex + 1) / totalCount) * 100;

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') onPrev();
      if (e.key === 'ArrowRight') onNext();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose, onPrev, onNext]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#080f14]/97 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Progress bar */}
      <div className="absolute inset-x-0 top-0 h-px bg-white/5">
        <motion.div
          className="h-full bg-accent"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      {/* Top bar */}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between px-6 py-5 z-10">
        <span className="text-[11px] uppercase tracking-[0.25em] text-white/30">
          {String(currentIndex + 1).padStart(2, '0')}
          <span className="mx-2 text-white/15">/</span>
          {String(totalCount).padStart(2, '0')}
        </span>
        <button
          onClick={onClose}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white/50 transition-all hover:border-accent/50 hover:text-accent"
          aria-label={t('gallery.close')}
        >
          <FiX className="h-4 w-4" />
        </button>
      </div>

      {/* Prev */}
      <button
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        className="absolute left-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 text-white/50 transition-all hover:border-white/30 hover:text-white md:left-6"
        aria-label={t('gallery.prev')}
      >
        <FiChevronLeft className="h-5 w-5" />
      </button>

      {/* Next */}
      <button
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        className="absolute right-3 top-1/2 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 text-white/50 transition-all hover:border-white/30 hover:text-white md:right-6"
        aria-label={t('gallery.next')}
      >
        <FiChevronRight className="h-5 w-5" />
      </button>

      {/* Image */}
      <AnimatePresence mode="wait">
        <motion.img
          key={photo.id}
          src={photo.src}
          alt=""
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          transition={{ duration: 0.22 }}
          className="max-h-[88vh] max-w-[92vw] rounded-xl object-contain shadow-2xl"
          onClick={(e) => e.stopPropagation()}
          draggable={false}
        />
      </AnimatePresence>

      {/* Keyboard hint */}
      <p className="absolute bottom-5 left-1/2 hidden -translate-x-1/2 text-[10px] uppercase tracking-[0.25em] text-white/15 md:block">
        ← → навигация · Esc закрыть
      </p>
    </motion.div>
  );
}

// ── Gallery ───────────────────────────────────────────────────────────────────
export default function Gallery() {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('all');
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const filteredPhotos = activeCategory === 'all'
    ? photos
    : photos.filter((p) => p.category === activeCategory);

  const openLightbox  = useCallback((i) => setLightboxIndex(i), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const goToPrev = useCallback(() =>
    setLightboxIndex((p) => p === null ? null : p === 0 ? filteredPhotos.length - 1 : p - 1),
  [filteredPhotos.length]);

  const goToNext = useCallback(() =>
    setLightboxIndex((p) => p === null ? null : p === filteredPhotos.length - 1 ? 0 : p + 1),
  [filteredPhotos.length]);

  return (
    <>
      {/* ── HERO ────────────────────────────────────────────────────────── */}
      <section className="relative flex h-[55vh] items-center justify-center overflow-hidden">
        <img
          src={`${import.meta.env.BASE_URL}gallery/016.webp`}
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
            {t('gallery.subtitle')}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif text-5xl font-bold italic text-white md:text-6xl"
          >
            {t('gallery.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-2 text-sm text-white/40"
          >
            {t('gallery.photoCount')}
          </motion.p>
        </div>
      </section>

      {/* ── STICKY FILTER BAR ────────────────────────────────────────────── */}
      <div className="sticky top-[72px] z-30 border-b border-bg-dark bg-bg/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
            {categories.map((cat) => {
              const isActive = activeCategory === cat;
              const count = cat === 'all'
                ? photos.length
                : photos.filter((p) => p.category === cat).length;

              return (
                <button
                  key={cat}
                  onClick={() => { setActiveCategory(cat); setLightboxIndex(null); }}
                  className="relative shrink-0 flex items-center gap-2 px-4 py-4 transition-colors duration-200 md:px-6"
                >
                  <span
                    className="text-sm font-medium uppercase tracking-wider transition-colors duration-200"
                    style={{ color: isActive ? '#1B3A4B' : '#9CA3AF' }}
                  >
                    {t(`gallery.${cat}`)}
                  </span>
                  <span
                    className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums transition-all duration-200"
                    style={{
                      backgroundColor: isActive ? '#C9A96E20' : 'transparent',
                      color: isActive ? '#C9A96E' : '#9CA3AF',
                    }}
                  >
                    {count}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="filter-line"
                      className="absolute inset-x-0 bottom-0 h-[2px] rounded-full bg-accent"
                      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── PHOTO GRID ────────────────────────────────────────────────────── */}
      <div className="bg-bg px-3 pb-16 pt-6 sm:px-6 sm:pt-10">
        <div
          key={activeCategory}
          className="mx-auto max-w-7xl columns-2 gap-2 sm:columns-3 lg:columns-4 xl:columns-5 sm:gap-3"
        >
          {filteredPhotos.map((photo, index) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: Math.min(index * 0.025, 0.55) }}
              className="mb-2 break-inside-avoid sm:mb-3"
            >
              <button
                onClick={() => openLightbox(index)}
                className="group relative block w-full overflow-hidden rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:rounded-xl"
              >
                <img
                  src={photo.src}
                  alt=""
                  loading="lazy"
                  className={`w-full object-cover transition-transform duration-700 group-hover:scale-[1.04] ${getAspectClass(index)}`}
                />

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-primary/0 transition-all duration-400 group-hover:bg-primary/25" />

                {/* Gold border glow on hover */}
                <div className="absolute inset-0 rounded-lg opacity-0 ring-1 ring-accent/60 transition-opacity duration-300 group-hover:opacity-100 sm:rounded-xl" />

                {/* View icon */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/60 bg-white/10 backdrop-blur-sm">
                    <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* ── LIGHTBOX ─────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {lightboxIndex !== null && filteredPhotos[lightboxIndex] && (
          <Lightbox
            photo={filteredPhotos[lightboxIndex]}
            onClose={closeLightbox}
            onPrev={goToPrev}
            onNext={goToNext}
            currentIndex={lightboxIndex}
            totalCount={filteredPhotos.length}
          />
        )}
      </AnimatePresence>
    </>
  );
}
