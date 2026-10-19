# PROJECT_MEMORY - Меганом Эко-дом

## До 2026-04-01 (сжато)

Построен fullstack сайт: React 19 + Vite + Tailwind 4 + PHP API + PostgreSQL (Spaceweb).
Домен meganom-eco.ru, хостинг mmosowmail@77.222.40.4.
Удалён Supabase, заменён на PHP REST API (_api/).
Настроен auth: регистрация -> email-код -> JWT. Баг Apache: htaccess ОБЯЗАН иметь `RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]`.
Race condition: после signIn()/verifyEmail() ВСЕГДА setUser() ДО navigate().
SEO: robots.txt открыт, Яндекс.Вебмастер настроен (счётчик 108212418, региональность Судак), Google Search Console настроен.
Все номера актуализированы (8 штук), тексты только через i18n.
SchemaOrg.jsx добавлен на Home и RoomDetail.
Сессия топчан -> кровать (slug semeynyy-topcan оставлен).

---

## Сессия 2026-04-01 - SEO pre-rendering, новый IP

**Проблема:** Яндекс.Вебмастер: одинаковые title/description на всех страницах.
Причина: MetaTags.jsx через useEffect - бот получал голый index.html без уникальных тегов.

**Решение:** создан `vite-plugin-seo-prerender.js` - кастомный Vite плагин.
- Генерирует 17 статических HTML при `npm run build` (9 статических + 8 номеров)
- Каждый файл: уникальный title, meta description, og:*, canonical
- Подключён в vite.config.js, .htaccess обновлён (Priority 1: pre-rendered, Priority 2: SPA)

**IP хостинга изменился:** 77.222.62.71 -> 77.222.40.4 (изменился 2026-04-01).

**Деплой:** полный (assets + 17 pre-rendered dirs). Страницы отправлены на переобход.

---

## Сессия 2026-04-05 - Исправление ошибок индексации Яндекс.Вебмастер

**Проблема (корневая причина найдена):**
Яндекс.Вебмастер показывал "Ошибка" для /about, /rooms, /contacts, 6 из 8 номеров.
Причина: deploy-скрипт обновлял только `assets/*` + `index.html`, но НЕ pre-rendered субдиректории.
После каждого билда хеши меняются -> старые pre-rendered HTML ссылались на удалённые JS файлы -> React не грузился.

**Исправления на сервере:**
- Удалён `dbtest.php` - КРИТИЧНО: был открытый доступ к паролю БД
- Удалён `404.html` - GitHub Pages хак, на Apache работал неправильно
- Очищено 1040 устаревших JS файлов из assets/ (накопились за ~55 билдов)
- Задеплоены все 17 pre-rendered директорий с актуальными хешами (index-BooqdgHu.js)

**Исправлен старый IP в коде:**
- `_api/config.php` - ALLOWED_IPS whitelist: 77.222.62.71 -> 77.222.40.4
- `_api/setup/.htaccess` - Allow from: 77.222.62.71 -> 77.222.40.4

**Обновлён CLAUDE.md - секция Деплой:**
Добавлены pscp команды для всех pre-rendered директорий. Добавлено предупреждение:
"Pre-rendered HTML содержат хеши от текущего билда. Деплоить ВСЕГДА вместе с assets."

**Состояние сервера после деплоя:**
- assets/: 43 файла текущего билда (все хеши совпадают с pre-rendered HTML)
- Все pre-rendered dirs: about/, contacts/, faq/, booking/, gallery/, rooms/ (+8 slugs), privacy/, terms/
- .htaccess, robots.txt, sitemap.xml - проверены, OK
- PHPMailer в api/phpmailer/src/ - цел

**Следующий шаг (вручную):**
Яндекс.Вебмастер -> Переобход страниц -> отправить:
/about, /rooms, /contacts, /rooms/standart-kuhnya, /rooms/standart-balkon,
/rooms/shale, /rooms/semeynyy-balkon, /rooms/semeynyy-topcan,
/rooms/veter-peremen-myata, /rooms/kvartet-grand, /rooms/veter-peremen-med,
/faq, /booking, /gallery

