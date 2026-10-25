import type { AnswerEvaluation } from './quizTypes';

const LATIN_CHARACTER = /\p{Script=Latin}/u;
const COMBINING_MARKS = /\p{Mark}+/gu;
const PUNCTUATION = /\p{Punctuation}+/gu;
const WHITESPACE = /\s+/gu;

function foldLatinDiacritics(value: string): string {
  return Array.from(value, (character) => {
    const decomposed = character.normalize('NFD');
    const baseCharacter = decomposed[0];

    if (baseCharacter !== undefined && LATIN_CHARACTER.test(baseCharacter)) {
      return decomposed.replace(COMBINING_MARKS, '');
    }

    return character;
  }).join('');
}

/**
 * Normalizes an answer without applying fuzzy or semantic corrections.
 * Latin diacritics, casing and punctuation are ignored, while Japanese
 * diacritics such as dakuten remain significant.
 */
export function normalizeAnswer(value: string): string {
  return foldLatinDiacritics(value.normalize('NFKC'))
    .toLocaleLowerCase('und')
    .replace(PUNCTUATION, '')
    .replace(WHITESPACE, ' ')
    .trim();
}

/** Compares an answer with every explicitly registered accepted form. */
export function evaluateAnswer(
  answer: string,
  acceptedAnswers: readonly string[],
): AnswerEvaluation {
  const normalizedAnswer = normalizeAnswer(answer);

  if (normalizedAnswer.length === 0) {
    return { isCorrect: false, matchedAnswer: null, normalizedAnswer };
  }

  const matchedAnswer =
    acceptedAnswers.find((candidate) => normalizeAnswer(candidate) === normalizedAnswer) ?? null;

  return {
    isCorrect: matchedAnswer !== null,
    matchedAnswer,
    normalizedAnswer,
  };
}
