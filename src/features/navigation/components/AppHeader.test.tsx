import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router';

import { vocabularyCorpus } from '@/app/data/vocabularyCorpus';
import { AppHeader } from '@/features/navigation/components/AppHeader';
import { i18n } from '@/shared/i18n/i18n';

const user = { displayName: 'Vincent', email: 'vincent@example.com', id: 'preview-user' };

describe('AppHeader', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('fr');
  });

  it('uses the wordmark and profile identity on the connected home', () => {
    render(
      <MemoryRouter>
        <AppHeader pathname="/app" user={user} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Accéder à l’accueil connecté' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Ouvrir le menu du profil' }).textContent).toBe('V');
  });

  it('shows a contextual back action for a lesson', () => {
    const lesson = vocabularyCorpus.lessons[0]!;
    render(
      <MemoryRouter>
        <AppHeader pathname={`/app/lessons/${lesson.id}`} user={user} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Leçon 01')).toBeDefined();
    expect(screen.getByRole('link', { name: 'Retour' }).getAttribute('href')).toBe('/app/lessons');
  });
});
