import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { vocabularyCorpus } from '@/app/data/vocabularyCorpus';
import type { ProgressByEntry } from '@/domain/quiz';
import { getPrimaryJapaneseForm } from '@/features/lessons/lessonPresentation';
import { ProgressContext, type ProgressContextValue } from '@/features/progress/ProgressContext';
import { LessonPage } from '@/pages/LessonPage';
import { i18n } from '@/shared/i18n/i18n';

function renderLesson(pathname: string, progress: ProgressByEntry = {}): void {
  const router = createMemoryRouter([{ path: '/app/lessons/:lessonId', Component: LessonPage }], {
    initialEntries: [pathname],
  });
  const value: ProgressContextValue = {
    errorCode: null,
    progress,
    recordReview: () => Promise.reject(new Error('not used')),
    reload: () => Promise.resolve(),
    status: 'ready',
  };

  render(
    <ProgressContext.Provider value={value}>
      <RouterProvider router={router} />
    </ProgressContext.Provider>,
  );
}

describe('LessonPage', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('fr');
  });

  it('shows the real entries and categories for the selected lesson', () => {
    const lesson = vocabularyCorpus.lessons[0]!;
    const firstEntry = vocabularyCorpus.entries.find((entry) => entry.lessonId === lesson.id)!;
    renderLesson(`/app/lessons/${lesson.id}`);

    expect(screen.getByRole('heading', { level: 1, name: 'Leçon 01' })).toBeDefined();
    expect(screen.getByText(getPrimaryJapaneseForm(firstEntry))).toBeDefined();
    expect(screen.getByRole('link', { name: 'Réviser cette leçon' }).getAttribute('href')).toBe(
      `/app/quiz/configure?lesson=${lesson.id}`,
    );
    expect(
      screen.getAllByText('C = comprendre · P = produire · score sur 3').length,
    ).toBeGreaterThan(0);
    expect(screen.getAllByLabelText(/score 0 sur 3/).length).toBeGreaterThan(0);
  });

  it('handles an unknown lesson without inventing content', () => {
    renderLesson('/app/lessons/unknown');

    expect(screen.getByRole('heading', { name: 'Leçon introuvable' })).toBeDefined();
  });
});
