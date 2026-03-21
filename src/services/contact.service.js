import { supabase } from '@/lib/supabase';
import { sendContactEmail } from '@/services/email.service';

export async function sendContactMessage(data) {
  // When Supabase is connected — use Edge Function (saves to DB + sends email)
  if (supabase) {
    const { data: result, error } = await supabase.functions.invoke(
      'send-contact-email',
      { body: data },
    );
    if (error) throw error;
    return result;
  }

  // Fallback: send directly via EmailJS
  return sendContactEmail(data);
}
