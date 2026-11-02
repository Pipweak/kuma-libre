import corpusJson from '@/generated/corpus.json';
import type { VocabularyCorpus } from '@/domain/vocabulary';

/**
 * Typed read-only view of the generated corpus. The build executes the structural
 * validator before Vite, so this boundary never parses unvalidated application data.
 */
export const vocabularyCorpus = corpusJson as VocabularyCorpus;
