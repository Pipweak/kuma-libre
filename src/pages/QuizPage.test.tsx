import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';

import type { QuizQuestion, QuizSession } from '@/domain/quiz';
import { QuizPage } from '@/pages/QuizPage';
import { i18n } from '@/shared/i18n/i18n';

const QUESTION: QuizQuestion = {
  acceptedAnswers: ['je', 'I', 'yo'],
  categoryId: 'vocabulary',
  correction: {
    kana: ['わたし'],
    kanji: ['私'],
    meanings: { en: ['I'], es: ['yo'], fr: ['je'] },
    romaji: ['watashi'],
  },
  direction: 'comprehension',
  entryId: 'lesson-01-vocabulary-watashi',
  lessonId: 'lesson-01',
  prompt: { kana: ['わたし'], kanji: ['私'], kind: 'japanese' },
};

const SESSION: QuizSession = {
  direction: 'comprehension',
  questions: [QUESTION],
  total: 1,
};

function renderQuiz(state: unknown = { session: SESSION }): ReturnType<typeof createMemoryRouter> {
  const router = createMemoryRouter(
    [
      { path: '/app/quiz', Component: QuizPage },
      { path: '/app/quiz/configure', element: <p>Configuration requise</p> },
      { path: '/app/quiz/result', element: <p>Résultat atteint</p> },
    ],
    { initialEntries: [{ pathname: '/app/quiz', state }] },
  );

  render(<RouterProvider router={router} />);
  return router;
}

describe('QuizPage', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('fr');
  });

  it('validates an answer, displays the correction, and completes the session', async () => {
    const user = userEvent.setup();
    const router = renderQuiz();
    const answer = screen.getByRole('textbox', { name: 'Ta réponse' });

    await user.type(answer, 'Je');
    await user.click(screen.getByRole('button', { name: 'Valider' }));

    expect(screen.getByRole('status').textContent).toContain('Bonne réponse');
    expect(screen.getByText('je · I · yo')).toBeDefined();
    expect(screen.getByText('私 · わたし · watashi')).toBeDefined();

    await user.click(screen.getByRole('button', { name: 'Question suivante' }));

    expect(router.state.location.pathname).toBe('/app/quiz/result');
    expect(router.state.location.state).toEqual({
      correctCount: 1,
      incorrectCount: 0,
      total: 1,
    });
  });

  it('keeps keyboard focus inside the exit dialog and closes it with Escape', async () => {
    const user = userEvent.setup();
    renderQuiz();
    const exitButton = screen.getByRole('button', { name: 'Quitter le quiz' });

    await user.click(exitButton);
    expect(screen.getByRole('dialog')).toBeDefined();
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Continuer le quiz' }));

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.activeElement).toBe(exitButton);
  });

  it('redirects a refreshed session to configuration', async () => {
    renderQuiz(null);

    expect(await screen.findByText('Configuration requise')).toBeDefined();
  });
});
