import { useQuery } from '@tanstack/react-query';
import { getRooms, getRoomBySlug } from '@/services/rooms.service';

export function useRooms(filters) {
  return useQuery({
    queryKey: ['rooms', filters],
    queryFn: () => getRooms(filters),
  });
}

export function useRoom(slug) {
  return useQuery({
    queryKey: ['room', slug],
    queryFn: () => getRoomBySlug(slug),
    enabled: !!slug,
  });
}
