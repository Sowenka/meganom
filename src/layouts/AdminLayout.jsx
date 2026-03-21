import { Outlet, NavLink } from 'react-router-dom';

const navItems = [
  { to: '/admin', label: 'Дашборд', end: true },
  { to: '/admin/rooms', label: 'Номера' },
  { to: '/admin/bookings', label: 'Бронирования' },
  { to: '/admin/content', label: 'Контент' },
];

export function AdminLayout() {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r border-bg-dark bg-white p-6">
        <h2 className="mb-6 text-xl font-bold text-primary">Админ-панель</h2>
        <nav className="flex flex-col gap-2">
          {navItems.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive ? 'bg-primary text-white' : 'text-text-muted hover:bg-bg-dark'
                }`
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>
        <a href="/" className="mt-8 block text-sm text-text-muted hover:text-primary">
          &larr; На сайт
        </a>
      </aside>

      <div className="flex-1 bg-bg p-8">
        <Outlet />
      </div>
    </div>
  );
}
