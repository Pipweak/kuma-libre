import type {
  DirectionProgress,
  MasteryLevel,
  MasteryScore,
  OverallMastery,
  ReviewTransition,
} from './quizTypes';

export const EMPTY_DIRECTION_PROGRESS: Readonly<DirectionProgress> = Object.freeze({
  correctCount: 0,
  incorrectCount: 0,
  score: 0,
});

/** Maps the compact score used by persistence to its user-facing level. */
export function getMasteryLevel(score: MasteryScore): MasteryLevel {
  if (score === 0) {
    return 'red';
  }

  if (score === 3) {
    return 'green';
  }

  return 'yellow';
}

/**
 * Applies one validated answer to a single quiz direction.
 * Errors only demote a mastered entry; successes always advance by one up to three.
 */
export function applyReviewResult(
  progress: DirectionProgress | undefined,
  isCorrect: boolean,
): ReviewTransition {
  const previous = progress ?? EMPTY_DIRECTION_PROGRESS;
  let score: MasteryScore = previous.score;

  if (isCorrect) {
    score = Math.min(previous.score + 1, 3) as MasteryScore;
  } else if (previous.score === 3) {
    score = 2;
  }

  return {
    current: {
      correctCount: previous.correctCount + (isCorrect ? 1 : 0),
      incorrectCount: previous.incorrectCount + (isCorrect ? 0 : 1),
      score,
    },
    isCorrect,
    previous: { ...previous },
  };
}

/** Derives the global mastery from the weaker of comprehension and production. */
export function deriveOverallMastery(
  comprehension: DirectionProgress | undefined,
  production: DirectionProgress | undefined,
): OverallMastery {
  const score = Math.min(
    comprehension?.score ?? EMPTY_DIRECTION_PROGRESS.score,
    production?.score ?? EMPTY_DIRECTION_PROGRESS.score,
  ) as MasteryScore;

  return { level: getMasteryLevel(score), score };
}
