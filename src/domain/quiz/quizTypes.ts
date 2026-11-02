import type { CorpusLocale, LocalizedMeanings, VocabularyCategoryId } from '../vocabulary';

export type QuizDirection = 'comprehension' | 'production';

export type MasteryScore = 0 | 1 | 2 | 3;

export type MasteryLevel = 'green' | 'red' | 'yellow';

export type QuizOrder = 'corpus' | 'random';

export type DirectionProgress = {
  correctCount: number;
  incorrectCount: number;
  score: MasteryScore;
};

export type EntryProgress = Partial<Record<QuizDirection, DirectionProgress>>;

export type ProgressByEntry = Readonly<Record<string, EntryProgress>>;

export type JapaneseQuestionPrompt = {
  kana: readonly string[];
  kanji: readonly string[];
  kind: 'japanese';
};

export type MeaningQuestionPrompt = {
  kind: 'meaning';
  locale: CorpusLocale;
  text: string;
};

export type QuizQuestionPrompt = JapaneseQuestionPrompt | MeaningQuestionPrompt;

export type QuizQuestion = {
  acceptedAnswers: readonly string[];
  categoryId: VocabularyCategoryId;
  correction: {
    kana: readonly string[];
    kanji: readonly string[];
    meanings: LocalizedMeanings;
    romaji: readonly string[];
  };
  direction: QuizDirection;
  entryId: string;
  lessonId: string;
  prompt: QuizQuestionPrompt;
};

export type QuizSessionConfig = {
  categoryIds?: readonly VocabularyCategoryId[];
  direction: QuizDirection;
  includedMasteryLevels: readonly MasteryLevel[];
  lessonIds: readonly string[];
  locale: CorpusLocale;
  order: QuizOrder;
};

export type QuickReviewConfig = {
  categoryIds?: readonly VocabularyCategoryId[];
  direction: QuizDirection;
  lessonIds?: readonly string[];
  locale: CorpusLocale;
};

export type QuizSession = {
  direction: QuizDirection;
  questions: readonly QuizQuestion[];
  total: number;
};

export type AnswerEvaluation = {
  isCorrect: boolean;
  matchedAnswer: string | null;
  normalizedAnswer: string;
};

export type ReviewTransition = {
  current: DirectionProgress;
  isCorrect: boolean;
  previous: DirectionProgress;
};

export type OverallMastery = {
  level: MasteryLevel;
  score: MasteryScore;
};
