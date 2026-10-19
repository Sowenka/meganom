import { STATIC_ROOMS } from '@/data/rooms';

// Номера - статические данные. Синхронные версии нужны хукам для initialData:
// страница рендерится с данными сразу, без скелетона (важно для пререндера).
export function findRooms({ type, isActive = true } = {}) {
  return STATIC_ROOMS.filter(
    (r) => r.is_active === isActive && (!type || r.room_type === type),
  );
}

export function findRoomBySlug(slug) {
  return STATIC_ROOMS.find((r) => r.slug === slug) ?? null;
}

export async function getRooms(filters) {
  return findRooms(filters);
}

export async function getRoomBySlug(slug) {
  return findRoomBySlug(slug);
}
