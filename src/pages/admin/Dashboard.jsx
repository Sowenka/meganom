import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { FiUsers, FiCalendar, FiClock, FiTrendingUp } from 'react-icons/fi';
import { toast } from 'sonner';
import { getAdminStats } from '@/services/admin.service';
import { formatPrice, formatDate, cn } from '@/lib/utils';

const STATUS_CONFIG = {
  pending:   { label: 'Ожидает',      cls: 'bg-warning/10 text-warning   border-warning/20' },
  confirmed: { label: 'Подтверждено', cls: 'bg-success/10 text-success   border-success/20' },
  cancelled: { label: 'Отменено',     cls: 'bg-error/10   text-error     border-error/20'   },
  completed: { label: 'Завершено',    cls: 'bg-primary/10 text-primary   border-primary/20' },
};

function StatTile({ icon, label, value, sub, accent }) {
  return (
    <div className="rounded-2xl border border-bg-dark bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-text-muted">{label}</span>
        <span className={cn('flex h-9 w-9 items-center justify-center rounded-full', accent || 'bg-primary/10')}>
          {icon}
        </span>
      </div>
      <p className="font-serif text-3xl font-bold text-primary">{value}</p>
      {sub && <p className="mt-1 text-xs text-text-muted">{sub}</p>}
    </div>
  );
}

function monthLabel(m) {
  if (!m) return '';
  const [y, mo] = m.split('-');
  const names = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];
  return names[parseInt(mo, 10) - 1] + ' ' + y.slice(2);
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminStats()
      .then(setStats)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const chartData = (stats?.bookings_by_month ?? []).map((d) => ({
    ...d,
    name: monthLabel(d.month),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-primary">Дашборд</h1>
        <p className="mt-1 text-sm text-text-muted">Общая статистика сервиса</p>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatTile
          icon={<FiUsers className="h-4 w-4 text-primary" />}
          label="Пользователей"
          value={stats?.total_users ?? 0}
          accent="bg-primary/10"
        />
        <StatTile
          icon={<FiCalendar className="h-4 w-4 text-accent" />}
          label="Бронирований"
          value={stats?.total_bookings ?? 0}
          accent="bg-accent/10"
        />
        <StatTile
          icon={<FiTrendingUp className="h-4 w-4 text-success" />}
          label="Выручка"
          value={formatPrice(stats?.total_revenue ?? 0)}
          sub="без отменённых"
          accent="bg-success/10"
        />
        <StatTile
          icon={<FiClock className="h-4 w-4 text-warning" />}
          label="Ожидают"
          value={stats?.pending_bookings ?? 0}
          sub="требуют подтверждения"
          accent="bg-warning/10"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-bg-dark bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-text">Бронирования по месяцам</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE6" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #F0EDE6', fontSize: 12 }}
                formatter={(v) => [v, 'Броней']}
              />
              <Bar dataKey="count" fill="#1B3A4B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-bg-dark bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-text">Выручка по месяцам, ₽</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#C9A96E" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#C9A96E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F0EDE6" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6B7280' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} tickFormatter={(v) => (v / 1000) + 'к'} />
              <Tooltip
                contentStyle={{ borderRadius: 8, border: '1px solid #F0EDE6', fontSize: 12 }}
                formatter={(v) => [formatPrice(v), 'Выручка']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#C9A96E" strokeWidth={2} fill="url(#revGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Status breakdown */}
      <div className="rounded-2xl border border-bg-dark bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-text">Статусы бронирований</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
            <div key={key} className={cn('rounded-xl border p-4 text-center', cfg.cls)}>
              <p className="font-serif text-2xl font-bold">
                {stats?.bookings_by_status?.[key] ?? 0}
              </p>
              <p className="mt-1 text-xs font-medium">{cfg.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent bookings */}
      <div className="rounded-2xl border border-bg-dark bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-bg-dark px-5 py-4">
          <h2 className="text-sm font-semibold text-text">Последние бронирования</h2>
          <Link to="/admin/bookings" className="text-xs text-accent transition-colors duration-200 hover:text-primary">
            Все бронирования →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-bg-dark bg-bg text-left text-xs text-text-muted">
                <th className="px-5 py-3">Гость</th>
                <th className="px-5 py-3">Номер</th>
                <th className="px-5 py-3">Заезд</th>
                <th className="px-5 py-3">Сумма</th>
                <th className="px-5 py-3">Статус</th>
              </tr>
            </thead>
            <tbody>
              {(stats?.recent_bookings ?? []).map((b) => {
                const cfg = STATUS_CONFIG[b.status] ?? { label: b.status, cls: 'bg-bg-dark text-text-muted border-bg-dark' };
                return (
                  <tr key={b.id} className="border-b border-bg-dark last:border-0 hover:bg-bg">
                    <td className="px-5 py-3 font-medium text-text">{b.guest_name}</td>
                    <td className="px-5 py-3 text-text-muted">{b.room_title || '-'}</td>
                    <td className="px-5 py-3 text-text-muted">{formatDate(b.check_in)}</td>
                    <td className="px-5 py-3 font-semibold text-primary">{formatPrice(b.total_price)}</td>
                    <td className="px-5 py-3">
                      <span className={cn('rounded-full border px-2.5 py-0.5 text-xs font-medium', cfg.cls)}>
                        {cfg.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {!stats?.recent_bookings?.length && (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-sm text-text-muted">
                    Бронирований пока нет
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
