import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiChevronLeft, FiChevronRight, FiGrid, FiImage } from 'react-icons/fi';
import { photos, categories } from '@/data/gallery';

const categoryIcons = {
  all: FiGrid,
  territory: FiGrid,
  rooms: FiImage,
  beach: FiImage,
  amenities: FiImage,
  surroundings: FiImage,
};

function Lightbox({ photo, onClose, onPrev, onNext, currentIndex, totalCount }) {
  const { t } = useTranslation();

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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        aria-label={t('gallery.close')}
      >
        <FiX className="h-5 w-5" />
      </button>

      {/* Counter */}
      <div className="absolute left-4 top-4 z-10 rounded-full bg-white/10 px-3 py-1.5 text-sm text-white/80">
        {currentIndex + 1} / {totalCount}
      </div>

      {/* Prev button */}
      <button
        onClick={(e) => { e.stopPropagation(); onPrev(); }}
        className="absolute left-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 md:left-4"
        aria-label={t('gallery.prev')}
      >
        <FiChevronLeft className="h-6 w-6" />
      </button>

      {/* Next button */}
      <button
        onClick={(e) => { e.stopPropagation(); onNext(); }}
        className="absolute right-2 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 md:right-4"
        aria-label={t('gallery.next')}
      >
        <FiChevronRight className="h-6 w-6" />
      </button>

      {/* Image */}
      <AnimatePresence mode="wait">
        <motion.img
          key={photo.id}
          src={photo.src}
          alt=""
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="max-h-[90vh] max-w-[95vw] rounded-lg object-contain"
          onClick={(e) => e.stopPropagation()}
          draggable={false}
        />
      </AnimatePresence>
    </motion.div>
  );
}

export default function Gallery() {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('all');
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const filteredPhotos = activeCategory === 'all'
    ? photos
    : photos.filter((p) => p.category === activeCategory);

  const openLightbox = useCallback((index) => setLightboxIndex(index), []);
  const closeLightbox = useCallback(() => setLightboxIndex(null), []);

  const goToPrev = useCallback(() => {
    setLightboxIndex((prev) =>
      prev === null ? null : prev === 0 ? filteredPhotos.length - 1 : prev - 1,
    );
  }, [filteredPhotos.length]);

  const goToNext = useCallback(() => {
    setLightboxIndex((prev) =>
      prev === null ? null : prev === filteredPhotos.length - 1 ? 0 : prev + 1,
    );
  }, [filteredPhotos.length]);

  return (
    <section className="mx-auto max-w-7xl px-4 py-12">
      {/* Header */}
      <div className="mb-8 text-center">
        <h1 className="font-serif text-4xl font-bold text-primary">
          {t('gallery.title')}
        </h1>
        <p className="mt-2 text-text-muted">{t('gallery.subtitle')}</p>
        <p className="mt-1 text-sm text-text-muted/60">{t('gallery.photoCount')}</p>
      </div>

      {/* Category filters */}
      <div className="mb-8 flex flex-wrap justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => {
              setActiveCategory(cat);
              setLightboxIndex(null);
            }}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              activeCategory === cat
                ? 'bg-primary text-white shadow-md'
                : 'bg-bg-dark text-text-muted hover:bg-primary/10 hover:text-primary'
            }`}
          >
            {t(`gallery.${cat}`)}
          </button>
        ))}
      </div>

      {/* Photo grid — Masonry-style with CSS columns */}
      <div
        key={activeCategory}
        className="columns-2 gap-3 sm:columns-3 lg:columns-4 xl:columns-5"
      >
        {filteredPhotos.map((photo, index) => (
          <motion.div
            key={photo.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.5) }}
            className="mb-3 break-inside-avoid"
          >
            <button
              onClick={() => openLightbox(index)}
              className="group relative block w-full overflow-hidden rounded-xl focus:outline-none focus:ring-1 focus:ring-accent"
            >
              <img
                src={photo.src}
                alt=""
                loading="lazy"
                className="w-full rounded-xl object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 rounded-xl bg-black/0 transition-colors duration-300 group-hover:bg-black/20" />
            </button>
          </motion.div>
        ))}
      </div>

      {/* Lightbox */}
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
    </section>
  );
}
