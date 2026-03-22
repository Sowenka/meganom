const API_URL = import.meta.env.VITE_API_URL;

export async function createBooking(data) {
  if (!API_URL) {
    // Dev / GitHub Pages — simulate success
    await new Promise((r) => setTimeout(r, 800));
    return { id: `booking-${Date.now()}`, ...data, status: 'pending' };
  }
  const res = await fetch(`${API_URL}/bookings.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Ошибка при создании бронирования');
  }
  return res.json();
}

export async function getUserBookings(userId) {
  if (!API_URL) return [];
  const res = await fetch(`${API_URL}/bookings.php?user_id=${encodeURIComponent(userId)}`);
  if (!res.ok) return [];
  return res.json();
}
