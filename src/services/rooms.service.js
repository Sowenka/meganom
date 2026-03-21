import { supabase } from '@/lib/supabase';

export async function getRooms({ type, isActive = true } = {}) {
  if (!supabase) return [];
  let query = supabase
    .from('rooms')
    .select('*, room_images(*)')
    .eq('is_active', isActive)
    .order('sort_order');

  if (type) query = query.eq('room_type', type);
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getRoomBySlug(slug) {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from('rooms')
    .select('*, room_images(*)')
    .eq('slug', slug)
    .single();
  if (error) throw error;
  return data;
}
