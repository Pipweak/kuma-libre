import { useEffect, useMemo, useState, type PropsWithChildren, type ReactElement } from 'react';

import type { AuthRepository } from '@/features/auth/AuthRepository';
import { AuthContext, type AuthContextValue, type AuthStatus } from '@/features/auth/AuthContext';
import type { AuthSession } from '@/features/auth/authTypes';

export type AuthProviderProps = PropsWithChildren<{
  repository: AuthRepository;
}>;

/** Owns the single application-wide authentication session and delegates all I/O to a repository. */
export function AuthProvider({ children, repository }: AuthProviderProps): ReactElement {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [status, setStatus] = useState<AuthStatus>('initializing');

  useEffect(() => {
    let isActive = true;
    const unsubscribe = repository.onAuthStateChange((nextSession) => {
      if (!isActive) {
        return;
      }

      setSession(nextSession);
      setStatus(nextSession ? 'authenticated' : 'anonymous');
    });

    void repository
      .getSession()
      .then((initialSession) => {
        if (!isActive) {
          return;
        }

        setSession(initialSession);
        setStatus(initialSession ? 'authenticated' : 'anonymous');
      })
      .catch(() => {
        if (!isActive) {
          return;
        }

        setSession(null);
        setStatus('anonymous');
      });

    return () => {
      isActive = false;
      unsubscribe();
    };
  }, [repository]);

  const value = useMemo<AuthContextValue>(
    () => ({
      completeSignIn: async (callbackUrl) => {
        const nextSession = await repository.completeSignIn(callbackUrl);
        setSession(nextSession);
        setStatus('authenticated');
        return nextSession;
      },
      session,
      signInWithGoogle: (redirectTo) => repository.signInWithGoogle(redirectTo),
      signInWithMagicLink: (email, redirectTo) => repository.signInWithMagicLink(email, redirectTo),
      signOut: async () => {
        await repository.signOut();
        setSession(null);
        setStatus('anonymous');
      },
      status,
    }),
    [repository, session, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
