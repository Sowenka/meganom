import { getToken } from './auth.service';

const API_BASE = '/api';

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  };
}

async function apiFetch(url, options = {}) {
  const res = await fetch(url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Ошибка сервера');
  return data;
}

export async function getAdminStats() {
  return apiFetch(`${API_BASE}/admin/stats.php`, { headers: authHeaders() });
}

export async function getAdminSales() {
  return apiFetch(`${API_BASE}/admin/sales.php`, { headers: authHeaders() });
}

export async function getAdminUsers() {
  return apiFetch(`${API_BASE}/admin/users/list.php`, { headers: authHeaders() });
}

export async function updateUserRole({ userId, role }) {
  return apiFetch(`${API_BASE}/admin/users/update-role.php`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ user_id: userId, role }),
  });
}

export async function deleteUser({ userId }) {
  return apiFetch(`${API_BASE}/admin/users/delete.php`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ user_id: userId }),
  });
}

export async function getAdminBookings({ status } = {}) {
  const url = status
    ? `${API_BASE}/admin/bookings/list.php?status=${status}`
    : `${API_BASE}/admin/bookings/list.php`;
  return apiFetch(url, { headers: authHeaders() });
}

export async function updateBooking({ bookingId, status, paymentStatus }) {
  const body = { booking_id: bookingId };
  if (status !== undefined) body.status = status;
  if (paymentStatus !== undefined) body.payment_status = paymentStatus;
  return apiFetch(`${API_BASE}/admin/bookings/update.php`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  });
}

export async function deleteBooking({ bookingId }) {
  return apiFetch(`${API_BASE}/admin/bookings/delete.php`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ booking_id: bookingId }),
  });
}
