import type { CorpusLocale, VocabularyEntry } from '@/domain/vocabulary';

export function formatLessonNumber(number: number): string {
  return String(number).padStart(2, '0');
}

export function getPrimaryJapaneseForm(entry: VocabularyEntry): string {
  return entry.kanji[0] ?? entry.kana[0] ?? entry.romaji[0] ?? '';
}

export function getJapaneseReading(entry: VocabularyEntry): string {
  const readings = entry.kanji.length > 0 ? [...entry.kana, ...entry.romaji] : entry.romaji;
  return readings.join(' · ');
}

export function getLocalizedMeaning(entry: VocabularyEntry, locale: CorpusLocale): string | null {
  const meanings = entry.meanings[locale];
  return meanings.length > 0 ? meanings.join(' · ') : null;
}
