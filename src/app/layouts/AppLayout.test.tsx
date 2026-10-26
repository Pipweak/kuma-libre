import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { AppLayout } from '@/app/layouts/AppLayout';
import { i18n } from '@/shared/i18n/i18n';

function renderLayoutAt(pathname: string): void {
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
    ],
    { initialEntries: [pathname] },
  );

  render(<RouterProvider router={router} />);
}

describe('AppLayout', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('fr');
  });

  it('shows the local preview identity around browsing pages', () => {
    renderLayoutAt('/app/lessons');

    expect(screen.getByRole('link', { name: 'Accéder aux leçons' })).toBeDefined();
    expect(screen.getByText('Aperçu local')).toBeDefined();
    expect(screen.getByRole('heading', { name: 'Leçons de test' })).toBeDefined();
  });

  it('keeps the active question free of the browsing header', () => {
    renderLayoutAt('/app/quiz');

    expect(screen.queryByRole('link', { name: 'Accéder aux leçons' })).toBeNull();
    expect(screen.getByRole('heading', { name: 'Question de test' })).toBeDefined();
  });
});
