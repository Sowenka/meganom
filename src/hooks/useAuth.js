import { useEffect } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { supabase } from '@/lib/supabase';

export function useAuth() {
  const { user, isLoading, setUser, clearUser } = useAuthStore();

  useEffect(() => {
    if (!supabase) {
      clearUser();
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [setUser, clearUser]);

  return { user, isLoading, isAuthenticated: !!user };
}
