import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';

const STORAGE_KEY = 'cookiesAccepted';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      setVisible(true);
    }
  }, []);

  function handleAccept() {
    localStorage.setItem(STORAGE_KEY, 'true');
    setVisible(false);
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed inset-x-0 bottom-0 z-50 p-4"
        >
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 rounded-2xl border border-white/20 bg-primary/95 px-6 py-4 shadow-lg backdrop-blur-sm sm:flex-row sm:justify-between">
            <p className="text-center text-sm text-white/80 sm:text-left">
              Мы используем файлы cookie для улучшения работы сайта.
              Продолжая использовать сайт, вы соглашаетесь с{' '}
              <Link
                to="/privacy"
                className="underline underline-offset-2 transition-colors hover:text-white"
              >
                Политикой конфиденциальности
              </Link>
              .
            </p>
            <button
              onClick={handleAccept}
              className="shrink-0 rounded-lg bg-accent px-6 py-2 text-sm font-medium text-text transition-colors hover:bg-accent-warm"
            >
              Принять
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

CookieBanner.propTypes = {};
