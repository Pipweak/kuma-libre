import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router';

import { AuthProvider } from '@/features/auth/AuthProvider';
import { PreviewAuthRepository } from '@/infrastructure/auth/PreviewAuthRepository';
import { UnavailableAuthRepository } from '@/infrastructure/auth/UnavailableAuthRepository';
import { LandingPage } from '@/pages/LandingPage';
import { i18n } from '@/shared/i18n/i18n';

describe('LandingPage', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('fr');
  });

  it('renders the localized public foundation page for an anonymous visitor', async () => {
    render(
      <AuthProvider repository={new UnavailableAuthRepository()}>
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      </AuthProvider>,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Kuma Libre' })).toBeDefined();
    expect(
      screen.getByRole('heading', { level: 2, name: 'Fondation technique en place' }),
    ).toBeDefined();
    expect(screen.getByRole('group', { name: 'Langue de l’interface' })).toBeDefined();
    expect((await screen.findByRole('link', { name: 'Se connecter' })).getAttribute('href')).toBe(
      '/auth',
    );
  });

  it('offers an authenticated user direct access to the application', async () => {
    render(
      <AuthProvider repository={new PreviewAuthRepository()}>
        <MemoryRouter>
          <LandingPage />
        </MemoryRouter>
      </AuthProvider>,
    );

    expect(
      (await screen.findByRole('link', { name: 'Continuer à réviser' })).getAttribute('href'),
    ).toBe('/app');
  });
});
