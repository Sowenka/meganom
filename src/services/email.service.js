import { LEGAL_VERSION } from '@/data/legal';

const API_BASE = '/api';

/** Send contact form notification to hotel → info@meganom-eco.ru */
export async function sendContactEmail({ name, email, phone, subject, message, consent }) {
  const res = await fetch(`${API_BASE}/contact.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,
      email,
      phone,
      subject,
      message,
      consent_given: consent === true,
      consent_version: LEGAL_VERSION,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Ошибка отправки');
  return data;
}

/** Send subscriber notification to hotel → info@meganom-eco.ru */
export async function sendSubscribeEmail(subscriberEmail, consent) {
  const res = await fetch(`${API_BASE}/subscribe.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: subscriberEmail,
      consent_given: consent === true,
      consent_version: LEGAL_VERSION,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Ошибка подписки');
  return data;
}
