import { toRomaji } from 'wanakana';

import type {
  MarkdownCorpusSource,
  ParsedVocabularyEntry,
  VocabularyCategoryId,
} from './corpusTypes';

type KnownColumn = 'en' | 'es' | 'fr' | 'japanese' | 'kana' | 'kanji' | 'mastery' | 'reading';

type ParsedTable = {
  headers: KnownColumn[];
  rows: Array<{ cells: string[]; line: number }>;
};

type JapaneseForms = {
  kana: string[];
  kanji: string[];
  notes: string[];
  romaji: string[];
};

const JAPANESE_CHARACTER_PATTERN = /[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}]/u;
const KANA_PATTERN = /[\p{Script=Hiragana}\p{Script=Katakana}]/u;
const KANJI_PATTERN = /\p{Script=Han}/u;
const LESSON_PATH_PATTERN = /(?:^|\/)lesson-(\d{2})(?:\/|$)/u;

/** Parses every supported Markdown table in one lesson source without reading the filesystem. */
export function parseMarkdownVocabularySource(
  source: MarkdownCorpusSource,
): ParsedVocabularyEntry[] {
  const lessonNumber = readLessonNumber(source.file);
  const lines = source.content.replaceAll('\r\n', '\n').split('\n');
  const parsedEntries: ParsedVocabularyEntry[] = [];
  let currentSection: string | undefined;
  let lineIndex = 0;

  while (lineIndex < lines.length) {
    const line = lines[lineIndex] ?? '';
    const heading = readSectionHeading(line);

    if (heading) {
      currentSection = heading;
      lineIndex += 1;
      continue;
    }

    if (!line.trimStart().startsWith('|')) {
      lineIndex += 1;
      continue;
    }

    const tableStartIndex = lineIndex;
    const tableLines: Array<{ line: number; value: string }> = [];

    while (lineIndex < lines.length && (lines[lineIndex] ?? '').trimStart().startsWith('|')) {
      tableLines.push({ line: lineIndex + 1, value: lines[lineIndex] ?? '' });
      lineIndex += 1;
    }

    const table = parseTable(tableLines, source.file, tableStartIndex + 1);
    const categoryId = detectCategory(source.file, currentSection);

    for (const row of table.rows) {
      parsedEntries.push(
        parseVocabularyRow({
          categoryId,
          cells: row.cells,
          headers: table.headers,
          lessonNumber,
          line: row.line,
          ...(currentSection ? { section: currentSection } : {}),
          sourceFile: source.file,
        }),
      );
    }
  }

  return parsedEntries;
}

function readLessonNumber(file: string): number {
  const normalizedFile = file.replaceAll('\\', '/');
  const match = LESSON_PATH_PATTERN.exec(normalizedFile);

  if (!match?.[1]) {
    throw new Error(`${file}: impossible de déterminer le numéro de leçon depuis le chemin.`);
  }

  return Number(match[1]);
}

function readSectionHeading(line: string): string | undefined {
  const match = /^#{2,6}\s+(.+?)\s*$/u.exec(line.trim());
  return match?.[1]?.trim();
}

function parseTable(
  tableLines: Array<{ line: number; value: string }>,
  file: string,
  fallbackLine: number,
): ParsedTable {
  if (tableLines.length < 2) {
    throw new Error(`${file}:${fallbackLine}: tableau Markdown incomplet.`);
  }

  const rawHeaders = splitMarkdownRow(tableLines[0]?.value ?? '');
  const separatorCells = splitMarkdownRow(tableLines[1]?.value ?? '');

  if (
    rawHeaders.length === 0 ||
    separatorCells.length !== rawHeaders.length ||
    separatorCells.some((cell) => !/^:?-{3,}:?$/u.test(cell.replaceAll(' ', '')))
  ) {
    throw new Error(
      `${file}:${tableLines[1]?.line ?? fallbackLine}: séparateur de tableau invalide.`,
    );
  }

  const headers = rawHeaders.map((header) => identifyColumn(header, file, tableLines[0]?.line));
  const rows = tableLines.slice(2).map(({ line, value }) => {
    const cells = splitMarkdownRow(value);

    if (cells.length !== headers.length) {
      throw new Error(
        `${file}:${line}: ${String(cells.length)} cellule(s) trouvée(s), ${String(headers.length)} attendue(s).`,
      );
    }

    return { cells, line };
  });

  return { headers, rows };
}

function splitMarkdownRow(row: string): string[] {
  const content = row.trim().replace(/^\|/u, '').replace(/\|$/u, '');
  const cells: string[] = [];
  let cell = '';
  let isEscaped = false;

  for (const character of content) {
    if (isEscaped) {
      cell += character;
      isEscaped = false;
      continue;
    }

    if (character === '\\') {
      isEscaped = true;
      continue;
    }

    if (character === '|') {
      cells.push(cleanCell(cell));
      cell = '';
      continue;
    }

    cell += character;
  }

  if (isEscaped) {
    cell += '\\';
  }

  cells.push(cleanCell(cell));
  return cells;
}

