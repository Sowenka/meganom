import { sendContactEmail } from '@/services/email.service';

export async function sendContactMessage(data) {
  return sendContactEmail(data);
}
