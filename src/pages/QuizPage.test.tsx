import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMemoryRouter, RouterProvider } from 'react-router';

import type { QuizQuestion, QuizSession, ReviewTransition } from '@/domain/quiz';
import type { ReviewSubmission } from '@/domain/progress';
import { ProgressContext } from '@/features/progress/ProgressContext';
import { QuizPage } from '@/pages/QuizPage';
import { SpeechProvider } from '@/features/speech/SpeechProvider';
import type { SpeechServices } from '@/features/speech/SpeechServices';
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

const TRANSITION: ReviewTransition = {
  current: { correctCount: 1, incorrectCount: 0, score: 1 },
  isCorrect: true,
  previous: { correctCount: 0, incorrectCount: 0, score: 0 },
};

const UNSUPPORTED_SPEECH_SERVICES: SpeechServices = {
  recognizer: {
    cancel: vi.fn(),
    isSupported: () => false,
    start: vi.fn().mockRejectedValue(new Error('unsupported')),
    stop: vi.fn(),
  },
  synthesizer: {
    isSupported: () => false,
    speak: vi.fn().mockRejectedValue(new Error('unsupported')),
    stop: vi.fn(),
  },
};

function renderQuiz(
  state: unknown = { session: SESSION },
  recordReview = vi
    .fn<(review: ReviewSubmission) => Promise<ReviewTransition>>()
    .mockResolvedValue(TRANSITION),
): { recordReview: typeof recordReview; router: ReturnType<typeof createMemoryRouter> } {
  const router = createMemoryRouter(
    [
      { path: '/app/quiz', Component: QuizPage },
      { path: '/app/quiz/configure', element: <p>Configuration requise</p> },
      { path: '/app/quiz/result', element: <p>Résultat atteint</p> },
      { path: '/app', element: <p>Accueil connecté</p> },
    ],
    { initialEntries: [{ pathname: '/app/quiz', state }] },
  );

  render(
    <ProgressContext.Provider
      value={{
        errorCode: null,
        progress: {},
        recordReview,
        reload: () => Promise.resolve(),
        status: 'ready',
      }}
    >
      <SpeechProvider services={UNSUPPORTED_SPEECH_SERVICES}>
        <RouterProvider router={router} />
      </SpeechProvider>
    </ProgressContext.Provider>,
  );
  return { recordReview, router };
}

describe('QuizPage', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('fr');
  });

  it('validates an answer, displays the correction, and completes the session', async () => {
    const user = userEvent.setup();
    const { recordReview, router } = renderQuiz();
    const answer = screen.getByRole('textbox', { name: 'Ta réponse' });

    expect(screen.getByRole('heading', { level: 1, name: 'Question 1 sur 1' })).toBeDefined();

    await user.type(answer, 'Je');
    await user.click(screen.getByRole('button', { name: 'Valider' }));

    expect((await screen.findByRole('status')).textContent).toContain('Bonne réponse');
    expect(recordReview).toHaveBeenCalledWith(
      expect.objectContaining({
        direction: 'comprehension',
        entryId: QUESTION.entryId,
        normalizedAnswer: 'je',
        result: 'correct',
        submittedAnswer: 'Je',
      }),
    );
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

  it('labels a production answer as Japanese', () => {
    renderQuiz({
      session: {
        direction: 'production',
        questions: [
          {
            ...QUESTION,
            acceptedAnswers: ['watashi', 'わたし', '私'],
            direction: 'production',
            prompt: { kind: 'meaning', locale: 'fr', text: 'je' },
          },
        ],
        total: 1,
      },
    });

    expect(screen.getByRole('textbox', { name: 'Ta réponse en japonais' })).toBeDefined();
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

  it('explains persisted answers and exits to the connected home', async () => {
    const user = userEvent.setup();
    const { router } = renderQuiz();

    await user.type(screen.getByRole('textbox', { name: 'Ta réponse' }), 'je');
    await user.click(screen.getByRole('button', { name: 'Valider' }));
    await screen.findByRole('heading', { name: 'Bonne réponse' });
    await user.click(screen.getByRole('button', { name: 'Quitter le quiz' }));

    expect(screen.getByText(/1 réponse déjà validée est sauvegardée/)).toBeDefined();
    await user.click(screen.getByRole('button', { name: 'Quitter la passe' }));

    expect(router.state.location.pathname).toBe('/app');
  });

  it('redirects a refreshed session to configuration', async () => {
    renderQuiz(null);

    expect(await screen.findByText('Configuration requise')).toBeDefined();
  });

  it('retries the same review without advancing when persistence fails', async () => {
    const user = userEvent.setup();
    const recordReview = vi
      .fn<(review: ReviewSubmission) => Promise<ReviewTransition>>()
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce(TRANSITION);
    renderQuiz({ session: SESSION }, recordReview);

    await user.type(screen.getByRole('textbox', { name: 'Ta réponse' }), 'je');
    await user.click(screen.getByRole('button', { name: 'Valider' }));

    expect((await screen.findByRole('alert')).textContent).toContain('Enregistrement impossible');
    const firstReview = recordReview.mock.calls[0]![0];
    await user.click(screen.getByRole('button', { name: 'Réessayer l’enregistrement' }));

    expect((await screen.findByRole('status')).textContent).toContain('Bonne réponse');
    expect(recordReview).toHaveBeenCalledTimes(2);
    expect(recordReview.mock.calls[1]![0].id).toBe(firstReview.id);
  });

  it('persists a skipped answer as a distinct incorrect outcome', async () => {
    const user = userEvent.setup();
    const recordReview = vi
      .fn<(review: ReviewSubmission) => Promise<ReviewTransition>>()
      .mockResolvedValue({
        current: { correctCount: 0, incorrectCount: 1, score: 0 },
        isCorrect: false,
        previous: { correctCount: 0, incorrectCount: 0, score: 0 },
      });
    renderQuiz({ session: SESSION }, recordReview);

    await user.click(screen.getByRole('button', { name: 'Je ne sais pas' }));

    expect((await screen.findByRole('status')).textContent).toContain('À retravailler');
    expect(recordReview).toHaveBeenCalledWith(
      expect.objectContaining({
        normalizedAnswer: '',
        result: 'skipped',
        submittedAnswer: '',
      }),
    );
  });
});
