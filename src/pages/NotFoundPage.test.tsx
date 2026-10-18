import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router';

import { NotFoundPage } from '@/pages/NotFoundPage';
import { i18n } from '@/shared/i18n/i18n';

describe('NotFoundPage', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('fr');
  });

  it('explains the missing route and links back to the landing page', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Page introuvable' })).toBeDefined();
    expect(screen.getByRole('link', { name: 'Revenir à l’accueil' }).getAttribute('href')).toBe(
      '/',
    );
  });
});
