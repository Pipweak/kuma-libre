import { describe, expect, it } from 'vitest';

import { applyReviewResult } from '@/domain/quiz';

import { quizReducer } from './quizReducer';
import { INITIAL_QUIZ_STATE, type QuizFeedback } from './quizState';

const correctFeedback: QuizFeedback = {
  answer: 'manger',
  isCorrect: true,
  isSkipped: false,
  transition: applyReviewResult(undefined, true),
};

describe('quizReducer', () => {
  it('edits the answer only before correction', () => {
    const answering = quizReducer(INITIAL_QUIZ_STATE, {
      answer: 'manger',
      type: 'answer-changed',
    });
    const corrected = quizReducer(answering, {
      feedback: correctFeedback,
      type: 'answer-evaluated',
    });

    expect(answering.answer).toBe('manger');
    expect(quizReducer(corrected, { answer: 'boire', type: 'answer-changed' })).toBe(corrected);
    expect(quizReducer(corrected, { feedback: correctFeedback, type: 'answer-evaluated' })).toBe(
      corrected,
    );
  });

  it('counts correct and incorrect answers and advances only after feedback', () => {
    expect(quizReducer(INITIAL_QUIZ_STATE, { type: 'next-question' })).toBe(INITIAL_QUIZ_STATE);

    const correctState = quizReducer(INITIAL_QUIZ_STATE, {
      feedback: correctFeedback,
      type: 'answer-evaluated',
    });
    const nextState = quizReducer(correctState, { type: 'next-question' });
    const incorrectState = quizReducer(nextState, {
      feedback: {
        ...correctFeedback,
        answer: '',
        isCorrect: false,
        isSkipped: true,
        transition: applyReviewResult(undefined, false),
      },
      type: 'answer-evaluated',
    });

    expect(correctState.correctCount).toBe(1);
    expect(nextState).toMatchObject({ answer: '', currentIndex: 1, feedback: null });
    expect(incorrectState).toMatchObject({ correctCount: 1, incorrectCount: 1 });
  });
});
