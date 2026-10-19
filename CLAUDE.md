# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

**Язык:** Русский. Код и коммиты — английский.

## Проект

Meganom Eco-dom — fullstack сайт бронирования гостиничного комплекса в Крыму.
Домен: `meganom-eco.ru` | БД: PostgreSQL `mmosowmail` на `pg4.sweb.ru:5433`
Без Supabase — PHP API + PostgreSQL.

## Команды

```bash
npm run dev / build / preview / lint / format / test / test:e2e
npx vitest run tests/unit/someFile.test.js  # один тест
```

## Стек

React 19 + Vite 8 + Tailwind 4 + React Router 7 + Zustand + TanStack Query + React Hook Form + Zod
PHP REST API (_api/) | JWT (localStorage: meganom_token, meganom_user) | i18n: react-i18next RU/EN (default RU)
Тосты: sonner | Даты: date-fns | Маски: react-imask | Анимации: framer-motion | Кроп аватара: react-easy-crop

## Архитектура

**Поток данных:** `src/services/*.service.js` → `src/hooks/use*.js` → `src/pages/*.jsx`

Источники данных:
- rooms.service.js → STATIC_ROOMS из `src/data/rooms.js` (не через API)
- booking.service.js → PHP API `/api/bookings/*` (принимает camelCase → маппит в snake_case)
- useWeather.js → api.open-meteo.com напрямую, кэш localStorage 30 мин
- auth.service.js, admin.service.js → PHP API

