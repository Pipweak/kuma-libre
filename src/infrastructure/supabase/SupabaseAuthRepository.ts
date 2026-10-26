import type { Session, SupabaseClient } from '@supabase/supabase-js';

import type { AuthRepository, AuthStateListener } from '@/features/auth/AuthRepository';
import { AuthRepositoryError, type AuthSession, type AuthUser } from '@/features/auth/authTypes';

export type SupabaseAuthClient = Pick<
  SupabaseClient['auth'],
  | 'exchangeCodeForSession'
  | 'getSession'
  | 'onAuthStateChange'
  | 'signInWithOAuth'
  | 'signInWithOtp'
  | 'signOut'
  | 'verifyOtp'
>;

function optionalMetadataValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}

function toAuthUser(session: Session): AuthUser {
  const displayName =
    optionalMetadataValue(session.user.user_metadata['full_name']) ??
    optionalMetadataValue(session.user.user_metadata['name']);
  const avatarUrl = optionalMetadataValue(session.user.user_metadata['avatar_url']);
  const user: AuthUser = {
    email: session.user.email ?? '',
    id: session.user.id,
  };

  if (displayName) {
    user.displayName = displayName;
  }

  if (avatarUrl) {
    user.avatarUrl = avatarUrl;
  }

  return user;
}

function toAuthSession(session: Session | null): AuthSession | null {
  return session ? { user: toAuthUser(session) } : null;
}

function readCallbackError(callbackUrl: URL): string | null {
  const searchError = callbackUrl.searchParams.get('error_description');

  if (searchError) {
    return searchError;
  }

  const hash = callbackUrl.hash.startsWith('#') ? callbackUrl.hash.slice(1) : callbackUrl.hash;
  return new URLSearchParams(hash).get('error_description');
}

/** Supabase Auth adapter. Provider errors are retained as causes but classified before reaching the UI. */
export class SupabaseAuthRepository implements AuthRepository {
  constructor(private readonly authClient: SupabaseAuthClient) {}

  async completeSignIn(callbackUrl: string): Promise<AuthSession> {
    const url = new URL(callbackUrl);
    const callbackError = readCallbackError(url);

    if (callbackError) {
      throw new AuthRepositoryError('callback-invalid', {
        cause: new Error(callbackError),
      });
    }

    const code = url.searchParams.get('code');
    const tokenHash = url.searchParams.get('token_hash');
    let session: Session | null;

    if (code) {
      const { data, error } = await this.authClient.exchangeCodeForSession(code);

      if (error) {
        throw new AuthRepositoryError('provider-error', { cause: error });
      }

      session = data.session;
    } else if (tokenHash) {
      const { data, error } = await this.authClient.verifyOtp({
        token_hash: tokenHash,
        type: 'email',
      });

      if (error) {
        throw new AuthRepositoryError('provider-error', { cause: error });
      }

      session = data.session;
    } else {
      const { data, error } = await this.authClient.getSession();

      if (error) {
        throw new AuthRepositoryError('provider-error', { cause: error });
      }

      session = data.session;
    }

    const authSession = toAuthSession(session);

    if (!authSession) {
      throw new AuthRepositoryError('session-missing');
    }

    return authSession;
  }

  async getSession(): Promise<AuthSession | null> {
    const { data, error } = await this.authClient.getSession();

    if (error) {
      throw new AuthRepositoryError('provider-error', { cause: error });
    }

    return toAuthSession(data.session);
  }

  onAuthStateChange(listener: AuthStateListener): () => void {
    const {
      data: { subscription },
    } = this.authClient.onAuthStateChange((_event, session) => {
      listener(toAuthSession(session));
    });

    return () => subscription.unsubscribe();
  }

  async signInWithGoogle(redirectTo: string): Promise<void> {
    const { error } = await this.authClient.signInWithOAuth({
      options: { redirectTo },
      provider: 'google',
    });

    if (error) {
      throw new AuthRepositoryError('provider-error', { cause: error });
    }
  }

  async signInWithMagicLink(email: string, redirectTo: string): Promise<void> {
    const { error } = await this.authClient.signInWithOtp({
      email,
      options: {
        emailRedirectTo: redirectTo,
        shouldCreateUser: true,
      },
    });

    if (error) {
      throw new AuthRepositoryError('provider-error', { cause: error });
    }
  }

  async signOut(): Promise<void> {
    const { error } = await this.authClient.signOut();

    if (error) {
      throw new AuthRepositoryError('provider-error', { cause: error });
    }
  }
}
