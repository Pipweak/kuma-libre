import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { RootLayout } from '@/app/layouts/RootLayout';
import { i18n } from '@/shared/i18n/i18n';

describe('RootLayout', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('fr');
  });

  it('provides a localized skip link and renders the active route', () => {
    const router = createMemoryRouter([
      {
        path: '/',
        Component: RootLayout,
        children: [{ index: true, element: <p>Contenu de test</p> }],
      },
    ]);

    render(<RouterProvider router={router} />);

    expect(
      screen.getByRole('link', { name: 'Aller au contenu principal' }).getAttribute('href'),
    ).toBe('#main-content');
    expect(screen.getByRole('main').textContent).toContain('Contenu de test');
  });
});
