import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSettings, FiX, FiLock } from 'react-icons/fi';
import PropTypes from 'prop-types';
import { cn } from '@/lib/utils';
import { useCookieConsent, COOKIE_SETTINGS_EVENT } from '@/hooks/useCookieConsent';

// ─── Toggle ─────────────────────────────────────────────────────────────────
function Toggle({ checked, disabled, onChange, label }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors',
        checked ? 'bg-accent' : 'bg-bg-dark',
        disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
      )}
    >
      <span
        className={cn(
          'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform',
          checked ? 'translate-x-[22px]' : 'translate-x-0.5',
        )}
      />
    </button>
  );
}

Toggle.propTypes = {
  checked: PropTypes.bool.isRequired,
  disabled: PropTypes.bool,
  onChange: PropTypes.func.isRequired,
  label: PropTypes.string.isRequired,
};

// ─── CookieBanner ─────────────────────────────────────────────────────────────
export function CookieBanner() {
  const { t } = useTranslation();
  const { showBanner, isLoading, analytics, acceptAll, rejectAll, savePrefs } = useCookieConsent();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [analyticsOn, setAnalyticsOn] = useState(false);

  // Открытие настроек из футера (или иного места)
  useEffect(() => {
    const open = () => {
      setAnalyticsOn(analytics);
      setSettingsOpen(true);
    };
    window.addEventListener(COOKIE_SETTINGS_EVENT, open);
    return () => window.removeEventListener(COOKIE_SETTINGS_EVENT, open);
  }, [analytics]);

  const openSettings = () => {
    setAnalyticsOn(analytics);
    setSettingsOpen(true);
  };
  const handleSave = () => {
    savePrefs({ analytics: analyticsOn });
    setSettingsOpen(false);
  };
  const handleRejectAll = () => {
    rejectAll();
    setSettingsOpen(false);
  };

  const barVisible = !isLoading && showBanner && !settingsOpen;

  return (
    <>
      {/* ── Bottom bar ───────────────────────────────────────────────────── */}
      <AnimatePresence>
        {barVisible && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-50 p-4"
            role="dialog"
            aria-label={t('cookie.modalTitle')}
          >
            <div className="mx-auto flex max-w-4xl flex-col gap-4 rounded-2xl border border-white/20 bg-primary/95 px-6 py-4 shadow-lg backdrop-blur-sm md:flex-row md:items-center md:justify-between">
              <p className="text-center text-sm text-white/80 md:text-left">
                {t('cookie.text')}{' '}
                <Link
                  to="/privacy"
                  className="text-accent-warm transition-colors hover:text-white"
                >
                  {t('cookie.policyLink')}
                </Link>
                .
              </p>
              <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
                <button
                  type="button"
                  onClick={openSettings}
                  className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white/80 transition-colors hover:text-white"
                >
                  <FiSettings className="h-4 w-4" />
                  {t('cookie.settings')}
                </button>
                <button
                  type="button"
                  onClick={rejectAll}
                  className="rounded-lg border border-white/30 px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-white/10"
                >
                  {t('cookie.decline')}
                </button>
                <button
                  type="button"
                  onClick={acceptAll}
                  className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-warm"
                >
                  {t('cookie.accept')}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Settings modal ───────────────────────────────────────────────── */}
      <AnimatePresence>
        {settingsOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center"
            onClick={() => setSettingsOpen(false)}
            role="dialog"
            aria-modal="true"
            aria-label={t('cookie.modalTitle')}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-bg-dark px-6 py-4">
                <h2 className="font-serif text-xl font-bold text-primary">
                  {t('cookie.modalTitle')}
                </h2>
                <button
                  type="button"
                  onClick={() => setSettingsOpen(false)}
                  aria-label={t('cookie.close')}
                  className="flex h-9 w-9 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-bg hover:text-primary"
                >
                  <FiX className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <div className="px-6 py-5">
                <p className="mb-5 text-sm leading-relaxed text-text-muted">
                  {t('cookie.modalIntro')}
                </p>

                {/* Необходимые */}
                <div className="mb-4 flex items-start justify-between gap-4 rounded-xl border border-bg-dark bg-bg px-4 py-3">
                  <div>
                    <p className="flex items-center gap-2 text-sm font-semibold text-primary">
                      <FiLock className="h-3.5 w-3.5 text-accent" />
                      {t('cookie.necessaryTitle')}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-text-muted">
                      {t('cookie.necessaryDesc')}
                    </p>
                  </div>
                  <span className="shrink-0 whitespace-nowrap rounded-full bg-accent/15 px-2.5 py-1 text-xs font-medium text-accent">
                    {t('cookie.always')}
                  </span>
                </div>

                {/* Аналитика */}
                <div className="flex items-start justify-between gap-4 rounded-xl border border-bg-dark px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-primary">
                      {t('cookie.analyticsTitle')}
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-text-muted">
                      {t('cookie.analyticsDesc')}
                    </p>
                  </div>
                  <Toggle
                    checked={analyticsOn}
                    onChange={setAnalyticsOn}
                    label={t('cookie.analyticsTitle')}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="flex flex-col gap-2 border-t border-bg-dark px-6 py-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={handleRejectAll}
                  className="rounded-lg border border-bg-dark px-5 py-2.5 text-sm font-medium text-text transition-colors hover:bg-bg"
                >
                  {t('cookie.decline')}
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="rounded-lg bg-accent px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-accent-warm"
                >
                  {t('cookie.save')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

CookieBanner.propTypes = {};
