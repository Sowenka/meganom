export const SITE_NAME = 'Меганом Эко-дом';
export const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://meganom-eco.ru';

// ── Сезон ───────────────────────────────────────────────────────────────────
// Когда отель закрыт (SEASON_OPEN = false): сайт остаётся просматриваемым,
// но бронирование и регистрация заблокированы заглушкой. Чтобы открыть новый
// сезон — поставить true и пересобрать фронт. Серверный флаг-дублёр живёт
// в _api/config.php (SEASON_OPEN) и должен совпадать.
export const SEASON_OPEN = false;
export const SEASON_YEAR = 2026;

export const ROOM_TYPES = {
  standard: 'Стандарт',
  comfort: 'Комфорт',
  suite: 'Люкс',
  deluxe: 'Делюкс',
  presidential: 'Президентский',
};

export const BOOKING_STATUS = {
  pending: 'Ожидает',
  confirmed: 'Подтверждено',
  cancelled: 'Отменено',
  completed: 'Завершено',
};

export const PAYMENT_STATUS = {
  unpaid: 'Не оплачено',
  paid: 'Оплачено',
  refunded: 'Возврат',
};