Layouts: MainLayout (публичный) | AuthLayout (/auth/*) | AdminLayout (/admin/*)
Все страницы lazy через `React.lazy()` + `<Suspense>` в App.jsx

**Компоненты:** `src/components/ui/` (Button, Input, PhoneInput, Textarea, ScrollToTopButton, barrel-export index.js) | `src/components/features/` (auth, booking, gallery, reviews, rooms) | `src/components/seo/` (MetaTags, SchemaOrg)

**Пути к изображениям:** всегда через `import.meta.env.BASE_URL` (не хардкодить `/`).

**Dev proxy:** `/api/*` → `https://meganom-eco.ru` (настроен в vite.config.js — локальная разработка обращается к prod API)

**Статика:** `src/data/gallery.js` импортируется напрямую в Gallery.jsx (нет хука). Тексты номеров — только через i18n ключи `staticRooms.<slug>.*`, не через data-файл.

**StableText:** Использовать `<StableText tKey="..." />` вместо `{t('...')}` в горизонтальных flex-строках (nav, tabs, badges) и grid-ячейках где высота влияет на соседей.

## Критические правила

1. **НИКОГДА не коммить .env**
2. Mobile-First вёрстка
3. Тексты в i18n (`src/i18n/ru.json`, `en.json`), конфиги в `constants.js`
4. Только react-icons, никаких эмодзи
5. Именованные экспорты, PropTypes обязательны
6. `cn()` из `@/lib/utils` для условных классов
7. Деплой только по явной команде пользователя
8. **КРИТИЧНО — Apache вырезает Authorization header:** `.htaccess` ОБЯЗАН иметь `RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]`
9. **КРИТИЧНО — race condition:** после `signIn()`/`verifyEmail()` ВСЕГДА `setUser()` ДО `navigate()`
10. **КРИТИЧНО — DirectorySlash:** `.htaccess` ОБЯЗАН иметь `DirectorySlash Off`. Без него Apache делает `/about` → 301 → `http://about/` (HTTP downgrade), т.к. nginx на Spaceweb терминирует SSL до Apache. Не добавлять `RewriteCond %{HTTPS} off` — это вызовет бесконечный редирект.
11. **HTTP→HTTPS redirect:** Использовать `RewriteCond %{HTTP:X-Forwarded-Proto} =http` — nginx Spaceweb передаёт этот заголовок. НЕ использовать `%{HTTPS} off` — он всегда "off" на стороне Apache и вызывает бесконечный цикл.

## Утилиты (src/lib/utils.js)

`cn()` — условные классы | `formatPrice(amount, currency?)` — рубли через Intl | `formatDate(date, options?)` — русская локаль

## Деплой

SSH: `mmosowmail@77.222.40.4` | Path: `/home/m/mmosowmail/meganom-eco_ru/public_html/`
Pass: `~/.claude/projects/.../memory/ssh_access.md`

```bash
npm run build

# ВСЕГДА деплоить вместе (assets + все pre-rendered HTML):
set P=mmosowmail@77.222.40.4:/home/m/mmosowmail/meganom-eco_ru/public_html
pscp -pw "PASS" "dist\assets\*"   %P%/assets/
pscp -pw "PASS" "dist\index.html" %P%/index.html
pscp -pw "PASS" "dist\sitemap.xml" %P%/sitemap.xml
pscp -pw "PASS" "dist\404.html"   %P%/404.html
pscp -pw "PASS" "dist\spa.html"   %P%/spa.html
pscp -pw "PASS" "dist\.htaccess"  %P%/.htaccess
pscp -pw "PASS" -r "dist\about"    %P%/
pscp -pw "PASS" -r "dist\rooms"    %P%/
pscp -pw "PASS" -r "dist\contacts" %P%/
pscp -pw "PASS" -r "dist\faq"      %P%/
pscp -pw "PASS" -r "dist\booking"  %P%/
pscp -pw "PASS" -r "dist\gallery"  %P%/
pscp -pw "PASS" -r "dist\privacy"  %P%/
pscp -pw "PASS" -r "dist\terms"    %P%/
pscp -pw "PASS" -r "dist\consent"  %P%/

# PHP — только если изменились _api/*.php
```

**ВАЖНО:** Pre-rendered HTML (`dist\rooms\*`, `dist\about`, ...) содержат хэши от текущего билда. Если деплоить только `assets\*` без них — на сервере остаются СТАРЫЕ pre-rendered файлы со старыми хэшами JS → 404 на скриптах → Яндекс видит "Ошибка".

**Пререндер = снимки страниц.** `npm run build` открывает собранный сайт в headless Chromium (Playwright из devDependencies; если его Chromium не скачан - установленный Google Chrome) и кладёт видимую разметку каждой страницы в её HTML, плюс `dist/404.html`. Без браузера билд падает; `SKIP_PRERENDER=1` собирает со старым скрытым текстом - такой билд не деплоить (скрытый текст = "малоценные страницы" в Яндексе). Новую публичную страницу добавлять в `routeMetadata`/`roomMetadata` плагина, в sitemap (`vite.config.js`) и в список деплоя; клиентские маршруты без пререндера - в правило "Priority 2" `.htaccess`, иначе они будут отдавать 404.

**Переобход после деплоя (IndexNow).** Ключ лежит в `public/ab740078dd94e7c33d1f1ac73f06d7a2.txt` (он же в корне сервера). Отправить все URL из sitemap в Яндекс (работает, даже когда "Переобход страниц" в Вебмастере недоступен; ответ 200/202 = принято):
```bash
KEY=ab740078dd94e7c33d1f1ac73f06d7a2
URLS=$(grep -o '<loc>[^<]*' dist/sitemap.xml | sed 's/<loc>//' | node -e "console.log(JSON.stringify(require('fs').readFileSync(0,'utf8').trim().split('\n')))")
curl -X POST https://yandex.com/indexnow -H 'Content-Type: application/json; charset=utf-8' \
  -d "{\"host\":\"meganom-eco.ru\",\"key\":\"$KEY\",\"keyLocation\":\"https://meganom-eco.ru/$KEY.txt\",\"urlList\":$URLS}"
```

**migrate.php** — локальный CLI (`php migrate.php`) с захардкоженными dev-credentials. **НЕ деплоить на сервер.**

## Документация (читать по необходимости)

- `.claude/docs/api.md` — PHP API endpoints, DB schema, auth flow
- `.claude/docs/architecture.md` — компоненты, i18n slugs, StableText, дизайн-система
