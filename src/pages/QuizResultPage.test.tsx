import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { QuizResultPage } from '@/pages/QuizResultPage';
import { i18n } from '@/shared/i18n/i18n';

function renderResult(state: unknown): ReturnType<typeof createMemoryRouter> {
  const router = createMemoryRouter(
    [
      { path: '/app/quiz/result', Component: QuizResultPage },
      { path: '/app', element: <p>Accueil connecté</p> },
      { path: '/app/lessons', element: <p>Liste des leçons</p> },
    ],
    { initialEntries: [{ pathname: '/app/quiz/result', state }] },
  );

  render(<RouterProvider router={router} />);
  return router;
}

describe('QuizResultPage', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('fr');
  });

  it('summarizes a completed session', () => {
    renderResult({ correctCount: 7, incorrectCount: 3, total: 10 });

    expect(screen.getByRole('heading', { name: 'Passe terminée' })).toBeDefined();
    expect(screen.getByText('7')).toBeDefined();
    expect(screen.getByText('3')).toBeDefined();
    expect(screen.getByRole('link', { name: 'Nouvelle passe' })).toBeDefined();
    expect(screen.getByRole('link', { name: 'Retour à l’accueil' }).getAttribute('href')).toBe(
      '/app',
    );
  });

  it('redirects invalid result state to the lesson list', async () => {
    const router = renderResult({ correctCount: 2, incorrectCount: 1, total: 2 });

    expect(await screen.findByText('Liste des leçons')).toBeDefined();
    expect(router.state.location.pathname).toBe('/app/lessons');
  });
});
