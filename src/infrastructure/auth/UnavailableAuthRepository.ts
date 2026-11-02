import type { AuthRepository } from '@/features/auth/AuthRepository';
import { AuthRepositoryError, type AuthSession } from '@/features/auth/authTypes';

/** Safe anonymous fallback when required public Supabase configuration is absent. */
export class UnavailableAuthRepository implements AuthRepository {
  completeSignIn(): Promise<AuthSession> {
    return Promise.reject(new AuthRepositoryError('configuration'));
  }

  getSession(): Promise<null> {
    return Promise.resolve(null);
  }

  onAuthStateChange(): () => void {
    return () => undefined;
  }

  signInWithGoogle(): Promise<void> {
    return Promise.reject(new AuthRepositoryError('configuration'));
  }

  signInWithMagicLink(): Promise<void> {
    return Promise.reject(new AuthRepositoryError('configuration'));
  }

  signOut(): Promise<void> {
    return Promise.resolve();
  }
}
