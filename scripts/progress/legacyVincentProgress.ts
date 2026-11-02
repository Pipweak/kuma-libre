import type { VocabularyCorpus, VocabularyEntry } from '../../src/domain/vocabulary';

export type VincentProgressImportRow = {
  correct_total: number;
  direction: 'japanese_to_meaning';
  incorrect_total: number;
  last_result: 'correct' | 'incorrect' | 'skipped';
  last_reviewed_at: string;
  mastery_score: 0 | 1 | 3;
  word_id: string;
};

export type StoredProgressRow = Omit<
  VincentProgressImportRow,
  'last_result' | 'last_reviewed_at' | 'mastery_score'
> & {
  last_result: VincentProgressImportRow['last_result'] | null;
  last_reviewed_at: string | null;
  mastery_score: 0 | 1 | 2 | 3;
  user_id: string;
};

type LegacyStatus = 'green' | 'red' | 'yellow';

type LegacyProgressEntry = {
  correct_total: number;
  incorrect_total: number;
  japanese: string;
  last_result: 'correct' | 'incorrect' | 'skipped';
  last_reviewed: string;
  source: string;
  status: LegacyStatus;
};

type LegacyProgressFile = {
  direction: 'japanese_to_meaning';
  entries: Record<string, LegacyProgressEntry>;
  version: 2;
};

const STATUS_SCORES: Record<LegacyStatus, 0 | 1 | 3> = {
  green: 3,
  red: 0,
  yellow: 1,
};

const JAPANESE_SEPARATOR = /[\s,、;；/／()（）[\]「」『』【】]+/u;
const JAPANESE_PUNCTUATION = /[\s,、。，．・…!?！？;；/／()（）[\]「」『』【】]/gu;

/** Convert Vincent's legacy comprehension snapshot into current word_progress rows. */
export function buildVincentProgressImport(
  legacyValue: unknown,
  corpusValue: unknown,
): VincentProgressImportRow[] {
  const legacy = parseLegacyProgress(legacyValue);
  const corpus = parseCorpus(corpusValue);

  return Object.entries(legacy.entries).map(([legacyId, legacyEntry]) => {
    const corpusEntry = resolveCorpusEntry(legacyId, legacyEntry, corpus.entries);

    return {
      correct_total: legacyEntry.correct_total,
      direction: 'japanese_to_meaning',
      incorrect_total: legacyEntry.incorrect_total,
      last_result: legacyEntry.last_result,
      last_reviewed_at: `${legacyEntry.last_reviewed}T00:00:00.000Z`,
      mastery_score: STATUS_SCORES[legacyEntry.status],
      word_id: corpusEntry.id,
    };
  });
}

/** Detect rows that would overwrite progress changed after (or independently of) the legacy snapshot. */
export function findProgressImportConflicts(
  expectedRows: readonly VincentProgressImportRow[],
  storedRows: readonly StoredProgressRow[],
): StoredProgressRow[] {
  const expectedByWordId = new Map(expectedRows.map((row) => [row.word_id, row]));

  return storedRows.filter((storedRow) => {
    const expectedRow = expectedByWordId.get(storedRow.word_id);
    if (!expectedRow) return false;

    return (
      storedRow.direction !== expectedRow.direction ||
      storedRow.mastery_score !== expectedRow.mastery_score ||
      storedRow.correct_total !== expectedRow.correct_total ||
      storedRow.incorrect_total !== expectedRow.incorrect_total ||
      storedRow.last_result !== expectedRow.last_result ||
      storedRow.last_reviewed_at === null ||
      Date.parse(storedRow.last_reviewed_at) !== Date.parse(expectedRow.last_reviewed_at)
    );
  });
}