---

## Сессия 2026-04-05 - Фикс Google индексации (статический контент в pre-render)

**Проблема (Google):**
6 страниц (/about, /contacts, /faq, /gallery, /privacy, /terms) со статусом "Обнаружена, не проиндексирована", дата сканирования "Отсутствует".
Причина: pre-rendered HTML имел правильные meta-теги, но тело страницы = пустой `<div id="root"></div>`.
Googlebot при первом проходе (без JS) видел пустые страницы -> thin content -> не приоритизировал.

**Решение: `vite-plugin-seo-prerender.js` расширен:**
- Добавлено поле `staticBody` в каждый маршрут - реальный HTML (H1, абзацы, списки, ссылки)
- Контент инжектится внутрь `<div id="root">` - React заменяет при монтировании, краулер видит текст
- Добавлен `noindex: true` для /privacy и /terms -> генерирует `<meta name="robots" content="noindex, nofollow">`

**`vite.config.js` (sitemap):**
- Удалены /privacy и /terms из sitemap.xml (noindex страницы не должны быть в sitemap)

**Следующий шаг:** `npm run build` -> деплой -> запросить индексирование в GSC:
/about, /contacts, /faq, /gallery, /rooms, /booking + все 8 slugs номеров

---

## Сессия 2026-04-09 - Фикс 301 redirect HTTPS->HTTP (все страницы кроме главной не индексировались)

**Проблема:**
Яндекс.Вебмастер и Google Search Console: все страницы кроме главной отвечают с ошибкой.
curl показал: `https://meganom-eco.ru/about` -> `301 -> http://meganom-eco.ru/about/` (HTTPS -> HTTP downgrade).

**Причина:**
nginx терминирует SSL и передаёт запросы Apache как HTTP.
Apache видит `/about` как директорию (существует `about/index.html`) и делает redirect на `/about/`.
Но поскольку Apache видит только HTTP -> Location: `http://` а не `https://`.
Роботы получали 301 на HTTP и считали страницы недоступными.

**Исправление:**
Добавлено `DirectorySlash Off` в `public/.htaccess` и `dist/.htaccess`.
Это отключает авто-redirect Apache для директорий. Наши RewriteRule сами обрабатывают роутинг.
Также добавлено `Options -Indexes` (запрет листинга директорий).

**Результат:** Все 11 проверенных страниц вернули `200 OK` без редиректов.

**Важно для будущих деплоев:**
`public/.htaccess` исправлен -> `npm run build` автоматически копирует его в `dist/.htaccess`.
При полном копировании папки `dist/` на сервер проблема не вернётся.
SSH доступ: `plink -pw "PASS" -batch -no-antispoof mmosowmail@77.222.40.4 "команда"`

**Переобход:** отправить в Яндекс.Вебмастере и GSC все 17 URL (список в чате 2026-04-09).

---

## Сессия 2026-04-11 - Аудит безопасности и устранение уязвимостей

**Аудит:** SQL-инъекций нет (все PDO prepared statements). Найдено и исправлено:

1. `_api/auth/register.php` - `rand()` -> `random_int()` (CSPRNG), добавлен rate limit 5 req/15min по IP
2. `_api/auth/verify.php` - добавлен brute-force guard (10 попыток/15min), сброс счётчика при успехе
3. `_api/admin/bookings/list.php`, `stats.php`, `sales.php` - убран `$e->getMessage()` из 500-ответов
4. `src/pages/auth/Login.jsx`, `Register.jsx` - исправлен open redirect: validate `redirect` starts with `/` and not `//`

**Не исправлено (низкий риск):**
- CORS `*` в `_api/config.php` - API публичное по дизайну, tokens в localStorage
- `HTTP_X_FORWARDED_FOR` в `get_client_ip()` - используется только для `require_ip()` setup-скриптов, которые уже защищены .htaccess
- JWT без revocation - 30-дневный TTL приемлем для текущей аудитории

