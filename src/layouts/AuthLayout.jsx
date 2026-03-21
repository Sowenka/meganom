import { Outlet } from 'react-router-dom';
import { Logo } from '@/components/Logo';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <Logo dark className="mb-6 justify-center" />
        <Outlet />
      </div>
    </div>
  );
}
