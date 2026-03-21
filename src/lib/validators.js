import { z } from 'zod';

export const bookingSchema = z.object({
  roomId: z.string({ required_error: 'Выберите номер' }).uuid('Некорректный номер'),
  checkIn: z.string({ required_error: 'Выберите дату заезда' }).date('Некорректная дата'),
  checkOut: z.string({ required_error: 'Выберите дату выезда' }).date('Некорректная дата'),
  guestsCount: z
    .number({ required_error: 'Укажите количество гостей' })
    .int()
    .min(1, 'Минимум 1 гость')
    .max(10, 'Максимум 10 гостей'),
  guestName: z
    .string({ required_error: 'Введите ваше имя' })
    .min(2, 'Имя должно содержать минимум 2 символа')
    .max(100, 'Имя слишком длинное'),
  guestEmail: z
    .string({ required_error: 'Введите email' })
    .email('Введите корректный email'),
  guestPhone: z.string().optional(),
  specialRequests: z.string().max(500, 'Максимум 500 символов').optional(),
});

export const reviewSchema = z.object({
  rating: z
    .number({ required_error: 'Поставьте оценку' })
    .int()
    .min(1, 'Минимальная оценка — 1')
    .max(5, 'Максимальная оценка — 5'),
  comment: z
    .string({ required_error: 'Напишите отзыв' })
    .min(10, 'Отзыв должен содержать минимум 10 символов')
    .max(1000, 'Отзыв слишком длинный'),
});

const NAME_RE = /^[\p{L}\s\-'.]+$/u;
const URL_RE = /https?:\/\/|www\./i;
const DISPOSABLE_DOMAINS = [
  'mailinator.com', 'tempmail.com', 'throwaway.email', 'guerrillamail.com',
  'yopmail.com', 'sharklasers.com', 'trashmail.com', 'fakeinbox.com',
  'tempail.com', 'dispostable.com', 'maildrop.cc',
];

export const contactSchema = z.object({
  name: z
    .string({ required_error: 'Введите ваше имя' })
    .min(2, 'Имя должно содержать минимум 2 символа')
    .max(100, 'Имя слишком длинное')
    .regex(NAME_RE, 'Имя может содержать только буквы, пробелы и дефисы'),
  email: z
    .string({ required_error: 'Введите email' })
    .min(1, 'Введите email')
    .email('Введите корректный email')
    .refine(
      (val) => !DISPOSABLE_DOMAINS.includes(val.split('@')[1]?.toLowerCase()),
      'Одноразовые почтовые сервисы не допускаются',
    ),
  phone: z.string().optional(),
  subject: z
    .string({ required_error: 'Введите тему сообщения' })
    .min(2, 'Тема должна содержать минимум 2 символа')
    .max(200, 'Тема слишком длинная')
    .refine((val) => !URL_RE.test(val), 'Ссылки в теме не допускаются'),
  message: z
    .string({ required_error: 'Введите сообщение' })
    .min(10, 'Сообщение должно содержать минимум 10 символов')
    .max(2000, 'Сообщение слишком длинное')
    .refine((val) => !URL_RE.test(val), 'Ссылки в сообщении не допускаются'),
  website: z.string().max(0).optional(),
});

export const loginSchema = z.object({
  email: z
    .string({ required_error: 'Введите email' })
    .min(1, 'Введите email')
    .email('Введите корректный email'),
  password: z
    .string({ required_error: 'Введите пароль' })
    .min(1, 'Введите пароль'),
});

export const registerSchema = z.object({
  fullName: z
    .string({ required_error: 'Введите ваше имя' })
    .min(2, 'Имя должно содержать минимум 2 символа')
    .max(100, 'Имя слишком длинное')
    .regex(NAME_RE, 'Имя может содержать только буквы, пробелы и дефисы'),
  email: z
    .string({ required_error: 'Введите email' })
    .min(1, 'Введите email')
    .email('Введите корректный email'),
  password: z
    .string({ required_error: 'Введите пароль' })
    .min(6, 'Пароль должен содержать минимум 6 символов'),
  confirmPassword: z
    .string({ required_error: 'Подтвердите пароль' })
    .min(1, 'Подтвердите пароль'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
});

export const profileSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Имя должно содержать минимум 2 символа')
    .max(100, 'Имя слишком длинное')
    .regex(NAME_RE, 'Имя может содержать только буквы, пробелы и дефисы')
    .optional()
    .or(z.literal('')),
  phone: z.string().optional(),
});
