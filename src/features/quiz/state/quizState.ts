import type { ReviewTransition } from '@/domain/quiz';

export type QuizFeedback = {
  answer: string;
  isCorrect: boolean;
  isSkipped: boolean;
  transition: ReviewTransition;
};

export type QuizUiState = {
  answer: string;
  correctCount: number;
  currentIndex: number;
  feedback: QuizFeedback | null;
  incorrectCount: number;
};

export type QuizAction =
  | { answer: string; type: 'answer-changed' }
  | { feedback: QuizFeedback; type: 'answer-evaluated' }
  | { type: 'next-question' };

export const INITIAL_QUIZ_STATE: QuizUiState = {
  answer: '',
  correctCount: 0,
  currentIndex: 0,
  feedback: null,
  incorrectCount: 0,
};
