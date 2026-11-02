import type { VocabularyCorpus } from './corpusTypes';

/** Serializes the generated corpus with the canonical formatting committed to Git. */
export function serializeVocabularyCorpus(corpus: VocabularyCorpus): string {
  return `${JSON.stringify(corpus, null, 2)}\n`;
}

/**
 * Compares generated corpus contents independently of Git line-ending conversion.
 * Windows checkouts may contain CRLF even though the canonical artifact uses LF.
 */
export function areSerializedCorporaEquivalent(actual: string, expected: string): boolean {
  return normalizeLineEndings(actual) === normalizeLineEndings(expected);
}

function normalizeLineEndings(value: string): string {
  return value.replaceAll('\r\n', '\n');
}
