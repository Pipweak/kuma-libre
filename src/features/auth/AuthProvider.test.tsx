import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { AuthRepository, AuthStateListener } from '@/features/auth/AuthRepository';
import { AuthProvider } from '@/features/auth/AuthProvider';
import type { AuthSession } from '@/features/auth/authTypes';
import { useAuth } from '@/features/auth/useAuth';

const SESSION: AuthSession = {
  user: { displayName: 'Vincent', email: 'vincent@example.com', id: 'user-1' },
};

function createRepository(initialSession: AuthSession | null = null): {
  emit: (session: AuthSession | null) => void;
  repository: AuthRepository;
  unsubscribe: ReturnType<typeof vi.fn>;
} {
  let listener: AuthStateListener | undefined;
  const unsubscribe = vi.fn();

  return {
    emit: (session) => listener?.(session),
    repository: {
      completeSignIn: vi.fn().mockResolvedValue(SESSION),
      getSession: vi.fn().mockResolvedValue(initialSession),
      onAuthStateChange: (nextListener) => {
        listener = nextListener;
        return unsubscribe;
      },
      signInWithGoogle: vi.fn().mockResolvedValue(undefined),
      signInWithMagicLink: vi.fn().mockResolvedValue(undefined),
      signOut: vi.fn().mockResolvedValue(undefined),
    },
    unsubscribe,
  };
}

function AuthHarness(): React.ReactElement {
  const auth = useAuth();

  return (
    <div>
      <output>{auth.status}</output>
      <span>{auth.session?.user.email ?? 'no-session'}</span>
      <button
        onClick={() => void auth.completeSignIn('https://example.com/callback')}
        type="button"
      >
        Complete
      </button>
      <button onClick={() => void auth.signOut()} type="button">
        Sign out
      </button>
    </div>
  );
}

describe('AuthProvider', () => {
  it('initializes, follows auth changes, completes sign-in, and signs out', async () => {
    const user = userEvent.setup();
    const { emit, repository, unsubscribe } = createRepository();
    const { unmount } = render(
      <AuthProvider repository={repository}>
        <AuthHarness />
      </AuthProvider>,
    );

    expect(await screen.findByText('anonymous')).toBeDefined();

    act(() => emit(SESSION));
    expect(screen.getByText('vincent@example.com')).toBeDefined();

    act(() => emit(null));
    expect(screen.getByText('no-session')).toBeDefined();

    await user.click(screen.getByRole('button', { name: 'Complete' }));
    expect(await screen.findByText('authenticated')).toBeDefined();

    await user.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(await screen.findByText('anonymous')).toBeDefined();

    unmount();
    expect(unsubscribe).toHaveBeenCalledOnce();
  });

  it('falls back to an anonymous state when initial session loading fails', async () => {
    const { repository } = createRepository();
    repository.getSession = vi.fn().mockRejectedValue(new Error('network'));

    render(
      <AuthProvider repository={repository}>
        <AuthHarness />
      </AuthProvider>,
    );

    expect(await screen.findByText('anonymous')).toBeDefined();
  });

  it('rejects use outside its provider boundary', () => {
    expect(() => render(<AuthHarness />)).toThrow('useAuth must be used inside AuthProvider.');
  });
});
