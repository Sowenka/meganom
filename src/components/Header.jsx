import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import { FiUser } from 'react-icons/fi';
import { useUIStore } from '@/store/useUIStore';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/Logo';
import { StableText } from '@/components/ui';

function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language?.startsWith('en') ? 'en' : 'ru';

  const toggle = () => i18n.changeLanguage(current === 'ru' ? 'en' : 'ru');

  return (
    <button
      type="button"
      onClick={toggle}
      className="flex items-center gap-0.5 text-sm font-medium text-white/70 transition-colors hover:text-white"
      aria-label="Switch language"
    >
      <span className={cn(current === 'ru' ? 'text-white' : 'text-white/40')}>RU</span>
      <span className="text-white/30">/</span>
      <span className={cn(current === 'en' ? 'text-white' : 'text-white/40')}>EN</span>
    </button>
  );
}

const navKeys = [
  { to: '/', key: 'nav.home' },
  { to: '/rooms', key: 'nav.rooms' },
  { to: '/gallery', key: 'nav.gallery' },
  { to: '/about', key: 'nav.about' },
  { to: '/faq', key: 'nav.faq' },
  { to: '/contacts', key: 'nav.contacts' },
];

function BurgerIcon({ isOpen }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <motion.line
        x1="3" x2="21"
        animate={isOpen ? { y1: 12, y2: 12, rotate: 45 } : { y1: 4, y2: 4, rotate: 0 }}
        transition={{ duration: 0.25 }}
        style={{ transformOrigin: 'center' }}
      />
      <motion.line
        x1="3" y1="12" x2="21" y2="12"
        animate={{ opacity: isOpen ? 0 : 1 }}
        transition={{ duration: 0.15 }}
      />
      <motion.line
        x1="3" x2="21"
        animate={isOpen ? { y1: 12, y2: 12, rotate: -45 } : { y1: 20, y2: 20, rotate: 0 }}
        transition={{ duration: 0.25 }}
        style={{ transformOrigin: 'center' }}
      />
    </svg>
  );
}

export function Header() {
  const { t } = useTranslation();
  const { isMobileMenuOpen, toggleMobileMenu } = useUIStore();
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  const isHome = location.pathname === '/';
  const isTransparent = isHome && !scrolled;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      toggleMobileMenu();
      document.body.style.overflow = '';
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isMobileMenuOpen) toggleMobileMenu();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isMobileMenuOpen, toggleMobileMenu]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  return (
    <header
      className={cn(
        'fixed top-0 z-50 w-full transition-[background-color,box-shadow] duration-300',
        isTransparent ? 'bg-transparent' : 'bg-primary shadow-lg',
      )}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
        <Logo />

        {/* Desktop nav */}
        <ul className="hidden items-center gap-6 md:flex">
          {navKeys.map(({ to, key }) => (
            <li key={to}>
              <Link to={to} className="text-base text-white/80 transition-colors hover:text-white">
                <StableText tKey={key} />
              </Link>
            </li>
          ))}
          <li>
            <LanguageSwitcher />
          </li>
          <li>
            <Link
              to={isAuthenticated ? '/profile' : '/auth/login'}
              className="flex h-9 w-9 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/15 hover:text-white"
              aria-label={isAuthenticated ? t('header.profile') : t('header.login')}
            >
              <FiUser className="h-5 w-5" />
            </Link>
          </li>
          <li>
            <Link
              to="/booking"
              className={cn(
                'whitespace-nowrap rounded-lg border px-5 py-2 font-medium transition-colors duration-300',
                isTransparent
                  ? 'border-white/60 text-white hover:bg-white/10'
                  : 'border-transparent bg-accent text-white hover:bg-accent-warm',
              )}
            >
              <StableText tKey="nav.booking" />
            </Link>
          </li>
        </ul>

        {/* Mobile: user icon + lang + burger */}
        <div className="flex h-9 items-center gap-3 md:hidden">
          <Link
            to={isAuthenticated ? '/profile' : '/auth/login'}
            className="flex h-9 w-9 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/15 hover:text-white"
            aria-label={isAuthenticated ? t('header.profile') : t('header.login')}
          >
            <FiUser className="h-5 w-5" />
          </Link>
          <LanguageSwitcher />
          <button
            type="button"
            onClick={toggleMobileMenu}
            className="flex h-9 w-9 items-center justify-center text-white"
            aria-label={isMobileMenuOpen ? t('header.closeMenu') : t('header.openMenu')}
            aria-expanded={isMobileMenuOpen}
          >
            <BurgerIcon isOpen={isMobileMenuOpen} />
          </button>
        </div>
      </nav>

      {/* Mobile menu — always bg-primary */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-white/10 bg-primary md:hidden"
          >
            <ul className="flex flex-col gap-1 px-4 py-4">
              {navKeys.map(({ to, key }) => {
                const isActive = to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);
                return (
                  <li key={to}>
                    <Link
                      to={to}
                      className={cn(
                        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-lg transition-colors',
                        isActive
                          ? 'bg-white/10 font-semibold text-white'
                          : 'text-white/80 hover:bg-white/10 hover:text-white',
                      )}
                    >
                      {isActive && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />}
                      <StableText tKey={key} />
                    </Link>
                  </li>
                );
              })}
              <li className="mt-2">
                <Link
                  to="/booking"
                  className="block rounded-lg bg-accent px-3 py-2.5 text-center text-lg font-medium text-white transition-colors hover:bg-accent-warm"
                >
                  {t('nav.booking')}
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
