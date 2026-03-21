import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createBooking, getUserBookings } from '@/services/booking.service';

export function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });
}

export function useUserBookings(userId) {
  return useQuery({
    queryKey: ['bookings', userId],
    queryFn: () => getUserBookings(userId),
    enabled: !!userId,
  });
}
