import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { FiShield, FiFileText, FiExternalLink } from 'react-icons/fi';
import PropTypes from 'prop-types';
import { MetaTags } from '@/components/seo/MetaTags';
import { OperatorDetails } from '@/components/OperatorDetails';
import { OPERATOR, LEGAL_VERSION } from '@/data/legal';

function Section({ title, children }) {
  return (
    <div className="border-t border-bg-dark pt-6">
      <h2 className="mb-3 font-serif text-xl font-bold text-primary md:text-2xl">{title}</h2>
      <div className="leading-relaxed text-text-muted">{children}</div>
    </div>
  );
}

Section.propTypes = { title: PropTypes.string.isRequired, children: PropTypes.node.isRequired };

function List({ items }) {
  return (
    <ul className="flex flex-col gap-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-3">
          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
List.propTypes = { items: PropTypes.arrayOf(PropTypes.string).isRequired };

export default function Consent() {
  const { t } = useTranslation();

  const data = t('consent.data', { returnObjects: true });
  const purposes = t('consent.purposes', { returnObjects: true });
  const thirdParties = t('consent.thirdParties', { returnObjects: true });

  return (
    <>
      <MetaTags
        title={t('consent.metaTitle')}
        description={t('consent.metaDescription')}
        path="/consent"
        noindex
      />

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative flex h-[40vh] items-center justify-center overflow-hidden">
        <img
          src={`${import.meta.env.BASE_URL}gallery/024.webp`}
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
            {t('consent.title')}
          </motion.h1>
        </div>
      </section>

      {/* ── CONTENT ───────────────────────────────────────────────────────── */}
      <section className="bg-bg py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-10 flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10 text-accent">
            <FiShield className="h-7 w-7" />
          </div>

          <p className="mb-2 leading-relaxed text-text-muted">
            {t('consent.intro', { site: OPERATOR.siteLabel })}
          </p>
          <p className="mb-10 text-sm text-text-muted/70">
            {t('consent.version', { date: LEGAL_VERSION })}
          </p>

          <div className="flex flex-col gap-8">
            <p className="leading-relaxed text-text-muted">{t('consent.preamble')}</p>

            <Section title={t('legal.operatorTitle')}>
              <OperatorDetails />
            </Section>

            <Section title={t('consent.dataTitle')}>
              <List items={data} />
            </Section>

            <Section title={t('consent.purposesTitle')}>
              <List items={purposes} />
            </Section>

            <Section title={t('consent.actionsTitle')}>
              <p>{t('consent.actions')}</p>
            </Section>

            <Section title={t('consent.thirdPartiesTitle')}>
              <p className="mb-3">{t('consent.thirdPartiesIntro')}</p>
              <List items={thirdParties} />
            </Section>

            <Section title={t('consent.termTitle')}>
              <p>{t('consent.term', { email: OPERATOR.email })}</p>
            </Section>

            <p className="leading-relaxed text-text-muted">
              {t('consent.policyNote')}{' '}
              <Link to="/privacy" className="text-accent transition-colors hover:text-primary">
                {t('consent.policyLink')}
              </Link>
              .
            </p>
          </div>

          {/* Связанные документы */}
          <div className="mt-12 border-t border-bg-dark pt-8">
            <h2 className="mb-5 font-serif text-xl font-bold text-primary">
              {t('consent.relatedTitle')}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <Link
                to="/privacy"
                className="group flex items-center justify-between rounded-2xl border border-bg-dark bg-white p-4 transition-colors hover:border-accent"
              >
                <span className="flex items-center gap-3">
                  <FiFileText className="h-5 w-5 text-accent" />
                  <span className="text-sm font-medium text-primary">
                    {t('consent.relatedPolicy')}
                  </span>
                </span>
                <FiExternalLink className="h-4 w-4 text-text-muted transition-colors group-hover:text-accent" />
              </Link>
              <Link
                to="/terms"
                className="group flex items-center justify-between rounded-2xl border border-bg-dark bg-white p-4 transition-colors hover:border-accent"
              >
                <span className="flex items-center gap-3">
                  <FiFileText className="h-5 w-5 text-accent" />
                  <span className="text-sm font-medium text-primary">
                    {t('consent.relatedTerms')}
                  </span>
                </span>
                <FiExternalLink className="h-4 w-4 text-text-muted transition-colors group-hover:text-accent" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
