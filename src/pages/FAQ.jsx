import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronDown, FiMessageCircle } from 'react-icons/fi';
import PropTypes from 'prop-types';

// ─── Answer renderer — injects <Link> or <a> for marked words ────────────────
const LINK_CLASS =
  'font-medium text-accent transition-colors md:text-text-muted md:hover:text-accent';

function renderAnswer(answer, links) {
  if (!links || links.length === 0) return answer;

  let segments = [answer];

  for (const { word, to } of links) {
    const next = [];
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i];
      if (typeof seg !== 'string') { next.push(seg); continue; }
      const idx = seg.indexOf(word);
      if (idx === -1) { next.push(seg); continue; }
      if (idx > 0) next.push(seg.slice(0, idx));
      if (to.startsWith('tel:')) {
        next.push(
          <a key={`${i}-${to}`} href={to} className={LINK_CLASS}>
            {word}
          </a>,
        );
      } else {
        next.push(
          <Link key={`${i}-${to}`} to={to} className={LINK_CLASS}>
            {word}
          </Link>,
        );
      }
      const after = seg.slice(idx + word.length);
      if (after) next.push(after);
    }
    segments = next;
  }

  return segments;
}

// ─── Accordion Item ───────────────────────────────────────────────────────────
function AccordionItem({ question, answer, links, isOpen, onToggle }) {
  return (
    <div className="overflow-hidden rounded-xl border border-bg-dark bg-white transition-shadow duration-200 hover:shadow-sm">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="font-medium text-primary">{question}</span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.22 }}
          className="shrink-0 text-accent"
        >
          <FiChevronDown className="h-5 w-5" />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p className="border-t border-bg-dark px-6 pb-6 pt-4 leading-relaxed text-text-muted">
              {renderAnswer(answer, links)}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

AccordionItem.propTypes = {
  question: PropTypes.string.isRequired,
  answer: PropTypes.string.isRequired,
  links: PropTypes.arrayOf(PropTypes.shape({ word: PropTypes.string, to: PropTypes.string })),
  isOpen: PropTypes.bool.isRequired,
  onToggle: PropTypes.func.isRequired,
};

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function FAQ() {
  const { t } = useTranslation();
  const [openId, setOpenId] = useState(null);

  const categories = t('faq.categories', { returnObjects: true });

  useEffect(() => {
    document.title = `${t('faq.heroTitle')} — Меганом Эко-дом`;
  }, [t]);

  // Schema.org FAQPage JSON-LD
  useEffect(() => {
    const allItems = Array.isArray(categories)
      ? categories.flatMap((cat) =>
          (cat.items ?? []).map((item) => ({
            '@type': 'Question',
            name: item.q,
            acceptedAnswer: { '@type': 'Answer', text: item.a },
          })),
        )
      : [];

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: allItems,
    });
    document.head.appendChild(script);
    return () => document.head.removeChild(script);
  }, [categories]);

  const toggle = (id) => setOpenId((prev) => (prev === id ? null : id));

  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative flex h-[55vh] items-center justify-center overflow-hidden">
        <img
          src={`${import.meta.env.BASE_URL}gallery/113.webp`}
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
            {t('faq.heroTagline')}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif text-5xl font-bold italic text-white md:text-6xl"
          >
            {t('faq.heroTitle')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-4 max-w-xl text-base text-white/70"
          >
            {t('faq.intro')}
          </motion.p>
        </div>
      </section>

      {/* ── FAQ CONTENT ───────────────────────────────────────────────────── */}
      <section className="bg-bg py-16">
        <div className="mx-auto max-w-3xl px-6">
          {Array.isArray(categories) &&
            categories.map((category, catIdx) => (
              <div key={catIdx} className="mb-12 last:mb-0">
                {/* Category title */}
                <div className="mb-5 flex items-center gap-3">
                  <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                    {category.title}
                  </span>
                  <div className="h-px flex-1 bg-bg-dark" />
                </div>

                {/* Accordion items */}
                <div className="space-y-3">
                  {(category.items ?? []).map((item, itemIdx) => {
                    const id = `${catIdx}-${itemIdx}`;
                    return (
                      <AccordionItem
                        key={id}
                        question={item.q}
                        answer={item.a}
                        links={item.links}
                        isOpen={openId === id}
                        onToggle={() => toggle(id)}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <section className="bg-primary py-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <span className="mb-3 block text-xs font-medium uppercase tracking-[0.2em] text-accent-warm">
            {t('home.booking.tagline')}
          </span>
          <h2 className="mb-4 font-serif text-4xl font-bold text-white">
            {t('faq.ctaTitle')}
          </h2>
          <p className="mb-8 text-lg text-white/60">{t('faq.ctaText')}</p>
          <Link
            to="/contacts"
            className="inline-flex items-center gap-2 rounded-full border border-white/60 px-8 py-3 font-medium text-white transition-colors hover:bg-white hover:text-primary"
          >
            <FiMessageCircle className="h-4 w-4 shrink-0" />
            {t('faq.ctaButton')}
          </Link>
        </div>
      </section>
    </>
  );
}