function cleanCell(cell: string): string {
  return cell
    .replace(/<br\s*\/?>/giu, ' ')
    .replaceAll('\\|', '|')
    .trim();
}

function identifyColumn(header: string, file: string, line?: number): KnownColumn {
  const normalizedHeader = normalizeHeader(header);

  if (normalizedHeader.startsWith('kana')) return 'kana';
  if (normalizedHeader.startsWith('kanji')) return 'kanji';
  if (normalizedHeader.startsWith('lecture')) return 'reading';
  if (normalizedHeader.startsWith('japonais') || normalizedHeader.startsWith('japanese')) {
    return 'japanese';
  }
  if (normalizedHeader.startsWith('english')) return 'en';
  if (normalizedHeader.startsWith('francais')) return 'fr';
  if (normalizedHeader.startsWith('espanol')) return 'es';
  if (normalizedHeader.startsWith('maitrise')) return 'mastery';

  throw new Error(`${file}:${String(line ?? 1)}: colonne inconnue « ${header} ».`);
}

function normalizeHeader(header: string): string {
  return header
    .normalize('NFD')
    .replace(/\p{Mark}/gu, '')
    .toLocaleLowerCase('fr')
    .replace(/\s+/gu, ' ')
    .trim();
}

function detectCategory(file: string, section?: string): VocabularyCategoryId {
  if (file.replaceAll('\\', '/').endsWith('/useful-words.md')) return 'useful-words';

  const normalizedSection = normalizeHeader(section ?? '');

  if (/nom(?:s)? propre/u.test(normalizedSection)) return 'proper-nouns';
  if (/expression|conversation|会話|練習/u.test(section ?? normalizedSection)) return 'expressions';
  return 'vocabulary';
}

function parseVocabularyRow(input: {
  categoryId: VocabularyCategoryId;
  cells: string[];
  headers: KnownColumn[];
  lessonNumber: number;
  line: number;
  section?: string;
  sourceFile: string;
}): ParsedVocabularyEntry {
  const values = new Map<KnownColumn, string>();

  input.headers.forEach((header, index) => {
    values.set(header, input.cells[index] ?? '');
  });

  const japaneseForms = parseJapaneseForms({
    japanese: values.get('japanese') ?? '',
    kana: values.get('kana') ?? '',
    kanji: values.get('kanji') ?? '',
    reading: values.get('reading') ?? '',
  });

  const meanings = {
    en: splitMeaningAlternatives(values.get('en') ?? ''),
    es: splitMeaningAlternatives(values.get('es') ?? ''),
    fr: splitMeaningAlternatives(values.get('fr') ?? ''),
  };
  const source = input.section
    ? { file: input.sourceFile, section: input.section }
    : { file: input.sourceFile };

  return {
    categoryId: input.categoryId,
    kana: japaneseForms.kana,
    kanji: japaneseForms.kanji,
    lessonNumber: input.lessonNumber,
    meanings,
    ...(japaneseForms.notes.length > 0 ? { notes: japaneseForms.notes } : {}),
    romaji: japaneseForms.romaji,
    source,
    sourceLine: input.line,
  };
}

function parseJapaneseForms(input: {
  japanese: string;
  kana: string;
  kanji: string;
  reading: string;
}): JapaneseForms {
  const notes = collectJapaneseNotes(Object.values(input));
  const kana: string[] = [];
  const kanji: string[] = [];
  const romaji: string[] = [];

  if (input.kana || input.kanji) {
    kana.push(...expandJapaneseCell(input.kana));
    kanji.push(...expandJapaneseCell(input.kanji));
  } else if (input.japanese && input.reading) {
    kana.push(...expandJapaneseCell(input.reading));
    classifyJapaneseForms(expandJapaneseCell(input.japanese), kana, kanji, romaji);
  } else {
    classifyJapaneseForms(expandJapaneseCell(input.japanese), kana, kanji, romaji);
  }

  // The historical "Kana" column also contains counters, digits and acronyms.
  // It is the authoritative reading/display column even when a row is not pure kana.
  const normalizedKana = unique(kana.filter(Boolean));
  const normalizedKanji = unique(kanji.filter((form) => KANJI_PATTERN.test(form)));
  const explicitRomaji = unique(romaji.filter(Boolean));
  const generatedRomaji = normalizedKana
    .map(prepareKanaForRomaji)
    .filter(Boolean)
    .map((form) => toRomaji(form).trim())
    .filter((form) => form.length > 0 && !JAPANESE_CHARACTER_PATTERN.test(form));

  return {
    kana: normalizedKana,
    kanji: normalizedKanji,
    notes,
    romaji: unique([...explicitRomaji, ...generatedRomaji]),
  };
}

