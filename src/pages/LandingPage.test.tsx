import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router';

import { LandingPage } from '@/pages/LandingPage';
import { i18n } from '@/shared/i18n/i18n';

describe('LandingPage', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('fr');
  });

  it('renders the localized public foundation page', () => {
    render(
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Kuma Libre' })).toBeDefined();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Fondation technique en place' }),
    ).toBeDefined();
    expect(screen.getByRole('group', { name: 'Langue de l’interface' })).toBeDefined();
    expect(screen.getByRole('link', { name: 'Tester le parcours de révision' })).toBeDefined();
  });
});
