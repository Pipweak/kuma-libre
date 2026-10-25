import type { VocabularyCategoryId, VocabularyEntry } from '../vocabulary';
import { createQuizQuestion } from './createQuizQuestion';
import { getMasteryLevel } from './progress';
import type {
  MasteryScore,
  ProgressByEntry,
  QuickReviewConfig,
  QuizDirection,
  QuizQuestion,
  QuizSession,
  QuizSessionConfig,
} from './quizTypes';

export type RandomSource = () => number;

type SessionScope = {
  categoryIds?: readonly VocabularyCategoryId[];
  lessonIds?: readonly string[];
};

function isInsideScope(entry: VocabularyEntry, scope: SessionScope): boolean {
  const isLessonSelected =
    scope.lessonIds === undefined || scope.lessonIds.includes(entry.lessonId);
  const isCategorySelected =
    scope.categoryIds === undefined || scope.categoryIds.includes(entry.categoryId);

  return isLessonSelected && isCategorySelected;
}

function getDirectionScore(
  progress: ProgressByEntry,
  entryId: string,
  direction: QuizDirection,
): MasteryScore {
  return progress[entryId]?.[direction]?.score ?? 0;
}

function shuffle(values: readonly QuizQuestion[], random: RandomSource): QuizQuestion[] {
  const result = [...values];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.max(0, Math.min(Math.floor(random() * (index + 1)), index));
    // Both indexes are bounded by the loop and clamp above.
    const currentValue = result[index]!;
    const randomValue = result[randomIndex]!;
    result[index] = randomValue;
    result[randomIndex] = currentValue;
  }

  return result;
}

function buildQuestions(
  entries: readonly VocabularyEntry[],
  direction: QuizDirection,
  locale: QuizSessionConfig['locale'],
): QuizQuestion[] {
  const includedEntryIds = new Set<string>();

  return entries.flatMap((entry) => {
    if (includedEntryIds.has(entry.id)) {
      return [];
    }

    const question = createQuizQuestion(entry, direction, locale);
    if (question === null) {
      return [];
    }

    includedEntryIds.add(entry.id);
    return [question];
  });
}

/** Builds a fixed session containing every entry matching the explicit configuration. */
export function buildQuizSession(
  entries: readonly VocabularyEntry[],
  progress: ProgressByEntry,
  config: QuizSessionConfig,
  random: RandomSource = Math.random,
): QuizSession {
  const includedLevels = new Set(config.includedMasteryLevels);
  const filteredEntries = entries.filter((entry) => {
    if (!isInsideScope(entry, config)) {
      return false;
    }

    const level = getMasteryLevel(getDirectionScore(progress, entry.id, config.direction));
    return includedLevels.has(level);
  });
  const questions = buildQuestions(filteredEntries, config.direction, config.locale);
  const orderedQuestions = config.order === 'random' ? shuffle(questions, random) : questions;

  return {
    direction: config.direction,
    questions: orderedQuestions,
    total: orderedQuestions.length,
  };
}

/**
 * Builds the quick-review preset: at most ten red entries, then yellow entries,
 * with random selection inside each priority and no mastered entries.
 */
export function buildQuickReviewSession(
  entries: readonly VocabularyEntry[],
  progress: ProgressByEntry,
  config: QuickReviewConfig,
  random: RandomSource = Math.random,
): QuizSession {
  const eligibleQuestions = buildQuestions(
    entries.filter((entry) => isInsideScope(entry, config)),
    config.direction,
    config.locale,
  );
  const redQuestions: QuizQuestion[] = [];
  const yellowQuestions: QuizQuestion[] = [];

  for (const question of eligibleQuestions) {
    const level = getMasteryLevel(getDirectionScore(progress, question.entryId, config.direction));
    if (level === 'red') {
      redQuestions.push(question);
    } else if (level === 'yellow') {
      yellowQuestions.push(question);
    }
  }

  const selectedRedQuestions = shuffle(redQuestions, random).slice(0, 10);
  const remainingSlots = 10 - selectedRedQuestions.length;
  const questions = [
    ...selectedRedQuestions,
    ...shuffle(yellowQuestions, random).slice(0, remainingSlots),
  ];

  return {
    direction: config.direction,
    questions,
    total: questions.length,
  };
}
