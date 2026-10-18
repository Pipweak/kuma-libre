import type {
  CorpusLocale,
  CorpusValidationIssue,
  CorpusValidationMode,
  VocabularyCorpus,
} from './corpusTypes';

const REQUIRED_STRUCTURAL_LOCALES = ['en', 'fr'] as const satisfies ReadonlyArray<CorpusLocale>;
const REQUIRED_QUIZ_LOCALES = ['en', 'es', 'fr'] as const satisfies ReadonlyArray<CorpusLocale>;
const JAPANESE_SCRIPT_PATTERN = /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u;

/** Validates referential integrity structurally, then optional quiz-readiness migration rules. */
export function validateVocabularyCorpus(
  corpus: VocabularyCorpus,
  mode: CorpusValidationMode = 'structural',
): CorpusValidationIssue[] {
  const issues: CorpusValidationIssue[] = [];
  const lessonIds = new Set<string>();
  const lessonNumbers = new Set<number>();
  const categoryIds = new Set<string>();
  const entryIds = new Set<string>();

  for (const lesson of corpus.lessons) {
    addDuplicateIssue(issues, lessonIds, lesson.id, 'duplicate-lesson-id', 'Identifiant de leçon');
    addDuplicateIssue(
      issues,
      lessonNumbers,
      lesson.number,
      'duplicate-lesson-number',
      'Numéro de leçon',
    );
  }

  for (const category of corpus.categories) {
    addDuplicateIssue(
      issues,
      categoryIds,
      category.id,
      'duplicate-category-id',
      'Identifiant de catégorie',
    );
  }

  const requiredLocales =
    mode === 'quiz-ready' ? REQUIRED_QUIZ_LOCALES : REQUIRED_STRUCTURAL_LOCALES;

  for (const entry of corpus.entries) {
    if (entryIds.has(entry.id)) {
      issues.push({
        code: 'duplicate-entry-id',
        entryId: entry.id,
        message: `Identifiant d’entrée dupliqué : ${entry.id}.`,
      });
    }
    entryIds.add(entry.id);

    if (!lessonIds.has(entry.lessonId)) {
      issues.push({
        code: 'unknown-lesson',
        entryId: entry.id,
        message: `${entry.id} référence la leçon inconnue ${entry.lessonId}.`,
      });
    }

    if (!categoryIds.has(entry.categoryId)) {
      issues.push({
        code: 'unknown-category',
        entryId: entry.id,
        message: `${entry.id} référence la catégorie inconnue ${entry.categoryId}.`,
      });
    }

    if (entry.kana.length + entry.kanji.length + entry.romaji.length === 0) {
      issues.push({
        code: 'missing-japanese-form',
        entryId: entry.id,
        message: `${entry.id} ne possède aucune forme japonaise exploitable.`,
      });
    }

    for (const locale of requiredLocales) {
      if (entry.meanings[locale].length === 0) {
        issues.push({
          code: 'empty-meaning',
          entryId: entry.id,
          message: `${entry.id} ne possède aucune signification « ${locale} ».`,
        });
      }
    }

    if (mode === 'quiz-ready') {
      const hasJapaneseScript = [...entry.kana, ...entry.kanji].some((form) =>
        JAPANESE_SCRIPT_PATTERN.test(form),
      );

      if (hasJapaneseScript && entry.kana.length === 0) {
        issues.push({
          code: 'missing-kana',
          entryId: entry.id,
          message: `${entry.id} doit recevoir une lecture kana avant activation dans les quiz.`,
        });
      }

      if (entry.romaji.length === 0) {
        issues.push({
          code: 'missing-romaji',
          entryId: entry.id,
          message: `${entry.id} doit recevoir une forme rōmaji avant activation dans les quiz.`,
        });
      }
    }
  }

  return issues;
}

function addDuplicateIssue<T>(
  issues: CorpusValidationIssue[],
  values: Set<T>,
  value: T,
  code: 'duplicate-category-id' | 'duplicate-lesson-id' | 'duplicate-lesson-number',
  label: string,
): void {
  if (values.has(value)) {
    issues.push({ code, message: `${label} dupliqué : ${String(value)}.` });
  }
  values.add(value);
}
