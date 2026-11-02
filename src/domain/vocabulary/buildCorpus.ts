import { VOCABULARY_CATEGORIES } from './corpusMetadata';
import { parseMarkdownVocabularySource } from './parseMarkdownVocabulary';
import type {
  MarkdownCorpusSource,
  VocabularyCategoryId,
  VocabularyCorpus,
  VocabularyEntry,
} from './corpusTypes';

/** Builds a deterministic corpus from Markdown contents supplied by the caller. */
export function buildVocabularyCorpus(sources: MarkdownCorpusSource[]): VocabularyCorpus {
  const sortedSources = [...sources].sort(compareCorpusSources);
  const parsedEntries = sortedSources.flatMap(parseMarkdownVocabularySource);
  const counters = new Map<string, number>();
  const entries: VocabularyEntry[] = parsedEntries.map((entry) => {
    const lessonId = formatLessonId(entry.lessonNumber);
    const counterKey = `${lessonId}:${entry.categoryId}`;
    const sequence = (counters.get(counterKey) ?? 0) + 1;
    counters.set(counterKey, sequence);

    return {
      categoryId: entry.categoryId,
      id: `${lessonId}-${entry.categoryId}-${String(sequence).padStart(3, '0')}`,
      kana: entry.kana,
      kanji: entry.kanji,
      lessonId,
      meanings: entry.meanings,
      ...(entry.notes ? { notes: entry.notes } : {}),
      romaji: entry.romaji,
      source: entry.source,
    };
  });
  const lessonNumbers = uniqueSortedNumbers(parsedEntries.map((entry) => entry.lessonNumber));
  const lessons = lessonNumbers.map((number) => {
    const id = formatLessonId(number);
    return {
      entryCount: entries.filter((entry) => entry.lessonId === id).length,
      id,
      number,
      order: number,
    };
  });

  return {
    categories: VOCABULARY_CATEGORIES.map((category) => ({ ...category })),
    entries,
    lessons,
    schemaVersion: 1,
  };
}

/** Formats the stable public identifier used by lessons and vocabulary entries. */
export function formatLessonId(lessonNumber: number): string {
  return `lesson-${String(lessonNumber).padStart(2, '0')}`;
}

/** Counts generated entries by category without relying on their display order. */
export function countEntriesByCategory(
  corpus: VocabularyCorpus,
): Record<VocabularyCategoryId, number> {
  const counts: Record<VocabularyCategoryId, number> = {
    expressions: 0,
    'proper-nouns': 0,
    'useful-words': 0,
    vocabulary: 0,
  };

  for (const entry of corpus.entries) counts[entry.categoryId] += 1;
  return counts;
}

function compareCorpusSources(left: MarkdownCorpusSource, right: MarkdownCorpusSource): number {
  const lessonComparison = readLessonNumber(left.file) - readLessonNumber(right.file);
  if (lessonComparison !== 0) return lessonComparison;

  const priorityComparison = sourceFilePriority(left.file) - sourceFilePriority(right.file);
  if (priorityComparison !== 0) return priorityComparison;

  return left.file.localeCompare(right.file);
}

function readLessonNumber(file: string): number {
  const match = /(?:^|\/)lesson-(\d+)(?:\/|$)/u.exec(file.replaceAll('\\', '/'));
  return match?.[1] ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}

function sourceFilePriority(file: string): number {
  const normalizedFile = file.replaceAll('\\', '/');
  if (normalizedFile.endsWith('/vocabulary.md')) return 1;
  if (normalizedFile.endsWith('/useful-words.md')) return 2;
  return 3;
}

function uniqueSortedNumbers(values: number[]): number[] {
  return [...new Set(values)].sort((left, right) => left - right);
}
