import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { getToken, getStoredUser, getSession } from '@/services/auth.service';

// Токен проверяется на сервере один раз за загрузку страницы. useAuth вызывают шапка,
// страница и лэйаут сразу, и без этого me.php уходил по разу от каждого.
let sessionCheckStarted = false;

export function useAuth() {
  const { user, token, isLoading, isVerified, setUser, setCachedUser, clearUser } = useAuthStore();

  useEffect(() => {
    if (sessionCheckStarted) return;
    sessionCheckStarted = true;

    const storedToken = getToken();
    if (!storedToken) {
      clearUser();
      return;
    }
    // Мгновенно показываем кэшированного пользователя
    const cached = getStoredUser();
    if (cached) setCachedUser(cached, storedToken);

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

  return { user, token, isLoading, isVerified, isAuthenticated: !!user };
}
