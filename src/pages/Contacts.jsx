import { useCallback, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { motion, useInView } from 'framer-motion';
import { FiMapPin, FiPhone, FiMail, FiClock } from 'react-icons/fi';
import PropTypes from 'prop-types';
import { Input, PhoneInput, Textarea, Button } from '@/components/ui';
import { contactSchema } from '@/lib/validators';
import { sendContactMessage } from '@/services/contact.service';

function SectionReveal({ children, className, delay = 0 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

SectionReveal.propTypes = { children: PropTypes.node, className: PropTypes.string, delay: PropTypes.number };

function ContactItem({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-accent">
          {label}
        </p>
        <div className="text-text-muted">{children}</div>
      </div>
    </div>
  );
}

ContactItem.propTypes = {
  icon: PropTypes.elementType.isRequired,
  label: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default function Contacts() {
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', phone: '', subject: '', message: '', website: '' },
  });

  const onInvalid = useCallback((fieldErrors) => {
    const firstError = Object.values(fieldErrors).find((e) => e?.message);
    if (firstError) toast.error(firstError.message);
  }, []);

  async function onSubmit({ website, ...data }) {
    if (website) return;
    try {
      await sendContactMessage(data);
      toast.success(t('contacts.form.success'));
      reset();
    } catch {
      toast.error(t('contacts.form.error'));
    }
  }

  return (
    <>
      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative flex h-[55vh] items-center justify-center overflow-hidden">
        <img
          src={`${import.meta.env.BASE_URL}gallery/009.webp`}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
        />
        <div className="absolute inset-0 bg-primary/65" />
        <div className="relative z-10 px-6 text-center">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-4 inline-block text-xs font-medium uppercase tracking-[0.2em] text-accent-warm"
          >
            {t('contacts.subtitle')}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif text-5xl font-bold italic text-white md:text-6xl"
          >
            {t('contacts.title')}
          </motion.h1>
        </div>
      </section>

      {/* ── MAIN CONTENT ──────────────────────────────────────────────────── */}
      <section className="bg-bg py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-5 lg:items-start">

          {/* ── LEFT: contact info + map ─────────────────────────────────── */}
          <SectionReveal className="flex flex-col gap-8 lg:col-span-2">
            <div>
              <span className="mb-2 block text-xs font-medium uppercase tracking-[0.2em] text-accent">
                {t('contacts.subtitle')}
              </span>
              <h2 className="font-serif text-3xl font-bold text-primary">
                {t('contacts.title')}
              </h2>
            </div>

            <div className="flex flex-col gap-6">
              <ContactItem icon={FiMapPin} label={t('contacts.info.addressLabel')}>
                <p className="leading-relaxed">{t('contacts.info.address')}</p>
              </ContactItem>

              <ContactItem icon={FiPhone} label={t('contacts.info.phoneLabel')}>
                <a href={`tel:${t('contacts.info.phone1').replace(/[^\d+]/g, '')}`}
                  className="block transition-colors hover:text-primary">
                  {t('contacts.info.phone1')}
                </a>
                <a href={`tel:${t('contacts.info.phone2').replace(/[^\d+]/g, '')}`}
                  className="block transition-colors hover:text-primary">
                  {t('contacts.info.phone2')}
                </a>
              </ContactItem>

              <ContactItem icon={FiMail} label={t('contacts.info.emailLabel')}>
                <a href={`mailto:${t('contacts.info.email')}`}
                  className="transition-colors hover:text-primary">
                  {t('contacts.info.email')}
                </a>
              </ContactItem>

              <ContactItem icon={FiClock} label={t('contacts.info.workHoursLabel')}>
                <p>{t('contacts.info.workHours')}</p>
              </ContactItem>
            </div>

            {/* Map */}
            <div className="overflow-hidden rounded-2xl border border-bg-dark">
              <iframe
                title={t('contacts.info.addressLabel')}
                src="https://yandex.ru/map-widget/v1/?pt=35.048184,44.835724&z=17&l=map&size=450,300"
                width="100%"
                height="240"
                className="block"
                loading="lazy"
                style={{ border: 0 }}
              />
            </div>
          </SectionReveal>

          {/* ── RIGHT: form ──────────────────────────────────────────────── */}
          <SectionReveal delay={0.15} className="lg:col-span-3">
            <div className="rounded-2xl border border-bg-dark bg-white p-8 shadow-sm">
              <h3 className="mb-6 font-serif text-2xl font-bold text-primary">
                Написать нам
              </h3>

              <form
                onSubmit={handleSubmit(onSubmit, onInvalid)}
                className="flex flex-col gap-5"
                noValidate
              >
                {/* Honeypot */}
                <input
                  type="text"
                  autoComplete="off"
                  tabIndex={-1}
                  aria-hidden="true"
                  className="absolute h-0 w-0 overflow-hidden opacity-0"
                  {...register('website')}
                />

                <div className="grid gap-5 sm:grid-cols-2">
                  <Input
                    label={t('contacts.form.name')}
                    placeholder={t('contacts.form.name')}
                    error={errors.name?.message}
                    {...register('name')}
                  />
                  <Input
                    label={t('contacts.form.email')}
                    type="email"
                    placeholder="email@example.com"
                    error={errors.email?.message}
                    {...register('email')}
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <PhoneInput
                    label={t('contacts.form.phone')}
                    name="phone"
                    control={control}
                    error={errors.phone?.message}
                  />
                  <Input
                    label={t('contacts.form.subject')}
                    placeholder={t('contacts.form.subject')}
                    error={errors.subject?.message}
                    {...register('subject')}
                  />
                </div>

                <Textarea
                  label={t('contacts.form.message')}
                  placeholder={t('contacts.form.message')}
                  rows={5}
                  error={errors.message?.message}
                  {...register('message')}
                />

                <Button type="submit" loading={isSubmitting} className="self-start">
                  {isSubmitting ? t('contacts.form.sending') : t('contacts.form.submit')}
                </Button>
              </form>
            </div>
          </SectionReveal>
        </div>
      </section>
    </>
  );
}
