import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router';

import { AuthContext, type AuthContextValue, type AuthStatus } from '@/features/auth/AuthContext';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { i18n } from '@/shared/i18n/i18n';

function renderPage(status: AuthStatus): void {
  const value: AuthContextValue = {
    completeSignIn: () => Promise.reject(new Error('not used')),
    session:
      status === 'authenticated' ? { user: { email: 'vincent@example.com', id: 'user-1' } } : null,
    signInWithGoogle: () => Promise.reject(new Error('not used')),
    signInWithMagicLink: () => Promise.reject(new Error('not used')),
    signOut: () => Promise.reject(new Error('not used')),
    status,
  };

  render(
    <AuthContext.Provider value={value}>
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    </AuthContext.Provider>,
  );
}

describe('NotFoundPage', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('fr');
  });

  it('explains the missing route and links back to the landing page', () => {
    renderPage('anonymous');

    expect(screen.getByRole('heading', { name: 'Page introuvable' })).toBeDefined();
    expect(screen.getByRole('link', { name: 'Revenir à l’accueil' }).getAttribute('href')).toBe(
      '/',
    );
  });

  it('returns authenticated users to the connected home', () => {
    renderPage('authenticated');

    expect(screen.getByRole('link', { name: 'Revenir à l’application' }).getAttribute('href')).toBe(
      '/app',
    );
  });
});
