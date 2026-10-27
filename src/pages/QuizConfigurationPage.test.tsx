import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';

import { vocabularyCorpus } from '@/app/data/vocabularyCorpus';
import type { ProgressByEntry } from '@/domain/quiz';
import { ProgressContext } from '@/features/progress/ProgressContext';
import { QuizConfigurationPage } from '@/pages/QuizConfigurationPage';
import { i18n } from '@/shared/i18n/i18n';

function renderConfiguration(
  pathname = '/app/quiz/configure',
  progress: ProgressByEntry = {},
): ReturnType<typeof createMemoryRouter> {
  const router = createMemoryRouter(
    [
      { path: '/app/quiz/configure', Component: QuizConfigurationPage },
      { path: '/app/quiz', element: <p>Quiz démarré</p> },
    ],
    { initialEntries: [pathname] },
  );

  render(
    <ProgressContext.Provider
      value={{
        errorCode: null,
        progress,
        recordReview: () => Promise.reject(new Error('not used')),
        reload: () => Promise.resolve(),
        status: 'ready',
      }}
    >
      <RouterProvider router={router} />
    </ProgressContext.Provider>,
  );
  return router;
}

describe('QuizConfigurationPage', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('fr');
  });

  it('prefills the originating lesson and starts a real session', async () => {
    const user = userEvent.setup();
    const lesson = vocabularyCorpus.lessons[1]!;
    const router = renderConfiguration(`/app/quiz/configure?lesson=${lesson.id}`);
    const selectedLesson = screen.getByRole<HTMLInputElement>('checkbox', { name: '02' });

    expect(selectedLesson.checked).toBe(true);
    expect(screen.getByRole<HTMLInputElement>('radio', { name: /Comprendre/ }).checked).toBe(true);
    expect(screen.getByRole<HTMLInputElement>('checkbox', { name: /Non maîtrisés/ }).checked).toBe(
      true,
    );

    await user.click(screen.getByRole('button', { name: 'Commencer' }));

    expect(router.state.location.pathname).toBe('/app/quiz');
    expect(router.state.location.state).toMatchObject({
      session: {
        direction: 'comprehension',
        total: lesson.entryCount,
      },
    });
  });

  it('uses only the active interface language flag beside Japanese', async () => {
    await i18n.changeLanguage('es');
    renderConfiguration();

    const direction = screen.getByRole('img', {
      name: 'Comprender: japonés a español',
    });

    expect(direction.querySelectorAll('svg[viewBox="0 0 27 18"]')).toHaveLength(2);
  });

  it('explains why a lost in-memory session must be configured again', () => {
    renderConfiguration('/app/quiz/configure?session=missing');

    expect(screen.getByRole('status').textContent).toContain('Cette passe n’est plus disponible');
  });

  it('filters questions with the persisted direction-specific mastery', () => {
    const lesson = vocabularyCorpus.lessons[0]!;
    const masteredEntry = vocabularyCorpus.entries.find((entry) => entry.lessonId === lesson.id)!;
    renderConfiguration(`/app/quiz/configure?lesson=${lesson.id}`, {
      [masteredEntry.id]: {
        comprehension: { correctCount: 3, incorrectCount: 0, score: 3 },
      },
    });

    expect(screen.getByText(`${lesson.entryCount - 1} questions`)).toBeDefined();
  });
});
