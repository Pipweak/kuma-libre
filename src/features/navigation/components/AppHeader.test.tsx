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
        <AppHeader pathname="/app" search="" user={user} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Accéder à l’accueil connecté' })).toBeDefined();
    expect(screen.getByRole('button', { name: 'Ouvrir le menu du profil' }).textContent).toBe('V');
  });

  it('shows a contextual back action for a lesson', () => {
    const lesson = vocabularyCorpus.lessons[0]!;
    render(
      <MemoryRouter>
        <AppHeader pathname={`/app/lessons/${lesson.id}`} search="" user={user} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Leçon 01')).toBeDefined();
    expect(screen.getByRole('link', { name: 'Retour' }).getAttribute('href')).toBe('/app/lessons');
    expect(
      screen.getByRole('button', { name: 'Ouvrir le menu du profil' }).parentElement?.className,
    ).toContain('col-start-3');
  });

  it('moves quiz configuration navigation into the contextual header', () => {
    const lesson = vocabularyCorpus.lessons[1]!;
    render(
      <MemoryRouter>
        <AppHeader pathname="/app/quiz/configure" search={`?lesson=${lesson.id}`} user={user} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Configurer le quiz')).toBeDefined();
    expect(screen.getByRole('link', { name: 'Retour' }).getAttribute('href')).toBe(
      `/app/lessons/${lesson.id}`,
    );
  });

  it('returns quiz configuration without a lesson to the lesson list', () => {
    render(
      <MemoryRouter>
        <AppHeader pathname="/app/quiz/configure" search="?session=missing" user={user} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Retour' }).getAttribute('href')).toBe('/app/lessons');
  });

  it.each([
    ['/app/progress', 'Progression', true],
    ['/app/settings/language', 'Langue', true],
    ['/app/account', 'Compte', false],
  ] as const)(
    'keeps the %s header controls in their dedicated columns',
    (pathname, title, hasProfile) => {
      render(
        <MemoryRouter>
          <AppHeader pathname={pathname} search="" user={user} />
        </MemoryRouter>,
      );

      expect(screen.getByText(title)).toBeDefined();
      const profileTrigger = screen.queryByRole('button', { name: 'Ouvrir le menu du profil' });
      expect(profileTrigger === null).toBe(!hasProfile);
      expect(screen.getByRole('link', { name: 'Retour' }).getAttribute('href')).toBe('/app');
    },
  );

  it('labels a lesson route that is absent from the corpus', () => {
    render(
      <MemoryRouter>
        <AppHeader pathname="/app/lessons/unknown" search="" user={user} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Leçon introuvable')).toBeDefined();
  });
});
