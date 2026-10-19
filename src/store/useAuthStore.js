import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: true,
  setUser: (user, token) => set({ user, token, isLoading: false }),
  clearUser: () => set({ user: null, token: null, isLoading: false }),
}));
