import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { api, ApiError, AuthUser, authStore } from './api';

export type Role = 'worker' | 'engineer' | 'owner';

interface AuthCtx {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: {
    full_name: string;
    email: string;
    password: string;
    role: string;
    assigned_station?: string;
    invite_code?: string;
  }) => Promise<AuthUser>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => authStore.get()?.user ?? null);
  const [loading, setLoading] = useState(true);

  // Revalidate the stored token on mount (covers revoked/expired sessions).
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!authStore.get()) {
        setLoading(false);
        return;
      }
      try {
        const me = await api.me();
        if (!cancelled) {
          setUser(me);
          const tok = authStore.get()?.token;
          if (tok) authStore.set(tok, me);
        }
      } catch {
        if (!cancelled) {
          authStore.clear();
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<AuthCtx>(
    () => ({
      user,
      loading,
      login: async (email, password) => {
        const res = await api.login(email, password);
        authStore.set(res.access_token, res.user);
        setUser(res.user);
      },
      register: async (payload) => api.register(payload),
      logout: () => {
        authStore.clear();
        setUser(null);
      },
      refreshUser: async () => {
        const me = await api.me();
        setUser(me);
        const tok = authStore.get()?.token;
        if (tok) authStore.set(tok, me);
      },
    }),
    [user, loading],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export function useAuth(): AuthCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export function errText(e: unknown): string {
  if (e instanceof ApiError) return e.message;
  if (e instanceof Error) return e.message;
  return String(e);
}
