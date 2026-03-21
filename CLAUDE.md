# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Язык общения:** Русский. Код, комментарии к коммитам и технические термины — на английском.

---

## О проекте

**Crimea (Меганом Эко-дом)** — fullstack-сайт для гостиничного комплекса в Крыму. Платформа бронирования номеров с админ-панелью, системой оплаты и CMS.

Бизнес-требования: витрина номеров с галереями, онлайн-бронирование с календарём доступности, личный кабинет гостя, админ-панель, SEO под Яндекс/Google, Mobile-First.

---

## Технологический стек

**Frontend:** React 19 + Vite 8 + Tailwind CSS 4 + React Router 7
**Состояние:** Zustand (UI) + TanStack Query (серверное состояние)
**Формы:** React Hook Form + Zod (валидация в `src/lib/validators.js`)
**Анимации:** Framer Motion
**i18n:** react-i18next (RU/EN), default language: RU
**Даты:** date-fns
**Тосты:** sonner
**Маски ввода:** react-imask (телефонный ввод)
**CSS-утилиты:** clsx + tailwind-merge (обёртка `cn()` в `src/lib/utils.js`)

**Backend:** Supabase (PostgreSQL, Auth, Storage, Edge Functions, RLS)

---

## Команды

```bash
npm run dev          # Dev-сервер на localhost:3000 (auto-open)
npm run build        # Production-сборка
npm run preview      # Предпросмотр сборки
npm run lint         # Линтинг (ESLint)
npm run format       # Форматирование (Prettier)
npm run test         # Юнит-тесты (Vitest)
npm run test:e2e     # E2E тесты (Playwright)
```

Запуск одного теста: `npx vitest run tests/unit/someFile.test.js`
Тесты лежат в `tests/unit/` (юнит, `*.test.{js,jsx}`) и `tests/e2e/` (Playwright).
Vitest setup: `tests/setup.js`, environment: jsdom, globals: true.

---

## Архитектура

### Потоки данных: Service → Hook → Component

```
src/services/*.service.js   — Supabase-запросы (прямые вызовы supabase client)
src/hooks/use*.js           — TanStack Query обёртки над сервисами (queryKey, queryFn, enabled)
src/pages/*.jsx             — Страницы, используют хуки для получения данных
src/components/*.jsx        — Переиспользуемые компоненты
```

Пример: `rooms.service.js` → `useRooms.js` hook → `Rooms.jsx` page.

### Маршрутизация и лейауты

Три layout-обёртки через `<Outlet />`:
- **MainLayout** (`/`) — Header + Footer + CookieBanner. Публичные страницы.
- **AuthLayout** (`/auth/*`) — Страницы входа/регистрации.
- **AdminLayout** (`/admin/*`) — Sidebar с навигацией. Управление номерами, бронированиями, контентом.

Все страницы lazy-loaded через `React.lazy()` + `<Suspense>` в `App.jsx`.

### Провайдеры (main.jsx)

`StrictMode` → `QueryClientProvider` (staleTime: 5 мин, retry: 1) → `BrowserRouter` → `App`

### Состояние

- **Zustand stores** (`src/store/`): `useAuthStore` (user, isLoading), `useBookingStore`, `useUIStore` — для UI-состояния, не требующего серверной синхронизации.
- **TanStack Query**: всё серверное состояние (rooms, bookings и т.д.).

### Build — chunk splitting (vite.config.js)

Ручное разделение: `vendor` (react-dom, react-router), `query` (tanstack), `ui` (framer-motion).

### Supabase

- Client: `src/lib/supabase.js` — graceful null если env-переменные не заданы (сервисы проверяют `if (!supabase)`).
- Миграции: `supabase/migrations/`
- Edge Functions: `supabase/functions/` (TypeScript)
- Seed: `supabase/seed.sql`

---

## Схема базы данных (Supabase PostgreSQL)

```sql
-- Номера
rooms (id UUID PK, title, slug UNIQUE, description, short_description,
  room_type ENUM('standard','comfort','suite','deluxe','presidential'),
  capacity INT, area_sqm DECIMAL, price_per_night DECIMAL, currency DEFAULT 'RUB',
  amenities JSONB, is_active BOOLEAN, sort_order INT, created_at, updated_at)

-- Фотографии номеров
room_images (id UUID PK, room_id FK->rooms CASCADE, url, alt,
  is_cover BOOLEAN, sort_order INT)

-- Бронирования
bookings (id UUID PK, room_id FK->rooms, user_id FK->auth.users,
  check_in DATE, check_out DATE, guests_count INT, total_price DECIMAL,
  status ENUM('pending','confirmed','cancelled','completed'),
  payment_status ENUM('unpaid','paid','refunded'),
  guest_name, guest_email, guest_phone, special_requests, created_at, updated_at)

-- Отзывы
reviews (id UUID PK, booking_id FK->bookings, user_id FK->auth.users,
  rating INT CHECK(1-5), comment, is_approved BOOLEAN, created_at)

-- CMS-страницы
pages (id UUID PK, slug UNIQUE, title, content JSONB,
  meta_title, meta_description, is_published BOOLEAN, created_at, updated_at)

-- Настройки
settings (id UUID PK, key UNIQUE, value JSONB, group_name)
```

