import { supabase } from '@/lib/supabase';
import { STATIC_ROOMS } from '@/data/rooms';

export async function getRooms({ type, isActive = true } = {}) {
  if (!supabase) {
    return STATIC_ROOMS.filter(
      (r) => r.is_active === isActive && (!type || r.room_type === type),
    );
  }
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
  if (!supabase) return STATIC_ROOMS.find((r) => r.slug === slug) ?? null;
  const { data, error } = await supabase
    .from('rooms')
    .select('*, room_images(*)')
    .eq('slug', slug)
    .single();
  if (error) throw error;
  return data;
}
