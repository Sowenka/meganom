import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, useInView } from 'framer-motion';
import PropTypes from 'prop-types';

function PolicySection({ num, title, content, items, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.05 * index, ease: [0.22, 1, 0.36, 1] }}
      className="grid gap-4 border-t border-bg-dark pt-8 lg:grid-cols-[120px_1fr] lg:gap-12"
    >
      <div className="flex items-start gap-3 lg:flex-col lg:gap-1">
        <span className="font-serif text-3xl font-bold text-accent/40">{num}</span>
      </div>
      <div>
        <h2 className="mb-4 font-serif text-xl font-bold text-primary md:text-2xl">{title}</h2>
        {content && (
          <p className="mb-4 leading-relaxed text-text-muted whitespace-pre-line">{content}</p>
        )}
        {items && (
          <ul className="flex flex-col gap-2">
            {items.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-text-muted">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
}

PolicySection.propTypes = {
  num: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  content: PropTypes.string,
  items: PropTypes.arrayOf(PropTypes.string),
  index: PropTypes.number.isRequired,
};

export default function Terms() {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = `${t('terms.title')} — Меганом Эко-дом`;
  }, [t]);

  const sections = t('terms.sections', { returnObjects: true });

  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative flex h-[40vh] items-center justify-center overflow-hidden">
        <img
          src={`${import.meta.env.BASE_URL}gallery/026.webp`}
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
            {t('legal.heroTagline')}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif text-2xl font-bold italic text-white sm:text-3xl md:text-5xl"
          >
            {t('terms.title')}
          </motion.h1>
        </div>
      </section>

      {/* ── CONTENT ───────────────────────────────────────────────────────── */}
      <section className="bg-bg py-20">
        <div className="mx-auto max-w-5xl px-6">

          {/* Meta */}
          <div className="mb-12 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-text-muted">
              {t('legal.lastUpdated')} <span className="text-text">{t('legal.lastUpdatedDate')}</span>
            </p>
            <Link
              to="/privacy"
              className="text-sm text-accent underline-offset-4 hover:underline"
            >
              {t('terms.linkToPrivacy')}
            </Link>
          </div>

          {/* Sections */}
          <div className="flex flex-col gap-8">
            {sections.map((s, i) => (
              <PolicySection key={s.num} {...s} index={i} />
            ))}
          </div>

        </div>
      </section>
    </>
  );
}
