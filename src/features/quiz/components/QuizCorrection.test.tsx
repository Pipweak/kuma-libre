import { render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';

import type { QuizQuestion, ReviewTransition } from '@/domain/quiz';
import { QuizCorrection } from '@/features/quiz/components/QuizCorrection';
import type { QuizFeedback } from '@/features/quiz/state/quizState';
import { i18n } from '@/shared/i18n/i18n';

const QUESTION: QuizQuestion = {
  acceptedAnswers: ['tabemasu', 'たべます', '食べます'],
  categoryId: 'vocabulary',
  correction: {
    kana: ['たべます'],
    kanji: ['食べます'],
    meanings: { en: ['eat'], es: ['comer'], fr: ['manger'] },
    romaji: ['tabemasu'],
  },
  direction: 'production',
  entryId: 'entry-1',
  lessonId: 'lesson-06',
  prompt: { kind: 'meaning', locale: 'fr', text: 'manger' },
};

function createFeedback(
  transition: ReviewTransition,
  options: Partial<QuizFeedback> = {},
): QuizFeedback {
  return {
    answer: 'nomimasu',
    isCorrect: false,
    isSkipped: false,
    transition,
    ...options,
  };
}

describe('QuizCorrection', () => {
  beforeEach(async () => {
    await i18n.changeLanguage('fr');
  });

  it('shows an incorrect answer and a red mastery message', () => {
    const feedback = createFeedback({
      current: { correctCount: 0, incorrectCount: 1, score: 0 },
      isCorrect: false,
      previous: { correctCount: 0, incorrectCount: 0, score: 0 },
    });

    render(<QuizCorrection feedback={feedback} question={QUESTION} />);

    expect(screen.getByRole('heading', { name: 'À retravailler' })).toBeDefined();
    expect(screen.getByText('nomimasu')).toBeDefined();
    expect(screen.getByText('Réponse attendue')).toBeDefined();
    expect(screen.getByText('食べます · たべます · tabemasu')).toBeDefined();
    expect(screen.getByText('Ce mot reste non maîtrisé.')).toBeDefined();
  });

  it('omits the user answer for a skipped word', () => {
    const feedback = createFeedback(
      {
        current: { correctCount: 0, incorrectCount: 1, score: 0 },
        isCorrect: false,
        previous: { correctCount: 0, incorrectCount: 0, score: 0 },
      },
      { answer: '', isSkipped: true },
    );

    render(<QuizCorrection feedback={feedback} question={QUESTION} />);

    expect(screen.queryByText('Réponse donnée')).toBeNull();
  });

  it('announces green mastery after a correct answer', () => {
    const feedback = createFeedback(
      {
        current: { correctCount: 3, incorrectCount: 0, score: 3 },
        isCorrect: true,
        previous: { correctCount: 2, incorrectCount: 0, score: 2 },
      },
      { answer: 'tabemasu', isCorrect: true },
    );

    render(<QuizCorrection feedback={feedback} question={QUESTION} />);

    expect(screen.getByText('Ce mot est maintenant maîtrisé.')).toBeDefined();
  });
});