**RLS-политики:**
- `rooms` — чтение: все, запись: admin
- `bookings` — пользователь видит свои, admin видит все
- `reviews` — approved видны всем, модерация: admin
- `pages` — published: все, черновики: admin
- `settings` — чтение: все, запись: admin

---

## Дизайн-система

**Стиль:** Organic Luxury — мягкие формы, натуральная палитра, Bento Grid + Glassmorphism акценты.
**Типографика:** Serif (Georgia) для заголовков, system-ui sans-serif для текста. Определено в `src/index.css`.

### Цветовая палитра (Tailwind 4 `@theme` в `src/index.css`)
```
--color-primary: #1B3A4B        /* Глубокий морской */
--color-primary-light: #3D6B7E  /* Морская волна */
--color-accent: #C9A96E         /* Золотой песок */
--color-accent-warm: #E8C48A    /* Тёплый песок */
--color-bg: #FAFAF7             /* Слоновая кость */
--color-bg-dark: #F0EDE6        /* Тёплый серый */
--color-text: #2C2C2C           /* Основной текст */
--color-text-muted: #6B7280     /* Приглушённый текст */
--color-success: #4CAF50
--color-error: #E53935
--color-warning: #FF9800
```

Цвета используются напрямую как Tailwind-классы: `bg-primary`, `text-accent`, `border-bg-dark` и т.д.

### Брейкпоинты (Mobile-First)
`sm: 640px` | `md: 768px` | `lg: 1024px` | `xl: 1280px` | `2xl: 1536px`

---

## Конвенции кода

### Компоненты
- Только функциональные компоненты с **именованным экспортом**
- PropTypes обязательны для каждого компонента
- Только Tailwind (никакого CSS-in-JS), используй `cn()` из `@/lib/utils` для условных классов
- Barrel exports через `index.js` в папках компонентов (см. `src/components/ui/index.js`)
- Импорт-алиасы: `@/*` → `src/*`

### Иконки
- **react-icons** — единственный источник иконок
- **НИКОГДА не использовать эмодзи, смайлы, Unicode-символы** вместо иконок
- **НИКОГДА не использовать inline SVG** — всегда импортировать из react-icons

### Именование файлов
- PascalCase для компонентов (`Button.jsx`, `RoomCard.jsx`)
- camelCase для утилит и хуков (`useAuth.js`, `utils.js`)
- Сервисы: `*.service.js` (camelCase)

### Валидация форм
Все Zod-схемы сосредоточены в `src/lib/validators.js`. Формы контактов используют honeypot-поле `website` для защиты от спама.

### Константы
Бизнес-константы (типы номеров, статусы бронирований) в `src/lib/constants.js`. Сайт: "Меганом Эко-дом".

### Git
- Коммиты: `type(scope): description` (conventional commits)
- Ветки: `feature/booking-calendar`, `fix/room-gallery-swipe`

### Форматирование (prettier.config.js)
singleQuote, trailingComma: 'all', tabWidth: 2, semi: true, printWidth: 100, prettier-plugin-tailwindcss.

---

## SEO и доступность

**SEO:** уникальные title/meta description на каждой странице (компонент `MetaTags` в `src/components/seo/`), Open Graph, Schema.org (Hotel, LodgingBusiness, Review), robots.txt, sitemap.xml, семантический HTML, canonical URL, Яндекс.Метрика + GA4.

**a11y:** ARIA-атрибуты, навигация клавиатурой, контрастность WCAG 2.1 AA, focus-visible, `lang="ru"`.

---

## Критические правила

1. **НИКОГДА не коммить `.env`** — только `.env.example`
2. **Mobile-First** — вёрстка начинается с мобильной версии
3. **RLS в Supabase** — каждая таблица должна иметь политики
4. **Никаких хардкодов** — тексты в i18n (`src/i18n/ru.json`, `src/i18n/en.json`), конфиги в `constants.js`
5. **Семантический HTML** — div только когда нет подходящего тега
6. **Lazy loading** страниц через React.lazy + Suspense, code splitting по маршрутам
7. **Изображения:** WebP/AVIF, srcset, lazy loading с blur placeholder
8. **Lighthouse:** 90+ по всем метрикам, LCP < 2.5s, CLS < 0.1

---

## Переменные окружения

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_GA_ID=                     # Google Analytics 4
VITE_YM_ID=                     # Яндекс.Метрика
VITE_SITE_URL=                  # Каноничный URL сайта
```
