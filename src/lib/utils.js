import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

/**
 * Internal path from a `?redirect=` value, or `fallback`. The value is resolved the way
 * the browser would resolve it, so `//host`, `/\host` and paths with tabs or newlines
 * (all of which browsers turn into another origin) are rejected.
 */
export function safeRedirect(raw, fallback) {
  if (typeof raw !== 'string' || !raw.startsWith('/')) return fallback;
  try {
    const url = new URL(raw, window.location.origin);
    if (url.origin !== window.location.origin) return fallback;
    return url.pathname + url.search + url.hash;
  } catch {
    return fallback;
  }
}

export function formatPrice(amount, currency = 'RUB') {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date, options = {}) {
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    ...options,
  }).format(new Date(date));
}
