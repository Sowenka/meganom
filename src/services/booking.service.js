import { getToken } from './auth.service';

const API_BASE = '/api';

/**
 * Create a booking.
 * Accepts camelCase from the form + roomTitle for the email notification.
 */
export async function createBooking({
  roomId,
  checkIn,
  checkOut,
  guestsCount,
  guestName,
  guestEmail,
  guestPhone,
  specialRequests,
  nights,
  total,
  roomTitle = '',
}) {
  const res = await fetch(`${API_BASE}/bookings/create.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify({
      room_id:          roomId,
      check_in:         checkIn,
      check_out:        checkOut,
      guests_count:     guestsCount,
      guest_name:       guestName,
      guest_email:      guestEmail,
      guest_phone:      guestPhone || '',
      special_requests: specialRequests || '',
      total_price:      total,
      nights,
      room_title:       roomTitle,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Ошибка при создании бронирования');
  return data;
}

export async function getUserBookings() {
  const token = getToken();
  if (!token) return [];
  try {
    const res = await fetch(`${API_BASE}/bookings/list.php`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.bookings ?? [];
  } catch {
    return [];
  }
}
