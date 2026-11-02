import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  areSerializedCorporaEquivalent,
  buildVocabularyCorpus,
  countEntriesByCategory,
  serializeVocabularyCorpus,
  type CorpusValidationIssue,
  type MarkdownCorpusSource,
  validateVocabularyCorpus,
} from '../../src/domain/vocabulary';

type Command = 'check' | 'generate' | 'validate-ready';

const REPOSITORY_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const LESSONS_ROOT = join(REPOSITORY_ROOT, 'lessons');
const GENERATED_CORPUS_PATH = join(REPOSITORY_ROOT, 'src/generated/corpus.json');

async function main(): Promise<void> {
  const command = readCommand(process.argv[2]);
  const sources = await readMarkdownSources();
  const corpus = buildVocabularyCorpus(sources);
  const structuralIssues = validateVocabularyCorpus(corpus, 'structural');

  throwWhenInvalid(structuralIssues, 'La validation structurelle du corpus a échoué');

  const serializedCorpus = serializeVocabularyCorpus(corpus);

  if (command === 'generate') {
    await mkdir(dirname(GENERATED_CORPUS_PATH), { recursive: true });
    await writeFile(GENERATED_CORPUS_PATH, serializedCorpus, 'utf8');
    printSummary(corpus.entries.length, corpus.lessons.length, countEntriesByCategory(corpus));
    printReadinessReport(validateVocabularyCorpus(corpus, 'quiz-ready'));
    return;
  }

  if (command === 'check') {
    const committedCorpus = await readGeneratedCorpus();
    if (!areSerializedCorporaEquivalent(committedCorpus, serializedCorpus)) {
      throw new Error(
        'src/generated/corpus.json n’est plus synchronisé. Exécutez « npm run corpus:generate ».',
      );
    }
    printSummary(corpus.entries.length, corpus.lessons.length, countEntriesByCategory(corpus));
    return;
  }

  throwWhenInvalid(
    validateVocabularyCorpus(corpus, 'quiz-ready'),
    'Le corpus n’est pas encore prêt pour les quiz',
  );
  printSummary(corpus.entries.length, corpus.lessons.length, countEntriesByCategory(corpus));
}

function readCommand(value: string | undefined): Command {
  if (value === 'check' || value === 'generate' || value === 'validate-ready') return value;
  throw new Error('Commande attendue : generate, check ou validate-ready.');
}

async function readMarkdownSources(): Promise<MarkdownCorpusSource[]> {
  const lessonDirectories = (await readdir(LESSONS_ROOT, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory() && /^lesson-\d{2}$/u.test(entry.name))
    .sort((left, right) => left.name.localeCompare(right.name));
  const sources: MarkdownCorpusSource[] = [];

  for (const lessonDirectory of lessonDirectories) {
    const directoryPath = join(LESSONS_ROOT, lessonDirectory.name);
    const markdownFiles = (await readdir(directoryPath, { withFileTypes: true }))
      .filter((entry) => entry.isFile() && entry.name.endsWith('.md'))
      .sort((left, right) => sourceFileOrder(left.name) - sourceFileOrder(right.name));

    for (const markdownFile of markdownFiles) {
      const absolutePath = join(directoryPath, markdownFile.name);
      sources.push({
        content: await readFile(absolutePath, 'utf8'),
        file: relative(REPOSITORY_ROOT, absolutePath).split(sep).join('/'),
      });
    }
  }

  return sources;
}

function sourceFileOrder(file: string): number {
  if (file === 'vocabulary.md') return 1;
  if (file === 'useful-words.md') return 2;
  return 3;
}

async function readGeneratedCorpus(): Promise<string> {
  try {
    return await readFile(GENERATED_CORPUS_PATH, 'utf8');
  } catch (error: unknown) {
    if (isNodeError(error) && error.code === 'ENOENT') {
      throw new Error(
        'src/generated/corpus.json est absent. Exécutez « npm run corpus:generate ».',
        { cause: error },
      );
    }
    throw error;
  }
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error;
}

function throwWhenInvalid(issues: CorpusValidationIssue[], title: string): void {
  if (issues.length === 0) return;

  const preview = issues
    .slice(0, 20)
    .map((issue) => `- ${issue.message}`)
    .join('\n');
  const remaining = issues.length > 20 ? `\n- … ${String(issues.length - 20)} autre(s)` : '';
  throw new Error(`${title} (${String(issues.length)}) :\n${preview}${remaining}`);
}

function printSummary(
  entryCount: number,
  lessonCount: number,
  categories: ReturnType<typeof countEntriesByCategory>,
): void {
  console.log(
    [
      `Corpus synchronisé : ${String(entryCount)} entrées, ${String(lessonCount)} leçons.`,
      `Catégories : vocabulary=${String(categories.vocabulary)}, expressions=${String(categories.expressions)}, proper-nouns=${String(categories['proper-nouns'])}, useful-words=${String(categories['useful-words'])}.`,
    ].join('\n'),
  );
}

function printReadinessReport(issues: CorpusValidationIssue[]): void {
  const counts = new Map<string, number>();
  for (const issue of issues) counts.set(issue.code, (counts.get(issue.code) ?? 0) + 1);

  if (issues.length === 0) {
    console.log('Le corpus est prêt pour les quiz.');
    return;
  }

  console.warn(
    `Migration quiz restante : es=${String(counts.get('empty-meaning') ?? 0)}, kana=${String(counts.get('missing-kana') ?? 0)}, romaji=${String(counts.get('missing-romaji') ?? 0)}.`,
  );
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
