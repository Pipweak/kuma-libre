import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { AppLayout } from '@/app/layouts/AppLayout';
import type { ProgressRepository } from '@/domain/progress';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { ProgressProvider } from '@/features/progress/ProgressProvider';
import { PreviewAuthRepository } from '@/infrastructure/auth/PreviewAuthRepository';
import { UnavailableAuthRepository } from '@/infrastructure/auth/UnavailableAuthRepository';
import { InMemoryProgressRepository } from '@/infrastructure/progress/InMemoryProgressRepository';
import { i18n } from '@/shared/i18n/i18n';

function renderLayoutAt(
  pathname: string,
  isAuthenticated = true,
  progressRepository: ProgressRepository = new InMemoryProgressRepository(),
): void {
  const router = createMemoryRouter(
    [
      {
        path: '/app',
        Component: AppLayout,
        children: [
          { path: 'lessons', element: <h1>Leçons de test</h1> },
          { path: 'quiz', element: <h1>Question de test</h1> },
        ],
      },
      { path: '/auth', element: <h1>Connexion requise</h1> },
    ],
    { initialEntries: [pathname] },
  );

  const repository = isAuthenticated
    ? new PreviewAuthRepository()
    : new UnavailableAuthRepository();
  render(
    <AuthProvider repository={repository}>
      <ProgressProvider repository={progressRepository}>
        <RouterProvider router={router} />
      </ProgressProvider>
    </AuthProvider>,
  );
}

describe('AppLayout', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('fr');
  });

  it('shows the account identity around browsing pages', async () => {
    renderLayoutAt('/app/lessons');

    expect(await screen.findByRole('link', { name: 'Accéder aux leçons' })).toBeDefined();
    expect(screen.getByRole('link', { name: 'Ouvrir le compte' }).textContent).toBe('V');
    expect(screen.getByRole('heading', { name: 'Leçons de test' })).toBeDefined();
  });

  it('keeps the active question free of the browsing header', async () => {
    renderLayoutAt('/app/quiz');

    expect(await screen.findByRole('heading', { name: 'Question de test' })).toBeDefined();
    expect(screen.queryByRole('link', { name: 'Accéder aux leçons' })).toBeNull();
  });

  it('redirects an anonymous visitor to login', async () => {
    renderLayoutAt('/app/lessons?source=home', false);

    expect(await screen.findByRole('heading', { name: 'Connexion requise' })).toBeDefined();
  });

  it('keeps protected content hidden when progress cannot be loaded', async () => {
    renderLayoutAt('/app/lessons', true, {
      getHistory: () => Promise.resolve([]),
      getProgress: () => Promise.reject(new Error('network')),
      recordReview: () => Promise.reject(new Error('not used')),
    });

    expect(await screen.findByRole('heading', { name: 'Progression indisponible' })).toBeDefined();
    expect(screen.queryByRole('heading', { name: 'Leçons de test' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Réessayer' })).toBeDefined();
  });
});
