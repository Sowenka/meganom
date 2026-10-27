import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('i18n language', () => {
  beforeEach(() => {
    vi.resetModules();
    document.documentElement.lang = 'ru';
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('starts in Russian when nothing was chosen', async () => {
    const { default: i18n } = await import('@/i18n/config');
    expect(i18n.language).toBe('ru');
    expect(document.documentElement.lang).toBe('ru');
  });

  it('restores the language chosen earlier and sets <html lang>', async () => {
    localStorage.setItem('meganom_lang', 'en');
    const { default: i18n } = await import('@/i18n/config');
    expect(i18n.language).toBe('en');
    expect(document.documentElement.lang).toBe('en');
  });

  it('remembers a switch and updates <html lang>', async () => {
    const { default: i18n } = await import('@/i18n/config');
    await i18n.changeLanguage('en');
    expect(localStorage.getItem('meganom_lang')).toBe('en');
    expect(document.documentElement.lang).toBe('en');
  });

  it('ignores an unknown stored value', async () => {
    localStorage.setItem('meganom_lang', 'de');
    const { default: i18n } = await import('@/i18n/config');
    expect(i18n.language).toBe('ru');
  });
});
