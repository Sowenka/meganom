import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { sendSubscribeEmail } from '@/services/email.service';
import { Messengers } from '@/components/Messengers';
import { Logo } from '@/components/Logo';
import { StableText } from '@/components/ui';

const navLinks = [
  { to: '/rooms', key: 'nav.rooms' },
  { to: '/gallery', key: 'nav.gallery' },
  { to: '/about', key: 'nav.about' },
  { to: '/faq', key: 'nav.faq' },
  { to: '/contacts', key: 'nav.contacts' },
  { to: '/booking', key: 'nav.booking' },
];

export function Footer() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    try {
      await sendSubscribeEmail(email.trim());
      toast.success(t('footer.subscribeSuccess'));
      setEmail('');
    } catch {
      toast.error(t('footer.subscribeError'));
    } finally {
      setLoading(false);
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
                {t('footer.tagline')}
              </p>
              <p className="text-2xl font-semibold text-white">
                {t('footer.newsletter')}
              </p>
            </div>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <form onSubmit={handleSubscribe} className="flex w-full gap-2 sm:w-auto">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t('footer.emailPlaceholder')}
                  required
                  className="min-w-0 flex-1 rounded-lg border border-white/20 bg-white/10 px-4 py-2.5 text-white placeholder-white/40 outline-none focus:border-accent focus:ring-1 focus:ring-accent sm:w-52 sm:flex-none"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="shrink-0 rounded-lg bg-accent px-5 py-2.5 font-medium text-white transition-colors hover:bg-accent-warm disabled:opacity-60"
                >
                  {loading ? '...' : <StableText tKey="footer.subscribe" />}
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
              {t('footer.brand')}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
              {t('footer.navigation')}
            </p>
            <ul className="flex flex-col gap-2 text-base text-text-muted">
              {navLinks.map(({ to, key }) => (
                <li key={to}>
                  <Link to={to} className="transition-colors hover:text-primary">
                    {t(key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-primary">
              {t('footer.contacts')}
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
                <a href="mailto:info@meganom-eco.ru" className="transition-colors hover:text-primary">
                  info@meganom-eco.ru
                </a>
              </li>
              <li className="pt-1 text-xs text-text-muted/70">
                {t('footer.workHours')}
              </li>
            </ul>
          </div>
        </div>

        <div className="mx-auto mt-10 max-w-7xl border-t border-primary/10 px-4 pt-6 text-center text-sm text-text-muted">
          <div className="mb-2 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <Link to="/privacy" className="transition-colors hover:text-primary">
              {t('footer.privacy')}
            </Link>
            <span className="hidden sm:inline text-primary/30">&middot;</span>
            <Link to="/terms" className="transition-colors hover:text-primary">
              {t('footer.terms')}
            </Link>
          </div>
          &copy; {new Date().getFullYear()} {t('footer.copyright')}
        </div>
      </div>
    </footer>
  );
}
