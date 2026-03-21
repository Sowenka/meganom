import { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Messengers } from '@/components/Messengers';
import { Logo } from '@/components/Logo';

const navLinks = [
  { to: '/rooms', label: 'Номера' },
  { to: '/gallery', label: 'Галерея' },
  { to: '/about', label: 'О нас' },
  { to: '/contacts', label: 'Контакты' },
  { to: '/booking', label: 'Бронирование' },
];

export function Footer() {
  const [email, setEmail] = useState('');

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      toast.success('Спасибо! Мы скоро напишем.');
      setEmail('');
    }
  };

  return (
    <footer>
      {/* Newsletter strip */}
      <div className="bg-primary py-14">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-[0.2em] text-accent-warm">
                Будьте в курсе
              </p>
              <p className="text-2xl font-semibold text-white">
                Специальные предложения и новости
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <form onSubmit={handleSubscribe} className="flex w-full gap-2 sm:w-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ваш email"
                  required
                  className="min-w-0 flex-1 rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-white placeholder-white/40 outline-none focus:border-accent focus:ring-1 focus:ring-accent sm:w-52 sm:flex-none"
                />
                <button
                  type="submit"
                  className="shrink-0 rounded-lg bg-accent px-5 py-2.5 font-medium text-white transition-colors hover:bg-accent-warm"
                >
                  Подписаться
                </button>
              </form>
              <Messengers />
            </div>
          </div>
        </div>
      </div>

      {/* Main footer body */}
      <div className="bg-bg-dark py-12">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Бренд */}
          <div>
            <Logo dark className="mb-3" />
            <p className="text-sm text-text-muted">
              Эко-домики у мыса Меганом. Тишина, природа и чистое море южного Крыма.
            </p>
          </div>

          {/* Навигация */}
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
              Навигация
            </p>
            <ul className="flex flex-col gap-2 text-base text-text-muted">
              {navLinks.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="transition-colors hover:text-primary">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Контакты */}
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
              Контакты
            </p>
            <ul className="flex flex-col gap-2 text-base text-text-muted">
              <li>
                <a href="tel:+79781234567" className="transition-colors hover:text-primary">
                  +7 (978) 123-45-67
                </a>
              </li>
              <li>
                <a href="tel:+73652123456" className="transition-colors hover:text-primary">
                  +7 (365-2) 12-34-56
                </a>
              </li>
              <li>
                <a href="mailto:info@meganom-hotel.ru" className="transition-colors hover:text-primary">
                  info@meganom-hotel.ru
                </a>
              </li>
              <li className="pt-1 text-xs text-text-muted/70">
                Ежедневно, 08:00 — 22:00
              </li>
            </ul>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-7xl border-t border-primary/10 px-4 pt-6 text-center text-sm text-text-muted">
          <div className="mb-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <Link to="/privacy" className="transition-colors hover:text-primary">
              Политика конфиденциальности
            </Link>
            <span className="hidden sm:inline text-primary/30">&middot;</span>
            <Link to="/terms" className="transition-colors hover:text-primary">
              Пользовательское соглашение
            </Link>
          </div>
          &copy; {new Date().getFullYear()} Меганом Эко-дом. Все права защищены.
        </div>
      </div>
    </footer>
  );
}
