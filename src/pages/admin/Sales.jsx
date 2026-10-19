import { useEffect, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { FiDollarSign, FiCheckCircle, FiClock } from 'react-icons/fi';
import { toast } from 'sonner';
import { getAdminSales } from '@/services/admin.service';
import { formatPrice, cn } from '@/lib/utils';

function monthLabel(m) {
  if (!m) return '';
  const [y, mo] = m.split('-');
  const names = ['Янв','Фев','Мар','Апр','Май','Июн','Июл','Авг','Сен','Окт','Ноя','Дек'];
  return names[parseInt(mo, 10) - 1] + ' ' + y.slice(2);
}

function StatTile({ icon, label, value, sub, accent }) {
  return (
    <div className="rounded-2xl border border-bg-dark bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-text-muted">{label}</span>
        <span className={cn('flex h-9 w-9 items-center justify-center rounded-full', accent)}>
          {icon}
        </span>
      </div>
      <p className="font-serif text-3xl font-bold text-primary">{value}</p>
      {sub && <p className="mt-1 text-xs text-text-muted">{sub}</p>}
    </div>
  );
}

export default function Sales() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminSales()
      .then(setData)
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

  const chartData = (data?.revenue_by_month ?? []).map((d) => ({
    name: monthLabel(d.month),
    revenue: d.revenue,
  }));

  const topRooms = data?.top_rooms ?? [];
  const maxRevenue = topRooms[0]?.revenue || 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-primary">Продажи</h1>
        <p className="mt-1 text-sm text-text-muted">Финансовая аналитика сервиса</p>
      </div>

      {/* Financial tiles */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatTile
          icon={<FiDollarSign className="h-4 w-4 text-primary" />}
          label="Общая выручка"
          value={formatPrice(data?.total_revenue ?? 0)}
          sub="без отменённых броней"
          accent="bg-primary/10"
        />
        <StatTile
          icon={<FiCheckCircle className="h-4 w-4 text-success" />}
          label="Оплачено"
          value={formatPrice(data?.paid_revenue ?? 0)}
          sub="payment_status = paid"
          accent="bg-success/10"
        />
        <StatTile
          icon={<FiClock className="h-4 w-4 text-warning" />}
          label="Ожидает оплаты"
          value={formatPrice(data?.unpaid_revenue ?? 0)}
          sub="активные, не оплачены"
          accent="bg-warning/10"
        />
      </div>

      {/* Revenue chart */}
      <div className="rounded-2xl border border-bg-dark bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-text">Выручка по месяцам за год, ₽</h2>
        {chartData.length === 0 ? (
          <div className="flex h-48 items-center justify-center text-sm text-text-muted">
            Данных пока нет
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#C9A96E" stopOpacity={0.3} />
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
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#C9A96E"
                strokeWidth={2.5}
                fill="url(#salesGrad)"
                dot={{ fill: '#C9A96E', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Top rooms */}
      <div className="rounded-2xl border border-bg-dark bg-white shadow-sm">
        <div className="border-b border-bg-dark px-5 py-4">
          <h2 className="text-sm font-semibold text-text">Топ номеров по выручке</h2>
        </div>
        {topRooms.length === 0 ? (
          <div className="py-12 text-center text-sm text-text-muted">Данных пока нет</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-bg-dark bg-bg text-left text-xs text-text-muted">
                  <th className="px-5 py-3">Номер</th>
                  <th className="px-5 py-3">Бронирований</th>
                  <th className="px-5 py-3">Выручка</th>
                  <th className="px-5 py-3 w-1/3">Доля</th>
                </tr>
              </thead>
              <tbody>
                {topRooms.map((r, i) => {
                  const pct = Math.round((r.revenue / maxRevenue) * 100);
                  return (
                    <tr key={i} className="border-b border-bg-dark last:border-0 hover:bg-bg">
                      <td className="px-5 py-3 font-medium text-text">{r.title}</td>
                      <td className="px-5 py-3 text-center">
                        <span className="inline-flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-primary/10 px-2 text-xs font-semibold text-primary">
                          {r.bookings_count}
                        </span>
                      </td>
                      <td className="px-5 py-3 font-semibold text-primary">{formatPrice(r.revenue)}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-bg-dark">
                            <div
                              className="h-full rounded-full bg-accent transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-9 text-right text-xs text-text-muted">{pct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
