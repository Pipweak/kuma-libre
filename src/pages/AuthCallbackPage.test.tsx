import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router';

import type { AuthRepository } from '@/features/auth/AuthRepository';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { AuthRepositoryError } from '@/features/auth/authTypes';
import { AuthCallbackPage } from '@/pages/AuthCallbackPage';
import { i18n } from '@/shared/i18n/i18n';

function createRepository(shouldFail = false): AuthRepository {
  return {
    completeSignIn: shouldFail
      ? vi.fn().mockRejectedValue(new AuthRepositoryError('callback-invalid'))
      : vi.fn().mockResolvedValue({
          user: { email: 'vincent@example.com', id: 'user-1' },
        }),
    getSession: vi.fn().mockResolvedValue(null),
    onAuthStateChange: vi.fn().mockReturnValue(() => undefined),
    signInWithGoogle: vi.fn(),
    signInWithMagicLink: vi.fn(),
    signOut: vi.fn(),
  };
}

describe('AuthCallbackPage', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('fr');
  });

  it('restores the protected destination after completing sign-in', async () => {
    const repository = createRepository();
    render(
      <AuthProvider repository={repository}>
        <MemoryRouter initialEntries={['/auth/callback?returnTo=/app/lessons/06&code=oauth']}>
          <Routes>
            <Route element={<AuthCallbackPage />} path="/auth/callback" />
            <Route element={<h1>Leçon restaurée</h1>} path="/app/lessons/06" />
          </Routes>
        </MemoryRouter>
      </AuthProvider>,
    );

    expect(await screen.findByRole('heading', { name: 'Leçon restaurée' })).toBeDefined();
    expect(repository.completeSignIn).toHaveBeenCalledOnce();
  });

  it('offers a retry when the callback is invalid', async () => {
    render(
      <AuthProvider repository={createRepository(true)}>
        <MemoryRouter initialEntries={['/auth/callback']}>
          <AuthCallbackPage />
        </MemoryRouter>
      </AuthProvider>,
    );

    expect(await screen.findByRole('heading', { name: 'Connexion impossible' })).toBeDefined();
    expect(screen.getByRole('alert').textContent).toMatch(/invalide ou a expiré/);
    expect(screen.getByRole('link', { name: 'Réessayer' }).getAttribute('href')).toBe(
      '/auth?returnTo=%2Fapp',
    );
  });
});
