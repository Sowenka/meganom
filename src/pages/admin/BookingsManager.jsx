import { useEffect, useState } from 'react';
import { FiTrash2 } from 'react-icons/fi';
import { toast } from 'sonner';
import { getAdminBookings, updateBooking, deleteBooking } from '@/services/admin.service';
import { formatPrice, formatDate, cn } from '@/lib/utils';

const TABS = [
  { key: '',           label: 'Все' },
  { key: 'pending',    label: 'Ожидают' },
  { key: 'confirmed',  label: 'Подтверждены' },
  { key: 'completed',  label: 'Завершены' },
  { key: 'cancelled',  label: 'Отменены' },
];

const STATUS_LABELS = {
  pending:   'Ожидает',
  confirmed: 'Подтверждено',
  completed: 'Завершено',
  cancelled: 'Отменено',
};

const STATUS_CLS = {
  pending:   'bg-warning/10 text-warning   border-warning/20',
  confirmed: 'bg-success/10 text-success   border-success/20',
  cancelled: 'bg-error/10   text-error     border-error/20',
  completed: 'bg-primary/10 text-primary   border-primary/20',
};

const PAYMENT_LABELS = { unpaid: 'Не оплачено', paid: 'Оплачено', refunded: 'Возврат' };
const PAYMENT_CLS    = { unpaid: 'text-warning', paid: 'text-success', refunded: 'text-text-muted' };

export default function BookingsManager() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [tab, setTab]           = useState('');

  function load(status) {
    setLoading(true);
    getAdminBookings({ status: status || undefined })
      .then((d) => setBookings(d.bookings ?? []))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(tab); }, [tab]);

  async function handleStatus(bookingId, status) {
    try {
      await updateBooking({ bookingId, status });
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status } : b)),
      );
      toast.success('Статус обновлён');
    } catch (e) {
      toast.error(e.message);
    }
  }

  async function handlePayment(bookingId, paymentStatus) {
    try {
      await updateBooking({ bookingId, paymentStatus });
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, payment_status: paymentStatus } : b)),
      );
      toast.success('Оплата обновлена');
    } catch (e) {
      toast.error(e.message);
    }
  }

  async function handleDelete(bookingId, guestName) {
    if (!window.confirm(`Удалить бронирование гостя «${guestName}»?`)) return;
    try {
      await deleteBooking({ bookingId });
      setBookings((prev) => prev.filter((b) => b.id !== bookingId));
      toast.success('Бронирование удалено');
    } catch (e) {
      toast.error(e.message);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-serif text-2xl font-bold text-primary">Бронирования</h1>
        <p className="mt-1 text-sm text-text-muted">Управление всеми бронированиями</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 rounded-xl bg-bg-dark p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              'rounded-lg px-4 py-1.5 text-sm font-medium transition-colors',
              tab === t.key
                ? 'bg-white text-primary shadow-sm'
                : 'text-text-muted hover:text-text',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-bg-dark bg-white shadow-sm">
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-7 w-7 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : bookings.length === 0 ? (
          <div className="py-16 text-center text-sm text-text-muted">Бронирований нет</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-sm">
              <thead>
                <tr className="border-b border-bg-dark bg-bg text-left text-xs text-text-muted">
                  <th className="px-4 py-3">№</th>
                  <th className="px-4 py-3">Гость</th>
                  <th className="px-4 py-3">Номер</th>
                  <th className="px-4 py-3">Даты</th>
                  <th className="px-4 py-3">Ночей</th>
                  <th className="px-4 py-3">Сумма</th>
                  <th className="px-4 py-3">Статус</th>
                  <th className="px-4 py-3">Оплата</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-b border-bg-dark last:border-0 hover:bg-bg">
                    <td className="px-4 py-3 font-mono text-sm text-text-muted">
                      {b.booking_number ? `№${String(b.booking_number).padStart(4, '0')}` : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-text">{b.guest_name}</p>
                      <p className="text-xs text-text-muted">{b.guest_email}</p>
                    </td>
                    <td className="px-4 py-3 text-text-muted">{b.room_title || '-'}</td>
                    <td className="px-4 py-3 text-text-muted">
                      {formatDate(b.check_in)} → {formatDate(b.check_out)}
                    </td>
                    <td className="px-4 py-3 text-center text-text">{b.nights}</td>
                    <td className="px-4 py-3 font-semibold text-primary">{formatPrice(b.total_price)}</td>
                    <td className="px-4 py-3">
                      <select
                        value={b.status}
                        onChange={(e) => handleStatus(b.id, e.target.value)}
                        className={cn(
                          'rounded-lg border px-2 py-1 text-xs font-medium outline-none focus:ring-1 focus:ring-accent',
                          STATUS_CLS[b.status] ?? 'border-bg-dark text-text',
                        )}
                      >
                        {Object.entries(STATUS_LABELS).map(([v, l]) => (
                          <option key={v} value={v}>{l}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={b.payment_status}
                        onChange={(e) => handlePayment(b.id, e.target.value)}
                        className={cn(
                          'rounded-lg border border-bg-dark px-2 py-1 text-xs font-medium outline-none focus:ring-1 focus:ring-accent',
                          PAYMENT_CLS[b.payment_status],
                        )}
                      >
                        {Object.entries(PAYMENT_LABELS).map(([v, l]) => (
                          <option key={v} value={v}>{l}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => handleDelete(b.id, b.guest_name)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-error/10 hover:text-error"
                        title="Удалить"
                      >
                        <FiTrash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
