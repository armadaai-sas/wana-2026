'use client';

import { useCallback, useEffect, useState } from 'react';
import { wanaApi, type AuthUser } from '@/lib/api-client';
import { clearSession, getToken, setSession } from '@/lib/auth-session';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { user: me } = await wanaApi.me();
      setUser(me);
    } catch {
      clearSession();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = async (email: string, password: string, turnstile_token?: string) => {
    const { token, user: u } = await wanaApi.login(email, password, turnstile_token);
    setSession(token);
    setUser(u);
    return u;
  };

  const register = async (data: {
    email: string;
    password: string;
    name: string;
    role?: 'guest' | 'host';
    turnstile_token?: string;
  }) => {
    const { token, user: u } = await wanaApi.register(data);
    setSession(token);
    setUser(u);
    return u;
  };

  const loginWithGoogle = async (
    credential: string,
    options?: { turnstile_token?: string; role?: 'guest' | 'host' },
  ) => {
    const { token, user: u } = await wanaApi.googleAuth(credential, options);
    setSession(token);
    setUser(u);
    return u;
  };

  const logout = () => {
    clearSession();
    setUser(null);
  };

  return { user, loading, login, register, loginWithGoogle, logout, refresh };
}
