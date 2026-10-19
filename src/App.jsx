import { Suspense, useEffect, useRef } from 'react';
import { Routes, Route, useLocation, matchRoutes, createRoutesFromChildren } from 'react-router-dom';
import { lazyPage } from '@/lib/lazyPage';

const YM_ID = 108212418;

function ScrollToTop() {
  const { pathname } = useLocation();
  const isFirst = useRef(true);
  useEffect(() => {
    // Remove overflow lock from mobile menu first (synchronous)
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    // Defer scroll to next tick so iOS Safari processes the overflow change first
    const id = setTimeout(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 0);
    // Yandex Metrika SPA hit - skip first render (init already fires it)
    if (isFirst.current) {
      isFirst.current = false;
    } else if (typeof window.ym === 'function') {
      window.ym(YM_ID, 'hit', window.location.href);
    }
    return () => clearTimeout(id);
  }, [pathname]);
  return null;
}
import { Toaster } from 'sonner';
import { MainLayout } from '@/layouts/MainLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { AuthLayout } from '@/layouts/AuthLayout';

const Home = lazyPage(() => import('@/pages/Home'));
const Rooms = lazyPage(() => import('@/pages/Rooms'));
const RoomDetail = lazyPage(() => import('@/pages/RoomDetail'));
const Booking = lazyPage(() => import('@/pages/Booking'));
const About = lazyPage(() => import('@/pages/About'));
const Contacts = lazyPage(() => import('@/pages/Contacts'));
const Gallery = lazyPage(() => import('@/pages/Gallery'));
const PrivacyPolicy = lazyPage(() => import('@/pages/PrivacyPolicy'));
const Terms = lazyPage(() => import('@/pages/Terms'));
const Consent = lazyPage(() => import('@/pages/Consent'));
const FAQ = lazyPage(() => import('@/pages/FAQ'));
const NotFound = lazyPage(() => import('@/pages/NotFound'));
const SocialSoon = lazyPage(() => import('@/pages/SocialSoon'));
const Profile = lazyPage(() => import('@/pages/Profile'));

const Login = lazyPage(() => import('@/pages/auth/Login'));
const Register = lazyPage(() => import('@/pages/auth/Register'));
const Verify = lazyPage(() => import('@/pages/auth/Verify'));

const Dashboard = lazyPage(() => import('@/pages/admin/Dashboard'));
const RoomsManager = lazyPage(() => import('@/pages/admin/RoomsManager'));
const BookingsManager = lazyPage(() => import('@/pages/admin/BookingsManager'));
const ContentEditor = lazyPage(() => import('@/pages/admin/ContentEditor'));
const ClientsManager = lazyPage(() => import('@/pages/admin/ClientsManager'));
const Sales = lazyPage(() => import('@/pages/admin/Sales'));

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

// Дерево маршрутов вынесено в константу: по нему же preloadPage() находит,
// какие lazy-страницы нужны для текущего URL.
const appRoutes = (
  <>
    <Route element={<MainLayout />}>
      <Route index element={<Home />} />
      <Route path="rooms" element={<Rooms />} />
      <Route path="rooms/:slug" element={<RoomDetail />} />
      <Route path="booking" element={<Booking />} />
      <Route path="about" element={<About />} />
      <Route path="contacts" element={<Contacts />} />
      <Route path="gallery" element={<Gallery />} />
      <Route path="faq" element={<FAQ />} />
      <Route path="privacy" element={<PrivacyPolicy />} />
      <Route path="terms" element={<Terms />} />
      <Route path="consent" element={<Consent />} />
      <Route path="profile" element={<Profile />} />
      <Route path="social-soon" element={<SocialSoon />} />
    </Route>

    <Route path="auth" element={<AuthLayout />}>
      <Route path="login" element={<Login />} />
      <Route path="register" element={<Register />} />
      <Route path="verify" element={<Verify />} />
    </Route>

    <Route path="admin" element={<AdminLayout />}>
      <Route index element={<Dashboard />} />
      <Route path="rooms" element={<RoomsManager />} />
      <Route path="bookings" element={<BookingsManager />} />
      <Route path="clients" element={<ClientsManager />} />
      <Route path="sales" element={<Sales />} />
      <Route path="content" element={<ContentEditor />} />
    </Route>

    <Route path="*" element={<NotFound />} />
  </>
);

/** Загружает модули lazy-страниц, совпавших с pathname (см. lazyPage). */
export function preloadPage(pathname) {
  const matches = matchRoutes(createRoutesFromChildren(appRoutes), pathname) ?? [];
  return Promise.all(matches.map((m) => m.route.element?.type?.preload?.()));
}

export default function App() {
  return (
    <>
    <Toaster
      position="top-right"
      offset={{ top: 80 }}
      toastOptions={{
        duration: 5000,
        className: '!bg-white !text-text !border-bg-dark !shadow-lg',
      }}
      richColors
      closeButton
    />
    <ScrollToTop />
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {appRoutes}
      </Routes>
    </Suspense>
    </>
  );
}
