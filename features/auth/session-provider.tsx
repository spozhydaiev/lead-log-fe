'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiRequestError } from '@/lib/api/client';
import { api } from '@/lib/api/endpoints';
import type { SafeApiError, SessionData } from '@/lib/api/types';

type Status = 'loading' | 'authenticated' | 'unauthenticated' | 'error';
type Ctx = {
  status: Status;
  isRefreshing: boolean;
  session: SessionData | null;
  error: SafeApiError | null;
  refreshSession: () => Promise<void>;
  logout: () => Promise<void>;
  setAuthenticated: (s: SessionData) => void;
};
const AuthContext = createContext<Ctx | null>(null);

const genericError: SafeApiError = { kind: 'unexpected_error', message: 'Something went wrong. Try again.' };

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [session, setSession] = useState<SessionData | null>(null);
  const [error, setError] = useState<SafeApiError | null>(null);
  const sessionRef = useRef<SessionData | null>(null);
  const refreshPromiseRef = useRef<Promise<void> | null>(null);
  const router = useRouter();

  const applySession = useCallback((s: SessionData | null) => {
    sessionRef.current = s;
    setSession(s);
  }, []);

  const refreshSession = useCallback(async () => {
    if (refreshPromiseRef.current) return refreshPromiseRef.current;

    const hadSession = sessionRef.current !== null;
    if (hadSession) setIsRefreshing(true);
    else setStatus('loading');
    setError(null);

    const promise = api.session().then(
      (s) => {
        applySession(s);
        setStatus('authenticated');
        setError(null);
      },
      (e) => {
        const safe = e instanceof ApiRequestError ? e.safe : genericError;
        if (safe.kind === 'unauthorized') {
          applySession(null);
          setStatus('unauthenticated');
          return;
        }
        setError(safe);
        if (!sessionRef.current) setStatus('error');
      },
    ).finally(() => {
      setIsRefreshing(false);
      refreshPromiseRef.current = null;
    });

    refreshPromiseRef.current = promise;
    return promise;
  }, [applySession]);

  useEffect(() => {
    void refreshSession();
  }, [refreshSession]);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } catch (e) {
      if (!(e instanceof ApiRequestError) || e.safe.kind !== 'unauthorized') { /* keep logout local */ }
    } finally {
      applySession(null);
      setStatus('unauthenticated');
      setIsRefreshing(false);
      router.replace('/login');
    }
  }, [applySession, router]);

  const setAuthenticated = useCallback((s: SessionData) => {
    applySession(s);
    setStatus('authenticated');
    setError(null);
  }, [applySession]);

  const value = useMemo(() => ({ status, isRefreshing, session, error, refreshSession, logout, setAuthenticated }), [status, isRefreshing, session, error, refreshSession, logout, setAuthenticated]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useSession() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}
