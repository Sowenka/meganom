import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FiInfo } from 'react-icons/fi';
import { SEASON_YEAR } from '@/lib/constants';

/**
 * Тонкий баннер о закрытии сезона. Рендерится внутри Header — закреплён сверху
 * на всех публичных страницах. Собственный фон, чтобы читаться и поверх прозрачной
 * шапки на главной.
 */
export function SeasonBanner() {
  const { t } = useTranslation();

  return (
    <div className="w-full overflow-hidden bg-accent">
      {/* Одна строка с константной высотой — чтобы фиксированный отступ контента не плыл (no CLS). */}
      <div className="mx-auto flex max-w-7xl flex-nowrap items-center justify-center gap-3 whitespace-nowrap px-4 py-2 text-xs font-medium text-primary sm:text-sm">
        <span className="flex items-center gap-2">
          <FiInfo className="h-4 w-4 shrink-0" />
          <span className="hidden lg:inline">{t('season.banner', { year: SEASON_YEAR })}</span>
          <span className="lg:hidden">{t('season.bannerShort', { year: SEASON_YEAR })}</span>
        </span>
        <Link
          to="/contacts"
          className="shrink-0 rounded-full border border-primary/40 px-3 py-0.5 text-xs font-semibold text-primary transition-colors hover:bg-primary hover:text-white"
        >
          {t('season.bannerCta')}
        </Link>
      </div>
    </div>
  );
}
