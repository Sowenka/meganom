import { supabase } from '@/lib/supabase';

export async function uploadImage(file, bucket = 'room-images') {
  if (!supabase) throw new Error('Supabase not configured');
  const ext = file.name.split('.').pop();
  const name = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage.from(bucket).upload(name, file);
  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(name);
  return data.publicUrl;
}
