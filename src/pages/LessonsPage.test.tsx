import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router';

import { vocabularyCorpus } from '@/app/data/vocabularyCorpus';
import { LessonsPage } from '@/pages/LessonsPage';
import { i18n } from '@/shared/i18n/i18n';

describe('LessonsPage', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('fr');
  });

  it('lists every real corpus lesson without invented thematic titles', () => {
    render(
      <MemoryRouter>
        <LessonsPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { level: 1, name: 'Ton parcours' })).toBeDefined();
    expect(screen.getAllByRole('listitem')).toHaveLength(vocabularyCorpus.lessons.length);
    expect(screen.getByRole('link', { name: /Leçon 01/ }).getAttribute('href')).toBe(
      `/app/lessons/${vocabularyCorpus.lessons[0]!.id}`,
    );
    expect(screen.queryByText('Fondations')).toBeNull();
  });
});
