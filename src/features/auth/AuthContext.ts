import { createContext } from 'react';

import type { AuthSession } from '@/features/auth/authTypes';

export type AuthStatus = 'anonymous' | 'authenticated' | 'initializing';

export type AuthContextValue = {
  completeSignIn: (callbackUrl: string) => Promise<AuthSession>;
  session: AuthSession | null;
  signInWithGoogle: (redirectTo: string) => Promise<void>;
  signInWithMagicLink: (email: string, redirectTo: string) => Promise<void>;
  signOut: () => Promise<void>;
  status: AuthStatus;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