**Деплой:** PHP-файлы задеплоить через pscp (_api/auth/register.php, verify.php, _api/admin/bookings/list.php, admin/stats.php, admin/sales.php). JS-сборка не требует rebuild (только JSX).

---

## Сессия 2026-04-14 - UX/UI аудит всех страниц (ui-ux-pro-max)

Проведён аудит и исправление UX/UI по всем публичным страницам: Gallery, About, FAQ, Contacts, Login, Register.

**Gallery.jsx - touch swipe в лайтбоксе:**
- Добавлен `useRef(null)` + `onTouchStart`/`onTouchEnd` handlers (порог 50px)
- Свайп влево = следующее фото, вправо = предыдущее
- Добавлено на overlay `motion.div`

**About.jsx:**
- `cursor-pointer` добавлен на карточки номеров (`<Link>`) и CTA-кнопку

**FAQ.jsx:**
- `cursor-pointer` добавлен на CTA-ссылку "Написать нам"

**Button.jsx (глобально для всего сайта):**
- Добавлен `cursor-pointer` в базовые классы кнопки
- Раньше был только `disabled:cursor-not-allowed`, но активные кнопки показывали дефолтный курсор

**Messengers.jsx (Footer + Contacts - глобально):**
- Touch target: `h-10 w-10` (40px) -> `h-11 w-11` (44px) - был ниже минимума 44px
- Добавлен `cursor-pointer` на оба варианта (dark/light)

**Input.jsx (КРИТИЧНО - глобально: все формы сайта):**
- Добавлен рендер текста ошибки `<p id="${id}-error" role="alert" className="text-xs text-error">` под полем
- Добавлен `aria-describedby` на input элемент
- До этого ошибка показывалась ТОЛЬКО тостом, который исчезал - пользователь видел красный бордер без объяснения

**PhoneInput.jsx (то же что Input.jsx):**
- Добавлен inline рендер ошибки + `aria-describedby`

**Register.jsx:**
- Хардкодный "На главную" заменён на `{t('auth.login.backToHome')}`
- Privacy link: `transition-colors` -> `transition-colors duration-200`

**Статус:** npm run build + деплой НЕ проводился, нужно выполнить для применения изменений на prod.

---

## Сессия 2026-04-30 - SEO sweep: Clean-param, trailing-slash, JSON-LD, дубли descriptions

**Контекст:** Яндекс.Вебмастер показывал статусы "Малоценная", "Неканоническая", "Канонический адрес обрабатывается" + потенциальные дубли title/description.

**Изменения в `vite-plugin-seo-prerender.js`:**
- Расширен JSON-LD: LodgingBusiness на главной, Accommodation на каждой странице номера, FAQPage на /faq, BreadcrumbList на всех внутренних
- Уникализированы descriptions для `veter-peremen-myata` и `veter-peremen-med` (был один и тот же текст на оба номера)
- Privacy/terms: noindex,nofollow + 0 JSON-LD блоков (правильно)

**`public/.htaccess`:**
- Priority 1a: trailing-slash URL (`/about/`) корректно отдаёт pre-rendered (раньше было двойное `//` в путях)

**`public/robots.txt`:**
- Добавлены Clean-param для Яндекса: `room` на /booking, `checkIn&checkOut&guests` на /rooms, UTM/yclid/gclid/fbclid глобально

**Деплой и верификация (на проде):**
- 17/17 страниц = HTTP 200
- 17/17 уникальных title (uniq -c = 1 каждая)
- 17/17 уникальных description
- Все canonical = чистые URL без query
- /booking?room=shale → canonical https://meganom-eco.ru/booking
- /rooms?checkIn=... → canonical https://meganom-eco.ru/rooms
- .htaccess на сервере = локальный (DirectorySlash Off, X-Forwarded-Proto, Authorization passthrough, trailing-slash fix)

