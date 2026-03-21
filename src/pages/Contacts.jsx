import { useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import PropTypes from 'prop-types';
import { Input, PhoneInput, Textarea, Button } from '@/components/ui';
import { contactSchema } from '@/lib/validators';
import { sendContactMessage } from '@/services/contact.service';

function ContactInfo({ icon, label, children }) {
  return (
    <div className="flex gap-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-text-muted">{label}</p>
        <div className="mt-0.5 text-text">{children}</div>
      </div>
    </div>
  );
}

ContactInfo.propTypes = {
  icon: PropTypes.node.isRequired,
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
    <section className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="font-serif text-4xl font-bold text-primary">
          {t('contacts.title')}
        </h1>
        <p className="mt-2 text-lg text-text-muted">{t('contacts.subtitle')}</p>
      </div>

      <div className="grid gap-12 lg:grid-cols-5">
        {/* Contact info */}
        <div className="flex flex-col gap-8 lg:col-span-2">
          <ContactInfo
            label={t('contacts.info.addressLabel')}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 00.281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 103 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 002.274 1.765 11.842 11.842 0 00.976.544l.062.029.018.008.006.003zM10 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z" clipRule="evenodd" />
              </svg>
            }
          >
            <p>{t('contacts.info.address')}</p>
          </ContactInfo>

          <ContactInfo
            label={t('contacts.info.phoneLabel')}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                <path fillRule="evenodd" d="M2 3.5A1.5 1.5 0 013.5 2h1.148a1.5 1.5 0 011.465 1.175l.716 3.223a1.5 1.5 0 01-1.052 1.767l-.933.267c-.41.117-.643.555-.48.95a11.542 11.542 0 006.254 6.254c.395.163.833-.07.95-.48l.267-.933a1.5 1.5 0 011.767-1.052l3.223.716A1.5 1.5 0 0118 15.352V16.5a1.5 1.5 0 01-1.5 1.5H15c-1.149 0-2.263-.15-3.326-.43A13.022 13.022 0 012.43 8.326 13.019 13.019 0 012 5V3.5z" clipRule="evenodd" />
              </svg>
            }
          >
            <p>
              <a href={`tel:${t('contacts.info.phone1').replace(/[^\d+]/g, '')}`} className="hover:text-primary">
                {t('contacts.info.phone1')}
              </a>
            </p>
            <p>
              <a href={`tel:${t('contacts.info.phone2').replace(/[^\d+]/g, '')}`} className="hover:text-primary">
                {t('contacts.info.phone2')}
              </a>
            </p>
          </ContactInfo>

          <ContactInfo
            label={t('contacts.info.emailLabel')}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
              </svg>
            }
          >
            <a href={`mailto:${t('contacts.info.email')}`} className="hover:text-primary">
              {t('contacts.info.email')}
            </a>
          </ContactInfo>

          <ContactInfo
            label={t('contacts.info.workHoursLabel')}
            icon={
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-13a.75.75 0 00-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 000-1.5h-3.25V5z" clipRule="evenodd" />
              </svg>
            }
          >
            <p>{t('contacts.info.workHours')}</p>
          </ContactInfo>

          {/* Yandex Map */}
          <div className="mt-2 overflow-hidden rounded-xl border border-bg-dark">
            <iframe
              title={t('contacts.info.addressLabel')}
              src="https://yandex.ru/map-widget/v1/?pt=35.048184,44.835724&z=17&l=map&size=450,300"
              width="100%"
              height="224"
              className="block lg:h-56"
              loading="lazy"
              style={{ border: 0 }}
            />
          </div>
        </div>

        {/* Contact form */}
        <div className="lg:col-span-3">
          <form
            onSubmit={handleSubmit(onSubmit, onInvalid)}
            className="flex flex-col gap-5 rounded-2xl border border-bg-dark bg-white p-6 shadow-sm sm:p-8"
            noValidate
          >
            {/* Honeypot field — hidden from humans, traps bots */}
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
      </div>
    </section>
  );
}
