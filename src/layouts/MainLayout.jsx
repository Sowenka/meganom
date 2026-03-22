import { Outlet, useLocation } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CookieBanner } from '@/components/CookieBanner';
import { ScrollToTopButton } from '@/components/ui';
import { WeatherWidget } from '@/components/WeatherWidget';

export function MainLayout() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className={`flex-1${isHome ? '' : ' pt-20'}`}>
        <Outlet />
      </main>
      {/* Mobile weather badge — fixed, disappears after hero */}
      <WeatherWidget className="flex md:hidden" mobile />
      <Footer />
      <CookieBanner />
      <ScrollToTopButton />
    </div>
  );
}
