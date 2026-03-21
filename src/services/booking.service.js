import { supabase } from '@/lib/supabase';

export async function createBooking(data) {
  if (!supabase) throw new Error('Supabase not configured');
  const { data: booking, error } = await supabase
    .from('bookings')
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return booking;
}

export async function getUserBookings(userId) {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('bookings')
    .select('*, rooms(title, slug, room_images(url, is_cover))')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}
