import type { Session } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';

import {
  SupabaseAuthRepository,
  type SupabaseAuthClient,
} from '@/infrastructure/supabase/SupabaseAuthRepository';

const SESSION: Session = {
  access_token: 'access-token',
  expires_at: 123,
  expires_in: 3600,
  refresh_token: 'refresh-token',
  token_type: 'bearer',
  user: {
    app_metadata: {},
    aud: 'authenticated',
    created_at: '2026-10-25T00:00:00.000Z',
    email: 'vincent@example.com',
    id: 'user-1',
    user_metadata: {
      avatar_url: 'https://example.com/avatar.png',
      full_name: 'Vincent',
    },
  },
};

type AuthClientFixture = {
  authClient: SupabaseAuthClient;
  emitSession: (session: Session | null) => void;
  exchangeCodeForSession: ReturnType<typeof vi.fn>;
  signInWithOAuth: ReturnType<typeof vi.fn>;
  signInWithOtp: ReturnType<typeof vi.fn>;
  unsubscribe: ReturnType<typeof vi.fn>;
  verifyOtp: ReturnType<typeof vi.fn>;
};

function createAuthClient(session: Session | null = SESSION): AuthClientFixture {
  let authStateListener: Parameters<SupabaseAuthClient['onAuthStateChange']>[0] | undefined;
  const authData = session ? { session, user: session.user } : { session: null, user: null };
  const exchangeCodeForSession = vi
    .fn<SupabaseAuthClient['exchangeCodeForSession']>()
    .mockResolvedValue({ data: { session: SESSION, user: SESSION.user }, error: null });
  const signInWithOAuth = vi.fn<SupabaseAuthClient['signInWithOAuth']>().mockResolvedValue({
    data: { provider: 'google', url: 'https://accounts.google.com' },
    error: null,
  });
  const signInWithOtp = vi.fn<SupabaseAuthClient['signInWithOtp']>().mockResolvedValue({
    data: { messageId: 'message-1', session: null, user: null },
    error: null,
  });
  const unsubscribe = vi.fn();
  const verifyOtp = vi.fn<SupabaseAuthClient['verifyOtp']>().mockResolvedValue({
    data: authData,
    error: null,
  });
  const authClient = {
    exchangeCodeForSession,
    getSession: vi.fn().mockResolvedValue({ data: { session }, error: null }),
    onAuthStateChange: vi.fn((listener: Parameters<SupabaseAuthClient['onAuthStateChange']>[0]) => {
      authStateListener = listener;
      return { data: { subscription: { unsubscribe } } };
    }),
    signInWithOAuth,
    signInWithOtp,
    signOut: vi.fn().mockResolvedValue({ error: null }),
    verifyOtp,
  } as unknown as SupabaseAuthClient;

  return {
    authClient,
    emitSession: (nextSession) => {
      void authStateListener?.('SIGNED_IN', nextSession);
    },
    exchangeCodeForSession,
    signInWithOAuth,
    signInWithOtp,
    unsubscribe,
    verifyOtp,
  };
}

