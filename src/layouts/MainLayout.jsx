import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CookieBanner } from '@/components/CookieBanner';
import { ScrollToTopButton } from '@/components/ui';
import { WeatherWidget } from '@/components/WeatherWidget';
import { SEASON_OPEN } from '@/lib/constants';

export function MainLayout() {
  const location = useLocation();
  const isHome = location.pathname === '/';
  // Закрытый сезон добавляет баннер в шапку — увеличиваем отступ контента, чтобы не перекрывался.
  const headerPad = isHome ? '' : SEASON_OPEN ? ' pt-20' : ' pt-28';

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className={`flex-1${headerPad}`}>
        <Outlet />
      </main>
      {/* Мобильный виджет погоды: висит под логотипом поверх hero и уходит при скролле */}
      <WeatherWidget className="flex md:hidden" mobile />
      <Footer />
      <CookieBanner />
      <ScrollToTopButton />
    </div>
  );
}
