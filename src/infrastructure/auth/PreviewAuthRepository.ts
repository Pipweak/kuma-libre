import type { AuthRepository } from '@/features/auth/AuthRepository';
import type { AuthSession } from '@/features/auth/authTypes';

const PREVIEW_SESSION: AuthSession = {
  user: {
    displayName: 'Vincent',
    email: 'vincent@example.com',
    id: 'preview-user',
  },
};

/** Authenticated repository reserved for local development and explicit E2E preview builds. */
export class PreviewAuthRepository implements AuthRepository {
  completeSignIn(): Promise<AuthSession> {
    return Promise.resolve(PREVIEW_SESSION);
  }

  getSession(): Promise<AuthSession> {
    return Promise.resolve(PREVIEW_SESSION);
  }

  onAuthStateChange(): () => void {
    return () => undefined;
  }

  signInWithGoogle(): Promise<void> {
    return Promise.resolve();
  }

  signInWithMagicLink(): Promise<void> {
    return Promise.resolve();
  }

  signOut(): Promise<void> {
    return Promise.resolve();
  }
}
