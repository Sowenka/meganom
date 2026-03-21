import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-lg">
        <a href="/" className="mb-6 block text-center text-2xl font-bold text-primary">
          Меганом
        </a>
        <Outlet />
      </div>
    </div>
  );
}
