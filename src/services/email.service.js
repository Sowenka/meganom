/**
 * Email service via EmailJS (works without backend).
 * Setup:
 *   1. Register at https://emailjs.com (free)
 *   2. Add mail.ru SMTP service → get SERVICE_ID
 *   3. Create two email templates → get TEMPLATE_IDs
 *   4. Copy Public Key from Account → API Keys
 *   5. Fill .env variables below
 *
 * .env:
 *   VITE_EMAILJS_PUBLIC_KEY=...
 *   VITE_EMAILJS_SERVICE_ID=...
 *   VITE_EMAILJS_TEMPLATE_CONTACT=...
 *   VITE_EMAILJS_TEMPLATE_SUBSCRIBE=...
 */

import emailjs from '@emailjs/browser';

const PUBLIC_KEY   = import.meta.env.VITE_EMAILJS_PUBLIC_KEY;
const SERVICE_ID   = import.meta.env.VITE_EMAILJS_SERVICE_ID;
const TPL_CONTACT  = import.meta.env.VITE_EMAILJS_TEMPLATE_CONTACT;
const TPL_SUBSCRIBE = import.meta.env.VITE_EMAILJS_TEMPLATE_SUBSCRIBE;

const configured = PUBLIC_KEY && SERVICE_ID;

if (configured) {
  emailjs.init(PUBLIC_KEY);
}

/** Send contact form notification to hotel */
export async function sendContactEmail({ name, email, phone, subject, message }) {
  if (!configured) throw new Error('EmailJS not configured');
  return emailjs.send(SERVICE_ID, TPL_CONTACT, {
    // Variables used in HTML template body
    from_name: name,
    from_email: email,
    from_phone: phone || '—',
    message,
    // Variables used in EmailJS sidebar fields (Subject, From Name, Reply To)
    title: subject,   // Subject field uses {{title}} by default
    name,             // From Name field uses {{name}} by default
    email,            // Reply To field uses {{email}} by default
    subject,          // also send as {{subject}} for our custom subject line
    reply_to: email,
  });
}

/** Send subscriber notification to hotel */
export async function sendSubscribeEmail(subscriberEmail) {
  if (!configured) throw new Error('EmailJS not configured');
  return emailjs.send(SERVICE_ID, TPL_SUBSCRIBE, {
    subscriber_email: subscriberEmail,
    email: subscriberEmail,  // Reply To field uses {{email}} by default
    reply_to: subscriberEmail,
  });
}
