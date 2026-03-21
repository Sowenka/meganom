import { supabase } from '@/lib/supabase';

export async function sendContactMessage(data) {
  if (!supabase) throw new Error('Supabase not configured');
  const { data: result, error } = await supabase.functions.invoke(
    'send-contact-email',
    { body: data },
  );
  if (error) throw error;
  return result;
}