function parseLegacyProgress(value: unknown): LegacyProgressFile {
  if (!isRecord(value) || value.version !== 2 || value.direction !== 'japanese_to_meaning') {
    throw new Error('progress-vincent.json doit être en version 2 et cibler la compréhension.');
  }

  if (!isRecord(value.entries)) {
    throw new Error('progress-vincent.json ne contient pas de dictionnaire entries valide.');
  }

  const entries: Record<string, LegacyProgressEntry> = {};
  for (const [legacyId, entryValue] of Object.entries(value.entries)) {
    entries[legacyId] = parseLegacyEntry(legacyId, entryValue);
  }

  return { direction: 'japanese_to_meaning', entries, version: 2 };
}

function parseLegacyEntry(legacyId: string, value: unknown): LegacyProgressEntry {
  if (
    !isRecord(value) ||
    typeof value.source !== 'string' ||
    typeof value.japanese !== 'string' ||
    !isLegacyStatus(value.status) ||
    !isNonNegativeInteger(value.correct_total) ||
    !isNonNegativeInteger(value.incorrect_total) ||
    !isReviewResult(value.last_result) ||
    typeof value.last_reviewed !== 'string' ||
    !/^\d{4}-\d{2}-\d{2}$/u.test(value.last_reviewed)
  ) {
    throw new Error(`Entrée historique invalide : ${legacyId}.`);
  }

  return {
    correct_total: value.correct_total,
    incorrect_total: value.incorrect_total,
    japanese: value.japanese,
    last_result: value.last_result,
    last_reviewed: value.last_reviewed,
    source: value.source,
    status: value.status,
  };
}

function parseCorpus(value: unknown): VocabularyCorpus {
  if (!isRecord(value) || value.schemaVersion !== 1 || !Array.isArray(value.entries)) {
    throw new Error('Le corpus généré ne respecte pas le schéma version 1 attendu.');
  }

  for (const entry of value.entries) {
    if (
      !isRecord(entry) ||
      typeof entry.id !== 'string' ||
      !Array.isArray(entry.kana) ||
      !entry.kana.every((form) => typeof form === 'string') ||
      !Array.isArray(entry.kanji) ||
      !entry.kanji.every((form) => typeof form === 'string') ||
      !isRecord(entry.source) ||
      typeof entry.source.file !== 'string'
    ) {
      throw new Error('Le corpus généré contient une entrée inutilisable pour la migration.');
    }
  }

  return value as VocabularyCorpus;
}

function resolveCorpusEntry(
  legacyId: string,
  legacyEntry: LegacyProgressEntry,
  corpusEntries: readonly VocabularyEntry[],
): VocabularyEntry {
  const candidates = corpusEntries.filter(
    (entry) =>
      entry.source.file === legacyEntry.source && japaneseFormsMatch(legacyEntry.japanese, entry),
  );

  if (candidates.length !== 1) {
    const reason = candidates.length === 0 ? 'aucune correspondance' : 'correspondance ambiguë';
    throw new Error(`Migration impossible pour ${legacyId} : ${reason} dans le corpus généré.`);
  }

  const [candidate] = candidates;
  if (!candidate) {
    throw new Error(`Migration impossible pour ${legacyId} : correspondance introuvable.`);
  }
  return candidate;
}

function japaneseFormsMatch(legacyJapanese: string, entry: VocabularyEntry): boolean {
  const normalizedForms = [...entry.kana, ...entry.kanji].map(normalizeJapanese);
  const normalizedLegacy = normalizeJapanese(legacyJapanese);
  if (normalizedForms.includes(normalizedLegacy)) return true;

  const legacyParts = legacyJapanese
    .normalize('NFKC')
    .split(JAPANESE_SEPARATOR)
    .map(normalizeJapanese)
    .filter(Boolean);

  return legacyParts.length > 1 && legacyParts.every((part) => normalizedForms.includes(part));
}

function normalizeJapanese(value: string): string {
  return value.normalize('NFKC').replace(JAPANESE_PUNCTUATION, '');
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

function isLegacyStatus(value: unknown): value is LegacyStatus {
  return value === 'green' || value === 'red' || value === 'yellow';
}

function isReviewResult(value: unknown): value is 'correct' | 'incorrect' | 'skipped' {
  return value === 'correct' || value === 'incorrect' || value === 'skipped';
}
