import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, waitFor } from '@testing-library/react';

const SERVER_USER = { id: 'u1', name: 'Server Name', role: 'guest' };

describe('useAuth', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.setItem('meganom_token', 'token');
    localStorage.setItem('meganom_user', JSON.stringify({ id: 'u1', name: 'Cached Name' }));
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => ({ ok: true, json: async () => ({ user: SERVER_USER }) })),
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
  });

  it('checks the session on the server once, however many components use it', async () => {
    const { useAuth } = await import('@/hooks/useAuth');
    const { useAuthStore } = await import('@/store/useAuthStore');
    function Consumer() {
      useAuth();
      return null;
    }

    render(
      <>
        <Consumer />
        <Consumer />
        <Consumer />
      </>,
    );

    await waitFor(() => expect(useAuthStore.getState().isVerified).toBe(true));
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(useAuthStore.getState().user).toEqual(SERVER_USER);
  });

  it('marks the cached user as not verified until the server answers', async () => {
    let answer;
    fetch.mockImplementationOnce(() => new Promise((resolve) => { answer = resolve; }));
    const { useAuth } = await import('@/hooks/useAuth');
    const { useAuthStore } = await import('@/store/useAuthStore');
    function Consumer() {
      useAuth();
      return null;
    }

    render(<Consumer />);

    await waitFor(() => expect(useAuthStore.getState().user?.name).toBe('Cached Name'));
    expect(useAuthStore.getState().isVerified).toBe(false);

    answer({ ok: true, json: async () => ({ user: SERVER_USER }) });
    await waitFor(() => expect(useAuthStore.getState().isVerified).toBe(true));
  });
});
