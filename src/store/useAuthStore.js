import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isLoading: true,
  // true, когда user пришёл с сервера (вход, подтверждение email, проверка токена),
  // false - пока показываем копию из localStorage
  isVerified: false,
  setUser: (user, token) => set({ user, token, isLoading: false, isVerified: true }),
  setCachedUser: (user, token) => set({ user, token, isLoading: false, isVerified: false }),
  clearUser: () => set({ user: null, token: null, isLoading: false, isVerified: false }),
}));