function classifyJapaneseForms(
  forms: string[],
  kana: string[],
  kanji: string[],
  romaji: string[],
): void {
  for (const form of forms) {
    const parenthetical = /^(.*?)（([^（）]+)）(.*)$/u.exec(form);

    if (parenthetical?.[2]) {
      const outside = `${parenthetical[1] ?? ''}${parenthetical[3] ?? ''}`.trim();
      classifyJapaneseForms(
        [...expandJapaneseCell(outside), ...expandJapaneseCell(parenthetical[2])],
        kana,
        kanji,
        romaji,
      );
      continue;
    }

    if (KANJI_PATTERN.test(form)) {
      kanji.push(form);
    } else if (KANA_PATTERN.test(form)) {
      kana.push(form);
    } else if (form.length > 0) {
      romaji.push(form);
    }
  }
}

function expandJapaneseCell(value: string): string[] {
  if (!value.trim()) return [];

  return unique(
    splitJapaneseAlternatives(value).flatMap((alternative) => expandOptionalBrackets(alternative)),
  );
}

function splitJapaneseAlternatives(value: string): string[] {
  const normalizedValue = value
    .normalize('NFC')
    .replaceAll('*', '')
    .replace(/\s+(?:I|II|III)$/u, '')
    .trim();
  const slashParts = splitOutsideGroups(normalizedValue, new Set(['/', '／']));

  return slashParts.flatMap((part) => {
    if (part.includes('～') || /\d\s*、\s*\d/u.test(part)) return [part];
    return splitOutsideGroups(part, new Set(['、']));
  });
}

function expandOptionalBrackets(value: string): string[] {
  const normalizedValue = value.replaceAll('[', '［').replaceAll(']', '］');
  const match = /^(.*?)［([^］]+)］(.*)$/u.exec(normalizedValue);

  if (!match?.[2]) return [normalizeJapaneseForm(normalizedValue)].filter(Boolean);

  const before = match[1] ?? '';
  const optional = match[2];
  const after = match[3] ?? '';
  const excluded = normalizeJapaneseForm(`${before}${after}`);

  if (optional.includes('～') || optional.includes('…')) return [excluded].filter(Boolean);

  const included = normalizeJapaneseForm(`${before}${optional}${after}`);
  return unique([excluded, included].filter(Boolean));
}

function normalizeJapaneseForm(value: string): string {
  return value.replaceAll('*', '').replace(/\s+/gu, ' ').trim();
}

function collectJapaneseNotes(values: string[]): string[] {
  const notes: string[] = [];

  for (const value of values) {
    for (const match of value.matchAll(/[［[]([^］\]]+)[］\]]/gu)) {
      if (match[1]) notes.push(match[1].trim());
    }

    const verbGroup = /\s+(I|II|III)(?:\s|$)/u.exec(value)?.[1];
    if (verbGroup) notes.push(`verb-group:${verbGroup}`);
  }

  return unique(notes.filter(Boolean));
}

function prepareKanaForRomaji(value: string): string {
  return value
    .replace(/[～－―…「」『』。、！？?!]/gu, '')
    .replace(/\s+/gu, ' ')
    .trim();
}

function splitMeaningAlternatives(value: string): string[] {
  const normalizedValue = value.trim();
  if (!normalizedValue) return [];

  const alternatives = splitOutsideGroups(normalizedValue, new Set([',', '/', ';']))
    .map((meaning) => meaning.trim())
    .filter(Boolean);

  // The complete cell remains the preferred display value. Delimited parts are
  // additional accepted answers when the historical table lists alternatives.
  return unique([normalizedValue, ...alternatives]);
}

function splitOutsideGroups(value: string, separators: ReadonlySet<string>): string[] {
  const parts: string[] = [];
  const closingCharacters = new Map([
    ['(', ')'],
    ['[', ']'],
    ['［', '］'],
    ['（', '）'],
  ]);
  const stack: string[] = [];
  let current = '';

  for (const character of value) {
    const closingCharacter = closingCharacters.get(character);
    if (closingCharacter) {
      stack.push(closingCharacter);
      current += character;
      continue;
    }

    if (stack.at(-1) === character) {
      stack.pop();
      current += character;
      continue;
    }

    if (stack.length === 0 && separators.has(character)) {
      parts.push(current.trim());
      current = '';
      continue;
    }

    current += character;
  }

  parts.push(current.trim());
  return parts.filter(Boolean);
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}