**Следующий шаг (вручную):** В Яндекс.Вебмастере и GSC отправить на переобход 17 URL (главная + 8 статических + 8 номеров).

---

## Сессия 2026-04-14 - CLAUDE.md обновлён (/init)

Добавлено в CLAUDE.md:
- framer-motion и react-easy-crop в строку стека
- Структура `src/components/`: ui/ (barrel-export), features/ (auth, booking, gallery, reviews, rooms), seo/
- Правило путей к изображениям: `import.meta.env.BASE_URL`

---

## Сессия 2026-05-05 - Фикс FOUC (белый экран с текстом при обновлении страницы)

**Проблема:**
При обновлении главной страницы на ~100ms появлялся белый экран с чёрным текстом.
Причина: `staticBody` HTML для SEO-краулеров инжектился напрямую в `<div id="root">` без CSS.
До загрузки React и стилей браузер рендерил голый HTML как unstyled текст.

**Решение - `vite-plugin-seo-prerender.js`:**
Обёртка staticBody в visually-hidden div с inline-стилями:
```js
`<div id="root"><div style="position:absolute;overflow:hidden;clip:rect(0 0 0 0);width:1px;height:1px;white-space:nowrap;">${staticBody}</div></div>`
```
Пользователи не видят текст. Краулеры индексируют (position:absolute не скрывает от ботов).
React при монтировании заменяет весь #root - hidden div исчезает.

**Деплой:** npm run build (17 страниц) + полный деплой HTML + assets на продакшен.

**Obsidian:** проверено - никаких файлов Obsidian в проекте нет, удалять нечего.

---

## Сессия 2026-05-05 - Удалён фейковый номер из письма бронирования

`_api/bookings/create.php`: из письма гостю убран блок "Вопросы? Звоните: +7 (978) 123-45-67" (`$guestCta = ''`).
Деплой выполнен напрямую (только PHP, без rebuild).

---

## Сессия 2026-10-19 - Яндекс: страницы выпадали из поиска как "малоценные"

**Симптом:** в Яндексе 7 из 18 страниц (`site:meganom-eco.ru`), в Вебмастере страницы номеров/FAQ
скачут между "Каноническая" и "Малоценная или маловостребованная страница". Диагностика Вебмастера:
"Некорректно настроено отображение несуществующих файлов и страниц" (с 02.06.2026).

**Причины:**
1. В HTML для робота весь текст лежал в `clip:rect(0 0 0 0)` 1x1px (фикс FOUC от 2026-05-05) - для Яндекса это
   скрытый текст, видимая часть страницы пустая. Google исполняет JS и видел нормальную страницу, Яндекс - нет.
2. Soft 404: любой несуществующий URL отдавал 200 с главной.
3. Ответы FAQ рендерились только после клика - в HTML их не было.
4. На /about выводился сырой ключ i18n `rooms.from`.

**Решение:**
- `vite-plugin-seo-prerender.js`: после билда снимает видимую разметку каждой страницы через Playwright и кладёт в
  `#root`; пишет `dist/404.html` (noindex).
- `main.jsx` + `lib/lazyPage.js`: при пререндере модуль страницы грузится до рендера (нет спиннера), входные
  анимации framer-motion на первом рендере отключены (нет мигания). Проверено покадрово: 0 плохих кадров, CLS ~0.
- `useRooms`: статические номера как `initialData` (нет скелетона на первом рендере).
- `.htaccess`: настоящие 404, 301 с `/about/` и `/index.html`.
- FAQ: ответы всегда в DOM (свёрнуты по высоте). RoomDetail: блок "Другие варианты размещения" (перелинковка).
- Переобход: в Вебмастере "Переобход страниц"/"Sitemap" были только для чтения - 18 URL отправлены через IndexNow (ключ в `public/`, команда в CLAUDE.md).
- По решению владельца `/privacy`, `/terms`, `/consent` закрыты `noindex` и убраны из sitemap (доступны по ссылкам на сайте, что и требует 152-ФЗ).
