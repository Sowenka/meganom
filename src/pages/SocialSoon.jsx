import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiArrowLeft, FiHome } from 'react-icons/fi';

const NETWORK_ICONS = {
  vk: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-16 w-16">
      <path d="M12.79 17.04c-5.14 0-8.08-3.52-8.2-9.38h2.58c.08 4.3 1.98 6.12 3.48 6.5V7.66h2.43v3.71c1.48-.16 3.03-1.86 3.55-3.71h2.43c-.4 2.28-2.08 3.98-3.27 4.68 1.19.56 3.1 2.06 3.82 4.7h-2.68c-.56-1.75-1.96-3.1-3.85-3.28v3.28h-.29z" />
    </svg>
  ),
  tg: (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-16 w-16">
      <path d="M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z" />
    </svg>
  ),
};

export default function SocialSoon() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const network = searchParams.get('network') || 'vk';
  const key = NETWORK_ICONS[network] ? network : 'vk';

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-20 text-center">
      <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-primary">
        {NETWORK_ICONS[key]}
      </div>

      <h1 className="mb-4 font-serif text-3xl font-bold text-primary">
        {t(`socialSoon.${key}.title`)}
      </h1>
      <p className="mb-10 max-w-md text-base leading-relaxed text-text-muted">
        {t(`socialSoon.${key}.text`)}
      </p>

      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 rounded-full border border-primary px-6 py-3 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-white"
        >
          <FiArrowLeft className="h-4 w-4" />
          {t('socialSoon.back')}
        </button>
        <Link
          to="/"
          className="flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-warm"
        >
          <FiHome className="h-4 w-4" />
          {t('socialSoon.home')}
        </Link>
      </div>
    </div>
  );
}
