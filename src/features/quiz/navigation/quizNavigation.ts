import type { QuizSession } from '@/domain/quiz';

export type QuizRouteState = {
  session: QuizSession;
};

export type QuizResultRouteState = {
  correctCount: number;
  incorrectCount: number;
  total: number;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isQuizRouteState(value: unknown): value is QuizRouteState {
  if (!isRecord(value) || !isRecord(value.session)) {
    return false;
  }

  return (
    (value.session.direction === 'comprehension' || value.session.direction === 'production') &&
    Array.isArray(value.session.questions) &&
    typeof value.session.total === 'number' &&
    value.session.total === value.session.questions.length &&
    value.session.total > 0
  );
}

export function isQuizResultRouteState(value: unknown): value is QuizResultRouteState {
  return (
    isRecord(value) &&
    typeof value.correctCount === 'number' &&
    typeof value.incorrectCount === 'number' &&
    typeof value.total === 'number' &&
    value.correctCount >= 0 &&
    value.incorrectCount >= 0 &&
    value.total === value.correctCount + value.incorrectCount
  );
}
