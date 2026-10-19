import { useState, useEffect, useCallback } from 'react';

// Версионированный ключ: при изменении состава категорий повышаем версию,
// чтобы пользователь заново подтвердил выбор.
const CONSENT_KEY = 'meganom_cookie_consent_v1';
// Событие синхронизации между экземплярами хука (баннер, футер, и т.д.)
const CONSENT_EVENT = 'meganom-consent-change';
// Событие «открыть настройки cookie» (вызывается из футера)
export const COOKIE_SETTINGS_EVENT = 'meganom-cookie-settings';

function readPrefs() {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.analytics !== 'boolean') return null;
    return parsed;
  } catch {
    return null;
  }
}

function writePrefs(prefs) {
  const value = { analytics: !!prefs.analytics, decidedAt: new Date().toISOString() };
  try {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(value));
  } catch {
    // localStorage может быть недоступен (приватный режим) - не критично
  }
  // Метрика подключается только когда аналитика разрешена
  if (value.analytics && typeof window.meganomLoadMetrika === 'function') {
    window.meganomLoadMetrika();
  }
  window.dispatchEvent(new Event(CONSENT_EVENT));
  return value;
}

/**
 * Управление согласием на cookie и аналитику (152-ФЗ).
 * Яндекс.Метрика (window.meganomLoadMetrika) загружается ТОЛЬКО при analytics === true.
 * Решение хранится в localStorage, отзываемо через панель настроек.
 */
export function useCookieConsent() {
  const [prefs, setPrefs] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Небольшая задержка, чтобы баннер не мигал до гидрации
    const timer = setTimeout(() => {
      setPrefs(readPrefs());
      setIsLoading(false);
    }, 80);

    const onChange = () => setPrefs(readPrefs());
    window.addEventListener(CONSENT_EVENT, onChange);

    return () => {
      clearTimeout(timer);
      window.removeEventListener(CONSENT_EVENT, onChange);
    };
  }, []);

  const acceptAll = useCallback(() => setPrefs(writePrefs({ analytics: true })), []);
  const rejectAll = useCallback(() => setPrefs(writePrefs({ analytics: false })), []);
  const savePrefs = useCallback((p) => setPrefs(writePrefs(p)), []);

  return {
    analytics: prefs?.analytics ?? false,
    decided: !isLoading && prefs !== null,
    showBanner: !isLoading && prefs === null,
    isLoading,
    acceptAll,
    rejectAll,
    savePrefs,
  };
}

/** Открыть панель настроек cookie из любого места (напр. ссылка в футере). */
export function openCookieSettings() {
  window.dispatchEvent(new Event(COOKIE_SETTINGS_EVENT));
}

export default useCookieConsent;
