import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiHome, FiArrowLeft, FiPhone, FiMail } from 'react-icons/fi';
import { Logo } from '@/components/Logo';

const quickLinks = [
  { to: '/rooms',    label: 'Номера' },
  { to: '/gallery',  label: 'Галерея' },
  { to: '/about',    label: 'О нас' },
  { to: '/contacts', label: 'Контакты' },
  { to: '/booking',  label: 'Бронировать' },
];

export default function NotFound() {
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(15);

  // Auto-redirect countdown
  useEffect(() => {
    document.title = '404 — Меганом Эко-дом';
    if (countdown <= 0) { navigate('/'); return; }
    const id = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [countdown, navigate]);

  const progress = ((15 - countdown) / 15) * 100;

  return (
    <div className="flex min-h-screen flex-col bg-bg">

      {/* Top bar with logo */}
      <div className="border-b border-bg-dark bg-white px-6 py-4">
        <Logo dark />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">

        {/* Animated 404 */}
        <div className="relative mb-8 select-none">
          <motion.p
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif text-[140px] font-bold leading-none text-bg-dark md:text-[200px]"
          >
            404
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <span className="rounded-full border border-accent/30 bg-white px-5 py-2 font-serif text-lg font-semibold italic text-primary shadow-sm">
              Страница не найдена
            </span>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="mb-10 max-w-md text-base leading-relaxed text-text-muted"
        >
          Возможно, страница была перемещена или удалена. Воспользуйтесь навигацией ниже, чтобы найти нужный раздел.
        </motion.p>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="mb-12 flex flex-wrap items-center justify-center gap-3"
        >
          <Link
            to="/"
            className="flex items-center gap-2 rounded-full bg-primary px-7 py-3 font-medium text-white transition-colors hover:bg-primary-light"
          >
            <FiHome className="h-4 w-4" />
            На главную
          </Link>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 rounded-full border border-bg-dark bg-white px-7 py-3 font-medium text-text transition-colors hover:border-accent hover:text-accent"
          >
            <FiArrowLeft className="h-4 w-4" />
            Назад
          </button>
        </motion.div>

        {/* Quick links */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.5 }}
          className="mb-12"
        >
          <p className="mb-4 text-xs font-medium uppercase tracking-[0.2em] text-accent">
            Быстрая навигация
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {quickLinks.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className="rounded-full border border-bg-dark bg-white px-4 py-1.5 text-sm text-text-muted transition-all hover:border-accent/50 hover:text-primary"
              >
                {label}
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Countdown */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65, duration: 0.5 }}
          className="w-full max-w-xs"
        >
          <p className="mb-2 text-xs text-text-muted">
            Автоматический переход на главную через{' '}
            <span className="font-semibold text-primary">{countdown}</span> сек.
          </p>
          <div className="h-1 w-full overflow-hidden rounded-full bg-bg-dark">
            <motion.div
              className="h-full rounded-full bg-accent"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.9, ease: 'linear' }}
            />
          </div>
        </motion.div>
      </div>

      {/* Bottom contacts strip */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
        className="border-t border-bg-dark bg-white px-6 py-5"
      >
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-8">
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-accent">
            Нужна помощь?
          </p>
          <a
            href="tel:+79781234567"
            className="flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-primary"
          >
            <FiPhone className="h-3.5 w-3.5 text-accent" />
            +7 (978) 123-45-67
          </a>
          <a
            href="mailto:info@meganom-eco.ru"
            className="flex items-center gap-2 text-sm text-text-muted transition-colors hover:text-primary"
          >
            <FiMail className="h-3.5 w-3.5 text-accent" />
            info@meganom-eco.ru
          </a>
        </div>
      </motion.div>

    </div>
  );
}
