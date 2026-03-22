export const SITE_NAME = 'Меганом Эко-дом';
export const SITE_URL = import.meta.env.VITE_SITE_URL || 'https://meganom-eco.ru';

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
