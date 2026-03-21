import { create } from 'zustand';

export const useBookingStore = create((set) => ({
  selectedRoom: null,
  checkIn: null,
  checkOut: null,
  guestsCount: 1,
  setSelectedRoom: (room) => set({ selectedRoom: room }),
  setDates: (checkIn, checkOut) => set({ checkIn, checkOut }),
  setGuestsCount: (count) => set({ guestsCount: count }),
  reset: () => set({ selectedRoom: null, checkIn: null, checkOut: null, guestsCount: 1 }),
}));
