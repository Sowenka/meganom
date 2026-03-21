import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';

const sections = [
  {
    num: '01',
    title: 'Общие положения',
    content: `Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных пользователей сайта Меганом Эко-дом. Политика разработана в соответствии с Федеральным законом от 27.07.2006 № 152-ФЗ «О персональных данных».

Используя сайт и предоставляя свои персональные данные, Пользователь выражает согласие с условиями настоящей Политики.`,
  },
  {
    num: '02',
    title: 'Оператор персональных данных',
    content: `Оператором персональных данных является Меганом Эко-дом, расположенный по адресу: Байкальская ул., 28, с. Миндальное, Судакский г.о., Крым. Контактный e-mail: info@meganom-hotel.ru.`,
  },
  {
    num: '03',
    title: 'Цели обработки персональных данных',
    items: [
      'Бронирование номеров и оказание гостиничных услуг',
      'Связь с пользователем для подтверждения бронирования',
      'Обработка платежей и возвратов',
      'Улучшение качества обслуживания и работы сайта',
      'Направление информационных сообщений (с согласия пользователя)',
      'Исполнение требований законодательства РФ',
    ],
  },
  {
    num: '04',
    title: 'Состав обрабатываемых данных',
    items: [
      'Фамилия, имя, отчество',
      'Контактный телефон',
      'Адрес электронной почты',
      'Данные бронирования (даты заезда/выезда, количество гостей)',
      'Данные об использовании сайта (cookies, IP-адрес, данные браузера)',
    ],
  },
  {
    num: '05',
    title: 'Права субъекта персональных данных',
    content: `Для реализации своих прав Пользователь может направить запрос на адрес info@meganom-hotel.ru.`,
    items: [
      'Получить информацию об обработке своих персональных данных',
      'Требовать уточнения, блокирования или уничтожения данных',
      'Отозвать согласие на обработку персональных данных',
      'Обжаловать действия Оператора в Роскомнадзор',
    ],
  },
  {
    num: '06',
    title: 'Использование файлов cookie',
    content: `Сайт использует файлы cookie для обеспечения корректной работы, аналитики и персонализации контента. Пользователь может отключить cookie в настройках браузера, однако это может повлиять на функциональность сайта.`,
    items: [
      'Необходимые — обеспечивают базовую функциональность сайта',
      'Аналитические — помогают понять, как пользователи взаимодействуют с сайтом',
      'Маркетинговые — используются для показа релевантной рекламы',
    ],
  },
  {
    num: '07',
    title: 'Защита персональных данных',
    content: `Оператор принимает необходимые организационные и технические меры для защиты персональных данных от неправомерного доступа, уничтожения, изменения, блокирования, копирования и распространения.`,
  },
  {
    num: '08',
    title: 'Изменение Политики',
    content: `Оператор оставляет за собой право вносить изменения в настоящую Политику. Актуальная версия всегда доступна на данной странице.`,
  },
  {
    num: '09',
    title: 'Контактная информация',
    content: `По вопросам обработки персональных данных обращайтесь:`,
    items: [
      'E-mail: info@meganom-hotel.ru',
      'Телефон: +7 (978) 123-45-67',
      'Адрес: Байкальская ул., 28, с. Миндальное, Судакский г.о., Крым',
    ],
  },
];

function PolicySection({ num, title, content, items, index }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: 0.05 * index, ease: [0.22, 1, 0.36, 1] }}
      className="grid gap-4 border-t border-bg-dark pt-8 lg:grid-cols-[120px_1fr] lg:gap-12"
    >
      <div className="flex items-start gap-3 lg:flex-col lg:gap-1">
        <span className="font-serif text-3xl font-bold text-accent/40">{num}</span>
      </div>
      <div>
        <h2 className="mb-4 font-serif text-xl font-bold text-primary md:text-2xl">{title}</h2>
        {content && (
          <p className="mb-4 leading-relaxed text-text-muted whitespace-pre-line">{content}</p>
        )}
        {items && (
          <ul className="flex flex-col gap-2">
            {items.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-text-muted">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  );
}

export default function PrivacyPolicy() {
  useEffect(() => {
    document.title = 'Политика конфиденциальности — Меганом Эко-дом';
  }, []);

  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative flex h-[40vh] items-center justify-center overflow-hidden">
        <img
          src={`${import.meta.env.BASE_URL}gallery/075.webp`}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-primary/70" />
        <div className="relative z-10 px-6 text-center">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4 inline-block text-xs font-medium uppercase tracking-[0.2em] text-accent-warm"
          >
            Правовые документы
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif text-4xl font-bold italic text-white md:text-5xl"
          >
            Политика конфиденциальности
          </motion.h1>
        </div>
      </section>

      {/* ── CONTENT ───────────────────────────────────────────────────────── */}
      <section className="bg-bg py-20">
        <div className="mx-auto max-w-5xl px-6">

          {/* Meta */}
          <div className="mb-12 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-text-muted">
              Дата последнего обновления: <span className="text-text">21 марта 2026 г.</span>
            </p>
            <Link
              to="/terms"
              className="text-sm text-accent underline-offset-4 hover:underline"
            >
              Пользовательское соглашение →
            </Link>
          </div>

          {/* Sections */}
          <div className="flex flex-col gap-8">
            {sections.map((s, i) => (
              <PolicySection key={s.num} {...s} index={i} />
            ))}
          </div>

        </div>
      </section>
    </>
  );
}