describe('SupabaseAuthRepository', () => {
  it('maps the provider session to the application contract', async () => {
    const { authClient } = createAuthClient();
    const repository = new SupabaseAuthRepository(authClient);

    await expect(repository.getSession()).resolves.toEqual({
      user: {
        avatarUrl: 'https://example.com/avatar.png',
        displayName: 'Vincent',
        email: 'vincent@example.com',
        id: 'user-1',
      },
    });
  });

  it('starts Google and magic-link flows with the requested callback', async () => {
    const { authClient, signInWithOAuth, signInWithOtp } = createAuthClient();
    const repository = new SupabaseAuthRepository(authClient);

    await repository.signInWithGoogle('https://kuma.example/auth/callback');
    await repository.signInWithMagicLink(
      'vincent@example.com',
      'https://kuma.example/auth/callback',
    );

    expect(signInWithOAuth).toHaveBeenCalledWith({
      options: { redirectTo: 'https://kuma.example/auth/callback' },
      provider: 'google',
    });
    expect(signInWithOtp).toHaveBeenCalledWith({
      email: 'vincent@example.com',
      options: {
        emailRedirectTo: 'https://kuma.example/auth/callback',
        shouldCreateUser: true,
      },
    });
  });

  it('completes PKCE and token-hash callbacks', async () => {
    const { authClient, exchangeCodeForSession, verifyOtp } = createAuthClient();
    const repository = new SupabaseAuthRepository(authClient);

    await repository.completeSignIn('https://kuma.example/auth/callback?code=oauth-code');
    await repository.completeSignIn(
      'https://kuma.example/auth/callback?token_hash=email-token&type=email',
    );

    expect(exchangeCodeForSession).toHaveBeenCalledWith('oauth-code');
    expect(verifyOtp).toHaveBeenCalledWith({
      token_hash: 'email-token',
      type: 'email',
    });
  });

  it('rejects provider callback errors and missing sessions with classified errors', async () => {
    const { authClient } = createAuthClient(null);
    const repository = new SupabaseAuthRepository(authClient);

    await expect(
      repository.completeSignIn(
        'https://kuma.example/auth/callback?error_description=Access%20denied',
      ),
    ).rejects.toMatchObject({ code: 'callback-invalid' });
    await expect(
      repository.completeSignIn('https://kuma.example/auth/callback'),
    ).rejects.toMatchObject({ code: 'session-missing' });
  });

  it('classifies provider failures without leaking their details', async () => {
    const { authClient, exchangeCodeForSession, signInWithOAuth, signInWithOtp, verifyOtp } =
      createAuthClient();
    vi.mocked(authClient.getSession).mockResolvedValueOnce({
      data: { session: null },
      error: new Error('private provider detail'),
    } as never);
    const repository = new SupabaseAuthRepository(authClient);

    await expect(repository.getSession()).rejects.toMatchObject({ code: 'provider-error' });

    vi.mocked(authClient.signOut).mockResolvedValueOnce({
      error: new Error('private sign-out detail'),
    } as never);
    await expect(repository.signOut()).rejects.toMatchObject({ code: 'provider-error' });

    exchangeCodeForSession.mockResolvedValueOnce({
      data: { session: null, user: null },
      error: new Error('private exchange detail'),
    });
    await expect(
      repository.completeSignIn('https://kuma.example/auth/callback?code=invalid'),
    ).rejects.toMatchObject({ code: 'provider-error' });

    verifyOtp.mockResolvedValueOnce({
      data: { session: null, user: null },
      error: new Error('private OTP detail'),
    });
    await expect(
      repository.completeSignIn('https://kuma.example/auth/callback?token_hash=invalid'),
    ).rejects.toMatchObject({ code: 'provider-error' });

    signInWithOAuth.mockResolvedValueOnce({
      data: { provider: 'google', url: '' },
      error: new Error('private OAuth detail'),
    });
    await expect(
      repository.signInWithGoogle('https://kuma.example/auth/callback'),
    ).rejects.toMatchObject({ code: 'provider-error' });

    signInWithOtp.mockResolvedValueOnce({
      data: { session: null, user: null },
      error: new Error('private magic-link detail'),
    });
    await expect(
      repository.signInWithMagicLink('vincent@example.com', 'https://kuma.example/auth/callback'),
    ).rejects.toMatchObject({ code: 'provider-error' });
  });

  it('reads callback errors returned in the URL fragment', async () => {
    const { authClient } = createAuthClient();
    const repository = new SupabaseAuthRepository(authClient);

    await expect(
      repository.completeSignIn(
        'https://kuma.example/auth/callback#error_description=Provider%20denied',
      ),
    ).rejects.toMatchObject({ code: 'callback-invalid' });
  });

  it('forwards session changes and unsubscribes cleanly', () => {
    const { authClient, emitSession, unsubscribe: unsubscribeSubscription } = createAuthClient();
    const listener = vi.fn();
    const repository = new SupabaseAuthRepository(authClient);
    const unsubscribe = repository.onAuthStateChange(listener);

    emitSession(SESSION);
    expect(listener).toHaveBeenCalledWith({
      user: {
        avatarUrl: 'https://example.com/avatar.png',
        displayName: 'Vincent',
        email: 'vincent@example.com',
        id: 'user-1',
      },
    });

    unsubscribe();
    expect(unsubscribeSubscription).toHaveBeenCalledOnce();
  });
});
