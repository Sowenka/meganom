import { lazy, Suspense, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();
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
    return () => clearTimeout(id);
  }, [pathname]);
  return null;
}
import { Toaster } from 'sonner';
import { MainLayout } from '@/layouts/MainLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { AuthLayout } from '@/layouts/AuthLayout';

const Home = lazy(() => import('@/pages/Home'));
const Rooms = lazy(() => import('@/pages/Rooms'));
const RoomDetail = lazy(() => import('@/pages/RoomDetail'));
const Booking = lazy(() => import('@/pages/Booking'));
const About = lazy(() => import('@/pages/About'));
const Contacts = lazy(() => import('@/pages/Contacts'));
const Gallery = lazy(() => import('@/pages/Gallery'));
const PrivacyPolicy = lazy(() => import('@/pages/PrivacyPolicy'));
const Terms = lazy(() => import('@/pages/Terms'));
const FAQ = lazy(() => import('@/pages/FAQ'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const Profile = lazy(() => import('@/pages/Profile'));

const Login = lazy(() => import('@/pages/auth/Login'));
const Register = lazy(() => import('@/pages/auth/Register'));

const Dashboard = lazy(() => import('@/pages/admin/Dashboard'));
const RoomsManager = lazy(() => import('@/pages/admin/RoomsManager'));
const BookingsManager = lazy(() => import('@/pages/admin/BookingsManager'));
const ContentEditor = lazy(() => import('@/pages/admin/ContentEditor'));

function PageLoader() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

export default function App() {
  return (
    <>
    <Toaster
      position="top-right"
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
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

        <Route path="admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="rooms" element={<RoomsManager />} />
          <Route path="bookings" element={<BookingsManager />} />
          <Route path="content" element={<ContentEditor />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
    </>
  );
}
