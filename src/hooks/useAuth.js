import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { getToken, getStoredUser, getSession } from '@/services/auth.service';

export function useAuth() {
  const { user, token, isLoading, setUser, clearUser } = useAuthStore();

  useEffect(() => {
    const storedToken = getToken();
    if (!storedToken) {
      clearUser();
      return;
    }
    // Мгновенно показываем кэшированного пользователя
    const cached = getStoredUser();
    if (cached) setUser(cached, storedToken);

    // Фоновая проверка токена на сервере
    getSession().then((serverUser) => {
      if (serverUser) {
        setUser(serverUser, storedToken);
      } else {
        clearUser();
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { user, token, isLoading, isAuthenticated: !!user };
}
