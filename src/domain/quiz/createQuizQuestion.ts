import type { CorpusLocale, VocabularyEntry } from '../vocabulary';
import type { QuizDirection, QuizQuestion } from './quizTypes';

function uniqueNonEmpty(values: readonly string[]): string[] {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

/** Builds the question contract consumed later by the React quiz feature. */
export function createQuizQuestion(
  entry: VocabularyEntry,
  direction: QuizDirection,
  locale: CorpusLocale,
): QuizQuestion | null {
  const japaneseAnswers = uniqueNonEmpty([...entry.romaji, ...entry.kana, ...entry.kanji]);
  const meaningAnswers = uniqueNonEmpty([
    ...entry.meanings.fr,
    ...entry.meanings.en,
    ...entry.meanings.es,
  ]);

  const correction = {
    kana: entry.kana,
    kanji: entry.kanji,
    meanings: entry.meanings,
    romaji: entry.romaji,
  };

  if (direction === 'comprehension') {
    if (meaningAnswers.length === 0) {
      return null;
    }

    return {
      acceptedAnswers: meaningAnswers,
      categoryId: entry.categoryId,
      correction,
      direction,
      entryId: entry.id,
      lessonId: entry.lessonId,
      prompt: {
        kana: entry.kana,
        kanji: entry.kanji,
        kind: 'japanese',
      },
    };
  }

  const prompt = entry.meanings[locale][0];
  if (prompt === undefined || japaneseAnswers.length === 0) {
    return null;
  }

  return {
    acceptedAnswers: japaneseAnswers,
    categoryId: entry.categoryId,
    correction,
    direction,
    entryId: entry.id,
    lessonId: entry.lessonId,
    prompt: {
      kind: 'meaning',
      locale,
      text: prompt,
    },
  };
}
