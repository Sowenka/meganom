import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';

const sections = [
  {
    num: '01',
    title: 'Общие положения',
    content: `Настоящее Пользовательское соглашение регулирует отношения между Меганом Эко-дом (далее — Администрация) и пользователем сайта (далее — Пользователь).

Использование сайта означает безоговорочное принятие Пользователем условий настоящего Соглашения. В случае несогласия Пользователь должен прекратить использование сайта.`,
  },
  {
    num: '02',
    title: 'Предмет Соглашения',
    content: `Администрация предоставляет Пользователю доступ к информации о гостиничных услугах, возможность онлайн-бронирования номеров и иным сервисам, доступным на сайте.`,
  },
  {
    num: '03',
    title: 'Права и обязанности Пользователя',
    content: `Пользователь обязуется предоставлять достоверные данные при бронировании и не использовать сайт в противоправных целях.`,
    items: [
      'Получать информацию о номерах и услугах',
      'Осуществлять бронирование номеров через сайт',
      'Оставлять отзывы о предоставленных услугах',
      'Обращаться в службу поддержки',
      'Не использовать сайт в противоправных целях',
      'Не предпринимать действий, нарушающих нормальную работу сайта',
    ],
  },
  {
    num: '04',
    title: 'Права и обязанности Администрации',
    items: [
      'Изменять содержание сайта без предварительного уведомления',
      'Ограничивать доступ в случае нарушения условий Соглашения',
      'Обеспечивать работоспособность сайта',
      'Обрабатывать персональные данные в соответствии с Политикой конфиденциальности',
      'Рассматривать обращения Пользователей в разумные сроки',
    ],
  },
  {
    num: '05',
    title: 'Бронирование и оплата',
    content: `Бронирование считается подтверждённым после получения Пользователем уведомления на указанный адрес электронной почты. Стоимость проживания определяется действующими тарифами, опубликованными на сайте.

Условия отмены бронирования и возврата средств определяются правилами, действующими на момент совершения бронирования.`,
  },
  {
    num: '06',
    title: 'Интеллектуальная собственность',
    content: `Все материалы сайта (тексты, фотографии, дизайн, логотипы) являются объектами интеллектуальной собственности Администрации и защищены законодательством РФ. Использование материалов без письменного согласия Администрации запрещено.`,
  },
  {
    num: '07',
    title: 'Ограничение ответственности',
    content: `Администрация не несёт ответственности за временную недоступность сайта, вызванную техническими причинами, и не гарантирует бесперебойную работу сайта.`,
  },
  {
    num: '08',
    title: 'Разрешение споров',
    content: `Все споры и разногласия разрешаются путём переговоров. В случае невозможности достижения согласия спор передаётся на рассмотрение в суд по месту нахождения Администрации в соответствии с законодательством Российской Федерации.`,
  },
  {
    num: '09',
    title: 'Контактная информация',
    content: `По вопросам, связанным с настоящим Соглашением, обращайтесь:`,
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

export default function Terms() {
  useEffect(() => {
    document.title = 'Пользовательское соглашение — Меганом Эко-дом';
  }, []);

  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative flex h-[40vh] items-center justify-center overflow-hidden">
        <img
          src={`${import.meta.env.BASE_URL}gallery/001.webp`}
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
            className="font-serif text-2xl font-bold italic text-white sm:text-3xl md:text-5xl"
          >
            Пользовательское соглашение
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
              to="/privacy"
              className="text-sm text-accent underline-offset-4 hover:underline"
            >
              Политика конфиденциальности →
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
