import { access, readFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { loadEnvFile } from 'node:process';
import { fileURLToPath } from 'node:url';

import { createClient } from '@supabase/supabase-js';

import {
  buildVincentProgressImport,
  findProgressImportConflicts,
  type StoredProgressRow,
  type VincentProgressImportRow,
} from './legacyVincentProgress';

const REPOSITORY_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const LOCAL_ENV_PATH = join(REPOSITORY_ROOT, '.env.progress.local');
const LEGACY_PROGRESS_PATH = join(REPOSITORY_ROOT, 'progress-vincent.json');
const GENERATED_CORPUS_PATH = join(REPOSITORY_ROOT, 'src/generated/corpus.json');
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu;

async function main(): Promise<void> {
  const apply = readApplyFlag(process.argv.slice(2));
  const rows = buildVincentProgressImport(
    await readJson(LEGACY_PROGRESS_PATH),
    await readJson(GENERATED_CORPUS_PATH),
  );

  printImportSummary(rows);
  if (!apply) {
    console.log('Aperçu validé. Ajoutez --apply pour écrire dans le projet Supabase configuré.');
    return;
  }

  await loadLocalEnvironment();
  const supabaseUrl = readRequiredEnvironment('SUPABASE_URL');
  const serviceRoleKey = readRequiredEnvironment('SUPABASE_SERVICE_ROLE_KEY');
  const userId = readUserId();
  const client = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: userData, error: userError } = await client.auth.admin.getUserById(userId);
  if (userError || !userData.user) {
    throw new Error('VINCENT_USER_ID ne correspond pas à un utilisateur Supabase existant.', {
      cause: userError,
    });
  }

  const { data: storedData, error: readError } = await client
    .from('word_progress')
    .select(
      'user_id,word_id,direction,mastery_score,correct_total,incorrect_total,last_reviewed_at,last_result',
    )
    .eq('user_id', userId)
    .eq('direction', 'japanese_to_meaning');

  if (readError) {
    throw new Error('Lecture de la progression distante impossible.', { cause: readError });
  }

  const storedRows = parseStoredRows(storedData);
  const conflicts = findProgressImportConflicts(rows, storedRows);
  if (conflicts.length > 0) {
    throw new Error(
      `Import annulé : ${String(conflicts.length)} ligne(s) possèdent déjà une progression différente (${conflicts
        .slice(0, 5)
        .map((row) => row.word_id)
        .join(', ')}).`,
    );
  }

  const existingIds = new Set(storedRows.map((row) => row.word_id));
  const missingRows = rows.filter((row) => !existingIds.has(row.word_id));
  if (missingRows.length === 0) {
    console.log('La progression historique est déjà intégralement importée. Aucune écriture.');
    return;
  }

  const { error: writeError } = await client
    .from('word_progress')
    .insert(missingRows.map((row) => ({ ...row, user_id: userId })));

  if (writeError) {
    throw new Error('Écriture de la progression distante impossible.', { cause: writeError });
  }

  console.log(
    `Import terminé : ${String(missingRows.length)} ligne(s) de compréhension ajoutée(s) pour l’utilisateur ${userId}.`,
  );
}

function readApplyFlag(arguments_: readonly string[]): boolean {
  if (arguments_.length === 0) return false;
  if (arguments_.length === 1 && arguments_[0] === '--apply') return true;
  throw new Error(
    'Argument accepté : --apply. Sans argument, la commande effectue un aperçu local.',
  );
}

async function readJson(path: string): Promise<unknown> {
  return JSON.parse(await readFile(path, 'utf8')) as unknown;
}

async function loadLocalEnvironment(): Promise<void> {
  try {
    await access(LOCAL_ENV_PATH);
    loadEnvFile(LOCAL_ENV_PATH);
  } catch (error: unknown) {
    if (!isNodeError(error) || error.code !== 'ENOENT') throw error;
  }
}

function readRequiredEnvironment(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} doit être défini dans .env.progress.local ou dans l’environnement.`);
  }
  return value;
}

function readUserId(): string {
  const userId = readRequiredEnvironment('VINCENT_USER_ID');
  if (!UUID_PATTERN.test(userId)) {
    throw new Error('VINCENT_USER_ID doit être un UUID Supabase valide.');
  }
  return userId;
}

function parseStoredRows(value: unknown): StoredProgressRow[] {
  if (!Array.isArray(value)) {
    throw new Error('Supabase a renvoyé une progression distante invalide.');
  }

  return value.map((row) => {
    if (
      !isRecord(row) ||
      typeof row.user_id !== 'string' ||
      typeof row.word_id !== 'string' ||
      row.direction !== 'japanese_to_meaning' ||
      !isMasteryScore(row.mastery_score) ||
      !isNonNegativeInteger(row.correct_total) ||
      !isNonNegativeInteger(row.incorrect_total) ||
      (row.last_result !== null && !isReviewResult(row.last_result)) ||
      (row.last_reviewed_at !== null && typeof row.last_reviewed_at !== 'string')
    ) {
      throw new Error('Supabase a renvoyé une ligne de progression distante invalide.');
    }

    return {
      correct_total: row.correct_total,
      direction: row.direction,
      incorrect_total: row.incorrect_total,
      last_result: row.last_result,
      last_reviewed_at: row.last_reviewed_at,
      mastery_score: row.mastery_score,
      user_id: row.user_id,
      word_id: row.word_id,
    };
  });
}

function printImportSummary(rows: readonly VincentProgressImportRow[]): void {
  const redCount = rows.filter((row) => row.mastery_score === 0).length;
  const yellowCount = rows.filter((row) => row.mastery_score === 1).length;
  const greenCount = rows.filter((row) => row.mastery_score === 3).length;
  console.log(
    `Progression Vincent résolue : ${String(rows.length)} entrées de compréhension (${String(redCount)} rouges, ${String(yellowCount)} jaunes, ${String(greenCount)} vertes).`,
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && 'code' in error;
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

function isMasteryScore(value: unknown): value is 0 | 1 | 2 | 3 {
  return value === 0 || value === 1 || value === 2 || value === 3;
}

function isReviewResult(value: unknown): value is 'correct' | 'incorrect' | 'skipped' {
  return value === 'correct' || value === 'incorrect' || value === 'skipped';
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
