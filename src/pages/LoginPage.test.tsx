import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router';

import type { AuthRepository } from '@/features/auth/AuthRepository';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { UnavailableAuthRepository } from '@/infrastructure/auth/UnavailableAuthRepository';
import { LoginPage } from '@/pages/LoginPage';
import { i18n } from '@/shared/i18n/i18n';

function createAnonymousRepository(): AuthRepository {
  return {
    completeSignIn: vi.fn(),
    getSession: vi.fn().mockResolvedValue(null),
    onAuthStateChange: vi.fn().mockReturnValue(() => undefined),
    signInWithGoogle: vi.fn().mockResolvedValue(undefined),
    signInWithMagicLink: vi.fn().mockResolvedValue(undefined),
    signOut: vi.fn().mockResolvedValue(undefined),
  };
}

describe('LoginPage', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('fr');
  });

  it('starts Google with a safe callback destination', async () => {
    const user = userEvent.setup();
    const repository = createAnonymousRepository();
    render(
      <AuthProvider repository={repository}>
        <MemoryRouter initialEntries={['/auth?returnTo=/app/lessons/06']}>
          <LoginPage />
        </MemoryRouter>
      </AuthProvider>,
    );

    await user.click(await screen.findByRole('button', { name: /Continuer avec Google/ }));

    expect(repository.signInWithGoogle).toHaveBeenCalledWith(
      'http://localhost:3000/auth/callback?returnTo=%2Fapp%2Flessons%2F06',
    );
  });

  it('sends a magic link and confirms the destination email', async () => {
    const user = userEvent.setup();
    const repository = createAnonymousRepository();
    render(
      <AuthProvider repository={repository}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </AuthProvider>,
    );

    await user.type(await screen.findByLabelText('Adresse email'), 'vincent@example.com');
    await user.click(screen.getByRole('button', { name: 'Recevoir le lien de connexion' }));

    expect(repository.signInWithMagicLink).toHaveBeenCalledWith(
      'vincent@example.com',
      'http://localhost:3000/auth/callback?returnTo=%2Fapp',
    );
    expect(await screen.findByRole('heading', { name: 'Vérifie ta boîte mail.' })).toBeDefined();
    expect(screen.getByText(/vincent@example.com/)).toBeDefined();
  });

  it('shows a localized configuration error instead of provider details', async () => {
    const user = userEvent.setup();
    render(
      <AuthProvider repository={new UnavailableAuthRepository()}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </AuthProvider>,
    );

    await user.click(await screen.findByRole('button', { name: /Continuer avec Google/ }));

    expect(screen.getByRole('alert').textContent).toBe(
      'La connexion n’est pas encore configurée pour cet environnement.',
    );
  });
});
