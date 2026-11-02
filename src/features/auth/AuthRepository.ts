import type { AuthSession } from '@/features/auth/authTypes';

export type AuthStateListener = (session: AuthSession | null) => void;

/** Authentication boundary implemented by Supabase in production and controlled fakes in tests. */
export interface AuthRepository {
  completeSignIn: (callbackUrl: string) => Promise<AuthSession>;
  getSession: () => Promise<AuthSession | null>;
  onAuthStateChange: (listener: AuthStateListener) => () => void;
  signInWithGoogle: (redirectTo: string) => Promise<void>;
  signInWithMagicLink: (email: string, redirectTo: string) => Promise<void>;
  signOut: () => Promise<void>;
}
