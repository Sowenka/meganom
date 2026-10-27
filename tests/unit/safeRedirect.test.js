import { describe, it, expect } from 'vitest';
import { safeRedirect } from '@/lib/utils';

const BS = '\\';

describe('safeRedirect', () => {
  it('keeps internal paths with query and hash', () => {
    expect(safeRedirect('/booking?room=shale#dates', '/profile')).toBe('/booking?room=shale#dates');
  });

  it('falls back when the value is missing or not a path', () => {
    expect(safeRedirect('', '/profile')).toBe('/profile');
    expect(safeRedirect(null, '/profile')).toBe('/profile');
    expect(safeRedirect('booking', '/profile')).toBe('/profile');
  });

  it.each([
    ['protocol-relative', '//evil.com'],
    ['backslash', `/${BS}evil.com`],
    ['backslash then slash', `/${BS}/evil.com`],
    ['tab inside', '/\t/evil.com'],
    ['newline inside', '/\n/evil.com'],
    ['absolute url', 'https://evil.com'],
    ['javascript scheme', 'javascript:alert(1)'],
  ])('rejects %s', (_, raw) => {
    expect(safeRedirect(raw, '/profile')).toBe('/profile');
  });
});
