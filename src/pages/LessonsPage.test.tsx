import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { MemoryRouter } from 'react-router';

import { vocabularyCorpus } from '@/app/data/vocabularyCorpus';
import type { ProgressByEntry } from '@/domain/quiz';
import { ProgressContext, type ProgressContextValue } from '@/features/progress/ProgressContext';
import { LessonsPage } from '@/pages/LessonsPage';
import { i18n } from '@/shared/i18n/i18n';

function renderPage(progress: ProgressByEntry = {}): void {
  const value: ProgressContextValue = {
    errorCode: null,
    progress,
    recordReview: () => Promise.reject(new Error('not used')),
    reload: () => Promise.resolve(),
    status: 'ready',
  };

  render(
    <ProgressContext.Provider value={value}>
      <MemoryRouter>
        <LessonsPage />
      </MemoryRouter>
    </ProgressContext.Provider>,
  );
}

describe('LessonsPage', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('fr');
  });

  it('lists every real corpus lesson without invented thematic titles', () => {
    renderPage();

    expect(screen.getByRole('heading', { level: 1, name: 'Ton parcours' })).toBeDefined();
    expect(screen.getAllByRole('listitem')).toHaveLength(vocabularyCorpus.lessons.length);
    expect(screen.getByRole('link', { name: /Leçon 01/ }).getAttribute('href')).toBe(
      `/app/lessons/${vocabularyCorpus.lessons[0]!.id}`,
    );
    expect(screen.queryByText('Fondations')).toBeNull();
  });

  it('derives lesson mastery from entries green in both directions', () => {
    const firstLesson = vocabularyCorpus.lessons[0]!;
    const firstLessonProgress = Object.fromEntries(
      vocabularyCorpus.entries
        .filter((entry) => entry.lessonId === firstLesson.id)
        .map((entry) => [
          entry.id,
          {
            comprehension: { correctCount: 3, incorrectCount: 0, score: 3 as const },
            production: { correctCount: 3, incorrectCount: 0, score: 3 as const },
          },
        ]),
    );

    renderPage(firstLessonProgress);

    expect(screen.getByRole('link', { name: /Leçon 01.*100/ })).toBeDefined();
  });
});
